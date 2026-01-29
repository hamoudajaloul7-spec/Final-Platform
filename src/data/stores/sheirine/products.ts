// منتجات متجر شيرين
import type { Product } from '../../storeProducts';

export const sheirineProducts: Product[] = [
  // مجوهرات (10 منتجات)
  {
    id: 2001, storeId: 2, name: "خاتم خطوبة أنيق", description: "خاتم خطوبة فاخر مرصع بألماس مصنع",
    price: 185, originalPrice: 230, images: ["/assets/sheirine/engagement-ring-1.jpg"],
    sizes: ["6", "7", "8", "9"], availableSizes: ["7", "8", "9"],
    colors: [
      {name: "فضي", value: "#8f8f8fff"}
    ],
    rating: 4.9, reviews: 120, views: 240, likes: 420, orders: 320, category: "المجوهرات",
    inStock: true, quantity: 10, tags: ["أكثر مبيعاً"], badge: "أكثر مبيعاً"
  },
  {
    id: 2002, storeId: 2, name: "طقم مجوهرات ذهبية", description: "طقم مجوهرات ذهبية كامل يتكون من عقد وأقراط وحلق",
    price: 260, originalPrice: 275, images: ["/assets/sheirine/jewelry-set-2.jpg"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "ذهب أصفر", value: "#F59E0B"}, {name: "ذهب أبيض", value: "#F8F8FF"}],
    rating: 4.8, reviews: 32, views: 423, likes: 189, orders: 26, category: "المجوهرات",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
  {
    id: 2003, storeId: 2, name: "سوار ألماس تنس", description: "سوار أنيق فاخر من النحاس والزركونيا",
    price: 175, originalPrice: 235, images: ["/assets/sheirine/jewelry-set-3.jpg"],
    sizes: ["صغير", "متوسط", "كبير"], availableSizes: ["متوسط", "كبير"],
    colors: [{name: "ذهب أبيض", value: "#F8F8FF"}, {name: "ذهب أصفر", value: "#F59E0B"}],
    rating: 4.9, reviews: 28, views: 345, likes: 156, orders: 22, category: "أساور",
    inStock: true, quantity: 10, tags: ["مميزة", "أكثر إعجاباً"], badge: "أكثر إعجاباً"
  },
  {
    id: 2004, storeId: 2, name: "عقد لؤلؤ طبيعي", description: "عقد من اللؤلؤ الطبيعي عيار AAA بتصميم كلاسيكي أنيق",
    price: 345, originalPrice: 380, images: ["/assets/sheirine/necklace-loulou.jpg"],
    sizes: ["قصير", "طويل"], availableSizes: ["قصير", "طويل"],
    colors: [{name: "لؤلؤ أبيض", value: "#F8F8FF"}, {name: "لؤلؤ كريمي", value: "#FEF3C7"}],
    rating: 4.7, reviews: 41, views: 389, likes: 167, orders: 33, category: "عقود",
    inStock: true, quantity: 10, tags: ["أكثر طلباً"], badge: "أكثر طلباً"
  },
  {
    id: 2005, storeId: 2, name: "أقراط متدلية أنيقة", description: "أقراط متدلية أنيقة",
    price: 260, originalPrice: 325, images: ["/assets/sheirine/SHEIN-VCAY.jpg"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "ذهب أبيض", value: "#F8F8FF"}, {name: "ذهب وردي", value: "#F472B6"}],
    rating: 4.8, reviews: 37, views: 298, likes: 134, orders: 29, category: "أقراط",
    inStock: true, quantity: 10, tags: ["جديد"], badge: "جديد"
  },
  {
    id: 2006, storeId: 2, name: "خاتم زواج ألماس", description: "خاتم زواج فاخر مرصع بألماس طبيعي بتصميم كلاسيكي",
    price: 380, originalPrice: 435, images: ["/assets/sheirine/ring2.jpg"],
    sizes: ["5", "6", "7", "8", "9"], availableSizes: ["6", "7", "8"],
    colors: [{name: "ذهب أصفر", value: "#F59E0B"}, {name: "ذهب أبيض", value: "#F8F8FF"}],
    rating: 4.9, reviews: 19, views: 267, likes: 145, orders: 16, category: "خواتم زواج",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
  {
    id: 2007, storeId: 2, name: "طقم مطلية بالذهب والفيروز الأزرق", description: "طقم مطلية بالذهب والفيروز الأزرق",
    price: 310, originalPrice: 375, images: ["/assets/sheirine/23.jpeg","/assets/sheirine/24.webp"],
    sizes: ["45cm", "50cm", "55cm"], availableSizes: ["45cm", "50cm"],
    colors: [{name: "ذهب أصفر", value: "#F59E0B"}, {name: "ذهب أبيض", value: "#F8F8FF"}],
    rating: 4.6, reviews: 52, views: 445, likes: 198, orders: 41, category: "سلاسل",
    inStock: true, quantity: 10, tags: ["تخفيضات"], badge: "تخفيضات"
  },
  {
    id: 2008, storeId: 2, name: "أقراط متدلية براقة حجر الراين", description: "أقراط متدلية براقة حجر الراين",
    price: 25, originalPrice: 35, images: ["/assets/sheirine/sparkly.jpeg","/assets/sheirine/sparkly2.jpeg"],
    sizes: ["واحد"], availableSizes: ["واحد"],
    colors: [{name: "ذهب أصفر", value: "#F59E0B"}, {name: "ذهب أبيض", value: "#F8F8FF"}],
    rating: 4.7, reviews: 38, views: 312, likes: 145, orders: 28, category: "حلق",
    inStock: true, quantity: 10, tags: ["أكثر إعجاباً"], badge: "أكثر إعجاباً"
  },
  {
    id: 2009, storeId: 2, name: "أقراط نمط عتيق شكل سبيكة", description: "أقراط نمط عتيق شكل سبيكة",
    price: 45, originalPrice: 68, images: ["/assets/sheirine/antique.jpeg","/assets/sheirine/antique2.jpeg"],
    sizes: ["صغير", "متوسط"], availableSizes: ["صغير", "متوسط"],
    colors: [{name: "ذهبي", value: "#f1a014ff"}, {name: "فضي", value: "#C0C0C0"}],
    rating: 4.5, reviews: 29, views: 234, likes: 98, orders: 22, category: "بروش",
    inStock: true, quantity: 10, tags: ["جديد"], badge: "جديد"
  },
  {
    id: 2010, storeId: 2, name: "علبة مجوهرات مع ساعة", description: "علبة مجوهرات مع ساعة",
    price: 145, originalPrice: 180, images: ["/assets/sheirine/jewelry-box.webp"],
    sizes: ["صغير"], availableSizes: ["صغير"],
    colors: [{name: "فضي", value: "#C0C0C0"}],
    rating: 4.2, reviews: 40, views: 80, likes: 120, orders: 30, category: "مجوهرات نسائية",
    inStock: true, quantity: 10, tags: ["أكثر طلباً"], badge: "أكثر طلباً"
  },
  {
    id: 2011, storeId: 2, name: "خاتم فضة عيار 925", description: "خاتم من الفضة الخالصة عيار 925 بتصميم عصري أنيق",
    price: 120, originalPrice: 180, images: ["/assets/sheirine/ring6.jpg"],
    sizes: ["6", "7", "8", "9"], availableSizes: ["7", "8", "9"],
    colors: [{name: "فضي", value: "#C0C0C0"}],
    rating: 4.1, reviews: 34, views: 130, likes: 210, orders: 80, category: "خواتم فضة",
    inStock: true, quantity: 10, tags: ["أكثر إعجاباً"], badge: "أكثر إعجاباً"
  },
  {
    id: 2012, storeId: 2, name: "عقد زركون مطلي", description: "عقد زركون مطلي",
    price: 220, originalPrice: 275, images: ["/assets/sheirine/jewelry-set-1.jpg"],
    sizes: ["قصير"], availableSizes: ["قصير"],
    colors: [{name: "أسود", value: "#121213ff"}],
    rating: 4.8, reviews: 50, views: 360, likes: 355, orders: 210, category: "المجوهرات",
    inStock: true, quantity: 10, tags: ["تخفيضات"], badge: "تخفيضات"
  },
  {
    id: 1065, storeId: 2, name: "SHEIN SXY زوج من الأقراط الحديثة مصنوعة يدويًا", description: "زوج من الأقراط الحديثة مصنوعة يدويًا",
    price: 0, originalPrice: 0, images: ["/assets/sheirine/SHEIN SXY.jpg"],
    sizes: [], availableSizes: [],
    colors: [],
    rating: 0, reviews: 0, views: 3, likes: 0, orders: 1, category: "أقراط",
    quantity: 0, inStock: false, tags: ["غير متوفر"], badge: "غير متوفر"
  },

  // ملابس أحجام كبيرة (10 منتجات)
  {
    id: 2013, storeId: 2, name: "فستان طباعة الأزهار بكم واحد", description: "فستان طباعة الأزهار بكم واحد",
    price: 450, originalPrice: 520, images: ["/assets/sheirine/image1.jpeg","/assets/sheirine/image2.jpg","/assets/sheirine/image3.jpg"],
    sizes: ["SX", "S", "M", "L", "XL", "2XL", "3XL", "4XL"], availableSizes: ["L", "XL", "2XL", "3XL"],
    colors: [{name: "أزرق ملكي", value: "#1b0c50ff"}, {name: "أسود", value: "#0a0a0aff"}, {name: "أخضر", value: "#096d12ff"}],
    rating: 4.7, reviews: 38, views: 423, likes: 189, orders: 32, category: "ملابس للمناسبات أحجام كبيرة",
    inStock: true, quantity: 10, tags: ["أكثر طلباً"], badge: "أكثر طلباً"
  },
  {
    id: 2014, storeId: 2, name: "فستان ماكسي كتف واحد فتحة للفخذ حزام ترتر", description: "فستان ماكسي كتف واحد فتحة للفخذ حزام ترتر",
    price: 470, originalPrice: 560, images: ["/assets/sheirine/image4.jpeg"],
    sizes: ["SX", "S", "M", "L", "XL", "2XL", "3XL", "4XL"], availableSizes: ["M", "L", "XL", "2XL"],
    colors: [{name: "أسود", value: "#0c0c0cff"}],
    rating: 4.2, reviews: 60, views: 160, likes: 255, orders: 120, category: "ملابس للمناسبات أحجام كبيرة",
    inStock: true, quantity: 10, tags: ["جديد"], badge: "جديد"
  },
  {
    id: 2015, storeId: 2, name: "سروال بساق واسع من الاسفل", description: "سروال بساق واسع من الاسفل",
    price: 185, originalPrice: 210, images: ["/assets/sheirine/image5.jpg"],
    sizes: ["SX", "S", "M", "L", "XL", "2XL", "3XL", "4XL"], availableSizes: ["L", "XL", "2XL"],
    colors: [{name: "أسود", value: "#000000"}],
    rating: 4.0, reviews: 30, views: 99, likes: 100, orders: 43, category: "ملابس للمناسبات أحجام كبيرة",
    inStock: true, quantity: 10, tags: ["أكثر مشاهدة"], badge: "أكثر مشاهدة"
  },
  {
    id: 2016, storeId: 2, name: "فستان دانتيل اكمام منتفضة", description: "فستان دانتيل اكمام منتفضة",
    price: 685, originalPrice: 730, images: ["/assets/sheirine/image6.jpg","/assets/sheirine/image7.jpg"],
    sizes: ["SX", "S", "M", "L", "XL", "2XL", "3XL", "4XL"], availableSizes: ["XL", "2XL", "3XL"],
    colors: [{name: "أبيض", value: "#fffbfbff"}],
    rating: 4.9, reviews: 120, views: 130, likes: 240, orders: 87, category: "ملابس للمناسبات أحجام كبيرة",
    inStock: true, quantity: 10, tags: ["أكثر مبيعاً"], badge: "أكثر مبيعاً"
  },
  {
    id: 2017, storeId: 2, name: " فستان  مكشوف الكتف دانتيل", description: " فستان  مكشوف الكتف دانتيل",
    price: 625, originalPrice: 745, images: ["/assets/sheirine/image8.jpeg"],
    sizes: ["SX", "S", "M", "L", "XL", "2XL", "3XL", "4XL"], availableSizes: ["L", "XL", "2XL", "3XL"],
    colors: [{name: "أزرق ملكي", value: "#130f53ff"}],
    rating: 4.7, reviews: 66, views: 156, likes: 217, orders: 111, category: "ملابس للمناسبات أحجام كبيرة",
    inStock: true, quantity: 10, tags: ["تخفيضات"], badge: "تخفيضات"
  },
  {
    id: 2018, storeId: 2, name: " تنورة خصرعالي فتحة للفخذ بترتر", description: " تنورة خصرعالي فتحة للفخذ بترتر",
    price: 225, originalPrice: 280, images: ["/assets/sheirine/image10.jpeg","/assets/sheirine/image9.jpeg"],
    sizes: ["SX", "S", "M", "L", "XL", "2XL", "3XL", "4XL"], availableSizes: ["M", "L", "XL"],
    colors: [{name: "فضي", value: "#747272ff"}],
    rating: 4.7, reviews: 70, views: 188, likes: 250, orders: 218, category: "ملابس للمناسبات أحجام كبيرة",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
  {
    id: 2019, storeId: 2, name: "بلوزة بترتر", description: "بلوزة بترتر",
    price: 520, originalPrice: 620, images: ["/assets/sheirine/image11.jpeg","/assets/sheirine/image12.jpeg","/assets/sheirine/image13.jpeg"],
    sizes: ["SX", "S", "M", "L", "XL", "2XL", "3XL", "4XL"], availableSizes: ["L", "XL", "2XL", "3XL", "4XL"],
    colors: [{name: "ذهبي", value: "#e4d72cb4"}],
    rating: 4.8, reviews: 60, views: 310, likes: 380, orders: 200, category: "ملابس للمناسبات أحجام كبيرة",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
  {
    id: 2020, storeId: 2, name: "توب شفاف", description: " توب شفاف",
    price: 285, originalPrice: 340, images: ["/assets/sheirine/image15.jpeg","/assets/sheirine/image14.jpeg"],
    sizes: ["SX", "S", "M", "L", "XL", "2XL", "3XL", "4XL"], availableSizes: ["S", "M", "L", "XL", "2XL"],
    colors: [{name: "أسود", value: "#0f0f0fff"}],
    rating: 4.9, reviews: 145, views: 420, likes: 300, orders: 240, category: "ملابس للمناسبات أحجام كبيرة",
    inStock: true, quantity: 10, tags: ["أكثر مبيعاً"], badge: "أكثر مبيعاً"
  },
  {
    id: 2021, storeId: 2, name: "فستان بحزام أكمام فانوس حافة مكشكشة", description: "فستان بحزام أكمام فانوس حافة مكشكشة",
    price: 485, originalPrice: 560, images: ["/assets/sheirine/image16.jpeg","/assets/sheirine/image17.jpeg","/assets/sheirine/image18.jpeg","/assets/sheirine/image19.jpeg"],
    sizes: ["SX", "S", "M", "L", "XL", "2XL", "3XL", "4XL"], availableSizes: ["M", "L", "XL", "2XL"],
    colors: [{name: "أزرق فاتح", value: "#60A5FA"}, {name: "وردي", value: "#EC4899"}, {name: "أصفر", value: "#FDE047"}, {name: "بنفسجي", value: "#7a2a99ff"}],
    rating: 4.6, reviews: 60, views: 267, likes: 112, orders: 190, category: "ملابس للمناسبات أحجام كبيرة",
    inStock: true, quantity: 10, tags: ["أكثر مشاهدة"], badge: "أكثر مشاهدة"
  },
  {
    id: 2022, storeId: 2, name: "فستان ضيق مكشوف الكتف بترتر", description: "فستان ضيق مكشوف الكتف بترتر",
    price: 385, originalPrice: 450, images: ["/assets/sheirine/image20.jpeg","/assets/sheirine/image21.jpeg","/assets/sheirine/image22.jpeg"],
    sizes: ["SX", "S", "M", "L", "XL", "2XL", "3XL", "4XL"], availableSizes: ["L", "XL", "2XL", "3XL"],
    colors: [{name: "أسود", value: "#000000"}, {name: "أخضر", value: "#08741fff"}, {name: "وردي", value: "#e2928fff"}],
    rating: 4.9, reviews: 160, views: 490, likes: 460, orders: 230, category: "ملابس للمناسبات أحجام كبيرة",
    inStock: true, quantity: 10, tags: ["أكثر طلباً"], badge: "أكثر طلباً"
  },
  {
    id: 1023, storeId: 2, name: "فستان ماكسي متدلي", description: "فستان ماكسي احمر, مكشوف الكتف بصدر دانتيل من الامامم",
    price: 0, originalPrice: 0, images: ["/assets/sheirine/image24.jpg", "/assets/sheirine/image23.jpg"],
    sizes: [], availableSizes: [],
    colors: [],
    rating: 0, reviews: 0, views: 0, likes: 0, orders: 0, category: "فساتين فاخرة",
    quantity: 10, inStock: false, tags: []
  },
  {
    id: 1060, storeId: 2, name: "بلوزة لماعة بالترتر", description: "بلوزة لماعة بالترتر",
    price: 0, originalPrice: 0, images: ["/assets/sheirine/blouze1.jpeg","/assets/sheirine/blouze2.jpeg","/assets/sheirine/blouze3.jpeg"],
    sizes: [], availableSizes: [],
    colors: [],
    rating: 0, reviews: 0, views: 0, likes: 0, orders: 0, category: "فساتين فاخرة",
    quantity: 10, inStock: false, tags: []
  },

  // أحذية نسائية (5 منتجات)
  {
    id: 2025, storeId: 2, name: "شبشب نسائي مسطح مع زهرةCUCCOO CHICEST", description: "شبشب نسائي مسطح مع زهرةCUCCOO CHICEST",
    price: 120, originalPrice: 165, images: ["/assets/sheirine/cucco1.png"],
    sizes: ["36", "37", "38", "39", "40", "41", "42"], availableSizes: ["37", "38", "39", "40"],
    colors: [{name: "بني", value: "#8B4513"}],
    rating: 4.8, reviews: 31, views: 267, likes: 250, orders: 216, category: "أحذية نسائية",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
  {
    id: 2026, storeId: 2, name: "حذاء نسائي أنيق للثلوج لشتاء مع فرو قطنية سميكة للدفء", description: "حذاء نسائي أنيق للثلوج لشتاء مع فرو قطنية سميكة للدفء",
    price: 115, originalPrice: 135, images: ["/assets/sheirine/cold-shoes.png"],
    sizes: ["36", "37", "38", "39"], availableSizes: ["36", "37", "38", "39"],
    colors: [{name: "أسود", value: "#000000"}],
    rating: 4.6, reviews: 26, views: 234, likes: 98, orders: 21, category: "أحذية نسائية",
    inStock: true, quantity: 10, tags: ["جديد"], badge: "جديد"
  },
  {
    id: 2027, storeId: 2, name: "حذاء كاجوال رباط وشاح", description: "حذاء كاجوال رباط وشاح",
    price: 145, originalPrice: 175, images: ["/assets/sheirine/casual-shoes.png"],
    sizes: ["36", "37", "38", "39", "40", "41"], availableSizes: ["37", "38", "39", "40", "41"],
    colors: [{name: "أبيض", value: "#FFFFFF"}, {name: "وردي", value: "#EC4899"}, {name: "أسود", value: "#000000"}],
    rating: 4.7, reviews: 29, views: 245, likes: 112, orders: 24, category: "أحذية نسائية",
    inStock: true, quantity: 10, tags: ["أكثر طلباً"], badge: "أكثر طلباً"
  },
  {
    id: 2028, storeId: 2, name: "أحذية كاجوال مسطحة للنساء", description: "أحذية كاجوال مسطحة للنساء",
    price: 175, originalPrice: 225, images: ["/assets/sheirine/flat-casual.png"],
    sizes: ["36", "37", "38", "39", "40", "41", "42"], availableSizes: ["36", "37", "38", "39", "40"],
    colors: [{name: "أزرق ملكي", value: "#0a216bff"}],
    rating: 4.6, reviews: 40, views: 198, likes: 110, orders: 70, category: "أحذية نسائية",
    inStock: true, quantity: 10, tags: ["تخفيضات"], badge: "تخفيضات"
  },
  {
    id: 2029, storeId: 2, name: "حذاء لوفر مسطح ميتالك", description: "حذاء لوفر مسطح ميتالك",
    price: 320, originalPrice: 380, images: ["/assets/sheirine/loover1.png","/assets/sheirine/loover2.png","/assets/sheirine/loover3.png"],
    sizes: ["36", "37", "38", "39", "40", "41", "42"], availableSizes: ["37", "38", "39", "40", "41"],
    colors: [{name: "أسود", value: "#000000"}, {name: "وردي", value: "#e79c89ff"}, {name: "ذهبي", value: "#ebe049ff"}],
    rating: 4.9, reviews: 40, views: 170, likes: 230, orders: 230, category: "أحذية نسائية",
    inStock: true, quantity: 10, tags: ["أكثر مبيعاً"], badge: "أكثر مبيعاً"
  },
  {
    id: 2030, storeId: 2, name: "أحذية قصيرة", description: "أحذية قصيرة مريحة وعصرية",
    price: 225, originalPrice: 255, images: ["/assets/sheirine/short-shoes1.png","/assets/sheirine/short-shoes2.png","/assets/sheirine/short-shoes3.png"],
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43"], availableSizes: ["37", "38", "39", "40", "41", "42", "43"],
    colors: [{name: "وردي", value: "#f38b8bff"}, {name: "أحمر", value: "#ff2121f8"}, {name: "أسود", value: "#050505ff"}],
    rating: 4.9, reviews: 59, views: 260, likes: 444, orders: 360, category: "أحذية نسائية",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
  // حقائب (5 منتجات)
  {
    id: 2031, storeId: 2, name: "حقيبة كتف بتعليقة ظبي معدنية", description: "حقيبة كتف بتعليقة ظبي معدنية",
    price: 120, originalPrice: 150, images: ["/assets/sheirine/handbag1.webp","/assets/sheirine/handbag2.jpeg","/assets/sheirine/handbag3.jpeg"],
    sizes: ["صغير", "متوسط", "كبير"], availableSizes: ["متوسط", "كبير"],
    colors: [{name: "بني", value: "#704d0cff"}, {name: "أسود", value: "#070707ff"}, {name: "بيج", value: "#b6ab8cff"}],
    rating: 4.9, reviews: 24, views: 234, likes: 112, orders: 19, category: "حقائب",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
  {
    id: 2032, storeId: 2, name: "حقيبة قفل أنيقة خفيفة", description: "حقيبة قفل أنيقة خفيفة",
    price: 145, originalPrice: 185, images: ["/assets/sheirine/bag-lock.webp","/assets/sheirine/bag-lock2.webp"],
    sizes: ["صغير", "متوسط"], availableSizes: ["صغير"],
    colors: [{name: "أسود", value: "#000000"},{name: "بني", value: "#c49f6fff"}],
    rating: 4.8, reviews: 31, views: 267, likes: 277, orders: 120, category: "حقائب",
    inStock: true, quantity: 10, tags: ["جديد"], badge: "جديد"
  },
  {
    id: 2033, storeId: 2, name: "حقيبة يد صغيرة مع حزام", description: "حقيبة يد صغيرة مع حزام",
    price: 95, originalPrice: 130, images: ["/assets/sheirine/bag-jeans.webp"],
    sizes: ["صغيرة", "متوسطة"], availableSizes: ["صغيرة"],
    colors: [{name: "أزرق", value: "#2f2cc0ff"}],
    rating: 4.8, reviews: 19, views: 189, likes: 87, orders: 15, category: "حقائب",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
  {
    id: 2034, storeId: 2, name: "حقيبة كروس بتصميم ضفيرة سعة كبيرة", description: "حقيبة كروس بتصميم ضفيرة سعة كبيرة",
    price: 140, originalPrice: 180, images: ["/assets/sheirine/kross-bag.webp"],
    sizes: ["كبيرة"], availableSizes: ["كبيرة"],
    colors: [{name: "أسود", value: "#080808ff"}],
    rating: 4.6, reviews: 26, views: 198, likes: 89, orders: 21, category: "حقائب",
    inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
  },
  {
    id: 2035, storeId: 2, name: "حقيبة يد من الكتان مطبوع عليها زهور", description: "حقيبة يد من الكتان مطبوع عليها زهور",
    price: 85, originalPrice: 120, images: ["/assets/sheirine/kotton-bag.webp"],
    sizes: ["متوسط"], availableSizes: ["متوسط"],
    colors: [{name: "بني", value: "#b69665ff"}],
    rating: 4.0, reviews: 33, views: 55, likes: 80, orders: 23, category: "حقائب",
    inStock: true, quantity: 10, tags: ["تخفيضات"], badge: "تخفيضات"
  }
];
