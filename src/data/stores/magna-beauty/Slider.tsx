import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles
} from 'lucide-react';

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

interface MagnaBeautySliderProps {
  products?: any[];
  sliderImages?: Array<{ id: string | number; image: string; title?: string; subtitle?: string; buttonText?: string }>;
  storeSlug?: string;
  onProductClick?: (productId: number) => void;
  onAddToCart?: (product: any) => void;
  onToggleFavorite?: (productId: number) => void;
  favorites?: number[];
}

const MagnaBeautySlider: React.FC<MagnaBeautySliderProps> = ({
  products = [],
  sliderImages,
  storeSlug = 'magna-beauty',
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
      id: 'magna-beauty-banner1',
      image: getImageUrl('/assets/magna-beauty/sliders/slide1.webp').primary,
      fallbackImage: getImageUrl('/assets/magna-beauty/sliders/slide1.webp').fallback,
      title: 'مكياج عصري أنيق'
    },
    {
      id: 'magna-beauty-banner2',
      image: getImageUrl('/assets/magna-beauty/sliders/slide2.webp').primary,
      fallbackImage: getImageUrl('/assets/magna-beauty/sliders/slide2.webp').fallback,
      title: 'رموش أنيقة وعصرية'
    },
    {
      id: 'magna-beauty-banner3',
      image: getImageUrl('/assets/magna-beauty/sliders/slide3.webp').primary,
      fallbackImage: getImageUrl('/assets/magna-beauty/sliders/slide3.webp').fallback,
      title: 'إكسسوارات مميزة'
    },
    {
      id: 'magna-beauty-banner4',
      image: getImageUrl('/assets/magna-beauty/sliders/slide4.webp').primary,
      fallbackImage: getImageUrl('/assets/magna-beauty/sliders/slide4.webp').fallback,
      title: 'مكياج عصري أنيق'
    },
    {
      id: 'magna-beauty-banner5',
      image: getImageUrl('/assets/magna-beauty/sliders/slide5.webp').primary,
      fallbackImage: getImageUrl('/assets/magna-beauty/sliders/slide5.webp').fallback,
      title: 'تشكيلة عصرية مميزة'
    },
  ];

  if (sliderImages && sliderImages.length > 0) {
    void 0;
  }

  const allSlides = (Array.isArray(sliderImages) && sliderImages.length > 0) ? sliderImages : defaultBanners;

  // Precomputed sparkle positions to avoid Math.random() in render
  const sparklePositions = [...Array(20)].map((_, i) => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2
  }));

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

  // ألوان متجر ماجنا بيوتي
  const storeColors = {
    background: 'from-blue-50 via-cyan-50 to-teal-50',
    accent: 'from-blue-400 via-cyan-400 to-teal-400',
    gradient: 'from-blue-500 to-cyan-600',
    button: 'from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700'
  };

  return (
    <div className={`relative h-[500px] md:h-[600px] overflow-hidden bg-gradient-to-br ${storeColors.background}`}>
      {/* خلفية متحركة لمتجر ماجنا بيوتي */}
      <div className="absolute inset-0">
        <div className={`absolute inset-0 bg-gradient-to-r ${storeColors.accent}/20 via-current/10 to-current/20`}></div>
        <div className="absolute inset-0">
          {sparklePositions.map((pos, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${pos.left}%`,
                top: `${pos.top}%`,
                animationDelay: `${pos.delay}s`,
                animationDuration: `${pos.duration}s`
              }}
            >
              <Sparkles className="h-4 w-4 text-blue-400/40" />
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
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-200 hover:border-blue-400 z-50"
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <button
            onClick={nextSlide}
            title="الشريحة التالية"
            aria-label="Next slide"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-200 hover:border-blue-400 z-50"
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
              aria-label={`Go to slide ${index + 1}`}
              className={`transition-all duration-300 rounded-full ${
                index === activeSlide
                  ? 'w-10 h-3 bg-gradient-to-r from-blue-400 to-cyan-500'
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
          aria-label={isAutoPlaying ? "Pause auto-play" : "Start auto-play"}
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

export default MagnaBeautySlider;
