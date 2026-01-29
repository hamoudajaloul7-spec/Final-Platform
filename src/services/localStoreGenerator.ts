/**
 * 🔧 Local Store Generator Service (Frontend Fallback)
 * 
 * هذه الخدمة توليد الملفات الخمسة للمتجر الجديد محلياً عند فشل الباكند
 * تعمل كـ fallback عندما لا يكون الباكند مشغّلاً أو يفشل في الاستجابة
 */

export interface StoreGenerationData {
  storeId: string | number;
  storeSlug: string;
  storeName: string;
  storeNameEn: string;
  description: string;
  categories: string[];
  products: any[];
  sliderImages: any[];
}

/**
 * توليد محتوى ملف config.ts للمتجر
 */
export const generateConfigFile = (data: StoreGenerationData): string => {
  // Validate required data
  if (!data.storeSlug || !data.storeName || !data.storeId) {
    throw new Error('Missing required store data: storeSlug, storeName, or storeId');
  }

  // Ensure proper logo path structure
  const logoPath = data.storeSlug && data.storeSlug.trim() !== '' 
    ? `/assets/${data.storeSlug}/logo/default-logo.webp`
    : '/assets/default-store.png';

  return `export const ${data.storeSlug}StoreConfig = {
  storeId: ${data.storeId},
  name: "${data.storeName}",
  nameEn: "${data.storeNameEn}",
  description: "${data.description}",
  icon: "🏪",
  logo: "${logoPath}",
  color: "from-purple-400 to-pink-600",
  categories: ${JSON.stringify(data.categories, null, 2)},
  createdAt: "${new Date().toISOString()}",
  status: "active"
};`;
};

/**
 * توليد محتوى ملف products.ts للمتجر
 */
export const generateProductsFile = (data: StoreGenerationData): string => {
  const productsArray = data.products.map((product, idx) => {
    const productId = parseInt(data.storeId.toString()) * 1000 + idx + 1;
    return `  {
    id: ${productId},
    storeId: ${data.storeId},
    name: "${product.name || ''}",
    nameEn: "${product.nameEn || product.name || ''}",
    description: "${(product.description || '').replace(/"/g, '\\"')}",
    price: ${product.price || 0},
    originalPrice: ${product.originalPrice || product.price || 0},
    images: ${JSON.stringify(product.images || [])},
    sizes: ${JSON.stringify(product.sizes || [])},
    availableSizes: ${JSON.stringify(product.availableSizes || product.sizes || [])},
    colors: ${JSON.stringify(product.colors || [])},
    category: "${product.category || ''}",
    rating: ${product.rating || 4.5},
    reviews: ${product.reviews || 0},
    views: ${product.views || 0},
    likes: ${product.likes || 0},
    orders: ${product.orders || 0},
    inStock: ${product.inStock !== false},
    tags: ${JSON.stringify(product.tags || [])},
    badge: "${product.badge || ''}"
  }`;
  }).join(',\n');

  return `import type { Product } from '../shared/storeProducts';

export const ${data.storeSlug}Products: Product[] = [
${productsArray}
];

export const getStoreProducts = (): Product[] => {
  return ${data.storeSlug}Products;
};`;
};

/**
 * توليد محتوى ملف Slider.tsx للمتجر
 */
export const generateSliderFile = (data: StoreGenerationData, storeNameCapitalized: string): string => {
  const slidesArray = data.sliderImages.map((slide, idx) => {
    return `    {
      id: 'banner${idx + 1}',
      image: '${slide.image || ''}',
      title: '${(slide.title || '').replace(/'/g, "\\'")}',
      subtitle: '${(slide.subtitle || '').replace(/'/g, "\\'")}',
      buttonText: '${slide.buttonText || 'تسوق الآن'}'
    }`;
  }).join(',\n');

  return `import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Product } from '../shared/storeProducts';

interface ${storeNameCapitalized}SliderProps {
  products?: Product[];
  storeSlug?: string;
  onProductClick?: (productId: number) => void;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (productId: number) => void;
  favorites?: number[];
}

const ${storeNameCapitalized}Slider: React.FC<${storeNameCapitalized}SliderProps> = ({
  products = [],
  storeSlug = '${data.storeSlug}',
  onProductClick = () => {},
  onAddToCart = () => {},
  onToggleFavorite = () => {},
  favorites = []
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const banners = [
${slidesArray}
  ];

  useEffect(() => {
    if (!isAutoPlaying || banners.length === 0) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, banners.length]);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index: number) => {
    setActiveSlide(index);
  };

  if (banners.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">لا توجد صور للعرض</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg">
      <div className="relative w-full h-full">
        <img
          src={banners[activeSlide].image}
          alt={banners[activeSlide].title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {banners[activeSlide].title}
            </h2>
            <p className="text-lg md:text-xl mb-4">
              {banners[activeSlide].subtitle}
            </p>
            <Button className="bg-white text-black hover:bg-gray-200">
              {banners[activeSlide].buttonText}
            </Button>
          </div>
        </div>
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
      >
        <ArrowLeft className="w-6 h-6 text-gray-800" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
      >
        <ArrowRight className="w-6 h-6 text-gray-800" />
      </button>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={\`w-3 h-3 rounded-full transition-all \${
              index === activeSlide ? 'bg-white' : 'bg-white bg-opacity-50'
            }\`}
          />
        ))}
      </div>
    </div>
  );
};

export default ${storeNameCapitalized}Slider;`;
};

