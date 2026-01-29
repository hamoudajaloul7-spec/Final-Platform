// منتجات متجر دلتا ستور - منتجات فريدة وحصرية
import type { Product } from '../../storeProducts';

// منتجات متجر دلتا ستور (delta-store) - storeId: 4
export const deltaProducts: Product[] = [
  {
    id: 10001, storeId: 4, name: "شاربه SILV", description: "وشاح حريري فاخر بتصميم أنيق وعصري",
    price: 45, originalPrice: 65, images: ["/assets/delta/SILV.webp"],
    sizes: ["S", "M", "L", "XL", "2XL"], availableSizes: ["S", "M", "L", "XL"],
    colors: [{name: "بيج", value: "#D4A574"}, {name: "وردي فاتح", value: "#F9A8D4"}, {name: "أزرق سماوي", value: "#87CEEB"}],
    rating: 4, reviews: 45, views: 567, likes: 289, orders: 156, category: "منتجات فريدة",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
  {
    id: 10002, storeId: 4, name: "بلوزة بيج طويلة بحزام بني", description: "بلوزة بيج طويلة بحزام بني",
    price: 185, originalPrice: 215, images: ["/assets/delta/bege.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "أسود", value: "#000000"}, {name: "كحلي", value: "#1E3A8A"}, {name: "رمادي", value: "#6B7280"}],
    rating: 4, reviews: 32, views: 423, likes: 189, orders: 78, category: "منتجات فريدة",
    inStock: true, quantity: 10, tags: ["جديد"], badge: "جديد"
  },
  {
    id: 10003, storeId: 4, name: "قفطان صيفي أمبلس خفيف", description: "قفطان صيفي أمبلس خفيف",
    price: 135, originalPrice: 165, images: ["/assets/delta/summer3.webp", "/assets/delta/summer2.webp", "/assets/delta/summer1.webp"],
    sizes: ["صغير", "متوسط"], availableSizes: ["صغير", "متوسط"],
    colors: [{name: "ذهبي", value: "#F59E0B"}, {name: "فضي", value: "#C0C0C0"}, {name: "أسود", value: "#000000"}],
    rating: 4, reviews: 38, views: 456, likes: 234, orders: 98, category: "منتجات فريدة",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
  {
    id: 10004, storeId: 4, name:" قفطان بألوان جذابة", description: "قفطان بألوان جذابة",
    price: 150, originalPrice: 185, images: ["/assets/delta/dress1.webp", "/assets/delta/dress2.webp", "/assets/delta/dress3.webp", "/assets/delta/dress4.webp", "/assets/delta/dress5.webp"],
    sizes: ["S", "M", "L", "XL", "2XL"], availableSizes: ["S", "M", "L", "XL"],
    colors: [{name: "بنفسجي", value: "#9e74afff"}, {name: "أزرق سماوي", value: "#7f70d8ff"}, {name: "أحمر داكن", value: "#862c20ff"}, {name: "أخضر نيروزي", value: "#3a917bff"}, {name: "اسود مدرج رمادي", value: "#76a2beff"}],
    rating: 4, reviews: 38, views: 501, likes: 298, orders: 145, category: "منتجات فريدة",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
  {
    id: 10005, storeId: 4, name: "بدلة أنيقة Bourjois ", description: "بدلة أنيقة Bourjois ",
    price: 85, originalPrice: 100, images: ["/assets/delta/bourjois.webp"],
    sizes: ["S", "M", "L", "XL", "2XL"], availableSizes: ["S", "M", "L", "XL"],
    colors: [{name: "وردي", value: "#e2b4b4ff"}],
    rating: 4, reviews: 41, views: 423, likes: 267, orders: 112, category: "منتجات فريدة",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
  {
    id: 10006, storeId: 4, name: "حقيبة مناسبات شفافة", description: "حقيبة مناسبات شفافة",
    price: 130, originalPrice: 165, images: ["/assets/delta/bagtrans.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "أبيض شفاف", value: "#ece4e4ff"}],
    rating: 3.5, reviews: 50, views: 478, likes: 345, orders: 67, category: "منتجات فريدة",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
   {
    id: 10007, storeId: 4, name: "شبشب كعب نص رقبة", description: "شبشب كعب نص رقبة",
    price: 125, originalPrice: 145, images: ["/assets/delta/shoes1.webp", "/assets/delta/shoes2.webp", "/assets/delta/shoes3.webp", "/assets/delta/shoes4.webp"],
    sizes: ["35", "36", "37", "38", "39", "40", "41"], availableSizes: ["35", "36", "37", "38", "39", "40", "41"],
    colors: [{name: "أبيض", value: "#fffcfcff"}, {name: "أسود", value: "#080808ff"}, {name: "وردي", value: "#e2b4b4ff"}, {name: "بنفسجي", value: "#7e75ccff"}],
    rating: 2.5, reviews: 41, views: 423, likes: 189, orders: 78, category: "منتجات فريدة",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
     {
    id: 10008, storeId: 4, name: "حقيبة مناسبات أنيقة", description: "حقيبة مناسبات أنيقة",
    price: 125, originalPrice: 145, images: ["/assets/delta/bag1.webp", "/assets/delta/bag2.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "أسود", value: "#080808ff"}, {name: "وردي", value: "#e2b4b4ff"}],
    rating: 3.5, reviews: 70, views: 489, likes: 267, orders: 123, category: "منتجات فريدة",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
   {
    id: 10009, storeId: 4, name: "حقيبة Chic 5nd", description: "حقيبة Chic 5nd",
    price: 100, originalPrice: 130, images: ["/assets/delta/Chic1.webp", "/assets/delta/Chic2.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "أبيض شفاف", value: "#ece4e4ff"}, {name: "أبيض شفاف", value: "#111111ff"}],
    rating: 4.5, reviews: 66, views: 456, likes: 267, orders: 123, category: "منتجات فريدة",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
   {
    id: 10010, storeId: 4, name: "شبشب جلد Details", description: "شبشب جلد Details",
    price: 140, originalPrice: 175, images: ["/assets/delta/Details.jpeg", "/assets/delta/Details1.webp", "/assets/delta/Details2.jpeg", "/assets/delta/Details3.webp", "/assets/delta/Details4.webp"],
    sizes: ["36", "37", "38", "39", "40", "41"], availableSizes: ["36", "37", "38", "39", "40", "41"],
    colors: [{name: "بني", value: "#c27a1dda"}, {name: "نمري", value: "#0e0d0d88"}, {name: "أسود", value: "#0e0d0dff"}, {name: "أبيض", value: "#efeff3ff"}, {name: "وردي", value: "#e08db0ff"}],
    rating: 3, reviews: 41, views: 423, likes: 167, orders: 67, category: "منتجات فريدة",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
     {
    id: 10012, storeId: 4, name: "شبشب سهريهClaire ", description: "شبشب سهريهClaire ",
    price: 145, originalPrice: 165, images: ["/assets/delta/sandal.jpeg", "/assets/delta/sandal1.jpeg", "/assets/delta/sandal2.jpeg", "/assets/delta/sandal3.jpeg"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "وردي", value: "#f3acacff"}, {name: "أخضر", value: "#28962dff"}, {name: "نيروزي", value: "#36927bff"}, {name: "بيج", value: "#ddd6c3ff"}],
    rating: 5, reviews: 66, views: 523, likes: 312, orders: 167, category: "منتجات فريدة",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
      {
    id: 10013, storeId: 4, name: "بدلة XXL", description: "بدلة XXL",
    price: 300, originalPrice: 380, images: ["/assets/delta/xxl.webp", "/assets/delta/xxl1.webp", "/assets/delta/xxl2.webp"],
    sizes: ["XL", "2XL", "3XL", "4XL"], availableSizes: ["XL", "2XL", "3XL", "4XL"],
    colors: [{name: "أسود", value: "#0c0c0cff"}, {name: "وردي", value: "#b38c8cff"}, {name: "عنابي", value: "#aa2d80ff"}],
    rating: 2.5, reviews: 40, views: 423, likes: 178, orders: 67, category: "منتجات فريدة",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
   {
    id: 10014, storeId: 4, name: "بدلة جينز طويلة بأكمام Wrangler", description: "بدلة جينز طويلة بأكمام Wrangler",
    price: 360, originalPrice: 480, images: ["/assets/delta/wrangler.webp", "/assets/delta/wrangler2.webp"],
    sizes: ["XL", "2XL", "3XL", "4XL"], availableSizes: ["XL", "2XL", "3XL", "4XL"],
    colors: [{name: "أزرق", value: "#3563e4da"}, {name: "أزرق داكن", value: "#1215c0da"}],
    rating: 3, reviews: 60, views: 501, likes: 298, orders: 145, category: "منتجات فريدة",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
     {
    id: 10015, storeId: 4, name: "بلوزة بيضاء Mango", description: "بلوزة بيضاء Mango",
    price: 480, originalPrice: 510, images: ["/assets/delta/mango.webp"],
    sizes: ["XL", "2XL", "3XL", "4XL"], availableSizes: ["XL", "2XL", "3XL", "4XL"],
    colors: [{name: "أبيض", value: "#f5f2f2ff"}],
    rating: 3.5, reviews: 80, views: 567, likes: 312, orders: 156, category: "منتجات فريدة",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
     {
    id: 10016, storeId: 4, name: "بوركيني Samara", description: "بوركيني Samara",
    price: 200, originalPrice: 215, images: ["/assets/delta/burkini1.webp", "/assets/delta/burkini2.webp", "/assets/delta/burkini3.webp"],
    sizes: ["XL", "2XL", "3XL", "4XL"], availableSizes: ["S", "M", "L", "XL"],
    colors: [{name: "أزرق", value: "#3563e4da"}, {name: "احمر", value: "#c01212da"}, {name: "بني", value: "#742222da"}],
    rating: 4.5, reviews: 40, views: 423, likes: 245, orders: 112, category: "منتجات فريدة",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
     {
    id: 10017, storeId: 4, name: "حقيبة بحر Vibes", description: "حقيبة بحر Vibes",
    price: 200, originalPrice: 220, images: ["/assets/delta/vibes1.webp","/assets/delta/vibes2.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "وردي", value: "#f5afafda"}, {name: "أبيض", value: "#fffbfbda"}],
    rating: 5, reviews: 180, views: 512, likes: 301, orders: 167, category: "منتجات فريدة",
    quantity: 10, inStock: true, tags: []
  },
];
