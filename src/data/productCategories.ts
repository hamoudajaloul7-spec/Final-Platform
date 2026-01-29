// تصنيفات المنتجات
export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  discount: string;
}

// فئات متجر شيرين المحدثة - تشمل جميع المنتجات
export const sheirineJewelryCategories: ProductCategory[] = [
  {
    id: 'all',
    name: 'جميع المنتجات',
    description: 'جميع منتجات متجر شيرين',
    icon: '🛍️',
    color: 'bg-gray-600',
    discount: '0%'
  },
  {
    id: 'jewelry',
    name: 'المجوهرات',
    description: 'مجوهرات فاخرة من الذهب والألماس',
    icon: '💎',
    color: 'bg-yellow-500',
    discount: '0%'

  },
  {
    id: 'plus-size-clothing',
    name: 'ملابس للمناسبات أحجام كبيرة',
    description: 'ملابس نسائية بأحجام كبيرة للمناسبات',
    icon: '👗',
    color: 'bg-pink-500',
    discount: '0%'
  },
  {
    id: 'shoes',
    name: 'أحذية نسائية',
    description: 'أحذية نسائية أنيقة وعصرية',
    icon: '👠',
    color: 'bg-purple-500',
    discount: '0%'
  },
  {
    id: 'bags',
    name: 'حقائب',
    description: 'حقائب يد وحقائب سفر أنيقة',
    icon: '👜',
    color: 'bg-blue-500',
    discount: '0%'
  }
];

// فئات عامة للمتاجر الأخرى
export const productCategories: ProductCategory[] = [
  {
    id: 'featured',
    name: 'مميزة',
    description: 'منتجات متميزة هذا الشهر',
    icon: '⭐',
    color: 'bg-yellow-500',
    discount: '0%'
  },
  {
    id: 'bestselling',
    name: 'أكثر مبيعاً',
    description: 'الأكثر بيعاً',
    icon: '🔥',
    color: 'bg-red-500',
    discount: '0%'
  },
  {
    id: 'new',
    name: 'جديدة', 
    description: 'منتجات جديدة',
    icon: '✨',
    color: 'bg-green-500',
    discount: '0%'
  },
  {
    id: 'out_of_stock',
    name: 'غير متوفرة',
    description: 'غير موجودة بالمخازن',
    icon: '⚠️',
    color: 'bg-gray-500',
    discount: '0%'
  }
];

// أنواع المنتجات المتاحة
export interface ProductSize {
  name: string;
  available: boolean;
}

export interface ProductColor {
  name: string;
  value: string;
  available: boolean;
}

export interface ProductTag {
  id: string;
  name: string;
  type: 'featured' | 'bestselling' | 'most_requested' | 'new' | 'top_rated' | 'out_of_stock';
}

// تحسين واجهة المنتج
export interface EnhancedProduct {
  id: number;
  storeId: number;
  storeName?: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  images: string[];
  sizes: ProductSize[];
  colors: ProductColor[];
  rating: number;
  reviews: number;
  category: string;
  inStock: boolean;
  tags: ProductTag[];
  views: number;
  likes: number;
  orders: number;
  createdAt: string;
  isNew: boolean;
  isFeatured: boolean;
  isBestselling: boolean;
  isMostRequested: boolean;
  isTopRated: boolean;
  discount: string;
}

