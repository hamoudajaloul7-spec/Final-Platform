import React, { useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface MoamalatRealLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  orderData: any;
  paymentMethod?: string;
  onPaymentSuccess: (transactionData: any) => void;
  onPaymentError: (error: string) => void;
}

// Helper functions for environment variables
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

// Moamalat Real Lightbox Configuration
const getMoamalatConfig = () => {
  // Load from environment variables with fallbacks
  const merchantId = getFirstEnv('MOAMALAT_MID', 'MOAMALATPAY_MID') || '10081014649';
  const terminalId = getFirstEnv('MOAMALAT_TID', 'MOAMALATPAY_TID') || '99179395';
  const merchantSecretKey = getFirstEnv('MOAMALAT_SECRET', 'MOAMALATPAY_KEY') || '3a488a89b3f7993476c252f017c488bb';
  const isProduction = getFirstEnv('MOAMALAT_ENV', 'MOAMALATPAY_PRODUCTION') === 'production';

  return {
    merchantId,
    terminalId,
    merchantSecretKey,
    // SDK URLs from documentation
    testSDK: 'https://tnpg.moamalat.net:6006/js/lightbox.js',
    productionSDK: 'https://npg.moamalat.net:6006/js/lightbox.js',
    // Environment flag
    isProduction
  };
};

const MoamalatRealLightbox: React.FC<MoamalatRealLightboxProps> = ({
  isOpen,
  onClose,
  amount,
  orderData,
  paymentMethod,
  onPaymentSuccess,
  onPaymentError
}) => {
  const lightboxRef = useRef<HTMLDivElement>(null);
  const sdkLoadedRef = useRef<boolean>(false);
  const configRef = useRef<any>(null);

  // Get config on mount
  if (!configRef.current) {
    configRef.current = getMoamalatConfig();
  }

  const handlePaymentSuccess = useCallback((transactionData: any) => {

    const formattedData = {
      TxnDate: transactionData.TxnDate,
      SystemReference: transactionData.SystemReference,
      NetworkReference: transactionData.NetworkReference,
      MerchantReference: transactionData.MerchantReference,
      Amount: transactionData.Amount,
      Currency: transactionData.Currency,
      PaidThrough: transactionData.PaidThrough,
      PayerAccount: transactionData.PayerAccount,
      PayerName: transactionData.PayerName,
      ProviderSchemeName: transactionData.ProviderSchemeName,
      status: 'completed',
      gateway: 'moamalat_lightbox',
      timestamp: new Date().toISOString(),
      secureHash: transactionData.SecureHash
    };
    onPaymentSuccess(formattedData);
    onClose();
  }, [onClose, onPaymentSuccess]);

  const handlePaymentError = useCallback((error: any) => {

    onPaymentError(error.error || 'حدث خطأ في عملية الدفع');
  }, [onPaymentError]);

  const handlePaymentCancel = useCallback(() => {

    onClose();
  }, [onClose]);

  // Load Moamalat Lightbox SDK when opened
  useEffect(() => {
    if (!(isOpen && !sdkLoadedRef.current)) return;

    const initializeLightbox = async () => {
      try {
        const merchantReference = `ESHRO_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const amountInDirhams = Math.round(amount * 1000);
        const trxDateTime = new Date().toISOString().replace(/[-:]/g, '').slice(0, 12);

        // Generate secure hash according to documentation
        const secureHash = await generateSecureHash({
          Amount: amountInDirhams.toString(),
          DateTimeLocalTrxn: trxDateTime,
          MerchantId: configRef.current.merchantId,
          MerchantReference: merchantReference,
          TerminalId: configRef.current.terminalId
        });

        // Configure Lightbox according to documentation
        if ((window as any).Lightbox && (window as any).Lightbox.Checkout) {
          (window as any).Lightbox.Checkout.configure = {
            MID: configRef.current.merchantId,
            TID: configRef.current.terminalId,
            AmountTrxn: amountInDirhams,
            MerchantReference: merchantReference,
            TrxDateTime: trxDateTime,
            SecureHash: secureHash,
            completeCallback: handlePaymentSuccess,
            errorCallback: handlePaymentError,
            cancelCallback: handlePaymentCancel
          };

          // Show the lightbox
          (window as any).Lightbox.Checkout.showLightbox();
        } else {

          onPaymentError('فشل في تحميل نظام الدفع');
        }
      } catch (error) {

        onPaymentError('خطأ في تهيئة نظام الدفع');
      }
    };

    const loadMoamalatSDK = () => {
      // SDK is now loaded statically in index.html
      if ((window as any).Lightbox && (window as any).Lightbox.Checkout) {
        sdkLoadedRef.current = true;
        initializeLightbox();
      } else {
        // Wait a bit for the script to load
        setTimeout(() => {
          if ((window as any).Lightbox && (window as any).Lightbox.Checkout) {
            sdkLoadedRef.current = true;
            initializeLightbox();
          } else {

            onPaymentError('فشل في تحميل نظام الدفع. يرجى المحاولة لاحقاً.');
          }
        }, 1000);
      }
    };

    loadMoamalatSDK();
  }, [amount, handlePaymentCancel, handlePaymentError, handlePaymentSuccess, isOpen, onPaymentError]);

  const generateSecureHash = async (params: any) => {
    try {
      const isLocalhost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
      const apiUrl = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:5000/api' : '/api');
      const response = await fetch(`${apiUrl}/moamalat/hash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Amount: params.Amount,
          DateTimeLocalTrxn: params.DateTimeLocalTrxn,
          MerchantId: params.MerchantId,
          MerchantReference: params.MerchantReference,
          TerminalId: params.TerminalId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate secure hash');
      }

      const data = await response.json();
      return data.secureHash;
    } catch (error) {

      // Fallback to client-side generation (not secure, for testing only)
      const sortedParams = {
        Amount: params.Amount,
        DateTimeLocalTrxn: params.DateTimeLocalTrxn,
        MerchantId: params.MerchantId,
        MerchantReference: params.MerchantReference,
        TerminalId: params.TerminalId
      };

      const queryString = Object.keys(sortedParams)
        .sort()
        .map(key => `${key}=${sortedParams[key]}`)
        .join('&');

      const hashString = queryString + configRef.current.merchantSecretKey;
      return btoa(hashString).replace(/[^a-zA-Z0-9]/g, '').substring(0, 64).toUpperCase();
    }
  };



  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (lightboxRef.current) {
        lightboxRef.current.innerHTML = '';
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/payment/moamalat.png" 
              alt="Moamalat" 
              className="h-8 w-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <h2 className="text-lg font-semibold text-gray-800">بوابة الدفع الإلكترونية</h2>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            title="إغلاق"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Payment Information */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">اسم المتجر:</span>
              <span className="font-medium ml-2">متجر إشرو</span>
            </div>
            <div>
              <span className="text-gray-600">المبلغ:</span>
              <span className="font-medium ml-2">{amount.toFixed(3)} د.ل</span>
            </div>
            <div>
              <span className="text-gray-600">رقم الطلب:</span>
              <span className="font-medium ml-2">{orderData?.id || 'غير محدد'}</span>
            </div>
          </div>
        </div>

        {/* Lightbox Container */}
        <div 
          ref={lightboxRef}
          className="flex-1 p-4 overflow-auto"
          style={{ height: 'calc(80vh - 140px)' }}
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل نظام الدفع...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoamalatRealLightbox;
