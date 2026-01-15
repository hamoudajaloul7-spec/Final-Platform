import React, { useState } from 'react';
import { Download, BookOpen, FileText, MessageCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadMerchantPDF } from '@/utils/generateMerchantPDF';
import { toast } from 'sonner';

const HelpCenterPage = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      await downloadMerchantPDF('دليل-التاجر-الشامل.pdf');
      toast.success('تم تحميل الدليل بنجاح!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('حدث خطأ في تحميل الدليل');
    } finally {
      setIsGenerating(false);
    }
  };

  const steps = [
    {
      number: 1,
      title: 'معلومات صاحب المتجر',
      description: 'أدخل بياناتك الشخصية والاسم الكامل والبريد الإلكتروني ورقم الهاتف الخاص بك.',
      image: '/help/steps/step-1.png',
      tips: ['استخدم بريد إلكتروني نشط', 'تأكد من صحة رقم الهاتف لتلقي الإشعارات'],
    },
    {
      number: 2,
      title: 'معلومات المتجر الأساسية',
      description: 'اختر اسم متجرك، النطاق الفريد (Subdomain)، ووصف المتجر، مع رفع الوثائق المطلوبة.',
      image: '/help/steps/step-2.png',
      tips: ['اختر اسماً سهلاً للحفظ', 'تأكد من وضوح صور السجل التجاري والوثائق'],
    },
    {
      number: 3,
      title: 'إعدادات الحساب وشعار المتجر',
      description: 'قم بضبط كلمة المرور الخاصة بحساب التاجر ورفع الشعار الرسمي لمتجرك.',
      image: '/help/steps/step-3.png',
      tips: ['استخدم كلمة مرور قوية', 'يفضل أن يكون الشعار بصيغة PNG وبخلفية شفافة'],
    },
    {
      number: 4,
      title: 'مراجعة البيانات',
      description: 'تأكد من صحة جميع البيانات المدخلة في الخطوات السابقة قبل المتابعة.',
      image: '/help/steps/step-4.png',
      tips: ['راجع الاسم والروابط بدقة', 'يمكنك العودة لتعديل أي معلومة قبل الخطوة النهائية'],
    },
    {
      number: 5,
      title: 'إضافة المنتجات والتصنيفات',
      description: 'ابدأ بإضافة منتجاتك الأولى مع تحديد الأسعار والصور والأوصاف المناسبة.',
      image: '/help/steps/step-6.png',
      tips: ['استخدم صوراً عالية الجودة لمنتجاتك', 'نظم منتجاتك في تصنيفات واضحة لسهولة التصفح'],
    },
    {
      number: 6,
      title: 'إضافة صور السلايدرز',
      description: 'أضف الصور المتحركة (Sliders) التي ستظهر في واجهة متجرك للترويج لعروضك.',
      image: '/help/steps/step-6.png',
      tips: ['اختر صوراً جذابة تعبر عن هوية متجرك', 'أضف نصوصاً واضحة على صور السلايدر'],
    },
    {
      number: 7,
      title: 'موقع المخزن',
      description: 'حدد موقع مخزنك الرئيسي على الخريطة لتسهيل حساب تكاليف الشحن وعمليات التوصيل.',
      image: '/help/steps/step-7.png',
      tips: ['حدد الموقع بدقة على الخريطة', 'أضف وصفاً دقيقاً للعنوان ليسهل الوصول إليه'],
    },
    {
      number: 8,
      title: 'المراجعة النهائية والجاهزية',
      description: 'أنت الآن جاهز! تحقق من ملخص متجرك واضغط على "إنشاء المتجر" للانطلاق.',
      image: '/help/steps/step-8.png',
      tips: ['تأكد من الموافقة على شروط الخدمة', 'متجرك سيكون متاحاً فور الضغط على زر الإنشاء'],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <HelpCircle className="h-8 w-8 text-green-600" />
                مركز المساعدة والدعم
              </h1>
              <p className="text-gray-600 mt-2">دليل شامل لإنشاء متجرك والبدء في البيع</p>
            </div>
            <Button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="bg-green-600 hover:bg-green-700 text-white gap-2 whitespace-nowrap"
              size="lg"
            >
              <Download className="h-5 w-5" />
              {isGenerating ? 'جاري التحميل...' : 'تحميل الدليل PDF'}
            </Button>
          </div>
        </div>
      </div>

      {/* Help Categories */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <BookOpen className="h-10 w-10 text-blue-600 mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">دليل الخطوات</h3>
            <p className="text-gray-600 text-sm">
              شرح مفصل لكل خطوة من خطوات إنشاء متجرك مع نصائح مهمة
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <FileText className="h-10 w-10 text-green-600 mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">دليل PDF</h3>
            <p className="text-gray-600 text-sm">
              نسخة احترافية من الدليل يمكنك تحميلها وطباعتها
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <MessageCircle className="h-10 w-10 text-purple-600 mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">الدعم المباشر</h3>
            <p className="text-gray-600 text-sm">
              تواصل مع فريق الدعم لديك 24/7 للإجابة على أسئلتك
            </p>
          </div>
        </div>

        {/* PDF Preview Section */}
        <div id="pdf-content" className="bg-white p-0 mb-12 overflow-hidden">
          {/* 1. Cover Page */}
          <div 
            data-pdf-page="true" 
            className="flex flex-col items-center justify-center min-h-[1000px] text-center bg-gradient-to-b from-green-50 to-white p-20"
          >
            <div className="mb-12 flex flex-col items-center justify-center">
              <img src="/eshro-new-logo.png" alt="إشرو" className="h-40 w-auto object-contain mb-6" />
              <div className="h-2 w-32 bg-green-600 rounded-full"></div>
            </div>
            
            <h1 className="text-7xl font-black text-gray-900 mb-8 leading-tight text-center">
              دليل إنشاء متجر جديد <br/>
              <span className="text-green-600">للتاجر</span>
            </h1>
            
            <p className="text-3xl text-gray-600 mb-20 max-w-2xl mx-auto leading-relaxed text-center">
              دليل خطوة بخطوة يرافقك في رحلة إطلاق متجرك الإلكتروني بنجاح على منصة إشرو
            </p>
            
            <div className="grid grid-cols-2 gap-12 text-center border-t border-gray-200 pt-12 w-full max-w-2xl">
              <div className="flex flex-col items-center">
                <p className="text-gray-500 mb-2 text-lg">تاريخ الإصدار</p>
                <p className="text-2xl font-bold text-gray-800">يناير 2025</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-gray-500 mb-2 text-lg">المنصة</p>
                <p className="text-2xl font-bold text-gray-800">إشرو - Ishro</p>
              </div>
            </div>
          </div>

          {/* 2. Steps Pages */}
          <div className="space-y-0">
            {steps.map((step, index) => (
              <div
                key={step.number}
                data-pdf-page="true"
                className="min-h-[1000px] flex flex-col items-center justify-center py-20 px-16 bg-white"
              >
                {/* Step Header */}
                <div className="w-full text-center mb-12 flex flex-col items-center">
                  <div className="inline-flex items-center justify-center bg-green-600 text-white rounded-2xl w-20 h-20 font-bold text-3xl shadow-xl mb-6">
                    {step.number}
                  </div>
                  <h2 className="text-4xl font-black text-gray-900 mb-4 text-center">{step.title}</h2>
                  <div className="h-1.5 w-24 bg-green-500 rounded-full mb-6"></div>
                  <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed text-center font-medium">
                    {step.description}
                  </p>
                </div>

                {/* Main Image - Centered and Large */}
                <div className="w-full flex-1 flex items-center justify-center mb-12 bg-gray-50 rounded-3xl p-10 border border-gray-100 shadow-inner overflow-hidden">
                  <img
                    src={step.image}
                    alt={`الخطوة ${step.number}`}
                    className="max-w-full max-h-[550px] object-contain shadow-2xl rounded-xl border-4 border-white"
                  />
                </div>

                {/* Tips - Professional Box */}
                <div className="w-full bg-green-50 rounded-2xl p-8 border-r-8 border-green-600 shadow-sm flex flex-col items-center">
                  <h4 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-3">
                    <span className="text-3xl">💡</span> نصائح النجاح للخطوة {step.number}
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    {step.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="text-xl text-green-800 flex items-center justify-center gap-3 text-center">
                        <span className="text-green-600 font-black text-2xl">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Footer for each page */}
                <div className="w-full mt-12 pt-8 border-t border-gray-100 flex justify-between items-center text-gray-400 font-bold">
                  <span>دليل إنشاء متجر - منصة إشرو</span>
                  <span>صفحة {index + 2}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 3. Final Page / Contact */}
          <div 
            data-pdf-page="true" 
            className="min-h-[1000px] flex flex-col items-center justify-center text-center py-20 px-16 bg-green-900 text-white"
          >
            <h2 className="text-6xl font-black mb-10 text-white text-center leading-tight">هل أنت جاهز للبداية؟</h2>
            <p className="text-3xl text-green-100 mb-16 max-w-2xl mx-auto leading-relaxed text-center">
              متجرك الآن على بعد نقرة واحدة. ابدأ اليوم وانضم إلى مئات التجار الناجحين في ليبيا.
            </p>
            
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 w-full max-w-3xl border border-white/20 flex flex-col items-center">
              <h3 className="text-4xl font-bold mb-10 text-center">قنوات الدعم الفني</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-center w-full">
                <div className="flex flex-col items-center">
                  <p className="text-green-300 text-xl mb-3">تواصل معنا عبر الهاتف</p>
                  <p className="text-4xl font-black" dir="ltr">+218 94 4062927</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-green-300 text-xl mb-3">البريد الإلكتروني</p>
                  <p className="text-3xl font-black">support@ishro.ly</p>
                </div>
              </div>
            </div>
            
            <div className="mt-24 flex flex-col items-center justify-center">
              <img src="/eshro-logo-white.png" alt="إشرو" className="h-24 w-auto object-contain mx-auto mb-6" />
              <p className="text-xl text-green-400 font-bold">جميع الحقوق محفوظة © 2025</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">❓ الأسئلة الشائعة</h2>
          <div className="space-y-4">
            {[
              {
                q: 'ما هي متطلبات الحد الأدنى للصور؟',
                a: 'الحد الأدنى لحجم الصور هو 200x200 بكسل، والحد الأفضل 500x500 بكسل أو أكثر. الصيغ المدعومة: PNG, JPG, WebP',
              },
              {
                q: 'هل يمكن تغيير اسم النطاق (Subdomain) بعد الإنشاء؟',
                a: 'لا، اسم النطاق لا يمكن تغييره بعد الإنشاء، لذا اختره بعناية.',
              },
              {
                q: 'كم من الوقت يستغرق تفعيل المتجر؟',
                a: 'عادة ما يتم تفعيل المتجر في غضون 24-48 ساعة بعد تقديم جميع الوثائق.',
              },
              {
                q: 'هل يمكنني البدء بإضافة المنتجات قبل تفعيل المتجر؟',
                a: 'نعم، يمكنك إضافة المنتجات في أي وقت، لكنها لن تظهر للعملاء حتى يتم تفعيل متجرك.',
              },
            ].map((item, index) => (
              <details
                key={index}
                className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50"
              >
                <summary className="font-bold text-gray-900 cursor-pointer">
                  {item.q}
                </summary>
                <p className="text-gray-700 mt-3 mr-4">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
