import type { Product } from '../../storeProducts';

export const comfyProducts: Product[] = [
  {
    id: 7001, storeId: 7, name: "بدلة رياضية قطنية", description: "بدلة رياضية مريحة من القطن الخالص",
    price: 185, originalPrice: 220, images: ["/assets/stores/7.webp"],
    sizes: ["S", "M", "L", "XL"], availableSizes: ["M", "L", "XL"],
    colors: [{name: "رمادي", value: "#6B7280"}, {name: "أزرق", value: "#3B82F6"}, {name: "أسود", value: "#000000"}],
    rating: 4.7, reviews: 34, views: 298, likes: 123, orders: 28, category: "ملابس رياضية",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 7002, storeId: 7, name: "حذاء جري متقدم", description: "حذاء جري مع تقنية امتصاص الصدمات",
    price: 320, originalPrice: 380, images: ["/assets/stores/7.webp"],
    sizes: ["40", "41", "42", "43", "44"], availableSizes: ["41", "42", "43"],
    colors: [{name: "أسود", value: "#000000"}, {name: "أبيض", value: "#FFFFFF"}, {name: "أزرق", value: "#3B82F6"}],
    rating: 4.8, reviews: 29, views: 267, likes: 89, orders: 22, category: "أحذية رياضية",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 7003, storeId: 7, name: "شورت رياضي قصير", description: "شورت رياضي مريح بتقنية التهوية",
    price: 75, originalPrice: 95, images: ["/assets/stores/7.webp"],
    sizes: ["S", "M", "L", "XL"], availableSizes: ["S", "M", "L", "XL"],
    colors: [{name: "أسود", value: "#000000"}, {name: "أزرق", value: "#3B82F6"}, {name: "رمادي", value: "#6B7280"}],
    rating: 4.5, reviews: 41, views: 345, likes: 134, orders: 35, category: "ملابس رياضية",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 7004, storeId: 7, name: "قميص رياضي بأكمام طويلة", description: "قميص رياضي مضاد للبكتيريا",
    price: 95, originalPrice: 115, images: ["/assets/stores/7.webp"],
    sizes: ["S", "M", "L", "XL"], availableSizes: ["M", "L"],
    colors: [{name: "أبيض", value: "#FFFFFF"}, {name: "أحمر", value: "#DC2626"}],
    rating: 4.6, reviews: 18, views: 189, likes: 67, orders: 14, category: "ملابس رياضية",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 7005, storeId: 7, name: "سراويل يوغا مرنة", description: "سراويل يوغا عالية المرونة للنساء",
    price: 125, originalPrice: 150, images: ["/assets/stores/7.webp"],
    sizes: ["S", "M", "L", "XL"], availableSizes: ["S", "M", "L"],
    colors: [{name: "أسود", value: "#000000"}, {name: "رمادي", value: "#6B7280"}, {name: "بنفسجي", value: "#8B5CF6"}],
    rating: 4.9, reviews: 26, views: 234, likes: 98, orders: 19, category: "ملابس مريحة",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 7006, storeId: 7, name: "جوارب رياضية قطنية", description: "مجموعة 6 أزواج من الجوارب القطنية",
    price: 45, originalPrice: 60, images: ["/assets/stores/7.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "متنوع", value: "#9CA3AF"}],
    rating: 4.4, reviews: 52, views: 287, likes: 145, orders: 43, category: "إكسسوارات رياضية",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 7007, storeId: 7, name: "حقيبة رياضية مقاومة للماء", description: "حقيبة رياضية واسعة ومقاومة للماء",
    price: 155, originalPrice: 185, images: ["/assets/stores/7.webp"],
    sizes: ["متوسط", "كبير"], availableSizes: ["متوسط", "كبير"],
    colors: [{name: "أسود", value: "#000000"}, {name: "أزرق", value: "#3B82F6"}],
    rating: 4.7, reviews: 21, views: 178, likes: 76, orders: 16, category: "إكسسوارات رياضية",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 7008, storeId: 7, name: "أساور معصم رياضية", description: "أساور معصم لامتصاص العرق",
    price: 25, originalPrice: 35, images: ["/assets/stores/7.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "أبيض", value: "#FFFFFF"}, {name: "أسود", value: "#000000"}, {name: "أحمر", value: "#DC2626"}],
    rating: 4.3, reviews: 37, views: 198, likes: 87, orders: 29, category: "إكسسوارات رياضية",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 7009, storeId: 7, name: "طقم تمارين منزلية", description: "طقم كامل لممارسة التمارين في المنزل",
    price: 285, originalPrice: 340, images: ["/assets/stores/7.webp"],
    sizes: ["طقم"], availableSizes: ["طقم"],
    colors: [{name: "متنوع", value: "#6B7280"}],
    rating: 4.8, reviews: 15, views: 156, likes: 54, orders: 11, category: "معدات رياضية",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 7010, storeId: 7, name: "بنطال جوغينغ قطني", description: "بنطال جوغينغ مريح للاستخدام اليومي",
    price: 115, originalPrice: 140, images: ["/assets/stores/7.webp"],
    sizes: ["S", "M", "L", "XL"], availableSizes: ["S", "M", "L", "XL"],
    colors: [{name: "رمادي", value: "#6B7280"}, {name: "أزرق داكن", value: "#1E40AF"}],
    rating: 4.6, reviews: 33, views: 245, likes: 112, orders: 26, category: "ملابس مريحة",
    quantity: 10, inStock: true, tags: []
  }
];
