import { getApiBase } from './apiConfig';

export const getProxyImageUrl = (
  imagePath: string,
  storeSlug?: string,
  imageType: 'products' | 'sliders' | 'logo' = 'products'
): string => {
  if (!imagePath) return '';

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }

  if (imagePath.startsWith('/assets/') || imagePath.startsWith('/AdsForms/')) {
    return imagePath;
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
