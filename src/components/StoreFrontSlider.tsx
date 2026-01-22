import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SliderData {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  discount?: string;
  buttonText?: string;
  order: number;
}

interface StoreFrontSliderProps {
  storeSlug: string;
  className?: string;
  storeId?: string | number;
}

const StoreFrontSlider: React.FC<StoreFrontSliderProps> = ({ 
  storeSlug,
  className = '',
  storeId
}) => {
  const [sliders, setSliders] = useState<SliderData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadSliders();

    const handleUpdate = (event: CustomEvent) => {
      if (event.detail.storeSlug === storeSlug) {
        loadSliders();
      }
    };

    window.addEventListener('storeSliderUpdated', handleUpdate as EventListener);
    
    return () => {
      window.removeEventListener('storeSliderUpdated', handleUpdate as EventListener);
      stopAutoPlay();
    };
  }, [storeSlug]);

  const loadSliders = async () => {
    if (storeSlug) {
      try {
        const response = await fetch(`/api/sliders/store/${storeSlug}`);
        if (response.ok) {
          const result = await response.json();
          const mapped = result.data.map((slider: any) => ({
            id: slider.id,
            imageUrl: slider.imagePath,
            title: slider.title,
            subtitle: slider.subtitle || '',
            discount: slider.metadata?.discount || '',
            buttonText: slider.buttonText || '',
            order: slider.sortOrder || 0
          }));
          setSliders(mapped);
          localStorage.setItem(`eshro_sliders_${storeSlug}`, JSON.stringify(mapped));
          localStorage.setItem(`store_sliders_${storeSlug}`, JSON.stringify(mapped));
          return;
        }
      } catch {
        // API failed, will fallback to localStorage
      }
    }
    
    const storageKey = `eshro_sliders_${storeSlug}`;
    const fallbackKey = `store_sliders_${storeSlug}`;
    const savedData = localStorage.getItem(storageKey) || localStorage.getItem(fallbackKey);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed)) {
          setSliders(parsed);
        }
      } catch (e) {
        console.error('Error parsing sliders from localStorage:', e);
      }
    }
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearTimeout(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    if (sliders.length > 1) {
      autoPlayRef.current = setTimeout(() => {
        nextSlide();
      }, 5000);
    }
  };

  useEffect(() => {
    if (isAutoPlaying && sliders.length > 1) {
      startAutoPlay();
    }
    return () => stopAutoPlay();
  }, [currentIndex, isAutoPlaying, sliders.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % sliders.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + sliders.length) % sliders.length);
  };

  if (sliders.length === 0) {
    return null;
  }

  const currentSlider = sliders[currentIndex];

  return (
    <div 
      className={`relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-lg shadow-lg ${className}`}
      onMouseEnter={() => {
        setIsAutoPlaying(false);
        stopAutoPlay();
      }}
      onMouseLeave={() => {
        setIsAutoPlaying(true);
      }}
    >
      <div className="relative w-full h-full">
        {sliders.map((slider, index) => (
          <div
            key={slider.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slider.imageUrl}
              alt={slider.title}
              className="w-full h-full object-cover"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                {slider.discount && (
                  <div className="mb-4">
                    <span className="inline-block bg-red-600 text-white px-6 py-2 rounded-full text-2xl md:text-3xl font-bold shadow-lg animate-pulse">
                      خصم {slider.discount}%
                    </span>
                  </div>
                )}
                
                {slider.title && (
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 drop-shadow-2xl">
                    {slider.title}
                  </h2>
                )}
                
                {slider.subtitle && (
                  <p className="text-lg md:text-2xl lg:text-3xl mb-6 drop-shadow-lg opacity-90">
                    {slider.subtitle}
                  </p>
                )}
                
                {slider.buttonText && (
                  <button className="px-8 py-3 bg-white text-gray-900 rounded-full font-bold text-lg shadow-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
                    {slider.buttonText}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {sliders.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10"
            aria-label="السلايد السابق"
          >
            <ChevronLeft className="h-6 w-6 text-gray-900" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10"
            aria-label="السلايد التالي"
          >
            <ChevronRight className="h-6 w-6 text-gray-900" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {sliders.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75 w-3'
                }`}
                aria-label={`الانتقال للسلايد ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StoreFrontSlider;
