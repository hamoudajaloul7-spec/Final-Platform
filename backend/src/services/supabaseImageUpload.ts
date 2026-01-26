import { createClient } from '@supabase/supabase-js';
import logger from '@utils/logger';
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

export const uploadBufferToSupabase = async (
  buffer: Buffer,
  filename: string,
  storeSlug: string,
  imageType: 'products' | 'sliders' | 'logo'
): Promise<UploadImageResult> => {
  try {
    if (!supabaseKey) {
      throw new Error('SUPABASE key is not configured');
    }

    const supabasePath = `stores/${storeSlug}/${imageType}/${filename}`;

    logger.info(`📤 Uploading buffer to Supabase: ${supabasePath}`);

    const { data, error } = await supabase.storage
      .from(supabaseBucket)
      .upload(supabasePath, buffer, {
        contentType: getMimeType(filename),
        cacheControl: '31536000',
        upsert: true
      });

    if (error) {
      throw new Error(`Supabase upload error: ${error.message}`);
    }

    const url = `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/${supabasePath}`;

    logger.info(`✅ Uploaded buffer to Supabase: ${url}`);

    return {
      success: true,
      filename,
      path: supabasePath,
      url
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`❌ Failed to upload buffer to Supabase: ${errorMessage}`);
    return {
      success: false,
      filename,
      path: '',
      url: '',
      error: errorMessage
    };
  }
};

export const uploadMultipleImagesToSupabase = async (
  files: Array<{ buffer: Buffer; filename: string }>,
  storeSlug: string,
  imageType: 'products' | 'sliders' | 'logo'
): Promise<UploadImageResult[]> => {
  const results: UploadImageResult[] = [];

  for (const file of files) {
    const result = await uploadBufferToSupabase(file.buffer, file.filename, storeSlug, imageType);
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
    if (!supabaseKey) {
      throw new Error('SUPABASE key is not configured');
    }

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

export interface SupabasePurgeResult {
  success: boolean;
  removed: number;
  attempted: number;
  errors: string[];
}

export const purgeStoreFromSupabase = async (storeSlug: string): Promise<SupabasePurgeResult> => {
  const errors: string[] = [];
  let removed = 0;
  let attempted = 0;

  try {
    if (!supabaseKey) {
      throw new Error('SUPABASE key is not configured');
    }

    const prefixes = [`stores/${storeSlug}/logo`, `stores/${storeSlug}/sliders`, `stores/${storeSlug}/products`];

    for (const prefix of prefixes) {
      const parts = prefix.split('/');
      const folderPath = parts.slice(0, -1).join('/');
      const folderName = parts[parts.length - 1];

      const { data, error } = await supabase.storage
        .from(supabaseBucket)
        .list(`${folderPath}/${folderName}`, { limit: 1000 });

      if (error) {
        errors.push(`List failed for ${prefix}: ${error.message}`);
        continue;
      }

      const files = (data || []).filter((e: any) => e?.name && !e?.metadata?.is_folder);
      if (files.length === 0) {
        continue;
      }

      const toRemove = files.map((f: any) => `${folderPath}/${folderName}/${f.name}`);
      attempted += toRemove.length;

      const { error: removeError } = await supabase.storage
        .from(supabaseBucket)
        .remove(toRemove);

      if (removeError) {
        errors.push(`Remove failed for ${prefix}: ${removeError.message}`);
        continue;
      }

      removed += toRemove.length;
    }

    return { success: errors.length === 0, removed, attempted, errors };
  } catch (e: any) {
    return { success: false, removed, attempted, errors: [e?.message || 'Unknown error'] };
  }
};
