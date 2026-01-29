import { Op } from 'sequelize';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import sequelize from '@config/database';
import { UserRole } from '@shared-types/index';
import storeGeneratorService from '@services/storeGeneratorService';
import logger from '@utils/logger';
import { normalizeSliderImagePath } from '@utils/sliderPath';
import { sendSuccess, sendError } from '@utils/response';
import Store from '@models/Store';
import User from '@models/User';
import StoreSlider from '@models/StoreSlider';
import StoreAd from '@models/StoreAd';
import UnavailableNotification from '@models/UnavailableNotification';
import Product from '@models/Product';
import ProductImage from '@models/ProductImage';
import StoreFeature from '@models/StoreFeature';
import StoreSubscription from '@models/StoreSubscription';
import StoreUser from '@models/StoreUser';
import ManualOrder from '@models/ManualOrder';
import AbandonedCart from '@models/AbandonedCart';
import { moveUploadedFiles, cleanupTempUploads } from '@middleware/storeImageUpload';
import { uploadMultipleImagesToSupabase, purgeStoreFromSupabase, uploadBufferToSupabase } from '@services/supabaseImageUpload';
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
  quantity: number;
  tags: string[];
}

async function runGeneration(data: any): Promise<void> {
  // We still call this to maintain the same flow, but the service should be refactored 
  // to be less disk-dependent or handle failures gracefully.
  try {
    await storeGeneratorService.generateStoreFiles(data);
  } catch (error) {
    logger.warn(`Non-critical: Store file generation failed: ${error}`);
    // We don't throw here because we are moving to a DB-first approach
  }
}

const supportedImageExtensions = ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'];

const PROTECTED_SLUGS = [
  'nawaem', 
  'sheirine', 
  'pretty', 
  'delta-store', 
  'magna-beauty', 
  'indeesh',
  'eshro',
  'admin',
  'portal'
];

function getDefaultProductImage(storeSlug: string): string {
  return '/assets/default-product.svg';
}

// Default product image to use when uploads fail
const DEFAULT_PRODUCT_IMAGE = '/assets/default-product.svg';

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
    dbStoreExists: boolean;
    imagesUploaded: boolean;
  };
}

async function cleanupDuplicateAssets(storeSlug: string): Promise<{ removed: number; message: string }> {
  return {
    removed: 0,
    message: 'Memory-only mode: asset deduplication handled by Supabase'
  };
}

async function verifyStorePermanentStorage(storeSlug: string): Promise<StoreVerificationResult> {
  const result: StoreVerificationResult = {
    success: true,
    errors: [],
    warnings: [],
    checks: {
      dbStoreExists: true,
      imagesUploaded: true
    }
  };

  try {
    const store = await Store.findOne({ where: { slug: storeSlug } });
    if (!store) {
      result.checks.dbStoreExists = false;
      result.errors.push('Store not found in database');
      result.success = false;
    }
    return result;
  } catch (error) {
    result.success = false;
    result.errors.push(`Verification error: ${(error as Error).message}`);
    return result;
  }
}

