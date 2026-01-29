import type { Product } from '../../storeProducts';

export const tohfaProducts: Product[] = [
  {
    id: 10001, storeId: 10, name: "مبخرة نحاسية تراثية", description: "مبخرة نحاسية منقوشة بزخارف تراثية أصيلة",
    price: 185, originalPrice: 220, images: ["/assets/stores/11.webp"],
    sizes: ["متوسط", "كبير"], availableSizes: ["متوسط", "كبير"],
    colors: [{name: "نحاسي", value: "#B8860B"}, {name: "فضي", value: "#C0C0C0"}],
    rating: 4.8, reviews: 19, views: 178, likes: 54, orders: 14, category: "تحف",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 10002, storeId: 10, name: "صينية تقديم خشبية", description: "صينية تقديم من الخشب المنقوش بتصاميم تراثية",
    price: 125, originalPrice: 150, images: ["/assets/stores/11.webp"],
    sizes: ["صغير", "متوسط", "كبير"], availableSizes: ["متوسط", "كبير"],
    colors: [{name: "بني فاتح", value: "#D2B48C"}, {name: "بني غامق", value: "#8B4513"}],
    rating: 4.7, reviews: 25, views: 201, likes: 67, orders: 18, category: "ديكور",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 10003, storeId: 10, name: "فازة خزفية مزخرفة", description: "فازة من الخزف المزخرف بألوان زاهية",
    price: 95, originalPrice: 115, images: ["/assets/stores/11.webp"],
    sizes: ["صغير", "متوسط"], availableSizes: ["صغير", "متوسط"],
    colors: [{name: "أزرق وأبيض", value: "#3B82F6"}, {name: "أحمر وذهبي", value: "#DC2626"}],
    rating: 4.6, reviews: 28, views: 234, likes: 89, orders: 21, category: "ديكور",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 10004, storeId: 10, name: "طقم فناجين قهوة تراثية", description: "طقم من 6 فناجين قهوة بتصميم تراثي أنيق",
    price: 165, originalPrice: 195, images: ["/assets/stores/11.webp"],
    sizes: ["طقم 6 قطع"], availableSizes: ["طقم 6 قطع"],
    colors: [{name: "ذهبي وأبيض", value: "#F59E0B"}, {name: "أزرق وذهبي", value: "#3B82F6"}],
    rating: 4.9, reviews: 16, views: 167, likes: 76, orders: 12, category: "هدايا تراثية",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 10005, storeId: 10, name: "سجادة صلاة فاخرة", description: "سجادة صلاة بتبطين مريح وتصميم إسلامي عريق",
    price: 85, originalPrice: 110, images: ["/assets/stores/11.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "أزرق داكن", value: "#1E3A8A"}, {name: "أخضر زمردي", value: "#064E3B"}, {name: "أحمر عميق", value: "#7F1D1D"}],
    rating: 4.8, reviews: 34, views: 212, likes: 98, orders: 27, category: "ديكور",
    quantity: 10, inStock: true, tags: []
  }
];
