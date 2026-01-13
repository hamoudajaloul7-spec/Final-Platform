import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Store, User, ShoppingBag, TrendingUp, Users, Shield, Star, Award, HelpCircle } from 'lucide-react';

interface AccountTypeSelectionPageProps {
  onBack: () => void;
  onSelectMerchant: () => void;
  onSelectVisitor: () => void;
  onSelectMerchantFlow?: () => void;
}

const AccountTypeSelectionPage: React.FC<AccountTypeSelectionPageProps> = ({
  onBack,
  onSelectMerchant,
  onSelectVisitor,
  onSelectMerchantFlow
}) => {
  const [selectedType, setSelectedType] = useState<'merchant' | 'visitor' | null>(null);

  const merchantFeatures = [
    { icon: <Store className="h-5 w-5" />, title: 'متجر إلكتروني كامل', description: 'أدوات متكاملة لبناء وإدارة متجرك' },
    { icon: <TrendingUp className="h-5 w-5" />, title: 'تحليلات متقدمة', description: 'تقارير مفصلة عن المبيعات والعملاء' },
    { icon: <ShoppingBag className="h-5 w-5" />, title: 'إدارة المنتجات', description: 'أدوات قوية لإدارة المخزون والمنتجات' },
    { icon: <Users className="h-5 w-5" />, title: 'إدارة العملاء', description: 'تتبع وإدارة قاعدة العملاء' }
  ];

  const visitorFeatures = [
    { icon: <User className="h-5 w-5" />, title: 'تسوق مريح', description: 'تجربة تسوق سلسة وممتعة' },
    { icon: <Star className="h-5 w-5" />, title: 'عروض خاصة', description: 'خصومات وعروض مخصصة لك' },
    { icon: <Award className="h-5 w-5" />, title: 'برنامج الولاء', description: 'اكتساب نقاط ومكافآت مع كل شراء' },
    { icon: <Shield className="h-5 w-5" />, title: 'حماية شاملة', description: 'حماية كاملة لبياناتك الشخصية' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-50 relative overflow-hidden">
      {/* خلفية ديناميكية محسنة */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-purple-500/10 to-pink-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* الهيدر */}
      <header className="relative z-10 p-4 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            العودة للرئيسية
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Store className="h-5 w-5 text-white" />
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

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* العنوان الرئيسي */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <User className="h-10 w-10 text-white" />
            </div>
            <h1 className="flex items-center justify-center text-3xl font-bold text-gray-900 mb-4">اختر نوع الحساب المناسب لك</h1>
            <p className="center justify-center text-lg text-gray-600 max-w-2xl mx-auto">
              انضم إلى مجتمع إشرو بالطريقة التي تناسب احتياجاتك، سواء كنت تاجراً تبحث عن منصة لبيع منتجاتك أو زائراً تبحث عن أفضل العروض
            </p>
          </div>

          {/* خيارات الحسابات */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* حساب التاجر */}
            <Card className={`relative cursor-pointer transition-all duration-300 hover:shadow-2xl ${
              selectedType === 'merchant'
                ? 'ring-4 ring-primary/20 shadow-2xl scale-105 bg-gradient-to-br from-primary/5 to-primary/10'
                : 'hover:shadow-xl hover:scale-102'
            }`} onClick={() => setSelectedType('merchant')}>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Store className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="flex items-center justify-center text-2xl text-blue-700 text-center">حساب تاجر</CardTitle>
                <p className="flex items-center justify-center text-gray-600 text-center">لأصحاب الأعمال والمتاجر الإلكترونية</p>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {merchantFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg">
                      <div className="text-blue-600 mt-1">{feature.icon}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{feature.title}</h3>
                        <p className="text-xs text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white text-center">
                  <p className="flex items-center justify-center font-semibold text-center">ابدأ رحلتك كتاجر ناجح مع إشرو</p>
                  <p className="flex items-center justify-center text-sm opacity-90 text-center">انضم إلى آلاف التجار الناجحين</p>
                </div>
              </CardContent>

              {selectedType === 'merchant' && (
                <div className="absolute top-4 right-4 bg-primary rounded-full p-1">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              )}
            </Card>

            {/* حساب الزائر */}
            <Card className={`relative cursor-pointer transition-all duration-300 hover:shadow-2xl ${
              selectedType === 'visitor'
                ? 'ring-4 ring-green-500/20 shadow-2xl scale-105 bg-gradient-to-br from-green-50 to-green-100'
                : 'hover:shadow-xl hover:scale-102'
            }`} onClick={() => setSelectedType('visitor')}>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="flex items-center justify-center text-2xl text-green-700 text-center">حساب زائر</CardTitle>
                <p className="flex items-center justify-center text-gray-600 text-center">للمتسوقين والعملاء الأفراد</p>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {visitorFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50/50 rounded-lg">
                      <div className="text-green-600 mt-1">{feature.icon}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{feature.title}</h3>
                        <p className="text-xs text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white text-center">
                  <p className="flex items-center justify-center font-semibold text-center">استمتع بتجربة تسوق استثنائية</p>
                  <p className="flex items-center justify-center text-sm opacity-90 text-center">اكتشف آلاف المنتجات والعروض</p>
                </div>
              </CardContent>

              {selectedType === 'visitor' && (
                <div className="absolute top-4 right-4 bg-green-500 rounded-full p-1">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              )}
            </Card>
          </div>

          {/* زر التأكيد */}
          <div className="text-center flex justify-center">
            {selectedType === 'merchant' && (
              <Button
                onClick={onSelectMerchantFlow || onSelectMerchant}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-12 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center flex items-center justify-center"
              >
                <Store className="h-5 w-5 mr-2" />
                متابعة كتاجر
              </Button>
            )}

            {selectedType === 'visitor' && (
              <Button
                onClick={onSelectVisitor}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-12 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center flex items-center justify-center"
              >
                <User className="h-5 w-5 mr-2" />
                متابعة كزائر
              </Button>
            )}

            {!selectedType && (
              <p className="text-gray-500">يرجى اختيار نوع الحساب للمتابعة</p>
            )}
          </div>

          {/* إحصائيات منصة إشرو */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="text-3xl font-bold text-primary mb-2">10k+</div>
              <div className="text-sm text-gray-600">عميل نشط</div>
            </div>
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="text-3xl font-bold text-primary mb-2">5k+</div>
              <div className="text-sm text-gray-600">تاجر ناجح</div>
            </div>
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="text-3xl font-bold text-primary mb-2">50k+</div>
              <div className="text-sm text-gray-600">منتج متاح</div>
            </div>
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-gray-600">دعم فني</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountTypeSelectionPage;
