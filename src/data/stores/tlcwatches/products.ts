import type { Product } from '../../storeProducts';

export const tlcwatchesProducts: Product[] = [
  {
    id: 17001, storeId: 17, name: "ساعة كلاسيكية جلدية", description: "ساعة يد كلاسيكية بسوار من الجلد الطبيعي",
    price: 350, originalPrice: 420, images: ["/assets/stores/18.webp"],
    sizes: ["رجالي"], availableSizes: ["رجالي"],
    colors: [{name: "بني", value: "#8B4513"}, {name: "أسود", value: "#000000"}],
    rating: 4.8, reviews: 25, views: 198, likes: 76, orders: 12, category: "ساعات",
    quantity: 10, inStock: true, isAvailable: true, tags: []
  },
  {
    id: 17002, storeId: 17, name: "ساعة رياضية ذكية", description: "ساعة رياضية مزودة بمستشعرات لنبض القلب والخطوات",
    price: 650, originalPrice: 780, images: ["/assets/stores/18.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "أسود", value: "#000000"}, {name: "رمادي", value: "#6B7280"}],
    rating: 4.7, reviews: 42, views: 345, likes: 123, orders: 35, category: "ساعات",
    quantity: 10, inStock: true, isAvailable: true, tags: []
  },
  {
    id: 17003, storeId: 17, name: "ساعة نسائية ذهبية", description: "ساعة يد نسائية أنيقة مطلية بالذهب",
    price: 850, originalPrice: 980, images: ["/assets/stores/18.webp"],
    sizes: ["نسائي"], availableSizes: ["نسائي"],
    colors: [{name: "ذهبي", value: "#F59E0B"}, {name: "ذهبي وردي", value: "#F472B6"}],
    rating: 4.9, reviews: 18, views: 167, likes: 89, orders: 14, category: "ساعات",
    quantity: 10, inStock: true, isAvailable: true, tags: []
  },
  {
    id: 17004, storeId: 17, name: "ساعة غوص مقاومة للماء", description: "ساعة يد احترافية للغوص مقاومة للماء حتى 100 متر",
    price: 1200, originalPrice: 1450, images: ["/assets/stores/18.webp"],
    sizes: ["رجالي"], availableSizes: ["رجالي"],
    colors: [{name: "فضي", value: "#C0C0C0"}, {name: "أزرق", value: "#3B82F6"}],
    rating: 4.9, reviews: 11, views: 156, likes: 54, orders: 7, category: "ساعات",
    quantity: 10, inStock: true, isAvailable: true, tags: []
  },
  {
    id: 17005, storeId: 17, name: "علبة حفظ ساعات", description: "علبة خشبية أنيقة لحفظ وتنظيم 6 ساعات",
    price: 185, originalPrice: 220, images: ["/assets/stores/18.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "بني داكن", value: "#8B4513"}],
    rating: 4.6, reviews: 29, views: 134, likes: 45, orders: 19, category: "إكسسوارات",
    quantity: 10, inStock: true, isAvailable: true, tags: []
  }
];
