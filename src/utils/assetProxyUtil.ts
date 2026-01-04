export const getProxyImageUrl = (
  imagePath: string,
  storeSlug?: string,
  imageType: 'products' | 'sliders' | 'logo' = 'products'
): string => {
  if (!imagePath) return '';

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  if (!storeSlug) return imagePath;

  if (!imagePath.startsWith('/assets/')) {
    return imagePath;
  }

  const parts = imagePath.split('/');
  if (parts.length < 4) {
    return imagePath;
  }

  const fileName = parts.slice(4).join('/');
  return `${apiUrl}/assets-proxy/${storeSlug}/${imageType}/${fileName}`;
};

export const convertProductImages = (
  images: string[] | undefined,
  storeSlug: string
): string[] => {
  if (!images || images.length === 0) return [];
  
  return images.map(img => getProxyImageUrl(img, storeSlug, 'products'));
};
