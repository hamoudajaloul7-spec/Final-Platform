import { getApiBase } from './apiConfig';

const SUPABASE_PROJECT_ID = 'wbakbuqvdbmweujkbzxn';
const BUCKET_NAME = 'ishro-assets';
const SUPABASE_PUBLIC_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${BUCKET_NAME}`;

export const getProxyImageUrl = (
  imagePath: string,
  storeSlug?: string,
  imageType: 'products' | 'sliders' | 'logo' = 'products'
): string => {
  if (!imagePath) return '';

  // 1. If it's already an absolute URL or data URI, return it
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }

  // 2. Handle known local asset paths
  if (imagePath.startsWith('/assets/') || 
      imagePath.startsWith('/AdsForms/') || 
      imagePath.startsWith('/data/') || 
      imagePath.startsWith('/logo-brands/')) {
    return imagePath;
  }

  // 3. Performance Hack: Direct Supabase URL for uploaded assets
  // This bypasses the backend proxy and reduces latency by 90%+
  if (!imagePath.startsWith('/') && imagePath.includes('.')) {
    return `${SUPABASE_PUBLIC_URL}/${imagePath}`;
  }

  const base = getApiBase();
  if (base) {
    // Ensure relative paths from backend are prefixed
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${base}${cleanPath}`;
  }

  return imagePath;
};

export const convertProductImages = (
  images: string[] | undefined,
  storeSlug: string
): string[] => {
  if (!images || images.length === 0) return [];
  
  return images.map(img => getProxyImageUrl(img, storeSlug, 'products'));
};
