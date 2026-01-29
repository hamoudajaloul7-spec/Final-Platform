// منتجات ماجنا بيوتي (magna-beauty.com) - storeId: 5
import type { Product } from '../../storeProducts';

const magnaBeautyProducts: Product[] = [
  {
    id: 4001, storeId: 5, name: "PINK PUFF", description: "PINK PUFF",
    price: 10, originalPrice: 12, images: ["/assets/magna-beauty/pink-puff.webp","/assets/magna-beauty/pink-puff1.webp","/assets/magna-beauty/pink-puff2.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "وردي", value: "#e2ababff"}, {name: "بيج", value: "#DEB887"}, {name: "أسود", value: "#0e0d0dff"}],
    rating: 4.9, reviews: 70, views: 298, likes: 300, orders: 200, category: "مكياج",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
  {
    id: 4002, storeId: 5, name: "blush-brush", description: "blush-brush",
    price: 25, originalPrice: 45, images: ["/assets/magna-beauty/blush-brush1.webp","/assets/magna-beauty/blush-brush2.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "وردي", value: "#ffc6c6ff"}],
    rating: 4.9, reviews: 88, views: 456, likes: 500, orders: 300, category: "مكياج",
    inStock: true, quantity: 10, tags: ["أكثر طلباً"], badge: "أكثر طلباً"
  },
  {
    id: 4003, storeId: 5, name: "shader-brush", description: "shader-brush",
    price: 15, originalPrice: 30, images: ["/assets/magna-beauty/shader-brush.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "بني", value: "#8B4513"}],
    rating: 4.8, reviews: 70, views: 312, likes: 460, orders: 214, category: "مكياج",
    inStock: true, quantity: 10, tags: ["أكثر مبيعاً"], badge: "أكثر مبيعاً"
  },
  {
    id: 4004, storeId: 5, name: "foundation-brush", description: "foundation-brush",
    price: 25, originalPrice: 40, images: ["/assets/magna-beauty/foundation-brush.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "ألوان دافئة", value: "#e6cab6ff"}],
    rating: 4.9, reviews: 44, views: 240, likes: 260, orders: 180, category: "مكياج",
    inStock: true, quantity: 10, tags: ["جديد"], badge: "جديد"
  },
  {
    id: 4005, storeId: 5, name: "fan-brush", description: "fan-brush",
    price: 25, originalPrice: 40, images: ["/assets/magna-beauty/fan-brush.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "طبيعي", value: "#F5F5DC"}],
    rating: 4.7, reviews: 52, views: 367, likes: 145, orders: 38, category: "عناية بالبشرة",
    inStock: true, quantity: 10, tags: ["أكثر مشاهدة"], badge: "أكثر مشاهدة"
  },
  {
    id: 4006, storeId: 5, name: "eye-contour", description: "eye-contour",
    price: 15, originalPrice: 25, images: ["/assets/magna-beauty/eye-contour.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "طبيعي", value: "#FFF8DC"}],
    rating: 4.8, reviews: 28, views: 234, likes: 98, orders: 21, category: "عناية بالبشرة",
    inStock: true, quantity: 10, tags: ["تخفيضات"], badge: "تخفيضات"
  },
  {
    id: 4007, storeId: 5, name: "eyebrow-brush", description: "eyebrow-brush",
    price: 25, originalPrice: 40, images: ["/assets/magna-beauty/eyebrow-brush.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "طبيعي", value: "#F0F8FF"}],
    rating: 4.5, reviews: 39, views: 287, likes: 112, orders: 70, category: "عناية بالبشرة",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
  {
    id: 4008, storeId: 5, name: "eyeliner-brush", description: "eyeliner-brush",
    price: 25, originalPrice: 40, images: ["/assets/magna-beauty/eyeliner-brush.webp"],
    sizes: ["واحدة"], availableSizes: ["واحدة"],
    colors: [{name: "طبيعي", value: "#F0F8FF"}],
    rating: 4.9, reviews: 19, views: 167, likes: 89, orders: 44, category: "عطور",
    inStock: true, quantity: 10, tags: ["جديد"], badge: "جديد"
  },
  {
    id: 4009, storeId: 5, name: "POSE", description: "POSE",
    price: 25, originalPrice: 40, images: ["/assets/magna-beauty/POSE.webp"],
    sizes: ["واحدة"], availableSizes: ["واحدة"],
    colors: [{name: "طبيعي", value: "#F5E6D3"}],
    rating: 4.6, reviews: 33, views: 245, likes: 87, orders: 45, category: "عناية بالبشرة",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
  {
    id: 4010, storeId: 5, name: "ANGEL", description: "ANGEL",
    price: 25, originalPrice: 40, images: ["/assets/magna-beauty/ANGEL.webp"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "فاتح", value: "#FFEAA7"}],
    rating: 4.7, reviews: 26, views: 198, likes: 76, orders: 54, category: "مكياج",
    inStock: true, quantity: 10, tags: ["أكثر طلباً"], badge: "أكثر طلباً"
  },
  {
    id: 4011, storeId: 5, name: "GEM", description: "GEM",
    price: 25, originalPrice: 40, images: ["/assets/magna-beauty/GEM.jpeg"],
    sizes: ["واحدة"], availableSizes: ["واحدة"],
    colors: [{name: "طبيعي", value: "#F5E6D3"}],
    rating: 4.9, reviews: 37, views: 245, likes: 67, orders: 69, category: "عناية بالبشرة",
    inStock: true, quantity: 10, tags: ["أكثر إعجاباً"], badge: "أكثر إعجاباً"
  },
  {
    id: 4012, storeId: 5, name: "MEL", description: "MEL",
    price: 75, originalPrice: 95, images: ["/assets/magna-beauty/MEL.jpeg","/assets/magna-beauty/MEL1.webp"],
    sizes: ["واحدة"], availableSizes: ["واحدة"],
    colors: [{name: "طبيعي", value: "#F5E6D3"}],
    rating: 4.8, reviews: 35, views: 280, likes: 120, orders: 90, category: "عناية بالبشرة",
    inStock: true, quantity: 10, tags: ["أكثر مبيعاً"], badge: "أكثر مبيعاً"
  },
  {
    id: 4013, storeId: 5, name: "ICY1", description: "ICY1",
    price: 75, originalPrice: 95, images: ["/assets/magna-beauty/ICY1.jpeg"],
    sizes: ["واحدة"], availableSizes: ["واحدة"],
    colors: [{name: "طبيعي", value: "#F5E6D3"}],
    rating: 4.9, reviews: 12, views: 130, likes: 55, orders: 102, category: "عناية بالبشرة",
    inStock: true, quantity: 10, tags: ["جديد"], badge: "جديد"
  },
  {
    id: 4014, storeId: 5, name: "TOPAZ", description: "TOPAZ",
    price: 75, originalPrice: 95, images: ["/assets/magna-beauty/TOPAZ1.jpeg","/assets/magna-beauty/TOPAZ2.webp"],
    sizes: ["واحدة"], availableSizes: ["واحدة"],
    colors: [{name: "طبيعي", value: "#F5E6D3"}],
    rating: 4.7, reviews: 48, views: 600, likes: 355, orders: 250, category: "عناية بالبشرة",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  }
];

export { magnaBeautyProducts };
