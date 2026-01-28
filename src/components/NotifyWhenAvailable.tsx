import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MessageCircle, Check } from 'lucide-react';
import type { Product } from '@/data/storeProducts';
import { getStoresData } from '@/data/ecommerceData';
import { getProxyImageUrl } from '@/utils/assetProxyUtil';
import { getDefaultProductImageSync } from '@/utils/imageUtils';
import { getApiUrl } from '@/utils/apiConfig';

interface NotifyWhenAvailableProps {
  product: Product | any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: NotificationRequest) => void;
  storeSlug?: string | undefined;
  storeName?: string | undefined;
}

export interface NotificationRequest {
  id: string;
  productId: number;
  productName: string;
  customerName: string;
  phone: string;
  email: string;
  quantity: number;
  notificationTypes: string[];
  dateRequested: string;
  storeId?: number;
  storeSlug?: string;
  storeName?: string;
}

type Step = 'subscription' | 'otp' | 'form' | 'success';

const OTP_CODE = '66055';
const VISITOR_FLAG_KEY = 'eshro_logged_in_as_visitor';
const VISITOR_DATA_KEY = 'eshro_visitor_user';
const CUSTOMER_KEY = 'eshro_unavailable';
const MERCHANT_KEY = 'eshro_unavailable_orders';
const API_BASE_URL = getApiUrl();

const getInitialFormState = () => ({
  customerName: '',
  phone: '',
  email: '',
  notificationTypes: [] as string[],
  quantity: 1
});

