// This file bridges the shared data with the new modular structure.
export type { Product } from '../../storeProducts';
export { 
  allStoreProducts, 
  getStoreProducts as getProductsByStore,
  getDiscountedProducts,
  getNewProducts as getLatestProducts
} from '../../allStoreProducts';

// Helper for backward compatibility
export const getProductsByTag = (tag: string) => {
  const { allStoreProducts } = require('../../allStoreProducts');
  return allStoreProducts.filter((p: any) => p.tags.includes(tag));
};
