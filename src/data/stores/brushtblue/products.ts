import type { Product } from '../../storeProducts';

export const brushtblueProducts: Product[] = [
  {
    id: 11001, storeId: 11, name: "لوحة فنية ألوان مائية", description: "لوحة فنية مرسومة بالألوان المائية تعبر عن الطبيعة",
    price: 350, originalPrice: 420, images: ["/assets/stores/12.webp"],
    sizes: ["50x70", "70x100"], availableSizes: ["50x70"],
    colors: [{name: "متعدد الألوان", value: "#3B82F6"}],
    rating: 4.9, reviews: 12, views: 156, likes: 67, orders: 5, category: "فنون",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 11002, storeId: 11, name: "مجموعة فرش رسم احترافية", description: "طقم فرش رسم متنوعة للفنانين المحترفين",
    price: 145, originalPrice: 175, images: ["/assets/stores/12.webp"],
    sizes: ["طقم 12 قطعة"], availableSizes: ["طقم 12 قطعة"],
    colors: [{name: "خشب طبيعي", value: "#D2B48C"}],
    rating: 4.7, reviews: 21, views: 187, likes: 54, orders: 14, category: "أدوات رسم",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 11003, storeId: 11, name: "ألوان زيتية فاخرة", description: "مجموعة ألوان زيتية عالية الجودة وثبات ممتاز",
    price: 285, originalPrice: 340, images: ["/assets/stores/12.webp"],
    sizes: ["طقم 24 لون"], availableSizes: ["طقم 24 لون"],
    colors: [{name: "متنوع", value: "#EF4444"}],
    rating: 4.8, reviews: 18, views: 145, likes: 73, orders: 9, category: "أدوات رسم",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 11004, storeId: 11, name: "دفتر رسم سكتش بوك", description: "دفتر رسم ورق مقوى مناسب لجميع أنواع الألوان",
    price: 65, originalPrice: 80, images: ["/assets/stores/12.webp"],
    sizes: ["A4", "A3"], availableSizes: ["A4", "A3"],
    colors: [{name: "أبيض", value: "#FFFFFF"}, {name: "كريمي", value: "#FEF3C7"}],
    rating: 4.6, reviews: 33, views: 201, likes: 89, orders: 26, category: "أدوات رسم",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 11005, storeId: 11, name: "ستاند رسم خشبي", description: "ستاند رسم من خشب الزان قابل للتعديل",
    price: 450, originalPrice: 550, images: ["/assets/stores/12.webp"],
    sizes: ["كبير"], availableSizes: ["كبير"],
    colors: [{name: "خشب طبيعي", value: "#8B4513"}],
    rating: 4.9, reviews: 9, views: 123, likes: 45, orders: 3, category: "أدوات رسم",
    quantity: 10, inStock: true, tags: []
  }
];
