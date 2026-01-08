export const normalizeSliderImagePath = (storeSlug: string, imagePath: string): string => {
  if (!imagePath) return imagePath;

  if (storeSlug === 'delta-store') {
    return imagePath.replace(/\/assets\/delta-store\/sliders\/slider(\d+)\.jpg$/i, '/assets/delta-store/sliders/slider$1.webp');
  }

  if (storeSlug === 'magna-beauty') {
    return imagePath
      .replace(/\/assets\/magna-beauty\/sliders\/slider(\d+)\.jpg$/i, '/assets/magna-beauty/sliders/slide$1.webp')
      .replace(/\/assets\/magna-beauty\/sliders\/slider(\d+)\.webp$/i, '/assets/magna-beauty/sliders/slide$1.webp');
  }

  return imagePath;
};