/**
 * توليد محتوى ملف index.ts للمتجر
 */
export const generateIndexFile = (data: StoreGenerationData, storeNameCapitalized: string): string => {
  return `export { ${data.storeSlug}StoreConfig as storeConfig } from './config';
export { ${data.storeSlug}Products as storeProducts, getStoreProducts } from './products';
export { default as ${storeNameCapitalized}Slider } from './Slider';`;
};

/**
 * توليد محتوى ملف sliderData.ts للمتجر
 */
export const generateSliderDataFile = (data: StoreGenerationData): string => {
  const sliderData = data.sliderImages.map((slide, idx) => ({
    id: `banner${idx + 1}`,
    image: slide.image || '',
    title: slide.title || '',
    subtitle: slide.subtitle || '',
    buttonText: slide.buttonText || 'تسوق الآن'
  }));

  return `export const ${data.storeSlug}SliderData = ${JSON.stringify(sliderData, null, 2)};`;
};

/**
 * حفظ بيانات المتجر في localStorage كـ fallback
 */
export const saveStoreToLocalStorage = (data: StoreGenerationData): void => {
  const storeFiles = {
    config: generateConfigFile(data),
    products: generateProductsFile(data),
    sliderData: generateSliderDataFile(data),
    storeData: {
      id: data.storeId,
      storeId: data.storeId,
      nameAr: data.storeName,
      nameEn: data.storeNameEn,
      subdomain: data.storeSlug,
      storeSlug: data.storeSlug,
      description: data.description,
      categories: data.categories,
      logo: `/assets/stores/${data.storeSlug}.webp`,
      products: data.products,
      sliderImages: data.sliderImages,
      createdAt: new Date().toISOString(),
      status: 'active'
    }
  };

  localStorage.setItem(`eshro_store_files_${data.storeSlug}`, JSON.stringify(storeFiles));
  localStorage.setItem(`store_products_${data.storeSlug}`, JSON.stringify(data.products));
  
  const normalizedSliders = data.sliderImages.map((slide, idx) => ({
    id: slide.id || `slider_${Date.now()}_${idx}`,
    imageUrl: slide.image || slide.imageUrl || '',
    title: slide.title || '',
    subtitle: slide.subtitle || '',
    discount: slide.discount || '',
    buttonText: slide.buttonText || 'تسوق الآن',
    order: idx
  }));
  
  localStorage.setItem(`eshro_sliders_${data.storeSlug}`, JSON.stringify(normalizedSliders));


};

/**
 * تحديث ملف index.json في public/assets/stores/
 */
export const updateStoresIndexFile = (newStore: StoreGenerationData): void => {
  const newStoreEntry = {
    id: newStore.storeId,
    storeId: newStore.storeId,
    nameAr: newStore.storeName,
    nameEn: newStore.storeNameEn,
    subdomain: newStore.storeSlug,
    logo: `/assets/stores/${newStore.storeSlug}.webp`,
    description: newStore.description,
    icon: '🏪',
    color: 'from-purple-400 to-pink-600'
  };

  const storesIndexKey = 'eshro_stores_index';
  const existingStores = JSON.parse(localStorage.getItem(storesIndexKey) || '{"stores":[]}');
  
  const storeExists = existingStores.stores.some((s: any) => s.subdomain === newStore.storeSlug);
  if (!storeExists) {
    existingStores.stores.push(newStoreEntry);
    localStorage.setItem(storesIndexKey, JSON.stringify(existingStores));

  }
};

/**
 * الدالة الرئيسية - توليد كامل ملفات المتجر محلياً
 */
export const generateStoreLocally = (data: StoreGenerationData): { success: boolean; message: string } => {
  try {
    // Validate required data
    if (!data.storeSlug || !data.storeName || !data.storeId) {
      throw new Error('Missing required store data: storeSlug, storeName, or storeId');
    }

    // Validate store slug format
    if (!/^[a-z0-9-]+$/.test(data.storeSlug)) {
      throw new Error('Store slug must contain only lowercase letters, numbers, and hyphens');
    }

    const storeNameCapitalized = data.storeSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');



    // Validate products data
    if (!Array.isArray(data.products)) {

      data.products = [];
    }

    // Validate slider images
    if (!Array.isArray(data.sliderImages)) {

      data.sliderImages = [];
    }

    saveStoreToLocalStorage(data);
    updateStoresIndexFile(data);

    return {
      success: true,
      message: `تم إنشاء المتجر "${data.storeName}" محلياً بنجاح`
    };
  } catch (error) {

    return {
      success: false,
      message: `فشل إنشاء المتجر محلياً: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
    };
  }
};
