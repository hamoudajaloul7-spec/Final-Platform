import React, { useState, useEffect } from 'react';

interface Ad {
  id: string;
  templateId: string;
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  isActive: boolean;
  placement?: 'banner' | 'between_products';
  createdAt: string;
  views: number;
  clicks: number;
  storeId?: number;
  textPosition?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  textColor?: string;
  textFont?: string;
  mainTextSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  subTextSize?: 'xs' | 'sm' | 'base';
}

interface StoreAdsProps {
  storeId?: string | number;
  className?: string;
}

const getTextPositionClass = (position?: string): string => {
  switch (position) {
    case 'top-left':
      return 'top-0 left-0 text-right pt-2 pr-4';
    case 'top-center':
      return 'top-0 left-1/2 -translate-x-1/2 text-center pt-2 px-4';
    case 'top-right':
      return 'top-0 right-0 text-left pt-2 pl-4';
    case 'center-left':
      return 'top-1/2 -translate-y-1/2 left-0 text-right px-2 pr-4';
    case 'center':
      return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center px-4';
    case 'center-right':
      return 'top-1/2 -translate-y-1/2 right-0 text-left px-2 pl-4';
    case 'bottom-left':
      return 'bottom-0 left-0 text-right pb-2 pr-4';
    case 'bottom-center':
      return 'bottom-0 left-1/2 -translate-x-1/2 text-center pb-2 px-4';
    case 'bottom-right':
      return 'bottom-0 right-0 text-left pb-2 pl-4';
    default:
      return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center px-4';
  }
};

const getMainTextSizeClass = (size?: string): string => {
  switch (size) {
    case 'sm':
      return 'text-sm';
    case 'base':
      return 'text-base';
    case 'lg':
      return 'text-lg';
    case 'xl':
      return 'text-xl';
    case '2xl':
      return 'text-2xl';
    default:
      return 'text-lg';
  }
};

const getSubTextSizeClass = (size?: string): string => {
  switch (size) {
    case 'xs':
      return 'text-xs';
    case 'sm':
      return 'text-sm';
    case 'base':
      return 'text-base';
    default:
      return 'text-base';
  }
};

const getFontClass = (font?: string): string => {
  switch (font) {
    case 'Cairo-Light':
      return 'font-light';
    case 'Cairo-ExtraLight':
      return 'font-extralight';
    case 'Cairo-Regular':
      return 'font-normal';
    case 'Cairo-Medium':
      return 'font-medium';
    case 'Cairo-SemiBold':
      return 'font-semibold';
    case 'Cairo-Bold':
      return 'font-bold';
    case 'Cairo-ExtraBold':
      return 'font-extrabold';
    case 'Cairo-Black':
      return 'font-black';
    default:
      return 'font-semibold';
  }
};

