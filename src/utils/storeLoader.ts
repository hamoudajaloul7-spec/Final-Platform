import type { Product } from '@/data/storeProducts';
import { nawaemProducts } from '@/data/stores/nawaem/products';
import { sheirineProducts } from '@/data/stores/sheirine/products';
import { prettyProducts } from '@/data/stores/pretty/products';
import { deltaProducts } from '@/data/stores/delta-store/products';
import { magnaBeautyProducts } from '@/data/stores/magna-beauty/products';
import { indeeshProducts } from '@/data/stores/indeesh/products';

const storesProductsMap: Record<string, Product[]> = {
  'nawaem': nawaemProducts,
  'sheirine': sheirineProducts,
  'pretty': prettyProducts,
  'delta-store': deltaProducts,
  'magna-beauty': magnaBeautyProducts,
  'indeesh': indeeshProducts
};

interface StoreData {
  id: number;
  storeId: number;
  slug: string;
  name: string;
  nameAr: string;
  nameEn: string;
  description: string;
  icon: string;
  color: string;
  logo: string;
  categories: string[];
  products: Product[];
  sliderImages?: any[];
}

interface StoreIndex {
  slug: string;
  name: string;
  nameAr: string;
  nameEn: string;
  description: string;
  logo: string;
  categories: string[];
  productsCount: number;
  lastUpdated: string;
}

const cachedStores: Map<string, StoreData> = new Map();
let cachedStoreIndex: StoreIndex[] = [];
let cacheInitialized = false;

function getApiBase(): string {
  if (typeof window !== 'undefined' && (window as any).__API_BASE__) {
    return (window as any).__API_BASE__;
  }
  
  const envApiUrl = import.meta.env.VITE_API_URL;
  
  // If VITE_API_URL is an absolute URL, use it
  if (envApiUrl && envApiUrl.startsWith('http')) {
    return envApiUrl.replace('/api', '');
  }
  
  // If we're on localhost, use local backend
  if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return 'http://localhost:5000';
  }
  
  // Otherwise use relative path (empty string means current domain)
  return '';
}

function normalizeImagePaths(data: any, apiBase: string, slug: string, isServedStatic: boolean): any {
  if (!data) return data;
  
  if (Array.isArray(data.products)) {
    data.products = data.products.map((product: any) => ({
      ...product,
      images: Array.isArray(product.images) 
        ? product.images.map((img: string) => {
            if (img && !img.startsWith('http')) {
              return isServedStatic ? img : apiBase + img;
            }
            return img;
          })
        : product.images
    }));
  }
  
  if (Array.isArray(data.sliderImages)) {
    data.sliderImages = data.sliderImages.map((slider: any) => ({
      ...slider,
      image: (slider.image && !slider.image.startsWith('http'))
        ? isServedStatic ? slider.image : apiBase + slider.image
        : slider.image
    }));
  }
  
  if (data.logo && !data.logo.startsWith('http')) {
    data.logo = isServedStatic ? data.logo : apiBase + data.logo;
  }
  
  return data;
}



function loadStoreFromLocalStorage(slug: string): StoreData | null {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null;
  }

  try {
    const storeFilesKey = `eshro_store_files_${slug}`;
    const storeKey = `store_${slug}`;
    
    let storeFilesData = localStorage.getItem(storeFilesKey);
    
    if (!storeFilesData) {
      const legacyStore = localStorage.getItem(storeKey);
      if (legacyStore) {
        try {
          const legacyParsed = JSON.parse(legacyStore);
          storeFilesData = JSON.stringify({ storeData: legacyParsed });
        } catch {
          return null;
        }
      } else {
        return null;
      }
    }

    const parsed = JSON.parse(storeFilesData);
    if (!parsed.storeData) {
      return null;
    }

    const storeData = parsed.storeData;
    const productsData = localStorage.getItem(`store_products_${slug}`);
    const slidersData = localStorage.getItem(`store_sliders_${slug}`);

    const finalStoreData: StoreData = {
      id: storeData.id || storeData.storeId || 0,
      storeId: storeData.storeId || storeData.id || 0,
      slug: slug,
      name: storeData.name || storeData.storeName || slug,
      nameAr: storeData.nameAr || storeData.storeName || slug,
      nameEn: storeData.nameEn || storeData.storeNameEn || slug,
      description: storeData.description || '',
      icon: storeData.icon || '🏪',
      color: storeData.color || 'from-blue-400 to-blue-600',
      logo: storeData.logo || '/assets/default-store.png',
      categories: storeData.categories || [],
      products: productsData ? JSON.parse(productsData) : storeData.products || [],
      sliderImages: slidersData ? JSON.parse(slidersData) : storeData.sliderImages || []
    };

    return finalStoreData;
  } catch (error) {
    return null;
  }
}