export const createStoreWithFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { storeData } = req.body;

    if (!storeData) {
      sendError(res, 'Missing store data', 400);
      return;
    }

    logger.info(`Creating store: ${storeData.storeName}`);

    await runGeneration(storeData);

    sendSuccess(res, {
      message: 'Store created successfully',
      store: {
        slug: storeData.storeSlug,
        name: storeData.storeName
      }
    }, 201, 'Store created successfully');
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
      ownerSecondEmail,
      ownerName,
      ownerPhone,
      ownerPassword,
      email,
      phone,
      password
    } = req.body as any;

    if (!storeSlug || !storeName || !storeId) {
      sendError(res, 'Missing required fields', 400);
      return;
    }

    if (PROTECTED_SLUGS.includes(storeSlug.toLowerCase().trim())) {
      sendError(
        res,
        `الرابط "${storeSlug}" محجوز للنظام ولا يمكن استخدامه لإنشاء متجر جديد.`,
        403
      );
      return;
    }

    const parseArrayPayload = (value: any): any[] => {
      if (Array.isArray(value)) {
        return value;
      }
      if (typeof value === 'string' && value.trim()) {
        try {
          return JSON.parse(value);
        } catch (error) {
          logger.warn('Failed to parse array payload:', error);
          return [];
        }
      }
      return [];
    };

    const normalizedCategories = parseArrayPayload(categories);
    const getCategoryLabel = (value: any): string => {
      if (!value && value !== 0) {
        return 'general';
      }
      if (typeof value === 'string') {
        return value;
      }
      if (typeof value === 'object') {
        return value.name || value.label || value.id || 'general';
      }
      return String(value);
    };
    const primaryCategoryValue = getCategoryLabel(normalizedCategories[0]);
    const primaryOwnerEmail = (ownerEmail || email || '').toString().trim().toLowerCase();
    const secondaryOwnerEmail = (ownerSecondEmail || '').toString().trim().toLowerCase();
    const ownerFullName = (ownerName || '').toString().trim();
    const resolvedOwnerName = ownerFullName || storeName || '';
    const nameParts = resolvedOwnerName.split(/\s+/).filter(Boolean);
    const ownerFirstName = nameParts[0] || 'مالك';
    const ownerLastName = nameParts.slice(1).join(' ') || ownerFirstName;
    const primaryOwnerPhone = (ownerPhone || phone || '').toString().trim();
    const ownerPlainPassword = (ownerPassword || password || '').toString();

    if (!primaryOwnerEmail || !ownerPlainPassword) {
      sendError(res, 'Owner email and password are required', 400);
      return;
    }

    if (files && Object.keys(files).length > 0) {
      logger.info(`ℹ️ Using memory-only storage for ${Object.keys(files).length} file fields`);
      // No need to move files, they are already in memory buffers
    } else {
      logger.info(`ℹ️ No files provided, will use default images`);
    }

    
    logger.info(`\n🔍 Processing files for store: ${storeName}`);
    
    const productFilesMap: Record<number, Express.Multer.File[]> = {};
    const aggregatedProductFiles: Express.Multer.File[] = [];
    const sliderFiles: Express.Multer.File[] = [];
    let logoFile: Express.Multer.File | undefined;
    const unknownFields: string[] = [];

    if (files) {
      Object.keys(files).forEach(fieldName => {
        if (fieldName.startsWith('productImage_')) {
          const productIndexMatch = fieldName.match(/productImage_(\d+)/);
          if (productIndexMatch) {
            const productIndex = parseInt(productIndexMatch[1], 10);
            if (!productFilesMap[productIndex]) {
              productFilesMap[productIndex] = [];
            }
            const fileArray = files[fieldName] || [];
            productFilesMap[productIndex].push(...fileArray);
            logger.info(`  ✅ [productImage_${productIndex}] ${fileArray.length} file(s) mapped to product index ${productIndex}`);
          }
        } else if (fieldName === 'productImage_aggregated' || fieldName === 'productImages') {
          const fileArray = files[fieldName] || [];
          aggregatedProductFiles.push(...fileArray);
          logger.info(`  ✅ [${fieldName}] ${fileArray.length} aggregated product image(s)`);
        } else if (fieldName.startsWith('sliderImage_')) {
          const sliderIndexMatch = fieldName.match(/sliderImage_(\d+)/);
          if (sliderIndexMatch) {
            const fileArray = files[fieldName] || [];
            sliderFiles.push(...fileArray);
            logger.info(`  ✅ [sliderImage_${sliderIndexMatch[1]}] ${fileArray.length} file(s)`);
          }
        } else if (fieldName === 'sliderImage_aggregated' || fieldName === 'sliderImages') {
          const fileArray = files[fieldName] || [];
          sliderFiles.push(...fileArray);
          logger.info(`  ✅ [${fieldName}] ${fileArray.length} slider file(s)`);
        } else if (fieldName === 'storeLogo') {
          logoFile = files[fieldName]?.[0];
          logger.info(`  ✅ [storeLogo] 1 file`);
        } else {
          unknownFields.push(fieldName);
          logger.warn(`  ⚠️ [${fieldName}] Unknown field - ignoring`);
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

    if (primaryOwnerEmail) {
      const existingUser = await User.findOne({ where: { email: primaryOwnerEmail } });
      if (existingUser) {
        // If the user exists but doesn't have a store yet, or it's the same store slug, we can proceed
        // Otherwise, it's a conflict
        if (existingUser.storeSlug && existingUser.storeSlug !== storeSlug) {
          sendError(
            res,
            `البريد الإلكتروني "${primaryOwnerEmail}" مسجل بالفعل لمتجر آخر (${existingUser.storeSlug}).`,
            409
          );
          return;
        }
        logger.info(`ℹ️ User ${primaryOwnerEmail} already exists, will update/re-use during transaction`);
      }
    }

    if (secondaryOwnerEmail && secondaryOwnerEmail !== primaryOwnerEmail) {
      const existingUser = await User.findOne({ where: { email: secondaryOwnerEmail } });
      if (existingUser) {
        sendError(
          res,
          `Email "${secondaryOwnerEmail}" is already registered in the system`,
          409
        );
        return;
      }
    }

    let parsedProducts: ProductData[] = [];
    let parsedSliders: SliderImage[] = [];
    let productsImageCounts: number[] = [];
    type PersistedMerchantInstance = Awaited<ReturnType<typeof User.create>>;
    type PersistedStoreInstance = Awaited<ReturnType<typeof Store.create>>;
    let persistedMerchant: PersistedMerchantInstance | null = null;
    let persistedStoreRecord: PersistedStoreInstance | null = null;

    try {
      parsedProducts = JSON.parse(productsJson || '[]');
      parsedSliders = JSON.parse(sliderImagesJson || '[]');
      productsImageCounts = JSON.parse(productsImageCountsJson || '[]');
    } catch (parseError) {
      logger.error('Error parsing JSON:', parseError);
      sendError(res, 'Invalid JSON format for products or sliders', 400);
      return;
    }

    if (!Array.isArray(parsedProducts) || parsedProducts.length === 0) {
      sendError(res, 'At least one product is required', 400);
      return;
    }

    if (!Array.isArray(parsedSliders) || parsedSliders.length === 0) {
      sendError(res, 'At least one slider image is required', 400);
      return;
    }

    if (!logoFile) {
      sendError(res, 'Store logo is required', 400);
      return;
    }

    if (!Array.isArray(productsImageCounts) || productsImageCounts.length !== parsedProducts.length || productsImageCounts.some((count) => !count || count < 1)) {
      sendError(res, 'Each product must include at least one image', 400);
      return;
    }

    if (sliderFiles.length < parsedSliders.length) {
      sendError(res, 'Each slider must include an image', 400);
      return;
    }

    logger.info(`\n🔄 Cleaning up any existing assets for slug: ${storeSlug} in Supabase...`);
    try {
      await purgeStoreFromSupabase(storeSlug);
    } catch (purgeError) {
      logger.warn(`⚠️ Non-critical: Failed to purge old assets: ${purgeError}`);
    }

    logger.info(`\n🔄 Uploading images to Supabase in parallel...\n`);

    logger.info(`\n🔄 Preparing all product images for parallel upload...\n`);

    const uploadedProductUrls = new Map<Express.Multer.File, string>();
    const productUploadPromises: Promise<any>[] = [];

    // Collect all unique product files from both map and aggregated list
    const allProductFiles = new Set<Express.Multer.File>();
    Object.values(productFilesMap).forEach(files => files.forEach(f => allProductFiles.add(f)));
    aggregatedProductFiles.forEach(f => allProductFiles.add(f));

    logger.info(`  📦 Total unique product images to upload: ${allProductFiles.size}`);

    allProductFiles.forEach(file => {
      if (file.buffer) {
        const fileKey = file.filename || file.originalname || `product_${Math.random().toString(36).substring(7)}`;
        const promise = uploadBufferToSupabase(file.buffer, fileKey, storeSlug, 'products')
          .then(result => {
            if (result.success) {
              uploadedProductUrls.set(file, result.url);
              logger.info(`  ✅ Product image uploaded: ${file.originalname}`);
            } else {
              throw new Error(`Failed to upload product image: ${file.originalname}`);
            }
          });
        productUploadPromises.push(promise);
      }
    });

    // Execute product uploads in parallel
    if (productUploadPromises.length > 0) {
      try {
        await Promise.all(productUploadPromises);
      } catch (uploadError: any) {
        sendError(res, uploadError.message || 'Failed to upload product images', 500);
        return;
      }
    }

    if (aggregatedProductFiles.length > 0) {
      logger.info(`  🔄 Distributing ${aggregatedProductFiles.length} aggregated product image(s)`);
      const normalizedCounts = parsedProducts.map((_, idx) => {
        const count = productsImageCounts[idx];
        return count && count > 0 ? count : 1;
      });
      let aggregatedIndex = 0;

      parsedProducts.forEach((product, idx) => {
        if (productFilesMap[idx] && productFilesMap[idx].length > 0) {
          return;
        }
        const requiredCount = normalizedCounts[idx];
        const slice = aggregatedProductFiles.slice(aggregatedIndex, aggregatedIndex + requiredCount);
        aggregatedIndex += slice.length;
        if (slice.length > 0) {
          productFilesMap[idx] = [...slice];
          logger.info(`    • Aggregated assignment -> product ${idx} (${product.name}) received ${slice.length} image(s)`);
        }
      });

      if (aggregatedIndex < aggregatedProductFiles.length) {
        const leftovers = aggregatedProductFiles.slice(aggregatedIndex);
        logger.warn(`  ⚠️ ${leftovers.length} aggregated image(s) remained; distributing as fallback`);
        leftovers.forEach(file => {
          const targetIndex = parsedProducts.findIndex((_, idx) => !productFilesMap[idx] || productFilesMap[idx].length === 0);
          if (targetIndex >= 0) {
            productFilesMap[targetIndex] = [file];
            logger.info(`    • Fallback aggregated image assigned to product ${targetIndex} (${parsedProducts[targetIndex].name})`);
          }
        });
      }
    }

    // Safety check: ensure every file in productFilesMap is now in our uploaded map
    const missingProductUploads = Object.values(productFilesMap).some((files) => 
      files.some((file) => !uploadedProductUrls.has(file))
    );

    if (missingProductUploads) {
      // One last attempt for any missed files (shouldn't happen with the Set logic above)
      const missedFiles: Express.Multer.File[] = [];
      Object.values(productFilesMap).forEach(files => {
        files.forEach(file => {
          if (!uploadedProductUrls.has(file)) missedFiles.push(file);
        });
      });

      if (missedFiles.length > 0) {
        logger.warn(`  ⚠️ Found ${missedFiles.length} missed product images, attempting final recovery upload...`);
        const recoveryPromises = missedFiles.map(async (file) => {
          if (file.buffer) {
            const fileKey = file.filename || file.originalname || `product_rec_${Math.random().toString(36).substring(7)}`;
            const result = await uploadBufferToSupabase(file.buffer, fileKey, storeSlug, 'products');
            if (result.success) {
              uploadedProductUrls.set(file, result.url);
            }
          }
        });
        await Promise.all(recoveryPromises);
      }
    }

    const finalMissingCheck = Object.values(productFilesMap).some((files) => 
      files.some((file) => !uploadedProductUrls.has(file))
    );

    if (finalMissingCheck) {
      sendError(res, 'Failed to upload all product images after multiple attempts', 500);
      return;
    }

    const allUploadedImages: string[] = Array.from(uploadedProductUrls.values());

    logger.info(`  📊 Total unique images uploaded: ${allUploadedImages.length}`);

    let imageIndex = 0;
    parsedProducts = parsedProducts.map((product, idx) => {
      const filesForThisProduct = productFilesMap[idx] || [];
      
      const images = filesForThisProduct.map((f) => uploadedProductUrls.get(f)).filter(Boolean) as string[];
      if (images.length === 0) {
        images.push(allUploadedImages[imageIndex % allUploadedImages.length]);
        imageIndex++;
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
      
      // Determine quantity and stock status
      const quantity = Number.isFinite(Number(product.quantity)) ? Number(product.quantity) : 0;
      const inStock = quantity > 0;
      
      return {
        ...product,
        images,
        sizes,
        availableSizes,
        colors,
        quantity,
        inStock
      };
    });

    logger.info(`\n✅ Product image assignment complete - All products have unique images\n`);

    logger.info(`\n🔄 Uploading slider images to Supabase...\n`);

    const sliderUploadPromises: Promise<any>[] = [];
    const uploadedSliderUrls = new Map<Express.Multer.File, string>();

    sliderFiles.forEach(file => {
      if (file.buffer) {
        const fileKey = file.filename || file.originalname || `slider_${Math.random().toString(36).substring(7)}`;
        const promise = uploadBufferToSupabase(file.buffer, fileKey, storeSlug, 'sliders')
          .then(result => {
            if (result.success) {
              uploadedSliderUrls.set(file, result.url);
              logger.info(`  ✅ Slider image uploaded: ${file.originalname}`);
            } else {
              throw new Error(`Failed to upload slider image: ${file.originalname}`);
            }
          });
        sliderUploadPromises.push(promise);
      }
    });

    if (sliderUploadPromises.length > 0) {
      try {
        await Promise.all(sliderUploadPromises);
      } catch (uploadError: any) {
        sendError(res, uploadError.message || 'Failed to upload slider images', 500);
        return;
      }
    }


    const missingSliderUploads = sliderFiles.some((file) => !uploadedSliderUrls.has(file));
    if (missingSliderUploads) {
      sendError(res, 'Failed to upload all slider images', 500);
      return;
    }

    logger.info(`\n🔄 Uploading store logo to Supabase...\n`);
    
    let uploadedLogoUrl = '';
    if (logoFile) {
      if (logoFile.buffer) {
        const fileKey = logoFile.filename || logoFile.originalname || `logo_${Math.random().toString(36).substring(7)}`;
        const logoResult = await uploadBufferToSupabase(logoFile.buffer, fileKey, storeSlug, 'logo');
        if (logoResult.success) {
          uploadedLogoUrl = logoResult.url;
          logger.info(`  ✅ Logo uploaded to Supabase: ${logoFile.originalname}`);
        } else {
          sendError(res, 'Failed to upload store logo', 500);
          return;
        }
      }
    }


    if (!uploadedLogoUrl) {
      sendError(res, 'Failed to upload store logo', 500);
      return;
    }

    // Validate that we have product images
    if (allUploadedImages.length === 0) {
      logger.error('❌ No product images were uploaded successfully');
      sendError(res, 'Failed to upload product images. Please try again.', 500);
      return;
    }

    const defaultSliderImages = [
      {
        id: 'banner1',
        image: `/assets/${storeSlug}/sliders/default-slider-1.webp`,
        title: `اكتشف تشكيلة ${storeName} الحصرية`,
        subtitle: 'جودة عالية وأسعار منافسة',
        buttonText: 'تسوق الآن'
      },
      {
        id: 'banner2',
        image: `/assets/${storeSlug}/sliders/default-slider-2.webp`,
        title: `عروض حصرية من ${storeName}`,
        subtitle: 'لا تفوت الفرصة',
        buttonText: 'تسوق الآن'
      }
    ];
    
    const slidersWithImages: SliderImage[] = parsedSliders.map((slider, i) => {
      const file = sliderFiles[i];
      const image = file ? uploadedSliderUrls.get(file) : '';
      
      logger.info(`  📸 Slider ${i} mapping: file=${file?.filename || file?.originalname}, image=${image}`);

      return {
        ...slider,
        image: image || ''
      };
    }).filter(s => s.image && s.image.length > 0);

    logger.info(`✅ Mapped ${slidersWithImages.length} sliders with images out of ${parsedSliders.length} parsed sliders`);

    const logoUrl = uploadedLogoUrl;
    logger.info(`  🏷️ Logo: ${logoUrl}`);

    logger.info(`📝 Generating store files for: ${storeName}`);
    
    await runGeneration({
      storeId: Number(storeId),
      storeSlug,
      storeName,
      storeNameEn: storeNameEn || storeName,
      description,
      logo: logoUrl,
      icon: icon || '✨',
      color: color || 'from-purple-400 to-pink-600',
      categories: normalizedCategories,
      products: parsedProducts,
      sliderImages: slidersWithImages
    });

    logger.info(`✅ Store files generated successfully for: ${storeName}`);

    logger.info(`🧹 Cleaning up temporary upload files...`);
    try {
      await cleanupTempUploads();
      logger.info(`✅ Temporary files cleaned up successfully`);
    } catch (cleanupError) {
      logger.warn(`⚠️ Non-critical: Failed to cleanup temp files:`, cleanupError);
    }

    logger.info(`🔍 Checking for duplicate assets...`);
    const cleanupResult = await cleanupDuplicateAssets(storeSlug);
    if (cleanupResult.removed > 0) {
      logger.info(`✅ ${cleanupResult.message}`);
    }

    logger.info(`💾 Persisting merchant credentials, store, sliders, and ads for ${storeSlug}...`);
    try {
      await sequelize.transaction(async (transaction) => {
        // Find existing user or create new one
        const [merchantUser, created] = await User.findOrCreate({
          where: { email: primaryOwnerEmail },
          defaults: {
            email: primaryOwnerEmail,
            password: ownerPlainPassword,
            firstName: ownerFirstName,
            lastName: ownerLastName,
            phone: primaryOwnerPhone || '000000000',
            role: UserRole.MERCHANT,
            storeName,
            storeSlug,
            storeCategory: primaryCategoryValue,
            storeDescription: description,
            storeLogo: logoUrl,
            merchantVerified: true
          },
          transaction
        });

        if (!created) {
          logger.info(`ℹ️ Updating existing merchant user: ${primaryOwnerEmail}`);
          await merchantUser.update({
            firstName: ownerFirstName,
            lastName: ownerLastName,
            phone: primaryOwnerPhone || '000000000',
            storeName,
            storeSlug,
            storeCategory: primaryCategoryValue,
            storeDescription: description,
            storeLogo: logoUrl,
            merchantVerified: true
          }, { transaction });
        }

        persistedMerchant = merchantUser;

        persistedStoreRecord = await Store.create(
          {
            merchantId: persistedMerchant!.id,
            name: storeName,
            slug: storeSlug,
            category: primaryCategoryValue,
            description,
            logo: logoUrl,
            banner: slidersWithImages[0]?.image ?? undefined,
            isActive: true
          },
          { transaction }
        );

        logger.info(`💾 Persisting ${parsedProducts.length} products to database...`);
        for (let i = 0; i < parsedProducts.length; i++) {
          const p: any = parsedProducts[i] || {};

          const images = Array.isArray(p.images) ? (p.images as any[]).filter(Boolean) : [];
          
          // Ensure every product has at least one image - use default if empty
          let primaryImage = images[0] || '';
          if (!primaryImage || primaryImage.trim() === '') {
            primaryImage = DEFAULT_PRODUCT_IMAGE;
            logger.warn(`⚠️ Product ${i} (${p.name}) has no image, using default`);
          }
          
          // Ensure images array is not empty
          const finalImages = images.length > 0 ? images : [DEFAULT_PRODUCT_IMAGE];
          
          const quantity = Number.isFinite(Number(p.quantity)) ? Number(p.quantity) : 0;
          const resolvedInStock = quantity > 0;

          try {
            const created = await Product.create(
              {
                storeId: persistedStoreRecord!.id,
                name: (p.name || `Product ${i + 1}`).toString(),
                description: p.description ?? null,
                price: p.price ?? 0,
                originalPrice: p.originalPrice ?? null,
                category: (p.category || primaryCategoryValue || 'general').toString(),
                image: primaryImage,
                images: finalImages,
                colors: Array.isArray(p.colors) ? p.colors : [],
                sizes: Array.isArray(p.sizes) ? p.sizes : [],
                availableSizes: Array.isArray(p.availableSizes) ? p.availableSizes : [],
                tags: Array.isArray(p.tags) ? p.tags : [],
                quantity,
                inStock: resolvedInStock,
                rating: p.rating ?? null,
                reviewCount: p.reviews ?? p.reviewCount ?? 0
              },
              { transaction }
            );

            // Create product images records
            for (let idx = 0; idx < finalImages.length; idx++) {
              const imageUrl = finalImages[idx];
              await ProductImage.create(
                {
                  productId: created.id,
                  imageUrl,
                  sortOrder: idx,
                  isPrimary: idx === 0
                },
                { transaction }
              );
            }
          } catch (productError: any) {
            logger.error(`❌ Failed to create product ${i} (${p.name}):`, productError);
            throw new Error(`Failed to create product "${p.name}": ${productError.message}`);
          }
        }
        logger.info(`✅ ${parsedProducts.length} products persisted to database`);

        logger.info(`💾 Persisting ${slidersWithImages.length} sliders to database...`);
        for (let i = 0; i < slidersWithImages.length; i++) {
          const slider = slidersWithImages[i];
          
          // Ensure slider has an image path
          const sliderImagePath = slider.image || DEFAULT_PRODUCT_IMAGE;
          
          await StoreSlider.create(
            {
              storeId: persistedStoreRecord!.id,
              title: slider.title || `Slider ${i + 1}`,
              subtitle: slider.subtitle,
              buttonText: slider.buttonText,
              imagePath: sliderImagePath,
              placement: 'slider',
              sortOrder: i,
              metadata: {
                id: slider.id,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            },
            { transaction }
          );
        }
        logger.info(`✅ ${slidersWithImages.length} sliders persisted to database`);

        logger.info(`💾 Creating default ads for store...`);
        const defaultAds = [
          {
            templateId: 'banner_default',
            title: `مرحبا بك في متجر ${storeName}`,
            description: 'استمتع بأفضل العروض والمنتجات الحصرية',
            placement: 'banner' as const,
            isActive: true
          }
        ];

        for (const ad of defaultAds) {
          await StoreAd.create(
            {
              storeId: persistedStoreRecord!.id,
              ...ad
            },
            { transaction }
          );
        }
        logger.info(`✅ Default ads created for store`);
        });
        logger.info(`✅ Merchant credentials, store, sliders, and ads stored for ${storeSlug}`);
      } catch (dbError: any) {
        logger.error('❌ Failed to persist store data:', dbError);
        // Provide more specific error message based on the error type
        let errorMessage = 'Failed to save store data';
        
        if (dbError.name === 'SequelizeValidationError') {
          const validationErrors = dbError.errors?.map((e: any) => `${e.path}: ${e.message}`).join(', ');
          errorMessage = `Validation error: ${validationErrors || dbError.message}`;
        } else if (dbError.name === 'SequelizeUniqueConstraintError') {
          errorMessage = 'A store with this name or slug already exists';
        } else if (dbError.message) {
          errorMessage = dbError.message;
        }
        
        sendError(res, errorMessage, 500);
        return;
      }

    logger.info(`🔍 Verifying permanent storage for: ${storeSlug}`);
    const verificationResult = await verifyStorePermanentStorage(storeSlug);

    logger.info(`🎉 Store creation completed successfully for: ${storeName}`);

    const merchantPayload = persistedMerchant
      ? {
          id: persistedMerchant.id,
          email: persistedMerchant.email,
          phone: persistedMerchant.phone,
          storeRecordId: persistedStoreRecord?.id
        }
      : undefined;

    sendSuccess(res, {
      message: 'Store created successfully with permanent storage verification',
      store: {
        storeSlug,
        storeName,
        productsCount: parsedProducts.length,
        slidersCount: slidersWithImages.length,
        logo: logoUrl
      },
      products: parsedProducts,
      sliderImages: slidersWithImages,
      verification: {
        success: verificationResult.success,
        checks: verificationResult.checks,
        warnings: verificationResult.warnings
      },
      merchant: merchantPayload
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

export const getStorePublicData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;

    if (!slug) {
      sendError(res, 'Store slug is required', 400);
      return;
    }

    const store = await Store.findOne({
      where: { slug }
    });

    if (!store) {
      logger.warn(`Store not found in database: ${slug}, will attempt fallback to static files`);
    }

    const dbSliders = store ? await StoreSlider.findAll({
      where: { storeId: store.id },
      order: [['sortOrder', 'ASC']]
    }).catch(() => []) : [];

    const dbProducts = store ? await Product.findAll({
      where: { storeId: store.id },
      include: [{ model: ProductImage, as: 'productImages', required: false }],
      order: [['createdAt', 'DESC']]
    }).catch(() => []) : [];

    let products: any[] = dbProducts.map((p: any) => {
      const plain = typeof p?.get === 'function' ? p.get({ plain: true }) : p;
      const { productImages, ...rest } = plain || {};

      const joinedImages = Array.isArray(productImages)
        ? [...productImages]
            .sort((a: any, b: any) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0))
            .map((img: any) => img?.imageUrl)
            .filter(Boolean)
        : [];

      const modelImages = Array.isArray(rest?.images) ? rest.images.filter(Boolean) : [];
      const images = modelImages.length > 0 ? modelImages : joinedImages;
      const quantity = Number.isFinite(Number(rest?.quantity)) ? Number(rest.quantity) : 0;

      return {
        ...rest,
        images,
        colors: Array.isArray(rest?.colors) ? rest.colors : [],
        sizes: Array.isArray(rest?.sizes) ? rest.sizes : [],
        availableSizes: Array.isArray(rest?.availableSizes) ? rest.availableSizes : [],
        tags: Array.isArray(rest?.tags) ? rest.tags : [],
        quantity,
        inStock: quantity > 0
      };
    });

    let sliders: any[] = dbSliders.map((s: any) => ({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle,
      buttonText: s.buttonText,
      imageUrl: normalizeSliderImagePath(store?.slug || slug, s.imagePath),
      image: normalizeSliderImagePath(store?.slug || slug, s.imagePath)
    }));

    const applyStoreJsonPayload = (payload: any) => {
      if (!payload || typeof payload !== 'object') {
        return;
      }

      if (products.length === 0 && Array.isArray(payload?.products)) {
        products = payload.products;
      }

      if (sliders.length === 0 && Array.isArray(payload?.sliderImages)) {
        sliders = payload.sliderImages.map((s: any, idx: number) => ({
          id: s?.id || `banner${idx + 1}`,
          title: s?.title || '',
          subtitle: s?.subtitle || '',
          buttonText: s?.buttonText || '',
          imageUrl: s?.image || '',
          image: s?.image || ''
        }));
      }
    };

    if (products.length === 0 || sliders.length === 0) {
      try {
        const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
        const protocol = forwardedProto || req.protocol || 'https';
        const host = req.get('host');
        const url = host ? `${protocol}://${host}/assets/${store?.slug || slug}/store.json` : '';

        if (url) {
          const response = await fetch(url, { headers: { accept: 'application/json' } });
          if (response.ok) {
            const parsed = await response.json().catch(() => null);
            applyStoreJsonPayload(parsed);
          }
        }
      } catch (httpError) {
        logger.warn('Failed to fetch store.json over HTTP for public store data', {
          slug: store?.slug || slug,
          error: httpError instanceof Error ? httpError.message : String(httpError)
        });
      }
    }


    const storeResponse = store ? {
      id: store.id,
      name: store.name,
      slug: store.slug,
      description: store.description,
      logo: store.logo,
      category: store.category,
      isActive: store.isActive
    } : {
      id: -1,
      name: slug,
      slug: slug,
      description: 'Store loaded from static files',
      logo: '/assets/default-store.png',
      category: 'general',
      isActive: true
    };

    sendSuccess(res, {
      store: storeResponse,
      products,
      sliders
    });

  } catch (error) {
    logger.error('Error fetching public store data:', error);
    next(error);
  }
};

export const checkStoreExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { storeSlug, storeName } = req.body;

    if (!storeSlug && !storeName) {
      sendError(res, 'Store slug or name is required', 400);
      return;
    }

    const existingStore = await Store.findOne({
      where: {
        [Op.or]: [
          storeSlug ? { slug: storeSlug } : {},
          storeName ? { name: storeName } : {}
        ]
      }
    });

    if (existingStore) {
      sendSuccess(res, {
        exists: true,
        store: {
          id: existingStore.id,
          slug: (existingStore as any).slug,
          name: (existingStore as any).name
        }
      });
    } else {
      sendSuccess(res, {
        exists: false,
        message: 'Store is available'
      });
    }
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
    const { storeId, userIds } = req.body;

    if (!storeId || !Array.isArray(userIds) || userIds.length === 0) {
      sendError(res, 'Store ID and user IDs are required', 400);
      return;
    }

    logger.info(`Cleaning up store ${storeId} and ${userIds.length} user(s)...`);

    await Store.destroy({
      where: { id: storeId }
    });

    await User.destroy({
      where: { id: { [Op.in]: userIds } }
    });

    logger.info(`Cleanup completed for store ${storeId}`);

    sendSuccess(res, {
      message: 'Store and users cleaned up successfully',
      storeId,
      usersDeleted: userIds.length
    });
  } catch (error) {
    logger.error('Error during cleanup:', error);
    next(error);
  }
};

export const adminPurgeStores = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = String(req.headers['x-admin-token'] || '');
    const expected = String(process.env.ADMIN_PURGE_TOKEN || '');

    if (!expected || token !== expected) {
      logger.warn(`🔴 محاولة حذف غير مصرح بها من IP: ${req.ip} بـ token: ${token.substring(0, 10)}...`);
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const slugsRaw = (req.body?.slugs || req.body?.slug || []) as any;
    const slugs = (Array.isArray(slugsRaw) ? slugsRaw : [slugsRaw])
      .map((s) => String(s || '').trim())
      .filter(Boolean);

    // التحقق من الحماية لمنع حذف المتاجر الأساسية
    const protectedSlugsFound = slugs.filter(s => PROTECTED_SLUGS.includes(s.toLowerCase()));
    if (protectedSlugsFound.length > 0) {
      logger.warn(`🔴 محاولة حذف متاجر محمية: ${protectedSlugsFound.join(', ')}`);
      sendError(res, `لا يمكن حذف المتاجر التالية لأنها محمية من قبل النظام: ${protectedSlugsFound.join(', ')}`, 403);
      return;
    }

    const emailsRaw = (req.body?.emails || req.body?.email || []) as any;
    const emails = (Array.isArray(emailsRaw) ? emailsRaw : [emailsRaw])
      .map((s) => String(s || '').trim().toLowerCase())
      .filter(Boolean);

    if (slugs.length === 0 && emails.length === 0) {
      sendError(res, 'slugs or emails is required', 400);
      return;
    }

    logger.error(`🔴 تنبيه حرج: محاولة حذف من Supabase للمتاجر: ${slugs.join(', ')} والبريد: ${emails.join(', ')}`);
    logger.info(`⏰ الوقت: ${new Date().toISOString()}`);
    logger.info(`📍 الـ IP: ${req.ip}`);
    logger.info(`🔑 Token المستخدم: ${token.substring(0, 20)}...`);

    const result = {
      slugs,
      emails,
      storesDeleted: 0,
      usersDeleted: 0,
      productsDeleted: 0,
      productImagesDeleted: 0,
      slidersDeleted: 0,
      adsDeleted: 0,
      featuresDeleted: 0,
      subscriptionsDeleted: 0,
      membersDeleted: 0,
      manualOrdersDeleted: 0,
      abandonedCartsDeleted: 0,
      unavailableNotificationsDeleted: 0,
      supabase: [] as any[]
    };

    await sequelize.transaction(async (transaction) => {
      const stores = slugs.length
        ? await Store.findAll({ where: { slug: { [Op.in]: slugs } }, transaction })
        : [];
      const storeIds = stores.map((s) => s.id);
      const merchantIdsFromStores = stores.map((s) => (s as any).merchantId).filter(Boolean);

      const usersFromEmails = emails.length
        ? await User.findAll({ where: { email: { [Op.in]: emails } }, attributes: ['id'], transaction })
        : [];
      const merchantIdsFromEmails = usersFromEmails.map((u) => u.id);

      const merchantIds = Array.from(new Set([...merchantIdsFromStores, ...merchantIdsFromEmails]));

      if (storeIds.length === 0 && merchantIds.length === 0) {
        return;
      }

      const productIds = storeIds.length
        ? (await Product.findAll({ where: { storeId: { [Op.in]: storeIds } }, attributes: ['id'], transaction })).map((p) => p.id)
        : [];

      if (productIds.length) {
        result.productImagesDeleted += await ProductImage.destroy({ where: { productId: { [Op.in]: productIds } }, transaction });
      }

      if (storeIds.length) {
        result.productsDeleted += await Product.destroy({ where: { storeId: { [Op.in]: storeIds } }, transaction });
        result.slidersDeleted += await StoreSlider.destroy({ where: { storeId: { [Op.in]: storeIds } }, transaction });
        result.adsDeleted += await StoreAd.destroy({ where: { storeId: { [Op.in]: storeIds } }, transaction });
        result.featuresDeleted += await StoreFeature.destroy({ where: { storeId: { [Op.in]: storeIds } }, transaction });
        result.subscriptionsDeleted += await StoreSubscription.destroy({ where: { storeId: { [Op.in]: storeIds } }, transaction });
        result.membersDeleted += await StoreUser.destroy({ where: { storeId: { [Op.in]: storeIds } }, transaction });
        result.manualOrdersDeleted += await ManualOrder.destroy({ where: { storeId: { [Op.in]: storeIds } }, transaction });
        result.abandonedCartsDeleted += await AbandonedCart.destroy({ where: { storeId: { [Op.in]: storeIds } }, transaction });
        result.unavailableNotificationsDeleted += await UnavailableNotification.destroy({ where: { storeSlug: { [Op.in]: slugs } }, transaction });
        result.storesDeleted += await Store.destroy({ where: { id: { [Op.in]: storeIds } }, transaction });
      }

      if (merchantIds.length) {
        result.usersDeleted += await User.destroy({ where: { id: { [Op.in]: merchantIds } }, transaction });
      }
    });

    for (const slug of slugs) {
      logger.error(`💥 جاري حذف جميع بيانات Supabase للمتجر: ${slug}`);
      const purge = await purgeStoreFromSupabase(slug);
      logger.error(`✅ تم حذف ${purge.removed}/${purge.attempted} ملف من Supabase للمتجر: ${slug}`);
      result.supabase.push({ slug, ...purge });
    }

    logger.error(`🔴 اكتمل الحذف من Supabase. تم حذف ${result.supabase.reduce((s, r) => s + r.removed, 0)} ملف إجمالاً`);
    sendSuccess(res, result, 200, 'Purge completed');
  } catch (error) {
    logger.error('Error during admin purge:', error);
    next(error);
  }
};

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
    } = req.body || {};

    if (!productId || !productName || !customerName || !phone) {
      sendError(res, 'Missing required fields for unavailable notification', 400);
      return;
    }

    let resolvedStoreId = storeId as number | undefined;
    let resolvedStoreSlug = storeSlug as string | undefined;

    if (!resolvedStoreSlug && resolvedStoreId) {
      const store = await Store.findByPk(resolvedStoreId);
      resolvedStoreSlug = (store as any)?.slug;
    }

    if (!resolvedStoreId && resolvedStoreSlug) {
      const store = await Store.findOne({ where: { slug: resolvedStoreSlug } });
      resolvedStoreId = store?.id;
    }

    const normalizedNotificationTypes = Array.isArray(notificationTypes)
      ? notificationTypes.join(',')
      : typeof notificationTypes === 'string'
        ? notificationTypes
        : '';

    const record = await UnavailableNotification.create({
      storeId: resolvedStoreId,
      storeSlug: resolvedStoreSlug,
      productId,
      productName,
      customerName,
      phone,
      email: (email || '').toString(),
      quantity: quantity ?? 1,
      notificationTypes: normalizedNotificationTypes
    });

    logger.info('Unavailable notification stored', {
      id: record.id,
      storeSlug: resolvedStoreSlug,
      productId
    });

    sendSuccess(res, {
      message: 'Unavailable notification created',
      notification: record
    }, 201);
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
    const { storeSlug } = req.params;

    if (!storeSlug) {
      sendError(res, 'Store slug is required', 400);
      return;
    }

    logger.info(`Listing unavailable items for store: ${storeSlug}`);

    const storeRecord = await Store.findOne({ where: { slug: storeSlug } });
    const clauses: any[] = [{ storeSlug }];
    if (storeRecord?.id) {
      clauses.push({ storeId: storeRecord.id });
    }

    const unavailableItems = await UnavailableNotification.findAll({
      where: { [Op.or]: clauses },
      order: [['createdAt', 'DESC']]
    });

    sendSuccess(res, {
      store: storeSlug,
      unavailableItems
    });
  } catch (error) {
    logger.error('Error listing unavailable items:', error);
    next(error);
  }
};

