import type { Product } from '../../storeProducts';

export const eylulProducts: Product[] = [
  {
    id: 18001, storeId: 18, name: "فستان تركي مطرز", description: "فستان تركي أنيق بتطريز يدوي مميز",
    price: 285, originalPrice: 340, images: ["/assets/stores/19.webp"],
    sizes: ["S", "M", "L", "XL"], availableSizes: ["M", "L", "XL"],
    colors: [{name: "أزرق تركي", value: "#1E40AF"}, {name: "أحمر عتيق", value: "#DC2626"}],
    rating: 4.8, reviews: 22, views: 198, likes: 76, orders: 17, category: "أزياء تركية",
    quantity: 10, inStock: true, isAvailable: true, tags: []
  },
  {
    id: 18002, storeId: 18, name: "عباية تركية فاخرة", description: "عباية تركية من أجود الخامات بتصميم راقي",
    price: 385, originalPrice: 450, images: ["/assets/stores/19.webp"],
    sizes: ["S", "M", "L", "XL"], availableSizes: ["S", "M", "L"],
    colors: [{name: "أسود", value: "#000000"}, {name: "بني غامق", value: "#8B4513"}, {name: "أزرق داكن", value: "#1E3A8A"}],
    rating: 4.9, reviews: 18, views: 167, likes: 89, orders: 14, category: "أزياء تركية",
    quantity: 10, inStock: true, isAvailable: true, tags: []
  },
  {
    id: 18003, storeId: 18, name: "بلوزة قطنية عصرية", description: "بلوزة قطنية تركية بقصة عصرية أنيقة",
    price: 125, originalPrice: 150, images: ["/assets/stores/19.webp"],
    sizes: ["S", "M", "L", "XL"], availableSizes: ["M", "L", "XL"],
    colors: [{name: "أبيض", value: "#FFFFFF"}, {name: "وردي فاتح", value: "#F9A8D4"}],
    rating: 4.6, reviews: 29, views: 234, likes: 98, orders: 23, category: "ملابس نسائية",
    quantity: 10, inStock: true, isAvailable: true, tags: []
  },
  {
    id: 18004, storeId: 18, name: "طقم محجبات تركية", description: "مجموعة محجبات تركية فاخرة بتصاميم متنوعة",
    price: 185, originalPrice: 220, images: ["/assets/stores/19.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "متنوع", value: "#8B5CF6"}],
    rating: 4.7, reviews: 33, views: 267, likes: 123, orders: 28, category: "محجبات",
    quantity: 10, inStock: true, isAvailable: true, tags: []
  },
  {
    id: 18005, storeId: 18, name: "جاكيت تركي شتوي", description: "جاكيت شتوي تركي عالي الجودة مناسب للطقس البارد",
    price: 450, originalPrice: 520, images: ["/assets/stores/19.webp"],
    sizes: ["S", "M", "L", "XL"], availableSizes: ["M", "L"],
    colors: [{name: "رمادي غامق", value: "#374151"}, {name: "أسود", value: "#000000"}],
    rating: 4.8, reviews: 15, views: 145, likes: 67, orders: 11, category: "ملابس نسائية",
    quantity: 10, inStock: true, isAvailable: true, tags: []
  }
];
