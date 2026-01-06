import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import storeGeneratorService from '@services/storeGeneratorService';
import logger from '@utils/logger';
import { sendSuccess, sendError } from '@utils/response';
import Store from '@models/Store';
import StoreSlider from '@models/StoreSlider';
import User from '@models/User';
import { moveUploadedFiles, cleanupTempUploads } from '@middleware/storeImageUpload';
import { uploadMultipleImagesToSupabase, uploadImageToSupabase } from '@services/supabaseImageUpload';
import fs from 'fs';
import path from 'path';

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

interface StoreVerificationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  checks: {
    storeJsonExists: boolean;
    indexJsonExists: boolean;
    imagesFolderExists: boolean;
    tsFilesExist: boolean;
    fileCount?: number;
  };
}

async function createDefaultSliders(storeId: number, storeSlug: string): Promise<void> {
  const defaultSliders = [
    {
      title: 'أهلا وسهلا',
      subtitle: 'مرحباً بك في متجرنا',
      buttonText: 'تسوق الآن',
      imagePath: `/assets/${storeSlug}/sliders/default-banner-1.png`,
      sortOrder: 0
    },
    {
      title: 'عروض مميزة',
      subtitle: 'اكتشف أفضل المنتجات',
      buttonText: 'اكتشف العروض',
      imagePath: `/assets/${storeSlug}/sliders/default-banner-2.png`,
      sortOrder: 1
    },
    {
      title: 'تصاميم رائعة',
      subtitle: 'اختر من مجموعتنا الواسعة',
      buttonText: 'تسوق الآن',
      imagePath: `/assets/${storeSlug}/sliders/default-banner-3.png`,
      sortOrder: 2
    },
    {
      title: 'أفضل الأسعار',
      subtitle: 'جودة عالية بأسعار منخفضة',
      buttonText: 'اشتر الآن',
      imagePath: `/assets/${storeSlug}/sliders/default-banner-4.png`,
      sortOrder: 3
    }
  ];

  for (const slider of defaultSliders) {
    try {
      await StoreSlider.create({
        storeId,
        ...slider
      } as any);
      logger.info(`✅ Created default slider: ${slider.title} for store ${storeSlug}`);
    } catch (error) {
      logger.error(`❌ Failed to create default slider: ${slider.title}`, error);
      throw error;
    }
  }
}

async function updateStoreConfigFile(storeId: number, storeSlug: string, storeName: string, description: string, logoUrl: string, colors?: { primary: string; secondary: string; accent: string }): Promise<void> {
  try {
    const configPath = path.join(process.cwd(), 'src', 'config', 'storeConfig.ts');
    
    if (!fs.existsSync(configPath)) {
      logger.warn(`⚠️ storeConfig.ts not found at ${configPath}, skipping update`);
      return;
    }

    let fileContent = fs.readFileSync(configPath, 'utf-8');

    const defaultColors = colors || {
      primary: 'from-purple-400 to-pink-600',
      secondary: 'from-purple-300 to-pink-500',
      accent: 'from-purple-200 to-pink-200'
    };

    const newStoreConfig = `  ${storeSlug}: {
    slug: '${storeSlug}',
    storeId: ${storeId},
    name: '${storeName}',
    description: '${description}',
    logo: '${logoUrl}',
    icon: '🏪',
    sliderHeight: {
      mobile: 500,
      desktop: 600,
    },
    colors: {
      primary: '${defaultColors.primary}',
      secondary: '${defaultColors.secondary}',
      accent: '${defaultColors.accent}',
    },
    sliders: [
      {
        id: 'banner1',
        image: '/assets/${storeSlug}/sliders/default-banner-1.png',
        title: 'أهلا وسهلا',
        subtitle: 'مرحباً بك في متجرنا',
        buttonText: 'تسوق الآن',
      },
      {
        id: 'banner2',
        image: '/assets/${storeSlug}/sliders/default-banner-2.png',
        title: 'عروض مميزة',
        subtitle: 'اكتشف أفضل المنتجات',
        buttonText: 'اكتشف العروض',
      },
      {
        id: 'banner3',
        image: '/assets/${storeSlug}/sliders/default-banner-3.png',
        title: 'تصاميم رائعة',
        subtitle: 'اختر من مجموعتنا الواسعة',
        buttonText: 'تسوق الآن',
      },
      {
        id: 'banner4',
        image: '/assets/${storeSlug}/sliders/default-banner-4.png',
        title: 'أفضل الأسعار',
        subtitle: 'جودة عالية بأسعار منخفضة',
        buttonText: 'اشتر الآن',
      },
    ],
    products: [],
  },\n`;

    const searchText = 'export const STORES_CONFIG: Record<string, StoreConfig> = {';
    const foundIndex = fileContent.indexOf(searchText);
    
    if (foundIndex !== -1) {
      const insertPosition = foundIndex + searchText.length;
      fileContent = fileContent.slice(0, insertPosition) + '\n' + newStoreConfig + fileContent.slice(insertPosition);
      fs.writeFileSync(configPath, fileContent, 'utf-8');
      logger.info(`✅ Updated storeConfig.ts with new store: ${storeSlug}`);
    } else {
      logger.warn(`⚠️ Could not find STORES_CONFIG in storeConfig.ts, skipping update`);
    }
  } catch (error) {
    logger.error('❌ Failed to update storeConfig.ts:', error);
  }
}

