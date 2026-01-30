import React, { useState } from 'react';
import InvoiceGenerator from '@/components/InvoiceGenerator';
import ShareMenu from '@/components/ShareMenu';
import { getProxyImageUrl } from '@/utils/assetProxyUtil';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Package, 
  Heart, 
  AlertTriangle,
  Share2,
  Trash2,
  Bell,
  Check,
  Clock,
  Truck,
  CheckCircle,
  Star,
  Copy,
  X,
  ShoppingCart,
  Plus,
  Minus,
  Eye,
  Download,
  FileText,
  Mail,
  MessageSquare,
  Phone
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  images: string[];
  sizes: string[];
  availableSizes: string[];
  colors: Array<{ name: string; value: string }>;
  rating: number;
  reviews: number;
  category: string;
  inStock: boolean;
  tags: string[];
  badge?: string;
}

interface Order {
  id: string;
  date: string;
  time: string;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  items: Array<{
    product: Product;
    size: string;
    color: string;
    quantity: number;
  }>;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  discountPercentage: number;
  finalTotal: number;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
  };
  shipping?: {
    type: 'normal' | 'express';
    estimatedTime: string;
  };
}

interface NotificationRequest {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  name: string;
  phone: string;
  email: string;
  notificationTypes: string[];
  createdAt: string;
}

interface CompleteOrdersPageProps {
  orders: Order[];
  favorites: Product[];
  unavailableItems: Product[];
  onBack: () => void;
  onToggleFavorite: (productId: number) => void;
  onRemoveFavorite: (productId: number) => void;
  onNotifyWhenAvailable: (productId: number) => void;
  onAddToCart: (product: Product) => void;
  onDeleteOrder: (orderId: string) => void;
  onRemoveUnavailableItem: (index: number) => void;
}

const resolveProductImage = (product: any): string | undefined => {
  if (!product) {
    return undefined;
  }
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }
  if (product.image) {
    return product.image;
  }
  if (product.thumbnail) {
    return product.thumbnail;
  }
  if (Array.isArray(product.product?.images) && product.product.images.length > 0) {
    return product.product.images[0];
  }
  if (product.product?.image) {
    return product.product.image;
  }
  return undefined;
};

const resolveProductKey = (product: any, index: number): string => {
  if (product?.id !== undefined) {
    return String(product.id);
  }
  if (product?.product?.id !== undefined) {
    return String(product.product.id);
  }
  if (product?.productId !== undefined) {
    return String(product.productId);
  }
  return `product-${index}`;
};

