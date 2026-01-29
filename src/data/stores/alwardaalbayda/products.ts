import type { Product } from '../../storeProducts';

export const alwardaalbaydaProducts: Product[] = [
  {
    id: 16001, storeId: 16, name: "عطر ورد طبيعي فاخر", description: "عطر فاخر من الورد الطبيعي بعبير قوي ويدوم طويلاً",
    price: 285, originalPrice: 340, images: ["/assets/stores/17.webp"],
    sizes: ["50ml", "100ml"], availableSizes: ["50ml", "100ml"],
    colors: [{name: "وردي فاتح", value: "#F9A8D4"}],
    rating: 4.8, reviews: 31, views: 267, likes: 123, orders: 24, category: "عطور",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 16002, storeId: 16, name: "باقة ورود طبيعية", description: "باقة ورود حمراء طبيعية محفوظة بعناية لتدوم طويلاً",
    price: 125, originalPrice: 150, images: ["/assets/stores/17.webp"],
    sizes: ["12 وردة", "24 وردة"], availableSizes: ["12 وردة", "24 وردة"],
    colors: [{name: "أحمر", value: "#DC2626"}, {name: "وردي", value: "#EC4899"}, {name: "أبيض", value: "#FFFFFF"}],
    rating: 4.9, reviews: 42, views: 356, likes: 167, orders: 35, category: "ورود",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 16003, storeId: 16, name: "زيت ورد عضوي خالص", description: "زيت ورد عضوي خالص 100% للعناية بالبشرة والشعر",
    price: 185, originalPrice: 220, images: ["/assets/stores/17.webp"],
    sizes: ["30ml", "50ml"], availableSizes: ["30ml", "50ml"],
    colors: [{name: "طبيعي", value: "#FEF3C7"}],
    rating: 4.7, reviews: 26, views: 198, likes: 89, orders: 19, category: "زيوت طبيعية",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 16004, storeId: 16, name: "شموع عطرية بالورد", description: "مجموعة شموع عطرية بعبير الورد لأجواء رومانسية",
    price: 95, originalPrice: 120, images: ["/assets/stores/17.webp"],
    sizes: ["3 قطعة", "6 قطع"], availableSizes: ["3 قطعة", "6 قطع"],
    colors: [{name: "وردي", value: "#EC4899"}, {name: "أبيض", value: "#FFFFFF"}],
    rating: 4.6, reviews: 34, views: 245, likes: 112, orders: 27, category: "شموع",
    quantity: 10, inStock: true, tags: []
  },
  {
    id: 16005, storeId: 16, name: "عطر عود وورد فاخر", description: "عطر فاخر يجمع بين عبير العود والورد لعبير مميز يدوم طويلاً",
    price: 385, originalPrice: 450, images: ["/assets/stores/17.webp"],
    sizes: ["50ml", "100ml"], availableSizes: ["100ml"],
    colors: [{name: "ذهبي غامق", value: "#A16207"}],
    rating: 4.9, reviews: 18, views: 156, likes: 76, orders: 14, category: "عطور",
    quantity: 10, inStock: true, tags: []
  }
];
