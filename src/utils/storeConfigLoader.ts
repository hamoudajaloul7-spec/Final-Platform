import { STORES_CONFIG, getStoreConfig, getStoreProducts, getStoreSliders, type StoreConfigProduct, type SliderBanner } from '@/config/storeConfig';
import type { Product } from '@/data/storeProducts';
import { getProxyImageUrl } from './assetProxyUtil';

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
  // Final stock logic: quantity has priority; fall back to explicit inStock/isAvailable/availability/status
  let inStock = true;
  let quantity = 1;

  // 1) derive quantity from potential fields
  if (typeof apiProduct.quantity === 'number') {
    quantity = apiProduct.quantity;
  } else if (typeof apiProduct.stock === 'number') {
    quantity = apiProduct.stock;
  } else if (typeof apiProduct.available_quantity === 'number') {
    quantity = apiProduct.available_quantity;
  } else if (typeof apiProduct.availableQuantity === 'number') {
    quantity = apiProduct.availableQuantity;
  }
  // 2) base stock on quantity
  inStock = quantity > 0;

  // 3) explicit flags override only if present
  if (apiProduct.inStock !== undefined && apiProduct.inStock !== null) {
    inStock = !!apiProduct.inStock;
  } else if (apiProduct.isAvailable !== undefined && apiProduct.isAvailable !== null) {
    inStock = !!apiProduct.isAvailable;
  } else if (apiProduct.availability !== undefined && apiProduct.availability !== null) {
    inStock = !!apiProduct.availability;
  } else if (apiProduct.status !== undefined && typeof apiProduct.status === 'string') {
    const status = apiProduct.status.toLowerCase().trim();
    const isUnavailable = status === 'unavailable' || status === 'out_of_stock' || status === 'out-of-stock';
    inStock = !isUnavailable;
    if (isUnavailable) quantity = 0;
  }
  if (quantity <= 0) inStock = false;

  const productImages = Array.isArray(apiProduct.images) ? apiProduct.images : [];
  const slug = apiProduct.storeSlug || '';

  return {
    id: apiProduct.id || 0,
    storeId: apiProduct.storeId || 0,
    name: apiProduct.name || '',
    description: apiProduct.description || '',
    price: apiProduct.price ?? 0,
    originalPrice: apiProduct.originalPrice ?? apiProduct.price ?? 0,
    images: productImages.map((img: string) => getProxyImageUrl(img, slug, 'products')),
    sizes: Array.isArray(apiProduct.sizes) ? apiProduct.sizes : [],
    availableSizes: Array.isArray(apiProduct.availableSizes) ? apiProduct.availableSizes : (Array.isArray(apiProduct.sizes) ? apiProduct.sizes : []),
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
    quantity: Math.max(0, quantity),
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