async function verifyStorePermanentStorage(storeSlug: string): Promise<StoreVerificationResult> {
  const result: StoreVerificationResult = {
    success: true,
    errors: [],
    warnings: [],
    checks: {
      storeJsonExists: false,
      indexJsonExists: false,
      imagesFolderExists: false,
      tsFilesExist: false
    }
  };

  const publicAssetsPath = path.join(process.cwd(), 'public/assets');
  const storeAssetDir = path.join(publicAssetsPath, storeSlug);
  const storeJsonPath = path.join(storeAssetDir, 'store.json');
  const indexJsonPath = path.join(publicAssetsPath, 'stores', 'index.json');
  const frontendStoresPath = path.join(process.cwd(), 'src/data/stores', storeSlug);

  try {
    if (fs.existsSync(storeJsonPath)) {
      result.checks.storeJsonExists = true;
      logger.info(`✅ Verified: ${storeJsonPath}`);
    } else {
      result.errors.push(`Missing permanent store data: ${storeJsonPath}`);
      logger.error(`❌ Missing: ${storeJsonPath}`);
    }

    if (fs.existsSync(indexJsonPath)) {
      result.checks.indexJsonExists = true;
      try {
        const indexData = JSON.parse(fs.readFileSync(indexJsonPath, 'utf-8'));
        if (Array.isArray(indexData)) {
          const storeEntry = indexData.find((s: any) => s.slug === storeSlug);
          if (storeEntry) {
            logger.info(`✅ Store found in index.json: ${storeSlug}`);
          } else {
            result.warnings.push(`Store ${storeSlug} not found in index.json`);
          }
        }
      } catch (e) {
        result.errors.push(`Failed to read index.json: ${(e as Error).message}`);
      }
    } else {
      result.errors.push(`Missing index file: ${indexJsonPath}`);
      logger.error(`❌ Missing: ${indexJsonPath}`);
    }

    if (fs.existsSync(storeAssetDir)) {
      result.checks.imagesFolderExists = true;
      try {
        const files = fs.readdirSync(storeAssetDir);
        result.checks.fileCount = files.length;
        logger.info(`✅ Assets folder exists with ${files.length} files`);
      } catch (e) {
        result.warnings.push(`Failed to count files in assets folder: ${(e as Error).message}`);
      }
    } else {
      result.warnings.push(`Assets folder not created: ${storeAssetDir}`);
    }

    if (fs.existsSync(frontendStoresPath)) {
      result.checks.tsFilesExist = true;
      try {
        const expectedFiles = ['config.ts', 'products.ts', 'Slider.tsx', 'index.ts', 'sliderData.ts'];
        const actualFiles = fs.readdirSync(frontendStoresPath);
        const missing = expectedFiles.filter(f => !actualFiles.includes(f));
        
        if (missing.length === 0) {
          logger.info(`✅ All TS files exist for store: ${storeSlug}`);
        } else {
          result.warnings.push(`Missing TS files: ${missing.join(', ')}`);
        }
      } catch (e) {
        result.warnings.push(`Failed to verify TS files: ${(e as Error).message}`);
      }
    } else {
      result.warnings.push(`TS store directory not created: ${frontendStoresPath}`);
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Verification error: ${(error as Error).message}`);
    logger.error(`❌ Store verification failed:`, error);
  }

  result.success = result.errors.length === 0;
  
  if (result.success) {
    logger.info(`🎯 Store verification PASSED for: ${storeSlug}`);
  } else {
    logger.error(`🚨 Store verification FAILED for: ${storeSlug}`, result);
  }

  return result;
}

async function uploadStoreAssetsToSupabase(
  storeSlug: string,
  logoFile: Express.Multer.File | undefined,
  productFiles: Express.Multer.File[],
  sliderFiles: Express.Multer.File[]
): Promise<void> {
  try {
    const publicAssetsPath = path.join(process.cwd(), 'public/assets');
    const storeAssetDir = path.join(publicAssetsPath, storeSlug);

    logger.info(`☁️ Starting Supabase upload for store: ${storeSlug}`);

    const uploadResults = {
      logo: { success: 0, failed: 0 },
      products: { success: 0, failed: 0 },
      sliders: { success: 0, failed: 0 }
    };

    if (logoFile) {
      logger.info(`📤 Uploading logo to Supabase...`);
      const logoPath = path.join(storeAssetDir, 'logo', logoFile.filename);
      if (fs.existsSync(logoPath)) {
        const result = await uploadImageToSupabase(logoPath, storeSlug, 'logo');
        if (result.success) {
          uploadResults.logo.success++;
          logger.info(`✅ Logo uploaded: ${result.url}`);
        } else {
          uploadResults.logo.failed++;
          logger.warn(`⚠️ Logo upload failed: ${result.error}`);
        }
      }
    }

    if (productFiles.length > 0) {
      logger.info(`📤 Uploading ${productFiles.length} product images to Supabase...`);
      const productImagePaths = productFiles.map(file => {
        const productPath = path.join(storeAssetDir, 'products', file.filename);
        return { path: productPath, filename: file.filename };
      }).filter(p => fs.existsSync(p.path));

      if (productImagePaths.length > 0) {
        const results = await uploadMultipleImagesToSupabase(productImagePaths, storeSlug, 'products');
        results.forEach(result => {
          if (result.success) {
            uploadResults.products.success++;
            logger.info(`✅ Product image uploaded: ${result.filename}`);
          } else {
            uploadResults.products.failed++;
            logger.warn(`⚠️ Product image upload failed: ${result.filename} - ${result.error}`);
          }
        });
      }
    }

    if (sliderFiles.length > 0) {
      logger.info(`📤 Uploading ${sliderFiles.length} slider images to Supabase...`);
      const sliderImagePaths = sliderFiles.map(file => {
        const sliderPath = path.join(storeAssetDir, 'sliders', file.filename);
        return { path: sliderPath, filename: file.filename };
      }).filter(p => fs.existsSync(p.path));

      if (sliderImagePaths.length > 0) {
        const results = await uploadMultipleImagesToSupabase(sliderImagePaths, storeSlug, 'sliders');
        results.forEach(result => {
          if (result.success) {
            uploadResults.sliders.success++;
            logger.info(`✅ Slider image uploaded: ${result.filename}`);
          } else {
            uploadResults.sliders.failed++;
            logger.warn(`⚠️ Slider image upload failed: ${result.filename} - ${result.error}`);
          }
        });
      }
    }

    const totalSuccess = uploadResults.logo.success + uploadResults.products.success + uploadResults.sliders.success;
    const totalFailed = uploadResults.logo.failed + uploadResults.products.failed + uploadResults.sliders.failed;

    logger.info(`🎯 Supabase upload summary for ${storeSlug}:`);
    logger.info(`   Logo: ${uploadResults.logo.success} success, ${uploadResults.logo.failed} failed`);
    logger.info(`   Products: ${uploadResults.products.success} success, ${uploadResults.products.failed} failed`);
    logger.info(`   Sliders: ${uploadResults.sliders.success} success, ${uploadResults.sliders.failed} failed`);
    logger.info(`   Total: ${totalSuccess} success, ${totalFailed} failed`);

    if (totalSuccess > 0) {
      logger.info(`✅ Store assets synced to Supabase Storage (${totalSuccess} files)`);
    }
    if (totalFailed > 0) {
      logger.warn(`⚠️ Some assets failed to upload to Supabase (${totalFailed} files), but store creation continues`);
    }
  } catch (error) {
    logger.warn(`⚠️ Non-critical: Supabase upload failed for ${storeSlug}:`, error);
  }
}

export const createStoreWithFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      storeId,
      storeSlug,
      storeName,
      storeNameEn,
      description,
      icon,
      color,
      categories,
      products,
      sliderImages,
      logoUrl
    } = req.body;

    if (!storeSlug || !storeName || !storeId) {
      sendError(res, 'Missing required fields', 400);
      return;
    }

    await storeGeneratorService.generateStoreFiles({
      storeId: Number(storeId),
      storeSlug,
      storeName,
      storeNameEn: storeNameEn || storeName,
      description,
      icon: icon || '✨',
      color: color || 'from-purple-400 to-pink-600',
      categories: Array.isArray(categories) ? categories : (categories ? JSON.parse(categories) : []),
      products: Array.isArray(products) ? products : (products ? JSON.parse(products) : []),
      sliderImages: Array.isArray(sliderImages) ? sliderImages : (sliderImages ? JSON.parse(sliderImages) : [])
    });

    logger.info(`✅ Store files created successfully for: ${storeName}`);

    sendSuccess(res, {
      message: 'Store files created successfully',
      store: {
        storeSlug,
        storeName
      }
    }, 201, 'Store files created successfully');
  } catch (error) {
    logger.error('Error creating store with files:', error);
    next(error);
  }
};

export const createStoreWithImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let files = req.files as Record<string, Express.Multer.File[]>;
    
    const {
      storeId,
      storeSlug,
      storeName,
      storeNameEn,
      description,
      icon,
      color,
      categories,
      products: productsJson,
      sliderImages: sliderImagesJson,
      productsImageCounts: productsImageCountsJson,
      ownerEmail,
      ownerSecondEmail
    } = req.body as any;

    if (!storeSlug || !storeName || !storeId) {
      sendError(res, 'Missing required fields', 400);
      return;
    }

    if (files && Object.keys(files).length > 0) {
      logger.info(`📁 Moving ${Object.keys(files).length} file fields from temp directory...`);
      try {
        files = await moveUploadedFiles(storeSlug, files);
        logger.info(`✅ Files moved successfully to /assets/${storeSlug}/`);
      } catch (moveError) {
        logger.error('❌ Failed to move uploaded files:', moveError);
        sendError(res, 'Failed to process uploaded files', 500);
        return;
      }
    }
    
    const productFiles: Express.Multer.File[] = [];
    const sliderFiles: Express.Multer.File[] = [];
    let logoFile: Express.Multer.File | undefined;

    if (files) {
      Object.keys(files).forEach(fieldName => {
        if (fieldName.startsWith('productImage_')) {
          productFiles.push(...(files[fieldName] || []));
        } else if (fieldName.startsWith('sliderImage_')) {
          sliderFiles.push(...(files[fieldName] || []));
        } else if (fieldName === 'storeLogo') {
          logoFile = files[fieldName]?.[0];
        }
      });
    }

    const existingStore = await Store.findOne({
      where: {
        [Op.or]: [
          { slug: storeSlug },
          { name: storeName }
        ]
      }
    });
    
    if (existingStore) {
      sendError(
        res,
        `Store with name "${storeName}" or slug "${storeSlug}" already exists in the system`,
        409
      );
      return;
    }

    if (ownerEmail) {
      const existingUser = await User.findOne({ where: { email: ownerEmail } });
      if (existingUser) {
        sendError(
          res,
          `Email "${ownerEmail}" is already registered in the system`,
          409
        );
        return;
      }
    }

    if (ownerSecondEmail) {
      const existingUser = await User.findOne({ where: { email: ownerSecondEmail } });
      if (existingUser) {
        sendError(
          res,
          `Email "${ownerSecondEmail}" is already registered in the system`,
          409
        );
        return;
      }
    }

    let parsedProducts: ProductData[] = [];
    let parsedSliders: SliderImage[] = [];
    let productsImageCounts: number[] = [];

    try {
      parsedProducts = JSON.parse(productsJson || '[]');
      parsedSliders = JSON.parse(sliderImagesJson || '[]');
      productsImageCounts = JSON.parse(productsImageCountsJson || '[]');
    } catch (parseError) {
      logger.error('Error parsing JSON:', parseError);
      sendError(res, 'Invalid JSON format for products or sliders', 400);
      return;
    }

    const mapImagesToProducts = (products: ProductData[], files: Express.Multer.File[]): ProductData[] => {
      const fileMap = new Map<string, Express.Multer.File[]>();

      files.forEach(file => {
        const originalName = file.originalname.toLowerCase().replace(/\.[^/.]+$/, '');
        const cleanName = originalName.replace(/^\d+-[\w]+-/, '');

        let baseName = cleanName;
        if (/\d+$/.test(cleanName)) {
          baseName = cleanName.replace(/\d+$/, '');
        }

        if (!fileMap.has(baseName)) {
          fileMap.set(baseName, []);
        }
        fileMap.get(baseName)!.push(file);
      });

      return products.map(product => {
        const productName = product.name.toLowerCase()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, '')
          .trim();

        const possibleKeys = [
          productName,
          productName.replace(/مزيل|شامل|ملمع|زجاج|غسيل|منظف/g, ''),
          productName.substring(0, 4),
          productName.substring(0, 3),
        ];

        let matchedFiles: Express.Multer.File[] = [];

        for (const key of possibleKeys) {
          if (fileMap.has(key)) {
            matchedFiles = fileMap.get(key)!;
            fileMap.delete(key);
            break;
          }
        }

        if (matchedFiles.length === 0) {
          for (const [key, files] of fileMap.entries()) {
            if (productName.includes(key) || key.includes(productName.substring(0, 3))) {
              matchedFiles = files;
              fileMap.delete(key);
              break;
            }
          }
        }

        const images = matchedFiles
          .sort((a, b) => {
            const aName = a.originalname.toLowerCase();
            const bName = b.originalname.toLowerCase();
            return aName.localeCompare(bName);
          })
          .map(f => `/assets/${storeSlug}/products/${f.filename}`);

        return {
          ...product,
          images: images.length > 0 ? images : (product.images || [])
        };
      });
    };

    parsedProducts = mapImagesToProducts(parsedProducts, productFiles);

    const slidersWithImages: SliderImage[] = parsedSliders.map((slider, i) => {
      const file = sliderFiles[i];
      return {
        ...slider,
        image: file ? `/assets/${storeSlug}/sliders/${file.filename}` : (slider.image || '')
      };
    });

    const logoUrl = logoFile ? `/assets/${storeSlug}/logo/${logoFile.filename}` : '/assets/default-store.png';

    logger.info(`☁️ Uploading store assets to Supabase...`);
    try {
      await uploadStoreAssetsToSupabase(storeSlug, logoFile, productFiles, sliderFiles);
      logger.info(`✅ Supabase upload completed for: ${storeSlug}`);
    } catch (supabaseError) {
      logger.warn(`⚠️ Non-critical: Supabase upload had issues, continuing with store creation:`, supabaseError);
    }

    logger.info(`📝 Generating store files for: ${storeName}`);
    
    await storeGeneratorService.generateStoreFiles({
      storeId: Number(storeId),
      storeSlug,
      storeName,
      storeNameEn: storeNameEn || storeName,
      description,
      logo: logoUrl,
      icon: icon || '✨',
      color: color || 'from-purple-400 to-pink-600',
      categories: Array.isArray(categories) ? categories : (categories ? JSON.parse(categories) : []),
      products: parsedProducts,
      sliderImages: slidersWithImages
    });

    logger.info(`✅ Store files generated successfully for: ${storeName}`);

    logger.info(`🔍 Verifying permanent storage for: ${storeSlug}`);
    const verificationResult = await verifyStorePermanentStorage(storeSlug);
    
    if (!verificationResult.success) {
      logger.error(`🚨 Store verification failed for ${storeSlug}:`, verificationResult);
      sendError(
        res,
        `Store creation verification failed. Errors: ${verificationResult.errors.join('; ')}`,
        500
      );
      return;
    }

    logger.info(`✅ Store verification PASSED for: ${storeSlug}`);
    
    logger.info(`💾 Saving store to database...`);
    try {
      const createdStore = await Store.create({
        name: storeName,
        slug: storeSlug,
        category: (Array.isArray(categories) ? categories[0] : categories) || 'general',
        description: description || '',
        logo: logoUrl,
        isActive: true,
        merchantId: ownerEmail
      } as any);
      logger.info(`✅ Store saved to database with ID: ${createdStore.id}`);
    } catch (dbError) {
      logger.error(`❌ Failed to save store to database:`, dbError);
      sendError(res, 'Failed to save store to database', 500);
      return;
    }

    logger.info(`📌 Creating default sliders for: ${storeSlug}`);
    try {
      await createDefaultSliders(Number(storeId), storeSlug);
      logger.info(`✅ Default sliders created successfully`);
    } catch (sliderError) {
      logger.error(`❌ Failed to create default sliders:`, sliderError);
    }

    logger.info(`📝 Updating storeConfig.ts...`);
    try {
      const configColors = {
        primary: color || 'from-purple-400 to-pink-600',
        secondary: 'from-purple-300 to-pink-500',
        accent: 'from-purple-200 to-pink-200'
      };
      await updateStoreConfigFile(Number(storeId), storeSlug, storeName, description, logoUrl, configColors);
      logger.info(`✅ storeConfig.ts updated successfully`);
    } catch (configError) {
      logger.error(`❌ Failed to update storeConfig.ts:`, configError);
    }
    
    logger.info(`🧹 Cleaning up temporary upload files...`);
    try {
      await cleanupTempUploads();
      logger.info(`✅ Temporary files cleaned up successfully`);
    } catch (cleanupError) {
      logger.warn(`⚠️ Non-critical: Failed to cleanup temp files:`, cleanupError);
    }

    logger.info(`🎉 Store creation completed successfully for: ${storeName}`);

    sendSuccess(res, {
      message: 'Store created successfully with permanent storage verification',
      store: {
        storeSlug,
        storeName,
        productsCount: parsedProducts.length,
        slidersCount: slidersWithImages.length
      },
      verification: {
        success: verificationResult.success,
        checks: verificationResult.checks,
        warnings: verificationResult.warnings
      }
    }, 201, 'Store created successfully with permanent storage verification');
  } catch (error) {
    logger.error('Error creating store with images:', error);
    next(error);
  }
};

export const validateStoreData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { storeSlug, products } = req.body;

    const validation = {
      isValid: true,
      errors: [] as string[]
    };

    if (!storeSlug || storeSlug.trim() === '') {
      validation.isValid = false;
      validation.errors.push('Store slug is required');
    }

    if (!Array.isArray(products) || products.length === 0) {
      validation.isValid = false;
      validation.errors.push('At least one product is required');
    }

    if (!validation.isValid) {
      sendError(res, validation.errors.join(', '), 400);
      return;
    }

    sendSuccess(res, {
      message: 'Store data is valid',
      validation
    }, 200, 'Store data is valid');
  } catch (error) {
    logger.error('Error validating store data:', error);
    next(error);
  }
};

export const checkStoreExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { storeName, storeSlug, email1, email2 } = req.body;

    const existingData = {
      store: null as any,
      emails: [] as any[]
    };

    if (storeName || storeSlug) {
      existingData.store = await Store.findOne({
        where: {
          [Op.or]: [
            storeName ? { name: storeName } : {},
            storeSlug ? { slug: storeSlug } : {}
          ].filter(obj => Object.keys(obj).length > 0)
        }
      });
    }

    if (email1) {
      const user = await User.findOne({ where: { email: email1 } });
      if (user) {
        existingData.emails.push({ email: email1, exists: true, userId: user.id });
      }
    }

    if (email2) {
      const user = await User.findOne({ where: { email: email2 } });
      if (user) {
        existingData.emails.push({ email: email2, exists: true, userId: user.id });
      }
    }

    sendSuccess(res, {
      message: 'Store existence check completed',
      data: existingData,
      exists: existingData.store !== null || existingData.emails.length > 0
    }, 200, 'Store existence check completed');
  } catch (error) {
    logger.error('Error checking store existence:', error);
    next(error);
  }
};

export const cleanupStoreAndUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { storeName, storeSlug, email1, email2, deleteStore = false, deleteUsers = false } = req.body;

    const deleted = {
      store: false,
      users: [] as string[]
    };

    if (deleteStore && (storeName || storeSlug)) {
      const store = await Store.findOne({
        where: [{ name: storeName }, { slug: storeSlug }]
      } as any);
      
      if (store) {
        await store.destroy();
        deleted.store = true;
        logger.info(`🗑️ Deleted store: ${storeName || storeSlug}`);
      }
    }

    if (deleteUsers) {
      if (email1) {
        const user = await User.findOne({ where: { email: email1 } });
        if (user) {
          await user.destroy();
          deleted.users.push(email1);
          logger.info(`🗑️ Deleted user: ${email1}`);
        }
      }

      if (email2) {
        const user = await User.findOne({ where: { email: email2 } });
        if (user) {
          await user.destroy();
          deleted.users.push(email2);
          logger.info(`🗑️ Deleted user: ${email2}`);
        }
      }
    }

    sendSuccess(res, {
      message: 'Cleanup completed',
      deleted
    }, 200, 'Cleanup completed');
  } catch (error) {
    logger.error('Error during cleanup:', error);
    next(error);
  }
};

import UnavailableNotification from '@models/UnavailableNotification';

export const createUnavailableNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      storeId,
      storeSlug,
      productId,
      productName,
      customerName,
      phone,
      email,
      quantity,
      notificationTypes
    } = req.body;

    if (!productId || !productName || !customerName || !phone || !email) {
      sendError(res, 'Missing required fields', 400);
      return;
    }

    const record = await UnavailableNotification.create({
      storeId: storeId ? Number(storeId) : undefined,
      storeSlug: storeSlug || undefined,
      productId: Number(productId),
      productName: String(productName),
      customerName: String(customerName),
      phone: String(phone),
      email: String(email),
      quantity: quantity ? Number(quantity) : 1,
      notificationTypes: Array.isArray(notificationTypes)
        ? JSON.stringify(notificationTypes)
        : typeof notificationTypes === 'string'
        ? notificationTypes
        : '[]',
      status: 'pending'
    } as any);

    sendSuccess(res, { id: record.id }, 201, 'Notification created');
  } catch (error) {
    logger.error('Error creating unavailable notification:', error);
    next(error);
  }
};

export const listUnavailableByStore = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params as any;
    const where: any = {};
    if (slug) where.storeSlug = slug;
    const items = await UnavailableNotification.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    sendSuccess(res, { items }, 200, 'Notifications fetched');
  } catch (error) {
    logger.error('Error listing unavailable notifications:', error);
    next(error);
  }
};
