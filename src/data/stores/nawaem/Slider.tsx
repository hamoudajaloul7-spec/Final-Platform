// NawaemSlider component: Image slider for store banners with auto-play and navigation
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight,
  Star,
  Crown,
  Sparkles,
  Heart,
  ShoppingCart,
  Eye
} from 'lucide-react';
import type { Product } from '../../storeProducts';
import { getProxyImageUrl } from '@/utils/assetProxyUtil';

interface NawaemSliderProps {
  products: Product[];
  sliderImages?: Array<{ id: string | number; image: string; title?: string; subtitle?: string; buttonText?: string }>;
  storeSlug?: string;
  onProductClick: (productId: number) => void;
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (productId: number) => void;
  favorites: number[];
}

const NawaemSlider: React.FC<NawaemSliderProps> = ({
  products,
  sliderImages,
  storeSlug = 'nawaem',
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
  
  // صور السلايدر حسب المتجر
  const getSliderBanners = (store: string) => {
    if (store === 'sheirine') {
      return [
        {
          id: 'banner1',
          image: getProxyImageUrl('/assets/sherine/sliders/slider1.webp', store, 'sliders'),
          fallbackImage: '/assets/sherine/sliders/slider1.webp',
          title: 'ملابس للمناسبات أحجام كبيرة',
          subtitle: 'اكتشفي مجموعتنا الجديدة من الملابس المناسباتية بأحجام كبيرة لكل المناسبات',
          buttonText: 'تسوقي الآن'
        },
        {
          id: 'banner2',
          image: getProxyImageUrl('/assets/sherine/sliders/slider3.webp', store, 'sliders'),
          fallbackImage: '/assets/sherine/sliders/slider3.webp',
          title: 'أحذية نسائية أنيقة',
          subtitle: 'مجموعة مميزة من الأحذية النسائية لإطلالات استثنائية في كل خطوة',
          buttonText: 'استكشفي الأحذية'
        },
        {
          id: 'banner3',
          image: getProxyImageUrl('/assets/sherine/sliders/slider4.webp', store, 'sliders'),
          fallbackImage: '/assets/sherine/sliders/slider4.webp',
          title: 'ملابس للمناسبات أحجام كبيرة',
          subtitle: 'تصاميم فريدة من الملابس المناسباتية بأحجام كبيرة لإطلالة مميزة',
          buttonText: 'اطلعي على المجموعة'
        },
        {
          id: 'banner4',
          image: getProxyImageUrl('/assets/sherine/sliders/slider1.webp', store, 'sliders'),
          fallbackImage: '/assets/sherine/sliders/slider1.webp',
          title: 'أحذية نسائية راقية',
          subtitle: 'أحذية نسائية بأحدث الصيحات لكل المناسبات والأيام',
          buttonText: 'تسوقي الأحذية'
        },
        {
          id: 'banner5',
          image: getProxyImageUrl('/assets/sherine/sliders/slider3.webp', store, 'sliders'),
          fallbackImage: '/assets/sherine/sliders/slider3.webp',
          title: 'ملابس مناسبات أحجام كبيرة',
          subtitle: 'مجموعة متنوعة من الملابس المناسباتية بأحجام كبيرة لكل الأذواق',
          buttonText: 'اكتشفي الملابس'
        }
      ];
    }
    
    // البانرات الافتراضية لنواعم
    return [
      {
        id: 'banner1',
        image: getProxyImageUrl('/assets/nawaem/bag2.jpg', store, 'sliders'),
        fallbackImage: '/assets/nawaem/bag2.jpg',
        title: 'حقائب نواعم الأنيقة'
      },
      {
        id: 'banner2',
        image: getProxyImageUrl('/assets/nawaem/bag3-black.jpg', store, 'sliders'),
        fallbackImage: '/assets/nawaem/bag3-black.jpg',
        title: 'حقائب سوداء فاخرة'
      },
      {
        id: 'banner3',
        image: getProxyImageUrl('/assets/nawaem/bag3-green.jpg', store, 'sliders'),
        fallbackImage: '/assets/nawaem/bag3-green.jpg',
        title: 'حقائب خضراء عصرية'
      },
      {
        id: 'banner4',
        image: getProxyImageUrl('/assets/nawaem/dress3.jpg', store, 'sliders'),
        fallbackImage: '/assets/nawaem/dress3.jpg',
        title: 'فساتين نواعم الراقية'
      },
      {
        id: 'banner5',
        image: getProxyImageUrl('/assets/nawaem/dress4.jpg', store, 'sliders'),
        fallbackImage: '/assets/nawaem/dress4.jpg',
        title: 'فساتين مناسبات مميزة'
      },
      {
        id: 'banner6',
        image: getProxyImageUrl('/assets/nawaem/dress5.jpg', store, 'sliders'),
        fallbackImage: '/assets/nawaem/dress5.jpg',
        title: 'فساتين صيفية أنيقة'
      },
      {
        id: 'banner7',
        image: getProxyImageUrl('/assets/nawaem/gold-jewelry-set-1.jpg', store, 'sliders'),
        fallbackImage: '/assets/nawaem/gold-jewelry-set-1.jpg',
        title: 'مجوهرات ذهبية فاخرة'
      },
      {
        id: 'banner8',
        image: getProxyImageUrl('/assets/nawaem/handbag-beige-1.jpg', store, 'sliders'),
        fallbackImage: '/assets/nawaem/handbag-beige-1.jpg',
        title: 'حقائب بيج راقية'
      },
      {
        id: 'banner9',
        image: getProxyImageUrl('/assets/nawaem/handbag-black-1.jpg', store, 'sliders'),
        fallbackImage: '/assets/nawaem/handbag-black-1.jpg',
        title: 'حقائب سوداء أنيقة'
      },
      {
        id: 'banner10',
        image: getProxyImageUrl('/assets/nawaem/handbags-luxury-1.jpg', store, 'sliders'),
        fallbackImage: '/assets/nawaem/handbags-luxury-1.jpg',
        title: 'حقائب فاخرة'
      }
    ];
  };

  const defaultBanners = getSliderBanners(storeSlug);
  
  const allSlides = (Array.isArray(sliderImages) && sliderImages.length > 0) 
    ? sliderImages.map(slide => ({
        ...slide,
        image: getProxyImageUrl(slide.image, storeSlug, 'sliders'),
        fallbackImage: slide.image
      }))
    : defaultBanners;

  // التشغيل التلقائي المحسن
  useEffect(() => {
    if (!isAutoPlaying || allSlides.length <= 1 || isDragging) return;

    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % allSlides.length);
    }, 3000);

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

  if (allSlides.length === 0) return null;

  // ألوان حسب المتجر
  const getStoreColors = (store: string) => {
    if (store === 'sheirine') {
      return {
        background: 'from-pink-50 via-purple-50 to-fuchsia-50',
        accent: 'from-pink-400 via-purple-400 to-fuchsia-400',
        gradient: 'from-pink-500 to-purple-600',
        button: 'from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
      };
    }
    // الألوان الافتراضية لنواعم
    return {
      background: 'from-amber-50 via-yellow-50 to-orange-50',
      accent: 'from-amber-400 via-yellow-400 to-orange-400',
      gradient: 'from-yellow-500 to-amber-600',
      button: 'from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700'
    };
  };

  const storeColors = getStoreColors(storeSlug);

  return (
    <div className={`relative h-[500px] md:h-[600px] overflow-hidden bg-gradient-to-br ${storeColors.background}`}>
      {/* خلفية متحركة حسب المتجر */}
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
              <Sparkles className={`h-4 w-4 ${storeSlug === 'sheirine' ? 'text-pink-400/40' : 'text-yellow-400/40'}`} />
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

      {/* أزرار التنقل المحسنة */}
      {allSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            title="السابق"
            aria-label="السابق"
            className={`absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white p-3 md:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group border-2 ${
              storeSlug === 'sheirine' ? 'border-pink-200 hover:border-pink-400' : 'border-yellow-200 hover:border-yellow-400'
            }`}
          >
            <ArrowLeft className={`h-5 w-5 md:h-6 md:w-6 text-gray-700 ${
              storeSlug === 'sheirine' ? 'group-hover:text-pink-600' : 'group-hover:text-yellow-600'
            }`} />
          </button>
          <button
            onClick={nextSlide}
            title="التالي"
            aria-label="التالي"
            className={`absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white p-3 md:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group border-2 ${
              storeSlug === 'sheirine' ? 'border-pink-200 hover:border-pink-400' : 'border-yellow-200 hover:border-yellow-400'
            }`}
          >
            <ArrowRight className={`h-5 w-5 md:h-6 md:w-6 text-gray-700 ${
              storeSlug === 'sheirine' ? 'group-hover:text-pink-600' : 'group-hover:text-yellow-600'
            }`} />
          </button>
        </>
      )}

      {/* نقاط التنقل المحسنة */}
      {allSlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3">
          {allSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              title={`اذهب إلى الشريحة ${index + 1}`}
              aria-label={`اذهب إلى الشريحة ${index + 1}`}
              className={`transition-all duration-300 rounded-full ${
                index === activeSlide 
                  ? `w-10 h-3 bg-gradient-to-r ${storeSlug === 'sheirine' ? 'from-pink-400 to-purple-500' : 'from-yellow-400 to-amber-500'}` 
                  : 'w-3 h-3 bg-white/60 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}

      {/* مؤشر التشغيل التلقائي */}
      <div className="absolute top-4 left-4">
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

      {/* شريط التقدم */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
        <div
          className={`h-full bg-gradient-to-r transition-all duration-5000 ease-linear ${
            storeSlug === 'sheirine' ? 'from-pink-400 to-purple-500' : 'from-yellow-400 to-amber-500'
          }`}
          style={{
            width: isAutoPlaying ? '100%' : '0%',
            animationDuration: '3s',
            animation: isAutoPlaying ? 'progress 3s linear infinite' : 'none'
          }}
        />
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default NawaemSlider;
