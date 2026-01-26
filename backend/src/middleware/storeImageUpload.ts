import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import logger from '@utils/logger';

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg', 
    'image/png', 
    'image/webp', 
    'image/gif', 
    'image/avif', 
    'image/tiff', 
    'image/bmp',
    'image/svg+xml'
  ];
  
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.tiff', '.tif', '.bmp', '.svg'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  const isValidMime = allowedMimes.includes(file.mimetype);
  const isValidExt = allowedExtensions.includes(fileExt);
  
  if (isValidMime || isValidExt) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Only ${allowedExtensions.join(', ')} are allowed`));
  }
};

export const storeImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 600,
    fieldSize: 50 * 1024 * 1024
  }
});

export const uploadProductImages = storeImageUpload.array('productImages', 500);
export const uploadSliderImages = storeImageUpload.array('sliderImages', 50);

export const calculateFileHash = async (file: Express.Multer.File): Promise<string> => {
  if (file.buffer) {
    return crypto.createHash('sha256').update(file.buffer).digest('hex');
  }
  return Date.now().toString() + Math.random().toString();
};

export const deduplicateFiles = async (
  files: Express.Multer.File[]
): Promise<Express.Multer.File[]> => {
  const hashMap = new Map<string, Express.Multer.File>();

  for (const file of files) {
    try {
      const hash = await calculateFileHash(file);
      if (!hashMap.has(hash)) {
        hashMap.set(hash, file);
      }
    } catch (error) {
      hashMap.set(Date.now().toString() + Math.random().toString(), file);
    }
  }

  return Array.from(hashMap.values());
};

export const moveUploadedFiles = async (
  storeSlug: string, 
  files: Record<string, Express.Multer.File[]>
): Promise<Record<string, Express.Multer.File[]>> => {
  logger.info(`ℹ️ Memory storage in use, files are ready for Supabase upload for ${storeSlug}`);
  return files;
};

export const cleanupTempUploads = async (): Promise<void> => {
  // No-op for memory storage
};

export const uploadBothImages = (req: any, res: any, next: any) => {
  const fields: any[] = [
    { name: 'productImages', maxCount: 500 },
    { name: 'sliderImages', maxCount: 50 },
    { name: 'storeLogo', maxCount: 1 }
  ];

  // Generate fields for up to 100 products with images
  for (let i = 0; i < 100; i++) {
    fields.push({ name: `productImage_${i}`, maxCount: 5 });
  }

  // Generate fields for up to 20 slider images
  for (let i = 0; i < 20; i++) {
    fields.push({ name: `sliderImage_${i}`, maxCount: 1 });
  }

  let timeoutHandle: NodeJS.Timeout | null = null;
  
  const uploadHandler = storeImageUpload.fields(fields);
  
  timeoutHandle = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({ 
        success: false, 
        error: 'Upload processing timeout - request took too long' 
      });
    }
  }, 600000);
  
  uploadHandler(req, res, (err: any) => {
    if (timeoutHandle) clearTimeout(timeoutHandle);
    
    if (err) {
      if (!res.headersSent) {
        return res.status(400).json({ 
          success: false, 
          error: `Upload error: ${err.message}` 
        });
      }
      return;
    }
    next();
  });
};
