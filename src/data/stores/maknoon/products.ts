import type { Product } from '../../storeProducts';

export const maknoonProducts: Product[] = [
  {
    id: 8001, storeId: 8, name: "عقد لؤلؤ طبيعي", description: "عقد من اللؤلؤ الطبيعي بتصميم كلاسيكي أنيق",
    price: 650, originalPrice: 750, images: ["/assets/stores/8.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "أبيض لؤلؤي", value: "#F8F8FF"}, {name: "كريمي", value: "#FEF3C7"}],
    rating: 4.9, reviews: 18, views: 234, likes: 89, orders: 14, category: "مجوهرات",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 8002, storeId: 8, name: "أساور ذهبية مطلية", description: "مجموعة من الأساور الذهبية المطلية بتصاميم متنوعة",
    price: 185, originalPrice: 220, images: ["/assets/stores/8.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "ذهبي", value: "#F59E0B"}, {name: "ذهبي وردي", value: "#F472B6"}],
    rating: 4.7, reviews: 26, views: 198, likes: 67, orders: 19, category: "إكسسوارات",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 8003, storeId: 8, name: "حلق فضي بالأحجار الكريمة", description: "أقراط فضية مرصعة بالأحجار الكريمة",
    price: 285, originalPrice: 340, images: ["/assets/stores/8.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "فضي", value: "#C0C0C0"}, {name: "فضي بأحجار زرقاء", value: "#3B82F6"}],
    rating: 4.8, reviews: 22, views: 167, likes: 78, orders: 16, category: "مجوهرات",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 8004, storeId: 8, name: "علبة مجوهرات مخملية", description: "علبة أنيقة لحفظ المجوهرات مبطنة بالمخمل",
    price: 95, originalPrice: 120, images: ["/assets/stores/8.webp"],
    sizes: ["متوسط", "كبير"], availableSizes: ["متوسط", "كبير"],
    colors: [{name: "أحمر", value: "#DC2626"}, {name: "أزرق", value: "#3B82F6"}, {name: "أسود", value: "#000000"}],
    rating: 4.6, reviews: 31, views: 245, likes: 98, orders: 24, category: "هدايا",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 8005, storeId: 8, name: "خاتم خطوبة مرصع", description: "خاتم خطوبة أنيق مرصع بحجر كريم مميز",
    price: 850, originalPrice: 980, images: ["/assets/stores/8.webp"],
    sizes: ["6", "7", "8", "9"], availableSizes: ["7", "8"],
    colors: [{name: "ذهبي أبيض", value: "#F8F8FF"}, {name: "ذهبي أصفر", value: "#F59E0B"}],
    rating: 4.9, reviews: 12, views: 156, likes: 67, orders: 9, category: "مجوهرات",
    quantity: 10, inStock: true, tags: []
  }
];
