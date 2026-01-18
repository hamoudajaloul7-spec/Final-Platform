import { STORES_CONFIG, getStoreConfig, getStoreProducts, getStoreSliders, type StoreConfigProduct, type SliderBanner } from '@/config/storeConfig';
import type { Product } from '@/data/storeProducts';

export interface StoreData {
  config: ReturnType<typeof getStoreConfig>;
  products: Product[];
  sliders: SliderBanner[];
}

export function convertConfigProductToProduct(configProduct: StoreConfigProduct): Product {
  const orderedImages = (configProduct.images || [])
    .map((image, index) => ({
      ...image,
      order: typeof image.order === 'number' ? image.order : index,
    }))
    .sort((a, b) => a.order - b.order)
    .map((img) => img.url);

  return {
    ...configProduct,
    images: orderedImages,
  };
}

export function normalizeApiProduct(apiProduct: any): Product {
  const inStock = apiProduct.inStock ?? apiProduct.isAvailable ?? true;
  
  return {
    id: apiProduct.id || 0,
    storeId: apiProduct.storeId || 0,
    name: apiProduct.name || '',
    description: apiProduct.description || '',
    price: apiProduct.price ?? 0,
    originalPrice: apiProduct.originalPrice ?? apiProduct.price ?? 0,
    images: Array.isArray(apiProduct.images) ? apiProduct.images : [],
    sizes: Array.isArray(apiProduct.sizes) ? apiProduct.sizes : [],
    availableSizes: Array.isArray(apiProduct.availableSizes) ? apiProduct.availableSizes : [],
    colors: Array.isArray(apiProduct.colors) ? apiProduct.colors : [],
    rating: apiProduct.rating ?? 0,
    reviews: apiProduct.reviews ?? 0,
    views: apiProduct.views ?? 0,
    likes: apiProduct.likes ?? 0,
    orders: apiProduct.orders ?? 0,
    category: apiProduct.category || '',
    inStock: inStock,
    isAvailable: inStock,
    tags: Array.isArray(apiProduct.tags) ? apiProduct.tags : [],
    quantity: typeof apiProduct.quantity === 'number' ? apiProduct.quantity : (inStock ? 1 : 0),
    badge: apiProduct.badge,
    expiryDate: apiProduct.expiryDate,
    endDate: apiProduct.endDate,
  };
}

export function loadStoreData(storeSlug: string): StoreData | null {
  const config = getStoreConfig(storeSlug);
  
  if (!config) {
    return null;
  }

  const configProducts = getStoreProducts(storeSlug);
  const products = configProducts.map(convertConfigProductToProduct);
  const sliders = getStoreSliders(storeSlug);

  return {
    config,
    products,
    sliders,
  };
}

export function getAllStoresSlugs(): string[] {
  return Object.keys(STORES_CONFIG);
}

export function formatSliderHeight(mobile: number, desktop: number): string {
  return `h-[${mobile}px] md:h-[${desktop}px]`;
}
