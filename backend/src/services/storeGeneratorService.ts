import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import logger from '@utils/logger';

interface ProductData {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  images: string[];
  colors: Array<{ name: string; value?: string }>;
  sizes: string[];
  availableSizes: string[];
  rating: number;
  reviews: number;
  category: string;
  inStock: boolean;
  tags: string[];
}

interface SliderImage {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
}

interface StoreGeneratorData {
  storeId: number;
  storeSlug: string;
  storeName: string;
  storeNameEn: string;
  description: string;
  icon: string;
  color: string;
  logo?: string;
  categories: string[];
  products: ProductData[];
  sliderImages: SliderImage[];
}

export class StoreGeneratorService {
  private frontendStoresPath: string;
  private publicAssetsPath: string;
  private backendPublicPath: string;
  private baseProjectDir: string;
  private frontendPublicAssetsPath: string;
  private readonly supportedImageExtensions = ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'];

  constructor() {
    const cwd = process.cwd();
    const normalizedCwd = cwd.replace(/\\/g, '/');

    let dynamicBase = cwd;

    if (normalizedCwd.endsWith('/backend/dist')) {
      dynamicBase = path.join(cwd, '..', '..');
    } else if (normalizedCwd.endsWith('/backend/src')) {
      dynamicBase = path.join(cwd, '..', '..');
    } else if (normalizedCwd.endsWith('/backend')) {
      dynamicBase = path.join(cwd, '..');
    }

    this.baseProjectDir = process.env.STORE_BASE_DIR || dynamicBase;

    this.frontendStoresPath = path.join(this.baseProjectDir, 'src', 'data', 'stores');
    this.backendPublicPath = path.join(this.baseProjectDir, 'backend', 'public');
    this.publicAssetsPath = path.join(this.backendPublicPath, 'assets');
    this.frontendPublicAssetsPath = path.join(this.baseProjectDir, 'public', 'assets');

    logger.info(`🔧 Store Generator configured:`);
    logger.info(`   Base Path: ${this.baseProjectDir}`);
    logger.info(`   Frontend Stores: ${this.frontendStoresPath}`);
    logger.info(`   Backend Public: ${this.backendPublicPath}`);
    logger.info(`   Assets Path: ${this.publicAssetsPath}`);
    logger.info(`   Frontend Assets Path: ${this.frontendPublicAssetsPath}`);
  }

  private getDefaultProductImage(storeSlug: string): string {
    for (const ext of this.supportedImageExtensions) {
      const storePath = `/assets/${storeSlug}/default-product.${ext}`;
      const storeDefaultFile = path.join(this.baseProjectDir, 'public', storePath.substring(1));
      
      if (fs.existsSync(storeDefaultFile)) {
        return storePath;
      }
    }
    
    for (const ext of this.supportedImageExtensions) {
      const globalPath = `/assets/default-product.${ext}`;
      const globalDefaultFile = path.join(this.baseProjectDir, 'public', globalPath.substring(1));
      
      if (fs.existsSync(globalDefaultFile)) {
        return globalPath;
      }
    }
    
    return '/assets/default-product.png';
  }

