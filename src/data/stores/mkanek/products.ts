import type { Product } from '../../storeProducts';

export const mkanekProducts: Product[] = [
  {
    id: 6001, storeId: 6, name: "كنبة من ثلاث مقاعد", description: "كنبة مريحة وأنيقة من القماش عالي الجودة",
    price: 1850, originalPrice: 2100, images: ["/assets/stores/6.webp"],
    sizes: ["3 مقاعد"], availableSizes: ["3 مقاعد"],
    colors: [{name: "رمادي", value: "#6B7280"}, {name: "بيج", value: "#D4A574"}, {name: "أزرق", value: "#3B82F6"}],
    rating: 4.8, reviews: 15, views: 234, likes: 89, orders: 12, category: "أثاث",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 6002, storeId: 6, name: "طاولة قهوة خشبية", description: "طاولة قهوة من الخشب الطبيعي بتصميم عصري",
    price: 485, originalPrice: 560, images: ["/assets/stores/6.webp"],
    sizes: ["120x60"], availableSizes: ["120x60"],
    colors: [{name: "بني فاتح", value: "#D2B48C"}, {name: "بني غامق", value: "#8B4513"}],
    rating: 4.7, reviews: 22, views: 187, likes: 67, orders: 16, category: "أثاث",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 6003, storeId: 6, name: "خزانة ملابس بأبواب منزلقة", description: "خزانة واسعة بتصميم حديث وأبواب منزلقة",
    price: 1350, originalPrice: 1550, images: ["/assets/stores/6.webp"],
    sizes: ["200x180"], availableSizes: ["200x180"],
    colors: [{name: "أبيض", value: "#FFFFFF"}, {name: "بني", value: "#8B4513"}],
    rating: 4.9, reviews: 9, views: 156, likes: 54, orders: 7, category: "أثاث",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 6004, storeId: 6, name: "مصباح أرضي LED", description: "مصباح أرضي بإضاءة LED قابلة للتعديل",
    price: 235, originalPrice: 280, images: ["/assets/stores/6.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "أسود", value: "#000000"}, {name: "أبيض", value: "#FFFFFF"}],
    rating: 4.6, reviews: 18, views: 143, likes: 42, orders: 13, category: "ديكور",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 6005, storeId: 6, name: "مرآة حائط دائرية", description: "مرآة دائرية بإطار ذهبي أنيق",
    price: 125, originalPrice: 150, images: ["/assets/stores/6.webp"],
    sizes: ["60cm"], availableSizes: ["60cm"],
    colors: [{name: "ذهبي", value: "#F59E0B"}, {name: "فضي", value: "#9CA3AF"}],
    rating: 4.8, reviews: 25, views: 198, likes: 73, orders: 19, category: "ديكور",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 6006, storeId: 6, name: "كراسي طعام حديثة", description: "مجموعة من 4 كراسي بتصميم حديث ومريح",
    price: 680, originalPrice: 800, images: ["/assets/stores/6.webp"],
    sizes: ["مجموعة 4"], availableSizes: ["مجموعة 4"],
    colors: [{name: "أسود", value: "#000000"}, {name: "رمادي", value: "#6B7280"}],
    rating: 4.7, reviews: 14, views: 167, likes: 58, orders: 11, category: "أثاث",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 6007, storeId: 6, name: "رف كتب متعدد الطوابق", description: "رف كتب من 5 طوابق لتنظيم مثالي",
    price: 385, originalPrice: 450, images: ["/assets/stores/6.webp"],
    sizes: ["180x80"], availableSizes: ["180x80"],
    colors: [{name: "بني", value: "#8B4513"}, {name: "أبيض", value: "#FFFFFF"}],
    rating: 4.5, reviews: 20, views: 178, likes: 45, orders: 15, category: "أثاث",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 6008, storeId: 6, name: "طقم أواني مطبخ", description: "طقم شامل من الأواني غير القابلة للالتصاق",
    price: 285, originalPrice: 340, images: ["/assets/stores/6.webp"],
    sizes: ["طقم 10 قطع"], availableSizes: ["طقم 10 قطع"],
    colors: [{name: "أحمر", value: "#DC2626"}, {name: "أزرق", value: "#3B82F6"}],
    rating: 4.9, reviews: 31, views: 267, likes: 98, orders: 24, category: "أدوات منزلية",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 6009, storeId: 6, name: "مكتب عمل مع أدراج", description: "مكتب عملي بأدراج للتخزين وتصميم أنيق",
    price: 750, originalPrice: 890, images: ["/assets/stores/6.webp"],
    sizes: ["120x60"], availableSizes: ["120x60"],
    colors: [{name: "بني", value: "#8B4513"}, {name: "أبيض", value: "#FFFFFF"}],
    rating: 4.8, reviews: 12, views: 134, likes: 47, orders: 9, category: "أثاث",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 6010, storeId: 6, name: "ساعة حائط عصرية", description: "ساعة حائط صامتة بتصميم عصري وأنيق",
    price: 95, originalPrice: 120, images: ["/assets/stores/6.webp"],
    sizes: ["30cm"], availableSizes: ["30cm"],
    colors: [{name: "أسود", value: "#000000"}, {name: "أبيض", value: "#FFFFFF"}, {name: "ذهبي", value: "#F59E0B"}],
    rating: 4.6, reviews: 28, views: 201, likes: 69, orders: 21, category: "ديكور",
    quantity: 10, inStock: true, tags: []
  }
];
