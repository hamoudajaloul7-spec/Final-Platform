import React, { useCallback, useEffect, useState } from 'react';
import { getApiUrl } from '@/utils/apiConfig';
import { getProxyImageUrl } from '@/utils/assetProxyUtil';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CreditCard,
  Crown,
  Gift,
  Percent,
  Shield,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';

interface SubscriptionCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: any;
  billingCycle: 'monthly' | 'yearly';
  onBillingCycleChange: (cycle: 'monthly' | 'yearly') => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  { id: 'moamalat', name: 'معاملات', icon: '/data/payment/moamalat.png', description: 'البوابة الوطنية للمدفوعات الإلكترونية' },
  { id: 'sadad', name: 'سداد', icon: '/data/payment/sadad.png', description: 'خدمة الدفع الإلكتروني' },
  { id: 'tadawul', name: 'تداول', icon: '/data/payment/tadawul.png', description: 'منصة التداول الإلكتروني' },
  { id: 'mobicash', name: 'موبي كاش', icon: '/data/payment/mobicash.png', description: 'محفظة إلكترونية' },
  { id: 'anis', name: 'أنيس', icon: '/data/payment/anis.png', description: 'خدمات مالية إلكترونية' },
  { id: 'edfali', name: 'إدفعلي', icon: '/data/payment/edfali.png', description: 'حلول دفع إلكترونية' },
  { id: '1pay', name: '1Pay', icon: '/data/payment/1Pay.png', description: 'منصة دفع متكاملة' },
  { id: 'becom', name: 'Becom', icon: '/data/payment/Becom.png', description: 'خدمات دفع إلكترونية' },
  { id: 'blueline', name: 'BlueLine', icon: '/data/payment/BlueLine.png', description: 'حلول دفع متقدمة' },
  { id: 'debit', name: 'بطاقات الخصم', icon: '/data/payment/debit.png', description: 'بطاقات الخصم المباشر' },
  { id: 'nab4pay', name: 'NAB4Pay', icon: '/data/payment/nab4pay.png', description: 'منصة دفع وطنية' },
  { id: 'youssr', name: 'يوسر', icon: '/data/payment/youssr.png', description: 'خدمات مالية إلكترونية' },
];

