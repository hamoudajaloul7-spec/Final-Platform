import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import type { Product } from '../../storeProducts';

const getBackendUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) return apiUrl;
  return typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://eishro-backend.onrender.com';
};

const getImageUrl = (assetPath: string) => {
  if (assetPath.startsWith('/assets/')) {
    return {
      primary: assetPath,
      fallback: assetPath,
    };
  }

  const backendUrl = getBackendUrl();
  const normalizedBackendUrl = backendUrl.replace(/\/?api\/?$/, '');

  return {
    primary: `${normalizedBackendUrl}${assetPath}`,
    fallback: assetPath,
  };
};

interface SheirineSliderProps {
  products: Product[];
  sliderImages?: Array<{ id: string | number; image: string; title?: string; subtitle?: string; buttonText?: string }>;
  storeSlug?: string;
  onProductClick: (productId: number) => void;
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (productId: number) => void;
  favorites: number[];
}

const SheirineSlider: React.FC<SheirineSliderProps> = ({
  products,
  sliderImages,
  storeSlug = 'sheirine',
  onProductClick,
  onAddToCart,
  onToggleFavorite,
  favorites = []
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  const defaultBanners = [
    {
      id: 'banner1',
      image: getImageUrl('/assets/sherine/sliders/slider1.webp').primary,
      fallbackImage: getImageUrl('/assets/sherine/sliders/slider1.webp').fallback,
      title: 'مجموعة ملابس الفاخرة في شيرين'
    },
    {
      id: 'banner2',
      image: getImageUrl('/assets/sherine/sliders/slider2.jpg').primary,
      fallbackImage: getImageUrl('/assets/sherine/sliders/slider3.webp').fallback,
      title: 'فساتين نسائية أنيقة'
    },
    {
      id: 'banner3',
      image: getImageUrl('/assets/sherine/sliders/slider4.webp').primary,
      fallbackImage: getImageUrl('/assets/sherine/sliders/slider4.webp').fallback,
      title: 'ملابس نسائية مميزة'
    },
    {
      id: 'banner4',
      image: getImageUrl('/assets/sherine/sliders/slider3.webp').primary,
      fallbackImage: getImageUrl('/assets/sherine/sliders/slider1.webp').fallback,
      title: 'مجموعات فساتين خاصة'
    },
  ];

  if (sliderImages && sliderImages.length > 0) {
    void 0;
  }

  const allSlides = (Array.isArray(sliderImages) && sliderImages.length > 0) ? sliderImages : defaultBanners;

  // التشغيل التلقائي
  useEffect(() => {
    if (!isAutoPlaying || allSlides.length <= 1 || isDragging) return;

    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % allSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, allSlides.length, isDragging]);

  const nextSlide = () => {
    setActiveSlide(prev => (prev + 1) % allSlides.length);
  };

  const prevSlide = () => {
    setActiveSlide(prev => (prev - 1 + allSlides.length) % allSlides.length);
  };

  const goToSlide = (index: number) => {
    setActiveSlide(index);
  };

  // معالجة السحب للأجهزة اللمسية
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
    setIsAutoPlaying(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    const diff = e.clientX - startX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }

    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  // ألوان متجر شيرين
  const storeColors = {
    background: 'from-pink-50 via-purple-50 to-fuchsia-50',
    accent: 'from-pink-400 via-purple-400 to-fuchsia-400',
    gradient: 'from-pink-500 to-purple-600',
    button: 'from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
  };

  return (
    <div className={`relative h-[500px] md:h-[600px] overflow-hidden bg-gradient-to-br ${storeColors.background}`}>
      {/* خلفية متحركة لمتجر شيرين */}
      <div className="absolute inset-0">
        <div className={`absolute inset-0 bg-gradient-to-r ${storeColors.accent}/20 via-current/10 to-current/20`}></div>
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Sparkles className="h-4 w-4 text-pink-400/40" />
            </div>
          ))}
        </div>
      </div>

      {/* السلايدر */}
      <div
        ref={sliderRef}
        className="relative h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (isDragging) {
            setIsDragging(false);
            setIsAutoPlaying(true);
          }
        }}
      >
        <div className="relative h-full w-full">
          {allSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === activeSlide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                filter: isDragging ? 'brightness(0.9)' : 'brightness(1)'
              }}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (slide.fallbackImage && target.src !== slide.fallbackImage) {
                    target.src = slide.fallbackImage;
                  } else {
                    target.style.display = 'none';
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* أزرار التنقل */}
      {allSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            title="الشريحة السابقة"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-pink-200 hover:border-pink-400 z-50"
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <button
            onClick={nextSlide}
            title="الشريحة التالية"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-pink-200 hover:border-pink-400 z-50"
          >
            <ArrowRight className="h-6 w-6 text-gray-700" />
          </button>
        </>
      )}

      {/* نقاط التنقل */}
      {allSlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
          {allSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              title={`انتقل إلى الشريحة ${index + 1}`}
              className={`transition-all duration-300 rounded-full ${
                index === activeSlide
                  ? 'w-10 h-3 bg-gradient-to-r from-pink-400 to-purple-500'
                  : 'w-3 h-3 bg-white/60 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}

      {/* مؤشر التشغيل التلقائي */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={`p-2 rounded-full backdrop-blur-sm border transition-all duration-300 ${
            isAutoPlaying
              ? 'bg-green-500/90 border-green-300 text-white'
              : 'bg-white/90 border-gray-300 text-gray-600'
          }`}
        >
          {isAutoPlaying ? (
            <div className="h-3 w-3 bg-white rounded-full animate-pulse" />
          ) : (
            <div className="h-3 w-3 bg-gray-400 rounded-full" />
          )}
        </button>
      </div>
    </div>
  );
};

export default SheirineSlider;
