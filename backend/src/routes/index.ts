import { Router } from 'express';
import { API_PREFIX } from '@config/constants';

import authRoutes from './authRoutes';
import productRoutes from './productRoutes';
import orderRoutes from './orderRoutes';
import paymentRoutes from './paymentRoutes';
import couponRoutes from './couponRoutes';
import storeRoutes from './storeRoutes';
import categoryRoutes from './categoryRoutes';
import adRoutes from './adRoutes';
import sliderRoutes from './sliderRoutes';
import inventoryRoutes from './inventoryRoutes';
import assetProxyRoutes from './assetProxyRoutes';

const router = Router();

router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/products`, productRoutes);
router.use(`${API_PREFIX}/orders`, orderRoutes);
router.use(`${API_PREFIX}/payments`, paymentRoutes);
router.use(`${API_PREFIX}/coupons`, couponRoutes);
router.use(`${API_PREFIX}/stores`, storeRoutes);
router.use(`${API_PREFIX}/categories`, categoryRoutes);
router.use(`${API_PREFIX}/ads`, adRoutes);
router.use(`${API_PREFIX}/sliders`, sliderRoutes);
router.use(`${API_PREFIX}/inventory`, inventoryRoutes);
router.use(`${API_PREFIX}/assets`, assetProxyRoutes);

export default router;
