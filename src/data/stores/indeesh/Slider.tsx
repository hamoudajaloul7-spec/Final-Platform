import React, { useState, useEffect, useRef } from 'react';
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
import { indeeshSliderData } from './sliderData';

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

interface SliderImage {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  buttonText: string;
}

interface IndeeshSliderProps {
  products: Product[];
  sliderImages?: SliderImage[];
  storeSlug?: string;
  onProductClick: (productId: number) => void;
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (productId: number) => void;
  favorites: number[];
}

const IndeeshSlider: React.FC<IndeeshSliderProps> = ({
  products,
  sliderImages,
  storeSlug = 'indeesh',
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
  
  const processSliderData = (slides: any[]) => {
    return slides.map(slide => ({
      ...slide,
      image: getImageUrl(slide.image).primary,
      fallbackImage: getImageUrl(slide.image).fallback,
    }));
  };

  const sliderBanners = sliderImages && sliderImages.length > 0 ? sliderImages : indeeshSliderData;
  const allSlides = processSliderData(sliderBanners);

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
    
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  if (allSlides.length === 0) return null;

  const storeColors = {
    background: 'from-purple-400 via-pink-600 to-purple-400',
    accent: 'from-purple-400 via-pink-600 to-purple-400',
    gradient: 'from-purple-400 to-pink-600',
    button: 'from-purple-400 to-pink-600 hover:from-purple-500 hover:to-pink-700'
  };

  return (
    <div className={`relative h-[500px] md:h-[600px] overflow-hidden bg-white`}>
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
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Sparkles className="h-4 w-4 text-purple-400/40" />
            </div>
          ))}
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
              className="absolute inset-0"
              style={{
                filter: isDragging ? 'brightness(0.9)' : 'brightness(1)',
                display: index === activeSlide ? 'block' : 'none'
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
              
              {/* النصوص الدعائية فوق الصورة */}
              {(slide.title || slide.subtitle || slide.buttonText) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col items-center justify-center text-center px-4 md:px-8">
                  {slide.title && (
                    <h2 className="text-white text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-2xl animate-fade-in">
                      {slide.title}
                    </h2>
                  )}
                  {slide.subtitle && (
                    <p className="text-white text-lg md:text-2xl lg:text-3xl mb-6 drop-shadow-lg animate-fade-in-delay">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.buttonText && (
                    <button className="px-8 py-3 md:px-10 md:py-4 rounded-full font-bold text-white text-lg md:text-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl animate-fade-in-delay-2">
                      {slide.buttonText}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {allSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="الصورة السابقة"
            className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white p-3 md:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group border-2 border-purple-200 hover:border-purple-400"
          >
            <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 text-gray-700 group-hover:text-purple-600" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="الصورة التالية"
            className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white p-3 md:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group border-2 border-purple-200 hover:border-purple-400"
          >
            <ArrowRight className="h-5 w-5 md:h-6 md:w-6 text-gray-700 group-hover:text-purple-600" />
          </button>
        </>
      )}

      {allSlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3">
          {allSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`الانتقال إلى الصورة ${index + 1}`}
              className={`transition-all duration-300 rounded-full ${
                index === activeSlide
                  ? 'w-10 h-3 bg-gradient-to-r from-purple-400 to-pink-500'
                  : 'w-3 h-3 bg-white/60 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}

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

      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
        <div
          className="h-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-5000 ease-linear"
          style={{
            width: isAutoPlaying ? '100%' : '0%',
            animationDuration: '5s',
            animation: isAutoPlaying ? 'progress 5s linear infinite' : 'none'
          }}
        />
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes fade-in {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }
        .animate-fade-in-delay-2 {
          animation: fade-in 0.8s ease-out 0.4s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default IndeeshSlider;
