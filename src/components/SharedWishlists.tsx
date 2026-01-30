import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getProxyImageUrl } from '../utils/assetProxyUtil';
import {
  Users,
  Share2,
  Heart,
  Plus,
  Link,
  Copy,
  Mail,
  MessageCircle,
  Trash2,
  ShoppingCart
} from 'lucide-react';

interface FavoriteProduct {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  storeSlug?: string;
  addedDate?: string;
}

interface WishlistItem {
  id: number;
  product: any;
  addedBy: string;
  addedDate: string;
}

interface SharedWishlist {
  id: string;
  name: string;
  description: string;
  items: WishlistItem[];
  collaborators: string[];
  isPublic: boolean;
  shareUrl: string;
}

interface SharedWishlistsProps {
  onAddToCart: (productId: number) => void;
}

const SharedWishlists: React.FC<SharedWishlistsProps> = ({ onAddToCart }) => {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [wishlists, setWishlists] = useState<SharedWishlist[]>([]);

  useEffect(() => {
    const loadFavorites = () => {
      try {
        const savedFavorites = localStorage.getItem('eshro_favorites');
        if (savedFavorites) {
          const parsed = JSON.parse(savedFavorites);
          if (Array.isArray(parsed)) {
            setFavorites(parsed);
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading favorites:', error);
      }
    };

    loadFavorites();

    const handleStorageChange = () => {
      loadFavorites();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('favoritesUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favoritesUpdated', handleStorageChange);
    };
  }, []);

  const [newWishlistName, setNewWishlistName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateWishlist = () => {
    if (newWishlistName.trim()) {
      const newWishlist: SharedWishlist = {
        id: Date.now().toString(),
        name: newWishlistName,
        description: '',
        items: [],
        collaborators: ['أنت'],
        isPublic: false,
        shareUrl: `https://eishro.com/wishlist/${Date.now()}`
      };
      setWishlists(prev => [...prev, newWishlist]);
      setNewWishlistName('');
      setShowCreateForm(false);
    }
  };

  const handleShareWishlist = (wishlist: SharedWishlist) => {
    navigator.clipboard.writeText(wishlist.shareUrl);
    alert('تم نسخ رابط القائمة!');
  };

  const handleAddCollaborator = (wishlistId: string, email: string) => {
    alert(`تم إرسال دعوة إلى ${email}`);
  };

  const handleRemoveFavorite = (productId: number) => {
    try {
      const updatedFavorites = favorites.filter(f => f.id !== productId);
      setFavorites(updatedFavorites);
      localStorage.setItem('eshro_favorites', JSON.stringify(updatedFavorites));
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error removing favorite:', error);
    }
  };

  const getProductImage = (product: FavoriteProduct) => {
    const rawPath = (product.images && product.images.length > 0)
      ? product.images[0]
      : (product.image || '/assets/default-product.png');
    
    // @ts-ignore
    return getProxyImageUrl(rawPath, product.storeSlug as any, 'products');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return 'غير محدد';
    }
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-LY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'غير محدد';
    }
  };

  return (
    <div className="space-y-6">
      {/* المفضلة الشخصية */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-red-500" />
                طلباتي المفضلة
              </CardTitle>
              <p className="text-gray-600 mt-1">
                المنتجات التي أعجبتني
              </p>
            </div>
            <Badge variant="secondary" className="text-lg">
              {favorites.length} منتج
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((product) => (
                <div 
                  key={product.id} 
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = '/assets/default-product.png';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-gray-900 line-clamp-2 mb-2">
                        {product.name}
                      </h5>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-primary">
                          {product.price} د.ل
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
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

                      <p className="text-xs text-gray-500 mb-3">
                        أضيف في: {formatDate(product.addedDate)}
                      </p>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onAddToCart(product.id)}
                          className="flex-1"
                        >
                          <ShoppingCart className="h-4 w-4 ml-2" />
                          إضافة للسلة
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveFavorite(product.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Heart className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-400" />
              <p className="text-lg font-medium mb-2">لا توجد منتجات مفضلة</p>
              <p className="text-sm">ابدأ بإضافة بعض المنتجات المفضلة من المتاجر!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* رأس القوائم المشتركة */}
      <div className="flex justify-between items-center pt-8">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            قوائم المفضلة المشتركة
          </h2>
          <p className="text-gray-600 mt-1">
            أنشئ قوائم مشتركة مع أصدقائك وعائلتك
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          إنشاء قائمة جديدة
        </Button>
      </div>

      {/* نموذج إنشاء قائمة جديدة */}
      {showCreateForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  اسم القائمة
                </label>
                <Input
                  value={newWishlistName}
                  onChange={(e) => setNewWishlistName(e.target.value)}
                  placeholder="مثال: قائمة الهدايا للأصدقاء"
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" onClick={handleCreateWishlist}>
                  إنشاء القائمة
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* قوائم المفضلة */}
      <div className="grid gap-6">
        {wishlists.map(wishlist => (
          <Card key={wishlist.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    {wishlist.name}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">{wishlist.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="secondary">
                      {wishlist.items.length} منتج
                    </Badge>
                    <Badge variant="outline">
                      {wishlist.collaborators.length} متعاون
                    </Badge>
                    {wishlist.isPublic && (
                      <Badge variant="default">
                        عامة
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleShareWishlist(wishlist)}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    مشاركة
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* المتعاونون */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">المتعاونون:</h4>
                <div className="flex flex-wrap gap-2">
                  {wishlist.collaborators.map(collaborator => (
                    <Badge key={collaborator} variant="outline">
                      {collaborator}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <Input
                    placeholder="أدخل البريد الإلكتروني"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAddCollaborator(wishlist.id, 'email@example.com')}
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    دعوة
                  </Button>
                </div>
              </div>

              {/* المنتجات */}
              {wishlist.items.length > 0 ? (
                <div>
                  <h4 className="font-medium mb-3">المنتجات:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wishlist.items.map(item => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <img
                          src={getProxyImageUrl(item.product.image, item.product.storeSlug, 'products')}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium">{item.product.name}</h5>
                          <p className="text-sm text-gray-600">
                            {item.product.price} ريال
                          </p>
                          <p className="text-xs text-gray-500">
                            أضيف بواسطة {item.addedBy} في {item.addedDate}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onAddToCart(item.product.id)}
                        >
                          إضافة للسلة
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد منتجات في هذه القائمة بعد</p>
                  <p className="text-sm">ابدأ بإضافة بعض المنتجات المفضلة لديك!</p>
                </div>
              )}

              {/* رابط المشاركة */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-3">
                  <Link className="h-4 w-4 text-gray-500" />
                  <Input
                    value={wishlist.shareUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleShareWishlist(wishlist)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    نسخ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* نصائح للاستخدام */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-medium text-blue-900 mb-3">نصائح للاستخدام الأمثل:</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• أنشئ قوائم منفصلة لمناسبات مختلفة (عيد ميلاد، زفاف، إلخ)</li>
            <li>• شارك القائمة مع أصدقائك للحصول على مساعدة في اختيار الهدايا</li>
            <li>• اجعل القائمة عامة لتسهيل المشاركة مع الجميع</li>
            <li>• تابع من أضاف أي منتج لتجنب التكرار</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SharedWishlists;
