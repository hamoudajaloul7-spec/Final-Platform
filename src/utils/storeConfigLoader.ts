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
  // التحقق من التوفر من عدة حقول محتملة
  let inStock = true;
  let quantity = 1;

  // التحقق من quantity أولاً - هذا أهم مؤشر للتوفر
  if (typeof apiProduct.quantity === 'number') {
    quantity = apiProduct.quantity;
    inStock = quantity > 0;
  } else if (typeof apiProduct.stock === 'number') {
    quantity = apiProduct.stock;
    inStock = quantity > 0;
  } else if (typeof apiProduct.available_quantity === 'number') {
    quantity = apiProduct.available_quantity;
    inStock = quantity > 0;
  } else if (typeof apiProduct.availableQuantity === 'number') {
    quantity = apiProduct.availableQuantity;
    inStock = quantity > 0;
  }

  // التحقق من حقول التوفر الصريحة - تتجاوز quantity إذا كانت محددة
  if (apiProduct.inStock !== undefined && apiProduct.inStock !== null) {
    const inStockValue = !!apiProduct.inStock;
    // إذا كان inStock محددة صراحة، استخدمها
    inStock = inStockValue;
    // إذا كانت quantity غير محددة، اعتبرها 1 إذا كان inStock = true
    if (quantity === 1 && !inStockValue) {
      quantity = 0;
    }
  } else if (apiProduct.isAvailable !== undefined && apiProduct.isAvailable !== null) {
    inStock = !!apiProduct.isAvailable;
    if (quantity === 1 && !inStock) {
      quantity = 0;
    }
  } else if (apiProduct.availability !== undefined && apiProduct.availability !== null) {
    inStock = !!apiProduct.availability;
    if (quantity === 1 && !inStock) {
      quantity = 0;
    }
  } else if (apiProduct.status !== undefined && typeof apiProduct.status === 'string') {
    const statusLower = apiProduct.status.toLowerCase().trim();
    const isUnavailable = statusLower === 'unavailable' || statusLower === 'out_of_stock' || statusLower === 'out-of-stock';
    inStock = !isUnavailable;
    if (quantity === 1 && isUnavailable) {
      quantity = 0;
    }
  }
  
  // قاعدة نهائية: إذا كانت الكمية 0 أو سالب، المنتج غير متوفر
  if (quantity <= 0) {
    inStock = false;
  }

  return {
    id: apiProduct.id || 0,
    storeId: apiProduct.storeId || 0,
    name: apiProduct.name || '',
    description: apiProduct.description || '',
    price: apiProduct.price ?? 0,
    originalPrice: apiProduct.originalPrice ?? apiProduct.price ?? 0,
    images: Array.isArray(apiProduct.images) ? apiProduct.images : [],
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
