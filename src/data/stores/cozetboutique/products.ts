import type { Product } from '../../storeProducts';

export const cozetboutiqueProducts: Product[] = [
  {
    id: 19001, storeId: 19, name: "حقيبة يد فاخرة", description: "حقيبة يد من الجلد الطبيعي بتصميم عصري فاخر",
    price: 485, originalPrice: 560, images: ["/assets/stores/20.webp"],
    sizes: ["صغير", "متوسط", "كبير"], availableSizes: ["متوسط", "كبير"],
    colors: [{name: "أسود", value: "#000000"}, {name: "بيج", value: "#D4A574"}, {name: "بني", value: "#8B4513"}],
    rating: 4.9, reviews: 16, views: 178, likes: 89, orders: 12, category: "حقائب مميزة",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 19002, storeId: 19, name: "إكسسوار شعر ذهبي", description: "مجموعة إكسسوارات شعر أنيقة مطلية بالذهب",
    price: 125, originalPrice: 150, images: ["/assets/stores/20.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "ذهبي", value: "#F59E0B"}, {name: "فضي", value: "#C0C0C0"}],
    rating: 4.7, reviews: 28, views: 234, likes: 123, orders: 21, category: "إكسسوارات فاخرة",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 19003, storeId: 19, name: "فستان سهرة فاخر", description: "فستان سهرة فاخر من أجود الأقمشة للمناسبات خاصة",
    price: 650, originalPrice: 750, images: ["/assets/stores/20.webp"],
    sizes: ["S", "M", "L", "XL"], availableSizes: ["M", "L"],
    colors: [{name: "أحمر عميق", value: "#7F1D1D"}, {name: "أزرق ملكي", value: "#1E3A8A"}, {name: "أسود", value: "#000000"}],
    rating: 4.9, reviews: 13, views: 145, likes: 67, orders: 10, category: "أزياء راقية",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 19004, storeId: 19, name: "عقد لؤلؤ طبيعي مطعم", description: "عقد من اللؤلؤ الطبيعي المطعم بالأحجار الكريمة",
    price: 850, originalPrice: 980, images: ["/assets/stores/20.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "لؤلؤي طبيعي", value: "#FEF3C7"}],
    rating: 4.9, reviews: 11, views: 134, likes: 54, orders: 8, category: "مجوهرات",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 19005, storeId: 19, name: "شنطة سفر أنيقة", description: "شنطة سفر أنيقة من الجلد مع تفاصيل معدنية فاخرة",
    price: 385, originalPrice: 450, images: ["/assets/stores/20.webp"],
    sizes: ["متوسط", "كبير"], availableSizes: ["متوسط", "كبير"],
    colors: [{name: "بني غامق", value: "#8B4513"}, {name: "أسود", value: "#000000"}],
    rating: 4.8, reviews: 24, views: 198, likes: 89, orders: 18, category: "حقائب مميزة",
    quantity: 10, inStock: true, tags: []
  }
];
