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

  // 1. If it's already a data URI, return it
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }

  const base = getApiBase();
  const getProxyUrl = (src: string) => {
    const apiUrl = base ? `${base}/api` : '/api';
    return `${apiUrl}/assets/proxy?src=${encodeURIComponent(src)}`;
  };

  // 2. If it's an absolute URL, use the proxy for external ones to get caching/optimization
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    // If it's already from our own storage or domain, return as is
    if (imagePath.includes(SUPABASE_PROJECT_ID) || (base && imagePath.startsWith(base))) {
      return imagePath;
    }
    // Otherwise, proxy it
    return getProxyUrl(imagePath);
  }

  // 3. Handle known local asset paths
  if (imagePath.startsWith('/assets/') || 
      imagePath.startsWith('/AdsForms/') || 
      imagePath.startsWith('/data/') || 
      imagePath.startsWith('/logo-brands/')) {
    return imagePath;
  }

  // 4. Performance: Direct Supabase URL for uploaded assets
  if (!imagePath.startsWith('/') && imagePath.includes('.')) {
    // إذا كان المسار يحتوي بالفعل على هيكل المجلدات الصحيح، نستخدمه مباشرة
    if (imagePath.includes('stores/') && imagePath.includes('/sliders/')) {
      return `${SUPABASE_PUBLIC_URL}/${imagePath}`;
    }
    
    if (imagePath.includes('stores/') && imagePath.includes('/products/')) {
      return `${SUPABASE_PUBLIC_URL}/${imagePath}`;
    }

    // إذا كان المسار يبدأ بالمجلد الأساسي (sliders/ أو products/)
    if (imagePath.startsWith('sliders/') || imagePath.startsWith('products/') || imagePath.startsWith('logo/')) {
      return `${SUPABASE_PUBLIC_URL}/${imagePath}`;
    }

    // إذا كان مجرد اسم ملف بسيط، نقوم ببناء المسار الكامل بناءً على نوع الصورة والمتجر
    const folder = imageType === 'products' ? 'products' : (imageType === 'sliders' ? 'sliders' : 'logo');
    if (storeSlug) {
      return `${SUPABASE_PUBLIC_URL}/${folder}/stores/${storeSlug}/${folder}/${imagePath}`;
    }
    
    // كخيار أخير، نضعه في المجلد العام للنوع
    return `${SUPABASE_PUBLIC_URL}/${folder}/${imagePath}`;
  }

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
