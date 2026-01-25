import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Settings,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  SliderImage, 
  initializeSliderListeners, 
  storageManager, 
  syncManager,
  showSyncNotification,
  type SyncEvent
} from '@/utils/sliderIntegration';
import { getApiBase } from '@/utils/apiConfig';
import type { Product } from '@/data/storeProducts';

interface DynamicStoreSliderProps {
  products: Product[];
  storeSlug: string;
  onProductClick: (productId: number) => void;
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (productId: number) => void;
  favorites: number[];
  showSettings?: boolean;
  autoSync?: boolean;
  className?: string;
}

interface SyncStatus {
  isConnected: boolean;
  lastSync: string;
  isSyncing: boolean;
  pendingChanges: number;
}

const DynamicStoreSlider: React.FC<DynamicStoreSliderProps> = ({
  products,
  storeSlug,
  onProductClick,
  onAddToCart,
  onToggleFavorite,
  favorites = [],
  showSettings = false,
  autoSync = true,
  className = ''
}) => {
  const [sliders, setSliders] = useState<SliderImage[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isConnected: true,
    lastSync: new Date().toISOString(),
    isSyncing: false,
    pendingChanges: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load sliders from storage
  const loadSliders = useCallback(async () => {
    try {
      setError(null);
      const apiBase = getApiBase();
      const loadedSliders = storageManager.loadStoreSliders(storeSlug);
      
      // Prepend apiBase for rendering
      const rendered = loadedSliders.map((s: any) => ({
        ...s,
        imageUrl: (s.imageUrl && !s.imageUrl.startsWith('http')) ? apiBase + s.imageUrl : s.imageUrl
      }));
      
      setSliders(rendered);
      
      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date().toISOString(),
        isConnected: true
      }));
      

    } catch (err) {

      setError('فشل في تحميل السلايدرز');
      setSyncStatus(prev => ({ ...prev, isConnected: false }));
    }
  }, [storeSlug]);

  // Save sliders to storage with sync
  const saveSliders = useCallback(async (updatedSliders: SliderImage[]) => {
    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, pendingChanges: prev.pendingChanges + 1 }));
      
      const success = storageManager.saveStoreSliders(storeSlug, updatedSliders);
      
      if (success) {
        setSliders(updatedSliders);
        setSyncStatus(prev => ({
          ...prev,
          lastSync: new Date().toISOString(),
          isSyncing: false,
          pendingChanges: Math.max(0, prev.pendingChanges - 1),
          isConnected: true
        }));
        
        // Show success notification
        showSyncNotification(storeSlug, 'slider_update', true);
        
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error('Save operation failed');
      }
    } catch (err) {

      setSyncStatus(prev => ({ ...prev, isSyncing: false, isConnected: false }));
      
      showSyncNotification(storeSlug, 'slider_update', false);
      
      // Implement exponential backoff for retries
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        retryTimeoutRef.current = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          saveSliders(updatedSliders);
        }, delay);
      } else {
        setError('فشل في حفظ السلايدرز بعد عدة محاولات');
      }
    }
  }, [storeSlug, retryCount]);

  // Initialize sliders and listeners
  useEffect(() => {
    loadSliders();

    // Set up real-time listeners
    const cleanupListeners = initializeSliderListeners(storeSlug, (updatedSliders) => {
      const apiBase = getApiBase();
      const rendered = updatedSliders.map((s: any) => ({
        ...s,
        imageUrl: (s.imageUrl && !s.imageUrl.startsWith('http')) ? apiBase + s.imageUrl : s.imageUrl
      }));
      setSliders(rendered);
      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date().toISOString(),
        isConnected: true,
        isSyncing: false
      }));
    });

    // Set up storage change listeners
    const cleanupStorageListener = storageManager.addChangeListener(storeSlug, (updatedSliders) => {
      const apiBase = getApiBase();
      const rendered = updatedSliders.map((s: any) => ({
        ...s,
        imageUrl: (s.imageUrl && !s.imageUrl.startsWith('http')) ? apiBase + s.imageUrl : s.imageUrl
      }));
      setSliders(rendered);
    });

    // Enable auto-sync if requested
    if (autoSync) {
      storageManager.enableAutoSync(storeSlug);
    }

    return () => {
      cleanupListeners();
      cleanupStorageListener();
      if (autoSync) {
        storageManager.disableAutoSync(storeSlug);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [storeSlug, loadSliders, autoSync]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || sliders.length <= 1 || isDragging) return;

    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % sliders.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, sliders.length, isDragging]);

  // Navigation functions
  const nextSlide = () => {
    setActiveSlide(prev => (prev + 1) % sliders.length);
  };

  const prevSlide = () => {
    setActiveSlide(prev => (prev - 1 + sliders.length) % sliders.length);
  };

  const goToSlide = (index: number) => {
    setActiveSlide(index);
  };

  // Drag handlers
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

  // Get store-specific colors
  const getStoreColors = (store: string) => {
    const colorSchemes = {
      'nawaem': {
        background: 'from-amber-50 via-yellow-50 to-orange-50',
        accent: 'from-amber-400 via-yellow-400 to-orange-400',
        gradient: 'from-yellow-500 to-amber-600',
        button: 'from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700'
      },
      'delta': {
        background: 'from-blue-50 via-cyan-50 to-teal-50',
        accent: 'from-blue-400 via-cyan-400 to-teal-400',
        gradient: 'from-blue-500 to-cyan-600',
        button: 'from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700'
      },
      'sheirine': {
        background: 'from-pink-50 via-purple-50 to-fuchsia-50',
        accent: 'from-pink-400 via-purple-400 to-fuchsia-400',
        gradient: 'from-pink-500 to-purple-600',
        button: 'from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
      }
    };
    
    return colorSchemes[store as keyof typeof colorSchemes] || colorSchemes['nawaem'];
  };

  const storeColors = getStoreColors(storeSlug);
  const activeSliders = sliders.filter(s => s.isActive);

  // Error state
  if (error) {
    return (
      <div className={`relative h-[400px] bg-gradient-to-br ${storeColors.background} flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">خطأ في تحميل السلايدرز</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadSliders} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  // No sliders state
  if (activeSliders.length === 0) {
    return (
      <div className={`relative h-[400px] bg-gradient-to-br ${storeColors.background} flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد سلايدرز مفعلة</h3>
          <p className="text-gray-600">قم بتفعيل بعض السلايدرز من لوحة تحكم التاجر</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-[500px] md:h-[600px] overflow-hidden bg-gradient-to-br ${storeColors.background} ${className}`}>
      {/* Background animated elements */}
      <div className="absolute inset-0">
        <div className={`absolute inset-0 bg-gradient-to-r ${storeColors.accent}/20 via-current/10 to-current/20`}></div>
        <div className="absolute inset-0">
          {Array.from({ length: 20 }, (_, index) => (
            <div
              key={index}
              className={`absolute animate-pulse sparkle-position-${(index % 10) + 1} sparkle-delay-${index % 5} sparkle-duration-${index % 4}`}
            >
              <Sparkles className="h-4 w-4 text-blue-400/40" />
            </div>
          ))}
        </div>
      </div>

      {/* Sync Status Indicator */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <Badge 
          variant={syncStatus.isConnected ? 'default' : 'destructive'}
          className="flex items-center gap-1"
        >
          {syncStatus.isSyncing ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : syncStatus.isConnected ? (
            <Wifi className="h-3 w-3" />
          ) : (
            <WifiOff className="h-3 w-3" />
          )}
          {syncStatus.isSyncing ? 'جاري المزامنة' : 
           syncStatus.isConnected ? 'متصل' : 'غير متصل'}
        </Badge>
        
        {syncStatus.pendingChanges > 0 && (
          <Badge variant="outline" className="bg-orange-100 text-orange-800">
            {syncStatus.pendingChanges} تغيير معلق
          </Badge>
        )}
      </div>

      {/* Settings button for merchants */}
      {showSettings && (
        <div className="absolute top-4 left-4 z-20">
          <Button
            size="sm"
            variant="outline"
            className="bg-white/90 backdrop-blur-sm"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('openMerchantSliderSettings', {
                detail: { storeSlug }
              }));
            }}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Main slider */}
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
          {activeSliders.map((slider, index) => (
            <div
              key={slider.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === activeSlide ? 'opacity-100' : 'opacity-0'
              } ${isDragging ? 'slider-image-dimmed' : 'slider-image-normal'}`}
            >
              <img
                src={slider.imageUrl}
                alt={slider.title}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';

                }}
              />
              
              {/* Content overlay */}
              {(slider.title || slider.subtitle) && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="text-center text-white p-8 max-w-2xl">
                    {slider.title && (
                      <h2 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                        {slider.title}
                      </h2>
                    )}
                    {slider.subtitle && (
                      <p className="text-xl md:text-2xl mb-6 drop-shadow-md opacity-90">
                        {slider.subtitle}
                      </p>
                    )}
                    {slider.buttonText && (
                      <Button 
                        size="lg" 
                        className={`bg-gradient-to-r ${storeColors.button} text-white font-semibold px-8 py-3 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                        onClick={() => {
                          // Navigate to relevant section or products

                        }}
                      >
                        {slider.buttonText}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      {activeSliders.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="الشريحة السابقة"
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-colors transition-shadow duration-300 border-2 border-blue-200 hover:border-blue-400 z-50`}
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="الشريحة التالية"
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-colors transition-shadow duration-300 border-2 border-blue-200 hover:border-blue-400 z-50`}
          >
            <ArrowRight className="h-6 w-6 text-gray-700" />
          </button>
        </>
      )}

      {/* Dots navigation */}
      {activeSliders.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
          {activeSliders.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`الانتقال إلى الشريحة ${index + 1}`}
              aria-pressed={index === activeSlide ? 'true' : 'false'}
              className={`transition-colors duration-300 rounded-full ${
                index === activeSlide
                  ? `w-10 h-3 bg-gradient-to-r ${storeColors.gradient}`
                  : 'w-3 h-3 bg-white/60 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}

      {/* Auto-play control */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <button
          type="button"
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          aria-label={isAutoPlaying ? 'إيقاف التشغيل التلقائي' : 'تشغيل السلايدر تلقائياً'}
          aria-pressed={isAutoPlaying ? 'true' : 'false'}
          className={`p-2 rounded-full backdrop-blur-sm border transition-colors duration-300 ${
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

      {/* Manual refresh button */}
      <div className="absolute bottom-4 left-4 z-20">
        <Button
          size="sm"
          variant="outline"
          onClick={loadSliders}
          disabled={syncStatus.isSyncing}
          className="bg-white/90 backdrop-blur-sm"
        >
          <RefreshCw className={`h-4 w-4 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Progress bar */}
      {activeSliders.length > 1 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <div
            className={`progress-bar h-full bg-gradient-to-r transition-colors duration-4000 ease-linear ${storeColors.gradient} ${isAutoPlaying ? 'progress-bar-active' : 'progress-bar-paused'}`}
          />
        </div>
      )}

      <style>{`
        .progress-bar { width: 0%; }
        .progress-bar-active { width: 100%; animation: progress 4s linear infinite; }
        .progress-bar-paused { width: 0%; animation: none; }
        .slider-image-normal { filter: brightness(1); }
        .slider-image-dimmed { filter: brightness(0.9); }
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default DynamicStoreSlider;