const StoreAds: React.FC<StoreAdsProps> = ({ storeId, className = '' }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [bannerAds, setBannerAds] = useState<Ad[]>([]);
  const [betweenProductsAds, setBetweenProductsAds] = useState<Ad[]>([]);

  useEffect(() => {
    loadAds();

    const handleAdsUpdate = (event: CustomEvent) => {
      loadAds();
    };

    window.addEventListener('storeAdsUpdated', handleAdsUpdate as EventListener);

    return () => {
      window.removeEventListener('storeAdsUpdated', handleAdsUpdate as EventListener);
    };
  }, [storeId]);

  const loadAds = async () => {
    try {
      if (!storeId) {
        return;
      }

      const isLocalhost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
      const apiUrl = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:5000/api' : '/api');
      const response = await fetch(`${apiUrl}/ads/store/${storeId}`);
      
      if (response.ok) {
        const result = await response.json();
        
        const adsData = Array.isArray(result.data) ? result.data : [];
        const activeAds = adsData.filter((ad: Ad) => ad.isActive === true);
        
        const bannerAds = activeAds.filter(ad => ad.placement === 'banner' || ad.placement === 'floating' || !ad.placement);
        const betweenAds = activeAds.filter(ad => ad.placement === 'between_products' || ad.placement === 'grid');
        
        setAds(activeAds);
        setBannerAds(bannerAds);
        setBetweenProductsAds(betweenAds);
        localStorage.setItem(`eshro_store_ads_${storeId}`, JSON.stringify(activeAds));
        return;
      }
    } catch (error) {
      // Error loading ads from API - will use localStorage fallback
    }

    const storageKey = `eshro_store_ads_${storeId}`;
    const savedAds = localStorage.getItem(storageKey);
    if (savedAds) {
      try {
        const parsedAds = JSON.parse(savedAds);
        const activeAds = parsedAds.filter((ad: Ad) => ad.isActive === true);
        setAds(activeAds);
        setBannerAds(activeAds.filter(ad => ad.placement === 'banner' || ad.placement === 'floating' || !ad.placement));
        setBetweenProductsAds(activeAds.filter(ad => ad.placement === 'between_products' || ad.placement === 'grid'));
      } catch (error) {
        // Error parsing saved ads
      }
    }
  };

  const handleAdClick = (ad: Ad) => {
    if (ad.linkUrl) {
      if (ad.linkUrl.startsWith('http')) {
        window.open(ad.linkUrl, '_blank');
      } else {
        window.location.href = ad.linkUrl;
      }
    }
  };

  if (bannerAds.length === 0 && betweenProductsAds.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {bannerAds.length > 0 && (
        <div className="space-y-4">
          {bannerAds.map((ad, index) => {
            const adKey = ad.id || `banner-ad-${index}-${ad.title}`;
            const textColor = ad.textColor || '#ffffff';
            const positionClass = getTextPositionClass(ad.textPosition);
            const mainSizeClass = getMainTextSizeClass(ad.mainTextSize);
            const subSizeClass = getSubTextSizeClass(ad.subTextSize);
            const fontClass = getFontClass(ad.textFont);
            
            return (
            <div
              key={adKey}
              className="relative w-full h-40 md:h-48 lg:h-56 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => handleAdClick(ad)}
            >
              {ad.imageUrl ? (
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-200 to-purple-200">
                  <div className="text-center text-white">
                    <div className="text-sm md:text-base font-semibold mb-2">{ad.title}</div>
                    <div className="text-xs md:text-sm opacity-90">{ad.description}</div>
                  </div>
                </div>
              )}

              {ad.imageUrl && (
                <>
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all" />
                  <div className={`absolute ${positionClass} p-4`} style={{ color: textColor, maxWidth: '90%' }}>
                    <h3 className={`${fontClass} ${mainSizeClass} md:text-xl mb-1 drop-shadow-lg`}>{ad.title}</h3>
                    {ad.description && (
                      <p className={`${fontClass} ${subSizeClass} md:text-base opacity-90 px-2 line-clamp-2 drop-shadow-lg`}>{ad.description}</p>
                    )}
                  </div>
                </>
              )}
            </div>
            );
          })}
        </div>
      )}

      {betweenProductsAds.length > 0 && (
        <div className="space-y-4" data-placement="between-products">
          {betweenProductsAds.map((ad, index) => {
            const adKey = ad.id || `between-ad-${index}-${ad.title}`;
            const textColor = ad.textColor || '#000000';
            const mainSizeClass = getMainTextSizeClass(ad.mainTextSize);
            const subSizeClass = getSubTextSizeClass(ad.subTextSize);
            const fontClass = getFontClass(ad.textFont);
            
            return (
            <div
              key={adKey}
              className="w-full bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleAdClick(ad)}
            >
              <div className="flex flex-col md:flex-row items-center p-4 md:p-6 gap-4">
                {ad.imageUrl && (
                  <div className="w-full md:w-32 h-32 md:h-24 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <div className="flex-1 text-center md:text-right" style={{ color: textColor }}>
                  <h4 className={`${fontClass} ${mainSizeClass} md:text-base mb-1`}>{ad.title}</h4>
                  {ad.description && (
                    <p className={`${fontClass} ${subSizeClass} md:text-sm line-clamp-2`} style={{ color: textColor, opacity: 0.8 }}>{ad.description}</p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition">
                    عرض
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StoreAds;
