import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight,
  Facebook,
  Filter,
  Globe,
  Grid3X3,
  Heart, 
  Instagram,
  List,
  Search, 
  ShoppingCart,
  Star, 
  Store
} from "lucide-react";
import { getProxyImageUrl } from '@/utils/assetProxyUtil';
import { sampleProducts, storesData } from "@/data/ecommerceData";
import { allStoreProducts, storeIcons, storeColors } from '@/data/allStoreProducts';
import SheirineSlider from '@/data/stores/sheirine/Slider';
import GenericStoreSlider from '@/components/GenericStoreSlider';
import { getTagColor, calculateBadge, getButtonConfig, applyAutoBadges } from '@/utils/badgeCalculator';
import { getApiUrl, getApiBase } from '@/utils/apiConfig';

interface StorePageProps {
  storeSlug: string;
  onBack: () => void;
  onProductClick: (productId: number) => void;
}

const StorePage: React.FC<StorePageProps> = ({ storeSlug, onBack, onProductClick }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [storeAds, setStoreAds] = useState<any[]>([]);
  const [liveProducts, setLiveProducts] = useState<any[]>([]);

  const store = storesData.find(s => s.slug === storeSlug);
  const storeIcon = store ? (storeIcons as any)[store.id] : null;
  const storeColor = store ? (storeColors as any)[store.id] : null;

  const fetchAds = async () => {
    try {
      if (storeSlug) {
        const apiUrl = getApiUrl();
        const fetchUrl = `${apiUrl}/ads/store/${storeSlug}`;
        const response = await fetch(fetchUrl);
        if (response.ok) {
          const result = await response.json();
          setStoreAds(result.data || []);
        }
      }
    } catch (error) {
    }
  };

  const fetchProducts = async () => {
    try {
      if (!storeSlug) return;
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/products?limit=500&storeSlug=${encodeURIComponent(storeSlug)}`);
      if (response.ok) {
        const result = await response.json();
        let products = Array.isArray(result.data) ? result.data : [];
        if (Array.isArray(result)) {
          products = result;
        }
        setLiveProducts(products);
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchAds();
    fetchProducts();
  }, [storeSlug]);

  useEffect(() => {
    const handleProductUpdate = () => {
      fetchProducts();
      fetchAds();
    };

    window.addEventListener('productUpdated', handleProductUpdate as EventListener);
    window.addEventListener('storeAdsUpdated', handleProductUpdate as EventListener);

    return () => {
      window.removeEventListener('productUpdated', handleProductUpdate as EventListener);
      window.removeEventListener('storeAdsUpdated', handleProductUpdate as EventListener);
    };
  }, []);

  const getTextPositionStyle = (position?: string) => {
    const baseClasses = "absolute text-center";
    const positionMap: Record<string, string> = {
      'top-left': 'top-2 left-2 text-left',
      'top-center': 'top-2 left-1/2 -translate-x-1/2',
      'top-right': 'top-2 right-2 text-right',
      'center-left': 'top-1/2 -translate-y-1/2 left-2 text-left',
      'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      'center-right': 'top-1/2 -translate-y-1/2 right-2 text-right',
      'bottom-left': 'bottom-2 left-2 text-left',
      'bottom-center': 'bottom-2 left-1/2 -translate-x-1/2',
      'bottom-right': 'bottom-2 right-2 text-right',
    };
    return `${baseClasses} ${positionMap[position || 'center']}`;
  };

  let storeProducts: any[] = [];
  
  if (store) {
    // 1. محاولة جلب المنتجات من القائمة الموحدة للمتاجر النمطية
    const modularProducts = allStoreProducts.filter(p => p.storeId === store.id);
    
    if (modularProducts.length > 0) {
      storeProducts = applyAutoBadges(modularProducts);
    } 
    // 2. محاولة جلب المنتجات المباشرة (Live Products) من API
    else if (liveProducts.length > 0) {
      const filteredByStore = liveProducts.filter(p => {
        const pStoreId = p.storeId || p.store_id;
        return pStoreId === store.id || (typeof pStoreId === 'string' && pStoreId === store.id.toString());
      });
      storeProducts = applyAutoBadges(filteredByStore);
    }
    // 3. الخيار الأخير: استخدام المنتجات التجريبية (Sample Products)
    else {
      const filteredByStore = sampleProducts.filter(p => p.storeId === store.id);
      storeProducts = applyAutoBadges(filteredByStore);
    }
  }
  
  if (!store) {
    return <div>المتجر غير موجود</div>;
  }

  const filteredProducts = storeProducts.filter(product => {
    // ✅_FIX: Handle undefined product properties
    const productName = product.name || product.nameAr || '';
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'الكل' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                العودة
              </Button>
              
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${storeColor || 'from-primary/20 to-primary/10'} rounded-xl flex items-center justify-center overflow-hidden`}>
                  {store.logo ? (
                    <img
                      src={getProxyImageUrl(store.logo, storeSlug, 'logo')}
                      alt={`${store.name} logo`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `<div class="text-2xl">${storeIcon || '🏪'}</div>`;
                      }}
                    />
                  ) : (
                    <div className="text-2xl">{storeIcon || '🏪'}</div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
                  <p className="text-sm text-gray-500">{store.description}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <Facebook className="h-5 w-5 text-white" />
              </div>
              <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <Instagram className="h-5 w-5 text-white" />
              </div>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <Globe className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <GenericStoreSlider 
        ads={storeAds} 
        storeSlug={storeSlug} 
        products={storeProducts} 
        onProductClick={onProductClick} 
      />

      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="ابحث في المنتجات..."
                className="pl-10 pr-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {['الكل', ...store.categories].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {storeAds.filter(ad => ad.placement === 'banner').length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex gap-4 overflow-x-auto pb-2">
              {storeAds.filter(ad => ad.placement === 'banner').map(ad => {
                const template = [
                  { id: 'adv1', image: '/AdsForms/adv1.jpg' },
                  { id: 'adv2', image: '/AdsForms/adv2.jpg' },
                  { id: 'adv3', image: '/AdsForms/adv3.jpg' },
                  { id: 'adv4', image: '/AdsForms/adv4.jpg' },
                  { id: 'adv5', image: '/AdsForms/adv5.jpg' },
                  { id: 'adv6', image: '/AdsForms/adv6.jpg' },
                  { id: 'adv7', image: '/AdsForms/adv7.jpg' },
                  { id: 'adv8', image: '/AdsForms/adv8.jpg' },
                  { id: 'adv9', image: '/AdsForms/adv9.jpg' },
                  { id: 'adv10', image: '/AdsForms/adv10.jpg' },
                  { id: 'adv11', image: '/AdsForms/adv11.jpg' },
                  { id: 'adv12', image: '/AdsForms/adv12.jpg' },
                ].find(t => t.id === ad.templateId);
                return (
                  <div key={ad.id} className="flex-shrink-0 bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => ad.linkUrl && window.open(ad.linkUrl, '_blank')}>
                    <div className="relative w-64 h-24">
                      <img src={getProxyImageUrl(template?.image || '')} alt={ad.title} className="w-full h-full object-cover" />
                      <div className={`${getTextPositionStyle(ad.textPosition)} max-w-[95%]`} style={{ color: ad.textColor || '#ffffff', fontFamily: 'Cairo, sans-serif', fontWeight: 600 }}>
                        <h4 className="text-sm font-semibold line-clamp-2">{ad.title}</h4>
                      </div>
                    </div>
                    <div className="p-2 bg-white">
                      <p className="text-xs text-gray-600 line-clamp-1">{ad.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{storeProducts.length === 0 ? '📦' : '🔍'}</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {storeProducts.length === 0 ? 'المتجر فارغ حالياً' : 'لم نجد منتجات مطابقة'}
            </h3>
            <p className="text-gray-500">
              {storeProducts.length === 0 
                ? 'سيتم إضافة المنتجات قريباً' 
                : 'جرب البحث بكلمات مختلفة أو اختر فئة أخرى'}
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' 
            : 'space-y-4'
          }>
            {filteredProducts.map((product, index) => (
              <React.Fragment key={`product-${product.id}`}>
                {((index + 1) % 4 === 0) && storeAds.filter(ad => ad.placement === 'between_products').length > 0 && (
                  <div className="col-span-2 md:col-span-3 lg:col-span-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {storeAds.filter(ad => ad.placement === 'between_products').map(ad => {
                        const template = [
                          { id: 'adv1', image: '/AdsForms/adv1.jpg' },
                          { id: 'adv2', image: '/AdsForms/adv2.jpg' },
                          { id: 'adv3', image: '/AdsForms/adv3.jpg' },
                          { id: 'adv4', image: '/AdsForms/adv4.jpg' },
                          { id: 'adv5', image: '/AdsForms/adv5.jpg' },
                          { id: 'adv6', image: '/AdsForms/adv6.jpg' },
                          { id: 'adv7', image: '/AdsForms/adv7.jpg' },
                          { id: 'adv8', image: '/AdsForms/adv8.jpg' },
                          { id: 'adv9', image: '/AdsForms/adv9.jpg' },
                          { id: 'adv10', image: '/AdsForms/adv10.jpg' },
                          { id: 'adv11', image: '/AdsForms/adv11.jpg' },
                          { id: 'adv12', image: '/AdsForms/adv12.jpg' },
                        ].find(t => t.id === ad.templateId);
                        return (
                          <Card key={ad.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={() => ad.linkUrl && window.open(ad.linkUrl, '_blank')}>
                            <div className="relative aspect-video bg-gray-100">
                              <img src={getProxyImageUrl(template?.image || '')} alt={ad.title} className="w-full h-full object-cover" />
                              <div className={`${getTextPositionStyle(ad.textPosition)} w-full px-3`} style={{ color: ad.textColor || '#ffffff', fontFamily: 'Cairo, sans-serif', fontWeight: 600 }}>
                                <h3 className="font-semibold mb-1 text-sm line-clamp-2">{ad.title}</h3>
                              </div>
                            </div>
                            <CardContent className="p-3">
                              <p className="text-xs text-gray-600 line-clamp-2">{ad.description}</p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
                <ProductCard 
                  product={product}
                  viewMode={viewMode}
                  onClick={() => onProductClick(product.id)}
                  storeSlug={storeSlug}
                />
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{storeProducts.length}+</div>
              <div className="text-sm text-gray-500">منتج متاح</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">4.8</div>
              <div className="text-sm text-gray-500">تقييم المتجر</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">1.2K+</div>
              <div className="text-sm text-gray-500">عميل سعيد</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm text-gray-500">دعم العملاء</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProductCardProps {
  product: any;
  viewMode: 'grid' | 'list';
  onClick: () => void;
  storeSlug?: string;
}

// ✅_FIX: Unified helper functions at component level
const getProductImages = (p: any): string[] => {
  if (Array.isArray(p?.images) && p.images.length > 0) {
    return p.images;
  }
  if (p?.image) {
    return [p.image];
  }
  return [];
};

const getProductColors = (p: any): any[] => {
  return Array.isArray(p?.colors) ? p.colors : [];
};

const getProductSizes = (p: any): string[] => {
  return Array.isArray(p?.availableSizes) 
    ? p.availableSizes 
    : Array.isArray(p?.sizes) ? p.sizes : [];
};

const getProductBadge = (p: any): string | null => {
  const badge = p.badge || calculateBadge(p);
  return badge || null;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode, onClick, storeSlug }) => {
  const [isLiked, setIsLiked] = useState(false);
  
  // Use unified helper functions
  const productImages = getProductImages(product);
  const productColors = getProductColors(product);
  const productSizes = getProductSizes(product);
  
  // Get effective store slug
  const effectiveStoreSlug = storeSlug || product.storeSlug;
  
  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={onClick}>
        <CardContent className="p-0">
          <div className="flex">
            <div className="w-32 h-32 relative bg-gray-100 flex-shrink-0 rounded-lg overflow-hidden">
              {productImages.length > 0 ? (
                <img
                  src={getProxyImageUrl(productImages[0] || '', effectiveStoreSlug, 'products')}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Store className="h-8 w-8" />
                </div>
              )}
              {(() => {
                const badge = getProductBadge(product);
                if (badge) {
                  const { className, style } = getTagColor(badge);
                  return (
                    <div className={`absolute top-2 left-2 z-10 ${className}`} style={style}>
                      {badge}
                    </div>
                  );
                }
                if (product.originalPrice > product.price) {
                  return (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-semibold z-10">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </div>
                  );
                }
                return null;
              })()}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 w-8 h-8 p-0 bg-white/80 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
              </Button>
            </div>
            
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                  
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i}
                        className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 mr-2">({product.reviews})</span>
                  </div>
                  
                  <div className="flex gap-1 mb-2">
                    {productSizes.map((size: string) => (
                      <Badge key={size} variant="outline" className="text-xs">
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-3">
                    {product.inStock ? (
                      <>
                        <span className="text-lg font-bold text-primary">{product.price} د.ل</span>
                        {product.originalPrice > product.price && (
                          <>
                            <span className="text-sm text-gray-500 line-through">{product.originalPrice} د.ل</span>
                            <Badge className="bg-red-500 text-white text-xs">
                              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                            </Badge>
                          </>
                        )}
                      </>
                    ) : (
                      <span className="text-lg font-bold text-red-600">غير متوفر</span>
                    )}
                  </div>
                  {(() => {
                    const config = getButtonConfig(product);
                    return (
                      <Button 
                        size="sm" 
                        className={config.buttonClassName}
                        disabled={config.isDisabled}
                      >
                        {config.status === 'unavailable' ? '🔔 نبهني عند التوفر' : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            أضف للسلة
                          </>
                        )}
                      </Button>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={onClick}>
      <CardContent className="p-0">
        <div className="relative aspect-square bg-gray-100">
          <img 
            src={getProxyImageUrl(productImages[0] || '', effectiveStoreSlug, 'products')} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
          
          {(() => {
            const badge = getProductBadge(product);
            if (!badge) return null;
            const { className, style } = getTagColor(badge);
            return (
              <div className={`absolute top-2 left-2 z-10 ${className}`} style={style}>
                {badge}
              </div>
            );
          })()}
          
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 w-8 h-8 p-0 bg-white/80 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
          </Button>
          
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button className="bg-white text-black hover:bg-gray-100">
              عرض سريع
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors mb-2">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i}
                className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
              />
            ))}
            <span className="text-xs text-gray-500 mr-2">({product.reviews})</span>
          </div>
          
          <div className="flex gap-1 mb-3">
            {productColors.slice(0, 3).map((color: any, index: number) => (
              <div 
                key={index}
                className="w-4 h-4 rounded-full border-2 border-gray-200"
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
            {productColors.length > 3 && (
              <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                +{productColors.length - 3}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <>
                  <span className="text-lg font-bold text-primary">{product.price} د.ل</span>
                  {product.originalPrice > product.price && (
                    <>
                      <span className="text-sm text-gray-500 line-through">{product.originalPrice} د.ل</span>
                      <Badge className="bg-red-500 text-white text-xs">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </Badge>
                    </>
                  )}
                </>
              ) : (
                <span className="text-lg font-bold text-red-600">غير متوفر</span>
              )}
            </div>
            
            {(() => {
              const config = getButtonConfig(product);
              return (
                <Button 
                  size="sm" 
                  className={config.buttonClassName}
                  disabled={config.isDisabled}
                >
                  {config.status === 'unavailable' ? '🔔 نبهني عند التوفر' : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      أضف للسلة
                    </>
                  )}
                </Button>
              );
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StorePage;
