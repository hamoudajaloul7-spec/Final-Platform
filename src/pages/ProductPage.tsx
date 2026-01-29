import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AddToCartPopup from "@/components/AddToCartPopup";
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Link2,
  Star,
  ShoppingCart,
  Zap,
  Plus,
  Minus,
  Check,
  X
} from "lucide-react";
import { sampleProducts } from "@/data/ecommerceData";
import { allStoreProducts } from "@/data/allStoreProducts";
import { enhancedSampleProducts } from "@/data/productCategories";
import { getProxyImageUrl } from "@/utils/assetProxyUtil";

import { getApiUrl } from "@/utils/apiConfig";

interface ProductPageProps {
  productId: number;
  onBack: () => void;
  onAddToCart: (product: any, selectedSize: string, selectedColor: string, quantity: number) => void;
  onBuyNow: (product: any, selectedSize: string, selectedColor: string, quantity: number) => void;
  onViewCart: () => void;
}

const ProductPage: React.FC<ProductPageProps> = ({ 
  productId, 
  onBack, 
  onAddToCart,
  onBuyNow,
  onViewCart
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [showSizeError, setShowSizeError] = useState(false);
  const [showColorError, setShowColorError] = useState(false);
  const [showAddToCartPopup, setShowAddToCartPopup] = useState(false);
  const [fetchedProduct, setFetchedProduct] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(false);
  
  // البحث عن المنتج في جميع المصادر المتاحة
  const product = useMemo(() => {
    if (fetchedProduct) return fetchedProduct;

    // 1. البحث في القائمة الموحدة للمنتجات (المصادر النمطية) - الأولوية القصوى
    const fromAll = allStoreProducts.find(p => String(p.id) === String(productId));
    if (fromAll) return fromAll;

    // 2. البحث في المنتجات الحالية المخزنة في localStorage (للمتاجر الديناميكية والمحاكات)
    const allStorageKeys = Object.keys(localStorage);
    const storeProductKeys = allStorageKeys.filter(key => key.startsWith('store_products_'));
    
    for (const key of storeProductKeys) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const products = JSON.parse(stored);
          if (Array.isArray(products)) {
            const found = products.find(p => String(p.id) === String(productId));
            if (found) return found;
          }
        }
      } catch (e) {}
    }

    // 3. البحث في المنتجات المحسنة (Legacy Enhanced)
    const fromEnhanced = enhancedSampleProducts.find(p => String(p.id) === String(productId));
    if (fromEnhanced) return fromEnhanced;

    // 4. البحث في المنتجات التجريبية (كخيار أخير)
    return sampleProducts.find(p => String(p.id) === String(productId));
  }, [productId, fetchedProduct]);

  useEffect(() => {
    // If product not found in local memory, try to fetch from API
    if (!product && productId && !isFetching) {
      setIsFetching(true);
      const apiUrl = getApiUrl();
      fetch(`${apiUrl}/products/${productId}`)
        .then(res => res.json())
        .then(result => {
          if (result.success && result.data) {
            setFetchedProduct(result.data);
          }
        })
        .catch(() => {
          // Silent error handling for production stability
        })
        .finally(() => {
          setIsFetching(false);
        });
    }
  }, [productId, product, isFetching]);
  
  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري جلب تفاصيل المنتج...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">المنتج غير موجود</h2>
          <p className="text-gray-600 mb-6">عذراً، لم نتمكن من العثور على المنتج الذي تبحث عنه.</p>
          <Button onClick={onBack}>العودة للمتجر</Button>
        </div>
      </div>
    );
  }

  // التحقق من توفر المقاس
  const isSizeAvailable = (size: string) => product.availableSizes.includes(size);
  
  // نسخ رابط المنتج
  const copyProductLink = () => {
    const link = `${window.location.origin}/product/${product.id}`;
    navigator.clipboard.writeText(link);
  };

  // مشاركة المنتج
  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: `${window.location.origin}/product/${product.id}`
      });
    } else {
      copyProductLink();
    }
  };

  // إضافة للسلة
  const handleAddToCart = () => {
    if (!selectedSize) {
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 3000);
      return;
    }
    
    if (!selectedColor) {
      setShowColorError(true);
      setTimeout(() => setShowColorError(false), 3000);
      return;
    }
    
    onAddToCart(product, selectedSize, selectedColor, quantity);
    setShowAddToCartPopup(true);
  };

  // اشتري الآن
  const handleBuyNow = () => {
    if (!selectedSize) {
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 3000);
      return;
    }
    
    if (!selectedColor) {
      setShowColorError(true);
      setTimeout(() => setShowColorError(false), 3000);
      return;
    }
    
    onBuyNow(product, selectedSize, selectedColor, quantity);
  };

  const handleViewCartFromPopup = () => {
    setShowAddToCartPopup(false);
    onViewCart();
  };

  const handleContinueShoppingFromPopup = () => {
    setShowAddToCartPopup(false);
    onBack();
  };

  const handleCheckoutFromPopup = () => {
    setShowAddToCartPopup(false);
    onViewCart();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* الهيدر */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                العودة
              </Button>
              <h1 className="text-lg font-semibold text-gray-900">تفاصيل المنتج</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={copyProductLink}>
                <Link2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={shareProduct}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* معرض الصور */}
          <div className="space-y-4">
            {/* الصورة الرئيسية */}
            <div className="aspect-square bg-white rounded-2xl border overflow-hidden relative">
              <img 
                src={getProxyImageUrl(product.images[selectedImageIndex])} 
                alt={product.name}
                className="w-full h-full object-contain"
              />
              
              {/* زر الإعجاب */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 w-10 h-10 p-0 bg-white/90 hover:bg-white rounded-full shadow-lg"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </Button>
              
              {/* علامة التخفيض */}
              {product.originalPrice > product.price && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </div>
              )}
            </div>
            
            {/* الصور المصغرة */}
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <div 
                  key={index}
                  className={`flex-shrink-0 w-16 h-16 bg-white rounded-lg border-2 cursor-pointer transition-all duration-200 overflow-hidden ${
                    selectedImageIndex === index ? 'border-primary' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img 
                    src={getProxyImageUrl(image)} 
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* معلومات المنتج */}
          <div className="space-y-6">
            {/* اسم المنتج والسعر */}
            <div>
  <h1 className="text-2xl font-bold text-gray-900 mb-2">
    {product.name}
    {(product as any).nameEn && (
      <span className="text-lg text-gray-600 font-normal ml-2">/ {(product as any).nameEn}</span>
    )}
  </h1>
              <p className="text-gray-600 mb-4">{product.description}</p>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-primary">{product.price} د.ل</span>
                  {product.originalPrice > product.price && (
                    <span className="text-xl text-gray-500 line-through">{product.originalPrice} د.ل</span>
                  )}
                </div>
              </div>
              
              {/* التقييم */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({product.reviews} تقييم)</span>
              </div>
            </div>

            {/* اختيار المقاس */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">المقاس المتوفر</h3>
                {showSizeError && (
                  <span className="text-red-500 text-sm flex items-center gap-1">
                    <X className="h-4 w-4" />
                    يرجى اختيار المقاس
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                {product.sizes.map((size: string) => {
                  const available = isSizeAvailable(size);
                  return (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      className={`h-12 relative ${
                        !available 
                          ? 'opacity-50 cursor-not-allowed' 
                          : selectedSize === size 
                            ? 'bg-primary text-white' 
                            : 'hover:border-primary'
                      }`}
                      onClick={() => {
                        if (available) {
                          setSelectedSize(size);
                          setShowSizeError(false);
                        }
                      }}
                      disabled={!available}
                    >
                      {size}
                      {!available && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded">
                          <X className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                    </Button>
                  );
                })}
              </div>
              
              {/* رسالة عدم التوفر */}
              {!isSizeAvailable(selectedSize) && selectedSize && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <X className="h-4 w-4" />
                  للأسف هذا الاختيار غير متاح.
                </p>
              )}
            </div>

            {/* اختيار اللون */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">الألوان المتاحة</h3>
                {showColorError && (
                  <span className="text-red-500 text-sm flex items-center gap-1">
                    <X className="h-4 w-4" />
                    يرجى اختيار اللون
                  </span>
                )}
              </div>
              
              <div className="flex gap-3">
                {product.colors.map((color: any, index: number) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <button
                      className={`w-12 h-12 rounded-full border-4 transition-all duration-200 ${
                        selectedColor === color.name 
                          ? 'border-primary scale-110' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => {
                        setSelectedColor(color.name);
                        setShowColorError(false);
                      }}
                    >
                      {selectedColor === color.name && (
                        <Check className="h-6 w-6 text-white drop-shadow-lg" />
                      )}
                    </button>
                    <span className="text-xs text-gray-600">{color.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* الكمية والحالة */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="font-semibold text-gray-900">الكمية</h3>
                {product.inStock && (product.quantity || 0) > 0 ? (
                  <Badge className="bg-green-100 text-green-800">متوفر ({product.quantity} قطعة)</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">غير متوفر</Badge>
                )}
              </div>
              {product.inStock && (product.quantity || 0) > 0 ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 min-w-[3rem] text-center font-semibold">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.min(quantity + 1, product.quantity || 1))}
                      disabled={quantity >= (product.quantity || 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-gray-600">من {product.quantity} متاح</span>
                </div>
              ) : (
                <div className="text-sm text-gray-600">المنتج غير متوفر في الوقت الحالي</div>
              )}
            </div>

            {/* الأزرار الرئيسية */}
            <div className="space-y-3">
              {product.inStock && (product.quantity || 0) > 0 ? (
                <>
                  <Button
                    className="w-full bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white h-12 text-lg font-semibold transition-all duration-200"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    أضف للسلة
                  </Button>
                  
                  <Button
                    className="w-full bg-red-500 hover:bg-red-600 text-white h-12 text-lg font-semibold"
                    onClick={handleBuyNow}
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    اشتري الآن
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-lg font-semibold"
                  onClick={() => {
                    alert('سيتم إخبارك عند توفر هذا المنتج');
                  }}
                >
                  <Zap className="h-5 w-5 mr-2" />
                  أخبرني عند التوفر
                </Button>
              )}
            </div>

            {/* معلومات إضافية */}
            <div className="bg-gray-100 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500" />
                <span>توصيل مجاني للطلبات أكثر من 300 د.ل</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500" />
                <span>إمكانية الاستبدال خلال 14 يوم</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500" />
                <span>دفع آمن ومضمون</span>
              </div>
            </div>
          </div>
        </div>

        {/* المنتجات ذات الصلة */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">منتجات مشابهة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {sampleProducts.filter(p => p.id !== product.id).slice(0, 4).map((relatedProduct) => (
              <Card key={relatedProduct.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                <CardContent className="p-0">
                  <div className="aspect-square bg-white overflow-hidden">
                    <img 
                      src={getProxyImageUrl(relatedProduct.images[0] || '')} 
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-gray-900 mb-1">{relatedProduct.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">{relatedProduct.price} د.ل</span>
                      {relatedProduct.originalPrice > relatedProduct.price && (
                        <span className="text-xs text-gray-500 line-through">{relatedProduct.originalPrice} د.ل</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* نافذة إضافة للسلة المنبثقة */}
      <AddToCartPopup
        isOpen={showAddToCartPopup}
        onClose={() => setShowAddToCartPopup(false)}
        product={product}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        quantity={quantity}
        onViewCart={handleViewCartFromPopup}
        onContinueShopping={handleContinueShoppingFromPopup}
        onCheckout={handleCheckoutFromPopup}
      />
    </div>
  );
};

export default ProductPage;
