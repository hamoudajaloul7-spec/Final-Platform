import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getProxyImageUrl } from '@/utils/assetProxyUtil';
import { Input } from '@/components/ui/input';
import {
  Heart,
  Share2,
  Clock,
  Smartphone,
  Users,
  Bell,
  Save,
  ShoppingBag,
  Star,
  TrendingUp
} from 'lucide-react';

interface CartItem {
  id: number;
  product: any;
  size: string;
  color: string;
  quantity: number;
}

interface SmartCartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemoveItem: (itemId: number) => void;
  onAddToWishlist: (productId: number) => void;
  onShareCart: () => void;
}

interface SuggestedProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  category: string;
  storeSlug?: string;
}

const SmartCart: React.FC<SmartCartProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onAddToWishlist,
  onShareCart
}) => {
  const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<SuggestedProduct[]>([]);
  const [cartSaved, setCartSaved] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);

  // حفظ السلة عبر الأجهزة
  useEffect(() => {
    const saveCartToStorage = () => {
      localStorage.setItem('smartCart', JSON.stringify(cartItems));
      setCartSaved(true);
      setTimeout(() => setCartSaved(false), 2000);
    };

    if (cartItems.length > 0) {
      saveCartToStorage();
    }
  }, [cartItems]);

  // تحميل السلة المحفوظة
  useEffect(() => {
    const savedCart = localStorage.getItem('smartCart');
    if (savedCart) {
      // يمكن إضافة منطق لاستعادة السلة هنا
    }
  }, []);

  // اقتراحات المنتجات المرتبطة
  useEffect(() => {
    if (cartItems.length > 0) {
      // محاكاة اقتراحات المنتجات بناءً على المنتجات في السلة
      const mockSuggestions: SuggestedProduct[] = [
        {
          id: 101,
          name: 'منتج مقترح 1',
          price: 45.99,
          image: '/api/placeholder/150/150',
          rating: 4.5,
          category: 'إكسسوارات'
        },
        {
          id: 102,
          name: 'منتج مقترح 2',
          price: 32.50,
          image: '/api/placeholder/150/150',
          rating: 4.2,
          category: 'ملابس'
        }
      ];
      setSuggestedProducts(mockSuggestions);
    }
  }, [cartItems]);

  const handleSaveForLater = (item: CartItem) => {
    setSavedForLater(prev => [...prev, item]);
    onRemoveItem(item.id);
  };

  const handleMoveToCart = (item: CartItem) => {
    setSavedForLater(prev => prev.filter(saved => saved.id !== item.id));
    // إضافة إلى السلة (سيتم تنفيذه في المكون الأب)
  };

  const handleSetReminder = () => {
    setReminderSet(true);
    // محاكاة إعداد تذكير
    setTimeout(() => {
      alert('تذكير: لديك منتجات في سلة التسوق المتروكة!');
    }, 5000);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <div className="space-y-6">
      {/* حالة حفظ السلة */}
      {cartSaved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <Save className="h-5 w-5 text-green-600" />
          <span className="text-green-800 text-sm">تم حفظ سلة التسوق تلقائياً</span>
        </div>
      )}

      {/* ميزات السلة الذكية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            سلة التسوق الذكية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* حفظ عبر الأجهزة */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">حفظ عبر الأجهزة</p>
                <p className="text-xs text-gray-600">متزامن تلقائياً</p>
              </div>
            </div>

            {/* قوائم المفضلة المشتركة */}
            <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
              <Users className="h-5 w-5 text-pink-600" />
              <div>
                <p className="text-sm font-medium">قوائم مشتركة</p>
                <p className="text-xs text-gray-600">شارك قائمتك</p>
              </div>
            </div>

            {/* تذكيرات السلة المتروكة */}
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <Bell className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">تذكيرات ذكية</p>
                <p className="text-xs text-gray-600">لا تنسَ مشترياتك</p>
              </div>
            </div>

            {/* اقتراحات المنتجات */}
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">اقتراحات ذكية</p>
                <p className="text-xs text-gray-600">منتجات مشابهة</p>
              </div>
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onShareCart}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              مشاركة السلة
            </Button>
            {!reminderSet && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSetReminder}
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                تذكير لاحقاً
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* اقتراحات المنتجات */}
      {suggestedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              اقتراحات لك
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedProducts.map(product => (
                <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <img
                    src={getProxyImageUrl(product.image, product.storeSlug, 'products')}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{product.name}</h4>
                    <p className="text-sm text-gray-600">{product.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {product.price} ريال
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onAddToWishlist(product.id)}
                    className="flex items-center gap-1"
                  >
                    <Heart className="h-4 w-4" />
                    إضافة للمفضلة
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* المنتجات المحفوظة لاحقاً */}
      {savedForLater.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              محفوظ لاحقاً ({savedForLater.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {savedForLater.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <img
                    src={getProxyImageUrl(item.product.image, item.product.storeSlug, 'products')}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">
                      المقاس: {item.size} | اللون: {item.color}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleMoveToCart(item)}
                  >
                    نقل للسلة
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ملخص السلة */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">إجمالي المنتجات</p>
              <p className="text-2xl font-bold">{totalItems}</p>
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-600">إجمالي السعر</p>
              <p className="text-2xl font-bold">{totalPrice.toFixed(2)} ريال</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartCart;