async function initializeCache(): Promise<void> {
  if (cacheInitialized) return;
  cachedStoreIndex = Object.keys(storesProductsMap).map(slug => ({
    slug: slug,
    name: slug,
    nameAr: slug,
    nameEn: slug,
    description: '',
    logo: '/assets/default-store.png',
    categories: [],
    productsCount: storesProductsMap[slug]?.length || 0,
    lastUpdated: new Date().toISOString()
  }));
  cacheInitialized = true;
}

export async function loadStoreBySlug(slug: string): Promise<StoreData | null> {
  if (cachedStores.has(slug)) {
    return cachedStores.get(slug) || null;
  }
  
  const products = storesProductsMap[slug];
  
  if (products && Array.isArray(products)) {
    const storeData: StoreData = {
      id: 0,
      storeId: 0,
      slug: slug,
      name: slug,
      nameAr: slug,
      nameEn: slug,
      description: '',
      icon: '🏪',
      color: 'from-blue-400 to-blue-600',
      logo: '/assets/default-store.png',
      categories: [],
      products: products,
      sliderImages: []
    };
    
    cachedStores.set(slug, storeData);
    return storeData;
  }
  
  const localStoreData = loadStoreFromLocalStorage(slug);
  if (localStoreData) {
    cachedStores.set(slug, localStoreData);
    return localStoreData;
  }

  // Fallback to API if not found locally
  try {
    const apiBase = getApiBase();
    const response = await fetch(`${apiBase}/api/stores/public/${slug}`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.store) {
        const storeData: StoreData = {
          id: data.store.id,
          storeId: data.store.id,
          slug: data.store.slug,
          name: data.store.name,
          nameAr: data.store.name,
          nameEn: data.store.slug,
          description: data.store.description || '',
          icon: '🏪',
          color: 'from-blue-400 to-blue-600',
          logo: data.store.logo || '/assets/default-store.png',
          categories: data.store.categories || data.store.category ? [data.store.category] : [],
          products: data.products || [],
          sliderImages: data.sliders || []
        };
        
        // Normalize image paths if they are not absolute
        const normalized = normalizeImagePaths(storeData, apiBase, slug, false);
        cachedStores.set(slug, normalized);
        return normalized;
      }
    }
  } catch (error) {
    console.warn(`Failed to fetch store ${slug} from API:`, error);
  }

  return null;
}

export async function getStoreProducts(slug: string): Promise<Product[]> {
  const store = await loadStoreBySlug(slug);
  return store?.products || [];
}

export async function getStoreSliderImages(slug: string): Promise<any[]> {
  const store = await loadStoreBySlug(slug);
  return store?.sliderImages || [];
}

export async function getStoreConfig(slug: string): Promise<any> {
  const store = await loadStoreBySlug(slug);
  if (!store) return null;
  
  return {
    storeId: store.storeId,
    slug: store.slug,
    name: store.name,
    nameAr: store.nameAr,
    nameEn: store.nameEn,
    description: store.description,
    icon: store.icon,
    color: store.color,
    logo: store.logo,
    categories: store.categories
  };
}

export async function getAllStoreProducts(): Promise<Product[]> {
  const allProducts: Product[] = [];
  
  Object.values(storesProductsMap).forEach(products => {
    if (Array.isArray(products)) {
      allProducts.push(...products);
    }
  });
  
  return allProducts;
}

export function clearStoreCache(): void {
  cachedStores.clear();
  cachedStoreIndex = [];
  cacheInitialized = false;
}
