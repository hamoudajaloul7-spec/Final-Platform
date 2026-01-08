import { Router } from 'express';
import { createStoreWithFiles, createStoreWithImages, validateStoreData, checkStoreExists, cleanupStoreAndUsers, createUnavailableNotification, listUnavailableByStore, uploadSliderImage, getStorePublicData } from '@controllers/storeController';
import { uploadBothImages, storeImageUpload } from '@middleware/storeImageUpload';
import logger from '@utils/logger';
import { sendSuccess } from '@utils/response';
import Store from '@models/Store';

const router = Router();

router.get('/public/:slug', getStorePublicData);
router.post('/create-with-files', createStoreWithFiles);

router.post('/create-with-images', (req, res, next) => {
  logger.info('📥 Received POST /create-with-images');
  uploadBothImages(req, res, (err: any) => {
    if (err) {
      logger.error('❌ Upload middleware error:', err);
      if (!res.headersSent) {
        return res.status(400).json({ 
          success: false, 
          error: `Upload error: ${err.message}`,
          code: 'UPLOAD_ERROR'
        });
      }
      return;
    }
    logger.info('✅ Upload middleware passed, proceeding to controller');
    next();
  });
}, (req, res, next) => {
  createStoreWithImages(req, res, next).catch((err: any) => {
    logger.error('❌ Uncaught error in createStoreWithImages:', err);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  });
});

router.post('/validate', validateStoreData);
router.post('/check-exists', checkStoreExists);
router.post('/cleanup', cleanupStoreAndUsers);

router.get('/list', async (req, res, next) => {
  try {
    const stores = await Store.findAll({
      attributes: ['id', 'name', 'slug', 'category', 'description', 'logo', 'isActive', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });

    const normalizedStores = stores.map((store) => {
      const plain = typeof (store as any).get === 'function' ? (store as any).get({ plain: true }) : (store as any);
      return {
        ...plain,
        status: plain.isActive ? 'active' : 'inactive'
      };
    });

    logger.info(`✅ Retrieved ${normalizedStores.length} stores`);

    sendSuccess(res, {
      message: 'Stores retrieved successfully',
      stores: normalizedStores,
      total: normalizedStores.length
    }, 200, 'Stores retrieved');
  } catch (error) {
    logger.error('Error retrieving stores:', error);
    next(error);
  }
});

router.post('/unavailable/notify', createUnavailableNotification);
router.get('/unavailable/by-store/:slug', listUnavailableByStore);
router.post('/:storeSlug/upload-slider-image', storeImageUpload.single('sliderImage_0'), uploadSliderImage);

export default router;