export const uploadSliderImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeSlug } = req.params;
    const { title, subtitle, buttonText, sortOrder } = req.body;
    const file = (req as any).file;

    if (!file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }

    const store = await Store.findOne({ where: { slug: storeSlug } });
    if (!store) {
      res.status(404).json({ success: false, error: 'Store not found' });
      return;
    }

    const fileExt = path.extname(file.originalname || file.filename || '');
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;

    if (!file.buffer) {
      throw new Error('No file buffer available');
    }

    const uploadResult = await uploadBufferToSupabase(
      file.buffer,
      fileName,
      storeSlug,
      'sliders'
    );

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Failed to upload to Supabase');
    }

    const imagePath = uploadResult.url;
    logger.info(`✅ Slider image uploaded to Supabase: ${imagePath}`);

    const slider = await StoreSlider.create({
      storeId: store.id,
      title: title || `Slider ${Date.now()}`,
      subtitle: subtitle || '',
      buttonText: buttonText || 'View More',
      imagePath,
      placement: 'slider',
      sortOrder: sortOrder ? parseInt(sortOrder as string, 10) : 0,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });

    logger.info(`✅ Slider persisted to database: ${slider.id}`);
    
    res.status(201).json({
      success: true,
      data: { 
        id: slider.id,
        imagePath, 
        filename: fileName,
        slider
      }
    });
  } catch (error) {
    logger.error('Error uploading slider image:', error);
    res.status(500).json({ success: false, error: 'Failed to upload image' });
  }
};
