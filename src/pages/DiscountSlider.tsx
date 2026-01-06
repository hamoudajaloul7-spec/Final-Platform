/**
 * 🎨 DiscountSlider - سلايدر الإعلانات الاحترافي المطور لمنصة إشرو
 * تصميم احترافي متطور يطابق الصورة 413-1 بدقة
 * 
 * Layout المطلوب:
 * - سلايدر أفقي عريض في الأعلى (full width) - تغيير تلقائي كل 5 ثواني
 * - سلايدر عمودي كبير على اليسار (يغطي ارتفاع الـ 3 سلايدرات)
 * - 3 سلايدرات ثابتة متوسطة الحجم على اليمين
 */

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import '../components/DiscountSlider.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// مكون الخلفية المتحركة الاحترافية
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {/* Gradient Orbs */}
      <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-gradient-to-br from-emerald-400/40 to-blue-500/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-gradient-to-tr from-green-400/40 to-emerald-500/40 rounded-full blur-3xl animate-pulse discount-slider-delay-1000" />
      
      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-gradient-to-br from-emerald-500/30 to-green-500/30 backdrop-blur-sm"
          style={{
            width: `${Math.random() * 10 + 6}px`,
            height: `${Math.random() * 10 + 6}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationName: 'discount-slider-float',
            animationDuration: `${Math.random() * 12 + 18}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: `${i * 0.6}s`,
          }}
        />
      ))}
    </div>
  );
};

const getBackendUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) return apiUrl;
  return typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://final-platform-eshro.onrender.com';
};

const getImageUrl = (assetPath: string) => {
  if (assetPath.startsWith('/assets/')) {
    return {
      primary: assetPath,
      fallback: assetPath,
    };
  }
  const backendUrl = getBackendUrl();
  return {
    primary: `${backendUrl}${assetPath}`,
    fallback: assetPath,
  };
};

// بيانات السلايدر الأفقي العلوي (يتغير تلقائياً كل 5 ثواني)
const topHorizontalSlides = [
  { id: 1, image: '/assets/DiscountSlider/GS-WM.jpg', alt: 'غسالة General Supreme', title: 'عرض خاص على الغسالات' },
  { id: 2, image: '/assets/DiscountSlider/Half-Price.jpg', alt: 'نصف السعر', title: 'تخفيضات تصل لـ 50%' },
  { id: 3, image: '/assets/DiscountSlider/OCT-Sale.jpg', alt: 'عروض أكتوبر', title: 'عروض أكتوبر المميزة' },
  { id: 4, image: '/assets/DiscountSlider/Onix.jpg', alt: 'Onix', title: 'منتجات Onix الحصرية' },
  { id: 5, image: '/assets/DiscountSlider/web2.avif', alt: 'عروض مميزة', title: 'عروض لا تفوت' },
  { id: 6, image: '/assets/DiscountSlider/web1.avif', alt: 'تخفيضات ضخمة', title: 'تخفيضات ضخمة' },
];

// بيانات السلايدر العمودي الكبير (يسار)
const leftVerticalSlides = [
  { id: 1, image: '/assets/DiscountSlider/DishwasherFairy.jpg', alt: 'Fairy Dishwasher', badge: 'جديد' },
  { id: 2, image: '/assets/DiscountSlider/RS5.jpg', alt: 'Samsung RS5', badge: 'حصري' },
];

// بيانات السلايدرات الثابتة (يمين - 3 سلايدرات)
const rightStaticSlides = [
  { id: 1, image: '/assets/DiscountSlider/WD90T654DBN.jpg', alt: 'Samsung WD90', discount: '200'},
  { id: 2, image: '/assets/DiscountSlider/GSTN180CR.jpg', alt: 'General Supreme', discount: '200'},
  { id: 3, image: '/assets/DiscountSlider/TOSHIBA-Ref.jpg', alt: 'Toshiba', discount: '200'},
];

