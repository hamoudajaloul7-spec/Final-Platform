import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, FileText, Shield, HelpCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MerchantTermsAcceptanceProps {
  onBack: () => void;
  onAccept: () => void;
}

const MerchantTermsAcceptance: React.FC<MerchantTermsAcceptanceProps> = ({
  onBack,
  onAccept
}) => {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptLiability, setAcceptLiability] = useState(false);

  const canProceed = acceptTerms && acceptPrivacy && acceptLiability;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <header className="p-4 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            العودة
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">إشرو</span>
          </div>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/help-center';
              }
            }}
            className="flex items-center gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            مركز المساعدة
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">شروط الخدمة والخصوصية</h1>
            <p className="text-slate-600">يجب عليك قبول الشروط والأحكام قبل متابعة إنشاء متجرك</p>
          </div>

          <div className="space-y-6">
            {/* شروط الاستخدام */}
            <Card className="border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                  شروط الخدمة والاستخدام
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-64">
                  <div className="p-4 text-sm text-gray-700 space-y-3">
                    <h3 className="font-semibold text-gray-900">1. قبول الشروط</h3>
                    <p>بالموافقة على هذه الشروط، أنت توافق على الالتزام بجميع الشروط والأحكام الموضحة هنا. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام منصة إشرو.</p>

                    <h3 className="font-semibold text-gray-900">2. حقوقك والتزاماتك كتاجر</h3>
                    <p>كتاجر على منصة إشرو، فإنك توافق على:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>بيع منتجات أصلية وقانونية فقط</li>
                      <li>الالتزام بجميع القوانين واللوائح المحلية والدولية</li>
                      <li>توفير معلومات دقيقة وموثوقة عن المنتجات</li>
                      <li>الرد على استفسارات العملاء بسرعة معقولة</li>
                      <li>التعامل بأمانة وشفافية مع جميع العملاء</li>
                    </ul>

                    <h3 className="font-semibold text-gray-900">3. المحتوى الممنوع</h3>
                    <p>لا يُسمح ببيع أي منتجات محظورة أو مخالفة للقانون، بما في ذلك:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>المنتجات المقلدة أو المزيفة</li>
                      <li>المواد المخدرة والكحولية</li>
                      <li>الأسلحة والمتفجرات</li>
                      <li>المواد الإباحية</li>
                      <li>أي محتوى ينتهك الملكية الفكرية</li>
                    </ul>

                    <h3 className="font-semibold text-gray-900">4. الرسوم والعمولات</h3>
                    <p>تخضع جميع المبيعات لعمولة منصة إشرو المتفق عليها، والتي سيتم خصمها من قيمة المبيعات تلقائياً.</p>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* سياسة الخصوصية */}
            <Card className="border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                  سياسة الخصوصية
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-64">
                  <div className="p-4 text-sm text-gray-700 space-y-3">
                    <h3 className="font-semibold text-gray-900">1. جمع البيانات</h3>
                    <p>نحن نجمع بيانات شخصية ضرورية لتشغيل المتجر الإلكتروني وتقديم الخدمات.</p>

                    <h3 className="font-semibold text-gray-900">2. استخدام البيانات</h3>
                    <p>يتم استخدام بياناتك فقط للأغراض التالية:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>إدارة متجرك والعمليات التجارية</li>
                      <li>التواصل معك حول الطلبات والخدمات</li>
                      <li>تحسين جودة الخدمات المقدمة</li>
                      <li>الامتثال للالتزامات القانونية</li>
                    </ul>

                    <h3 className="font-semibold text-gray-900">3. حماية البيانات</h3>
                    <p>نلتزم بحماية بياناتك الشخصية باستخدام تقنيات التشفير والأمان المتقدمة.</p>

                    <h3 className="font-semibold text-gray-900">4. مشاركة البيانات</h3>
                    <p>لن نشارك بياناتك الشخصية مع جهات خارجية إلا عند الضرورة القانونية أو بموافقتك الصريحة.</p>

                    <h3 className="font-semibold text-gray-900">5. حقوقك</h3>
                    <p>لديك الحق في الوصول إلى بياناتك وتصحيحها وحذفها بناءً على القوانين المعمول بها.</p>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* تنصل من المسؤولية */}
            <Card className="border-amber-200">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  تنصل من المسؤولية
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-64">
                  <div className="p-4 text-sm text-gray-700 space-y-3">
                    <h3 className="font-semibold text-gray-900">1. المسؤولية القانونية</h3>
                    <p>أنت المسؤول بالكامل عن جميع المنتجات والخدمات التي تقدمها من خلال متجرك، وعن الامتثال لجميع القوانين واللوائح المعمول بها.</p>

                    <h3 className="font-semibold text-gray-900">2. مسؤولية المنصة</h3>
                    <p>منصة إشرو توفر الخدمة "كما هي" ولا تتحمل مسؤولية عن:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>جودة المنتجات المباعة</li>
                      <li>سلوك البائعين والمشترين</li>
                      <li>أي نزاعات بين الأطراف</li>
                      <li>الخسائر الناجمة عن استخدام المنصة</li>
                    </ul>

                    <h3 className="font-semibold text-gray-900">3. الامتثال للقوانين</h3>
                    <p>أنت توافق على أنك ستلتزم بجميع القوانين واللوائح المحلية والدولية، وتتحمل مسؤولية كاملة عن أي انتهاكات.</p>

                    <h3 className="font-semibold text-gray-900">4. الحل الودي للنزاعات</h3>
                    <p>في حالة حدوث أي نزاع، نتعهد بحل النزاع بطريقة ودية وعادلة، وإذا لم نستطع الوصول إلى اتفاق، يمكن تصعيد النزاع للجهات المختصة.</p>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* موافقات */}
            <div className="space-y-4 bg-slate-50 p-6 rounded-lg border border-slate-200">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="accept-terms"
                  checked={acceptTerms}
                  onCheckedChange={setAcceptTerms}
                />
                <label htmlFor="accept-terms" className="text-sm cursor-pointer">
                  <span className="font-semibold text-gray-900">أوافق على شروط الخدمة والاستخدام</span>
                  <p className="text-xs text-gray-500 mt-1">أفهم جميع الالتزامات والمسؤوليات المترتبة على هذه الشروط</p>
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="accept-privacy"
                  checked={acceptPrivacy}
                  onCheckedChange={setAcceptPrivacy}
                />
                <label htmlFor="accept-privacy" className="text-sm cursor-pointer">
                  <span className="font-semibold text-gray-900">أوافق على سياسة الخصوصية</span>
                  <p className="text-xs text-gray-500 mt-1">أفهم كيفية استخدام بياناتي الشخصية وحمايتها</p>
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="accept-liability"
                  checked={acceptLiability}
                  onCheckedChange={setAcceptLiability}
                />
                <label htmlFor="accept-liability" className="text-sm cursor-pointer">
                  <span className="font-semibold text-gray-900">أتحمل المسؤولية القانونية الكاملة</span>
                  <p className="text-xs text-gray-500 mt-1">أفهم أنني مسؤول بالكامل عن جميع منتجاتي والامتثال للقوانين</p>
                </label>
              </div>
            </div>

            {/* أزرار التنقل */}
            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                رجوع
              </Button>

              <Button
                onClick={onAccept}
                disabled={!canProceed}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                متابعة
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {!canProceed && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  يجب قبول جميع الشروط والسياسات للمتابعة
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantTermsAcceptance;
