// Main application component for the EISHRO e-commerce platform
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PartnersPageLazy,
  DiscountSliderLazy,
  ModernStorePageLazy,
  EnhancedProductPageLazy,
  CartPageLazy,
  EnhancedCheckoutPageLazy,
  CompleteOrdersPageLazy,
  ShopLoginPageLazy,
  AuthCallbackPageLazy,
  CreateStorePageLazy,
  AccountTypeSelectionPageLazy,
  VisitorRegistrationPageLazy,
  MerchantTermsAcceptanceLazy,
  MerchantPersonalInfoLazy,
  MerchantStoreInfoLazy,
  MerchantStoreSuccessLazy,
  CreateStoreWizardLazy,
  StoreCreationSuccessPageLazy,
  MerchantProductManagementLazy,
  TermsAndConditionsPageLazy,
  EnhancedMerchantDashboardLazy,
  MerchantAnalyticsLazy,
  MerchantFinanceLazy,
  MerchantSettingsLazy,
  AdminPortalLazy,
  CustomerDashboardLazy,
  HelpCenterLazy,
} from "@/components/LazyPages";
import type { PersonalInfoData } from "@/pages/MerchantPersonalInfo";
import type { StoreInfoData } from "@/pages/MerchantStoreInfo";
import type { CreateOrderPayload, OrderRecord } from "@/pages/CustomerDashboard";
import { merchants as merchantProfiles } from "@/components/admin/merchantConfig";
import AddToCartPopup from "@/components/AddToCartPopup";
import AddToCartSuccessModal from "@/components/AddToCartSuccessModal";
import OrderSuccessModal from "@/components/OrderSuccessModal";
import WelcomePopup from "@/components/WelcomePopup";
import StoreCreatedSuccessModal from "@/components/StoreCreatedSuccessModal";
import BrandSlider from "@/components/BrandSlider";
import EnhancedStoresCarousel from "@/components/StoresCarousel";
import { partnersData, statsData, storesData, generateOrderId, getStoresData, invalidateStoresCache, cleanupAnonymousStores } from "@/data/ecommerceData";
import { enhancedSampleProducts } from "@/data/productCategories";
import { allStoreProducts } from "@/data/allStoreProducts";
import { loadStoreBySlug, getStoreProducts } from "@/utils/storeLoader";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const canonicalStoreSlug = (value: unknown): string => {
  const normalized = (value ?? '').toString().trim().toLowerCase().replace(/\s+/g, '-');
  if (!normalized) {
    return '';
  }
  const aliasMap: Record<string, string> = {
    sherine: 'sheirine',
    sheirin: 'sheirine',
    delta: 'delta-store',
    details: 'delta-store',
    detail: 'delta-store',
    magna: 'magna-beauty',
    megna: 'magna-beauty',
    magna_beauty: 'magna-beauty'
  };
  return aliasMap[normalized] || normalized;
};

// دالة لإنشاء ملفات المتجر الجديد
const createStoreFiles = async (storeData: any) => {
  const storeSlug = storeData.subdomain || storeData.storeSlug;
  const storeName = storeData.nameAr || storeData.storeName;
  const storeId = storeData.id || storeData.storeId;

  if (!storeSlug) {
    throw new Error('Store slug is missing from storeData');
  }

  const storeDir = `src/data/stores/${storeSlug}`;

  // Generate products content with actual data
  const products = storeData.products || [];
  const productsArray = products.map((product, index) => {
    const productId = storeId * 1000 + index + 1;
    const quantity = product.quantity || 0;
    const isAvailable = quantity > 0;
    return `  {
    id: ${productId},
    storeId: ${storeId},
    name: "${product.name || ''}",
    description: "${product.description || ''}",
    price: ${product.price || 0},
    originalPrice: ${product.originalPrice || product.price || 0},
    images: ${JSON.stringify(product.images || [])},
    sizes: ${JSON.stringify(product.sizes || [])},
    availableSizes: ${JSON.stringify(product.availableSizes || product.sizes || [])},
    colors: ${JSON.stringify(product.colors || [])},
    rating: ${product.rating || 4.5},
    reviews: ${product.reviews || 0},
    views: ${product.views || 0},
    likes: ${product.likes || 0},
    orders: ${product.orders || 0},
    category: "${product.category || ''}",
    inStock: ${isAvailable},
    isAvailable: ${isAvailable},
    tags: ${JSON.stringify(product.tags || [])},
    badge: "${product.badge || ''}",
    quantity: ${quantity},
    expiryDate: "${product.expiryDate || ''}",
    endDate: "${product.endDate || ''}"
  }`;
  }).join(',\n');

  const configContent = `// إضافة متجر ${storeName} إلى أيقونات وألوان المتاجر
export const ${storeSlug}StoreConfig = {
  storeId: ${storeId},
  icon: "🏪", // أيقونة متجر عامة
  logo: "${storeData.logo || '/assets/default-store.png'}", // مسار شعار المتجر
  color: "from-blue-400 to-blue-600", // ألوان افتراضية
  name: "${storeName}",
  description: "${storeData.description || ''}",
  categories: ${JSON.stringify(storeData.categories || [])}
};`;

  const productsContent = `// منتجات متجر ${storeName} - منتجات فريدة وحصرية
import type { Product } from '../../storeProducts';

// منتجات متجر ${storeName} (${storeSlug}.eshro.ly) - storeId: ${storeId}
export const ${storeSlug}Products: Product[] = [
${productsArray}
];

export const getStoreProducts = (): Product[] => {
  return ${storeSlug}Products;
};`;

  // Generate slider content with actual images
  const sliderImages = storeData.sliderImages || [];
  const slidesArray = sliderImages.map((slide, index) => `    {
      id: 'banner${index + 1}',
      image: '${slide.image || ''}',
      title: '${slide.title || ''}',
      subtitle: '${slide.subtitle || ''}',
      buttonText: '${slide.buttonText || 'تسوق الآن'}'
    }`).join(',\n');

  const sliderContent = `// ${storeSlug.charAt(0).toUpperCase() + storeSlug.slice(1)}Slider component: Image slider for store banners with auto-play and navigation
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

interface ${storeSlug.charAt(0).toUpperCase() + storeSlug.slice(1)}SliderProps {
  products: Product[];
  storeSlug?: string;
  onProductClick: (productId: number) => void;
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (productId: number) => void;
  favorites: number[];
}

const ${storeSlug.charAt(0).toUpperCase() + storeSlug.slice(1)}Slider: React.FC<${storeSlug.charAt(0).toUpperCase() + storeSlug.slice(1)}SliderProps> = ({
  products,
  storeSlug = '${storeSlug}',
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
    if (store === '${storeSlug}') {
      return [
${slidesArray}
      ];
    }
    return [];
  };

  const banners = getSliderBanners(storeSlug);

  useEffect(() => {
    if (!isAutoPlaying || banners.length === 0) return;

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 5000); // تغيير كل 5 ثواني

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
      {/* الصورة النشطة */}
      <div className="relative w-full h-full">
        <img
          src={banners[activeSlide].image}
          alt={banners[activeSlide].title}
          className="w-full h-full object-cover"
        />

        {/* Overlay مع النص */}
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

      {/* أزرار التنقل */}
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

      {/* نقاط التنقل */}
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

export default ${storeSlug.charAt(0).toUpperCase() + storeSlug.slice(1)}Slider;`;

  const indexContent = `export { ${storeSlug}StoreConfig as storeConfig } from './config';
export { ${storeSlug}Products as storeProducts, getStoreProducts } from './products';
export { default as ${storeSlug.charAt(0).toUpperCase() + storeSlug.slice(1)}Slider } from './Slider';`;

  const normalizedStoreData = {
    id: storeId,
    storeId: storeId,
    nameAr: storeName,
    nameEn: storeData.nameEn || storeData.storeNameEn || '',
    subdomain: storeSlug,
    storeSlug: storeSlug,
    description: storeData.description || '',
    categories: storeData.categories || [],
    logo: storeData.logo || '/assets/default-store.png',
    email: storeData.email || '',
    phone: storeData.phone || '',
    ownerName: storeData.ownerName || '',
    password: storeData.password || '',
    commercialRegister: storeData.commercialRegister || '',
    practiceLicense: storeData.practiceLicense || '',
    products: storeData.products || [],
    sliderImages: storeData.sliderImages || [],
    createdAt: storeData.createdAt || new Date().toISOString(),
    status: storeData.status || 'active'
  };

  // Save products to localStorage in the format expected by ModernStorePage
  localStorage.setItem(`store_products_${storeSlug}`, JSON.stringify(products));

  // Save slider images to localStorage
  localStorage.setItem(`store_sliders_${storeSlug}`, JSON.stringify(sliderImages));

  // Also save to localStorage for backward compatibility
  const storeFiles = {
    config: configContent,
    products: productsContent,
    slider: sliderContent,
    index: indexContent,
    storeData: normalizedStoreData
  };

  localStorage.setItem(`eshro_store_files_${storeSlug}`, JSON.stringify(storeFiles));
};

// جعل الدالة متاحة عالمياً للاستخدام من CreateStorePage
(window as any).createStoreFiles = createStoreFiles;

const postStoreToApi = async (rawStoreData: any, normalizedStore: any) => {
  const fd = new FormData();
  fd.append('storeId', String(normalizedStore.storeId));
  fd.append('storeSlug', normalizedStore.storeSlug);
  fd.append('storeName', normalizedStore.nameAr || normalizedStore.storeName);
  fd.append('storeNameEn', normalizedStore.nameEn || normalizedStore.storeNameEn || '');
  fd.append('description', normalizedStore.description || '');
  fd.append('icon', '🏪');
  fd.append('color', 'from-purple-400 to-pink-600');
  fd.append('categories', JSON.stringify(normalizedStore.categories || []));

  const ownerName =
    normalizedStore.ownerName ||
    normalizedStore.owner ||
    rawStoreData.ownerName ||
    rawStoreData.owner ||
    normalizedStore.nameAr ||
    normalizedStore.storeName ||
    'مالك المتجر';
  const ownerEmail = (normalizedStore.email || rawStoreData.email || '').toString();
  const secondaryEmail = (rawStoreData.alternateEmail || rawStoreData.ownerSecondEmail || '').toString();
  const ownerPhone = (normalizedStore.phone || rawStoreData.phone || '').toString();
  const ownerPassword = (rawStoreData.password || normalizedStore.password || '').toString();

  fd.append('ownerName', ownerName);
  if (ownerEmail) {
    fd.append('ownerEmail', ownerEmail);
    fd.append('email', ownerEmail);
  }
  if (secondaryEmail) {
    fd.append('ownerSecondEmail', secondaryEmail);
  }
  if (ownerPhone) {
    fd.append('ownerPhone', ownerPhone);
    fd.append('phone', ownerPhone);
  }
  if (ownerPassword) {
    fd.append('ownerPassword', ownerPassword);
    fd.append('password', ownerPassword);
  }

  const products = (normalizedStore.products || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    originalPrice: p.originalPrice || p.price,
    sizes: p.sizes || [],
    availableSizes: p.availableSizes || p.sizes || [],
    colors: p.colors || [],
    category: p.category || 'عام',
    quantity: p.quantity || 0,
    inStock: (p.quantity || 0) > 0,
    tags: p.tags || []
  }));
  fd.append('products', JSON.stringify(products));

  const sliders = (normalizedStore.sliderImages || []).map((s: any, i: number) => ({
    id: s.id || `banner${i+1}`,
    title: s.title || '',
    subtitle: s.subtitle || '',
    buttonText: s.buttonText || 'تسوق الآن'
  }));
  fd.append('sliderImages', JSON.stringify(sliders));

  const uploadFiles = rawStoreData.uploadFiles || {};
  const productImages: File[] = uploadFiles.productImages || [];
  const productsImageCounts: number[] = uploadFiles.productsImageCounts || [];
  const sliderImages: File[] = uploadFiles.sliderImages || [];
  const storeLogo: File | null = uploadFiles.storeLogo || null;

  if (productsImageCounts.length) {
    fd.append('productsImageCounts', JSON.stringify(productsImageCounts));
  }

  productImages.forEach((f) => fd.append('productImages', f));
  sliderImages.forEach((f) => fd.append('sliderImages', f));
  if (storeLogo) fd.append('storeLogo', storeLogo);

  const res = await fetch(`${API_BASE}/stores/create-with-images`, { method: 'POST', body: fd });
  if (!res.ok) {
    const text = await res.text();

    throw new Error(`API ${res.status}`);
  }
  const json = await res.json();

  return json;
};

import {
  AlertCircle,
  ArrowLeft,
  Bell,
  DollarSign,
  Globe,
  Menu,
  Package,
  Settings,
  Shield,
  ShoppingCart,
  Smartphone,
  Star,
  Store,
  TrendingUp,
  Truck,
  User,
  Users,
  X,
  Zap
} from "lucide-react";

const dashboardShippingConfig: Record<string, { type: "normal" | "express"; cost: number; estimatedTime: string }> = {
  "normal-tripoli": { type: "normal", cost: 40, estimatedTime: "24-96 ساعة" },
  "normal-outside": { type: "normal", cost: 120, estimatedTime: "24-96 ساعة" },
  "express-tripoli": { type: "express", cost: 70, estimatedTime: "5-12 ساعة" },
  "express-outside": { type: "express", cost: 160, estimatedTime: "5-12 ساعة" }
};

