import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { partnersData } from "@/data/ecommerceData";
import { 
  DollarSign, 
  Truck, 
  Store,
  Zap,
  ArrowLeft,
  Building,
  CreditCard,
  Package
} from "lucide-react";

// مكون المكعبات المتحركة
const FloatingCubes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className={`absolute w-3 h-3 bg-primary/20 floating-cube`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.7}s`,
          }}
        />
      ))}
    </div>
  );
};

// مكون الهيدر المبسط
const Header = ({ onBack }: { onBack: () => void }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <FloatingCubes />
      <div className="w-full px-4 mx-auto max-w-7xl flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            العودة للرئيسية
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <img 
            src="/eshro-new-logo.png" 
            alt="إشرو" 
            className="h-10 w-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'w-8 h-8 bg-primary rounded-lg flex items-center justify-center';
              fallback.innerHTML = '<svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/></svg>';
              (e.target as HTMLImageElement).parentNode?.appendChild(fallback);
            }}
          />
        </div>
      </div>
    </header>
  );
};

// بيانات الشركاء مرتبة من اليسار لليمين كما طُلب - مستوردة من ملف البيانات

export default function PartnersPage({ onBack }: { onBack: () => void }) {
  const [activeCategory, setActiveCategory] = useState<'banks' | 'payment' | 'transport'>('banks');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasError, setHasError] = useState(false);

  // معالج الأخطاء
  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      setHasError(true);
    };
    
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">خطأ في تحميل الصفحة</h2>
          <p className="text-muted-foreground mb-4">عذراً، حدث خطأ أثناء تحميل صفحة الشركاء</p>
          <Button onClick={() => window.location.reload()}>
            إعادة تحميل الصفحة
          </Button>
        </div>
      </div>
    );
  }

  const handleCategoryChange = (categoryId: 'banks' | 'payment' | 'transport') => {
    if (categoryId === activeCategory) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveCategory(categoryId);
      setIsTransitioning(false);
    }, 150);
  };

  const categories = [
    {
      id: 'banks' as const,
      title: 'المصارف التجارية',
      icon: <Building className="h-6 w-6" />,
      description: 'شراكات مع أكبر المصارف في ليبيا لضمان حلول دفع آمنة ومتنوعة',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'payment' as const,
      title: 'شركات الدفع الإلكتروني',
      icon: <CreditCard className="h-6 w-6" />,
      description: 'حلول دفع رقمية متطورة لتسهيل عمليات الشراء والبيع',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'transport' as const,
      title: 'شركات الشحن والتوصيل',
      icon: <Package className="h-6 w-6" />,
      description: 'شبكة توصيل واسعة تغطي جميع أنحاء ليبيا',
      color: 'from-orange-500 to-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10">
      <Header onBack={onBack} />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <FloatingCubes />
        
        <div className="w-full px-4 mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col items-center justify-center text-center mb-16 fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                شركاء النجاح
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-center">
              نتعاون مع أفضل المؤسسات المالية والتقنية في ليبيا لنقدم لك خدمات التجارة الإلكترونية الأكثر تطوراً وأماناً
            </p>
          </div>

          {/* أزرار الفئات */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                size="lg"
                onClick={() => handleCategoryChange(category.id)}
                className={`flex items-center justify-center gap-3 px-6 py-3 transition-all duration-300 min-w-[220px] ${
                  activeCategory === category.id 
                    ? "bg-primary hover:bg-primary/90 scale-105 shadow-lg" 
                    : "hover:scale-102 hover:shadow-md"
                }`}
              >
                <div className="flex items-center justify-center gap-3 w-full text-center">
                  {category.icon}
                  <span className="text-center w-full">{category.title}</span>
                </div>
              </Button>
            ))}
          </div>

          {/* وصف الفئة النشطة */}
          <div className="flex justify-center mb-12">
            <div className="w-full max-w-2xl flex flex-col items-center justify-center text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-primary/20">
              <h3 className="text-2xl font-bold mb-3 text-primary text-center w-full">
                {categories.find(c => c.id === activeCategory)?.title}
              </h3>
              <p className="text-muted-foreground text-center w-full">
                {categories.find(c => c.id === activeCategory)?.description}
              </p>
            </div>
          </div>

          {/* عرض الشركاء */}
          <div className="relative">
            <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8 justify-items-center transition-all duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              {partnersData[activeCategory].map((partner, index) => (
                <Card 
                  key={`${activeCategory}-${index}`}
                  className="w-full group hover:scale-105 transition-all duration-500 card-hover bg-white/80 backdrop-blur-sm border border-primary/10 hover:border-primary/30"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="mb-4 flex justify-center">
                      <div className="w-24 h-16 bg-white rounded-lg border border-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden shadow-sm">
                        <img 
                          src={partner.logo} 
                          alt={partner.name}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const parent = (e.target as HTMLElement).parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-12 h-12 text-primary flex items-center justify-center">
                                ${activeCategory === 'banks' ? '<svg class="h-8 w-8" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"></path></svg>' : ''}
                                ${activeCategory === 'payment' ? '<svg class="h-8 w-8" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path></svg>' : ''}
                                ${activeCategory === 'transport' ? '<svg class="h-8 w-8" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-.293-.707L15 4.586A1 1 0 0014.414 4H14v3z"></path></svg>' : ''}
                              </div>`;
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* عرض اسم الشريك */}
                    <h4 className="text-sm font-medium text-gray-800 text-center">{partner.name}</h4>

                    {/* مؤشرات الحالة - تظهر فقط للمصارف التجارية */}
                    {activeCategory === 'banks' && (
                      <>
                        <div className="flex justify-center gap-1 mt-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full pulse-animation"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full pulse-animation" style={{animationDelay: '0.5s'}}></div>
                          <div className="w-2 h-2 bg-primary rounded-full pulse-animation" style={{animationDelay: '1s'}}></div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>


          </div>

          {/* إحصائيات */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center justify-center text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-primary/20">
              <div className="text-3xl font-bold text-primary mb-2 w-full text-center">16+</div>
              <div className="text-muted-foreground w-full text-center">مصرف تجاري</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-primary/20">
              <div className="text-3xl font-bold text-primary mb-2 w-full text-center">12+</div>
              <div className="text-muted-foreground w-full text-center">شركة دفع إلكتروني</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-primary/20">
              <div className="text-3xl font-bold text-primary mb-2 w-full text-center">19+</div>
              <div className="text-muted-foreground w-full text-center">شركة شحن وتوصيل</div>
            </div>
          </div>

          {/* دعوة للعمل */}
          <div className="flex justify-center mt-16">
            <div className="w-full max-w-2xl flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm rounded-3xl border border-primary/20">
              <h3 className="text-2xl font-bold mb-4 text-primary w-full text-center">
                انضم إلى شبكة شركائنا
              </h3>
              <p className="text-muted-foreground mb-6 w-full text-center">
                هل تريد أن تكون جزءاً من منظومة إشرو للتجارة الإلكترونية؟
              </p>
              <div className="flex justify-center w-full">
                <Button className="bg-primary hover:bg-primary/90 px-8 py-3">
                  تواصل معنا للشراكة
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
