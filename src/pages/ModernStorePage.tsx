import React, { useEffect, useState } from 'react';
import LazyImage from '@/components/LazyImage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight,
  Bell,
  Eye,
  Facebook,
  Globe,
  Heart,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Share2,
  ShoppingCart,
  Star,
  TrendingUp
} from 'lucide-react';
import { storesData } from '@/data/ecommerceData';
import { allStoreProducts } from '@/data/allStoreProducts';
import { convertConfigProductToProduct } from '@/utils/storeConfigLoader';
import { getStoreConfig } from '@/config/storeConfig';
import type { Product } from '@/data/storeProducts';
import EnhancedNotifyModal from '@/components/EnhancedNotifyModal';
import ShareMenu from '@/components/ShareMenu';
import UnifiedStoreSlider from '@/components/UnifiedStoreSlider';
import SheirineSlider from '@/data/stores/sheirine/Slider';
import { getDefaultProductImageSync, handleImageError } from '@/utils/imageUtils';
import { getTagColor, calculateBadge } from '@/utils/badgeCalculator';
import { getProxyImageUrl, convertProductImages } from '@/utils/assetProxyUtil';

const getDynamicStores = () => {
  try {
    const stored = localStorage.getItem('eshro_stores');
    if (!stored) return [];

    const stores = JSON.parse(stored);
    const completedStores = stores.filter((store: any) => store.setupComplete === true);
    return completedStores.map((store: any) => ({
      id: store.id,
      name: store.nameAr,
      slug: store.subdomain,
      description: store.description,
      logo: '/assets/default-store.png',
      categories: store.categories,
      url: `/${store.subdomain}`,
      endpoints: {},
      social: {},
      isActive: true
    }));
  } catch (error) {
    return [];
  }
};

interface ModernStorePageProps {
  storeSlug: string;
  onBack: () => void;
  onProductClick: (productId: number) => void;
  onAddToCart: (product: Product, size: string, color: string, quantity: number) => void;
  onToggleFavorite: (productId: number) => void;
  onNotifyWhenAvailable: (productId: number) => void;
  onSubmitNotification?: (product: Product, notificationData: any) => void;
  favorites: number[];
}

