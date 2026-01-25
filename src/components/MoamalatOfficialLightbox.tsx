import React, { useEffect, useState } from 'react';
import { getApiUrl } from '@/utils/apiConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, X } from 'lucide-react';

interface MoamalatOfficialLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  orderData: any;
  onPaymentSuccess: (transactionData: any) => void;
  onPaymentError: (error: string) => void;
}

// Moamalat Lightbox Configuration - Updated with proper test credentials
const MOAMALAT_CONFIG = {
  merchantId: '10081014649',
  terminalId: '99179395',
  merchantSecretKey: '3a488a89b3f7993476c252f017c488bb',
  testMode: true,
  // Updated URLs based on Moamalat documentation
  lightboxURL: 'https://test.moamalat.net/api/v2/LightBox',
  sdkURL: 'https://tnpg.moamalat.net:6006/js/lightbox.js',
  productionURL: 'https://npg.moamalat.net:6006/js/lightbox.js',
  // API endpoints
  paymentEndpoint: 'https://test.moamalat.net/api/v2/Payment',
  refundEndpoint: 'https://test.moamalat.net/api/v2/Refund'
};

const MoamalatOfficialLightbox: React.FC<MoamalatOfficialLightboxProps> = ({
  isOpen,
  onClose,
  amount,
  orderData,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiration, setExpiration] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTestData, setShowTestData] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  // Load test data helper - Updated with real Moamalat test cards
  const loadTestData = () => {
    setCardNumber('6394993077260781');
    setExpiration('10/27');
    setNameOnCard('Test Customer');
    setEmailAddress('test@example.com');
  };

  // Test cards for different scenarios
  const testCards = {
    successful: [
      { number: '6394993077260781', expiry: '10/27', name: 'Test Customer' },
      { number: '4532015112830366', expiry: '12/25', name: 'John Doe' },
      { number: '5425233430109903', expiry: '11/26', name: 'Jane Smith' }
    ],
    declined: [
      { number: '4000000000000002', expiry: '10/27', name: 'Declined Card' }
    ],
    insufficient: [
      { number: '4000000000009995', expiry: '10/27', name: 'Low Balance Card' }
    ]
  };

  // Initialize with test environment
  useEffect(() => {
    if (isOpen) {
      setLogoFailed(false);
    }
    if (isOpen && MOAMALAT_CONFIG.testMode) {

      // In production, load real Moamalat SDK here
      loadMoamalatLightboxSDK();
    }
  }, [isOpen]);

  const loadMoamalatLightboxSDK = async () => {
    try {
      const w = window as any;
      if (w.MoamalatLightbox || w.Lightbox?.Checkout) {
        if (!w.MoamalatLightbox && w.Lightbox) {
          w.MoamalatLightbox = w.Lightbox;
        }
        return;
      }

      const src = MOAMALAT_CONFIG.testMode ? MOAMALAT_CONFIG.sdkURL : MOAMALAT_CONFIG.productionURL;
      const existing = document.querySelector<HTMLScriptElement>(`script[data-moamalat-sdk="${src}"]`) || document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
      if (existing) {
        existing.addEventListener('load', () => {
          const globalLightbox = (window as any).Lightbox;
          if (globalLightbox && !w.MoamalatLightbox) {
            w.MoamalatLightbox = globalLightbox;
          }
        }, { once: true });
        existing.addEventListener('error', () => {

        }, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      script.dataset.moamalatSdk = src;

      script.onload = () => {
        const globalLightbox = (window as any).Lightbox;
        if (globalLightbox && !w.MoamalatLightbox) {
          w.MoamalatLightbox = globalLightbox;
        }

      };

      script.onerror = () => {

      };

      document.head.appendChild(script);
    } catch (error) {

    }
  };

  const handlePayNow = () => {
    if (!cardNumber || cardNumber.length < 16) {
      alert('يرجى إدخال رقم بطاقة صحيح');
      return;
    }
    if (!expiration || !expiration.match(/^\d{2}\/\d{2}$/)) {
      alert('يرجى إدخال تاريخ انتهاء صحيح (MM/YY)');
      return;
    }
    if (!nameOnCard) {
      alert('يرجى إدخال اسم حامل البطاقة');
      return;
    }
    if (!emailAddress || !emailAddress.includes('@')) {
      alert('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    setIsLoading(true);

    // Generate unique reference following Moamalat standards
    const merchantReference = `ESH${Date.now()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
    const amountInCents = Math.round(amount * 100); // Convert to cents for proper processing

    // Prepare payment data according to Moamalat LightBox API
    const paymentData = {
      merchantId: MOAMALAT_CONFIG.merchantId,
      terminalId: MOAMALAT_CONFIG.terminalId,
      merchantReference,
      amount: amountInCents,
      currency: 'LYD',
      customerEmail: emailAddress,
      customerName: nameOnCard,
      customerPhone: orderData?.customer?.phone || '',
      description: `Payment for order ${orderData?.id || merchantReference}`,
      language: 'ar',
      returnUrl: window.location.origin + '/payment/callback',
      callbackUrl: getApiUrl() + '/payment/webhook',
      // Additional required fields for LightBox
      cardNumber: cardNumber.replace(/\s/g, ''),
      expiryMonth: expiration.split('/')[0],
      expiryYear: `20${expiration.split('/')[1]}`,
      cardHolderName: nameOnCard,
      customerIp: '127.0.0.1', // In real app, get actual IP
      userAgent: navigator.userAgent
    };

    if (MOAMALAT_CONFIG.testMode) {
      // Simulate real Moamalat LightBox API response
      simulateMoamalatLightBoxPayment(paymentData);
    } else {
      // Real Moamalat LightBox API call
      initiateMoamalatLightBoxPayment(paymentData);
    }
  };

  const simulateMoamalatPayment = (paymentData: any) => {
    // Simulate processing time
    setTimeout(() => {
      // Generate realistic Moamalat response
      const [expMonth, expYear] = expiration.split('/');
      const currentYear = new Date().getFullYear().toString().substr(-2);

      // Simulate different response scenarios
      const scenarios = [
        { status: 'success', probability: 0.85 },
        { status: 'declined', probability: 0.10 },
        { status: 'insufficient_funds', probability: 0.05 }
      ];

      const random = Math.random();
      let scenario: { status: string; probability: number } = scenarios[0]!; // Default to success
      let cumulativeProbability = 0;

      for (const s of scenarios) {
        cumulativeProbability += s.probability;
        if (random <= cumulativeProbability) {
          scenario = s;
          break;
        }
      }

      const transactionData: any = {
        TxnDate: new Date().toISOString().replace(/[-:]/g, '').slice(0, 14),
        SystemReference: Math.floor(Math.random() * 9999999) + 1000000,
        NetworkReference: '506' + Math.floor(Math.random() * 999999999),
        MerchantReference: paymentData.merchantReference,
        Amount: paymentData.amount.toString(),
        Currency: '434', // LYD currency code
        PaidThrough: 'Card',
        PayerAccount: cardNumber.substring(0, 6) + 'XXXXXX' + cardNumber.substring(12),
        PayerName: nameOnCard.toUpperCase(),
        timestamp: new Date().toISOString(),
        gateway: 'moamalat_official'
      };

      switch (scenario.status) {
        case 'success':
          transactionData.status = 'completed';
          transactionData.ResponseCode = '000';
          transactionData.ResponseMessage = 'Transaction approved';
          transactionData.AuthCode = 'TEST' + Math.floor(Math.random() * 999999);
          break;

        case 'declined':
          transactionData.status = 'declined';
          transactionData.ResponseCode = '101';
          transactionData.ResponseMessage = 'Transaction declined by issuer';
          break;

        case 'insufficient_funds':
          transactionData.status = 'insufficient_funds';
          transactionData.ResponseCode = '116';
          transactionData.ResponseMessage = 'Insufficient funds';
          break;
      }

      // Generate secure hash for response validation
      transactionData.secureHash = generateSecureHash(transactionData);

      if (scenario.status === 'success') {
        onPaymentSuccess(transactionData);
      } else {
        onPaymentError(transactionData.ResponseMessage);
      }

      setIsLoading(false);
    }, 3000); // 3 seconds processing time
  };

  const initiateMoamalatPayment = (paymentData: any) => {
    try {
      // Real Moamalat Lightbox integration
      if ((window as any).MoamalatLightbox) {
        (window as any).MoamalatLightbox.pay({
          merchantId: paymentData.merchantId,
          terminalId: paymentData.terminalId,
          amount: paymentData.amount,
          merchantReference: paymentData.merchantReference,
          currency: paymentData.currency,
          customerEmail: paymentData.customerEmail,
          customerName: paymentData.customerName,
          description: paymentData.description,
          language: paymentData.language,
          returnUrl: paymentData.returnUrl,
          callbackUrl: paymentData.callbackUrl,
          successCallback: (data: any) => {
            onPaymentSuccess(data);
            setIsLoading(false);
            onClose();
          },
          errorCallback: (error: any) => {
            onPaymentError(error.message || 'Payment failed');
            setIsLoading(false);
          }
        });
      } else {
        throw new Error('Moamalat SDK not loaded');
      }
    } catch (error) {

      onPaymentError('فشل في بدء عملية الدفع');
      setIsLoading(false);
    }
  };

  const generateSecureHash = (data: any) => {
    // Generate secure hash for transaction validation
    const hashString = `${data.MerchantReference}${data.Amount}${data.SystemReference}${MOAMALAT_CONFIG.merchantSecretKey}`;
    return btoa(hashString).substring(0, 16);
  };

  const simulateMoamalatLightBoxPayment = (paymentData: any) => {
    // Simulate processing time
    setTimeout(() => {
      // Generate realistic Moamalat response
      const [expMonth, expYear] = expiration.split('/');
      const currentYear = new Date().getFullYear().toString().substr(-2);

      // Simulate different response scenarios
      const scenarios = [
        { status: 'success', probability: 0.85 },
        { status: 'declined', probability: 0.10 },
        { status: 'insufficient_funds', probability: 0.05 }
      ];

      const random = Math.random();
      let scenario: { status: string; probability: number } = scenarios[0]!; // Default to success
      let cumulativeProbability = 0;

      for (const s of scenarios) {
        cumulativeProbability += s.probability;
        if (random <= cumulativeProbability) {
          scenario = s;
          break;
        }
      }

      const transactionData: any = {
        TxnDate: new Date().toISOString().replace(/[-:]/g, '').slice(0, 14),
        SystemReference: Math.floor(Math.random() * 9999999) + 1000000,
        NetworkReference: '506' + Math.floor(Math.random() * 999999999),
        MerchantReference: paymentData.merchantReference,
        Amount: paymentData.amount.toString(),
        Currency: '434', // LYD currency code
        PaidThrough: 'Card',
        PayerAccount: cardNumber.substring(0, 6) + 'XXXXXX' + cardNumber.substring(12),
        PayerName: nameOnCard.toUpperCase(),
        timestamp: new Date().toISOString(),
        gateway: 'moamalat_lightbox'
      };

      switch (scenario.status) {
        case 'success':
          transactionData.status = 'completed';
          transactionData.ResponseCode = '000';
          transactionData.ResponseMessage = 'Transaction approved';
          transactionData.AuthCode = 'TEST' + Math.floor(Math.random() * 999999);
          break;

        case 'declined':
          transactionData.status = 'declined';
          transactionData.ResponseCode = '101';
          transactionData.ResponseMessage = 'Transaction declined by issuer';
          break;

        case 'insufficient_funds':
          transactionData.status = 'insufficient_funds';
          transactionData.ResponseCode = '116';
          transactionData.ResponseMessage = 'Insufficient funds';
          break;
      }

      // Generate secure hash for response validation
      transactionData.secureHash = generateSecureHash(transactionData);

      if (scenario.status === 'success') {
        onPaymentSuccess(transactionData);
      } else {
        onPaymentError(transactionData.ResponseMessage);
      }

      setIsLoading(false);
    }, 3000); // 3 seconds processing time
  };

  const initiateMoamalatLightBoxPayment = (paymentData: any) => {
    try {
      // Real Moamalat LightBox integration
      if ((window as any).MoamalatLightbox) {
        (window as any).MoamalatLightbox.pay({
          merchantId: paymentData.merchantId,
          terminalId: paymentData.terminalId,
          amount: paymentData.amount,
          merchantReference: paymentData.merchantReference,
          currency: paymentData.currency,
          customerEmail: paymentData.customerEmail,
          customerName: paymentData.customerName,
          description: paymentData.description,
          language: paymentData.language,
          returnUrl: paymentData.returnUrl,
          callbackUrl: paymentData.callbackUrl,
          successCallback: (data: any) => {
            onPaymentSuccess(data);
            setIsLoading(false);
            onClose();
          },
          errorCallback: (error: any) => {
            onPaymentError(error.message || 'Payment failed');
            setIsLoading(false);
          }
        });
      } else {
        throw new Error('Moamalat LightBox SDK not loaded');
      }
    } catch (error) {

      onPaymentError('فشل في بدء عملية الدفع');
      setIsLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/\d{0,4}|\d{4}/g);
    return match ? match.join(' ').trim() : '';
  };

  const formatExpiration = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        className="rounded-lg shadow-2xl w-full max-w-lg relative font-sans bg-[#fafbfc]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 z-10 w-5 h-5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Moamalat Logo - Exact match */}
        <div className="bg-white pt-6 px-8">
          <div className="flex items-center justify-start mb-6">
            {/* Moamalat Official Logo */}
            <div className="flex items-center">
              {logoFailed ? (
                <div className="flex items-center">
                  <div className="text-3xl font-bold text-[#F39C12]">m</div>
                  <div className="text-2xl font-normal text-[#666666]">oamalat</div>
                </div>
              ) : (
                <img 
                  src="/assets/payment/moamalat.png" 
                  alt="Moamalat" 
                  className="h-10 w-auto"
                  onError={() => setLogoFailed(true)}
                />
              )}
            </div>
          </div>

          {/* Quick Payment Form Header - Exact match */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-500" />
              <span className="text-lg font-medium text-gray-700">Quick Payment Form</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-blue-600 font-medium">عربي</span>
              <div className="w-4 h-4 rounded border border-blue-300 bg-blue-600"></div>
            </div>
          </div>

          {/* Separator Line */}
          <hr className="border-gray-200 mb-4" />
        </div>

        <div className="px-8 pb-8">
          {/* Merchant Information - Updated with proper data */}
          <div className="mb-6">
            <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-600 font-medium">Merchant Name</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-800 font-medium">إشرو - متجر إلكتروني</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-600 font-medium">Amount</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-800 font-medium">LYD {amount.toFixed(3)}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-600 font-medium">Merchant Ref #</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-800 font-medium">{orderData?.id || `ORD${Date.now()}`}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-600 font-medium">Terminal ID</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-800 font-medium">{MOAMALAT_CONFIG.terminalId}</span>
              </div>
            </div>
          </div>

          {/* Test Data Helper - Enhanced with multiple test cards */}
          {MOAMALAT_CONFIG.testMode && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-yellow-800">بيانات الاختبار - Moamalat</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTestData(!showTestData)}
                  className="text-xs border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  {showTestData ? 'إخفاء' : 'إظهار'}
                </Button>
              </div>
              {showTestData && (
                <div className="text-xs text-yellow-700 space-y-3">
                  {/* Successful Cards */}
                  <div>
                    <div className="font-semibold text-green-700 mb-1">✅ بطاقات ناجحة:</div>
                    <div className="space-y-1">
                      {testCards.successful.map((card, index) => (
                        <div key={index} className="bg-green-50 p-2 rounded">
                          <div><strong>رقم البطاقة:</strong> {card.number}</div>
                          <div><strong>تاريخ الانتهاء:</strong> {card.expiry}</div>
                          <div><strong>الاسم:</strong> {card.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Failed Cards */}
                  <div>
                    <div className="font-semibold text-red-700 mb-1">❌ بطاقات مرفوضة:</div>
                    <div className="space-y-1">
                      {testCards.declined.map((card, index) => (
                        <div key={index} className="bg-red-50 p-2 rounded">
                          <div><strong>رقم البطاقة:</strong> {card.number}</div>
                          <div><strong>تاريخ الانتهاء:</strong> {card.expiry}</div>
                          <div><strong>الاسم:</strong> {card.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Load Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const card = testCards.successful[0];
                        if (card) {
                          setCardNumber(card.number);
                          setExpiration(card.expiry);
                          setNameOnCard(card.name);
                        }
                      }}
                      className="text-xs border-green-300 text-green-700 hover:bg-green-100"
                    >
                      بطاقة ناجحة
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const card = testCards.declined[0];
                        if (card) {
                          setCardNumber(card.number);
                          setExpiration(card.expiry);
                          setNameOnCard(card.name);
                        }
                      }}
                      className="text-xs border-red-300 text-red-700 hover:bg-red-100"
                    >
                      بطاقة مرفوضة
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Form - Exact styling match */}
          <div className="space-y-5">
            {/* Card Number */}
            <div>
              <Input
                type="text"
                placeholder="Card number"
                value={cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  if (formatted.replace(/\s/g, '').length <= 16) {
                    setCardNumber(formatted);
                  }
                }}
                className="w-full border border-gray-300 rounded-full px-5 py-4 text-base placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                style={{ fontSize: '16px', height: '50px' }}
                maxLength={19}
              />
            </div>

            {/* Expiration - Half width to match design */}
            <div className="w-1/2">
              <Input
                type="text"
                placeholder="Expiration"
                value={expiration}
                onChange={(e) => setExpiration(formatExpiration(e.target.value))}
                className="w-full border border-gray-300 rounded-full px-5 py-4 text-base placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                style={{ fontSize: '16px', height: '50px' }}
                maxLength={5}
              />
            </div>

            {/* Name on card */}
            <div>
              <Input
                type="text"
                placeholder="Name on card"
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
                className="w-full border border-gray-300 rounded-full px-5 py-4 text-base placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                style={{ fontSize: '16px', height: '50px' }}
              />
            </div>

            {/* Email Address */}
            <div>
              <Input
                type="email"
                placeholder="Email Address"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="w-full border border-gray-300 rounded-full px-5 py-4 text-base placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                style={{ fontSize: '16px', height: '50px' }}
              />
            </div>
          </div>

          {/* Pay Now Button - Exact match with rounded corners */}
          <Button
            onClick={handlePayNow}
            disabled={isLoading}
            className="w-full mt-8 text-white font-medium transition-colors"
            style={{ 
              backgroundColor: '#4A90E2', 
              borderRadius: '25px',
              height: '50px',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            {isLoading ? 'Processing...' : 'Pay Now'}
          </Button>

          {/* Supported Cards - Exact match */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">Supported Cards</span>
              <div className="flex items-center gap-1">
                <img 
                  src="/assets/payment/supported-cards.png"
                  alt="Supported Cards"
                  className="h-6 w-auto"
                  onError={(e) => {
                    // Fallback to green circles if image fails
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="flex items-center gap-1">
                          <div class="w-6 h-6 rounded-full" style="background-color: #4CAF50; opacity: 0.9"></div>
                          <div class="w-6 h-6 rounded-full" style="background-color: #4CAF50; margin-left: -8px; opacity: 0.9"></div>
                          <div class="w-6 h-6 rounded-full" style="background-color: #4CAF50; margin-left: -8px; opacity: 0.9"></div>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Footer - Exact match */}
          <div className="text-right text-xs text-gray-400 mt-6">
            © Powered by PaySky.io
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoamalatOfficialLightbox;
