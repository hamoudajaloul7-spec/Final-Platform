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
        <div id="pdf-content" className="bg-white rounded-lg shadow-lg p-8 mb-12 print:shadow-none">
          {/* PDF Header */}
          <div className="text-center mb-8 border-b-2 border-green-600 pb-6">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">دليل التاجر الشامل</h2>
            <p className="text-gray-600 text-lg">منصة إشرو للتجارة الإلكترونية</p>
            <p className="text-gray-500 mt-4">النسخة 1.0 - 2025</p>
          </div>

          {/* Steps */}
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div
                key={step.number}
                data-pdf-page="true"
                className="border-2 border-gray-200 rounded-xl p-8 hover:border-green-400 transition-colors bg-white"
              >
                <div className="flex items-center gap-6 mb-8 border-b border-gray-100 pb-6">
                  <div className="bg-gradient-to-br from-green-600 to-green-400 text-white rounded-2xl w-16 h-16 flex items-center justify-center flex-shrink-0 font-bold text-2xl shadow-lg">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {/* Image Container with specific aspect ratio for PDF */}
                <div className="mb-8 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
                  <img
                    src={step.image}
                    alt={`الخطوة ${step.number}`}
                    className="w-full h-auto max-h-[600px] object-contain mx-auto"
                  />
                </div>

                {/* Tips Section */}
                <div className="bg-green-50 border-r-4 border-green-500 p-6 rounded-xl">
                  <h4 className="font-bold text-green-900 mb-3 text-lg flex items-center gap-2">
                    <span className="text-xl">💡</span>
                    نصائح النجاح:
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {step.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="text-green-800 flex items-start gap-2">
                        <span className="text-green-600 font-bold mt-1">●</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Section */}
          <div className="mt-12 pt-8 border-t-2 border-gray-200">
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-green-900 mb-4">✅ ملخص العملية</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">8</div>
                  <p className="text-gray-700">خطوات سهلة</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">30-90</div>
                  <p className="text-gray-700">دقيقة لإنشاء متجرك</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">24/7</div>
                  <p className="text-gray-700">دعم مستمر</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📞 هل تحتاج إلى مساعدة؟</h3>
            <p className="text-gray-700 mb-4">
              فريق الدعم الخاص بنا جاهز للمساعدة على مدار الساعة
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 mb-1">
                  <strong>البريد الإلكتروني:</strong> support@ishro.ly
                </p>
              </div>
              <div>
                <p className="text-gray-600">
                  <strong>الهاتف:</strong> +218 94 4062927
                </p>
              </div>
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