const ModernStorePage: React.FC<ModernStorePageProps> = ({
  storeSlug,
  onBack,
  onProductClick,
  onAddToCart,
  onToggleFavorite,
  onNotifyWhenAvailable,
  onSubmitNotification,
  favorites = []
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [currentView, setCurrentView] = useState<'all' | 'discounts' | 'new'>('all');
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dynamicStoreData, setDynamicStoreData] = useState<any>(null);
  const [loadingStore, setLoadingStore] = useState(false);
  const [storeAds, setStoreAds] = useState<any[]>([]);
  const [adCarouselSlide, setAdCarouselSlide] = useState(0);
  const [isAdHovering, setIsAdHovering] = useState(false);

  const getDynamicStores = () => {
    try {
      const stored = localStorage.getItem('eshro_stores');
      if (!stored) return [];

      const newStores = JSON.parse(stored);
      // Only show stores that have completed setup
      const completedStores = newStores.filter((store: any) => store.setupComplete === true);
      return completedStores.map((store: any) => {
        const slug = store.subdomain;
        const staticStore = storesData.find(s => s.slug === slug);
        const logo = (store.logo && store.logo.trim() !== '') ? store.logo : staticStore?.logo || null;
        
        return {
          id: store.id || Date.now(),
          name: store.nameAr,
          slug,
          description: store.description,
          logo,
          categories: store.categories || [],
          url: `/${store.subdomain}`,
          endpoints: {},
          social: {},
          isActive: true
        };
      });
    } catch (error) {
      return [];
    }
  };

  const allStores = (() => {
    const storeMap = new Map<string, any>();
    const staticSlugs = new Set<string>();
    
    storesData.forEach((store: any) => {
      storeMap.set(store.slug, store);
      staticSlugs.add(store.slug);
    });
    
    getDynamicStores().forEach((store: any) => {
      if (!staticSlugs.has(store.slug)) {
        storeMap.set(store.slug, store);
      }
    });
    
    return Array.from(storeMap.values());
  })();
  
  const store = allStores.find(s => s.slug === storeSlug);

  const getStoreProducts = (storeSlug: string, storeId?: number) => {
    try {
      const stored = localStorage.getItem(`store_products_${storeSlug}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          
          // Validate parsed data integrity
          if (parsed && Array.isArray(parsed)) {
            // Additional validation for product structure
            const validProducts = parsed.filter(product => 
              product && 
              typeof product === 'object' && 
              product.id && 
              product.name && 
              Array.isArray(product.images)
            );
            
            if (validProducts.length === parsed.length) {
              return parsed; // Data is valid
            } else {
              localStorage.removeItem(`store_products_${storeSlug}`);
              localStorage.removeItem(`eshro_store_files_${storeSlug}`);
            }
          }
        } catch (parseError) {
          localStorage.removeItem(`store_products_${storeSlug}`);
          localStorage.removeItem(`eshro_store_files_${storeSlug}`);
        }
      }
    } catch (error) {
      // Clear potentially corrupted data
      localStorage.removeItem(`store_products_${storeSlug}`);
    }
    return [];
  };

  let storeProducts: Product[] = [];
  const storeConfig = store ? getStoreConfig(store.slug) : null;

  if (store) {
    if (dynamicStoreData?.products && dynamicStoreData.products.length > 0) {
      storeProducts = dynamicStoreData.products;
    } else {
      const dynamicProducts = getStoreProducts(store.slug, store.id);
      if (dynamicProducts.length > 0) {
        storeProducts = dynamicProducts;
      } else if (storeConfig && storeConfig.products.length > 0) {
        storeProducts = storeConfig.products.map(convertConfigProductToProduct);
      } else {
        storeProducts = allStoreProducts.filter(p => p.storeId === store.id);
      }
    }
  }

  let displayProducts = storeProducts;
  if (currentView === 'discounts') {
    displayProducts = storeProducts.filter(p => p.tags.includes('تخفيضات'));
  } else if (currentView === 'new') {
    displayProducts = storeProducts.filter(p => p.tags.includes('جديد'));
  }

  const [sliderImages, setSliderImages] = useState<any[]>([]);

  useEffect(() => {
    const getSliderImages = () => {
      if (dynamicStoreData?.sliderImages && dynamicStoreData.sliderImages.length > 0) {
        return dynamicStoreData.sliderImages;
      }
      
      try {
        const newKey = `eshro_sliders_${storeSlug}`;
        const oldKey = `store_sliders_${storeSlug}`;
        
        let customSliders = localStorage.getItem(newKey);
        
        if (!customSliders) {
          const oldSliders = localStorage.getItem(oldKey);
          if (oldSliders) {
            try {
              const oldData = JSON.parse(oldSliders);
              const migrated = oldData.map((slide: any, idx: number) => ({
                id: slide.id || `slider_${Date.now()}_${idx}`,
                imageUrl: slide.image || slide.imageUrl || '',
                title: slide.title || '',
                subtitle: slide.subtitle || '',
                discount: slide.discount || '',
                buttonText: slide.buttonText || 'تسوق الآن',
                order: idx
              }));
              
              localStorage.setItem(newKey, JSON.stringify(migrated));
              localStorage.removeItem(oldKey);
              customSliders = localStorage.getItem(newKey);
            } catch (err) {
              // Migration failed
            }
          }
        }
        
        if (customSliders) {
          const sliders = JSON.parse(customSliders);
          if (sliders.length > 0) {
            return sliders;
          }
        }
      } catch (error) {
        // Silently ignore slider loading errors
      }

      const knownStores = ['nawaem', 'sheirine', 'pretty', 'delta-store', 'magna-beauty', 'indeesh'];
      if (!knownStores.includes(storeSlug)) {
        return [];
      }
      
      return storeProducts.slice(0, 5);
    };

    const images = getSliderImages();
    if (images.length > 0) {
      setSliderImages(images);
    }

    const handleSliderUpdate = (event: CustomEvent) => {
      if (event.detail.storeSlug === storeSlug) {
        const updatedImages = getSliderImages();
        if (updatedImages.length > 0) {
          setSliderImages(updatedImages);
        }
      }
    };

    window.addEventListener('storeSliderUpdated', handleSliderUpdate as EventListener);
    
    return () => {
      window.removeEventListener('storeSliderUpdated', handleSliderUpdate as EventListener);
    };
  }, [dynamicStoreData, storeSlug, storeProducts]);
  const [enhancedStore, setEnhancedStore] = useState(store);

  useEffect(() => {
    setEnhancedStore(store);
  }, [store]);

  useEffect(() => {
    const loadDynamicStoreData = async () => {
      const currentSlug = storeSlug;
      if (!currentSlug) return;
      
      setLoadingStore(true);
      try {
        // 1. Try to fetch from Public API first
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        try {
          const response = await fetch(`${apiUrl}/stores/public/${currentSlug}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              const { store: apiStore, products: apiProducts, sliders: apiSliders } = result.data;
              
              setEnhancedStore(prev => ({
                ...prev,
                ...apiStore,
                logo: apiStore.logo || prev?.logo || '/assets/default-store.png'
              }));

              setDynamicStoreData({
                products: apiProducts,
                sliderImages: apiSliders
              });

              setLoadingStore(false);
              return;
            }
          }
        } catch (apiError) {
          // Silent fallback
        }

        // 2. Fallback to Local Storage / Static Data
        await detectAndClearCacheCorruption(currentSlug);
        
        // Try localStorage first
        const stored = localStorage.getItem(`store_products_${currentSlug}`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setDynamicStoreData({ products: parsed, sliderImages: [] });
              setLoadingStore(false);
              return;
            }
          } catch (e) {
            // Invalid data, clear and continue
            localStorage.removeItem(`store_products_${currentSlug}`);
          }
        }
        
        // Try store config
        const storeConfig = getStoreConfig(currentSlug);
        if (storeConfig && storeConfig.products && storeConfig.products.length > 0) {
          const products = storeConfig.products.map(convertConfigProductToProduct);
          setDynamicStoreData({ products, sliderImages: [] });
        }
      } catch (error) {
        // Silent error handling
      } finally {
        setLoadingStore(false);
      }
    };
    
    loadDynamicStoreData();
    fetchAds();
  }, [storeSlug]);

  /**
   * Detect and clear cache corruption for a specific store
   * This prevents corrupted localStorage data from overriding correct backend data
   */
  const detectAndClearCacheCorruption = async (storeSlug: string) => {
    try {

      
      // Keys that might contain corrupted data
      const cacheKeys = [
        `store_products_${storeSlug}`,
        `eshro_store_files_${storeSlug}`,
        `store_sliders_${storeSlug}`
      ];
      
      let corruptedKeysFound = 0;
      
      for (const key of cacheKeys) {
        try {
          const cachedData = localStorage.getItem(key);
          if (cachedData) {
            const parsed = JSON.parse(cachedData);
            
            // Check for common corruption patterns
            if (!parsed || 
                typeof parsed !== 'object' || 
                (Array.isArray(parsed) && parsed.length === 0) ||
                (parsed.products && !Array.isArray(parsed.products))) {
              

              localStorage.removeItem(key);
              corruptedKeysFound++;
            }
          }
        } catch (parseError) {
          // JSON parsing failed - remove corrupted entry

          localStorage.removeItem(key);
          corruptedKeysFound++;
        }
      }
      
      if (corruptedKeysFound > 0) {

        
        // Mark store as requiring fresh data
        localStorage.setItem(`store_needs_refresh_${storeSlug}`, Date.now().toString());
      } else {
        void 0;
      }
      
    } catch (error) {
      void 0;
    }
  };

  const fetchAds = async () => {
    try {
      if (storeSlug) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const fetchUrl = `${apiUrl}/ads/store/${storeSlug}`;
        const response = await fetch(fetchUrl);
        if (response.ok) {
          const result = await response.json();
          setStoreAds(result.data || []);
        }
      }
    } catch (error) {
      void 0;
    }
  };

  // تلقائي للسلايدر
  useEffect(() => {
    if (sliderImages.length > 1) {
      const interval = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % sliderImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [sliderImages.length]);

  useEffect(() => {
    const betweenProductAds = storeAds.filter(ad => ad.placement === 'between_products').slice(0, 3);
    if (isAdHovering || betweenProductAds.length <= 1) return;
    const interval = setInterval(() => {
      setAdCarouselSlide((prev) => (prev + 1) % betweenProductAds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAdHovering, storeAds]);

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">متجر غير موجود</h2>
          <Button onClick={onBack}>العودة للرئيسية</Button>
        </div>
      </div>
    );
  }

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  const handleAddToCart = (product: Product) => {
    const defaultSize = product.availableSizes[0] || product.sizes[0] || 'واحد';
    const defaultColor = product.colors[0]?.name || 'افتراضي';
    onAddToCart(product, defaultSize, defaultColor, 1);
  };

  const handleNotifyWhenAvailable = (product: Product) => {
    // استدعاء دالة التنبيه من المكون الأب بدلاً من عرض الـ modal الخاص
    onNotifyWhenAvailable(product.id);
  };

  const handleCloseNotifyModal = () => {
    setShowNotifyModal(false);
    setSelectedProduct(null);
  };

  const handleSubmitNotification = (notificationData: any) => {
    if (onSubmitNotification && selectedProduct) {
      onSubmitNotification(selectedProduct, notificationData);
    } else {
      void 0;
    }
    setShowNotifyModal(false);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* الهيدر */}
      <div className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                العودة
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center overflow-hidden">
                  {enhancedStore?.logo && (
                    <img
                      src={enhancedStore.logo}
                      alt={enhancedStore.name}
                      className="h-12 w-12 rounded-xl object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{enhancedStore?.name}</h1>
                  <p className="text-sm text-gray-600">{enhancedStore?.description || 'متجر إلكتروني'}</p>
                </div>
              </div>
            </div>
            
            {/* تبويبات العرض */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentView('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'all' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                جميع المنتجات
              </button>
              <button
                onClick={() => setCurrentView('discounts')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'discounts' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                التخفيضات
              </button>
              <button
                onClick={() => setCurrentView('new')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'new' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                المنتجات الجديدة
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* السلايدر الموحد - يستخدم الإعدادات المركزية */}
      {storeSlug === 'sheirine' && storeConfig ? (
        <SheirineSlider 
          products={storeProducts}
          storeSlug={storeSlug}
          onProductClick={onProductClick}
          onAddToCart={(product) => onAddToCart(product, '', '', 1)}
          onToggleFavorite={onToggleFavorite}
          favorites={favorites}
        />
      ) : storeConfig ? (
        <UnifiedStoreSlider storeSlug={store.slug} initialSliders={sliderImages} />
      ) : sliderImages.length > 0 ? (
        /* السلايدر العادي للمتاجر الديناميكية بدون إعدادات مركزية */
          <div className="relative h-96 bg-gradient-to-r from-primary/10 to-primary/5 overflow-hidden">
            <div 
                 className="absolute inset-0 flex transition-transform duration-500 ease-in-out slider-container"
                 style={{
                   '--slide-offset': activeSlide
                 } as React.CSSProperties}
                 role="region"
                 aria-label="محتوى السلايدر">
              {sliderImages.map((item, index) => {
                const isSliderBanner = item.imageUrl && (item.title || item.subtitle || item.discount);
                
                if (isSliderBanner) {
                  return (
                    <div key={item.id} className="w-full flex-shrink-0 relative">
                      <img
                        src={item.imageUrl}
                        alt={item.title || 'عرض'}
                        className="w-full h-96 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                          {item.discount && (
                            <div className="mb-4">
                              <span className="inline-block bg-red-600 text-white px-6 py-2 rounded-full text-2xl font-bold shadow-lg animate-pulse">
                                خصم {item.discount}%
                              </span>
                            </div>
                          )}
                          
                          {item.title && (
                            <h2 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-2xl">
                              {item.title}
                            </h2>
                          )}
                          
                          {item.subtitle && (
                            <p className="text-xl md:text-2xl mb-6 drop-shadow-lg opacity-90">
                              {item.subtitle}
                            </p>
                          )}
                          
                          {item.buttonText && (
                            <Button 
                              size="lg" 
                              className="px-8 py-3 bg-white text-gray-900 rounded-full font-bold text-lg shadow-xl hover:bg-gray-100"
                            >
                              {item.buttonText}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
                
                const product = item;
                return (
                  <div key={product.id} className="w-full flex-shrink-0 relative">
                    <div className="container mx-auto px-4 h-full flex items-center">
                      <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-4">
                          <Badge className="bg-primary/20 text-primary">
                            {store.categories?.[0] || 'منتجات'}
                          </Badge>
                          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                            {product.name}
                          </h2>
                          <p className="text-lg text-gray-600 max-w-md">
                            {product.description}
                          </p>
                          <div className="flex items-center gap-4">
                            <div className="text-2xl font-bold text-primary">
                              {product.price} د.ل
                            </div>
                            {product.originalPrice > product.price && (
                              <div className="text-lg text-gray-500 line-through">
                                {product.originalPrice} د.ل
                              </div>
                            )}
                          </div>
                          <Button 
                            size="lg" 
                            onClick={() => onProductClick(product.id)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            عرض المنتج
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                        <div className="relative flex justify-center">
                          <img
                            src={getProxyImageUrl(product.images?.[0] || product.image || getDefaultProductImageSync(store?.slug), store?.slug, 'products')}
                            alt={product.name}
                            className="w-64 h-64 object-cover rounded-2xl shadow-2xl"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* أزرار التنقل */}
            {sliderImages.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                  aria-label="الصورة السابقة"
                  title="الصورة السابقة"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                  aria-label="الصورة التالية"
                  title="الصورة التالية"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* نقاط التنقل */}
            {sliderImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {sliderImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === activeSlide ? 'bg-white' : 'bg-white/50'
                    }`}
                    aria-label={`انتقل إلى الشريحة ${index + 1}`}
                    title={`الشريحة ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null
      }



      {/* قسم المنتجات */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentView === 'all' && 'جميع المنتجات'}
              {currentView === 'discounts' && 'العروض والتخفيضات'}
              {currentView === 'new' && 'المنتجات الجديدة'}
            </h2>
            <p className="text-gray-600">
              {displayProducts.length} منتج متوفر
            </p>
          </div>
        </div>

        {displayProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-500">لا توجد منتجات في هذا التصنيف حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayProducts.map((product, index) => (
              <React.Fragment key={`product-${product.id}`}>
                {(index === 3) && storeAds.filter(ad => ad.placement === 'between_products').length > 0 && (
                  <div 
                    className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4"
                    onMouseEnter={() => setIsAdHovering(true)}
                    onMouseLeave={() => setIsAdHovering(false)}
                  >
                    {(() => {
                      const betweenProductAds = storeAds.filter(ad => ad.placement === 'between_products').slice(0, 3);
                      const currentAd = betweenProductAds[adCarouselSlide];
                      
                      const getTemplateImage = (templateId: string) => {
                        const templates: Record<string, string> = {
                          'adv1': '/AdsForms/adv1.jpg',
                          'adv2': '/AdsForms/adv2.jpg',
                          'adv3': '/AdsForms/adv3.jpg',
                          'adv4': '/AdsForms/adv4.jpg',
                          'adv5': '/AdsForms/adv5.jpg',
                          'adv6': '/AdsForms/adv6.jpg',
                          'adv7': '/AdsForms/adv7.jpg',
                          'adv8': '/AdsForms/adv8.jpg',
                          'adv9': '/AdsForms/adv9.jpg',
                          'adv10': '/AdsForms/adv10.jpg',
                          'adv11': '/AdsForms/adv11.jpg',
                        };
                        return templates[templateId] || '/AdsForms/adv1.jpg';
                      };

                      return (
                        <Card className="relative overflow-hidden rounded-2xl border-none shadow-2xl group w-full" style={{ aspectRatio: '1920 / 450', minHeight: '250px' }}>
                          <div className="relative w-full h-full">
                            {betweenProductAds.map((ad, adIndex) => (
                              <div
                                key={ad.id}
                                className={`absolute inset-0 transition-all duration-1000 bg-gray-900 flex items-center justify-center ${
                                  adIndex === adCarouselSlide 
                                    ? 'opacity-100 scale-100 z-10' 
                                    : 'opacity-0 scale-95 z-0'
                                }`}
                              >
                                <img
                                  src={getTemplateImage(ad.templateId)}
                                  alt={ad.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                
                                <div className="absolute inset-0 flex items-center justify-center p-4 text-white">
                                  <div className="text-center">
                                    <h3 className="text-lg md:text-xl font-bold drop-shadow-lg mb-1">{ad.title}</h3>
                                    <p className="text-sm md:text-base text-white/90 drop-shadow-lg line-clamp-2">{ad.description}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {betweenProductAds.length > 1 && (
                            <>
                              <button
                                onClick={() => setAdCarouselSlide((prev) => (prev - 1 + betweenProductAds.length) % betweenProductAds.length)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 z-20"
                                title="السابق"
                                aria-label="السابق"
                              >
                                <ArrowLeft className="h-6 w-6 text-gray-800" />
                              </button>
                              <button
                                onClick={() => setAdCarouselSlide((prev) => (prev + 1) % betweenProductAds.length)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 z-20"
                                title="التالي"
                                aria-label="التالي"
                              >
                                <ArrowRight className="h-6 w-6 text-gray-800" />
                              </button>
                            </>
                          )}

                          {betweenProductAds.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                              {betweenProductAds.map((_, adIndex) => (
                                <button
                                  key={adIndex}
                                  onClick={() => setAdCarouselSlide(adIndex)}
                                  className={`transition-all duration-300 rounded-full ${
                                    adCarouselSlide === adIndex
                                      ? 'w-10 h-3 bg-white shadow-lg'
                                      : 'w-3 h-3 bg-white/50 hover:bg-white/80'
                                  }`}
                                  aria-label={`الإعلان ${adIndex + 1}`}
                                />
                              ))}
                            </div>
                          )}
                        </Card>
                      );
                    })()}
                  </div>
                )}
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favorites.includes(product.id)}
                  onProductClick={() => onProductClick(product.id)}
                  onAddToCart={() => handleAddToCart(product)}
                  onToggleFavorite={() => onToggleFavorite(product.id)}
                  onNotifyWhenAvailable={() => handleNotifyWhenAvailable(product)}
                  storeSlug={store?.slug}
                />
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* الفوتر بهوية إشرو */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* شعار إشرو */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/eshro-new-logo.png" 
                  alt="إشرو" 
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-gray-400 text-sm">
                منصة إشرو الإلكترونية - مستقبل التجارة الإلكترونية في ليبيا
              </p>
              <div className="flex gap-3">
                <button className="w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors" aria-label="تابعنا على إنستجرام" title="إنستجرام">
                  <Instagram className="h-4 w-4" />
                </button>
                <button className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors" aria-label="تابعنا على فيسبوك" title="فيسبوك">
                  <Facebook className="h-4 w-4" />
                </button>
                <button className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors" aria-label="زيارة الموقع الإلكتروني" title="الموقع الإلكتروني">
                  <Globe className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* معلومات المتجر */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{store.name}</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>{store.description}</li>
                <li className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {store.url}
                </li>
                {store.categories.map((category, index) => (
                  <li key={index}>{category}</li>
                ))}
              </ul>
            </div>

            {/* خدمات إشرو */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">خدماتنا</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>دفع آمن</li>
                <li>شحن سريع</li>
                <li>ضمان الجودة</li>
                <li>خدمة العملاء</li>
                <li>إرجاع مجاني</li>
              </ul>
            </div>

            {/* تواصل معنا */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">تواصل معنا</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  218-21-123-4567
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  support@eshro.ly
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  طرابلس، ليبيا
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 منصة إشرو الإلكترونية. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>

      {/* مكون نبهني عند التوفر */}
      {showNotifyModal && selectedProduct && (
        <EnhancedNotifyModal
          isOpen={showNotifyModal}
          onClose={handleCloseNotifyModal}
          product={selectedProduct}
          onSubmit={handleSubmitNotification}
        />
      )}
    </div>
  );
};

// مكون كارد المنتج
const ProductCard: React.FC<{
  product: Product;
  isFavorite: boolean;
  onProductClick: () => void;
  onAddToCart: () => void;
  onToggleFavorite: () => void;
  onNotifyWhenAvailable: () => void;
  storeSlug?: string;
}> = ({
  product,
  isFavorite,
  onProductClick,
  onAddToCart,
  onToggleFavorite,
  onNotifyWhenAvailable,
  storeSlug
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showQuickView, setShowQuickView] = useState(false);

  // إعادة تعيين فهرس الصورة عند تغيير المنتج
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product.id, product.images?.length]);



  // دالة للحصول على البadge - تستخدم الحساب الديناميكي أولاً ثم الـ tags
  const getProductBadge = (product: Product): string | null => {
    // أولاً: احسب الـ badge ديناميكياً
    const calculatedBadge = calculateBadge(product);
    if (calculatedBadge && calculatedBadge !== 'جديد') {
      return calculatedBadge;
    }

    // ثانياً: إذا لم توجد badge محسوبة، ابحث في الـ tags
    const tags = product.tags;
    if (!tags || !Array.isArray(tags)) {
      return calculatedBadge || null;
    }

    const badgePriority = [
      'غير متوفر',
      'تخفيضات',
      'مميزة',
      'أكثر مبيعاً',
      'أكثر إعجاباً',
      'أكثر مشاهدة',
      'أكثر طلباً',
      'جديد'
    ];

    for (const badge of badgePriority) {
      if (tags.includes(badge)) {
        return badge;
      }
    }
    return calculatedBadge || null;
  };

  // دالة للانتقال للصورة التالية
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  // دالة للانتقال للصورة السابقة
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  // تأكد من أن فهرس الصورة صحيح
  useEffect(() => {
    if (product.images && currentImageIndex >= product.images.length) {
      setCurrentImageIndex(0);
    }
  }, [currentImageIndex, product.images, product.name]);

  return (
    <Card 
      className={`overflow-hidden hover:shadow-lg transition-all cursor-pointer group ${!product.inStock ? 'opacity-75' : ''}`}
      onClick={onProductClick}
    >
      <CardContent className="p-0">
        <div className="relative">
          {/* عرض جميع الصور في ترتيبها الصحيح */}
          {product.images && product.images.length > 0 ? (
            <div className="relative w-full h-48 overflow-hidden">
              {/* الصورة الحالية */}
              <LazyImage
                key={`${product.id}-${currentImageIndex}`}
                src={getProxyImageUrl(product.images[currentImageIndex] || '', storeSlug, 'products')}
                alt={`${product.name} - صورة ${currentImageIndex + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => {}}              
              />
              
              {/* أزرار التنقل بين الصور */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="الصورة السابقة"
                  >
                    <ArrowLeft className="h-3 w-3" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="الصورة التالية"
                  >
                    <ArrowRight className="h-3 w-3" />
                  </button>
                  
                  {/* مؤشر الصور */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                        aria-label={`عرض الصورة ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <img
              src={getDefaultProductImageSync(storeSlug)}
              alt={product.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
          
          {/* العلامات */}
          {(() => {
            const badge = getProductBadge(product);
            if (badge) {
              const badgeColor = getTagColor(badge);
              return (
                <span 
                  className={`absolute top-2 right-2 ${badgeColor.className}`}
                  style={badgeColor.style}
                >
                  {badge}
                </span>
              );
            }
            return null;
          })()}

          {/* أزرار الإجراءات */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {/* أيقونة القلب - المفضلة */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onToggleFavorite();
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isFavorite 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
              }`}
              aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
              title={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            >
              <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            
            {/* أيقونة العين - معاينة سريعة */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setShowQuickView(true);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/80 text-gray-600 hover:bg-blue-500 hover:text-white transition-colors"
              aria-label="معاينة سريعة"
              title="معاينة سريعة"
            >
              <Eye className="h-4 w-4" />
            </button>
            
            {/* أيقونة المشاركة */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }} 
              className="relative"
            >
              <ShareMenu 
                url={`${window.location.origin}/product/${product.id}`}
                title={`شاهد هذا المنتج الرائع: ${product.name}`}
                className="w-8 h-8 bg-white/80 text-gray-600 hover:bg-white rounded-full"
                size="sm"
                variant="ghost"
              />
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
            {product.name}
          </h3>
          
          {/* التقييم */}
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-3 w-3 ${i < product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
              />
            ))}
            <span className="text-xs text-gray-500 mr-1">({product.reviews})</span>
          </div>

          {/* السعر */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-primary">{product.price} د.ل</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-sm text-gray-500 line-through">
                  {product.originalPrice} د.ل
                </span>
                <Badge className="bg-red-500 text-white text-xs">
                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </Badge>
              </>
            )}
          </div>

          {/* الإحصائيات */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {product.views}
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {product.likes}
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {product.orders}
            </div>
          </div>

          {/* الأزرار */}
          {(() => {
            const quantity = product.quantity ?? 0;
            const isOutOfStock = quantity <= 0;
            const isLowStock = quantity > 0 && quantity < 5;
            
            if (isOutOfStock) {
              return (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNotifyWhenAvailable();
                  }}
                  size="sm"
                  className="w-full bg-orange-700 hover:bg-orange-800 text-white"
                >
                  <Bell className="h-4 w-4 mr-1" />
                  نبهني عند التوفر
                </Button>
              );
            }
            
            return (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart();
                }}
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                أضف للسلة
                {isLowStock && <span className="ml-1 text-xs">({quantity})</span>}
              </Button>
            );
          })()}
        </div>
      </CardContent>

      {/* مودال المعاينة السريعة */}
      {showQuickView && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            setShowQuickView(false);
          }}
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {/* زر الإغلاق */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuickView(false);
                }}
                className="absolute top-4 left-4 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-md"
              >
                ✕
              </button>

              {/* صورة المنتج */}
              <div className="w-full h-64 bg-gray-100 relative">
                {product.images && product.images.length > 0 ? (
                  <LazyImage
                    src={getProxyImageUrl(product.images[currentImageIndex] || '', storeSlug, 'products')}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={() => {}}
                  />
                ) : (
                  <LazyImage
                    src={getProxyImageUrl(getDefaultProductImageSync(storeSlug), storeSlug, 'products')}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* العلامات */}
                {(() => {
                  const badge = getProductBadge(product);
                  if (badge) {
                    const badgeColor = getTagColor(badge);
                    return (
                      <span 
                        className={`absolute top-4 right-4 ${badgeColor.className}`}
                        style={badgeColor.style}
                      >
                        {badge}
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* معلومات المنتج */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h2>

                {/* التقييم */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">({product.reviews} تقييم)</span>
                </div>

                {/* الوصف */}
                {product.description && (
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {product.description}
                  </p>
                )}

                {/* السعر */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-bold text-primary">{product.price} د.ل</span>
                  {product.originalPrice > product.price && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        {product.originalPrice} د.ل
                      </span>
                      <Badge className="bg-red-500 text-white">
                        خصم {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </Badge>
                    </>
                  )}
                </div>

                {/* الإحصائيات */}
                <div className="flex items-center gap-6 mb-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{product.views} مشاهدة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <span>{product.likes} إعجاب</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>{product.orders} طلب</span>
                  </div>
                </div>

                {/* الأزرار */}
                <div className="flex gap-3">
                  {(() => {
                    const quantity = product.quantity ?? 0;
                    const isOutOfStock = quantity <= 0;
                    
                    if (isOutOfStock) {
                      return (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNotifyWhenAvailable();
                            setShowQuickView(false);
                          }}
                          className="w-full bg-orange-700 hover:bg-orange-800 text-white"
                        >
                          <Bell className="h-4 w-4 ml-2" />
                          نبهني عند التوفر
                        </Button>
                      );
                    }
                    
                    return (
                      <>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart();
                            setShowQuickView(false);
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <ShoppingCart className="h-4 w-4 ml-2" />
                          أضف للسلة
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onProductClick();
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          عرض التفاصيل الكاملة
                        </Button>
                      </>
                    );
                  })()}
                </div>

                {/* أيقونات الإجراءات */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite();
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isFavorite 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                    }`}
                  >
                    <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
                    {isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                  </button>
                  
                  <div className="flex-1" />
                  
                  <div onClick={(e) => e.stopPropagation()}>
                    <ShareMenu 
                      url={`${window.location.origin}/product/${product.id}`}
                      title={`شاهد هذا المنتج الرائع: ${product.name}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ModernStorePage;
