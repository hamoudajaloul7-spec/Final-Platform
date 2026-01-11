import { createClient } from '@supabase/supabase-js';
import logger from '@utils/logger';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL || 'https://wbakbuqvdbmweujkbzxn.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SECRET_KEYS ||
  process.env.SUPABASE_ANON_KEY ||
  '';
const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || 'ishro-assets';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface UploadImageResult {
  success: boolean;
  filename: string;
  path: string;
  url: string;
  error?: string;
}

const getMimeType = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.avif': 'image/avif',
    '.svg': 'image/svg+xml',
    '.tiff': 'image/tiff',
    '.tif': 'image/tiff',
    '.bmp': 'image/bmp'
  };

  return mimeTypes[ext] || 'application/octet-stream';
};

export const uploadImageToSupabase = async (
  filePath: string,
  storeSlug: string,
  imageType: 'products' | 'sliders' | 'logo'
): Promise<UploadImageResult> => {
  try {
    if (!supabaseKey) {
      throw new Error('SUPABASE key is not configured');
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const filename = path.basename(filePath);
    const supabasePath = `stores/${storeSlug}/${imageType}/${filename}`;
    const fileBuffer = fs.readFileSync(filePath);

    logger.info(`📤 Uploading to Supabase: ${supabasePath}`);

    const { data, error } = await supabase.storage
      .from(supabaseBucket)
      .upload(supabasePath, fileBuffer, {
        contentType: getMimeType(filename),
        upsert: true
      });

    if (error) {
      throw new Error(`Supabase upload error: ${error.message}`);
    }

    const url = `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/${supabasePath}`;

    logger.info(`✅ Uploaded to Supabase: ${url}`);

    return {
      success: true,
      filename,
      path: supabasePath,
      url
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`❌ Failed to upload image to Supabase: ${errorMessage}`);
    return {
      success: false,
      filename: path.basename(filePath),
      path: '',
      url: '',
      error: errorMessage
    };
  }
};

export const uploadMultipleImagesToSupabase = async (
  files: Array<{ path: string; filename?: string }>,
  storeSlug: string,
  imageType: 'products' | 'sliders' | 'logo'
): Promise<UploadImageResult[]> => {
  const results: UploadImageResult[] = [];

  for (const file of files) {
    const result = await uploadImageToSupabase(file.path, storeSlug, imageType);
    results.push(result);
  }

  return results;
};

export const deleteImageFromSupabase = async (
  storeSlug: string,
  imageType: string,
  filename: string
): Promise<boolean> => {
  try {
    const filePath = `stores/${storeSlug}/${imageType}/${filename}`;
    logger.info(`🗑️ Deleting from Supabase: ${filePath}`);

    const { error } = await supabase.storage
      .from(supabaseBucket)
      .remove([filePath]);

    if (error) {
      throw new Error(`Supabase delete error: ${error.message}`);
    }

    logger.info(`✅ Deleted from Supabase: ${filePath}`);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`❌ Failed to delete image from Supabase: ${errorMessage}`);
    return false;
  }
};
