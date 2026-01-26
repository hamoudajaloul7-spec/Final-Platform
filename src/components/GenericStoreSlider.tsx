import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getProxyImageUrl } from '@/utils/assetProxyUtil';
import SheirineSlider from '@/data/stores/sheirine/Slider';

interface GenericStoreSliderProps {
  ads: any[];
  storeSlug: string;
  products: any[];
  onProductClick: (id: number) => void;
}

const GenericStoreSlider: React.FC<GenericStoreSliderProps> = ({ ads, storeSlug, products, onProductClick }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderAds = ads.filter(ad => ad.placement === 'slider' || ad.placement === 'hero' || ad.placement === 'main');
  
  useEffect(() => {
    if (sliderAds.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % sliderAds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliderAds.length]);

  if (sliderAds.length === 0) {
    // Fallback for Sheirine if no ads are found but it's sheirine
    if (storeSlug === 'sheirine') {
      return (
        <SheirineSlider 
          products={products}
          storeSlug={storeSlug}
          onProductClick={onProductClick}
          onAddToCart={() => {}}
          onToggleFavorite={() => {}}
          favorites={[]}
        />
      );
    }
    return null;
  }

  return (
    <div className="relative h-[300px] md:h-[500px] overflow-hidden bg-gray-100 group">
      {sliderAds.map((ad, index) => (
        <div
          key={ad.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => ad.linkUrl && window.open(ad.linkUrl, '_blank')}
        >
          <img 
            src={getProxyImageUrl(ad.imageUrl || ad.image || ad.imagePath)} 
            alt={ad.title} 
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/default-store.png';
            }}
          />
          {(ad.title || ad.description) && (
             <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white text-center p-4">
               <div className="max-w-2xl transform transition-transform duration-700 translate-y-0">
                 <h2 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">{ad.title}</h2>
                 <p className="text-xl md:text-2xl opacity-95 drop-shadow-md">{ad.description}</p>
                 {ad.buttonText && (
                   <Button className="mt-6 bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-full">
                     {ad.buttonText}
                   </Button>
                 )}
               </div>
             </div>
          )}
        </div>
      ))}
      
      {sliderAds.length > 1 && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveSlide(prev => (prev - 1 + sliderAds.length) % sliderAds.length); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="الشريحة السابقة"
          >
            <ArrowLeft className="h-6 w-6 text-gray-800" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveSlide(prev => (prev + 1) % sliderAds.length); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="الشريحة التالية"
          >
            <ArrowRight className="h-6 w-6 text-gray-800" />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {sliderAds.map((_, i) => (
              <button 
                key={i} 
                onClick={(e) => { e.stopPropagation(); setActiveSlide(i); }}
                className={`transition-all duration-300 rounded-full ${i === activeSlide ? 'w-8 h-2 bg-primary' : 'w-2 h-2 bg-white/60 hover:bg-white'}`} 
                aria-label={`الانتقال إلى الشريحة ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default GenericStoreSlider;
