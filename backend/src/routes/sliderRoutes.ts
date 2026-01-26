import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getStoreSliders,
  createStoreSlider,
  updateStoreSlider,
  deleteStoreSlider,
  bulkDeleteStoreSliders,
  updateSlidersOrder,
  uploadSliderImage,
} from '@controllers/sliderController';
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/avif', 'image/svg+xml'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 }
});

const router = Router();

router.get('/store/:storeId', getStoreSliders);
router.post('/store/:storeId', createStoreSlider);
router.put('/store/:storeId/:sliderId', updateStoreSlider);
router.delete('/store/:storeId/:sliderId', deleteStoreSlider);
router.post('/store/:storeId/bulk-delete', bulkDeleteStoreSliders);
router.post('/store/:storeId/update-order', updateSlidersOrder);
router.post('/store/:storeId/upload', upload.single('image'), uploadSliderImage);

export default router;
