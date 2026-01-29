// منتجات متجر نواعم - منتجات فريدة وحصرية
import type { Product } from '../../storeProducts';

// منتجات متجر نواعم (nawaem.ly) - storeId: 1
export const nawaemProducts: Product[] = [
  // المنتجات العادية (12 منتج)
  {
    id: 1001, storeId: 1, name: "فستان سهرة ذهبي راقي", description: "فستان سهرة فاخر باللون الذهبي مع تطريز يدوي مميز، مناسب للمناسبات الخاصة",
    price: 450, originalPrice: 530, images: ["/assets/nawaem/dress1.jpg"], 
    sizes: ["S", "M", "L", "XL"], availableSizes: ["S", "M", "L", "XL"], 
    colors: [
      {name: "ذهبي", value: "#F59E0B"}, 
      {name: "فضي", value: "#9CA3AF"}, 
      {name: "وردي ذهبي", value: "#F472B6"}
    ],
    rating: 4.9, reviews: 32, views: 567, likes: 312, orders: 156, category: "فساتين سهرة", 
    inStock: true, quantity: 10, tags: [], badge: ""
  },
  {
    id: 1002, storeId: 1, name: "فستان ماكسي عصري", description: "فستان ماكسي أنيق بأكمام طويلة وتصميم عصري مريح للاستخدام اليومي",
    price: 285, originalPrice: 385, images: ["/assets/nawaem/dress2.jpg"],
    sizes: ["S", "M", "L", "XL"], availableSizes: ["M", "L", "XL"],
    colors: [{name: "كحلي", value: "#1E3A8A"}, {name: "بني", value: "#8B4513"}, {name: "أخضر", value: "#16A34A"}],
    rating: 4.7, reviews: 28, views: 450, likes: 198, orders: 67, category: "فساتين يومية",
    inStock: true, quantity: 10, tags: [], badge: ""
  },
  {
    id: 1003, storeId: 1, name: "فستان أبيض وأسود راقي", description: "فستان راقي بتصميم كلاسيكي باللونين الأبيض والأسود، مثالي للمكتب والخروج",
    price: 425, originalPrice: 425, images: ["/assets/nawaem/dress3.jpg"],
    sizes: ["S", "M", "L"], availableSizes: ["S", "M", "L"],
    colors: [{name: "أبيض وأسود", value: "#000000"}],
    rating: 4.8, reviews: 24, views: 567, likes: 234, orders: 89, category: "فساتين رسمية",
    inStock: true, quantity: 10, tags: [], badge: ""
  },
  {
    id: 1004, storeId: 1, name: "فستان صيفي أنيق", description: "فستان صيفي خفيف ومريح بألوان هادئة وتصميم أنثوي راقي",
    price: 195, originalPrice: 295, images: ["/assets/nawaem/dress4.jpg"],
    sizes: ["S", "M", "L", "XL"], availableSizes: ["S", "M", "L"],
    colors: [{name: "أزرق فاتح", value: "#60A5FA"}, {name: "وردي فاتح", value: "#F9A8D4"}, {name: "أخضر فاتح", value: "#86EFAC"}],
    rating: 4.6, reviews: 21, views: 423, likes: 178, orders: 45, category: "فساتين صيفية",
    inStock: true, quantity: 10, tags: [], badge: ""
  },
  {
    id: 1005, storeId: 1, name: "فستان مناسبات مميز", description: "فستان راقي للمناسبات الخاصة بتصميم أنيق ولمسات ذهبية فاخرة",
    price: 465, originalPrice: 465, images: ["/assets/nawaem/dress5.jpg"],
    sizes: ["S", "M", "L"], availableSizes: ["M", "L"],
    colors: [{name: "أسود ذهبي", value: "#000000"}, {name: "كحلي ذهبي", value: "#1E3A8A"}],
    rating: 4.9, reviews: 18, views: 412, likes: 189, orders: 78, category: "فساتين مناسبات",
    inStock: true, quantity: 10, tags: [], badge: ""
  },
  {
    id: 1006, storeId: 1, name: "عباءة كاشمير فاخرة", description: "عباءة من الكاشمير الطبيعي بتصميم عصري وخامة فائقة النعومة",
    price: 675, originalPrice: 675, images: ["/assets/nawaem/abaya1.jpg"],
    sizes: ["S", "M", "L", "XL"], availableSizes: ["S", "M", "L", "XL"],
    colors: [{name: "بيج", value: "#D4A574"}, {name: "رمادي", value: "#6B7280"}, {name: "كحلي", value: "#1E3A8A"}],
    rating: 4.8, reviews: 26, views: 567, likes: 289, orders: 134, category: "عبايات فاخرة",
    inStock: true, quantity: 10, tags: [], badge: ""
  },
  {
    id: 1007, storeId: 1, name: "عباءة دبي الأصلية", description: "عباءة أصلية من دبي بتصميم راقي وخامة عالية الجودة",
    price: 545, originalPrice: 545, images: ["/assets/nawaem/abaya2.jpg"],
    sizes: ["S", "M", "L", "XL"], availableSizes: ["M", "L", "XL"],
    colors: [{name: "أسود", value: "#000000"}, {name: "كحلي", value: "#1E3A8A"}, {name: "بني", value: "#8B4513"}],
    rating: 4.7, reviews: 31, views: 489, likes: 267, orders: 123, category: "عبايات أصلية",
    inStock: true, quantity: 10, tags: [], badge: ""
  },
  {
    id: 1008, storeId: 1, name: "عباءة حرير طبيعي", description: "عباءة من الحرير الطبيعي بتصميم انسيابي أنيق ولمعة طبيعية مميزة",
    price: 595, originalPrice: 595, images: ["/assets/nawaem/abaya3.jpg"],
    sizes: ["S", "M", "L"], availableSizes: ["S", "M", "L"],
    colors: [{name: "أخضر زيتوني", value: "#65A30D"}, {name: "بني ذهبي", value: "#A16207"}],
    rating: 4.9, reviews: 19, views: 501, likes: 298, orders: 145, category: "عبايات حريرية",
    inStock: true, quantity: 10, tags: [], badge: ""
  },
  {
    id: 1009, storeId: 1, name: "حجاب حرير مطرز", description: "حجاب من الحرير الطبيعي مع تطريز يدوي راقي وألوان متدرجة جميلة",
    price: 125, originalPrice: 125, images: ["/assets/nawaem/hijab1.jpg"],
    sizes: ["110x110"], availableSizes: ["110x110"],
    colors: [{name: "زهري متدرج", value: "#F9A8D4"}, {name: "أزرق متدرج", value: "#93C5FD"}, {name: "أخضر متدرج", value: "#86EFAC"}],
    rating: 4.6, reviews: 45, views: 456, likes: 245, orders: 98, category: "حجاب حريري",
    inStock: true, quantity: 10, tags: [], badge: ""
  },
  {
    id: 1010, storeId: 1, name: "حجاب شيفون راقي", description: "حجاب من الشيفون الفاخر بملمس ناعم وألوان أنيقة مناسبة لجميع المناسبات",
    price: 85, originalPrice: 85, images: ["/assets/nawaem/hijab2.jpg"],
    sizes: ["100x180"], availableSizes: ["100x180"],
    colors: [{name: "كريمي", value: "#FEF3C7"}, {name: "وردي فاتح", value: "#FECACA"}, {name: "أزرق باستيل", value: "#DBEAFE"}],
    rating: 4.5, reviews: 52, views: 478, likes: 267, orders: 112, category: "حجاب شيفون",
    inStock: true, quantity: 10, tags: [], badge: ""
  },
  {
    id: 1011, storeId: 1, name: "حقيبة يد جلد طبيعي", description: "حقيبة يد فاخرة من الجلد الطبيعي بتصميم عصري وجودة عالية",
    price: 345, originalPrice: 345, images: ["/assets/nawaem/bag1.jpg"],
    sizes: ["متوسط"], availableSizes: ["متوسط"],
    colors: [{name: "بيج", value: "#D4A574"}, {name: "أسود", value: "#000000"}, {name: "بني", value: "#8B4513"}],
    rating: 4.7, reviews: 33, views: 523, likes: 278, orders: 134, category: "حقائب جلدية",
    inStock: true, quantity: 10, tags: [], badge: ""
  },
  {
    id: 1012, storeId: 1, name: "حقيبة كتف أنيقة", description: "حقيبة كتف عملية وأنيقة بتصميم عصري مناسبة للاستخدام اليومي",
    price: 275, originalPrice: 275, images: ["/assets/nawaem/bag2.jpg"],
    sizes: ["كبير"], availableSizes: ["كبير"],
    colors: [{name: "كريمي", value: "#FEF3C7"}, {name: "ذهبي", value: "#F59E0B"}],
    rating: 4.6, reviews: 29, views: 445, likes: 203, orders: 92, category: "حقائب كتف",
    inStock: true, quantity: 10, tags: [], badge: ""
  },

  // المنتجات المخفضة (3 منتجات)
  {
    id: 1013, storeId: 1, name: "حقيبة يد كلاسيكية", description: "حقيبة يد كلاسيكية بتصميم راقي ومقابض قوية، مثالية للمناسبات الرسمية",
    price: 245, originalPrice: 325, images: ["/assets/nawaem/bag3.jpg", "/assets/nawaem/bag3-green.jpg", "/assets/nawaem/bag3-black.jpg"],
    sizes: ["متوسط"], availableSizes: ["متوسط"],
    colors: [
      {name: "أخضر", value: "#16A34A"}, 
      {name: "أسود", value: "#000000"}
    ],
    rating: 4.5, reviews: 24, views: 412, likes: 189, orders: 78, category: "حقائب كلاسيكية",
    inStock: true, quantity: 10, tags: [], badge: ""
  },
  {
    id: 1014, storeId: 1, name: "حقيبة مبطنة فاخرة", description: "حقيبة فاخرة مبطنة بتصميم مميز وسلسلة ذهبية أنيقة",
    price: 195, originalPrice: 285, images: ["/assets/nawaem/bag4.jpg"],
    sizes: ["صغير"], availableSizes: ["صغير"],
    colors: [{name: "وردي فاتح", value: "#FECACA"}, {name: "أبيض", value: "#FFFFFF"}],
    rating: 4.4, reviews: 18, views: 423, likes: 167, orders: 67, category: "حقائب مبطنة",
    inStock: true, quantity: 10, tags: [], badge: ""
  },
  {
    id: 1015, storeId: 1, name: "حقيبة سلسلة ذهبية", description: "حقيبة أنيقة بسلسلة ذهبية وتصميم عصري، مناسبة للسهرات والمناسبات",
    price: 0, originalPrice: 235, images: ["/assets/nawaem/bag5.jpg", "/assets/nawaem/bag5-green.jpg", "/assets/nawaem/bag5-black.jpg"],
    sizes: ["صغير"], availableSizes: [],
    colors: [
      {name: "أخضر", value: "#16A34A"}, 
      {name: "أسود", value: "#000000"}
    ],
    rating: 4.3, reviews: 15, views: 389, likes: 145, orders: 61, category: "حقائب سهرة",
    quantity: 0, inStock: false, tags: ["غير متوفر"], badge: "غير متوفر"
  },

  // المنتجات الجديدة (7 منتجات)
  {
    id: 1016, storeId: 1, name: "فستان طفلة راقي", description: "فستان أنيق للطفلات بتصميم راقي وخامة مريحة، مناسب للمناسبات الخاصة",
    price: 185, originalPrice: 185, images: ["/assets/nawaem/kids1.jpg"],
    sizes: ["2-3", "4-5", "6-7", "8-9"], availableSizes: ["2-3", "4-5", "6-7", "8-9"],
    colors: [{name: "وردي", value: "#F9A8D4"}, {name: "أزرق فاتح", value: "#93C5FD"}],
    rating: 4.8, reviews: 22, views: 434, likes: 234, orders: 106, category: "ملابس أطفال",
    inStock: true, quantity: 10, tags: [], badge: ""
  },
  {
    id: 1017, storeId: 1, name: "عباءة طفلة عصرية", description: "عباءة عصرية للطفلات بتصميم مريح وألوان جميلة",
    price: 125, originalPrice: 125, images: ["/assets/nawaem/kids2.jpg"],
    sizes: ["4-5", "6-7", "8-9", "10-11"], availableSizes: ["4-5", "6-7", "8-9", "10-11"],
    colors: [{name: "زهري", value: "#F472B6"}, {name: "بنفسجي", value: "#A855F7"}],
    rating: 4.6, reviews: 18, views: 412, likes: 189, orders: 78, category: "عبايات أطفال",
    inStock: true, quantity: 10, tags: [], badge: ""
  },
  {
    id: 1018, storeId: 1, name: "فستان طفلة للعيد", description: "فستان خاص للعيد بتصميم احتفالي وألوان مبهجة",
    price: 165, originalPrice: 165, images: ["/assets/nawaem/kids3.jpg"],
    sizes: ["2-3", "4-5", "6-7"], availableSizes: ["2-3", "4-5", "6-7"],
    colors: [{name: "ذهبي", value: "#F59E0B"}, {name: "وردي ذهبي", value: "#F472B6"}],
    rating: 4.9, reviews: 25, views: 478, likes: 289, orders: 145, category: "ملابس عيد",
    inStock: true, quantity: 10, tags: [], badge: ""
  },
  {
    id: 1019, storeId: 1, name: "طقم طفلة كاجوال", description: "طقم كاجوال للطفلات مكون من بلوزة وبنطلون بتصميم عملي ومريح",
    price: 95, originalPrice: 95, images: ["/assets/nawaem/kids4.jpg"],
    sizes: ["2-3", "4-5", "6-7", "8-9"], availableSizes: ["2-3", "4-5", "6-7", "8-9"],
    colors: [{name: "وردي وأبيض", value: "#F9A8D4"}, {name: "أزرق وأبيض", value: "#93C5FD"}],
    rating: 4.5, reviews: 16, views: 423, likes: 167, orders: 67, category: "ملابس كاجوال",
    inStock: true, quantity: 10, tags: [], badge: ""
  },
  {
    id: 1020, storeId: 1, name: "فستان طفلة أزرق", description: "فستان أنيق باللون الأزرق الفاتح بتصميم أنثوي راقي للطفلات",
    price: 145, originalPrice: 145, images: ["/assets/nawaem/kids5.jpg"],
    sizes: ["4-5", "6-7", "8-9"], availableSizes: ["4-5", "6-7", "8-9"],
    colors: [{name: "أزرق فاتح", value: "#93C5FD"}, {name: "أبيض", value: "#FFFFFF"}],
    rating: 4.7, reviews: 19, views: 445, likes: 203, orders: 92, category: "فساتين أطفال",
    inStock: true, quantity: 10, tags: [], badge: ""
  },
  {
    id: 1021, storeId: 1, name: "طقم حجاب للطفلات", description: "طقم حجاب مخصص للطفلات بألوان جميلة وتصميم مريح",
    price: 75, originalPrice: 75, images: ["/assets/nawaem/kids6.jpg"],
    sizes: ["4-5", "6-7", "8-9", "10-11"], availableSizes: ["4-5", "6-7", "8-9", "10-11"],
    colors: [{name: "وردي", value: "#F9A8D4"}, {name: "أزرق", value: "#93C5FD"}, {name: "أخضر", value: "#86EFAC"}],
    rating: 4.4, reviews: 21, views: 412, likes: 189, orders: 78, category: "حجاب أطفال",
    inStock: true, quantity: 10, tags: [], badge: ""
  },
  {
    id: 1022, storeId: 1, name: "فستان طفلة فاخر", description: "فستان فاخر للطفلات بتطريز يدوي وتصميم راقي للمناسبات الخاصة",
    price: 0, originalPrice: 0, images: ["/assets/nawaem/kids5.jpg"],
    sizes: ["2-3", "4-5", "6-7"], availableSizes: [],
    colors: [{name: "أخضر فاتح", value: "#86EFAC"}, {name: "كريمي", value: "#FEF3C7"}],
    rating: 4.8, reviews: 14, views: 134, likes: 89, orders: 12, category: "فساتين فاخرة",
    quantity: 0, inStock: false, tags: ["غير متوفر"], badge: "غير متوفر"
  },
  {
    id: 1023, storeId: 1, name: "حذاء نسائي أنيق", description: "حذاء نسائي أنيق",
    price: 125, originalPrice: 135, images: ["/assets/nawaem/heels-pink-1.jpg", "/assets/nawaem/heels-elegant-1.jpg"],
    sizes: ["4-5", "6-7", "8-9", "10-11"], availableSizes: ["4-5", "6-7", "8-9", "10-11"],
    colors: [{name: "أبيض", value: "#ffffffff"}, {name: "أسود", value: "#020202ff"}],
    rating: 4.0, reviews: 31, views: 456, likes: 267, orders: 123, category: "أحذية نسائية",
    inStock: true, quantity: 10, tags: [], badge: ""
  },
  {
    id: 1024,
    storeId: 1,
    name: "بدلة تريكو أنيقة",
    description: "بدلة تريكو أنيقة",
    price: 195,
    originalPrice: 250,
    images: ["/assets/nawaem/triko1.webp", "/assets/nawaem/triko2.webp", "/assets/nawaem/triko3.webp", "/assets/nawaem/triko4.webp", "/assets/nawaem/triko5.webp"],
    sizes: ["S", "M", "L", "XL"],
    availableSizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "أزرق", value: "#12335fef" },
      { name: "رمادي", value: "#7d818bff" }
    ],
    rating: 4.8,
    reviews: 95,
    views: 445,
    likes: 203,
    orders: 92,
    category: "بدلة تريكو أنيقة",
    inStock: true,
    quantity: 10,
    tags: [],
    badge: ""
  }
];
