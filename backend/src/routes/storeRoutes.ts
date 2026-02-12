import { Router } from 'express';
import { createStoreWithFiles, createStoreWithImages, validateStoreData, checkStoreExists, cleanupStoreAndUsers, adminPurgeStores, createUnavailableNotification, listUnavailableByStore, uploadSliderImage, getStorePublicData } from '@controllers/storeController';
import { uploadBothImages, storeImageUpload } from '@middleware/storeImageUpload';
import logger from '@utils/logger';
import { sendSuccess } from '@utils/response';
import Store from '@models/Store';
import User from '@models/User';

const router = Router();

router.get('/activity', async (req, res, next) => {
  try {
    const stores = await Store.findAll({
      include: [{
        model: User,
        as: 'merchant',
        attributes: ['email', 'firstName', 'lastName']
      }],
      order: [['createdAt', 'DESC']]
    });

    const stats = {
      totalStores: stores.length,
      automatedStores: stores.filter(s => (s as any).isAutomated).length,
      activeStores: stores.filter(s => s.isActive).length,
      recentActivity: stores.slice(0, 10).map(s => {
        const plain = typeof (s as any).get === 'function' ? (s as any).get({ plain: true }) : (s as any);
        return {
          ...plain,
          merchantEmail: plain.merchant?.email
        };
      })
    };

    sendSuccess(res, stats, 200, 'Activity data retrieved');
  } catch (error) {
    logger.error('Store activity error:', error);
    next(error);
  }
});

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
router.post('/admin/purge', adminPurgeStores);

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