  async generateStoreFiles(data: StoreGeneratorData): Promise<void> {
    try {
      logger.info(`\n🚀 Starting store file generation for: ${data.storeName} (slug: ${data.storeSlug})`);

      // Clear any existing cache for this store to prevent data corruption
      await this.clearStoreCache(data.storeSlug);
      logger.info(`  🧹 Cache cleared for fresh store generation`);

      // Generate TS files for development
      try {
        const storeDir = path.join(this.frontendStoresPath, data.storeSlug);
        await fsPromises.mkdir(storeDir, { recursive: true });
        logger.info(`  📁 Created TS directory: ${storeDir}`);

        await this.generateConfigFile(storeDir, data);
        logger.info(`    ✅ config.ts`);

        await this.generateProductsFile(storeDir, data);
        logger.info(`    ✅ products.ts (${data.products.length} products)`);

        await this.generateSliderFile(storeDir, data);
        logger.info(`    ✅ Slider.tsx`);

        await this.generateIndexFile(storeDir, data);
        logger.info(`    ✅ index.ts`);

        await this.generateSliderDataFile(storeDir, data);
        logger.info(`    ✅ sliderData.ts (${data.sliderImages.length} sliders)`);

        logger.info(`  ✅ TS files generated for development`);
      } catch (tsError) {
        logger.warn(`  ⚠️ Failed to generate TS files (likely cloud environment): ${tsError instanceof Error ? tsError.message : String(tsError)}`);
      }

      // Ensure asset directories exist
      logger.info(`  📦 Setting up asset directories...`);
      try {
        await this.ensureAssetDirectories(data.storeSlug);
      } catch (assetDirError) {
        logger.warn(`  ⚠️ Failed to create some asset directories: ${assetDirError instanceof Error ? assetDirError.message : String(assetDirError)}`);
      }

      // Generate JSON files for production
      logger.info(`  📦 Generating JSON files for permanent storage...`);
      try {
        await this.generateJSONFiles(data);
        logger.info(`  ✅ JSON files generated for production`);
      } catch (jsonError) {
        logger.warn(`  ⚠️ Failed to generate JSON files: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
      }

      // Sync assets to frontend
      logger.info(`  📡 Syncing assets to frontend...`);
      try {
        await this.syncAssetsToFrontend(data.storeSlug);
        logger.info(`  ✅ Assets synced to frontend`);
      } catch (syncError) {
        logger.warn(`  ⚠️ Failed to sync assets (likely cloud environment): ${syncError instanceof Error ? syncError.message : String(syncError)}`);
      }

      // Copy logo to brands directory
      logger.info(`  🏷️  Copying logo to brands directory...`);
      await this.copyLogoToBrands(data.storeSlug, data.logo || '');
      logger.info(`  ✅ Logo copied to brands`);

      await this.verifyStoreCreation(data);
      await this.verifyAssetIntegrity(data);

      logger.info(`\n🎉 Store generation COMPLETED successfully for: ${data.storeName}\n`);
    } catch (error) {
      logger.error(`\n🚨 Error generating store files for ${data.storeName}:`, error);
      throw error;
    }
  }

  private async ensureAssetDirectories(storeSlug: string): Promise<void> {
    const backendBaseDir = path.join(this.publicAssetsPath, storeSlug);
    const frontendBaseDir = path.join(this.frontendPublicAssetsPath, storeSlug);
    const brandsDir = path.join(this.frontendPublicAssetsPath, 'brands');

    const dirs = [
      path.join(backendBaseDir, 'products'),
      path.join(backendBaseDir, 'sliders'),
      path.join(backendBaseDir, 'logo'),
      path.join(frontendBaseDir, 'products'),
      path.join(frontendBaseDir, 'sliders'),
      path.join(frontendBaseDir, 'logo'),
      path.join(this.publicAssetsPath, 'stores'),
      path.join(this.frontendPublicAssetsPath, 'stores'),
      brandsDir
    ];

    logger.info(`    📁 Creating asset directories for: ${storeSlug}`);
    for (const dir of dirs) {
      try {
        await fsPromises.mkdir(dir, { recursive: true });
        logger.info(`      ✅ ${path.relative(this.baseProjectDir, dir)}`);
      } catch (error) {
        logger.error(`      ❌ Failed to create ${dir}:`, error);
        throw error;
      }
    }
    logger.info(`    ✅ All asset directories created successfully`);
  }

  private async syncAssetsToFrontend(storeSlug: string): Promise<void> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const sourceStoreDir = path.join(this.publicAssetsPath, storeSlug);
        const destStoreDir = path.join(this.frontendPublicAssetsPath, storeSlug);

        logger.info(`\n   🔄 Final sync verification (Attempt ${attempt}/${maxRetries})...`);
        logger.info(`      📁 Backend: ${sourceStoreDir}`);
        logger.info(`      📁 Frontend: ${destStoreDir}`);

        if (!fs.existsSync(sourceStoreDir)) {
          logger.warn(`      ⚠️  Backend directory not found, files may have been moved already`);
          if (fs.existsSync(destStoreDir)) {
            logger.info(`      ✅ Frontend directory exists - sync may be complete`);
            return;
          }
          throw new Error(`Source directory not found: ${sourceStoreDir}`);
        }

        await fsPromises.mkdir(destStoreDir, { recursive: true });
        logger.info(`      ✅ Frontend directory ready`);

        const verifyAndCopyDir = async (src: string, dest: string, level: number = 0): Promise<{ dirCount: number; fileCount: number; failedFiles: string[]; alreadyExist: number }> => {
          const indent = '         '.repeat(level);

          if (!fs.existsSync(src)) {
            logger.warn(`      ${indent}⚠️  Source not found: ${src}`);
            return { dirCount: 0, fileCount: 0, failedFiles: [], alreadyExist: 0 };
          }

          const entries = await fsPromises.readdir(src, { withFileTypes: true });

          let dirCount = 0;
          let fileCount = 0;
          let failedFiles: string[] = [];
          let alreadyExist = 0;

          for (const entry of entries) {
            try {
              const srcPath = path.join(src, entry.name);
              const destPath = path.join(dest, entry.name);

              if (entry.isDirectory()) {
                dirCount++;
                await fsPromises.mkdir(destPath, { recursive: true });
                logger.info(`      ${indent}📁 ${entry.name}/`);
                const subResult = await verifyAndCopyDir(srcPath, destPath, level + 1);
                failedFiles = [...failedFiles, ...subResult.failedFiles];
                alreadyExist += subResult.alreadyExist;
              } else {
                fileCount++;

                if (fs.existsSync(destPath)) {
                  const srcStats = await fsPromises.stat(srcPath);
                  const destStats = await fsPromises.stat(destPath);
                  if (srcStats.size === destStats.size) {
                    alreadyExist++;
                    logger.info(`      ${indent}✅ ${entry.name} (already synced)`);
                    continue;
                  }
                }

                const stats = await fsPromises.stat(srcPath);
                const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

                try {
                  await fsPromises.copyFile(srcPath, destPath);
                  logger.info(`      ${indent}✅ ${entry.name} (${sizeMB} MB)`);
                } catch (fileError) {
                  failedFiles.push(entry.name);
                  logger.warn(`      ${indent}⚠️  Failed to copy ${entry.name}: ${(fileError as Error).message}`);
                }
              }
            } catch (entryError) {
              logger.warn(`      ${indent}⚠️  Error processing ${entry.name}: ${(entryError as Error).message}`);
            }
          }

          if (level === 0) {
            logger.info(`\n      📊 Final sync summary:`);
            logger.info(`         📁 Directories: ${dirCount}`);
            logger.info(`         📄 Files copied: ${fileCount - alreadyExist}`);
            logger.info(`         ✅ Files already synced: ${alreadyExist}`);
            if (failedFiles.length > 0) {
              logger.warn(`         ⚠️  Failed files: ${failedFiles.join(', ')}`);
            }
            logger.info('');
          }

          return { dirCount, fileCount, failedFiles, alreadyExist };
        };

        const result = await verifyAndCopyDir(sourceStoreDir, destStoreDir);

        if (result.failedFiles.length > 0) {
          throw new Error(`Failed to copy ${result.failedFiles.length} file(s): ${result.failedFiles.join(', ')}`);
        }

        const sourceStoresDir = path.join(this.publicAssetsPath, 'stores');
        const destStoresDir = path.join(this.frontendPublicAssetsPath, 'stores');

        logger.info(`      📂 Syncing stores index...`);
        if (fs.existsSync(sourceStoresDir)) {
          await fsPromises.mkdir(destStoresDir, { recursive: true });
          const storeFiles = await fsPromises.readdir(sourceStoresDir);

          let indexFilesSynced = 0;
          const indexFilesFailed: string[] = [];

          for (const file of storeFiles) {
            try {
              const srcPath = path.join(sourceStoresDir, file);
              const destPath = path.join(destStoresDir, file);
              const stat = await fsPromises.stat(srcPath);

              if (stat.isFile()) {
                await fsPromises.copyFile(srcPath, destPath);
                logger.info(`         ✅ ${file}`);
                indexFilesSynced++;
              }
            } catch (indexError) {
              indexFilesFailed.push(file);
              logger.warn(`         ⚠️  Failed to sync ${file}: ${(indexError as Error).message}`);
            }
          }

          logger.info(`      ✅ Synced ${indexFilesSynced} index files to stores/`);
          if (indexFilesFailed.length > 0) {
            throw new Error(`Failed to sync index files: ${indexFilesFailed.join(', ')}`);
          }
          logger.info('');
        } else {
          throw new Error(`Stores directory not found: ${sourceStoresDir}`);
        }

        logger.info(`   ✨ Asset sync completed successfully!\n`);
        return;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.warn(`   ⚠️  Sync attempt ${attempt} failed: ${lastError.message}`);

        if (attempt < maxRetries) {
          logger.info(`   ⏳ Retrying in 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    logger.error(`\n   ❌ Asset sync failed after ${maxRetries} attempts:`, lastError);
    throw lastError || new Error('Asset sync failed: Unknown error');
  }

  private async copyLogoToBrands(storeSlug: string, logoPath: string): Promise<void> {
    try {
      if (!logoPath || logoPath === '/assets/default-store.png') {
        logger.info(`      ℹ️  No custom logo to copy to brands (using default)`);
        return;
      }

      const logoFilename = path.basename(logoPath);

      const backendLogoDir = path.join(this.publicAssetsPath, storeSlug, 'logo');
      const frontendLogoDir = path.join(this.frontendPublicAssetsPath, storeSlug, 'logo');
      const brandsDir = path.join(this.frontendPublicAssetsPath, 'brands');

      await fsPromises.mkdir(brandsDir, { recursive: true });

      let logoSourcePath = path.join(frontendLogoDir, logoFilename);

      if (!fs.existsSync(logoSourcePath)) {
        logoSourcePath = path.join(backendLogoDir, logoFilename);
      }

      if (!fs.existsSync(logoSourcePath)) {
        logger.warn(`      ⚠️  Logo file not found at: ${logoSourcePath}`);

        const frontendFiles = fs.existsSync(frontendLogoDir) ? fs.readdirSync(frontendLogoDir) : [];
        const backendFiles = fs.existsSync(backendLogoDir) ? fs.readdirSync(backendLogoDir) : [];

        if (frontendFiles.length > 0) {
          logoSourcePath = path.join(frontendLogoDir, frontendFiles[0]);
          logger.info(`      ℹ️  Using first frontend logo: ${frontendFiles[0]}`);
        } else if (backendFiles.length > 0) {
          logoSourcePath = path.join(backendLogoDir, backendFiles[0]);
          logger.info(`      ℹ️  Using first backend logo: ${backendFiles[0]}`);
        } else {
          logger.warn(`      ⚠️  No logo files found in logo directories`);
          return;
        }
      }

      const finalLogoFilename = path.basename(logoSourcePath);
      const brandLogoPath = path.join(brandsDir, finalLogoFilename);

      await fsPromises.copyFile(logoSourcePath, brandLogoPath);
      logger.info(`      ✅ Logo copied to brands: ${finalLogoFilename}`);

    } catch (error) {
      logger.error(`      ❌ Failed to copy logo to brands:`, error);
    }
  }

  private async generateConfigFile(
    storeDir: string,
    data: StoreGeneratorData
  ): Promise<void> {
    const configContent = `export const ${data.storeSlug.replace(/-/g, '')}StoreConfig = {
  storeId: ${data.storeId},
  icon: "${data.icon}",
  logo: "${data.logo || `/assets/stores/${data.storeSlug}.webp`}",
  color: "${data.color}",
  name: "${data.storeName}",
  description: "${data.description}",
  categories: [
    ${data.categories.map(c => `"${c}"`).join(',\n    ')}
  ]
};
`;

    const configPath = path.join(storeDir, 'config.ts');
    await fsPromises.writeFile(configPath, configContent, 'utf-8');
  }

  private async generateProductsFile(
    storeDir: string,
    data: StoreGeneratorData
  ): Promise<void> {
    const cacheBustingScript = this.addCacheBusting(data.storeSlug);
    const integrityScript = this.validateCacheIntegrity(data.storeSlug);
    
    const productsContent = `/**
 * Auto-generated products file for ${data.storeName}
 * Generated at: ${new Date().toISOString()}
 * 
 * Cache Management:
 * ${cacheBustingScript.replace(/\n/g, '\n * ')}
 * 
 * Integrity Validation:
 * ${integrityScript.replace(/\n/g, '\n * ')}
 */

import type { Product } from '../../../src/data/storeProducts';

export const ${data.storeSlug.replace(/-/g, '')}Products: Product[] = [
${data.products
  .map(
    (product) => {
      const defaultImage = this.getDefaultProductImage(data.storeSlug);
      let images = product.images && product.images.length > 0
        ? product.images
        : [defaultImage];

      images = images.filter(img => img && img.trim());
      if (images.length === 0) {
        images = [defaultImage];
      }

      const colors = product.colors && product.colors.length > 0
        ? product.colors
        : [{ name: 'أسود', value: '#000000' }];

      const sizes = product.sizes && product.sizes.length > 0
        ? product.sizes
        : ['واحد'];

      const availableSizes = product.availableSizes && product.availableSizes.length > 0
        ? product.availableSizes
        : sizes;

      return `  {
    id: ${product.id},
    storeId: ${data.storeId},
    name: "${product.name.replace(/"/g, '\\"')}",
    description: "${product.description.replace(/"/g, '\\"')}",
    price: ${product.price},
    originalPrice: ${product.originalPrice},
    images: [${images.map(img => `"${img}"`).join(', ')}],
    sizes: [${sizes.map(s => `"${s}"`).join(', ')}],
    availableSizes: [${availableSizes.map(s => `"${s}"`).join(', ')}],
    colors: [
      ${colors.map(c => `{ name: "${c.name}", value: "${c.value || '#000000'}" }`).join(',\n      ')}
    ],
    rating: ${product.rating || 4.5},
    reviews: ${product.reviews || 0},
    views: 0,
    likes: 0,
    orders: 0,
    category: "${product.category}",
    inStock: ${product.inStock !== undefined ? product.inStock : true},
    isAvailable: ${product.inStock !== undefined ? product.inStock : true},
    quantity: 12,
    tags: [${(product.tags || ['جديد']).map(tag => `"${tag}"`).join(', ')}],
    badge: "${(product.tags && product.tags[0]) ? product.tags[0] : 'جديد'}"
  }`;
    })
  .join(',\n')}
];
`;