const MERCHANT_LOGIN_CREDENTIALS: Record<string, { email: string; password: string; phone: string }> = {
  nawaem: { email: "mounir@gmail.com", password: "mounir123", phone: "218910000001" },
  sherine: { email: "salem@gmail.com", password: "salem123", phone: "218910000002" },
  delta: { email: "majed@gmail.com", password: "majed123", phone: "218910000003" },
  pretty: { email: "kamel@gmail.com", password: "kamel123", phone: "218910000004" },
  magna: { email: "hasan@gmail.com", password: "hasan123", phone: "218910000005" },
  indeesh: { email: "salem.masgher@gmail.com", password: "salem1234", phone: "218910000006" }
};

const PRESERVED_MERCHANT_FIELDS = [
  "email",
  "password",
  "phone",
  "owner",
  "ownerName",
  "ownerEmail",
  "ownerPhone",
  "merchantEmail",
  "merchantPhone",
  "contactEmail",
  "contactPhone",
  "stats"
];

const mergeMerchantSeedData = (seedStore: any, existingStore?: any) => {
  if (!existingStore) {
    return { ...seedStore };
  }
  const mergedStore = {
    ...existingStore,
    ...seedStore
  };
  PRESERVED_MERCHANT_FIELDS.forEach((field) => {
    if (existingStore[field]) {
      mergedStore[field] = existingStore[field];
    }
  });
  if (Array.isArray(existingStore.disabled)) {
    mergedStore.disabled = existingStore.disabled;
  } else if (Array.isArray(seedStore?.disabled)) {
    mergedStore.disabled = seedStore.disabled;
  } else if (!Array.isArray(mergedStore.disabled)) {
    mergedStore.disabled = [];
  }
  return mergedStore;
};

// FloatingCubes component: Renders animated floating cubes for background decoration
// مكون المكعبات المتحركة
const floatingCubeClassNames = [
  "floating-cube-pos-0",
  "floating-cube-pos-1",
  "floating-cube-pos-2",
  "floating-cube-pos-3",
  "floating-cube-pos-4",
  "floating-cube-pos-5"
];

const FloatingCubes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {floatingCubeClassNames.map((cubeClass) => (
        <div
          key={cubeClass}
          className={`absolute w-4 h-4 bg-primary/20 floating-cube ${cubeClass}`}
        />
      ))}
    </div>
  );
};

