import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { uploadBufferToSupabase } from '@services/supabaseImageUpload';
import logger from '@utils/logger';

// Configure multer for memory storage
const storage = multer.memoryStorage();

export const uploadBothImages = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
}).fields([
  { name: 'productImages', maxCount: 50 },
  { name: 'sliderImages', maxCount: 20 },
  { name: 'storeLogo', maxCount: 1 }
]);

// Upload files to Supabase Storage
export const saveUploadedImages = async (
  files: { [fieldname: string]: Express.Multer.File[] },
  storeSlug: string
): Promise<{
  productImageUrls: string[];
  sliderImageUrls: string[];
  logoUrl?: string;
}> => {
  const productImageUrls: string[] = [];
  const sliderImageUrls: string[] = [];
  let logoUrl: string | undefined;

  // Save product images
  if (files.productImages) {
    for (const [index, file] of files.productImages.entries()) {
      const filename = `product_${index + 1}_${Date.now()}${path.extname(file.originalname)}`;
      const result = await uploadBufferToSupabase(file.buffer, filename, storeSlug, 'products');
      if (result.success) {
        productImageUrls.push(result.url);
      } else {
        logger.error(`Failed to upload product image ${filename} to Supabase: ${result.error}`);
        // In cloud-native mode, we don't fall back to local file system
      }
    }
  }

  // Save slider images
  if (files.sliderImages) {
    for (const [index, file] of files.sliderImages.entries()) {
      const filename = `slider_${index + 1}_${Date.now()}${path.extname(file.originalname)}`;
      const result = await uploadBufferToSupabase(file.buffer, filename, storeSlug, 'sliders');
      if (result.success) {
        sliderImageUrls.push(result.url);
      } else {
        logger.error(`Failed to upload slider image ${filename} to Supabase: ${result.error}`);
        // No local fallback in cloud-native mode
      }
    }
  }

  // Save store logo
  if (files.storeLogo && files.storeLogo[0]) {
    const file = files.storeLogo[0];
    const filename = `logo_${Date.now()}${path.extname(file.originalname)}`;
    const result = await uploadBufferToSupabase(file.buffer, filename, storeSlug, 'logo');
    if (result.success) {
      logoUrl = result.url;
    } else {
      logger.error(`Failed to upload logo ${filename} to Supabase: ${result.error}`);
      // No local fallback in cloud-native mode
    }
  }

  return {
    productImageUrls,
    sliderImageUrls,
    logoUrl
  };
};
