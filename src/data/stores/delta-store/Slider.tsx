import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import type { Product } from '../../storeProducts';

const getBackendUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) return apiUrl.replace('/api', '');
  return typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://localhost:5000'
    : '';
};

const getImageUrl = (assetPath: string) => {
  const backendUrl = getBackendUrl();
  return {
    primary: `${backendUrl}${assetPath}`,
    fallback: assetPath,
  };
};

interface DeltaSliderProps {
  products: Product[];
  sliderImages?: Array<{ id: string | number; image: string; title?: string; subtitle?: string; buttonText?: string }>;
  storeSlug?: string;
  onProductClick: (productId: number) => void;
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (productId: number) => void;
  favorites: number[];
}

const DeltaSlider: React.FC<DeltaSliderProps> = ({
  products,
  sliderImages,
  storeSlug = 'delta-store',
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
      id: 'delta-banner1',
      image: getImageUrl('/assets/delta-store/sliders/slider1.webp').primary,
      fallbackImage: getImageUrl('/assets/delta-store/sliders/slider1.webp').fallback,
      title: 'مجموعة الأوشحة الفاخرة في دلتا ستور'
    },
    {
      id: 'delta-banner2',
      image: getImageUrl('/assets/delta-store/sliders/slider2.webp').primary,
      fallbackImage: getImageUrl('/assets/delta-store/sliders/slider2.webp').fallback,
      title: 'حجاب أنيق وعصري'
    },
    {
      id: 'delta-banner3',
      image: getImageUrl('/assets/delta-store/sliders/slider3.webp').primary,
      fallbackImage: getImageUrl('/assets/delta-store/sliders/slider3.webp').fallback,
      title: 'إكسسوارات حجاب مميزة'
    },
    {
      id: 'delta-banner4',
      image: getImageUrl('/assets/delta-store/sliders/slider4.webp').primary,
      fallbackImage: getImageUrl('/assets/delta-store/sliders/slider4.webp').fallback,
      title: 'ملابس نسائية أنيقة'
    },
    {
      id: 'delta-banner5',
      image: getImageUrl('/assets/delta-store/sliders/slider5.webp').primary,
      fallbackImage: getImageUrl('/assets/delta-store/sliders/slider5.webp').fallback,
      title: 'تشكيلة صيفية مميزة'
    },
    {
      id: 'delta-banner6',
      image: getImageUrl('/assets/delta-store/sliders/slider6.webp').primary,
      fallbackImage: getImageUrl('/assets/delta-store/sliders/slider6.webp').fallback,
      title: 'أحدث صيحات الموضة'
    },
  ];

  if (sliderImages && sliderImages.length > 0) {
    void 0;
  }

  const allSlides = (Array.isArray(sliderImages) && sliderImages.length > 0) ? sliderImages : defaultBanners;

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

  const storeColors = {
    background: 'from-blue-50 via-cyan-50 to-teal-50',
    accent: 'from-blue-400 via-cyan-400 to-teal-400',
    gradient: 'from-blue-500 to-cyan-600',
    button: 'from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700'
  };

  return (
    <div className={`relative h-[500px] md:h-[600px] overflow-hidden bg-gradient-to-br ${storeColors.background}`}>
      <div className="absolute inset-0">
        <div className={`absolute inset-0 bg-gradient-to-r ${storeColors.accent}/20 via-current/10 to-current/20`}></div>
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => {
            const leftPos = Math.random() * 100;
            const topPos = Math.random() * 100;
            const delay = Math.random() * 3;
            const duration = 2 + Math.random() * 2;
            
            return (
              <div
                key={i}
                className="absolute animate-pulse"
                style={{
                  left: `${leftPos}%`,
                  top: `${topPos}%`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`
                }}
              >
                <Sparkles className="h-4 w-4 text-blue-400/40" />
              </div>
            );
          })}
        </div>
      </div>

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
              } ${isDragging ? 'brightness-90' : 'brightness-100'}`}
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

      {allSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            title="السابق"
            aria-label="السابق"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-200 hover:border-blue-400 z-50"
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <button
            onClick={nextSlide}
            title="التالي"
            aria-label="التالي"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-200 hover:border-blue-400 z-50"
          >
            <ArrowRight className="h-6 w-6 text-gray-700" />
          </button>
        </>
      )}

      {allSlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
          {allSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              title={`اذهب إلى الشريحة ${index + 1}`}
              aria-label={`اذهب إلى الشريحة ${index + 1}`}
              className={`transition-all duration-300 rounded-full ${
                index === activeSlide
                  ? 'w-10 h-3 bg-gradient-to-r from-blue-400 to-cyan-500'
                  : 'w-3 h-3 bg-white/60 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}

      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          title={isAutoPlaying ? 'إيقاف التشغيل' : 'بدء التشغيل'}
          aria-label={isAutoPlaying ? 'إيقاف التشغيل التلقائي' : 'بدء التشغيل التلقائي'}
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

export default DeltaSlider;
