import { nawaemProducts } from '@/data/stores/nawaem/nawamProducts';
import { sheirineProducts } from '@/data/stores/sheirine/products';
import { prettyProducts } from '@/data/stores/pretty/products';
import { deltaProducts } from '@/data/stores/delta-store/products';
import { magnaBeautyProducts } from '@/data/stores/magna-beauty/products';
import { indeeshProducts } from '@/data/stores/indeesh/products';

const storeProductMap: Record<string, any[]> = {
  nawaem: nawaemProducts || [],
  sheirine: sheirineProducts || [],
  pretty: prettyProducts || [],
  'delta-store': deltaProducts || [],
  'magna-beauty': magnaBeautyProducts || [],
  indeesh: indeeshProducts || [],
};

export function getStoreProducts(storeSlug: string): any[] {
  const products = storeProductMap[storeSlug];
  return Array.isArray(products) && products.length > 0 ? products : [];
}

export function getAllStoreProducts(): Record<string, any[]> {
  return storeProductMap;
}

export function hasStoreProducts(storeSlug: string): boolean {
  const products = getStoreProducts(storeSlug);
  return products.length > 0;
}

export function getProductsByStore(storeId: number | string, products: any[]): any[] {
  if (!products || !Array.isArray(products)) return [];
  return products.filter(p => {
    const pStoreId = p.storeId || p.store_id;
    return pStoreId === storeId || (typeof pStoreId === 'string' && pStoreId === storeId.toString());
  });
}
