import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getStoreConfig } from '@/config/storeConfig';

interface SliderHeightConfig {
  mobile?: number;
  desktop?: number;
}

interface Slider {
  id: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  imagePath: string;
  image?: string;
  sortOrder?: number;
}

interface UnifiedStoreSliderProps {
  storeSlug: string;
  height?: SliderHeightConfig;
  initialSliders?: Slider[];
}

const DEFAULT_SLIDER_HEIGHT = {
  mobile: 600,
  desktop: 800
};

const DEFAULT_CONFIG = {
  sliderHeight: DEFAULT_SLIDER_HEIGHT,
  colors: {
    primary: '#000000',
    secondary: '#333333',
    accent: '#666666'
  }
};

const UnifiedStoreSlider: React.FC<UnifiedStoreSliderProps> = ({ 
  storeSlug, 
  height,
  initialSliders
}) => {
  const staticConfig = getStoreConfig(storeSlug);
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [config, setConfig] = useState<any>(staticConfig || DEFAULT_CONFIG);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }
    return window.innerWidth < 768;
  });

  useEffect(() => {
    if (initialSliders && initialSliders.length > 0) {
      setSliders(initialSliders);
    } else {
      loadSliders();
    }

    const handleSliderUpdate = (event: CustomEvent) => {
      loadSliders();
    };

    window.addEventListener('storeSlidersUpdated', handleSliderUpdate as EventListener);

    return () => {
      window.removeEventListener('storeSlidersUpdated', handleSliderUpdate as EventListener);
    };
  }, [storeSlug, initialSliders]);

  const loadSliders = async () => {
    const storageKey = `eshro_store_sliders_${storeSlug}`;
  
    // Show static/cached data immediately
    if (staticConfig?.sliders) {
      const mappedSliders = staticConfig.sliders.map((slider: any) => ({
        id: slider.id,
        title: slider.title,
        subtitle: slider.subtitle,
        buttonText: slider.buttonText,
        imagePath: slider.image || slider.imagePath,
        image: slider.image || slider.imagePath,
        sortOrder: slider.sortOrder,
      }));
      setSliders(mappedSliders);
    } else {
      const savedSliders = localStorage.getItem(storageKey);
      if (savedSliders) {
        try {
          const parsed = JSON.parse(savedSliders);
          setSliders(parsed);
        } catch {}
      }
    }
  
    // Fetch API data in background with timeout
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
  
      const response = await fetch(`${apiUrl}/sliders/store/${storeSlug}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
  
      if (response.ok) {
        const result = await response.json();
        if (result.data && Array.isArray(result.data) && result.data.length > 0) {
          const loadedSliders = result.data.map((slider: any) => {
            // Fix image URL logic
            let imagePath = slider.imagePath || slider.image;
            
            if (imagePath) {
              if (imagePath.includes('localhost:5000')) {
                imagePath = imagePath.replace(/^https?:\/\/localhost:5000/, '');
              } else if (imagePath.includes('eishro-backend.onrender.com')) {
                imagePath = imagePath.replace(/^https?:\/\/eishro-backend\.onrender\.com/, '');
              }
              
              if (imagePath.startsWith('/assets/')) {
                imagePath = imagePath;
              }
            }

            return {
              id: slider.id,
              title: slider.title,
              subtitle: slider.subtitle,
              buttonText: slider.buttonText,
              imagePath: imagePath,
              image: imagePath,
              sortOrder: slider.sortOrder,
            };
          });
          
          loadedSliders.sort((a: Slider, b: Slider) => (a.sortOrder || 0) - (b.sortOrder || 0));
          setSliders(loadedSliders);
          localStorage.setItem(storageKey, JSON.stringify(loadedSliders));
        }
      }
    } catch (error) {
      // Silent error handling - use cached data
    }
  };
  

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeConfig = config || DEFAULT_CONFIG;

  const sliderHeight = {
    mobile: height?.mobile ?? activeConfig?.sliderHeight?.mobile ?? DEFAULT_SLIDER_HEIGHT.mobile,
    desktop: height?.desktop ?? activeConfig?.sliderHeight?.desktop ?? DEFAULT_SLIDER_HEIGHT.desktop,
  };
  const resolvedHeight = isMobile ? sliderHeight.mobile : sliderHeight.desktop;

  const resolveBackgroundImage = (image?: string) => {
    if (!image) return undefined;
    try {
      return `url("${encodeURI(image)}")`;
    } catch (error) {
      return `url("${image}")`;
    }
  };

  useEffect(() => {
    if (!isAutoPlaying || sliders.length === 0) return;

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % sliders.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, sliders.length]);

  if (sliders.length === 0) {
    return null;
  }

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % sliders.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + sliders.length) % sliders.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  return (
    <div
      className="relative overflow-hidden rounded-lg shadow-lg w-full"
      style={{
        height: `${resolvedHeight}px`,
        minHeight: `${resolvedHeight}px`
      }}
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="relative w-full h-full">
        {sliders.map((slider, index) => (
          <div
            key={slider.id}
            className="absolute inset-0 transition-opacity duration-500 ease-in-out"
            style={{
              opacity: index === activeSlide ? 1 : 0,
              visibility: index === activeSlide ? 'visible' : 'hidden',
            }}
          >
            <div className="w-full h-full relative overflow-hidden">
              <img
                src={slider.image}
                alt={slider.title}
                className="w-full h-full object-cover object-center"
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={index === 0 ? 'high' : 'auto'}
              />
              <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center z-10">
                <h2 className="text-white text-3xl md:text-5xl font-bold text-center mb-4 drop-shadow-lg">
                  {slider.title}
                </h2>
                {slider.subtitle && (
                  <p className="text-white text-lg md:text-2xl text-center mb-6 drop-shadow-lg">
                    {slider.subtitle}
                  </p>
                )}
                <button
                  className="px-8 py-3 rounded-lg font-bold text-white transition-all duration-300"
                  style={{
                    backgroundColor: activeConfig.colors?.primary || '#000000',
                    boxShadow: `0 0 20px ${activeConfig.colors?.primary || '#000000'}40`,
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.boxShadow = `0 0 30px ${activeConfig.colors?.primary || '#000000'}80`;
                    (e.target as HTMLElement).style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.boxShadow = `0 0 20px ${activeConfig.colors?.primary || '#000000'}40`;
                    (e.target as HTMLElement).style.transform = 'scale(1)';
                  }}
                >
                  {slider.buttonText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sliders.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/30 hover:bg-white/50 transition-colors"
            aria-label="Previous slide"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/30 hover:bg-white/50 transition-colors"
            aria-label="Next slide"
          >
            <ArrowRight className="w-6 h-6 text-white" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {sliders.map((_, index) => (
              <button
                key={`dot-${index}`}
                onClick={() => {
                  setActiveSlide(index);
                  setIsAutoPlaying(false);
                  setTimeout(() => setIsAutoPlaying(true), 8000);
                }}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    index === activeSlide ? (activeConfig.colors?.primary || '#000000') : 'rgba(255,255,255,0.5)',
                  width: index === activeSlide ? '24px' : '8px',
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UnifiedStoreSlider;
