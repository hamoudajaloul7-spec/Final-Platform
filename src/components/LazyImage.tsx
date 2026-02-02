import React, { useEffect, useRef, useState } from 'react';
import { getDefaultProductImageSync } from '@/utils/imageUtils';

interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  fallbackSrc?: string;
  width?: number;
  height?: number;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  storeSlug?: string;
}

/**
 * Lazy loading image component using Intersection Observer API
 * Defers image loading until they're within the viewport
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Cpath fill="%23d1d5db" d="M30 35h40v30H30z"/%3E%3Ccircle fill="%239ca3af" cx="50" cy="50" r="10"/%3E%3C/svg%3E',
  fallbackSrc,
  width,
  height,
  className,
  onLoad,
  onError,
  storeSlug,
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '100px', // Start loading earlier
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isInView && src) {
      const img = new Image();
      img.src = src;
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        onLoad?.();
      };

      img.onerror = () => {
        setError(true);
        const fallback = fallbackSrc || getDefaultProductImageSync(storeSlug);
        setImageSrc(fallback);
        onError?.();
      };
    }
  }, [isInView, src, fallbackSrc, storeSlug, onLoad, onError]);

  return (
    <div 
      className={`relative overflow-hidden bg-gray-100 ${className || ''}`}
      style={{ width, height }}
    >
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 animate-pulse">
           {/* Loading state indicator if needed */}
        </div>
      )}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`
          w-full h-full object-cover
          ${isLoaded ? 'opacity-100' : 'opacity-0'} 
          ${error ? 'opacity-70 grayscale-[50%]' : ''}
          transition-all duration-500 ease-in-out
        `}
        style={{
          transition: 'opacity 0.5s ease-in-out, filter 0.5s ease-in-out',
        }}
      />
    </div>
  );
};

export default LazyImage;