// Header component: Navigation header with logo, menu items, cart icon, and user actions
// مكون الهيدر المحسن
const Header = ({
  onNavigate,
  cartItemsCount,
  unavailableOrdersCount,
  onCartOpen,
  onOrdersOpen,
  isLoggedInAsVisitor,
  currentVisitor,
  setCurrentVisitor,
  setIsLoggedInAsVisitor
}: {
  onNavigate: (page: string) => void;
  cartItemsCount: number;
  unavailableOrdersCount: number;
  onCartOpen: () => void;
  onOrdersOpen: () => void;
  isLoggedInAsVisitor: boolean;
  currentVisitor: any;
  setCurrentVisitor: (visitor: any) => void;
  setIsLoggedInAsVisitor: (loggedIn: boolean) => void;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <FloatingCubes />
      <div className="w-full px-4 mx-auto max-w-7xl flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/eshro-new-logo.png"
            alt="إشرو"
            className="h-12 w-32 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'w-32 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg';
              fallback.innerHTML = '<svg class="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/></svg>';
              (e.target as HTMLImageElement).parentNode?.appendChild(fallback);
            }}
          />
        </div>

        {/* التنقل الرئيسي - مع تباعد محسن وحجم أكبر */}
        <nav className="hidden md:flex items-center gap-16">
          <button 
            onClick={() => onNavigate('home')}
            className="text-lg font-semibold transition-colors hover:text-primary text-muted-foreground hover:scale-105 py-2 px-4 rounded-lg hover:bg-primary/10"
          >
            الرئيسية
          </button>
          <button 
            onClick={() => {
              const aboutSection = document.querySelector('.services-section');
              if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="text-lg font-semibold transition-colors hover:text-primary text-muted-foreground hover:scale-105 py-2 px-4 rounded-lg hover:bg-primary/10"
          >
            عن إشرو
          </button>
          <button 
            onClick={() => {
              const storesSection = document.querySelector('.stores-carousel');
              if (storesSection) {
                storesSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="text-lg font-semibold transition-colors hover:text-primary text-muted-foreground hover:scale-105 py-2 px-4 rounded-lg hover:bg-primary/10"
          >
            متاجر إشرو
          </button>
          <button 
            onClick={() => onNavigate('partners')}
            className="text-lg font-semibold transition-colors hover:text-primary text-muted-foreground hover:scale-105 whitespace-nowrap py-2 px-4 rounded-lg hover:bg-primary/10"
          >
            شركاء النجاح
          </button>
          <button 
            onClick={() => {
              const footerSection = document.querySelector('footer');
              if (footerSection) {
                footerSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="text-lg font-semibold transition-colors hover:text-primary text-muted-foreground hover:scale-105 py-2 px-4 rounded-lg hover:bg-primary/10"
          >
            اتصل بنا
          </button>
        </nav>

        <div className="flex items-center gap-6">
          {/* أيقونة بوابة الإدارة - مخفية تماماً عن المستخدمين العاديين */}
          {/* سيتم إظهارها فقط للمدراء عبر نظام خاص في المستقبل */}

         {/* أيقونة لوحة تحكم المستخدم - تظهر فقط بعد تسجيل الدخول */}
         {isLoggedInAsVisitor && currentVisitor && (
           <Button
             variant="ghost"
             size="sm"
             onClick={() => {
               
               
               
               
               onNavigate('customer-dashboard');
             }}
             className="relative shadow-lg hover:shadow-xl transition-shadow transition-colors duration-300 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
             title="لوحة تحكم المستخدم"
           >
             <User className="h-5 w-5" />
             <span className="sr-only">لوحة تحكم المستخدم</span>
           </Button>
         )}

         {/* أيقونة الطلبات */}
         <Button variant="ghost" size="sm" onClick={onOrdersOpen} className="relative">
           <Package className="h-5 w-5" />
           {unavailableOrdersCount > 0 && (
             <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
               {unavailableOrdersCount}
             </span>
           )}
           <span className="sr-only">طلباتي</span>
         </Button>

         {/* أيقونة السلة */}
         <Button variant="ghost" size="sm" onClick={onCartOpen} className="relative">
           <ShoppingCart className="h-5 w-5" />
           {cartItemsCount > 0 && (
             <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
               {cartItemsCount}
             </span>
           )}
           <span className="sr-only">السلة</span>
         </Button>

         {/* عرض معلومات المستخدم إذا كان مسجل دخول */}
         {isLoggedInAsVisitor && currentVisitor ? (
           <div className="relative">
             <button
               onClick={() => {
                 const dropdown = document.getElementById('user-dropdown');
                 if (dropdown) {
                   dropdown.classList.toggle('hidden');
                 }
               }}
               className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
             >
               {/* صورة المستخدم */}
               <div className="relative">
                 {(() => {
                   const avatarSrc = currentVisitor.avatar || (typeof window !== 'undefined' ? localStorage.getItem('userProfileImage') : null);
                   return avatarSrc ? (
                     <img
                       src={avatarSrc}
                       alt="صورة المستخدم"
                       className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-lg"
                     />
                   ) : (
                     <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                       <span className="text-white text-sm font-bold">
                         {currentVisitor.firstName?.charAt(0) || currentVisitor.name?.charAt(0) || 'م'}
                       </span>
                     </div>
                   );
                 })()}
                 <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
               </div>

               {/* النص المطلوب فقط */}
               <div className="text-right">
                 <p className="text-sm font-medium text-gray-900">
                   مرحباً، {currentVisitor.firstName || currentVisitor.name?.split(' ')[0] || 'مستخدم'}
                 </p>
               </div>
             </button>

             {/* القائمة المنسدلة */}
             <div
               id="user-dropdown"
               className="hidden absolute left-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
             >
               <div className="px-4 py-2 border-b border-gray-100">
                 <p className="text-sm font-medium text-gray-900">
                   {currentVisitor.firstName || currentVisitor.name?.split(' ')[0] || 'مستخدم'}
                 </p>
                 <p className="text-xs text-gray-600">
                   {currentVisitor.membershipType || 'عضو مسجل'}
                 </p>
               </div>

               <button
                 onClick={() => {
                   document.getElementById('user-dropdown')?.classList.add('hidden');
                   onNavigate('customer-dashboard');
                 }}
                 className="w-full text-right px-4 py-2 hover:bg-gray-50 flex items-center gap-3 transition-colors"
               >
                 <User className="h-4 w-4 text-gray-600" />
                 <span className="text-sm">عضو مسجل</span>
               </button>

               <button
                 onClick={() => {
                   document.getElementById('user-dropdown')?.classList.add('hidden');
                   // الانتقال لصفحة الطلبات وتفعيل تبويب المفضلة
                   onNavigate('orders');
                   setTimeout(() => {
                     const favoritesTab = document.querySelector('[data-tab="favorites"]') as HTMLButtonElement;
                     if (favoritesTab) {
                       favoritesTab.click();
                     }
                   }, 100);
                 }}
                 className="w-full text-right px-4 py-2 hover:bg-gray-50 flex items-center gap-3 transition-colors"
               >
                 <Package className="h-4 w-4 text-gray-600" />
                 <span className="text-sm">الطلبات</span>
               </button>

               <button
                 onClick={() => {
                   document.getElementById('user-dropdown')?.classList.add('hidden');
                   // الانتقال لصفحة الطلبات وتفعيل تبويب الطلبات الغير متوفرة
                   onNavigate('orders');
                   setTimeout(() => {
                     const unavailableTab = document.querySelector('[data-tab="unavailable"]') as HTMLButtonElement;
                     if (unavailableTab) {
                       unavailableTab.click();
                     }
                   }, 100);
                 }}
                 className="w-full text-right px-4 py-2 hover:bg-gray-50 flex items-center gap-3 transition-colors"
               >
                 <AlertCircle className="h-4 w-4 text-gray-600" />
                 <span className="text-sm">الطلبات الغير متوفرة</span>
               </button>

               <button
                 onClick={() => {
                   document.getElementById('user-dropdown')?.classList.add('hidden');
                   // الانتقال لصفحة الاشتراكات المستقلة
                   onNavigate('subscriptions');
                 }}
                 className="w-full text-right px-4 py-2 hover:bg-gray-50 flex items-center gap-3 transition-colors"
               >
                 <Bell className="h-4 w-4 text-gray-600" />
                 <span className="text-sm">الاشتراكات</span>
               </button>

               <button
                 onClick={() => {
                   document.getElementById('user-dropdown')?.classList.add('hidden');
                   // الانتقال لواجهة تغيير كلمة المرور المستقلة
                   onNavigate('change-password');
                 }}
                 className="w-full text-right px-4 py-2 hover:bg-gray-50 flex items-center gap-3 transition-colors"
               >
                 <Settings className="h-4 w-4 text-gray-600" />
                 <span className="text-sm">تغيير كلمة المرور</span>
               </button>

               <div className="border-t border-gray-100 mt-2 pt-2">
                 <button
                   onClick={() => {
                     document.getElementById('user-dropdown')?.classList.add('hidden');
                     
                     setCurrentVisitor(null);
                     setIsLoggedInAsVisitor(false);
                     localStorage.removeItem('eshro_visitor_user');
                     localStorage.removeItem('eshro_logged_in_as_visitor');
                     alert('تم تسجيل الخروج بنجاح!');
                   }}
                   className="w-full text-right px-4 py-2 hover:bg-red-50 flex items-center gap-3 transition-colors text-red-600"
                 >
                   <ArrowLeft className="h-4 w-4" />
                   <span className="text-sm">تسجيل الخروج</span>
                 </button>
               </div>
             </div>
           </div>
         ) : (
           <Button variant="outline" size="sm" onClick={() => onNavigate('login')} className="hover:bg-primary/10">
             تسجيل الدخول
           </Button>
         )}

         <button
           onClick={() => setIsMenuOpen(!isMenuOpen)}
           className="md:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors"
         >
           {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
         </button>
       </div>
      </div>

      {/* القائمة المحمولة */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur p-4 space-y-2 slide-in-right">
          <button 
            onClick={() => { onNavigate('home'); setIsMenuOpen(false); }}
            className="block w-full text-right py-3 text-sm font-medium hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"
          >
            الرئيسية
          </button>
          <button 
            onClick={() => { onNavigate('about'); setIsMenuOpen(false); }}
            className="block w-full text-right py-3 text-sm font-medium hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"
          >
            عن إشرو
          </button>
          <button 
            onClick={() => { onNavigate('stores'); setIsMenuOpen(false); }}
            className="block w-full text-right py-3 text-sm font-medium hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"
          >
            متاجر إشرو
          </button>
          <button 
            onClick={() => { onNavigate('partners'); setIsMenuOpen(false); }}
            className="block w-full text-right py-3 text-sm font-medium hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"
          >
            شركاء النجاح
          </button>
          <button 
            onClick={() => { onNavigate('contact'); setIsMenuOpen(false); }}
            className="block w-full text-right py-3 text-sm font-medium hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"
          >
            اتصل بنا
          </button>
        </div>
      )}
    </header>
  );
};

// HeroSection component: Main landing section with brand slider
// مكون Hero Section مع سلايدر الماركات
const HeroSection = () => {
  // Array of brand images from slider Eishro folder only
  const brandImages = [
    'babel2.png',
    'collection.jpg',
    'hasamat.jpg',
    'hommer.jpg',
    'lamis.webp',
    'motajadid.jpg',
    'slider9.png',
    'slider10.png',
    'slider11.png',
    'tourri.webp'
  ];

  return (
    <section className="relative w-full bg-gradient-to-br from-background/80 via-primary/3 to-primary/5 overflow-hidden">
      <FloatingCubes />

      <div className="w-full px-4 py-8 relative z-10">
        <BrandSlider
          images={brandImages}
          autoRotateInterval={5000} // 5 seconds
        />
      </div>
    </section>
  );
};

// ServicesSection component: Displays the services offered by the platform
// مكون الخدمات المحسن
const ServicesSection = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const services = [
    {
      icon: <Store className="h-12 w-12" />,
      title: "إنشاء متجر خاص",
      description: "بالتجارة الإلكترونية",
      details: "تصميم متجر مخصص يعكس هوية علامتك التجارية"
    },
    {
      icon: <Smartphone className="h-12 w-12" />,
      title: "عرض منتجاتك",
      description: "بعدة طرق وأشكال مختلفة",
      details: "واجهات عرض تجارية متنوعة"
    },
    {
      icon: <TrendingUp className="h-12 w-12" />,
      title: "تسويق منتجات",
      description: "التجارة باضافة إلى حملات تسويقية متقدمة",
      details: "استراتيجيات تسويق متقدمة"
    },
    {
      icon: <Shield className="h-12 w-12" />,
      title: "وسائل الدفع",
      description: "الإلكترونية",
      details: "دفع آمن وموثوق لعملائك"
    },
    {
      icon: <Truck className="h-12 w-12" />,
      title: "أكثر من أربع شركات",
      description: "توصيل",
      details: "شبكة توصيل شاملة"
    }
  ];

  return (
    <section className="services-section py-20 bg-slate-900 text-white relative overflow-hidden">
      <FloatingCubes />
      
      <div className="w-full px-4 mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16 fade-in-up">
          <h2 className="flex items-center justify-center text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              خدماتنا
            </span>
          </h2>
          <p className="flex items-center justify-center text-xl text-gray-300 max-w-3xl mx-auto">
            نعمل على المساعدة لتوفير الوقت المستغرق في النقل للترويج والتسويق لتوسيع الانتشار وادارة الطلبات للتاجر
            لتسهيل البيع والشراء بطرق الدفع المتنوعة وتسريع التوصيل وذلك حرصاً على تقديم حل واحد لجميع
            المدفوعات في مكان واحد
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {services.map((service, index) => (
            <Card 
              key={index}
              className="group bg-white border border-emerald-200 hover:bg-emerald-600 hover:border-emerald-600 hover:shadow-2xl transition-colors transition-shadow transition-transform duration-300 cursor-pointer overflow-hidden transform hover:scale-105"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center mb-4 text-emerald-700 group-hover:text-white transition-colors duration-300">
                  {service.icon}
                </div>
                <h3 className="flex items-center justify-center text-xl font-extrabold text-slate-900 group-hover:text-white mb-1 transition-colors">
                  {service.title}
                </h3>
                <p className="flex items-center justify-center text-slate-900 font-semibold group-hover:text-white/90 mb-1">
                  {service.description}
                </p>
                <p className="flex items-center justify-center text-sm text-gray-600 group-hover:text-white/80">
                  {service.details}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>


      </div>
    </section>
  );
};

// PartnersSection component: Section showcasing business partners (banks, payments, shipping)
// مكون شركاء النجاح المتحرك
const PartnersSection = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const banks = [
    { name: "مصرف أمان", icon: "🏦", color: "from-blue-500 to-indigo-600" },
    { name: "مصرف الأندلس", icon: "🏛️", color: "from-green-500 to-emerald-600" },
    { name: "المصرف التجاري", icon: "🏢", color: "from-purple-500 to-violet-600" },
    { name: "مصرف الجمهورية", icon: "🏦", color: "from-orange-500 to-red-600" },
    { name: "مصرف الوحدة", icon: "🏛️", color: "from-cyan-500 to-blue-600" },
    { name: "مصرف المعاملات", icon: "🏢", color: "from-pink-500 to-rose-600" },
  ];

  const payments = [
    { name: "1Pay", icon: "💳", color: "from-green-500 to-emerald-600" },
    { name: "Cash", icon: "💰", color: "from-yellow-500 to-orange-600" },
    { name: "Becom", icon: "📱", color: "from-blue-500 to-indigo-600" },
    { name: "موبي كاش", icon: "💸", color: "from-purple-500 to-violet-600" },
    { name: "سداد", icon: "🔷", color: "from-red-500 to-pink-600" },
  ];

  const shipping = [
    { name: "أمیال", icon: "🚚", color: "from-orange-500 to-red-600" },
    { name: "درب السیل", icon: "📦", color: "from-green-500 to-emerald-600" },
    { name: "فانکس", icon: "🚛", color: "from-blue-500 to-indigo-600" },
    { name: "زام", icon: "🚐", color: "from-purple-500 to-violet-600" },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
      <style>{`
        .scroll-container { width: 200%; }
        .animate-delay-15s { animation-delay: -15s; }
        .animate-delay-30s { animation-delay: -30s; }
        .fade-delay-02s { animation-delay: 0.2s; }
        .fade-delay-04s { animation-delay: 0.4s; }
      `}</style>
      <FloatingCubes />
      
      <div className="w-full px-4 mx-auto max-w-7xl relative z-10">
        <div className="flex items-center justify-center mb-12 fade-in-up">
          <h2 className="text-2xl md:text-4xl font-bold mb-2 text-primary">شركاء النجاح</h2>
        </div>
        
        <div className="space-y-16">
          {/* المصارف التجارية */}
          <div className="fade-in-up">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary">المصارف التجارية</h3>
            </div>
            <div className="relative overflow-hidden bg-white/50 backdrop-blur-sm rounded-3xl border border-primary/10 p-6">
              <div className="flex animate-scroll space-x-6 scroll-container">
                {[...partnersData.banks, ...partnersData.banks].map((bank, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-48 h-32 bg-transparent rounded-2xl transition-colors duration-500 p-4 flex flex-col items-center justify-center"
                  >
                    <img
                      src={bank.logo}
                      alt={bank.name}
                      className="w-24 h-16 object-contain drop-shadow-md mb-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'w-16 h-12 bg-gray-200 rounded flex items-center justify-center text-2xl mb-2';
                          fallback.innerHTML = '🏦';
                          parent.insertBefore(fallback, parent.lastElementChild);
                        }
                      }}
                    />
                    <p className="text-xs font-medium text-gray-700 text-center">{bank.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* شركات الدفع الإلكتروني */}
          <div className="fade-in-up fade-delay-02s">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary">شركات الدفع الإلكتروني</h3>
            </div>
            <div className="relative overflow-hidden bg-white/50 backdrop-blur-sm rounded-3xl border border-primary/10 p-6">
              <div className="flex animate-scroll space-x-6 scroll-container animate-delay-15s">
                {[...partnersData.payment, ...partnersData.payment].map((payment, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-48 h-32 bg-transparent rounded-2xl transition-colors duration-500 p-4 flex flex-col items-center justify-center"
                  >
                    <img
                      src={payment.logo}
                      alt={payment.name}
                      className="w-24 h-16 object-contain drop-shadow-md mb-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'w-16 h-12 bg-gray-200 rounded flex items-center justify-center text-2xl mb-2';
                          fallback.innerHTML = '💳';
                          parent.insertBefore(fallback, parent.lastElementChild);
                        }
                      }}
                    />
                    <p className="text-xs font-medium text-gray-700 text-center">{payment.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* شركات الشحن والتوصيل */}
          <div className="fade-in-up fade-delay-04s">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <Truck className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary">شركات الشحن والتوصيل</h3>
            </div>
            <div className="relative overflow-hidden bg-white/50 backdrop-blur-sm rounded-3xl border border-primary/10 p-6">
              <div className="flex animate-scroll space-x-6 scroll-container animate-delay-30s">
                {[...partnersData.transport, ...partnersData.transport].map((company, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-48 h-32 bg-transparent rounded-2xl transition-colors duration-500 p-4 flex flex-col items-center justify-center"
                  >
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-24 h-16 object-contain drop-shadow-md mb-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'w-16 h-12 bg-gray-200 rounded flex items-center justify-center text-2xl mb-2';
                          fallback.innerHTML = '🚚';
                          parent.insertBefore(fallback, parent.lastElementChild);
                        }
                      }}
                    />
                    <p className="text-xs font-medium text-gray-700 text-center">{company.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* no CTA per request */}
      </div>
    </section>
  );
};

// Footer component: Site footer with links, contact info, and social media
// الفوتر
const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-16 relative overflow-hidden">
      <FloatingCubes />

      <div className="w-full px-4 mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img src="/eshro-logo-white.png" alt="إشرو" className="h-10 w-auto" />
            </div>
            <p className="text-gray-400 mb-4">
              منصة إشرو للتجارة الإلكترونية - انتقل من التجارة التقليدية إلى الرقمية بكل يسر
            </p>
            <div className="flex gap-4 justify-center">
              {/* أيقونات وسائل التواصل */}
              <div className="w-10 h-10 bg-primary/40 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                <span className="text-xs">f</span>
              </div>
              <div className="w-10 h-10 bg-primary/40 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                <span className="text-xs">t</span>
              </div>
              <div className="w-10 h-10 bg-primary/40 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                <span className="text-xs">i</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4 text-primary">عن إشرو</h3>
            <ul className="space-y-2 text-gray-400 text-center">
              <li><a href="#" className="hover:text-white transition-colors">عن المنصة</a></li>
              <li><a href="#" className="hover:text-white transition-colors">شروط الخدمة</a></li>
              <li><a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a></li>
              <li><a href="#" className="hover:text-white transition-colors">الشروط والأحكام</a></li>
            </ul>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4 text-primary">الخدمات</h3>
            <ul className="space-y-2 text-gray-400 text-center">
              <li><a href="#" className="hover:text-white transition-colors">إنشاء متجر</a></li>
              <li><a href="#" className="hover:text-white transition-colors">حلول الدفع</a></li>
              <li><a href="#" className="hover:text-white transition-colors">خدمات الشحن</a></li>
              <li><a href="#" className="hover:text-white transition-colors">الدعم التقني</a></li>
            </ul>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4 text-primary">تواصل معنا</h3>
            <ul className="space-y-2 text-gray-400 text-center">
              <li>📧 info@ishro.ly</li>
              <li>📞944062927(218)</li>
              <li>📞944062927(218)</li>
              <li>📍 طرابلس، ليبيا</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex items-center justify-center text-gray-600">
          <p className="text-center"> منصة إشرو © 2025 جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

// Home component: Main application component managing state and rendering different pages
// المكون الرئيسي
export default function Home() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentStore, setCurrentStore] = useState<string | null>(null);
  const [currentProduct, setCurrentProduct] = useState<number | null>(null);
  const [currentStoreProducts, setCurrentStoreProducts] = useState<any[]>([]);
  
  // حالة السلة والطلبات
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [unavailableItems, setUnavailableItems] = useState<any[]>([]);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showStoreSuccessModal, setShowStoreSuccessModal] = useState(false);
  const [createdStoreName, setCreatedStoreName] = useState('');
  const [userCoupons, setUserCoupons] = useState<any[]>([]);
  const [showOrderSuccess, setShowOrderSuccess] = useState<any>(null);
  const [showAddToCartPopup, setShowAddToCartPopup] = useState<any>(null);
  const [showAddToCartSuccess, setShowAddToCartSuccess] = useState<any>(null);
  const [showWelcomeBackModal, setShowWelcomeBackModal] = useState<any>(null);
  const [currentMerchant, setCurrentMerchant] = useState<any>(null);
  const [isLoggedInAsMerchant, setIsLoggedInAsMerchant] = useState(false);
  const [currentVisitor, setCurrentVisitor] = useState<any>(null);
  const [isLoggedInAsVisitor, setIsLoggedInAsVisitor] = useState(false);
  const [allStores, setAllStores] = useState<any[]>([]);
  const [merchantSubPage, setMerchantSubPage] = useState('analytics');
  const [merchantFlowStep, setMerchantFlowStep] = useState<'terms' | 'personal' | 'store' | 'products' | null>(null);
  const [merchantFlowData, setMerchantFlowData] = useState<{
    personalInfo?: PersonalInfoData;
    storeInfo?: StoreInfoData;
  }>({});
  const [storeCreationData, setStoreCreationData] = useState<any>(null);
  const validOrders = useMemo(() => orders.filter(order => order && order.id), [orders]);
  // Filtering functions for data isolation by merchant
  const filteredOrders = useMemo(() => {
    if (!currentMerchant?.id) return validOrders;
    return validOrders.filter(order => order?.storeId === currentMerchant.id);
  }, [validOrders, currentMerchant?.id]);

  const filteredFavorites = useMemo(() => {
    if (!currentMerchant?.id) return favorites;
    return favorites.filter(fav => fav?.storeId === currentMerchant.id);
  }, [favorites, currentMerchant?.id]);

  const filteredUnavailableItems = useMemo(() => {
    if (!currentMerchant?.id) return unavailableItems;
    return unavailableItems.filter(item => item?.storeId === currentMerchant.id);
  }, [unavailableItems, currentMerchant?.id]);


  // Emergency Cleanup for Center Hamoda
  useEffect(() => {
    try {
      const storesKey = 'eshro_stores';
      const stored = localStorage.getItem(storesKey);
      if (stored) {
        const stores = JSON.parse(stored);
        const filtered = stores.filter((s: any) => {
          const slug = (s.subdomain || s.slug || '').toLowerCase();
          return !slug.includes('hamoda');
        });
        
        if (filtered.length !== stores.length) {
          localStorage.setItem(storesKey, JSON.stringify(filtered));
          console.log('Removed Hamoda stores from eshro_stores');
          // Force reload if we removed the current store
          if (currentStore && currentStore.includes('hamoda')) {
             window.location.href = '/';
          }
        }
      }
      
      // Remove specific keys
      const keysToRemove = [
        'eshro_store_files_centerhamoda',
        'store_products_centerhamoda', 
        'store_sliders_centerhamoda',
        'eshro_store_files_hamoda-center',
        'store_products_hamoda-center', 
        'store_sliders_hamoda-center',
        'store_products_hamoda',
        'store_sliders_hamoda'
      ];
      
      keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`Removed ${key}`);
        }
      });
      
      // Search for any other keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('centerhamoda') || key.includes('hamoda'))) {
           localStorage.removeItem(key);
           console.log(`Removed wild key ${key}`);
        }
      }
      
    } catch (e) {
      console.error('Error cleaning up hamoda', e);
    }
  }, [currentStore]);




  // تحديث الـ URL حسب الصفحة والمتجر الحالي
  useEffect(() => {
    let newPath = '/';
    
    if (currentPage === 'home') {
      newPath = '/';
    } else if (currentPage === 'store' && currentStore) {
      newPath = `/${currentStore}`;
    } else if (currentPage === 'product' && currentProduct) {
      newPath = currentStore ? `/${currentStore}/product/${currentProduct}` : `/product/${currentProduct}`;
    } else if (currentPage === 'cart') {
      newPath = '/cart';
    } else if (currentPage === 'checkout') {
      newPath = '/checkout';
    } else if (currentPage === 'orders') {
      newPath = '/orders';
    } else if (currentPage === 'contact-us') {
      newPath = '/contact-us';
    } else if (currentPage === 'partners') {
      newPath = '/partner-success';
    } else if (currentPage === 'terms') {
      newPath = '/terms';
    } else if (currentPage === 'help-center') {
      newPath = '/help-center';
    } else if (currentPage === 'merchant-dashboard') {
      newPath = '/merchant/dashboard';
    } else if (currentPage === 'merchant-login') {
      newPath = '/merchant/login';
    } else if (currentPage === 'merchant-register') {
      newPath = '/merchant/register';
    } else if (currentPage === 'admin') {
      newPath = '/admin';
    } else if (currentPage === 'auth-callback') {
      newPath = '/auth/google/callback';
    } else if (currentPage === 'customer-dashboard') {
      newPath = '/customer/dashboard';
    } else if (currentPage === 'customer-login') {
      newPath = '/customer/login';
    } else if (currentPage === 'customer-register') {
      newPath = '/customer/register';
    }
    
    window.history.pushState({ page: currentPage, store: currentStore, product: currentProduct }, '', newPath);
  }, [currentPage, currentStore, currentProduct]);

  // معالجة URL والـ routing
  const handleRouting = (pathname: string) => {
    if (pathname === '/' || pathname === '') {
      setCurrentPage('home');
      setCurrentStore(null);
      setCurrentProduct(null);
    } else if (pathname === '/help-center' || pathname === '/help') {
      setCurrentPage('help-center');
    } else if (pathname === '/cart') {
      setCurrentPage('cart');
    } else if (pathname === '/checkout') {
      setCurrentPage('checkout');
    } else if (pathname === '/orders') {
      setCurrentPage('orders');
    } else if (pathname === '/contact-us') {
      setCurrentPage('contact-us');
    } else if (pathname === '/partner-success') {
      setCurrentPage('partners');
    } else if (pathname === '/terms') {
      setCurrentPage('terms');
    } else if (pathname === '/admin') {
      setCurrentPage('admin');
    } else if (pathname === '/auth/google/callback') {
      setCurrentPage('auth-callback');
    } else if (pathname.startsWith('/merchant/')) {
      const subPath = pathname.replace('/merchant/', '');
      if (subPath === 'dashboard') setCurrentPage('merchant-dashboard');
      else if (subPath === 'login') setCurrentPage('merchant-login');
      else if (subPath === 'register') setCurrentPage('merchant-register');
    } else if (pathname.startsWith('/customer/')) {
      const subPath = pathname.replace('/customer/', '');
      if (subPath === 'dashboard') setCurrentPage('customer-dashboard');
      else if (subPath === 'login') setCurrentPage('customer-login');
      else if (subPath === 'register') setCurrentPage('customer-register');
    } else if (pathname.startsWith('/product/')) {
      const productId = parseInt(pathname.replace('/product/', ''));
      setCurrentPage('product');
      setCurrentProduct(productId);
    } else {
      const storeMatch = pathname.match(/^\/([^/]+)(?:\/product\/(\d+))?$/);
      if (storeMatch) {
        const store = storeMatch[1] || '';
        const productId = storeMatch[2] ? parseInt(storeMatch[2]) : null;
        
        setCurrentStore(store);
        if (productId) {
          setCurrentPage('product');
          setCurrentProduct(productId);
        } else {
          setCurrentPage('store');
          setCurrentProduct(null);
        }
      }
    }
  };

  // معالجة زر الرجوع في المتصفح
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const pathname = window.location.pathname;
      handleRouting(pathname);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // معالجة URL عند تحميل الصفحة الأولى
  useEffect(() => {
    const pathname = window.location.pathname;
    if (pathname && pathname !== '/') {
      handleRouting(pathname);
    }
  }, []);

  // عرض النافذة الترحيبية في كل مرة يتم فتح المنصة (لأغراض التسويق وتشجيع الاشتراك)
  useEffect(() => {
    // إزالة التحقق من localStorage لجعل النافذة تظهر في كل مرة
    setShowWelcomePopup(true);
  }, []);

  // استرداد البيانات المحفوظة عند تحميل التطبيق
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    cleanupAnonymousStores();

    const savedOrders = localStorage.getItem('eshro_orders');
    const savedCartItems = localStorage.getItem('eshro_cart');
    const savedFavorites = localStorage.getItem('eshro_favorites');
    const savedCurrentMerchant = localStorage.getItem('eshro_current_merchant');
    const savedIsLoggedInAsMerchant = localStorage.getItem('eshro_logged_in_as_merchant');

    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders);
        if (Array.isArray(parsedOrders)) {
          setOrders(parsedOrders.filter((order: any) => order && order.id));
        }
      } catch (error) {
        // Error handling for orders parsing
      }
    }

    if (savedCartItems) {
      try {
        setCartItems(JSON.parse(savedCartItems));
      } catch (error) {
        // Error handling for orders parsing
      }
    }

    if (savedFavorites) {
      try {
        const parsedFavorites = JSON.parse(savedFavorites);
        if (Array.isArray(parsedFavorites)) {
          const catalog = [...allStoreProducts, ...enhancedSampleProducts];
          const normalizedFavorites = parsedFavorites
            .map((entry: any) => {
              if (!entry) {
                return null;
              }
              if (typeof entry === 'number') {
                return catalog.find((product) => product.id === entry) || null;
              }
              if (entry.id) {
                const reference = catalog.find((product) => product.id === entry.id);
                if (reference) {
                  const referenceImages = Array.isArray(reference.images) ? reference.images : [];
                  const entryImages = Array.isArray(entry.images) ? entry.images : [];
                  const mergedImages = referenceImages.length > 0 ? referenceImages : entryImages;
                  return {
                    ...reference,
                    ...entry,
                    images: mergedImages.length > 0 ? mergedImages : entryImages
                  };
                }
              }
              if (!Array.isArray(entry.images) || entry.images.length === 0) {
                const fallbackImage =
                  entry.image ||
                  entry.thumbnail ||
                  (Array.isArray(entry.product?.images) && entry.product.images.length > 0 ? entry.product.images[0] : entry.product?.image);
                if (fallbackImage) {
                  return { ...entry, images: [fallbackImage] };
                }
              }
              return entry;
            })
            .filter(Boolean);
          setFavorites(normalizedFavorites as any[]);
        }
      } catch (error) {
        // Error handling for orders parsing
      }
    }

    if (savedCurrentMerchant) {
      try {
        setCurrentMerchant(JSON.parse(savedCurrentMerchant));
      } catch (error) {
        // Error handling for orders parsing
      }
    }

    if (savedIsLoggedInAsMerchant === 'true') {
      setIsLoggedInAsMerchant(true);
    }

    const savedIsLoggedInAsVisitor = localStorage.getItem('eshro_logged_in_as_visitor');
    if (savedIsLoggedInAsVisitor === 'true') {
      setIsLoggedInAsVisitor(true);
      const savedVisitorData = localStorage.getItem('eshro_visitor_user');
      if (savedVisitorData) {
        try {
          const parsedVisitor = JSON.parse(savedVisitorData);
          if (!parsedVisitor.avatar) {
            const cachedAvatar = localStorage.getItem('userProfileImage');
            if (cachedAvatar) {
              parsedVisitor.avatar = cachedAvatar;
            }
          } else {
            localStorage.setItem('userProfileImage', parsedVisitor.avatar);
          }
          setCurrentVisitor(parsedVisitor);
        } catch (error) {
          // Silent error handling for visitor login
        }
      }
    }

    const savedUnavailable = localStorage.getItem('eshro_unavailable');
    if (savedUnavailable) {
      try {
        setUnavailableItems(JSON.parse(savedUnavailable));
      } catch (error) {
        // Error handling for orders parsing
      }
    }

    const seedMerchantStores = () => {
      const seeds = merchantProfiles
        .map((profile) => {
          const credentials = MERCHANT_LOGIN_CREDENTIALS[profile.id];
          if (!credentials) {
            return null;
          }
          return {
            id: profile.id,
            nameAr: profile.name,
            nameEn: profile.name,
            email: credentials.email,
            password: credentials.password,
            phone: credentials.phone,
            subdomain: profile.id,
            owner: profile.owner,
            plan: profile.plan,
            tier: profile.tier,
            color: profile.color,
            stats: profile.stats,
            disabled: profile.disabled ?? []
          };
        })
        .filter(Boolean) as any[];

      let existingList: any[] = [];
      try {
        const raw = localStorage.getItem('eshro_stores');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            existingList = parsed;
          }
        }
      } catch {
        existingList = [];
      }

      const mergedList = [...existingList];
      const seen = new Set<string>();
      mergedList.forEach((store) => {
        if (store?.email && typeof store.email === 'string') {
          seen.add(store.email.toLowerCase());
        }
        if (store?.subdomain && typeof store.subdomain === 'string') {
          seen.add(store.subdomain);
        }
        if (store?.id && typeof store.id === 'string') {
          seen.add(store.id);
        }
      });

      seeds.forEach((store) => {
        const storeKey = `store_${store.subdomain}`;
        let existingStoreData: any = null;
        const existingRaw = localStorage.getItem(storeKey);
        if (existingRaw) {
          try {
            existingStoreData = JSON.parse(existingRaw);
          } catch {
            existingStoreData = null;
          }
        }
        const normalizedStore = mergeMerchantSeedData(store, existingStoreData || undefined);
        localStorage.setItem(storeKey, JSON.stringify(normalizedStore));

        const variants = [
          typeof normalizedStore.email === 'string' ? normalizedStore.email.toLowerCase() : '',
          typeof normalizedStore.subdomain === 'string' ? normalizedStore.subdomain : '',
          typeof normalizedStore.id === 'string' ? normalizedStore.id : ''
        ].filter(Boolean);

        const existingIndex = mergedList.findIndex((entry) => {
          if (!entry) {
            return false;
          }
          const entryVariants = [
            typeof entry.email === 'string' ? entry.email.toLowerCase() : '',
            typeof entry.subdomain === 'string' ? entry.subdomain : '',
            typeof entry.id === 'string' ? entry.id : ''
          ].filter(Boolean);
          return entryVariants.some((key) => variants.includes(key));
        });

        if (existingIndex >= 0) {
          mergedList[existingIndex] = mergeMerchantSeedData(normalizedStore, mergedList[existingIndex]);
        } else {
          mergedList.push(normalizedStore);
        }

        variants.forEach((key) => {
          if (key) {
            seen.add(key);
          }
        });
      });

      localStorage.setItem('eshro_stores', JSON.stringify(mergedList));
      return mergedList;
    };

    const syncPermanentStores = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        const backendUrl = apiUrl.replace('/api', '');
        
        let indexResponse = await fetch(`${backendUrl}/assets/stores/index.json`, { cache: 'no-store' }).catch(() => null);
        if (!indexResponse?.ok) {
          indexResponse = await fetch('/assets/stores/index.json', { cache: 'no-store' }).catch(() => null);
        }
        if (!indexResponse?.ok) {
          indexResponse = await fetch('/index.json', { cache: 'no-store' }).catch(() => null);
        }
        if (!indexResponse?.ok) {
          return;
        }
        const payload = await indexResponse.json().catch(() => ([]));
        const storeSummaries = Array.isArray(payload)
          ? payload
          : (Array.isArray((payload as any)?.stores) ? (payload as any).stores : []);
        if (storeSummaries.length === 0) {
          return;
        }

        let existingStores: any[] = [];
        try {
          const raw = localStorage.getItem('eshro_stores');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              existingStores = parsed;
            }
          }
        } catch {
          existingStores = [];
        }

        const storeMap = new Map<string, any>();
        existingStores.forEach((store) => {
          const slug = canonicalStoreSlug(store?.subdomain || store?.storeSlug || store?.id);
          if (!slug) {
            return;
          }
          storeMap.set(slug, store);
        });

        for (const summary of storeSummaries) {
          const slug = canonicalStoreSlug(summary.slug || (summary as any).subdomain || summary.name);
          if (!slug) {
            continue;
          }

          let storeDetail: any = null;
          try {
            let detailResponse = await fetch(`${backendUrl}/assets/${slug}/store.json`, { cache: 'no-store' }).catch(() => null);
            if (!detailResponse?.ok) {
              detailResponse = await fetch(`/assets/${slug}/store.json`, { cache: 'no-store' }).catch(() => null);
            }
            if (detailResponse?.ok) {
              storeDetail = await detailResponse.json();
            }
          } catch (error) {
            // Silent error handling for storage change
          }

          const normalizedEntry = {
            id: storeDetail?.id || summary.id || slug,
            storeId: storeDetail?.storeId || summary.storeId || summary.id || slug,
            nameAr: storeDetail?.nameAr || summary.nameAr || summary.name || slug,
            nameEn: storeDetail?.nameEn || summary.nameEn || summary.name || slug,
            description: storeDetail?.description || summary.description || '',
            categories: storeDetail?.categories || summary.categories || [],
            logo: storeDetail?.logo || summary.logo || '/assets/default-store.png',
            subdomain: slug,
            storeSlug: slug,
            setupComplete: true,
            status: storeDetail?.status || summary.status || 'active',
            source: 'permanent'
          };

          const existingEntry = storeMap.get(slug);
          const mergedEntry = mergeMerchantSeedData(normalizedEntry, existingEntry || undefined);

          storeMap.set(slug, mergedEntry);

          if (storeDetail) {
            const storeKey = `store_${slug}`;
            let existingStoreRecord: any = null;
            const existingStoreRaw = localStorage.getItem(storeKey);
            if (existingStoreRaw) {
              try {
                existingStoreRecord = JSON.parse(existingStoreRaw);
              } catch {
                existingStoreRecord = null;
              }
            }

            const mergedStoreRecord = mergeMerchantSeedData(
              {
                ...storeDetail,
                subdomain: slug,
                storeSlug: slug
              },
              existingStoreRecord || undefined
            );

            localStorage.setItem(storeKey, JSON.stringify(mergedStoreRecord));
          }
        }

        const mergedStores = Array.from(storeMap.values());
        localStorage.setItem('eshro_stores', JSON.stringify(mergedStores));
        window.dispatchEvent(new Event('storeCreated'));
      } catch (error) {
        // Error handling for orders parsing
      }
    };

    const seededStores = seedMerchantStores();

    const loadAllStores = () => {
      const stores: any[] = [];
      const seen = new Set<string>();
      const pushStore = (store: any) => {
        if (!store) {
          return;
        }
        const variants = [
          typeof store.email === 'string' ? store.email.toLowerCase() : '',
          typeof store.subdomain === 'string' ? store.subdomain : '',
          typeof store.id === 'string' ? store.id : ''
        ].filter(Boolean);
        const exists = variants.some((key) => seen.has(key));
        if (!exists) {
          stores.push(store);
        }
        variants.forEach((key) => {
          if (key) {
            seen.add(key);
          }
        });
      };

      if (Array.isArray(seededStores)) {
        seededStores.forEach(pushStore);
      }

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('store_')) {
          try {
            const raw = localStorage.getItem(key);
            if (!raw) {
              continue;
            }
            const parsed = JSON.parse(raw);
            pushStore(parsed);
          } catch (error) {
            // Silent error handling for orders parsing
          }
        }
      }

      try {
        const rawList = localStorage.getItem('eshro_stores');
        if (rawList) {
          const parsedList = JSON.parse(rawList);
          if (Array.isArray(parsedList)) {
            parsedList.forEach(pushStore);
          }
        }
      } catch (error) {
        // Error handling for orders parsing
      }

      setAllStores(stores);
    };

    loadAllStores();
    syncPermanentStores()
      .then(() => {
        loadAllStores();
      })
      .catch(() => {
        // Ignore sync errors; stores will continue using existing cache
      });

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'eshro_unavailable' && e.newValue) {
        try {
          setUnavailableItems(JSON.parse(e.newValue));
        } catch (error) {
          // Silent error handling for store sync
        }
      }
      if (!e.key) {
        return;
      }
      if (e.key === 'eshro_stores' || e.key.startsWith('store_')) {
        loadAllStores();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handleVisitorLoginEvent = (event: Event) => {
      let visitorData: any = null;
      if ((event as CustomEvent).detail) {
        visitorData = (event as CustomEvent).detail;
      } else {
        const stored = localStorage.getItem('eshro_visitor_user');
        if (stored) {
          try {
            visitorData = JSON.parse(stored);
          } catch {
            visitorData = null;
          }
        }
      }
      if (visitorData) {
        setCurrentVisitor(visitorData);
        setIsLoggedInAsVisitor(true);
      }
    };
    window.addEventListener('eshro:visitor:login', handleVisitorLoginEvent as EventListener);
    return () => window.removeEventListener('eshro:visitor:login', handleVisitorLoginEvent as EventListener);
  }, []);

  // حفظ البيانات في localStorage عند تغييرها
  useEffect(() => {
    localStorage.setItem('eshro_orders', JSON.stringify(validOrders));
  }, [validOrders]);

  useEffect(() => {
    // حفظ السلة في localStorage حتى لو كانت فارغة
    localStorage.setItem('eshro_cart', JSON.stringify(cartItems));
    
    // إزالة السلة من localStorage إذا كانت فارغة
    if (cartItems.length === 0) {
      localStorage.removeItem('eshro_cart');
    }
  }, [cartItems]);

  useEffect(() => {
    if (favorites.length > 0) {
      localStorage.setItem('eshro_favorites', JSON.stringify(favorites));
    } else {
      localStorage.removeItem('eshro_favorites');
    }
  }, [favorites]);

  useEffect(() => {
    if (unavailableItems.length > 0) {
      localStorage.setItem('eshro_unavailable', JSON.stringify(unavailableItems));
    }
  }, [unavailableItems]);

  // حفظ بيانات التاجر الحالي
  useEffect(() => {
    if (currentMerchant) {
      localStorage.setItem('eshro_current_merchant', JSON.stringify(currentMerchant));
    } else {
      localStorage.removeItem('eshro_current_merchant');
    }
  }, [currentMerchant]);

  useEffect(() => {
    localStorage.setItem('eshro_logged_in_as_merchant', isLoggedInAsMerchant.toString());
  }, [isLoggedInAsMerchant]);

  useEffect(() => {
    localStorage.setItem('eshro_logged_in_as_visitor', isLoggedInAsVisitor.toString());
  }, [isLoggedInAsVisitor]);

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    setCurrentStore(null);
    setCurrentProduct(null);
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setCurrentStore(null);
    setCurrentProduct(null);
  };

  const handleStoreClick = async (storeSlug: string) => {
    
    setCurrentStore(storeSlug);

    try {
      const storeData = await loadStoreBySlug(storeSlug);
      
      if (storeData?.products && storeData.products.length > 0) {
        
        setCurrentStoreProducts(storeData.products);
      } else {
        
        const fallbackProducts = allStoreProducts.filter(p => p.storeId === storeData?.storeId);
        setCurrentStoreProducts(fallbackProducts);
      }
    } catch (error) {
      
      setCurrentStoreProducts([]);
    }
    
    setCurrentPage('store');
  };

  const handleProductClick = (productId: number) => {
    setCurrentProduct(productId);
    setCurrentPage('product');
  };

  const handleBackToStore = () => {
    setCurrentPage('store');
    setCurrentProduct(null);
  };

  const handleAddToCart = (product: any, size: string, color: string, quantity: number) => {
    const cartItem = {
      id: Date.now(), // معرف مؤقت
      product,
      size,
      color,
      quantity
    };
    
    setCartItems(prev => [...prev, cartItem]);
    
    // عرض نافذة النجاح المخصصة
    setShowAddToCartSuccess({
      productName: product.name,
      quantity,
      selectedSize: size,
      selectedColor: color
    });
  };

  const handleBuyNow = (product: any, size: string, color: string, quantity: number) => {
    // إضافة للسلة أولاً
    handleAddToCart(product, size, color, quantity);
    // ثم الانتقال للسلة
    setCurrentPage('cart');
  };

  const handleUpdateCartQuantity = (itemId: number, quantity: number) => {
    setCartItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const handleRemoveFromCart = (itemId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleOrderComplete = (orderData: any) => {
    if (orderData) {
      // إضافة الطلب للطلبات المكتملة
      setOrders(prev => [...prev, { ...orderData, storeId: currentMerchant?.id || currentMerchant?.storeId }]);
      
      // إفراغ السلة
      setCartItems([]);
    }
    
    // العودة للرئيسية
    setCurrentPage('home');
  };

  const handleRegistrationComplete = (couponData: any) => {
    if (!couponData) {
      return;
    }

    setUserCoupons((prev) => {
      const existing = prev.find((coupon) => coupon.code === couponData.code);
      if (existing) {
        return prev.map((coupon) => (coupon.code === couponData.code ? couponData : coupon));
      }
      return [...prev, couponData];
    });
  };

  const handleDashboardOrderRequest = (payload: CreateOrderPayload): OrderRecord => {
    const product = allStoreProducts.find((item) => item.id === payload.productId);
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }
    const config = dashboardShippingConfig[payload.shippingOptionId] ?? dashboardShippingConfig['normal-tripoli'];
    if (!config) {
      throw new Error('SHIPPING_CONFIG_NOT_FOUND');
    }
    const now = new Date();
    const isoString = now.toISOString();
    const [datePart] = isoString.split('T');
    const orderDate = datePart ?? isoString.slice(0, 10);
    const orderTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const subtotal = (product.price || 0) * payload.quantity;
    const shippingCost = config.cost;
    const finalTotal = subtotal + shippingCost;
    const orderId = generateOrderId();
    const fullName = payload.fullName.trim();
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || fullName;
    const lastName = nameParts.slice(1).join(' ');
    const location = payload.latitude !== undefined && payload.longitude !== undefined
      ? { latitude: payload.latitude, longitude: payload.longitude, accuracy: 10 }
      : undefined;

    const newOrder: OrderRecord = {
      id: orderId,
      date: orderDate,
      time: orderTime,
      status: 'pending',
      items: [
        {
          id: product.id,
          name: product.name,
          product,
          price: product.price,
          quantity: payload.quantity
        }
      ],
      subtotal,
      shippingCost,
      discountAmount: 0,
      discountPercentage: 0,
      finalTotal,
      total: finalTotal,
      totalAmount: finalTotal,
      customer: {
        name: fullName,
        firstName,
        lastName,
        phone: payload.phone.trim(),
        email: payload.email.trim(),
        address: payload.address.trim(),
        city: payload.cityId,
        area: payload.areaId
      },
      shipping: {
        type: config.type,
        cost: shippingCost,
        estimatedTime: config.estimatedTime,
        company: payload.shippingCompany
      },
      payment: {
        method: 'onDelivery',
        type: payload.orderType === 'urgent' ? 'الدفع عند الاستلام' : 'الدفع عند الاستلام'
      },
      createdAt: isoString,
      ...(payload.notes ? { notes: payload.notes } : {}),
      ...(location ? { location } : {})
    };

    setOrders((prev) => [...prev, newOrder]);
    return newOrder;
  };

  const handleUpdateVisitorProfile = (profile: any) => {
    setCurrentVisitor((prev) => {
      const updatedName = profile.name && profile.name.trim().length > 0 ? profile.name : `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
      const updatedVisitor = {
        ...(prev || {}),
        ...profile,
        name: updatedName || prev?.name || 'مستخدم إشرو'
      };
      localStorage.setItem('eshro_visitor_user', JSON.stringify(updatedVisitor));
      if (updatedVisitor.avatar) {
        localStorage.setItem('userProfileImage', updatedVisitor.avatar);
      } else {
        localStorage.removeItem('userProfileImage');
      }
      const allVisitorsRaw = localStorage.getItem('eshro_all_visitors');
      if (allVisitorsRaw) {
        try {
          const parsed = JSON.parse(allVisitorsRaw);
          if (Array.isArray(parsed)) {
            const updatedList = parsed.map((visitor: any) =>
              visitor.email === updatedVisitor.email
                ? { ...visitor, name: `${updatedVisitor.firstName || ''} ${updatedVisitor.lastName || ''}`.trim(), email: updatedVisitor.email, avatar: updatedVisitor.avatar }
                : visitor
            );
            localStorage.setItem('eshro_all_visitors', JSON.stringify(updatedList));
          }
        } catch (error) {
          // Silent error handling for unavailable items
        }
      }
      const visitorKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('eshro_visitor_user_')) {
          visitorKeys.push(key);
        }
      }
      visitorKeys.forEach((key) => {
        const value = localStorage.getItem(key);
        if (!value) {
          return;
        }
        try {
          const parsed = JSON.parse(value);
          if (parsed.email === updatedVisitor.email) {
            localStorage.setItem(key, JSON.stringify({ ...parsed, ...updatedVisitor }));
          }
        } catch (error) {
          // Silent error handling for login
        }
      });
      return updatedVisitor;
    });
  };

  const handleVisitorPasswordChange = async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
    if (!currentVisitor) {
      return;
    }
    if (currentVisitor.password && currentVisitor.password !== currentPassword) {
      throw new Error('INVALID_PASSWORD');
    }
    const updatedVisitor = { ...currentVisitor, password: newPassword };
    setCurrentVisitor(updatedVisitor);
    localStorage.setItem('eshro_visitor_user', JSON.stringify(updatedVisitor));
    const visitorKeys = [] as string[];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('eshro_visitor_user_')) {
        visitorKeys.push(key);
      }
    }
    visitorKeys.forEach((key) => {
      const value = localStorage.getItem(key);
      if (!value) {
        return;
      }
      try {
        const parsed = JSON.parse(value);
        if (parsed.email === updatedVisitor.email) {
          localStorage.setItem(key, JSON.stringify({ ...parsed, password: newPassword }));
        }
      } catch (error) {
        // Error handling for orders parsing
      }
    });
  };

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const completedOrdersCount = validOrders.length;

  // معالج تسجيل الدخول
  const handleLogin = async (credentials: { username: string; password: string; userType?: string }) => {
    const { username, password, userType = 'merchant' } = credentials;

    
    

    // إصلاح مشكلة متجر نواعم إذا لم يكن موجود
    if (username === 'mounir@gmail.com' && password === 'mounir123' && allStores.length === 0) {
      
      const nawaemStoreData = {
        nameAr: 'نواعم',
        nameEn: 'Nawaem',
        email: 'mounir@gmail.com',
        password: 'mounir123',
        phone: '218911234567',
        subdomain: 'nawaem',
        description: 'متجر نواعم للملابس والإكسسوارات',
        logo: '/assets/real-stores/interface nawaem.png',
        category: 'ملابس وإكسسوارات',
        products: []
      };

      // حفظ بيانات المتجر
      const storeKey = `store_${nawaemStoreData.subdomain}`;
      localStorage.setItem(storeKey, JSON.stringify(nawaemStoreData));
      setAllStores([nawaemStoreData]);

      
      alert('تم إنشاء بيانات متجر نواعم بنجاح! جرب تسجيل الدخول الآن.');
      return;
    }

    if (userType === 'user') {
      // تسجيل دخول الزائر
      try {
        

        // البحث في جميع مستخدمي الزوار المحفوظين
        const visitors: Array<{ key: string; data: any }> = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('eshro_visitor_user_') || key === 'eshro_visitor_user')) {
            try {
              const visitorDataStr = localStorage.getItem(key);
              if (visitorDataStr) {
                const visitorData = JSON.parse(visitorDataStr);
                visitors.push({ key, data: visitorData });
              }
            } catch (error) {
              // Silent error handling for store creation
            }
          }
        }

        

        // البحث عن المستخدم المناسب
        const matchedVisitor = visitors.find(({ data: visitorData }) => {
          const isEmailMatch = visitorData.email && visitorData.email.toLowerCase() === username.toLowerCase();
          const isNameMatch = visitorData.firstName && visitorData.lastName &&
            `${visitorData.firstName} ${visitorData.lastName}`.toLowerCase() === username.toLowerCase();
          const isPasswordMatch = visitorData.password === password;

          

          return (isEmailMatch || isNameMatch) && isPasswordMatch;
        });

        if (matchedVisitor) {
          

          // تحديث بيانات المستخدم للتأكد من اكتمالها
          const storedAvatar = matchedVisitor.data.avatar || localStorage.getItem('userProfileImage');
          const updatedVisitorData = {
            ...matchedVisitor.data,
            membershipType: matchedVisitor.data.membershipType || 'عضو مسجل',
            lastLogin: new Date().toISOString(),
            avatar: storedAvatar || matchedVisitor.data.avatar
          };

          if (updatedVisitorData.avatar) {
            localStorage.setItem('userProfileImage', updatedVisitorData.avatar);
          }

          setCurrentVisitor(updatedVisitorData);
          setIsLoggedInAsVisitor(true);

          // حفظ البيانات المحدثة في جميع المواقع
          localStorage.setItem('eshro_visitor_user', JSON.stringify(updatedVisitorData));
          localStorage.setItem(matchedVisitor.key, JSON.stringify(updatedVisitorData));

          // تحديث قائمة المستخدمين
          const existingUsers = JSON.parse(localStorage.getItem('eshro_all_visitors') || '[]');
          const updatedUsers = existingUsers.map((user: any) =>
            user.email === updatedVisitorData.email ? { ...user, lastLogin: updatedVisitorData.lastLogin } : user
          );
          localStorage.setItem('eshro_all_visitors', JSON.stringify(updatedUsers));

          // عرض بوب اب الترحيب
          setShowWelcomeBackModal({
            visitorName: updatedVisitorData.firstName,
            isFirstTime: false
          });

          // العودة للصفحة الرئيسية بعد تأخير قصير
          setTimeout(() => {
            setCurrentPage('home');
          }, 2000);

          return;
        }

        
        alert('بيانات تسجيل الدخول غير صحيحة. يرجى التأكد من اسم المستخدم وكلمة المرور.');
      } catch (error) {
        
        alert('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
      }
    } else if (userType === 'admin') {
      // تسجيل دخول مسؤول النظام
      if (username === 'admin@eshro.ly' && password === 'admin123') {
        
        alert('مرحباً بك مسؤول النظام! 🎉');
        // في التطبيق الحقيقي، سيتم توجيه مسؤول النظام للوحة التحكم الرئيسية
        // مؤقتاً سنستخدم نفس نظام التاجر لحين تطوير لوحة التحكم الإدارية الرئيسية
        setCurrentPage('admin');
      } else {
        alert('بيانات مسؤول النظام غير صحيحة');
      }
    } else {
      // تسجيل دخول التاجر (النظام الحالي)
      const storeInfo = allStores.map(s => ({ email: s.email, subdomain: s.subdomain, name: s.nameAr || s.name }));
      

      let matchingStore = allStores.find(store =>
        (store.email === username || store.subdomain === username || store.phone === username) &&
        store.password === password
      );

      if (!matchingStore) {
        const normalizedUsername = username.toLowerCase();
        const credentialEntry = Object.entries(MERCHANT_LOGIN_CREDENTIALS).find(([merchantId, creds]) => {
          if (!creds) {
            return false;
          }
          const emailMatch = creds.email.toLowerCase() === normalizedUsername;
          const phoneMatch = creds.phone === username;
          const aliasMatch = normalizedUsername === creds.email.split('@')[0];
          const subdomainMatch = merchantId === normalizedUsername;
          return emailMatch || phoneMatch || aliasMatch || subdomainMatch;
        });
        if (credentialEntry) {
          const [merchantId, creds] = credentialEntry;
          if (creds.password === password) {
            const profile = merchantProfiles.find((merchant) => merchant.id === merchantId);
            if (profile) {
              matchingStore = {
                id: profile.id,
                nameAr: profile.name,
                nameEn: profile.name,
                email: creds.email,
                password: creds.password,
                phone: creds.phone,
                subdomain: profile.id,
                owner: profile.owner,
                plan: profile.plan,
                tier: profile.tier,
                color: profile.color,
                stats: profile.stats,
                disabled: profile.disabled ?? []
              } as any;
              const storeKey = `store_${profile.id}`;
              localStorage.setItem(storeKey, JSON.stringify(matchingStore));

              const storeFilesKey = `eshro_store_files_${profile.id}`;
              localStorage.setItem(storeFilesKey, JSON.stringify({ storeData: matchingStore }));

              if (matchingStore.products && Array.isArray(matchingStore.products)) {
                const productsKey = `store_products_${profile.id}`;
                localStorage.setItem(productsKey, JSON.stringify(matchingStore.products));
                // eslint-disable-next-line no-console
                console.log('[App.tsx] Saved products:', { storeId: profile.id, count: matchingStore.products.length });
              }

              if (matchingStore.sliderImages && Array.isArray(matchingStore.sliderImages)) {
                const slidersKey = `store_sliders_${profile.id}`;
                localStorage.setItem(slidersKey, JSON.stringify(matchingStore.sliderImages));
                // eslint-disable-next-line no-console
                console.log('[App.tsx] Saved slider images:', { storeId: profile.id, count: matchingStore.sliderImages.length });
              }
              let storedList: any[] = [];
              try {
                const rawList = localStorage.getItem('eshro_stores');
                if (rawList) {
                  const parsed = JSON.parse(rawList);
                  if (Array.isArray(parsed)) {
                    storedList = parsed;
                  }
                }
              } catch {
                storedList = [];
              }
              const existsInList = storedList.some((store) =>
                store &&
                (store.email === matchingStore?.email || store.subdomain === matchingStore?.subdomain || store.id === matchingStore?.id)
              );
              if (!existsInList) {
                storedList.push(matchingStore);
                localStorage.setItem('eshro_stores', JSON.stringify(storedList));
              }
              setAllStores((previous) => {
                const existsInState = previous.some(
                  (store) =>
                    store &&
                    (store.email === matchingStore?.email || store.subdomain === matchingStore?.subdomain || store.id === matchingStore?.id)
                );
                if (existsInState) {
                  return previous;
                }
                return [...previous, matchingStore];
              });
            }
          }
        }
      }

      if (matchingStore) {
        // eslint-disable-next-line no-console
        console.log('[App.tsx] Merchant login matched:', {
          username: username,
          matchingStore: matchingStore.id || matchingStore.subdomain,
          email: matchingStore.email,
          subdomain: matchingStore.subdomain,
          nameAr: matchingStore.nameAr || matchingStore.name
        });

        if (!matchingStore.subdomain && !matchingStore.id && !matchingStore.storeSlug) {
          // eslint-disable-next-line no-console
          console.error('[App.tsx] ERROR: matchingStore has no valid identifier!', matchingStore);
        }

        const storeSlug = matchingStore.storeSlug || matchingStore.subdomain || matchingStore.slug || (matchingStore.id ? String(matchingStore.id) : null);
        // eslint-disable-next-line no-console
        console.log('[App.tsx] Determined storeSlug:', storeSlug, '| email:', matchingStore.email);

        let liveStoreData: Awaited<ReturnType<typeof loadStoreBySlug>> = null;
        if (storeSlug) {
          try {
            liveStoreData = await loadStoreBySlug(storeSlug);
            // eslint-disable-next-line no-console
            console.log('[App.tsx] Live store data loaded:', {
              slug: liveStoreData?.slug,
              name: liveStoreData?.nameAr || liveStoreData?.name
            });
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('[App.tsx] Error loading store data:', error);
          }
        } else {
          // eslint-disable-next-line no-console
          console.warn('[App.tsx] WARNING: No storeSlug determined!');
        }

        const enrichedMerchant = {
          ...matchingStore,
          storeSlug: storeSlug || matchingStore.storeSlug,
          slug: storeSlug || matchingStore.slug,
          storeData: liveStoreData || matchingStore.storeData,
          products: liveStoreData?.products || matchingStore.products,
          sliderImages: liveStoreData?.sliderImages || matchingStore.sliderImages
        };
        // eslint-disable-next-line no-console
        console.log('[App.tsx] Setting currentMerchant:', {
          id: enrichedMerchant.id,
          subdomain: enrichedMerchant.subdomain,
          email: enrichedMerchant.email,
          nameAr: enrichedMerchant.nameAr
        });
        setCurrentMerchant(enrichedMerchant);
        setIsLoggedInAsMerchant(true);
        setCurrentPage('merchant-dashboard');
      } else {
        
        
        
        
        
        
        

        const storeWithEmail = allStores.find(store => store.email === username || store.subdomain === username || store.phone === username);
        if (storeWithEmail) {
          
          alert('كلمة المرور غير صحيحة. يرجى التأكد من كلمة المرور والمحاولة مرة أخرى.');
        } else {
          
          alert('اسم المستخدم أو البريد الإلكتروني غير موجود. يرجى التأكد من البيانات والمحاولة مرة أخرى.');
        }
      }
    }
  };

  // معالج إنشاء المتجر
  const handleStoreCreated = (storeData: any) => {
    

    // حفظ بيانات المتجر في localStorage مع معرف فريد
    const storeKey = `store_${storeData.subdomain || storeData.nameEn}`;
    localStorage.setItem(storeKey, JSON.stringify(storeData));

    // إضافة المتجر إلى قائمة eshro_stores
    try {
      const existingStores = JSON.parse(localStorage.getItem('eshro_stores') || '[]');
      const storeEntry = {
        id: storeData.storeId || storeData.id || Date.now(),
        nameAr: storeData.nameAr || storeData.storeName,
        nameEn: storeData.nameEn || storeData.storeNameEn,
        subdomain: storeData.storeSlug || storeData.subdomain,
        description: storeData.description,
        categories: storeData.categories,
        logo: storeData.logo,
        setupComplete: true,
        email: storeData.email,
        password: storeData.password,
        phone: storeData.phone,
        ownerName: storeData.ownerName
      };
      
      // تجنب التكرار
      const filtered = existingStores.filter((s: any) => 
        (s.subdomain || s.id) !== (storeEntry.subdomain || storeEntry.id)
      );
      filtered.push(storeEntry);
      localStorage.setItem('eshro_stores', JSON.stringify(filtered));
    } catch (error) {
      // Silent error handling for store creation
    }

    // إضافة المتجر للقائمة العامة
    setAllStores(prev => [...prev, storeData]);

    // إظهار نافذة النجاح الجميلة
    setCreatedStoreName(storeData.nameAr);
    setCurrentMerchant(storeData);
    setShowStoreSuccessModal(true);
  };

  const handleStartMerchantDashboard = () => {
    setIsLoggedInAsMerchant(true);
    setCurrentPage('merchant-dashboard');
    setShowStoreSuccessModal(false);
  };

  // عرض بوابة الإدارة (Admin Portal)
  if (currentPage === 'admin') {
    return (
      <AdminPortalLazy
        onLogout={() => {
          setCurrentPage('login');
        }}
      />
    );
  }


  // عرض لوحة تحكم التاجر المطورة مع الشريط الجانبي العمودي
  if (currentPage === 'merchant-dashboard') {
    
    
    
    

    return (
      <EnhancedMerchantDashboardLazy
        currentMerchant={currentMerchant}
        onLogout={() => {
          
          setCurrentMerchant(null);
          setIsLoggedInAsMerchant(false);
          localStorage.removeItem('eshro_current_merchant');
          localStorage.removeItem('eshro_current_user');
          localStorage.setItem('eshro_logged_in_as_merchant', 'false');
          setCurrentPage('home');
        }}
      />
    );
  }

  // عرض لوحة تحكم المستخدم - مقارنة السياقات المختلفة
  if (currentPage === 'customer-dashboard') {
    
    
    
    

    // إنشاء بيانات المستخدم مع ضمان اكتمال جميع الحقول المطلوبة
    const createCompleteCustomerData = () => {
      const baseData = currentVisitor || {
        firstName: 'زائر',
        lastName: 'موقت',
        email: 'guest@eshro.ly',
        phone: '944062927',
        name: 'زائر موقت',
        membershipType: 'زائر',
        joinDate: new Date().toISOString().split('T')[0]
      };

      // ضمان وجود الاسم الكامل
      const fullName = baseData.name || `${baseData.firstName || ''} ${baseData.lastName || ''}`.trim() || 'زائر موقت';

      return {
        ...baseData,
        name: fullName,
        firstName: baseData.firstName || fullName.split(' ')[0] || 'زائر',
        lastName: baseData.lastName || fullName.split(' ').slice(1).join(' ') || 'موقت',
        email: baseData.email || 'guest@eshro.ly',
        phone: baseData.phone || '944062927',
        membershipType: baseData.membershipType || 'زائر',
        joinDate: baseData.joinDate || new Date().toISOString().split('T')[0],
        // إضافة معلومات إضافية للمقارنة مع الاختبار الناجح
        context: 'user-login-flow',
        timestamp: new Date().toISOString(),
        isFromLogin: true
      };
    };

    const customerData = createCompleteCustomerData();

    

    return (
      <CustomerDashboardLazy
        customerData={customerData}
        favorites={favorites}
        orders={validOrders}
        unavailableItems={unavailableItems}
        onCreateOrder={handleDashboardOrderRequest}
        onUpdateProfile={handleUpdateVisitorProfile}
        onPasswordChange={handleVisitorPasswordChange}
        onBack={() => {
          
          setCurrentPage('home');
        }}
        onLogout={() => {
          
          setCurrentVisitor(null);
          setIsLoggedInAsVisitor(false);
          setCurrentPage('home');
        }}
      />
    );
  }

  // عرض صفحة معالجة Google OAuth Callback
  if (currentPage === 'auth-callback') {
    return <AuthCallbackPageLazy />;
  }

  // عرض صفحة تسجيل الدخول
  if (currentPage === 'login') {
    return (
      <ShopLoginPageLazy
        onBack={handleBackToHome}
        onLogin={handleLogin}
        onNavigateToRegister={() => setCurrentPage('register')}
        onNavigateToAccountTypeSelection={() => setCurrentPage('account-type-selection')}
      />
    );
  }

  // عرض صفحة اختيار نوع الحساب
  if (currentPage === 'account-type-selection') {
    return (
      <AccountTypeSelectionPageLazy
        onBack={handleBackToHome}
        onSelectMerchant={() => setCurrentPage('register')}
        onSelectVisitor={() => setCurrentPage('visitor-register')}
        onSelectMerchantFlow={() => {
          setMerchantFlowStep('terms');
          setCurrentPage('merchant-flow');
        }}
      />
    );
  }

  // عرض صفحة اتفاقية شروط التاجر
  if (currentPage === 'merchant-flow' && merchantFlowStep === 'terms') {
    return (
      <MerchantTermsAcceptanceLazy
        onBack={() => {
          setMerchantFlowStep(null);
          setMerchantFlowData({});
          setCurrentPage('account-type-selection');
        }}
        onAccept={() => setCurrentPage('create-store-wizard')}
      />
    );
  }

  // عرض صفحة معلومات التاجر الشخصية
  if (currentPage === 'merchant-flow' && merchantFlowStep === 'personal') {
    return (
      <MerchantPersonalInfoLazy
        onBack={() => setMerchantFlowStep('terms')}
        onNext={(personalInfo) => {
          setMerchantFlowData(prev => ({ ...prev, personalInfo }));
          setCurrentPage('create-store-wizard');
        }}
        initialData={merchantFlowData.personalInfo}
      />
    );
  }

  // عرض صفحة معلومات المتجر
  if (currentPage === 'merchant-flow' && merchantFlowStep === 'store') {
    return (
      <MerchantStoreInfoLazy
        onBack={() => setMerchantFlowStep('personal')}
        onNext={(storeInfo) => {
          setMerchantFlowData(prev => ({ ...prev, storeInfo }));
          const { personalInfo } = merchantFlowData;
          if (personalInfo && storeInfo) {
            // Prepare store data but don't create the store yet
            const storeId = Date.now().toString();
            const storeData = {
              id: storeId,
              storeId: storeId,
              nameAr: storeInfo.storeNameAr,
              nameEn: storeInfo.storeNameEn,
              description: storeInfo.description,
              logo: storeInfo.logoPreview,
              category: storeInfo.category,
              subdomain: storeInfo.subdomain,
              warehouseChoice: 'personal', // Default value since not in StoreInfoData
              merchantEmail: personalInfo.email,
              merchantPhone: personalInfo.phone
            };

            // Store the prepared data for the success page
            setStoreCreationData(storeData);

            setMerchantFlowStep(null);
            setCurrentPage('merchant-store-success');
          }
        }}
        initialData={merchantFlowData.storeInfo}
      />
    );
  }

  // عرض صفحة نجاح إنشاء المتجر
  if (currentPage === 'merchant-store-success' && currentMerchant) {
    return (
      <MerchantStoreSuccessLazy
        storeData={currentMerchant}
        onDashboard={() => {
          setIsLoggedInAsMerchant(true);
          setCurrentPage('merchant-dashboard');
        }}
        onHome={() => {
          setCurrentPage('home');
          setCurrentMerchant(null);
        }}
      />
    );
  }

  // عرض صفحة إنشاء حساب الزائر
  if (currentPage === 'visitor-register') {
    return (
      <VisitorRegistrationPageLazy
        onBack={handleBackToHome}
        onRegister={(userData) => {
          

          // حفظ بيانات المستخدم بمفتاح فريد للحفاظ على جميع المستخدمين
          const userKey = `eshro_visitor_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem(userKey, JSON.stringify(userData));

          // حفظ أيضاً في المفتاح العام للوصول السريع للمستخدم الحالي
          localStorage.setItem('eshro_visitor_user', JSON.stringify(userData));

          // حفظ قائمة بجميع مستخدمي الزوار لتسهيل البحث
          const existingUsers = JSON.parse(localStorage.getItem('eshro_all_visitors') || '[]');
          existingUsers.push({ key: userKey, email: userData.email, name: `${userData.firstName} ${userData.lastName}` });
          localStorage.setItem('eshro_all_visitors', JSON.stringify(existingUsers));

          alert('تم إنشاء حسابك بنجاح! 🎉');
          setCurrentPage('home');
        }}
        onNavigateToLogin={() => setCurrentPage('login')}
        onNavigateToTerms={() => setCurrentPage('terms')}
      />
    );
  }

  // عرض صفحة إنشاء المتجر - توجيه للواجهة الجديدة
  if (currentPage === 'register') {
    // توجيه تلقائي للواجهة الجديدة بدلاً من القديمة
    setCurrentPage('create-store-wizard');
    setMerchantFlowStep('personal');
    return null;
  }

  // عرض صفحة معالج إنشاء المتجر الجديد
  if (currentPage === 'create-store-wizard') {
    return (
      <CreateStorePageLazy
        onBack={() => {
          setMerchantFlowStep('terms');
          setCurrentPage('merchant-flow');
        }}
        onNavigateToLogin={() => {
          setIsLoggedInAsMerchant(true);
          setCurrentPage('merchant-dashboard');
        }}
        onStoreCreated={(storeData) => {
          
          
          const storeSlug = storeData.storeSlug || storeData.subdomain;
          

          const normalizedStore = {
            id: storeData.id,
            storeId: storeData.storeId,
            nameAr: storeData.nameAr,
            nameEn: storeData.nameEn,
            description: storeData.description,
            email: storeData.email,
            phone: storeData.phone,
            password: storeData.password,
            subdomain: storeSlug,
            storeSlug: storeSlug,
            logo: storeData.logo,
            categories: storeData.categories || [],
            category: storeData.categories,
            latitude: storeData.latitude,
            longitude: storeData.longitude,
            warehouseChoice: storeData.warehouseChoice || 'personal',
            ownerName: storeData.ownerName || '',
            commercialRegister: storeData.commercialRegister || '',
            practiceLicense: storeData.practiceLicense || '',
            products: storeData.products || [],
            sliderImages: storeData.sliderImages || [],
            createdAt: new Date().toISOString(),
            status: 'active',
            setupComplete: true,
            trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          };

          const existingStores = JSON.parse(localStorage.getItem('eshro_stores') || '[]');
          existingStores.push(normalizedStore);
          localStorage.setItem('eshro_stores', JSON.stringify(existingStores));

          invalidateStoresCache();

          const merchantCredentials = {
            email: storeData.email,
            password: storeData.password,
            phone: storeData.phone,
            storeName: storeData.nameAr,
            subdomain: storeSlug,
            storeId: storeData.id,
            category: storeData.categories,
            warehouseChoice: storeData.warehouseChoice || 'personal'
          };
          localStorage.setItem(`merchant_${storeSlug}`, JSON.stringify(merchantCredentials));

          
          
          

          window.dispatchEvent(new CustomEvent('storeCreated', { detail: normalizedStore }));

          setCurrentPage('store-creation-success');
          setStoreCreationData({
            ...normalizedStore,
            id: normalizedStore.id,
            subdomain: storeSlug,
            merchantEmail: storeData.email,
            merchantPhone: storeData.phone,
            warehouseChoice: storeData.warehouseChoice || 'personal'
          });

          const createdOnServer = Boolean((storeData as any)?.serverCreated || (storeData as any)?.createdOnServer);
          if (!createdOnServer) {
            setTimeout(() => {
              try {
                postStoreToApi(storeData, normalizedStore).catch(() => {
                  createStoreFiles(normalizedStore);
                });
              } catch (error) {
                // Silent error handling for store creation
              }
            }, 0);
          }
        }}
      />
    );
  }

  // عرض صفحة نجاح إنشاء المتجر
  if (currentPage === 'store-creation-success' && storeCreationData) {
    return (
      <StoreCreationSuccessPageLazy
        storeData={storeCreationData}
        onNavigateToHome={handleBackToHome}
        onNavigateToLogin={() => {
          setCurrentPage('login');
          setMerchantFlowStep('terms');
        }}
        onContinueToProducts={() => {
          setCurrentPage('merchant-flow');
          setMerchantFlowStep('products');
        }}
      />
    );
  }

  // عرض صفحة إدارة المنتجات والصور
  if (currentPage === 'merchant-flow' && merchantFlowStep === 'products') {
    // Construct merchantData from flow data
    const merchantData = merchantFlowData.personalInfo && merchantFlowData.storeInfo ? {
      email: merchantFlowData.personalInfo.email,
      password: merchantFlowData.personalInfo.password,
      phone: merchantFlowData.personalInfo.phone,
      storeName: merchantFlowData.storeInfo.storeNameAr,
      subdomain: merchantFlowData.storeInfo.subdomain,
      storeId: storeCreationData?.id || ''
    } : null;

    return (
      <MerchantProductManagementLazy
        storeData={storeCreationData}
        merchantData={merchantData}
        onBack={() => setCurrentPage('store-creation-success')}
        onComplete={() => {
          

          // Create the store now that products are added
          const { personalInfo, storeInfo } = merchantFlowData;

          
          
          
          let storeCreated = false;

          if (personalInfo && storeInfo && storeCreationData) {
            try {
              const newStore = {
                id: storeCreationData.id,
                nameAr: storeInfo.storeNameAr,
                nameEn: storeInfo.storeNameEn,
                email: personalInfo.email,
                phone: personalInfo.phone,
                password: personalInfo.password,
                subdomain: storeInfo.subdomain,
                description: storeInfo.description,
                logo: storeInfo.logoPreview,
                category: storeInfo.category,
                createdAt: new Date().toISOString(),
                status: 'active',
                termsAccepted: true,
                trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                setupComplete: true
              };

              const existingStores = JSON.parse(localStorage.getItem('eshro_stores') || '[]');
              existingStores.push(newStore);
              localStorage.setItem('eshro_stores', JSON.stringify(existingStores));

              const merchantCredentials = {
                email: personalInfo.email,
                password: personalInfo.password,
                phone: personalInfo.phone,
                storeName: storeInfo.storeNameAr,
                subdomain: storeInfo.subdomain,
                storeId: newStore.id
              };
              localStorage.setItem(`merchant_${storeInfo.subdomain}`, JSON.stringify(merchantCredentials));

              // إنشاء صلاحيات افتراضية للمتجر الجديد
              const MERCHANT_PERMISSIONS_KEY = "eishro:merchant-permissions";
              const existingPermissions = JSON.parse(localStorage.getItem(MERCHANT_PERMISSIONS_KEY) || '{}');

              // قائمة الأقسام الافتراضية (جميع الأقسام مفعلة للمتاجر الجديدة)
              const defaultSections = [
                "overview-root",
                "orders-group", "orders-all", "orders-manual", "orders-abandoned", "orders-unavailable",
                "catalog-group", "catalog-hub", "catalog-products", "catalog-categories", "catalog-stock",
                "catalog-stock-adjustments", "catalog-stock-notifications",
                "customers-group", "customers-all", "customers-groups", "customers-reviews", "customers-questions",
                "marketing-group", "marketing-hub", "marketing-campaigns", "marketing-coupons", "marketing-loyalty",
                "analytics-group", "analytics-dashboard", "analytics-live", "analytics-sales", "analytics-stock", "analytics-customers",
                "finance-group", "finance-overview", "finance-subscriptions",
                "settings-group", "settings-general", "settings-store", "settings-pages", "settings-menu",
                "settings-sliders", "settings-ads", "settings-services",
                "logistics-group", "logistics-overview", "logistics-shipments",
                "payments-group", "payments-main", "payments-operations", "payments-deposits", "payments-banks",
                "support-group", "support-customer", "support-technical",
                "logout-root"
              ];

              // إنشاء صلاحيات افتراضية (جميع الأقسام مفعلة)
              const defaultPermissions: Record<string, boolean> = {};
              defaultSections.forEach(sectionId => {
                defaultPermissions[sectionId] = true;
              });

              existingPermissions[newStore.id] = defaultPermissions;
              localStorage.setItem(MERCHANT_PERMISSIONS_KEY, JSON.stringify(existingPermissions));

              setCurrentMerchant(newStore);
              storeCreated = true;
              
            } catch (error) {
              // Silent error handling for store creation
            }
          } else {
            // Store creation failed - continue with flow
          }

          // التأكد من الانتقال حتى لو فشل إنشاء المتجر
          if (!storeCreated) {
            // Store creation failed - continue with flow
          }

          // الانتقال للصفحة الرئيسية لرؤية المتجر الجديد
          

          // إعادة تعيين حالة التدفق للتأكد من عدم وجود تداخل
          setMerchantFlowStep(null);
          setMerchantFlowData({});
          setStoreCreationData(null);

          // تأخير قصير للتأكد من معالجة تحديثات الحالة
          setTimeout(() => {
            setCurrentPage('home');
            
          }, 100);
        }}
      />
    );
  }

  // عرض صفحة شركاء النجاح
  if (currentPage === 'partners') {
    return <PartnersPageLazy onBack={handleBackToHome} />;
  }

  // عرض صفحة مركز المساعدة
  if (currentPage === 'help-center') {
    return <HelpCenterLazy />;
  }

  // عرض صفحة الشروط والأحكام
  if (currentPage === 'terms') {
    return (
      <TermsAndConditionsPageLazy
        onBack={handleBackToHome}
      />
    );
  }

  // عرض صفحة المتجر
  if (currentPage === 'store' && currentStore) {
    return (
      <ModernStorePageLazy 
        storeSlug={currentStore} 
        onBack={handleBackToHome}
        onProductClick={handleProductClick}
        onAddToCart={handleAddToCart}
        onToggleFavorite={(productId) => {
          const product = allStoreProducts.find(p => p.id === productId) || enhancedSampleProducts.find(p => p.id === productId);
          if (product) {
            if (favorites.find(f => f.id === productId)) {
              setFavorites(prev => prev.filter(f => f.id !== productId));
            } else {
              const productWithDate = {
                ...product,
                addedDate: new Date().toISOString(),
                storeId: currentMerchant?.id || currentMerchant?.storeId
              };
              setFavorites(prev => [...prev, productWithDate]);
            }
            window.dispatchEvent(new Event('favoritesUpdated'));
          }
        }}
        onNotifyWhenAvailable={(productId) => {
          
          // النافذة الآن تُعرض محلياً في صفحات المتاجر والمنتجات
        }}
        onSubmitNotification={(product, notificationData) => {
          // حفظ بيانات التنبيه في قائمة العناصر غير المتوفرة
          const newUnavailableItem = {
            ...product,
            notificationData,
            requestedAt: new Date().toISOString()
          };
          
          setUnavailableItems(prev => [...prev, newUnavailableItem]);
          
          // حفظ في localStorage
          const savedUnavailable = JSON.parse(localStorage.getItem('eshro_unavailable') || '[]');
          savedUnavailable.push(newUnavailableItem);
          localStorage.setItem('eshro_unavailable', JSON.stringify(savedUnavailable));
          
          
        }}
        favorites={favorites.map(f => f.id)}
      />
    );
  }

  // عرض صفحة المنتج
  if (currentPage === 'product' && currentProduct) {
    // البحث في المنتجات الحالية للمتجر أولاً (أفضل أداء)
    let selectedProduct = currentStoreProducts.find(p => p.id === currentProduct);

    // إذا لم يُعثر عليه، البحث في جميع منتجات المتاجر
    if (!selectedProduct) {
      selectedProduct = allStoreProducts.find(p => p.id === currentProduct);
    }

    if (!selectedProduct) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <p className="text-lg">هذا المنتج غير متوفر حالياً.</p>
            <Button
              onClick={() => {}}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Bell className="h-4 w-4 mr-2" />
              نبهني عند التوفر
            </Button>
            <br />
            <Button onClick={currentStore ? handleBackToStore : handleBackToHome} variant="outline">
              العودة
            </Button>
          </div>
        </div>
      );
    }

    return (
      <EnhancedProductPageLazy
        product={selectedProduct}
        onBack={currentStore ? handleBackToStore : handleBackToHome}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onToggleFavorite={(productId) => {
          const product = allStoreProducts.find(p => p.id === productId) || enhancedSampleProducts.find(p => p.id === productId);
          if (product) {
            if (favorites.find(f => f.id === productId)) {
              setFavorites(prev => prev.filter(f => f.id !== productId));
            } else {
              setFavorites(prev => [...prev, { ...product, storeId: currentMerchant?.id || currentMerchant?.storeId }]);
            }
          }
        }}
        onNotifyWhenAvailable={(productId) => {
          
          // النافذة الآن تُعرض محلياً في صفحات المتاجر والمنتجات
        }}
        storeSlug={currentStore || undefined}
        isFavorite={favorites.some(f => f.id === currentProduct)}
      />
    );
  }

  // عرض صفحة السلة
  if (currentPage === 'cart') {
    return (
      <CartPageLazy
        cartItems={cartItems}
        onBack={handleBackToHome}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onOrderComplete={handleOrderComplete}
      />
    );
  }

  // عرض صفحة إتمام الطلب
  if (currentPage === 'checkout') {
    return (
      <EnhancedCheckoutPageLazy
        cartItems={cartItems}
        onBack={() => setCurrentPage('cart')}
        onOrderComplete={(orderData) => {
          if (orderData) {
            setOrders(prev => [...prev, { ...orderData, storeId: currentMerchant?.id || currentMerchant?.storeId }]);
            setCartItems([]); // تصفير السلة
            setShowOrderSuccess(orderData);
          }
          setCurrentPage('home');
        }}
        appliedCoupon={userCoupons.length > 0 ? userCoupons[0] : undefined}
      />
    );
  }

  // عرض صفحة الطلبات - إرجاع المكون الأصلي بالكامل
  if (currentPage === 'orders') {
    return (
      <CompleteOrdersPageLazy
        orders={filteredOrders}
        favorites={filteredFavorites}
        unavailableItems={filteredUnavailableItems}
        onBack={handleBackToHome}
        onAddToCart={(product) => {
          const cartItem = { id: Date.now(), product, size: 'M', color: 'أسود', quantity: 1 };
          setCartItems(prev => [...prev, cartItem]);
          alert('تم إضافة المنتج للسلة!');
        }}
        onToggleFavorite={(productId) => {
          const product = allStoreProducts.find(p => p.id === productId) || enhancedSampleProducts.find(p => p.id === productId);
          if (product) {
            if (favorites.find(f => f.id === productId)) {
              setFavorites(prev => prev.filter(f => f.id !== productId));
            } else {
              setFavorites(prev => [...prev, { ...product, storeId: currentMerchant?.id || currentMerchant?.storeId }]);
            }
          }
        }}
        onRemoveFavorite={(productId) => {
          setFavorites(prev => prev.filter(p => p.id !== productId));
        }}
        onNotifyWhenAvailable={(productId) => {
          
        }}
        onDeleteOrder={(orderId) => {
          setOrders(prev => prev.filter(order => order?.id && order.id !== orderId));
          alert('تم حذف الطلب بنجاح!');
        }}
        onRemoveUnavailableItem={(index) => {
          const updatedUnavailableItems = unavailableItems.filter((_, i) => i !== index);
          setUnavailableItems(updatedUnavailableItems);
        }}
      />
    );
  }

  // عرض صفحة الاشتراكات المستقلة
  if (currentPage === 'subscriptions') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="w-full px-4 mx-auto max-w-7xl py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={handleBackToHome}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  العودة للرئيسية
                </Button>
                <h1 className="text-2xl font-bold text-gray-800">الاشتراكات</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full px-4 mx-auto max-w-7xl py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 text-center">
              <Bell className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">إدارة الاشتراكات</h2>
              <p className="text-gray-600 mb-6">
                هنا يمكنك إدارة جميع اشتراكاتك في المتاجر والخدمات المختلفة
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-3">اشتراكات المتاجر</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    إدارة اشتراكاتك في متاجر إشرو المفضلة
                  </p>
                  <Button className="w-full">عرض المتاجر المشترك بها</Button>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-3">إشعارات المنتجات</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    إدارة إشعارات المنتجات الغير متوفرة
                  </p>
                  <Button className="w-full">عرض الإشعارات</Button>
                </Card>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // عرض صفحة تغيير كلمة المرور المستقلة
  if (currentPage === 'change-password') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="w-full px-4 mx-auto max-w-7xl py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={handleBackToHome}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  العودة للرئيسية
                </Button>
                <h1 className="text-2xl font-bold text-gray-800">تغيير كلمة المرور</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full px-4 mx-auto max-w-7xl py-8">
          <div className="max-w-md mx-auto">
            <Card className="p-6">
              <div className="text-center mb-6">
                <Settings className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800">تغيير كلمة المرور</h2>
                <p className="text-sm text-gray-600">أدخل كلمة المرور الحالية والجديدة</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="current-password">كلمة المرور الحالية</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="أدخل كلمة المرور الحالية"
                    className="text-right"
                  />
                </div>

                <div>
                  <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="أدخل كلمة المرور الجديدة"
                    className="text-right"
                  />
                </div>

                <div>
                  <Label htmlFor="confirm-password">تأكيد كلمة المرور الجديدة</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="أعد إدخال كلمة المرور الجديدة"
                    className="text-right"
                  />
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90">
                  تغيير كلمة المرور
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // عرض الصفحة الرئيسية (افتراضي)
  return (
    <div className="min-h-screen bg-background">
      <Header
        onNavigate={handleNavigation}
        cartItemsCount={cartItemsCount}
        unavailableOrdersCount={completedOrdersCount}
        onCartOpen={() => setCurrentPage('cart')}
        onOrdersOpen={() => setCurrentPage('orders')}
        isLoggedInAsVisitor={isLoggedInAsVisitor}
        currentVisitor={currentVisitor}
        setCurrentVisitor={setCurrentVisitor}
        setIsLoggedInAsVisitor={setIsLoggedInAsVisitor}
      />
      <HeroSection />
      <ServicesSection onNavigate={handleNavigation} />
      <EnhancedStoresCarousel onStoreClick={handleStoreClick} />
      <DiscountSliderLazy />
      <PartnersSection onNavigate={handleNavigation} />
      <Footer />
      
      {/* النافذة المنبثقة الترحيبية */}
      <WelcomePopup
        isOpen={showWelcomePopup}
        onClose={() => {
          
          
          setShowWelcomePopup(false);
          
        }}
        onRegistrationComplete={handleRegistrationComplete}
      />
      
      {/* نافذة نجاح الطلب */}
      {showOrderSuccess && (
        <OrderSuccessModal
          isOpen={true}
          orderData={showOrderSuccess}
          onClose={() => setShowOrderSuccess(null)}
        />
      )}
      
      
      {/* نافذة نجاح إضافة المنتج للسلة */}
      {showAddToCartSuccess && (
        <AddToCartSuccessModal
          isOpen={true}
          productName={showAddToCartSuccess.productName}
          quantity={showAddToCartSuccess.quantity}
          selectedSize={showAddToCartSuccess.selectedSize}
          selectedColor={showAddToCartSuccess.selectedColor}
          onClose={() => setShowAddToCartSuccess(null)}
          onViewCart={() => {
            setShowAddToCartSuccess(null);
            setCurrentPage('cart');
          }}
          onContinueShopping={() => {
            setShowAddToCartSuccess(null);
          }}
        />
      )}

      {/* نافذة نجاح إنشاء المتجر الجديدة */}
      {showStoreSuccessModal && (
        <StoreCreatedSuccessModal
          isOpen={true}
          storeName={createdStoreName}
          onClose={() => setShowStoreSuccessModal(false)}
          onStartDashboard={handleStartMerchantDashboard}
        />
      )}

      {/* بوب اب الترحيب للمستخدمين - تم تبسيطه */}
      {showWelcomeBackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-3xl">🎉</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              أهلاً وسهلاً بك عزيزي المشترك ✨✨
            </h2>

            <p className="text-gray-600 mb-6 leading-relaxed">
              مرحباً بك مرة أخرى {showWelcomeBackModal.visitorName}!
              <br />
              نتمنى لك وقتاً ممتعاً معنا بمنصة إشرو ✨✨
            </p>

            {/* زر متابعة التسوق فقط - تم إزالة زر لوحة التحكم */}
            <Button
              onClick={() => {
                
                setShowWelcomeBackModal(null);
              }}
              className="w-full bg-gradient-to-r from-green-500 to-primary hover:from-green-600 hover:to-primary/90 text-white font-bold py-3"
            >
              🛍️ متابعة التسوق 🛍️
            </Button>

            <p className="text-xs text-gray-500 mt-4">
              يمكنك الوصول للوحة التحكم في أي وقت من أيقونة المستخدم في الأعلى
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