const NotifyWhenAvailable: React.FC<NotifyWhenAvailableProps> = ({
  product,
  isOpen,
  onClose,
  onSubmit,
  storeSlug,
  storeName
}) => {
  const storesCatalog = useMemo(() => getStoresData(), []);
  const [step, setStep] = useState<Step>('form');
  const [formData, setFormData] = useState(getInitialFormState);
  const [subscriptionData, setSubscriptionData] = useState({ fullName: '', email: '', phone: '' });
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [currentVisitor, setCurrentVisitor] = useState<any | null>(null);

  const resolvedStore = useMemo(() => {
    if (storeSlug) {
      const bySlug = storesCatalog.find((store) => store.slug === storeSlug);
      if (bySlug) {
        return bySlug;
      }
      return { slug: storeSlug, name: storeName || storeSlug };
    }
    if (product?.storeId) {
      const byId = storesCatalog.find((store) => store.id === product.storeId);
      if (byId) {
        return byId;
      }
    }
    if (product?.storeSlug) {
      const fallback = storesCatalog.find((store) => store.slug === product.storeSlug);
      if (fallback) {
        return fallback;
      }
      return { slug: product.storeSlug, name: product.storeName || product.storeSlug };
    }
    return undefined;
  }, [storeSlug, storeName, product, storesCatalog]);

  const derivedStoreSlug = resolvedStore?.slug || storeSlug || product?.storeSlug || 'eshro-store';
  const derivedStoreName = resolvedStore?.name || storeName || product?.storeName || 'متجر إشرو';

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    hydrateVisitor();
    resetTransientState(false);
  }, [isOpen]);

  useEffect(() => {
    if (!currentVisitor) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      customerName:
        prev.customerName ||
        currentVisitor.name ||
        `${currentVisitor.firstName || ''} ${currentVisitor.lastName || ''}`.trim(),
      phone: prev.phone || currentVisitor.phone || '',
      email: prev.email || currentVisitor.email || ''
    }));
  }, [currentVisitor]);

  const hydrateVisitor = () => {
    if (typeof window === 'undefined') {
      setStep('subscription');
      return;
    }
    const loggedIn = localStorage.getItem(VISITOR_FLAG_KEY) === 'true';
    if (loggedIn) {
      const stored = localStorage.getItem(VISITOR_DATA_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCurrentVisitor(parsed);
        } catch {
          setCurrentVisitor(null);
        }
      }
      setStep('form');
    } else {
      setCurrentVisitor(null);
      setStep('subscription');
    }
  };

  const resetTransientState = (fullReset: boolean) => {
    setSubscriptionData({ fullName: '', email: '', phone: '' });
    setOtpValue('');
    setOtpError('');
    setGlobalError('');
    if (fullReset) {
      setFormData(getInitialFormState());
      hydrateVisitor();
    }
  };

  const handleClose = () => {
    resetTransientState(true);
    onClose();
  };

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleNotificationMethod = (method: string) => {
    setFormData((prev) => ({
      ...prev,
      notificationTypes: prev.notificationTypes.includes(method)
        ? prev.notificationTypes.filter((m) => m !== method)
        : [...prev.notificationTypes, method]
    }));
  };

  const updateQuantity = (delta: number) => {
    setFormData((prev) => ({ ...prev, quantity: Math.max(1, prev.quantity + delta) }));
  };

  const handleSubscriptionSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!subscriptionData.fullName.trim() || !subscriptionData.email.trim() || !/^09\d{8}$/.test(subscriptionData.phone)) {
      setGlobalError('يرجى إدخال بيانات الاشتراك بشكل صحيح');
      return;
    }
    setGlobalError('');
    setStep('otp');
  };

  const persistVisitor = (visitor: any) => {
    localStorage.setItem(VISITOR_DATA_KEY, JSON.stringify(visitor));
    localStorage.setItem(VISITOR_FLAG_KEY, 'true');
    window.dispatchEvent(new CustomEvent('eshro:visitor:login', { detail: visitor }));
  };

  const handleOtpSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (otpValue.trim() !== OTP_CODE) {
      setOtpError('رمز التحقق غير صحيح');
      return;
    }
    const parts = subscriptionData.fullName.trim().split(' ').filter(Boolean);
    const visitorRecord = {
      id: `visitor-${Date.now()}`,
      name: subscriptionData.fullName.trim(),
      firstName: parts[0] || subscriptionData.fullName.trim(),
      lastName: parts.slice(1).join(' '),
      phone: subscriptionData.phone,
      email: subscriptionData.email,
      membershipType: 'عضو مسجل',
      joinedAt: new Date().toISOString()
    };
    persistVisitor(visitorRecord);
    setCurrentVisitor(visitorRecord);
    setFormData((prev) => ({
      ...prev,
      customerName: subscriptionData.fullName.trim(),
      phone: subscriptionData.phone,
      email: subscriptionData.email
    }));
    setStep('form');
    setOtpValue('');
    setOtpError('');
  };

  const persistCustomerRecord = (notificationData: NotificationRequest) => {
    const existing = (() => {
      if (typeof window === 'undefined') {
        return [] as any[];
      }
      try {
        return JSON.parse(localStorage.getItem(CUSTOMER_KEY) || '[]');
      } catch {
        return [] as any[];
      }
    })();
    const entry = {
      id: notificationData.id,
      name: product?.name,
      images: product?.images || [],
      description: product?.description,
      price: 0,
      originalPrice: product?.originalPrice || product?.price || 0,
      storeSlug: derivedStoreSlug,
      storeName: derivedStoreName,
      notificationData,
      requestedAt: notificationData.dateRequested
    };
    existing.push(entry);
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(existing));
    window.dispatchEvent(new Event('storage'));
  };

  const persistMerchantRecord = (notificationData: NotificationRequest) => {
    if (typeof window === 'undefined') {
      return;
    }

    const merchantStoreKey = `eshro_unavailable_orders_${derivedStoreSlug}`;
    
    const existing = (() => {
      try {
        return JSON.parse(localStorage.getItem(merchantStoreKey) || '[]');
      } catch {
        return [] as any[];
      }
    })();

    const requestedAt = new Date(notificationData.dateRequested);
    const record = {
      id: notificationData.id,
      productCode: `ESHRO-${product?.storeId || 'STD'}-${product?.id || '0000'}`,
      productName: product?.name,
      productImage: product?.images?.[0] || '',
      customerName: notificationData.customerName,
      customerEmail: notificationData.email,
      customerPhone: notificationData.phone,
      requestedQuantity: notificationData.quantity,
      requestedAt: requestedAt.toLocaleDateString('ar-LY'),
      requestedTime: requestedAt.toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'pending',
      merchantStatus: 'pending',
      notificationSent: false,
      notificationChannels: notificationData.notificationTypes,
      storeSlug: derivedStoreSlug
    };

    existing.push(record);
    localStorage.setItem(merchantStoreKey, JSON.stringify(existing));
    // eslint-disable-next-line no-console
    console.log('[NotifyWhenAvailable] Saved unavailable order to localStorage:', { storeSlug: derivedStoreSlug, key: merchantStoreKey, record });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.customerName.trim() || !formData.phone.trim() || !formData.email.trim()) {
      setGlobalError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    if (!/^09\d{8}$/.test(formData.phone.trim())) {
      setGlobalError('يرجى إدخال رقم الهاتف بالصيغة الصحيحة: 09XXXXXXXX');
      return;
    }
    if (formData.notificationTypes.length === 0) {
      setGlobalError('يرجى اختيار طريقة إشعار واحدة على الأقل');
      return;
    }
    setIsSubmitting(true);
    setGlobalError('');
    const nowIso = new Date().toISOString();
    const notificationData: NotificationRequest = {
      id: `notify-${Date.now()}`,
      productId: product?.id || 0,
      productName: product?.name || 'منتج غير معروف',
      customerName: formData.customerName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      quantity: formData.quantity,
      notificationTypes: formData.notificationTypes,
      dateRequested: nowIso,
      storeId: product?.storeId,
      storeSlug: derivedStoreSlug,
      storeName: derivedStoreName
    };
    try {
      if (typeof fetch !== 'undefined') {
        const endpoint = `${API_BASE_URL}/stores/unavailable/notify`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            storeId: product?.storeId,
            storeSlug: derivedStoreSlug,
            productId: product?.id,
            productName: product?.name,
            customerName: notificationData.customerName,
            phone: notificationData.phone,
            email: notificationData.email,
            quantity: notificationData.quantity,
            notificationTypes: notificationData.notificationTypes,
            requestedAt: notificationData.dateRequested
          })
        });
        if (!response.ok) {
          void 0;
        }
      }
    } catch (error) {

    }
    try {
      persistCustomerRecord(notificationData);
      persistMerchantRecord(notificationData);
      onSubmit?.(notificationData);
      setStep('success');
    } catch (error) {

      setGlobalError('حدث خطأ أثناء حفظ الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const notificationOptions = [
    { id: 'email', label: 'بريد إلكتروني', icon: Mail },
    { id: 'sms', label: 'رسالة نصية', icon: Phone },
    { id: 'whatsapp', label: 'واتساب', icon: MessageCircle }
  ];

  const productPriceBlock = (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
      <img
        src={getProxyImageUrl(product?.images?.[0] || product?.image || getDefaultProductImageSync(derivedStoreSlug), derivedStoreSlug, 'products')}
        alt={product?.name}
        className="w-20 h-20 object-cover rounded-lg"
        onError={(e) => {
          (e.target as HTMLImageElement).src = getDefaultProductImageSync(derivedStoreSlug);
        }}
      />
      <div className="text-right flex-1">
        <h3 className="font-bold text-gray-800 text-lg">{product?.name || 'منتج غير معروف'}</h3>
        <p className="text-sm text-gray-600 mt-1">
          {product?.quantity === 0 || !product?.inStock ? 'غير متوفر حالياً' : `قيمة المنتج: ${product?.price || 0} د.ل`}
        </p>
      </div>
    </div>
  );

  const renderSubscriptionStep = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border-0 bg-white rounded-2xl">
        <CardHeader className="text-center pb-4 pt-6">
          <CardTitle className="text-2xl font-bold text-gray-800 mb-4">
            كن جزءاً من عائلة إشرو
          </CardTitle>
          {productPriceBlock}
        </CardHeader>
        <CardContent className="p-6">
          <form className="space-y-4" onSubmit={handleSubscriptionSubmit}>
            <div className="space-y-2">
              <Label className="text-right block font-medium">
                الاسم بالكامل
              </Label>
              <Input
                value={subscriptionData.fullName}
                onChange={(e) => setSubscriptionData((prev) => ({ ...prev, fullName: e.target.value }))}
                className="text-right"
                placeholder="أدخل اسمك الكامل"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-right block font-medium">
                البريد الإلكتروني
              </Label>
              <Input
                type="email"
                value={subscriptionData.email}
                onChange={(e) => setSubscriptionData((prev) => ({ ...prev, email: e.target.value }))}
                className="text-right"
                placeholder="example@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-right block font-medium">
                رقم الموبايل (09XXXXXXXX)
              </Label>
              <Input
                value={subscriptionData.phone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                  setSubscriptionData((prev) => ({ ...prev, phone: digits }));
                }}
                className="text-right"
                placeholder="0920000000"
              />
            </div>
            {globalError && (
              <p className="text-sm text-red-600 text-right">{globalError}</p>
            )}
            <Button type="submit" className="w-full bg-[#FF6347] hover:bg-[#E5533D] text-white py-4 text-lg font-bold rounded-xl shadow-lg transition-all duration-300">
              تسجيل الاشتراك
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} className="w-full py-3 text-lg font-bold rounded-xl">
              إلغاء
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  const renderOtpStep = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
      <Card className="max-w-md w-full shadow-2xl border-0 bg-white rounded-2xl">
        <CardHeader className="text-center pb-4 pt-6">
          <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
            تأكيد رمز التفعيل
          </CardTitle>
          <p className="text-gray-600">تم إرسال رمز OTP إلى هاتفك. استخدم الرمز 66055 لإتمام التسجيل.</p>
        </CardHeader>
        <CardContent className="p-6">
          <form className="space-y-4" onSubmit={handleOtpSubmit}>
            <Input
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
              maxLength={5}
              placeholder="أدخل رمز التحقق"
              className="text-center text-2xl tracking-widest"
            />
            {otpError && <p className="text-sm text-red-600 text-center">{otpError}</p>}
            <Button type="submit" className="w-full bg-[#FF6347] hover:bg-[#E5533D] text-white py-3 text-lg font-bold rounded-xl transition-all duration-300">
              تفعيل الاشتراك
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} className="w-full py-3 text-lg font-bold rounded-xl">
              إلغاء
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  const renderFormStep = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border-0 bg-white rounded-2xl">
        <CardHeader className="text-center pb-4 pt-6">
          <CardTitle className="text-2xl font-bold text-gray-800 mb-4 text-center">
            🔔 نبهني عند التوفر
          </CardTitle>
          {productPriceBlock}
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-right block font-medium">
                الاسم بالكامل *
              </Label>
              <Input
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                className="text-right"
                placeholder="أدخل اسمك الكامل"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-right block font-medium">
                رقم الهاتف *
              </Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                className="text-right"
                placeholder="09X XXXXXXX"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-right block font-medium">
                البريد الإلكتروني *
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="text-right"
                placeholder="example@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-right block font-medium">الكمية</Label>
              <div className="flex items-center justify-center gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => updateQuantity(-1)} className="w-8 h-8 p-0">
                  -
                </Button>
                <span className="w-12 text-center font-bold text-lg">{formData.quantity}</span>
                <Button type="button" variant="outline" size="sm" onClick={() => updateQuantity(1)} className="w-8 h-8 p-0">
                  +
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-right block font-medium text-gray-700">سيتم إرسال الإشعار عبر:</Label>
              <div className="space-y-3">
                {notificationOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div key={option.id} className="flex items-center space-x-3 space-x-reverse p-3 bg-gray-50 rounded-lg">
                      <Checkbox
                        id={option.id}
                        checked={formData.notificationTypes.includes(option.id)}
                        onCheckedChange={() => toggleNotificationMethod(option.id)}
                        className="rounded-md"
                      />
                      <Label htmlFor={option.id} className="flex items-center gap-3 cursor-pointer text-lg">
                        <Icon className="h-4 w-4" />
                        {option.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
            {globalError && (
              <p className="text-sm text-red-600 text-right">{globalError}</p>
            )}
            <div className="pt-6 space-y-3">
              <Button type="submit" disabled={isSubmitting} className="w-full bg-[#FF6347] hover:bg-[#E5533D] text-white py-4 font-bold text-lg rounded-xl shadow-lg transition-all duration-300">
                {isSubmitting ? (
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري الإرسال...
                  </div>
                ) : (
                  <div className="flex items-center gap-2 justify-center">
                    <span className="text-xl">🔔</span>
                    نبهني عند التوفر
                  </div>
                )}
              </Button>
              <Button type="button" onClick={handleClose} variant="outline" className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 text-lg font-bold rounded-xl">
                إلغاء
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
      <Card className="max-w-lg w-full shadow-2xl border-0 bg-white rounded-2xl">
        <CardHeader className="text-center pb-2 pt-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img
              src={product?.images?.[0]}
              alt={product?.name}
              className="w-20 h-20 object-cover rounded-lg shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{product?.name}</h3>
              <Badge variant="secondary" className="text-sm">{derivedStoreName}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Check className="h-10 w-10 text-white stroke-[3]" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-4 text-center">تم استلام طلبك بنجاح</h2>
            <p className="text-gray-600 leading-relaxed mb-6 text-lg text-center">
              سيتم مراسلتك فور توفر المنتج عبر القنوات التي اخترتها
            </p>
          </div>
          <div className="space-y-3">
            <Button onClick={handleClose} className="w-full bg-[#FF6347] hover:bg-[#E5533D] text-white py-4 text-lg font-bold rounded-xl shadow-lg transition-all duration-300">
              تأكيد الطلب
            </Button>
            <Button onClick={handleClose} variant="outline" className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 text-lg font-bold rounded-xl">
              إغلاق
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (step === 'subscription') {
    return renderSubscriptionStep();
  }
  if (step === 'otp') {
    return renderOtpStep();
  }
  if (step === 'success') {
    return renderSuccessStep();
  }
  return renderFormStep();
};

export default NotifyWhenAvailable;