function formatTrxDateTime(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${y}${m}${day}${hh}${mm}`;
}

function getPublicEnv(key: string): string | undefined {
  const w = (typeof window !== 'undefined' ? (window as any) : {}) || {};
  const pe: any = (typeof process !== 'undefined' ? (process as any).env : {}) || {};
  return (
    pe[`NEXT_PUBLIC_${key}`] ||
    pe[`VITE_${key}`] ||
    pe[key] ||
    w[key]
  );
}

function getFirstEnv(...keys: string[]) {
  for (const k of keys) {
    const v = getPublicEnv(k);
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

function getLightboxSrc() {
  return 'https://tnpg.moamalat.net:6006/js/lightbox.js';
}

export const SubscriptionCheckoutModal: React.FC<SubscriptionCheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedPackage,
  billingCycle,
  onBillingCycleChange,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  const basePrice = selectedPackage ? (billingCycle === 'yearly' ? Math.floor(selectedPackage.yearlyPrice) : selectedPackage.monthlyPrice) : 0;
  const discount = selectedPackage && billingCycle === 'yearly' ? (selectedPackage.id === 'lite' ? basePrice * 0.01 : selectedPackage.id === 'growth' ? basePrice * 0.03 : basePrice * 0.05) : 0;
  const discountedPrice = basePrice - discount;
  const couponDiscount = appliedCoupon ? discountedPrice * 0.1 : 0;
  const finalPrice = discountedPrice - couponDiscount;

  const handleCouponApply = () => {
    if (couponCode.trim()) setAppliedCoupon(couponCode);
  };

  const handlePaymentSelect = (methodId: string) => setSelectedPaymentMethod(methodId);

  const handleProceedToPayment = () => {
    if (selectedPaymentMethod === 'moamalat') setCurrentStep(3);
  };

  const loadMoamalatScript = useCallback(async () => {
    const src = getLightboxSrc();
    if (document.querySelector(`script[data-moamalat="${src}"]`)) {
      setScriptReady(true);
      return;
    }
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.dataset.moamalat = src;
      s.onload = () => {
        resolve();
      };
      s.onerror = () => reject(new Error('Failed to load Moamalat Lightbox script'));
      document.head.appendChild(s);
    });
    const started = Date.now();
    while (!(window as any).Lightbox || !(window as any).Lightbox.Checkout) {
      if (Date.now() - started > 5000) throw new Error('Lightbox not available within timeout');
      await new Promise(r => setTimeout(r, 100));
    }

    setScriptReady(true);
  }, []);

  useEffect(() => {
    if (isOpen && selectedPaymentMethod === 'moamalat' && !scriptReady) {
      loadMoamalatScript().catch((e) => {
        alert('تعذر تحميل سكربت بوابة معاملات. حاول مرة أخرى.');
      });
    }
  }, [isOpen, selectedPaymentMethod, scriptReady, loadMoamalatScript]);

  async function initializeMoamalatPayment() {
    if (!scriptReady) await loadMoamalatScript();

    let MID = getFirstEnv('MOAMALAT_MID', 'MOAMALATPAY_MID');
    let TID = getFirstEnv('MOAMALAT_TID', 'MOAMALATPAY_TID');
    let ENV = (() => {
      const e = getPublicEnv('MOAMALAT_ENV');
      if (e) return e.toLowerCase();
      const prod = getPublicEnv('MOAMALATPAY_PRODUCTION');
      return String(prod).toLowerCase() === 'true' ? 'production' : 'sandbox';
    })();

    if (!MID || !TID) {
      try {
        const resp = await fetch(`${getApiUrl()}/moamalat/config`);
        if (resp.ok) {
          const data = await resp.json();
          MID = data.MID || MID;
          TID = data.TID || TID;
          ENV = (data.ENV || ENV || 'sandbox').toLowerCase();

        }
      } catch (e) {
        // ignore, fallback to throwing below if still missing
      }
    }

    if (!MID || !TID) {
      throw new Error('بيانات التاجر غير متوفرة (MID/TID)');
    }

    const AmountTrxn = String(Math.round(Number(finalPrice) * 1000));
    const TrxDateTime = formatTrxDateTime(new Date());
    const MerchantReference = `SUB-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const payloadForHash = { AmountTrxn, MerchantReference, TrxDateTime, MID, TID };


    const res = await fetch(`${getApiUrl()}/moamalat/hash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Amount: AmountTrxn,
        DateTimeLocalTrxn: TrxDateTime,
        MerchantId: MID,
        MerchantReference,
        TerminalId: TID,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`فشل توليد التوقيع من الخادم: ${txt}`);
    }
    const { secureHash } = await res.json();
    if (!secureHash) throw new Error('لم يتم استلام secureHash من الخادم');


    const config = {
      MID,
      TID,
      AmountTrxn,
      MerchantReference,
      TrxDateTime,
      SecureHash: secureHash,
      completeCallback: function(data: any) {
        setIsProcessing(false);
        onClose();
        setTimeout(() => alert('تمت عملية الدفع بنجاح! سيتم تفعيل الاشتراك قريباً.'), 400);
      },
      errorCallback: function(err: any) {
        setIsProcessing(false);
        alert('حدث خطأ في عملية الدفع: ' + (err?.error || err?.message || 'خطأ غير معروف'));
      },
      cancelCallback: function() {
        setIsProcessing(false);
      }
    };

    (window as any).Lightbox.Checkout.configure(config);
    (window as any).Lightbox.Checkout.showLightbox();
  }

  const handlePaymentComplete = async () => {
    if (selectedPaymentMethod === 'moamalat') {
      setIsProcessing(true);
      try {
        await initializeMoamalatPayment();
      } catch (error: any) {
        setIsProcessing(false);
        alert('فشل في تهيئة بوابة الدفع: ' + (error?.message || 'خطأ غير معروف'));
      }
    } else {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        onClose();
        setTimeout(() => alert('تمت عملية الدفع بنجاح! سيتم تفعيل الاشتراك قريباً.'), 400);
      }, 3000);
    }
  };

  const resetModal = () => {
    setCurrentStep(1);
    setCouponCode('');
    setAppliedCoupon(null);
    setSelectedPaymentMethod(null);
    setIsProcessing(false);
  };

  useEffect(() => {
    if (!isOpen) resetModal();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-3xl"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full translate-y-32 -translate-x-32 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-pulse"></div>

          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative z-10 p-6">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <motion.div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        step <= currentStep
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                          : 'bg-white/20 text-white/60 backdrop-blur-sm'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {step}
                    </motion.div>
                    {step < 3 && (
                      <div className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
                        step < currentStep ? 'bg-green-500' : 'bg-white/30'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center space-x-8 rtl:space-x-reverse text-sm text-white/80 mb-6">
              <span className={currentStep >= 1 ? 'text-white font-medium' : ''}>ملخص المشتريات</span>
              <span className={currentStep >= 2 ? 'text-white font-medium' : ''}>طرق الدفع</span>
              <span className={currentStep >= 3 ? 'text-white font-medium' : ''}>إتمام الدفع</span>
            </div>
          </div>

          <div className="relative z-10 px-6 pb-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl">
              <CardContent className="p-8">
                {currentStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Crown className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent mb-2">
                        {selectedPackage?.name}
                      </h2>
                      <p className="text-gray-600">مراجعة تفاصيل الاشتراك</p>
                    </div>

                    <div className="flex items-center justify-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                      <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-indigo-600' : 'text-gray-500'}`}>شهري</span>
                      <Switch checked={billingCycle === 'yearly'} onCheckedChange={(checked) => onBillingCycleChange(checked ? 'yearly' : 'monthly')} className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-indigo-500 data-[state=checked]:to-purple-500" />
                      <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-indigo-600' : 'text-gray-500'}`}>سنوي</span>
                      {billingCycle === 'yearly' && (
                        <Badge className="bg-green-100 text-green-800 text-xs">وفر {selectedPackage?.id === 'lite' ? '1%' : selectedPackage?.id === 'growth' ? '3%' : '5%'}</Badge>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                        <span className="text-gray-700">السعر الأساسي ({billingCycle === 'yearly' ? 'سنوي' : 'شهري'})</span>
                        <span className="font-bold text-lg">{basePrice} د.ل</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-200">
                          <span className="text-green-700 flex items-center gap-2">
                            <Percent className="h-4 w-4" />
                            الخصم ({selectedPackage?.id === 'lite' ? '1%' : selectedPackage?.id === 'growth' ? '3%' : '5%'})
                          </span>
                          <span className="font-bold text-green-600">-{discount.toFixed(0)} د.ل</span>
                        </div>
                      )}

                      <div className="space-y-3">
                        <Label htmlFor="coupon" className="text-gray-700 font-medium">كوبون تخفيض</Label>
                        <div className="flex gap-2">
                          <Input id="coupon" placeholder="أدخل رمز الكوبون" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="flex-1" />
                          <Button onClick={handleCouponApply} variant="outline" className="px-6">
                            <Gift className="h-4 w-4 mr-2" />
                            تطبيق
                          </Button>
                        </div>
                        {appliedCoupon && (
                          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <span className="text-purple-700 flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              كوبون: {appliedCoupon}
                            </span>
                            <span className="font-bold text-purple-600">-{couponDiscount.toFixed(0)} د.ل</span>
                          </div>
                        )}
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-xl border-2 border-indigo-200">
                          <span className="text-indigo-800 font-bold text-lg">الإجمالي</span>
                          <span className="text-2xl font-bold text-indigo-900">{finalPrice.toFixed(0)} د.ل</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg mt-2">
                          <span className="text-blue-700">المبلغ المستحق</span>
                          <span className="font-bold text-blue-800">{finalPrice.toFixed(0)} د.ل</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center text-sm text-gray-600 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <AlertCircle className="h-4 w-4 inline mr-2 text-yellow-600" />
                      📄 سيتم التحقق من الوصل قبل تفعيل الاشتراك.
                    </div>

                    <div className="flex justify-end gap-4 pt-6">
                      <Button variant="outline" onClick={onClose}>إلغاء</Button>
                      <Button onClick={() => setCurrentStep(2)} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                        استمرار
                        <ArrowRight className="h-4 w-4 mr-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <CreditCard className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-2">اختر طريقة الدفع</h2>
                      <p className="text-gray-600">اختر الطريقة الأنسب لك من الخيارات المتاحة</p>
                    </div>

                    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-8">
                      {paymentMethods.map((method) => (
                        <motion.div key={method.id} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} className={`relative p-8 rounded-3xl cursor-pointer transition-all duration-300 ${
                          selectedPaymentMethod === method.id ? 'border-4 border-green-500 bg-green-50 shadow-2xl' : 'border-2 border-gray-200 hover:border-gray-400 hover:shadow-xl bg-white'
                        }`} onClick={() => handlePaymentSelect(method.id)}>
                          <div className="text-center">
                            <div className="w-20 h-20 mx-auto bg-white rounded-3xl flex items-center justify-center shadow-lg border border-gray-100">
                              <img src={getProxyImageUrl(method.icon)} alt={method.name} className="w-16 h-16 object-contain" />
                            </div>
                          </div>
                          {selectedPaymentMethod === method.id && (
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                              <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-6">
                      <Button variant="outline" onClick={() => setCurrentStep(1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        رجوع
                      </Button>
                      <Button onClick={handleProceedToPayment} disabled={!selectedPaymentMethod} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50">
                        استمرار
                        <ArrowRight className="h-4 w-4 mr-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Shield className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">بوابة الدفع الإلكتروني</h2>
                      <p className="text-gray-600">البوابة الوطنية للمدفوعات الإلكترونية في ليبيا</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 shadow-xl">
                      <div className="text-center space-y-6">
                        <div className="w-24 h-24 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-xl border border-blue-100">
                          <img src={getProxyImageUrl("/data/payment/moamalat.png")} alt="معاملات" className="w-16 h-16 object-contain" />
                        </div>
                        <h3 className="text-2xl font-bold text-blue-900">معاملات</h3>
                        <p className="text-blue-700 text-lg">البوابة الوطنية الليبية للمدفوعات الإلكترونية</p>

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-700 font-medium">المبلغ المطلوب:</span>
                            <span className="font-bold text-xl text-blue-900">{finalPrice.toFixed(0)} د.ل</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">رسوم المعالجة:</span>
                            <span className="text-green-600 font-semibold">مجاناً</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium mb-1">ملاحظة هامة:</p>
                          <p>في حالة ظهور أي أخطاء في بوابة الدفع، يرجى المحاولة مرة أخرى أو اختيار طريقة دفع أخرى.</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-6">
                      <Button variant="outline" onClick={() => setCurrentStep(2)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        رجوع
                      </Button>
                      <Button onClick={handlePaymentComplete} disabled={isProcessing} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50">
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            جاري المعالجة...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            إتمام الدفع
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="text-center text-xs text-gray-500">بوابة معاملات - البوابة الوطنية للمدفوعات الإلكترونية في ليبيا</div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