const CompleteOrdersPage: React.FC<CompleteOrdersPageProps> = ({
  orders = [],
  favorites = [],
  unavailableItems = [],
  onBack,
  onToggleFavorite,
  onRemoveFavorite,
  onNotifyWhenAvailable,
  onAddToCart,
  onDeleteOrder,
  onRemoveUnavailableItem
}) => {
  // قراءة البيانات من localStorage مباشرة للتأكد من الحصول على أحدث البيانات
  const [localUnavailableItems, setLocalUnavailableItems] = useState<any[]>([]);

  React.useEffect(() => {
    const loadUnavailableItems = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('eshro_unavailable') || '[]');

        setLocalUnavailableItems(saved);
      } catch (error) {

        setLocalUnavailableItems([]);
      }
    };

    loadUnavailableItems();

    // الاستماع لتغييرات localStorage
    const handleStorageChange = () => {
      loadUnavailableItems();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  const [activeTab, setActiveTab] = useState<'favorites' | 'unavailable' | 'purchases'>('purchases'); // تغيير الافتراضي لمشتريات
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showNotifyModal, setShowNotifyModal] = useState<Product | null>(null);
  const [notifyForm, setNotifyForm] = useState({
    name: '',
    phone: '',
    email: '',
    notificationTypes: [] as string[]
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [favoriteQuantities, setFavoriteQuantities] = useState<Record<string, number>>({});
  const [notificationRequests, setNotificationRequests] = useState<NotificationRequest[]>([]);
  const [showRemoveConfirmModal, setShowRemoveConfirmModal] = useState<number | null>(null);

  // تهيئة كميات المفضلة
  React.useEffect(() => {
    setFavoriteQuantities((prev) => {
      const next: Record<string, number> = {};
      favorites.forEach((product, index) => {
        const key = resolveProductKey(product, index);
        next[key] = prev[key] || 1;
      });
      return next;
    });
  }, [favorites]);

  // تتبع البيانات المحملة من localStorage وقراءتها مباشرة إذا لزم الأمر
  React.useEffect(() => {


    // التحقق من البيانات في localStorage مباشرة وقراءتها إذا لم تكن متوفرة من props
    const directCheck = JSON.parse(localStorage.getItem('eshro_unavailable') || '[]');


    // إذا كانت البيانات من props أقل من البيانات في localStorage، استخدم البيانات من localStorage
    if (directCheck.length > unavailableItems.length) {

      // هنا يمكن إضافة منطق لتحديث البيانات إذا لزم الأمر
    }
  }, [unavailableItems]);

  // استخدام البيانات من localStorage كمصدر واحد للحقيقة
  const displayUnavailableItems = localUnavailableItems;

  const updateFavoriteQuantity = (productKey: string, change: number) => {
    setFavoriteQuantities((prev) => {
      const current = prev[productKey] || 1;
      const next = Math.max(1, current + change);
      if (next === current) {
        return prev;
      }
      return { ...prev, [productKey]: next };
    });
  };

  const handleNotifySubmit = () => {
    if (!notifyForm.name || !notifyForm.phone || !notifyForm.email || notifyForm.notificationTypes.length === 0) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (!showNotifyModal) return;

    const newRequest: NotificationRequest = {
      id: Date.now(),
      productId: showNotifyModal.id,
      product: showNotifyModal,
      quantity: 1,
      name: notifyForm.name,
      phone: notifyForm.phone,
      email: notifyForm.email,
      notificationTypes: notifyForm.notificationTypes,
      createdAt: new Date().toISOString()
    };

    setNotificationRequests(prev => [...prev, newRequest]);
    setShowSuccessModal(true);
    setShowNotifyModal(null);
    setNotifyForm({ name: '', phone: '', email: '', notificationTypes: [] });
  };

  const toggleNotificationType = (type: string) => {
    setNotifyForm(prev => ({
      ...prev,
      notificationTypes: prev.notificationTypes.includes(type)
        ? prev.notificationTypes.filter(t => t !== type)
        : [...prev.notificationTypes, type]
    }));
  };

  // دالة تصدير الفاتورة
  const handleExportInvoice = (order: Order) => {
    const invoiceData = {
      id: order.id,
      date: order.date,
      time: order.time,
      customer: {
        name: order.customer?.name || 'مجهول',
        phone: order.customer?.phone || '',
        email: order.customer?.email || '',
        address: order.customer?.address || '',
        city: order.customer?.city || ''
      },
      items: (order.items || []).map((item, index) => ({
        id: index + 1,
        name: item.product.name,
        image: item.product.images[0],
        specifications: `المقاس: ${item.size} - اللون: ${item.color}`,
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: item.product.price * item.quantity
      })),
      subtotal: order.subtotal,
      shippingCost: order.shippingCost || (order.shipping as any)?.cost || 0,
      discountAmount: order.discountAmount || 0,
      discountPercentage: order.discountPercentage || 0,
      finalTotal: order.finalTotal
    };

    setSelectedInvoice(invoiceData);
    setShowInvoiceModal(true);
  };

  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'confirmed':
        return { label: 'مؤكد', color: 'bg-blue-500', icon: <CheckCircle className="h-4 w-4" /> };
      case 'processing':
        return { label: 'جاري التحضير', color: 'bg-yellow-500', icon: <Clock className="h-4 w-4" /> };
      case 'shipped':
        return { label: 'تم الشحن', color: 'bg-purple-500', icon: <Truck className="h-4 w-4" /> };
      case 'delivered':
        return { label: 'تم التسليم', color: 'bg-green-500', icon: <Package className="h-4 w-4" /> };
      default:
        return { label: 'غير محدد', color: 'bg-gray-500', icon: <Clock className="h-4 w-4" /> };
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ar-LY') + ' ' + date.toLocaleTimeString('ar-LY');
    } catch {
      return dateStr;
    }
  };

  const generateProductUrl = (product: Product) => {
    return `${window.location.origin}/product/${product.id}?utm_source=favorites_share&utm_medium=social&utm_campaign=eshro`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white orders-page" id="orders-section">
      {/* شريط التنقل العلوي */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="flex items-center gap-2 hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4" />
              العودة للرئيسية
            </Button>
            <div className="flex items-center gap-2">
              <img 
                src="/eshro-new-logo.png" 
                alt="إشرو" 
                className="h-8 w-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLElement).parentElement;
                  if (parent) {
                    parent.innerHTML += '<span class="text-xl font-bold text-primary">إشرو</span>';
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          طلباتي
        </h1>

        {/* أزرار التبويب - من اليمين إلى اليسار */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('favorites')}
              data-tab="favorites"
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'favorites'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              <Heart className="h-4 w-4 inline-block ml-2" />
              طلبات المفضلة ({favorites.length})
            </button>
            <button
              onClick={() => setActiveTab('unavailable')}
              data-tab="unavailable"
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'unavailable'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              <Bell className="h-4 w-4 inline-block ml-2" />
              طلبات غير متوفرة ({localUnavailableItems.length})
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              data-tab="purchases"
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'purchases'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              <Package className="h-4 w-4 inline-block ml-2" />
              المشتريات ({orders.length})
            </button>
          </div>
        </div>

        {/* قسم طلبات المفضلة */}
        {activeTab === 'favorites' && (
          <div className="space-y-4">
            {favorites.length === 0 ? (
              <Card className="p-8 text-center">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  لا توجد منتجات مفضلة
                </h3>
                <p className="text-gray-500">
                  ابدأ بإضافة منتجات لقائمة المفضلة لتراها هنا
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((product, index) => {
                  const rawProduct: any = product;
                  const productKey = resolveProductKey(rawProduct, index);
                  const productImage = resolveProductImage(rawProduct);
                  const productName = rawProduct.name || rawProduct.product?.name || 'منتج من متاجر إشرو';
                  const productPrice = rawProduct.price ?? rawProduct.product?.price ?? 0;
                  const productOriginalPrice = rawProduct.originalPrice ?? rawProduct.product?.originalPrice;
                  const quantity = favoriteQuantities[productKey] || 1;
                  const removableId = typeof rawProduct.id === 'number' ? rawProduct.id : typeof rawProduct.product?.id === 'number' ? rawProduct.product.id : undefined;
                  const baseShareData = { ...rawProduct, id: removableId ?? rawProduct.id };
                  const normalizedImages = Array.isArray(baseShareData.images) && baseShareData.images.length > 0 ? baseShareData.images : productImage ? [productImage] : [];
                  const shareData = { ...baseShareData, images: normalizedImages } as Product;

                  return (
                    <Card key={productKey} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                      <div className="relative">
                        <img
                          src={productImage || '/assets/products/placeholder.png'}
                          alt={productName}
                          className="w-full h-32 object-cover"
                          onError={(event) => {
                            (event.target as HTMLImageElement).src = '/assets/products/placeholder.png';
                          }}
                        />
                        
                        <button
                          onClick={() => {
                            if (removableId !== undefined) {
                              onRemoveFavorite(removableId);
                            }
                          }}
                          title="إزالة من المفضلة"
                          className="absolute top-2 left-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        
                        <div className="absolute top-2 right-2">
                          <ShareMenu 
                            url={generateProductUrl(shareData)}
                            title={`تحقق من هذا المنتج الرائع: ${productName} - سعر مميز ${productPrice} د.ل في متجر إشرو!`}
                            className="w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                            size="sm"
                            variant="default"
                          />
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {productName}
                        </h3>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg font-bold text-primary">
                            {productPrice} د.ل
                          </span>
                          {productOriginalPrice !== undefined && productOriginalPrice > productPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {productOriginalPrice} د.ل
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-600">الكمية:</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateFavoriteQuantity(productKey, -1)}
                              disabled={quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-semibold">
                              {quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateFavoriteQuantity(productKey, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => onAddToCart(shareData)}
                          className="w-full bg-primary hover:bg-primary/90 text-white"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          أضف للسلة
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* قسم طلبات غير متوفرة */}
        {activeTab === 'unavailable' && (
          <div className="space-y-4">
            {localUnavailableItems.length === 0 ? (
              <Card className="p-8 text-center">
                <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  لا توجد طلبات إشعار
                </h3>
                <p className="text-gray-500">
                  عندما تطلب إشعاراً لمنتج غير متوفر، سيظهر هنا
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {localUnavailableItems.map((item, index) => (
                  <Card key={index} className="overflow-hidden border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* صورة المنتج */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.images?.[0] || '/assets/products/placeholder.png'}
                            alt={item.name || 'منتج غير متوفر'}
                            className="w-full h-full object-cover opacity-80"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/products/placeholder.png';
                            }}
                          />
                        </div>

                        {/* المعلومات */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">

                            {/* المعلومات على اليمين */}
                            <div className="text-right flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {item.name}
                              </h3>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div>الكمية: {(item as any).notificationData?.quantity || 1}</div>
                                <div>الهاتف: {(item as any).notificationData?.phone}</div>
                                {(item as any).notificationData?.email && (
                                  <div>البريد الإلكتروني: {(item as any).notificationData.email}</div>
                                )}
                              </div>
                            </div>

                            {/* التاريخ والوقت والحالة والزر على اليسار */}
                            <div className="text-left">
                              <div className="text-xs text-gray-500 mb-2">
                                <div>{new Date((item as any).requestedAt).toLocaleDateString('ar-LY')}</div>
                                <div>{new Date((item as any).requestedAt).toLocaleTimeString('ar-LY', {
                                  hour12: true,
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}</div>
                              </div>

                              {/* زر الإزالة */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowRemoveConfirmModal(index)}
                                className="mb-2 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                              >
                                <X className="h-4 w-4 mr-1" />
                                إزالة
                              </Button>

                              {/* حالة في الانتظار */}
                              <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300 px-3 py-1">
                                في الانتظار
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* قسم المشتريات */}
        {activeTab === 'purchases' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  لا توجد عمليات شراء
                </h3>
                <p className="text-gray-500">
                  عمليات الشراء المكتملة ستظهر هنا
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.filter(order => order && order.id).map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  
                  return (
                    <Card key={order.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          
                          {/* معلومات الطلب */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                  طلب رقم: {order.id}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {formatDateTime(order.date)}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                {/* زر حذف الطلب */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (window.confirm('هل أنت متأكد من حذف هذا الطلب؟ لن يمكن استرجاع هذه العملية.')) {
                                      onDeleteOrder(order.id);
                                    }
                                  }}
                                  className="flex items-center gap-2 hover:bg-red-50 hover:border-red-300 text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  حذف
                                </Button>
                                
                                {/* زر تصدير الفاتورة */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleExportInvoice(order)}
                                  className="flex items-center gap-2 hover:bg-primary/10 hover:border-primary"
                                >
                                  <Download className="h-4 w-4" />
                                  تصدير الفاتورة
                                </Button>
                                
                                <Badge className={`${statusInfo.color} text-white px-3 py-1`}>
                                  {statusInfo.icon}
                                  <span className="mr-1">{statusInfo.label}</span>
                                </Badge>
                              </div>
                            </div>
                            
                            {/* منتجات الطلب */}
                            <div className="space-y-3 mb-4">
                              {(order.items || []).map((item, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                  <img
                                    src={item.product?.images?.[0] || '/assets/products/placeholder.png'}
                                    alt={item.product?.name || 'منتج'}
                                    className="w-16 h-16 object-cover rounded-lg"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/assets/products/placeholder.png';
                                    }}
                                  />
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">
                                      {item.product?.name || 'منتج غير محدد'}
                                    </h4>
                                    <div className="text-sm text-gray-600">
                                      المقاس: {item.size || 'غير محدد'} • اللون: {item.color || 'غير محدد'} • الكمية: {item.quantity || 0}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-primary font-semibold">
                                        {((item.product?.price || 0) * (item.quantity || 0)).toFixed(2)} د.ل
                                      </span>
                                      {(item.product?.originalPrice || 0) > (item.product?.price || 0) && (
                                        <span className="text-xs text-gray-500 line-through">
                                          {((item.product?.originalPrice || 0) * (item.quantity || 0)).toFixed(2)} د.ل
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* ملخص الفاتورة الكامل */}
                            <div className="bg-primary/5 rounded-lg p-4">
                              <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                  <span>إجمالي المنتجات:</span>
                                  <span className="font-medium">{(order.subtotal || 0).toFixed(2)} د.ل</span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <span>قيمة الشحن والتوصيل:</span>
                                  <span className="font-medium">
                                    {(() => {
                                      // تحقق من وجود قيمة الشحن أو حسابها من بيانات الطلب
                                      const actualShippingCost = order.shippingCost || (order.shipping as any)?.cost || 0;
                                      if (actualShippingCost === 0 && order.shipping?.type) {
                                        // إذا لم توجد قيمة شحن ولكن هناك نوع شحن، نحسب تقديري
                                        const isInTripoli = order.customer?.city === 'طرابلس' || order.customer?.city?.toLowerCase() === 'tripoli';
                                        if (order.shipping.type === 'express') {
                                          return (isInTripoli ? '85-120' : '120-185') + ' د.ل';
                                        } else {
                                          return (isInTripoli ? '30-45' : '50-85') + ' د.ل';
                                        }
                                      }
                                      return actualShippingCost.toFixed(2) + ' د.ل';
                                    })()} 
                                    <span className="text-xs text-gray-500 block">
                                      ({order.shipping?.type === 'express' ? 'سريع' : 'عادي'} - {order.shipping?.estimatedTime || '24-96 ساعة'})
                                    </span>
                                  </span>
                                </div>
                                
                                {order.discountAmount > 0 && (
                                  <div className="flex justify-between items-center text-green-600">
                                    <span>قيمة خصم الكوبون ({order.discountPercentage || 1.5}%):</span>
                                    <span className="font-medium">-{(order.discountAmount || 0).toFixed(2)} د.ل</span>
                                  </div>
                                )}
                                
                                <hr className="border-gray-400 my-2" />
                                
                                <div className="flex justify-between items-center font-bold text-lg pt-2 bg-white rounded-lg px-3 py-2 border">
                                  <span>المجموع النهائي:</span>
                                  <span className="text-primary text-xl">
                                    {((order.subtotal || 0) + (order.shippingCost || 0) - (order.discountAmount || 0)).toFixed(2)} د.ل
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* نافذة نبهني عند التوفر */}
      {showNotifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <img
                  src={getProxyImageUrl(showNotifyModal.images[0] || '', (showNotifyModal as any).storeSlug, 'products')}
                  alt={showNotifyModal.name}
                  className="w-24 h-24 object-cover rounded-lg mx-auto mb-4"
                />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {showNotifyModal.name}
                </h3>
                <p className="text-sm text-gray-600">
                  سنرسل لك إشعاراً فور توفر هذا المنتج
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="notify-name">الاسم بالكامل *</Label>
                  <Input
                    id="notify-name"
                    value={notifyForm.name}
                    onChange={(e) => setNotifyForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="أدخل اسمك الكامل"
                    className="text-right"
                  />
                </div>

                <div>
                  <Label htmlFor="notify-phone">رقم الموبايل *</Label>
                  <Input
                    id="notify-phone"
                    value={notifyForm.phone}
                    onChange={(e) => setNotifyForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="9X XXXXXXX"
                    className="text-right"
                  />
                </div>

                <div>
                  <Label htmlFor="notify-email">البريد الإلكتروني *</Label>
                  <Input
                    id="notify-email"
                    type="email"
                    value={notifyForm.email}
                    onChange={(e) => setNotifyForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="example@email.com"
                    className="text-right"
                  />
                </div>

                <div>
                  <Label>نوع الإشعار *</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[
                      { id: 'email', label: 'بريد إلكتروني', icon: <Mail className="h-4 w-4" /> },
                      { id: 'sms', label: 'SMS رسالة نصية', icon: <MessageSquare className="h-4 w-4" /> },
                      { id: 'whatsapp', label: 'واتساب', icon: <Phone className="h-4 w-4" /> }
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => toggleNotificationType(type.label)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                          notifyForm.notificationTypes.includes(type.label)
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 hover:border-primary'
                        }`}
                      >
                        {type.icon}
                        <span className="text-sm">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleNotifySubmit}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    نبهني عند التوفر
                  </Button>
                  <Button
                    onClick={() => setShowNotifyModal(null)}
                    variant="outline"
                  >
                    <X className="h-4 w-4 mr-2" />
                    إلغاء
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* نافذة نجاح التسجيل */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                تم التسجيل بنجاح!
              </h3>
              <p className="text-gray-600 mb-4">
                شكراً لك! سنرسل لك إشعاراً فور توفر هذا المنتج إليك
              </p>
              <p className="text-sm text-gray-500 mb-6">
                يمكنك متابعة جميع طلبات الإشعارات الخاصة بك بحسابك الشخصي بمتجر إشرو
              </p>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setActiveTab('unavailable');
                    // الانتقال إلى صفحة الطلبات وتفعيل تبويب طلبات غير متوفرة
                    setTimeout(() => {
                      const ordersPage = document.querySelector('.orders-page') || document.querySelector('#orders-section');
                      if (ordersPage) {
                        ordersPage.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  تابع عند التوفر
                </Button>
                <Button
                  onClick={() => setShowSuccessModal(false)}
                  variant="outline"
                >
                  إغلاق
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* مودال الفاتورة */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <InvoiceGenerator
              invoice={selectedInvoice}
              onPrint={() => {
                void 0;
              }}
              onDownload={() => {
                void 0;
              }}
              onClose={() => {
                setShowInvoiceModal(false);
                setSelectedInvoice(null);
              }}
            />
          </div>
        </div>
      )}

      {/* مودال تأكيد الإزالة */}
      {showRemoveConfirmModal !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="h-8 w-8 text-red-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                تأكيد الإزالة
              </h3>
              <p className="text-gray-600 mb-6">
                هل أنت متأكد من أنك تريد إزالة هذا الطلب من قائمة الطلبات غير المتوفرة؟
                <br />
                لن تتلقى إشعاراً عند توفر هذا المنتج بعد الإزالة.
              </p>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    // إزالة العنصر من localStorage مباشرة
                    const currentItems = JSON.parse(localStorage.getItem('eshro_unavailable') || '[]');
                    const updatedItems = currentItems.filter((_, i) => i !== showRemoveConfirmModal);
                    localStorage.setItem('eshro_unavailable', JSON.stringify(updatedItems));

                    // تحديث الحالة المحلية مباشرة
                    setLocalUnavailableItems(updatedItems);

                    // إشعار المكونات الأخرى بالتغيير
                    window.dispatchEvent(new Event('storage'));

                    // إغلاق نافذة التأكيد
                    setShowRemoveConfirmModal(null);

                    // إظهار رسالة نجاح مؤقتة
                    alert('تم إزالة الطلب بنجاح!');
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  إزالة
                </Button>
                <Button
                  onClick={() => setShowRemoveConfirmModal(null)}
                  variant="outline"
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// دالة مساعدة لتنسيق التاريخ
const formatDateTime = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-LY') + ' ' + date.toLocaleTimeString('ar-LY');
  } catch {
    return dateStr;
  }
};

export default CompleteOrdersPage;