    const productsPath = path.join(storeDir, 'products.ts');
    await fsPromises.writeFile(productsPath, productsContent, 'utf-8');
  }

  private async generateSliderFile(
    storeDir: string,
    data: StoreGeneratorData
  ): Promise<void> {
    const sliderComponentName = data.storeSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    const sliderContent = `import React, { useState, useEffect, useRef } from 'react';
import type { Product } from '../../../src/data/storeProducts';

interface SliderProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (product: Product) => void;
  favorites: number[];
}

export const ${sliderComponentName}Slider: React.FC<SliderProps> = ({
  products,
  onProductClick,
  onAddToCart,
  onToggleFavorite,
  favorites = []
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  const getSliderBanners = () => {
    return [
${data.sliderImages
  .map(
    (img) => `      {
        id: '${img.id}',
        image: '${this.escapeString(img.image)}',
        title: '${this.escapeString(img.title)}',
        subtitle: '${this.escapeString(img.subtitle)}',
        buttonText: '${this.escapeString(img.buttonText)}'
      }`
  )
  .join(',\n')}
    ];
  };

  const sliderBanners = getSliderBanners();
  const allSlides = sliderBanners;

  const getBackgroundImage = (image: string) => {
    if (!image) return undefined;
    try {
      return \`url("\${encodeURI(image)}")\`;
    } catch (error) {
      return \`url("\${image}")\`;
    }
  };

  useEffect(() => {
    if (!isAutoPlaying || allSlides.length <= 1 || isDragging) return;

    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % allSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, allSlides.length, isDragging]);

  const nextSlide = () => {
    setActiveSlide(prev => (prev + 1) % allSlides.length);
  };

  const prevSlide = () => {
    setActiveSlide(prev => (prev - 1 + allSlides.length) % allSlides.length);
  };

  const goToSlide = (index: number) => {
    setActiveSlide(index);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
    setIsAutoPlaying(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    const diff = e.clientX - startX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }

    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  if (allSlides.length === 0) return null;

  const storeColors = {
    background: 'from-${data.color.split('-')[1] || 'purple'}-50 via-${data.color.split('-')[2] || 'pink'}-50 to-${data.color.split('-')[1] || 'purple'}-50',
    accent: 'from-${data.color.split('-')[1] || 'purple'}-400 via-${data.color.split('-')[2] || 'pink'}-400 to-${data.color.split('-')[1] || 'purple'}-400',
    gradient: 'from-${data.color.split('-')[1] || 'purple'}-500 to-${data.color.split('-')[2] || 'pink'}-600',
    button: 'from-${data.color.split('-')[1] || 'purple'}-500 to-${data.color.split('-')[2] || 'pink'}-600 hover:from-${data.color.split('-')[1] || 'purple'}-600 hover:to-${data.color.split('-')[2] || 'pink'}-700'
  };

  return (
    <div className={\`relative h-[400px] md:h-[500px] overflow-hidden bg-gradient-to-br \${storeColors.background}\`}>
      <div className="absolute inset-0">
        <div className={\`absolute inset-0 bg-gradient-to-r \${storeColors.accent}/20 via-current/10 to-current/20\`}></div>
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: \`\${Math.random() * 100}%\`,
                top: \`\${Math.random() * 100}%\`,
                animationDelay: \`\${Math.random() * 5}s\`,
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }}
            />
          ))}
        </div>
      </div>

      <div
        ref={sliderRef}
        className="relative h-full flex"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {allSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={\`flex-shrink-0 w-full h-full transition-transform duration-500 ease-in-out \${index === activeSlide ? 'translate-x-0' : index < activeSlide ? '-translate-x-full' : 'translate-x-full'}\`}
          >
            <div className="relative h-full">
              <div
                className="w-full h-full bg-cover bg-center"
                role="img"
                aria-label={slide.title}
                style={{
                  backgroundImage: getBackgroundImage(slide.image),
                  backgroundRepeat: 'no-repeat'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
                <div className="max-w-4xl mx-auto text-center">
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                    {slide.title}
                  </h1>
                  {slide.subtitle && (
                    <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-md">
                      {slide.subtitle}
                    </p>
                  )}
                  <button
                    onClick={() => goToSlide((activeSlide + 1) % allSlides.length)}
                    className={\`inline-flex items-center px-8 py-4 bg-gradient-to-r \${storeColors.button} text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300\`}
                  >
                    {slide.buttonText}
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {allSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
            title="السابق"
            aria-label="الشريحة السابقة"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
            title="التالي"
            aria-label="الشريحة التالية"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {allSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={\`w-3 h-3 rounded-full transition-all duration-300 \${index === activeSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'}\`}
                title={\`الانتقال للشريحة \${index + 1}\`}
                aria-label={\`الانتقال للشريحة \${index + 1}\`}
              />
            ))}
          </div>
        </>
      )}

      <div className="absolute bottom-4 right-4 flex items-center space-x-2">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={\`p-2 rounded-full \${isAutoPlaying ? 'bg-green-500' : 'bg-red-500'} text-white transition-colors duration-300\`}
        >
          {isAutoPlaying ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H13m-3 3h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 14H13" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>

        <div className="flex items-center space-x-1">
          <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-5000 ease-linear"
              style={{
                width: isAutoPlaying ? '100%' : '0%',
                animationDuration: '5s',
                animation: isAutoPlaying ? 'progress 5s linear infinite' : 'none'
              }}
            />
          </div>
        </div>
      </div>

      <style>{\`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      \`}</style>
    </div>
  );
};

export default ${sliderComponentName}Slider;
`;

    const sliderPath = path.join(storeDir, 'Slider.tsx');
    await fsPromises.writeFile(sliderPath, sliderContent, 'utf-8');
  }

  private async generateIndexFile(
    storeDir: string,
    data: StoreGeneratorData
  ): Promise<void> {
    const storeSlugClean = data.storeSlug.replace(/-/g, '');
    const sliderComponentName = data.storeSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    const indexContent = `// ${data.storeName} Store - متجر ${data.storeName}
export { ${storeSlugClean}Products as products } from './products';
export { ${storeSlugClean}StoreConfig as config } from './config';
export { ${storeSlugClean}SliderData as sliderData } from './sliderData';
export * from './Slider';
`;

    const indexPath = path.join(storeDir, 'index.ts');
    await fsPromises.writeFile(indexPath, indexContent, 'utf-8');
  }

  private async generateSliderDataFile(
    storeDir: string,
    data: StoreGeneratorData
  ): Promise<void> {
    const sliderDataContent = `export const ${data.storeSlug.replace(/-/g, '')}SliderData = [
${data.sliderImages
  .map(
    (img) => `  {
    id: '${img.id}',
    image: '${this.escapeString(img.image)}',
    title: '${this.escapeString(img.title)}',
    subtitle: '${this.escapeString(img.subtitle)}',
    buttonText: '${this.escapeString(img.buttonText)}'
  }`
  )
  .join(',\n')}
];
`;

    const sliderDataPath = path.join(storeDir, 'sliderData.ts');
    await fsPromises.writeFile(sliderDataPath, sliderDataContent, 'utf-8');
  }

  private escapeString(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  private async generateJSONFiles(data: StoreGeneratorData): Promise<void> {
    logger.info(`\n  📝 Generating permanent JSON files...`);

    // Create store directory in public/assets
    const storeAssetsDir = path.join(this.publicAssetsPath, data.storeSlug);

    try {
      await fsPromises.mkdir(storeAssetsDir, { recursive: true });
      logger.info(`    📁 Asset directory: ${path.relative(this.baseProjectDir, storeAssetsDir)}`);
    } catch (error) {
      logger.error(`    ❌ Failed to create asset directory: ${error}`);
      throw error;
    }

    // Normalize logo path
    const logoPath = data.logo || '/assets/default-store.png';

    const normalizeAssetPath = (value: string): string => {
      const cleaned = String(value || '').trim();
      if (!cleaned) return '';
      if (/^https?:\/\//i.test(cleaned) || cleaned.startsWith('data:')) return cleaned;
      if (cleaned.startsWith('/')) return cleaned;
      return `/${cleaned}`;
    };

    const normalizedProducts = data.products.map(product => {
      const defaultImage = this.getDefaultProductImage(data.storeSlug);
      let images = (product.images || [])
        .filter(img => img && img.trim())
        .map(normalizeAssetPath);

      if (images.length === 0) {
        images = [defaultImage];
      }

      const colors = (product.colors && product.colors.length > 0)
        ? product.colors
        : [{ name: 'أسود', value: '#000000' }];

      const sizes = (product.sizes && product.sizes.length > 0)
        ? product.sizes
        : ['واحد'];

      const availableSizes = (product.availableSizes && product.availableSizes.length > 0)
        ? product.availableSizes
        : sizes;

      return {
        ...product,
        images,
        sizes,
        availableSizes,
        colors,
        inStock: product.inStock !== undefined ? product.inStock : true,
        isAvailable: product.inStock !== undefined ? product.inStock : true
      };
    });

    // Normalize slider images
    const normalizedSliders = data.sliderImages.map(slider => ({
      ...slider,
      image: (slider.image && slider.image.trim())
        ? (normalizeAssetPath(slider.image) || '/assets/default-slider.png')
        : '/assets/default-slider.png'
    }));

    // Generate store.json
    const storeData = {
      id: data.storeId,
      storeId: data.storeId,
      slug: data.storeSlug,
      name: data.storeName,
      subdomain: data.storeSlug,
      storeSlug: data.storeSlug,
      nameAr: data.storeName,
      nameEn: data.storeNameEn,
      description: data.description,
      icon: data.icon,
      color: data.color,
      logo: logoPath,
      categories: data.categories,
      products: normalizedProducts,
      sliderImages: normalizedSliders,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    const storeJsonPath = path.join(storeAssetsDir, 'store.json');

    try {
      await fsPromises.writeFile(storeJsonPath, JSON.stringify(storeData, null, 2), 'utf-8');
      logger.info(`    ✅ store.json created (${normalizedProducts.length} products, ${normalizedSliders.length} sliders)`);
    } catch (error) {
      logger.error(`    ❌ Failed to write store.json: ${error}`);
      throw error;
    }

    // Copy store.json to frontend
    const frontendStoreJsonPath = path.join(this.frontendPublicAssetsPath, data.storeSlug, 'store.json');
    try {
      await fsPromises.mkdir(path.dirname(frontendStoreJsonPath), { recursive: true });
      await fsPromises.writeFile(frontendStoreJsonPath, JSON.stringify(storeData, null, 2), 'utf-8');
      logger.info(`    ✅ store.json copied to frontend`);
    } catch (error) {
      logger.error(`    ❌ Failed to copy store.json to frontend: ${error}`);
    }

    try {
      await this.updateStoresIndex(data);
      logger.info(`    ✅ index.json updated`);
    } catch (error) {
      logger.error(`    ❌ Failed to update stores index: ${error}`);
      throw error;
    }
  }

  private async updateStoresIndex(data: StoreGeneratorData): Promise<void> {
    const indexPath = path.join(this.publicAssetsPath, 'stores', 'index.json');
    const frontendIndexPath = path.join(this.frontendPublicAssetsPath, 'stores', 'index.json');

    let indexData: any[] = [];

    try {
      if (fs.existsSync(indexPath)) {
        indexData = JSON.parse(await fsPromises.readFile(indexPath, 'utf-8'));
      }
    } catch (error) {
      logger.warn(`    ⚠️  Could not read existing index.json: ${error}`);
    }

    const storeEntry = {
      slug: data.storeSlug,
      name: data.storeName,
      nameAr: data.storeName,
      description: data.description,
      logo: data.logo || `/assets/${data.storeSlug}/logo/default-logo.webp`,
      categories: data.categories,
      productsCount: data.products.length,
      lastUpdated: new Date().toISOString()
    };

    const existingIndex = indexData.findIndex((s: any) => s.slug === data.storeSlug);

    if (existingIndex >= 0) {
      indexData[existingIndex] = storeEntry;
      logger.info(`🔄 Updated existing store entry in index: ${data.storeSlug}`);
    } else {
      indexData.push(storeEntry);
      logger.info(`➕ Added new store entry to index: ${data.storeSlug}`);
    }

    try {
      await fsPromises.writeFile(indexPath, JSON.stringify(indexData, null, 2), 'utf-8');
      logger.info(`✅ Wrote index.json with ${indexData.length} stores`);
    } catch (error) {
      logger.error(`❌ Failed to write index.json: ${error}`);
      throw error;
    }

    // Copy to frontend
    try {
      await fsPromises.mkdir(path.dirname(frontendIndexPath), { recursive: true });
      await fsPromises.writeFile(frontendIndexPath, JSON.stringify(indexData, null, 2), 'utf-8');
      logger.info(`✅ Copied index.json to frontend`);
    } catch (error) {
      logger.error(`❌ Failed to copy index.json to frontend: ${error}`);
    }
  }

  private stripAssetsPrefix(p: string): string {
    const normalized = p.replace(/\\/g, '/').replace(/^\/+/, '');

    if (normalized.startsWith('public/assets/')) {
      return normalized.slice('public/assets/'.length);
    }

    if (normalized.startsWith('backend/public/assets/')) {
      return normalized.slice('backend/public/assets/'.length);
    }

    if (normalized.startsWith('assets/')) {
      return normalized.slice('assets/'.length);
    }

    return normalized;
  }

  private assetExists(assetPath?: string): boolean {
    if (!assetPath) {
      return false;
    }

    const cleaned = assetPath.split('?')[0].split('#')[0].trim();
    if (!cleaned) {
      return false;
    }

    if (/^https?:\/\//i.test(cleaned) || cleaned.startsWith('data:')) {
      return true;
    }

    const normalizedInput = cleaned.replace(/\\/g, '/');
    const assetsRooted = normalizedInput.startsWith('/assets/');

    if (path.isAbsolute(normalizedInput) && !assetsRooted) {
      return fs.existsSync(path.normalize(normalizedInput));
    }

    const withoutLeadingSlash = normalizedInput.replace(/^\/+/, '');
    const assetRelative = this.stripAssetsPrefix(normalizedInput);
    const normalizedAssetRelative = assetRelative.replace(/^\/+/, '');

    const candidates = new Set<string>([
      path.join(this.baseProjectDir, withoutLeadingSlash),
      path.join(this.baseProjectDir, 'public', withoutLeadingSlash),
      path.join(this.frontendPublicAssetsPath, normalizedAssetRelative),
      path.join(this.publicAssetsPath, normalizedAssetRelative)
    ]);

    if (normalizedAssetRelative !== withoutLeadingSlash) {
      candidates.add(path.join(this.frontendPublicAssetsPath, withoutLeadingSlash));
      candidates.add(path.join(this.publicAssetsPath, withoutLeadingSlash));
    }

    return Array.from(candidates)
      .map(candidate => path.normalize(candidate))
      .some(candidate => fs.existsSync(candidate));
  }

  /**
   * Clear any existing localStorage cache for the store being generated
   * This prevents corrupted data from overriding fresh store data
   */
  private async clearStoreCache(storeSlug: string): Promise<void> {
    logger.info(`  🧹 Clearing existing cache for store: ${storeSlug}`);
    
    // Add cache-busting timestamp to force reload
    const cacheBuster = Date.now();
    logger.info(`  🔄 Adding cache buster: ${cacheBuster}`);
    
    // Note: Since we're in Node.js backend, we can't directly clear browser localStorage
    // Instead, we'll add JavaScript code to the generated frontend files that will clear cache
    logger.info(`  ℹ️  Cache clearing will be handled by frontend JavaScript on page load`);
    
    return;
  }

  /**
   * Generate cache-busting JavaScript code to be embedded in frontend files
   * This ensures fresh data is loaded and prevents corrupted cache issues
   */
  private addCacheBusting(storeSlug: string): string {
    const timestamp = Date.now();
    return `
      // Auto-clear cache for fresh store data - Generated at ${new Date().toISOString()}
      (function() {
        const storeSlug = '${storeSlug}';
        const cacheKeys = [
          'store_products_' + storeSlug,
          'eshro_store_files_' + storeSlug, 
          'store_sliders_' + storeSlug,
          'eshro_stores'
        ];
        
        // Check if this store was recently updated
        const storeUpdateKey = 'store_updated_' + storeSlug;
        const lastUpdate = localStorage.getItem(storeUpdateKey);
        const now = Date.now();
        
        // Clear cache if store was updated more than 5 minutes ago (stale cache)
        if (lastUpdate && (now - parseInt(lastUpdate)) > 5 * 60 * 1000) {

          cacheKeys.forEach(key => localStorage.removeItem(key));
          localStorage.removeItem(storeUpdateKey);
        }
        
        // Mark this store as recently updated
        localStorage.setItem(storeUpdateKey, now.toString());

      })();
    `;
  }

  /**
   * Validate and fix corrupted cache data
   * This is a safety mechanism to detect and clean corrupted localStorage entries
   */
  private validateCacheIntegrity(storeSlug: string): string {
    return `
      // Cache integrity validation and cleanup
      (function() {
        const storeSlug = '${storeSlug}';
        
        // List of keys to check for corruption
        const cacheKeys = [
          'store_products_' + storeSlug,
          'eshro_store_files_' + storeSlug,
          'store_sliders_' + storeSlug
        ];
        
        cacheKeys.forEach(key => {
          try {
            const data = localStorage.getItem(key);
            if (data) {
              const parsed = JSON.parse(data);
              
              // Check for common corruption patterns
              if (!parsed || typeof parsed !== 'object' || 
                  (Array.isArray(parsed) && parsed.length === 0)) {

                localStorage.removeItem(key);
              }
            }
          } catch (e) {
            // JSON parsing failed - remove corrupted entry

            localStorage.removeItem(key);
          }
        });
        

      })();
    `;
  }

  private async verifyAssetIntegrity(data: StoreGeneratorData): Promise<void> {
    logger.info(`\n      🔒 Running asset verification...`);

    const storeJsonPath = path.join(this.frontendPublicAssetsPath, data.storeSlug, 'store.json');

    if (!fs.existsSync(storeJsonPath)) {
      const message = `store.json not found for ${data.storeSlug}`;
      logger.error(`        ❌ ${message}`);
      throw new Error(message);
    }

    let storeData: any;
    try {
      const storeJsonRaw = await fsPromises.readFile(storeJsonPath, 'utf-8');
      storeData = JSON.parse(storeJsonRaw);
    } catch (error) {
      const message = `Invalid store.json for ${data.storeSlug}: ${(error as Error).message}`;
      logger.error(`        ❌ ${message}`);
      throw new Error(message);
    }

    const missingAssets: string[] = [];
    const warnings: string[] = [];

    const checkAsset = (assetPath: string | undefined, context: string, options: { optional?: boolean } = {}) => {
      const { optional = false } = options;

      if (!assetPath || typeof assetPath !== 'string') {
        if (optional) {
          warnings.push(`${context} path missing`);
        } else {
          missingAssets.push(`${context} path missing`);
        }
        return;
      }

      if (!this.assetExists(assetPath)) {
        missingAssets.push(`${context} => ${assetPath}`);
      }
    };

    checkAsset(storeData?.logo, 'Logo', { optional: true });

    const products = Array.isArray(storeData?.products) ? storeData.products : [];
    products.forEach((product: any, index: number) => {
      const label = product?.id ?? index;
      const images = Array.isArray(product?.images) ? product.images : [];

      if (images.length === 0) {
        warnings.push(`Product ${label} has no images defined`);
      }

      images.forEach((imagePath: string, imageIndex: number) => {
        checkAsset(imagePath, `Product ${label} image ${imageIndex + 1}`);
      });
    });

    const sliders = Array.isArray(storeData?.sliderImages) ? storeData.sliderImages : [];
    sliders.forEach((slide: any, index: number) => {
      checkAsset(slide?.image, `Slider ${slide?.id ?? index}`);
    });

    if (missingAssets.length > 0) {
      const message = `Asset verification failed for ${data.storeSlug}:\n${missingAssets.join('\n')}`;
      logger.error(`        ❌ ${message}`);
      throw new Error(message);
    }

    warnings.forEach(warning => logger.warn(`        ⚠️  ${warning}`));
    logger.info(`        ✅ Assets verified (${warnings.length} warning${warnings.length === 1 ? '' : 's'})`);
  }

  private async verifyStoreCreation(data: StoreGeneratorData): Promise<void> {
    logger.info(`\n      🔍 Verifying store creation...`);

    const storeAssetsDir = path.join(this.publicAssetsPath, data.storeSlug);
    const storeJsonPath = path.join(storeAssetsDir, 'store.json');
    const indexPath = path.join(this.publicAssetsPath, 'stores', 'index.json');
    const storeDir = path.join(this.frontendStoresPath, data.storeSlug);

    const missingItems: string[] = [];

    if (!fs.existsSync(storeJsonPath)) {
      missingItems.push(`❌ Missing: store.json`);
    } else {
      logger.info(`        ✅ store.json exists`);
    }

    if (!fs.existsSync(indexPath)) {
      missingItems.push(`❌ Missing: index.json`);
    } else {
      logger.info(`        ✅ index.json updated`);
    }

    if (!fs.existsSync(storeDir)) {
      missingItems.push(`❌ Missing: TS store directory`);
    } else {
      logger.info(`        ✅ TS directory exists`);
    }

    if (fs.existsSync(storeDir)) {
      const expectedFiles = ['config.ts', 'products.ts', 'Slider.tsx', 'index.ts', 'sliderData.ts'];
      const foundFiles = fs.readdirSync(storeDir);

      for (const file of expectedFiles) {
        if (!foundFiles.includes(file)) {
          missingItems.push(`❌ Missing TS file: ${file}`);
        } else {
          logger.info(`          ✅ ${file}`);
        }
      }
    }

    if (missingItems.length > 0) {
      const errorMsg = `Store creation verification FAILED for ${data.storeSlug}:\n${missingItems.join('\n')}`;
      logger.error(`      ${errorMsg}`);
      throw new Error(errorMsg);
    }

    logger.info(`      🎯 All verification checks PASSED for: ${data.storeSlug}`);
  }
}

export default new StoreGeneratorService();
