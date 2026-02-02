import React, { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  X, 
  Bell, 
  Mail, 
  MessageCircle, 
  Phone,
  Check,
  Plus,
  Minus,
  CheckCircle,
  Smartphone
} from 'lucide-react';
import type { Product } from '@/data/storeProducts';
import {
  PRODUCT_IMAGE_FALLBACK_SRC,
  advanceImageOnError,
  buildProductMediaConfig,
  getImageMimeType
} from '@/lib/utils';
import { getApiUrl } from '@/utils/apiConfig';

const VISITOR_FLAG_KEY = 'eshro_logged_in_as_visitor';
const VISITOR_DATA_KEY = 'eshro_visitor_user';
const CUSTOMER_KEY = 'eshro_unavailable';
const API_BASE_URL = getApiUrl();

interface EnhancedNotifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSubmit: (notificationData: NotificationRequest) => void;
}

interface NotificationRequest {
  productId: number;
  productName: string;
  customerName: string;
  phone: string;
  email?: string;
  notificationMethods: string[];
  quantity: number;
}

const EnhancedNotifyModal: React.FC<EnhancedNotifyModalProps> = ({
  isOpen,
  onClose,
  product,
  onSubmit
}) => {
  const [currentStep, setCurrentStep] = useState(1); // 1 = نموذج التسجيل، 2 = شاشة التأكيد
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    notificationMethods: [] as string[],
    quantity: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // تحميل بيانات الزائر إذا كان مسجلاً
  useEffect(() => {
    if (isOpen) {
      const loggedIn = localStorage.getItem(VISITOR_FLAG_KEY) === 'true';
      if (loggedIn) {
        const stored = localStorage.getItem(VISITOR_DATA_KEY);
        if (stored) {
          try {
            const visitor = JSON.parse(stored);
            setFormData(prev => ({
              ...prev,
              customerName: prev.customerName || visitor.name || `${visitor.firstName || ''} ${visitor.lastName || ''}`.trim(),
              phone: prev.phone || visitor.phone || '',
              email: prev.email || visitor.email || ''
            }));
          } catch (e) {
            // Error parsing visitor data
          }
        }
      }
    }
  }, [isOpen]);

  const mediaConfig = useMemo(
    () => buildProductMediaConfig(product, PRODUCT_IMAGE_FALLBACK_SRC),
    [product]
  );

  if (!isOpen) return null;

  const persistCustomerRecord = (notificationData: NotificationRequest) => {
    const existing = (() => {
      try {
        return JSON.parse(localStorage.getItem(CUSTOMER_KEY) || '[]');
      } catch {
        return [];
      }
    })();
    
    const entry = {
      id: `notify-${Date.now()}`,
      name: product.name,
      images: product.images || [],
      description: product.description,
      price: 0,
      originalPrice: product.originalPrice || product.price || 0,
      storeSlug: product.storeSlug || 'eshro-store',
      storeName: product.storeName || 'متجر إشرو',
      notificationData,
      requestedAt: new Date().toISOString()
    };
    
    existing.push(entry);
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(existing));
    window.dispatchEvent(new Event('storage'));
  };

  const persistMerchantRecord = (notificationData: NotificationRequest) => {
    const storeSlug = product.storeSlug || 'eshro-store';
    const merchantStoreKey = `eshro_unavailable_orders_${storeSlug}`;
    
    const existing = (() => {
      try {
        return JSON.parse(localStorage.getItem(merchantStoreKey) || '[]');
      } catch {
        return [];
      }
    })();

    const now = new Date();
    const record = {
      id: `notify-${Date.now()}`,
      productCode: `ESHRO-${product.storeId || 'STD'}-${product.id || '0000'}`,
      productName: product.name,
      productImage: product.images?.[0] || '',
      customerName: notificationData.customerName,
      customerEmail: notificationData.email,
      customerPhone: notificationData.phone,
      requestedQuantity: notificationData.quantity,
      requestedAt: now.toLocaleDateString('ar-LY'),
      requestedTime: now.toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
      merchantStatus: 'pending',
      notificationSent: false,
      notificationChannels: notificationData.notificationMethods,
      storeSlug
    };

    existing.push(record);
    localStorage.setItem(merchantStoreKey, JSON.stringify(existing));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName.trim()) {
      alert('يرجى إدخال الاسم الكامل');
      return;
    }

    if (!formData.phone.trim()) {
      alert('يرجى إدخال رقم الهاتف');
      return;
    }

    if (!/^09\d{8}$/.test(formData.phone.trim())) {
      alert('يرجى إدخال رقم هاتف صحيح (مثال: 0912345678)');
      return;
    }

    if (formData.notificationMethods.length === 0) {
      alert('يرجى اختيار طريقة واحدة على الأقل للإشعار');
      return;
    }

    setIsSubmitting(true);

    try {
      const notificationData: NotificationRequest = {
        productId: product.id,
        productName: product.name,
        customerName: formData.customerName,
        phone: formData.phone,
        email: formData.email,
        notificationMethods: formData.notificationMethods,
        quantity: formData.quantity
      };

      // إرسال الطلب لـ API
      try {
        const response = await fetch(`${API_BASE_URL}/stores/unavailable/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeId: product.storeId,
            storeSlug: product.storeSlug,
            productId: product.id,
            productName: product.name,
            customerName: notificationData.customerName,
            phone: notificationData.phone,
            email: notificationData.email,
            quantity: notificationData.quantity,
            notificationTypes: notificationData.notificationMethods,
            requestedAt: new Date().toISOString()
          })
        });
        
        if (!response.ok) {
          // Silent failure for API, proceed with local persistence
        }
      } catch (apiError) {
        // API Offline or other error
      }
      
      persistCustomerRecord(notificationData);
      persistMerchantRecord(notificationData);
      
      onSubmit(notificationData);
      setCurrentStep(2); // الانتقال لشاشة التأكيد
      
    } catch (error) {
      alert('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleNotificationMethod = (method: string) => {
    setFormData(prev => ({
      ...prev,
      notificationMethods: prev.notificationMethods.includes(method)
        ? prev.notificationMethods.filter(m => m !== method)
        : [...prev.notificationMethods, method]
    }));
  };

  const updateQuantity = (delta: number) => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + delta)
    }));
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      customerName: '',
      phone: '',
      email: '',
      notificationMethods: [],
      quantity: 1
    });
    onClose();
  };

  // الشاشة الأولى - نموذج التسجيل (كما في الصورة 255)
  if (currentStep === 1) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md bg-white shadow-2xl">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">نبهني عند التوفر</h2>
              
              {/* صورة المنتج */}
              <div className="mb-4">
                <picture>
                  {mediaConfig.pictureSources.map((src) => {
                    const type = getImageMimeType(src);
                    return <source key={src} srcSet={src} {...(type ? { type } : {})} />;
                  })}
                  <img
                    src={mediaConfig.primary}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg mx-auto"
                    data-image-sources={JSON.stringify(mediaConfig.datasetSources)}
                    data-image-index="0"
                    data-fallback-src={PRODUCT_IMAGE_FALLBACK_SRC}
                    onError={advanceImageOnError}
                  />
                </picture>
              </div>
              
              {/* اسم المنتج */}
              <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
              
              {/* السعر */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-lg font-bold text-gray-900">{product.price} د.ل</span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-gray-500 line-through">{product.originalPrice} د.ل</span>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* الاسم بالكامل */}
              <div>
                <Input
                  type="text"
                  placeholder="الاسم بالكامل"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              {/* رقم الهاتف */}
              <div>
                <Input
                  type="tel"
                  placeholder="رقم الهاتف"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              {/* البريد الإلكتروني */}
              <div>
                <Input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* الكمية */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الكمية:</label>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(-1)}
                    className="w-8 h-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold min-w-[2rem] text-center">
                    {formData.quantity}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(1)}
                    className="w-8 h-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* نوع الإشعار */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">نوع الإشعار:</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notificationMethods.includes('email')}
                      onChange={() => toggleNotificationMethod('email')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Mail className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">📧 بريد إلكتروني</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notificationMethods.includes('sms')}
                      onChange={() => toggleNotificationMethod('sms')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Smartphone className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">📱 رسالة نصية</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notificationMethods.includes('whatsapp')}
                      onChange={() => toggleNotificationMethod('whatsapp')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <MessageCircle className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">📲 واتساب</span>
                  </label>
                </div>
              </div>

              {/* أزرار العمل */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'جاري التسجيل...' : '🔔 نبهني عند التوفر'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="px-6"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // الشاشة الثانية - تأكيد التسجيل (كما في الصورة 256)
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <CardContent className="p-6">
          <div className="text-center">
            {/* صورة المنتج */}
            <div className="mb-4">
              <picture>
                {mediaConfig.pictureSources.map((src) => {
                  const type = getImageMimeType(src);
                  return <source key={src} srcSet={src} {...(type ? { type } : {})} />;
                })}
                <img
                  src={mediaConfig.primary}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-lg mx-auto"
                  data-image-sources={JSON.stringify(mediaConfig.datasetSources)}
                  data-image-index="0"
                  data-fallback-src={PRODUCT_IMAGE_FALLBACK_SRC}
                  onError={advanceImageOnError}
                />
              </picture>
            </div>
            
            {/* اسم المنتج */}
            <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
            
            {/* حالة عدم التوفر */}
            <div className="text-red-600 font-medium mb-4">غير متوفر حالياً</div>
            
            {/* رسالة النجاح */}
            <div className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h4 className="text-lg font-bold text-green-600 mb-2">تم التسجيل بنجاح !</h4>
              <p className="text-sm text-gray-700 mb-4">
                شكراً لك ! سنرسل لك إشعاراً فور توفر هذا المنتج في أقرب وقت ممكن
              </p>
              <p className="text-xs text-gray-600">
                يمكنك متابعة جميع طلبات الإشعارات الخاصة بك من حسابك الشخصي
              </p>
            </div>

            {/* أزرار العمل */}
            <div className="flex gap-3">
              <Button
                onClick={handleClose}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Bell className="h-4 w-4 mr-2" />
                🔔 تابع عند التوفر
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="px-6"
              >
                <X className="h-4 w-4 mr-2" />
                ❌ إغلاق
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedNotifyModal;