export default function DiscountSlider() {
  const [currentTopSlide, setCurrentTopSlide] = useState(0);
  const [currentLeftSlide, setCurrentLeftSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // تبديل السلايدر الأفقي العلوي تلقائياً كل 5 ثواني
  useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(() => {
      setCurrentTopSlide((prev) => (prev + 1) % topHorizontalSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovering]);

  // تبديل السلايدر العمودي تلقائياً كل 6 ثواني
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLeftSlide((prev) => (prev + 1) % leftVerticalSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-8 md:py-12">
      <AnimatedBackground />

      {/* العنوان المركزي */}
      <div className="text-center mb-8 md:mb-12 px-4 relative z-10">
        <h2 className="flex items-center justify-center text-2xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-600 via-green-600 to-blue-600 bg-clip-text text-transparent drop-shadow-lg animate-fade-in">
          عروض وتخفيضات إشرو
        </h2>
        <p className="flex items-center justify-center text-base md:text-xl text-gray-700 font-bold">
          اغتنم الفرصة واحصل على أفضل الأسعار
        </p>
      </div>

      <div className="w-full px-3 md:px-6 lg:px-8 mx-auto max-w-7xl relative z-10">
        {/* 1️⃣ السلايدر الأفقي العلوي - Full Width */}
        <div 
          className="mb-4 md:mb-6" 
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <Card className="relative overflow-hidden rounded-3xl border-none shadow-2xl h-[200px] md:h-[280px] lg:h-[350px] group">
            {/* الصور */}
            <div className="relative w-full h-full">
              {topHorizontalSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-all duration-1000 ${
                    index === currentTopSlide 
                      ? 'opacity-100 scale-100 z-10' 
                      : 'opacity-0 scale-95 z-0'
                  }`}
                >
                  <img
                    src={getImageUrl(slide.image).primary}
                    alt={slide.alt}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== getImageUrl(slide.image).fallback) {
                        target.src = getImageUrl(slide.image).fallback;
                      } else {
                        target.style.display = 'none';
                      }
                    }}
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  
                  {/* عنوان الشريحة */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-white text-xl md:text-3xl font-black drop-shadow-2xl">
                      {slide.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            {/* أزرار التنقل */}
            <button
              onClick={() => setCurrentTopSlide((prev) => (prev - 1 + topHorizontalSlides.length) % topHorizontalSlides.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 z-20"
              title="السابق"
              aria-label="السابق"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>
            <button
              onClick={() => setCurrentTopSlide((prev) => (prev + 1) % topHorizontalSlides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 z-20"
              title="التالي"
              aria-label="التالي"
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>

            {/* مؤشرات السلايدر */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {topHorizontalSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTopSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    currentTopSlide === index
                      ? 'w-10 h-3 bg-white shadow-lg'
                      : 'w-3 h-3 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`الشريحة ${index + 1}`}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* 2️⃣ Grid السفلي: السلايدر العمودي + 3 السلايدرات الثابتة */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* السلايدر العمودي الكبير - اليسار (4 أعمدة) */}
          <div className="lg:col-span-4 order-2 lg:order-1">
            <Card className="relative overflow-hidden rounded-3xl border-none shadow-2xl h-[400px] md:h-[500px] lg:h-full group">
              {/* الصور */}
              <div className="relative w-full h-full">
                {leftVerticalSlides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-1000 ${
                      index === currentLeftSlide 
                        ? 'opacity-100 scale-100 z-10' 
                        : 'opacity-0 scale-95 z-0'
                    }`}
                  >
                    <img
                      src={getImageUrl(slide.image).primary}
                      alt={slide.alt}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== getImageUrl(slide.image).fallback) {
                          target.src = getImageUrl(slide.image).fallback;
                        } else {
                          target.style.display = 'none';
                        }
                      }}
                    />
                    {/* Badge */}
                    <div className="absolute top-6 right-6 bg-red-500 text-white px-4 py-2 rounded-full font-black text-sm shadow-xl">
                      {slide.badge}
                    </div>
                  </div>
                ))}
              </div>

              {/* مؤشرات عمودية */}
              <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col gap-3 z-20">
                {leftVerticalSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentLeftSlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      currentLeftSlide === index
                        ? 'w-3 h-10 bg-white shadow-lg'
                        : 'w-3 h-3 bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`الشريحة ${index + 1}`}
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* 3 السلايدرات الثابتة - اليمين (8 أعمدة مقسمة إلى 3) */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 h-full">
              {rightStaticSlides.map((slide, index) => (
                <Card
                  key={slide.id}
                  className="relative overflow-hidden rounded-3xl border-none shadow-xl hover:shadow-2xl transition-all duration-500 group h-[250px] md:h-full"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* الصورة */}
                  <img
                    src={getImageUrl(slide.image).primary}
                    alt={slide.alt}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== getImageUrl(slide.image).fallback) {
                        target.src = getImageUrl(slide.image).fallback;
                      } else {
                        target.style.display = 'none';
                      }
                    }}
                  />

                  {/* Badge الترتيب */}
                  <div className="absolute top-4 left-4 bg-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-xl">
                    {slide.discount}
                  </div>

                  {/* Overlay عند Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* معلومات التخفيض */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-yellow-400 text-3xl font-black drop-shadow-lg">
                        {slide.discount}
                      </span>
                      <span className="text-white text-lg font-bold">
                        د.ل
                      </span>
                    </div>
                    <p className="text-white/90 text-sm font-bold">
                      تخفيضات من 10% إلى + 50%
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* الزر الترويجي في المنتصف أسفل السلايدر */}
        <div className="flex justify-center mt-8 md:mt-10">
          <button className="group relative bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 text-white px-10 md:px-16 py-4 md:py-5 rounded-full shadow-2xl hover:shadow-emerald-500/50 transition-all duration-500 hover:scale-105 overflow-hidden" title="عروض حصرية">
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            <p className="relative text-base md:text-xl font-black flex items-center gap-3">
              <span className="text-2xl md:text-3xl">🎉</span>
              عروض حصرية لفترة محدودة - لا تفوت الفرصة!
              <span className="text-2xl md:text-3xl">🎉</span>
            </p>
          </button>
        </div>
      </div>
    </section>
  );
}