// منتجات تجريبية محسنة
export const enhancedSampleProducts: EnhancedProduct[] = [
  {
    id: 1,
    storeId: 1,
    storeName: "متجر نواعم",
    name: "فستان طويل أسود أنيق",
    description: "فستان طويل أنيق مناسب للمناسبات الرسمية والخروج، مصنوع من قماش عالي الجودة",
    price: 185,
    originalPrice: 200,
    images: [
      "/assets/products/dress-black-main.png",
      "/assets/products/dress-black-2.png",
      "/assets/products/dress-black-3.png"
    ],
    sizes: [
      { name: "S", available: true },
      { name: "M", available: true },
      { name: "L", available: true },
      { name: "XL", available: false }
    ],
    colors: [
      { name: "أسود", value: "#000000", available: true },
      { name: "أبيض", value: "#FFFFFF", available: true },
      { name: "أخضر داكن", value: "#1F4E3D", available: false }
    ],
    rating: 4.8,
    reviews: 24,
    category: "فساتين",
    inStock: true,
    tags: [
      { id: 'featured', name: 'مميزة', type: 'featured' },
      { id: 'bestselling', name: 'أكثر مبيعاً', type: 'bestselling' }
    ],
    views: 1250,
    likes: 89,
    orders: 45,
    createdAt: "2024-01-15",
    isNew: false,
    isFeatured: true,
    isBestselling: true,
    isMostRequested: false,
    isTopRated: true,
    discount: '7.5%'
  },
  {
    id: 2,
    storeId: 1,
    storeName: "متجر نواعم",
    name: "فستان طويل أزرق راقي",
    description: "فستان طويل راقي باللون الأزرق، مثالي للإطلالات العصرية والمناسبات",
    price: 195,
    originalPrice: 220,
    images: [
      "/assets/products/dress-blue-main.png",
      "/assets/products/dress-blue-2.png"
    ],
    sizes: [
      { name: "S", available: false },
      { name: "M", available: true },
      { name: "L", available: true },
      { name: "XL", available: true }
    ],
    colors: [
      { name: "أزرق", value: "#1E3A8A", available: true },
      { name: "أسود", value: "#000000", available: true }
    ],
    rating: 4.9,
    reviews: 18,
    category: "فساتين",
    inStock: true,
    tags: [
      { id: 'top_rated', name: 'أكثر تقييماً', type: 'top_rated' },
      { id: 'new', name: 'جديدة', type: 'new' }
    ],
    views: 890,
    likes: 67,
    orders: 28,
    createdAt: "2024-09-20",
    isNew: true,
    isFeatured: false,
    isBestselling: false,
    isMostRequested: true,
    isTopRated: true,
    discount: '11.5%'
  },
  {
    id: 3,
    storeId: 1,
    storeName: "متجر نواعم",
    name: "فستان بنفسجي عصري",
    description: "فستان بنفسجي أنيق بتصميم عصري وقماش فاخر، مناسب لجميع المناسبات",
    price: 210,
    originalPrice: 250,
    images: [
      "/assets/products/dress-purple-main.png",
      "/assets/products/dress-purple-2.png"
    ],
    sizes: [
      { name: "S", available: true },
      { name: "M", available: true },
      { name: "L", available: true },
      { name: "XL", available: true }
    ],
    colors: [
      { name: "بنفسجي", value: "#7C3AED", available: true },
      { name: "أسود", value: "#000000", available: true },
      { name: "كحلي", value: "#1E40AF", available: true }
    ],
    rating: 4.7,
    reviews: 32,
    category: "فساتين",
    inStock: true,
    tags: [
      { id: 'most_requested', name: 'أكثر طلباً', type: 'most_requested' }
    ],
    views: 1100,
    likes: 95,
    orders: 38,
    createdAt: "2024-08-10",
    isNew: false,
    isFeatured: true,
    isBestselling: false,
    isMostRequested: true,
    isTopRated: false,
    discount: '16%'

  },
  {
    id: 4,
    storeId: 1,
    storeName: "متجر نواعم",
    name: "عباءة كلاسيكية أنيقة",
    description: "عباءة كلاسيكية أنيقة بتصميم تقليدي وجودة عالية، غير متوفرة حالياً",
    price: 165,
    originalPrice: 180,
    images: [
      "/assets/products/abaya-black.png"
    ],
    sizes: [
      { name: "S", available: false },
      { name: "M", available: false },
      { name: "L", available: false },
      { name: "XL", available: false }
    ],
    colors: [
      { name: "أسود", value: "#000000", available: false }
    ],
    rating: 4.6,
    reviews: 20,
    category: "عبايات",
    inStock: false,
    tags: [
      { id: 'out_of_stock', name: 'غير متوفرة', type: 'out_of_stock' }
    ],
    views: 780,
    likes: 156,
    orders: 0,
    createdAt: "2024-07-15",
    isNew: false,
    isFeatured: false,
    isBestselling: false,
    isMostRequested: true,
    isTopRated: false,
    discount: '8.5%'
  },
  {
    id: 5,
    storeId: 2,
    storeName: "شيرين",
    name: "طقم مكياج فاخر",
    description: "طقم مكياج فاخر يحتوي على جميع الأساسيات للإطلالة المثالية",
    price: 298,
    originalPrice: 350,
    images: [
      "/assets/products/makeup-set.png"
    ],
    sizes: [
      { name: "واحد", available: true }
    ],
    colors: [
      { name: "متعدد الألوان", value: "#FF69B4", available: true }
    ],
    rating: 4.9,
    reviews: 67,
    category: "مكياج",
    inStock: true,
    tags: [
      { id: 'new', name: 'جديدة', type: 'new' },
      { id: 'top_rated', name: 'أكثر تقييماً', type: 'top_rated' },
      { id: 'featured', name: 'مميزة', type: 'featured' }
    ],
    views: 1780,
    likes: 234,
    orders: 78,
    createdAt: "2024-09-25",
    isNew: true,
    isFeatured: true,
    isBestselling: true,
    isMostRequested: false,
    isTopRated: true,
    discount: '15%'
  }
];

// دوال تصفية المنتجات
export const getProductsByCategory = (products: EnhancedProduct[], categoryId: string): EnhancedProduct[] => {
  switch (categoryId) {
    case 'featured':
      return products.filter(p => p.isFeatured);
    case 'bestselling':
      return products.filter(p => p.isBestselling);
    case 'most_requested':
      return products.filter(p => p.isMostRequested);
    case 'new':
      return products.filter(p => p.isNew);
    case 'top_rated':
      return products.filter(p => p.isTopRated);
    case 'out_of_stock':
      return products.filter(p => !p.inStock);
    default:
      return products;
  }
};

// دالة للحصول على المنتجات المشتراة (للاختبار)
export const getPurchasedProducts = (): EnhancedProduct[] => {
  return enhancedSampleProducts.filter(p => p.orders > 0);
};

// دالة للحصول على المنتجات المفضلة (للاختبار)  
export const getFavoriteProducts = (): EnhancedProduct[] => {
  return enhancedSampleProducts.filter(p => p.likes > 50);
};

// دالة للحصول على المنتجات غير المتوفرة
export const getUnavailableProducts = (): EnhancedProduct[] => {
  return enhancedSampleProducts.filter(p => !p.inStock);
};
