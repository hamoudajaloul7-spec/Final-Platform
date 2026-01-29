import type { Product } from '../../storeProducts';

export const unpassoProducts: Product[] = [
  {
    id: 13001, storeId: 13, name: "أحذية جري مريحة", description: "أحذية جري خفيفة الوزن مع وسادة هوائية لراحة قصوى",
    price: 185, originalPrice: 220, images: ["/assets/stores/14.webp"],
    sizes: ["40", "41", "42", "43", "44"], availableSizes: ["41", "42", "43"],
    colors: [{name: "أسود", value: "#000000"}, {name: "أزرق", value: "#3B82F6"}, {name: "رمادي", value: "#6B7280"}],
    rating: 4.7, reviews: 45, views: 287, likes: 134, orders: 38, category: "أحذية",
    quantity: 10, inStock: true, isAvailable: true, tags: []
  },
  {
    id: 13002, storeId: 13, name: "صنادل جلدية عادية", description: "صنادل من الجلد الطبيعي بتصميم كلاسيكي",
    price: 95, originalPrice: 120, images: ["/assets/stores/14.webp"],
    sizes: ["38", "39", "40", "41", "42"], availableSizes: ["39", "40", "41"],
    colors: [{name: "بني", value: "#8B4513"}, {name: "أسود", value: "#000000"}],
    rating: 4.6, reviews: 34, views: 198, likes: 67, orders: 26, category: "صنادل",
    quantity: 10, inStock: true, isAvailable: true, tags: []
  },
  {
    id: 13003, storeId: 13, name: "أحذية نسائية عالية الكعب", description: "أحذية عالية الكعب مع تصميم أنيق ومريح",
    price: 285, originalPrice: 340, images: ["/assets/stores/14.webp"],
    sizes: ["36", "37", "38", "39", "40"], availableSizes: ["37", "38", "39"],
    colors: [{name: "أسود", value: "#000000"}, {name: "بني", value: "#8B4513"}, {name: "أحمر", value: "#DC2626"}],
    rating: 4.8, reviews: 19, views: 167, likes: 54, orders: 15, category: "أحذية",
    quantity: 10, inStock: true, isAvailable: true, tags: []
  },
  {
    id: 13004, storeId: 13, name: "حذاء رجالي رسمي", description: "حذاء رجالي من الجلد للمناسبات الرسمية",
    price: 385, originalPrice: 450, images: ["/assets/stores/14.webp"],
    sizes: ["40", "41", "42", "43", "44", "45"], availableSizes: ["42", "43", "44"],
    colors: [{name: "أسود", value: "#000000"}, {name: "بني", value: "#8B4513"}],
    rating: 4.9, reviews: 16, views: 145, likes: 67, orders: 12, category: "أحذية",
    quantity: 10, inStock: true, isAvailable: true, tags: []
  },
  {
    id: 13005, storeId: 13, name: "شباشب نسائية عصرية", description: "شباشب نسائية مريحة بتصميم عصري",
    price: 125, originalPrice: 150, images: ["/assets/stores/14.webp"],
    sizes: ["36", "37", "38", "39", "40"], availableSizes: ["37", "38", "39", "40"],
    colors: [{name: "وردي", value: "#EC4899"}, {name: "أبيض", value: "#FFFFFF"}, {name: "ذهبي", value: "#F59E0B"}],
    rating: 4.5, reviews: 31, views: 256, likes: 98, orders: 24, category: "شباشب",
    quantity: 10, inStock: true, isAvailable: true, tags: []
  }
];
