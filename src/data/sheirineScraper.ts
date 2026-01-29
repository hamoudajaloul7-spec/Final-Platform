import type { Product } from './storeProducts';

// دالة لاستخراج المنتجات من موقع شيرين الرسمي
export const scrapeSheirineProducts = async (): Promise<Product[]> => {
  const products: Product[] = [];

  try {
    // محاكاة استخراج المنتجات من الروابط المقدمة
    // في الواقع، هذا يتطلب استخدام puppeteer أو أداة مشابهة لزيارة الموقع واستخراج البيانات

    // منتجات المجوهرات من الرابط الأول
    const jewelryProducts = await scrapeJewelryProducts();
    // منتجات الأحذية من الرابط الثاني
    const shoesProducts = await scrapeShoesProducts();
    // منتجات الملابس أحجام كبيرة من الرابط الثالث
    const clothingProducts = await scrapeClothingProducts();

    products.push(...jewelryProducts, ...shoesProducts, ...clothingProducts);

    return products;
  } catch (error) {

    return getFallbackSheirineProducts();
  }
};

// استخراج منتجات المجوهرات
const scrapeJewelryProducts = async (): Promise<Product[]> => {
  // محاكاة استخراج 10 منتجات مجوهرات من الرابط:
  // https://sheirine.ly/products/latest-products?cat=%D8%A7%D9%84%D9%85%D8%AC%D9%88%D9%87%D8%B1%D8%A7%D8%AA-

  return [
    {
      id: 2033, storeId: 2, name: "خاتم ذهبي مرصع بالألماس", description: "خاتم ذهبي فاخر مرصع بألماس طبيعي لامع",
      price: 1850, originalPrice: 2100, images: ["/assets/sheirine/engagement-ring-1.jpg"],
      sizes: ["6", "7", "8", "9"], availableSizes: ["7", "8", "9"],
      colors: [{name: "ذهب أصفر", value: "#F59E0B"}, {name: "ذهب أبيض", value: "#F8F8FF"}],
      rating: 4.9, reviews: 45, views: 567, likes: 234, orders: 38, category: "المجوهرات",
      inStock: true, quantity: 10, tags: ["مميزة", "أكثر مبيعاً"], badge: "أكثر مبيعاً"
    },
    {
      id: 2034, storeId: 2, name: "عقد ذهبي أنيق", description: "عقد ذهبي بتصميم عصري وأنيق",
      price: 1250, originalPrice: 1450, images: ["/assets/sheirine/necklace-1.jpg"],
      sizes: ["قصير", "طويل"], availableSizes: ["قصير", "طويل"],
      colors: [{name: "ذهب أصفر", value: "#F59E0B"}, {name: "ذهب أبيض", value: "#F8F8FF"}],
      rating: 4.7, reviews: 32, views: 423, likes: 189, orders: 26, category: "المجوهرات",
      inStock: true, quantity: 10, tags: ["جديد"], badge: "جديد"
    },
    {
      id: 2035, storeId: 2, name: "أقراط ذهبية متدلية", description: "أقراط ذهبية متدلية بتصميم راقي",
      price: 890, originalPrice: 1050, images: ["/assets/sheirine/hair-jewelry-1.jpg"],
      sizes: ["واحد"], availableSizes: ["واحد"],
      colors: [{name: "ذهب أصفر", value: "#F59E0B"}, {name: "ذهب وردي", value: "#F472B6"}],
      rating: 4.8, reviews: 28, views: 345, likes: 156, orders: 22, category: "المجوهرات",
      inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
    },
    {
      id: 2036, storeId: 2, name: "سوار ماسي فاخر", description: "سوار من الذهب مرصع بالماس",
      price: 2850, originalPrice: 3200, images: ["/assets/sheirine/body-jewelry-1.jpg"],
      sizes: ["صغير", "متوسط", "كبير"], availableSizes: ["متوسط", "كبير"],
      colors: [{name: "ذهب أبيض", value: "#F8F8FF"}, {name: "ذهب أصفر", value: "#F59E0B"}],
      rating: 4.9, reviews: 41, views: 389, likes: 167, orders: 33, category: "المجوهرات",
      inStock: true, quantity: 10, tags: ["أكثر إعجاباً"], badge: "أكثر إعجاباً"
    },
    {
      id: 2037, storeId: 2, name: "طقم مجوهرات كامل", description: "طقم مجوهرات كامل يتكون من عقد وأقراط وسوار",
      price: 4200, originalPrice: 4800, images: ["/assets/sheirine/jewelry-set-1.jpg"],
      sizes: ["واحد"], availableSizes: ["واحد"],
      colors: [{name: "ذهب أصفر", value: "#F59E0B"}, {name: "ذهب أبيض", value: "#F8F8FF"}],
      rating: 4.8, reviews: 37, views: 298, likes: 134, orders: 29, category: "المجوهرات",
      inStock: true, quantity: 10, tags: ["أكثر طلباً"], badge: "أكثر طلباً"
    },
    {
      id: 2038, storeId: 2, name: "خاتم خطوبة ماسي", description: "خاتم خطوبة مرصع بالماس اللامع",
      price: 3200, originalPrice: 3650, images: ["/assets/sheirine/engagement-ring-2.jpg"],
      sizes: ["5", "6", "7", "8", "9"], availableSizes: ["6", "7", "8"],
      colors: [{name: "ذهب أصفر", value: "#F59E0B"}, {name: "ذهب أبيض", value: "#F8F8FF"}],
      rating: 4.9, reviews: 19, views: 267, likes: 145, orders: 16, category: "المجوهرات",
      inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
    },
    {
      id: 2039, storeId: 2, name: "سلسلة ذهبية إيطالية", description: "سلسلة ذهبية إيطالية عيار 18",
      price: 890, originalPrice: 1050, images: ["/assets/sheirine/necklace-2.jpg"],
      sizes: ["45cm", "50cm", "55cm"], availableSizes: ["45cm", "50cm"],
      colors: [{name: "ذهب أصفر", value: "#F59E0B"}, {name: "ذهب أبيض", value: "#F8F8FF"}],
      rating: 4.6, reviews: 52, views: 445, likes: 198, orders: 41, category: "المجوهرات",
      inStock: true, quantity: 10, tags: ["تخفيضات"], badge: "تخفيضات"
    },
    {
      id: 2040, storeId: 2, name: "حلق ذهبي بالأحجار", description: "حلق ذهبي مرصع بالأحجار الكريمة",
      price: 750, originalPrice: 890, images: ["/assets/sheirine/ring-1.jpg"],
      sizes: ["واحد"], availableSizes: ["واحد"],
      colors: [{name: "ذهب أصفر", value: "#F59E0B"}, {name: "ذهب أبيض", value: "#F8F8FF"}],
      rating: 4.7, reviews: 38, views: 312, likes: 145, orders: 28, category: "المجوهرات",
      inStock: true, quantity: 10, tags: ["أكثر إعجاباً"], badge: "أكثر إعجاباً"
    },
    {
      id: 2041, storeId: 2, name: "بروش ذهبي فاخر", description: "بروش ذهبي فاخر للمناسبات الخاصة",
      price: 650, originalPrice: 780, images: ["/assets/sheirine/engagement-ring-3.jpg"],
      sizes: ["صغير", "متوسط"], availableSizes: ["صغير", "متوسط"],
      colors: [{name: "ذهب أصفر", value: "#F59E0B"}, {name: "فضي", value: "#C0C0C0"}],
      rating: 4.5, reviews: 29, views: 234, likes: 98, orders: 22, category: "المجوهرات",
      inStock: true, quantity: 10, tags: ["جديد"], badge: "جديد"
    },
    {
      id: 2042, storeId: 2, name: "طقم مجوهرات أطفال", description: "طقم مجوهرات آمن للأطفال",
      price: 450, originalPrice: 520, images: ["/assets/sheirine/jewelry-set-2.jpg"],
      sizes: ["صغير"], availableSizes: ["صغير"],
      colors: [{name: "ذهب أصفر", value: "#F59E0B"}, {name: "فضي", value: "#C0C0C0"}],
      rating: 4.8, reviews: 26, views: 189, likes: 87, orders: 19, category: "المجوهرات",
      inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
    },
    // منتجات غير متوفرة - 5 منتجات
    {
      id: 2064, storeId: 2, name: "حقيبة سلسلة ذهبية", description: "حقيبة سلسلة ذهبية أنيقة بتصميم عصري",
      price: 0, originalPrice: 0, images: ["/assets/sheirine/hair-jewelry-1.jpg"],
      sizes: ["واحد"], availableSizes: ["واحد"],
      colors: [{name: "ذهبي", value: "#F59E0B"}],
      rating: 4.9, reviews: 0, views: 0, likes: 0, orders: 0, category: "المجوهرات",
      quantity: 10, inStock: true, tags: []
    },
    {
      id: 2065, storeId: 2, name: "خاتم ألماس نادر", description: "خاتم ألماس نادر بقطعة استثنائية",
      price: 0, originalPrice: 0, images: ["/assets/sheirine/engagement-ring-1.jpg"],
      sizes: ["6", "7", "8"], availableSizes: ["6", "7", "8"],
      colors: [{name: "ذهب أبيض", value: "#F8F8FF"}],
      rating: 5.0, reviews: 0, views: 0, likes: 0, orders: 0, category: "المجوهرات",
      quantity: 10, inStock: true, tags: []
    },
    {
      id: 2066, storeId: 2, name: "ساعة ذهبية فاخرة", description: "ساعة ذهبية فاخرة بآلية سويسرية",
      price: 0, originalPrice: 0, images: ["/assets/sheirine/necklace-1.jpg"],
      sizes: ["نسائي", "رجالي"], availableSizes: ["نسائي", "رجالي"],
      colors: [{name: "ذهب أصفر", value: "#F59E0B"}, {name: "ذهب أبيض", value: "#F8F8FF"}],
      rating: 4.9, reviews: 0, views: 0, likes: 0, orders: 0, category: "المجوهرات",
      quantity: 10, inStock: true, tags: []
    }
  ];
};

// استخراج منتجات الأحذية
const scrapeShoesProducts = async (): Promise<Product[]> => {
  // محاكاة استخراج 10 منتجات أحذية من الرابط:
  // https://sheirine.ly/products/latest-products?cat=%D8%A3%D8%AD%D8%B0%D9%8A%D8%A9-%D9%86%D8%B3%D8%A7%D8%A6%D9%8A%D8%A9

  return [
    {
      id: 2043, storeId: 2, name: "حذاء كعب عالي أسود", description: "حذاء كعب عالي أنيق باللون الأسود",
      price: 285, originalPrice: 340, images: ["/assets/sheirine/image11.jpeg"],
      sizes: ["36", "37", "38", "39", "40", "41", "42"], availableSizes: ["37", "38", "39", "40"],
      colors: [{name: "أسود", value: "#000000"}, {name: "بني", value: "#8B4513"}, {name: "أحمر", value: "#DC2626"}],
      rating: 4.8, reviews: 31, views: 267, likes: 123, orders: 25, category: "أحذية نسائية",
      inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
    },
    {
      id: 2044, storeId: 2, name: "حذاء فلات أنيق", description: "حذاء فلات مريح بتصميم أنيق",
      price: 185, originalPrice: 220, images: ["/assets/sheirine/image12.jpeg"],
      sizes: ["36", "37", "38", "39", "40", "41", "42"], availableSizes: ["36", "37", "38", "39", "40"],
      colors: [{name: "بيج", value: "#D4A574"}, {name: "أسود", value: "#000000"}, {name: "كحلي", value: "#1E3A8A"}],
      rating: 4.6, reviews: 26, views: 234, likes: 98, orders: 21, category: "أحذية نسائية",
      inStock: true, quantity: 10, tags: ["جديد"], badge: "جديد"
    },
    {
      id: 2045, storeId: 2, name: "حذاء رياضي نسائي", description: "حذاء رياضي مريح بتقنية حديثة",
      price: 225, originalPrice: 270, images: ["/assets/sheirine/image13.jpeg"],
      sizes: ["36", "37", "38", "39", "40", "41", "42"], availableSizes: ["37", "38", "39", "40", "41"],
      colors: [{name: "أبيض", value: "#FFFFFF"}, {name: "وردي", value: "#EC4899"}, {name: "أسود", value: "#000000"}],
      rating: 4.7, reviews: 29, views: 245, likes: 112, orders: 24, category: "أحذية نسائية",
      inStock: true, quantity: 10, tags: ["أكثر طلباً"], badge: "أكثر طلباً"
    },
    {
      id: 2046, storeId: 2, name: "صندل صيفي أنيق", description: "صندل صيفي مريح بتصميم أنيق",
      price: 165, originalPrice: 195, images: ["/assets/sheirine/image14.jpeg"],
      sizes: ["36", "37", "38", "39", "40", "41", "42"], availableSizes: ["36", "37", "38", "39", "40"],
      colors: [{name: "ذهبي", value: "#F59E0B"}, {name: "فضي", value: "#C0C0C0"}, {name: "أسود", value: "#000000"}],
      rating: 4.5, reviews: 22, views: 198, likes: 87, orders: 18, category: "أحذية نسائية",
      inStock: true, quantity: 10, tags: ["تخفيضات"], badge: "تخفيضات"
    },
    {
      id: 2047, storeId: 2, name: "حذاء بوت أنيق", description: "حذاء بوت نسائي أنيق بكعب متوسط",
      price: 320, originalPrice: 380, images: ["/assets/sheirine/image15.jpeg"],
      sizes: ["36", "37", "38", "39", "40", "41", "42"], availableSizes: ["37", "38", "39", "40"],
      colors: [{name: "أسود", value: "#000000"}, {name: "بني", value: "#8B4513"}, {name: "رمادي", value: "#6B7280"}],
      rating: 4.8, reviews: 18, views: 167, likes: 76, orders: 14, category: "أحذية نسائية",
      inStock: true, quantity: 10, tags: ["أكثر إعجاباً"], badge: "أكثر إعجاباً"
    },
    {
      id: 2048, storeId: 2, name: "حذاء باليرينا أنيق", description: "حذاء باليرينا مريح للاستخدام اليومي",
      price: 195, originalPrice: 230, images: ["/assets/sheirine/image21.jpeg"],
      sizes: ["36", "37", "38", "39", "40", "41"], availableSizes: ["36", "37", "38", "39", "40"],
      colors: [{name: "أسود", value: "#000000"}, {name: "بيج", value: "#D4A574"}, {name: "كحلي", value: "#1E3A8A"}],
      rating: 4.6, reviews: 24, views: 189, likes: 87, orders: 19, category: "أحذية نسائية",
      inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
    },
    {
      id: 2049, storeId: 2, name: "حذاء لوفر أنيق", description: "حذاء لوفر كلاسيكي بتصميم عصري",
      price: 245, originalPrice: 290, images: ["/assets/sheirine/image22.jpeg"],
      sizes: ["36", "37", "38", "39", "40", "41"], availableSizes: ["37", "38", "39", "40"],
      colors: [{name: "بني", value: "#8B4513"}, {name: "أسود", value: "#000000"}, {name: "كحلي", value: "#1E3A8A"}],
      rating: 4.7, reviews: 21, views: 156, likes: 73, orders: 17, category: "أحذية نسائية",
      inStock: true, quantity: 10, tags: ["جديد"], badge: "جديد"
    },
    {
      id: 2050, storeId: 2, name: "حذاء سنيكرز نسائي", description: "حذاء سنيكرز مريح للرياضة والنزهات",
      price: 265, originalPrice: 310, images: ["/assets/sheirine/image23.jpg"],
      sizes: ["36", "37", "38", "39", "40", "41"], availableSizes: ["36", "37", "38", "39", "40", "41"],
      colors: [{name: "أبيض", value: "#FFFFFF"}, {name: "أسود", value: "#000000"}, {name: "وردي", value: "#EC4899"}],
      rating: 4.8, reviews: 27, views: 198, likes: 89, orders: 22, category: "أحذية نسائية",
      inStock: true, quantity: 10, tags: ["أكثر طلباً"], badge: "أكثر طلباً"
    },
    {
      id: 2051, storeId: 2, name: "حذاء مسائي لامع", description: "حذاء مسائي لامع للسهرات والمناسبات",
      price: 385, originalPrice: 450, images: ["/assets/sheirine/image24.jpg"],
      sizes: ["36", "37", "38", "39", "40"], availableSizes: ["37", "38", "39", "40"],
      colors: [{name: "ذهبي", value: "#F59E0B"}, {name: "فضي", value: "#C0C0C0"}, {name: "أسود", value: "#000000"}],
      rating: 4.9, reviews: 15, views: 134, likes: 67, orders: 12, category: "أحذية نسائية",
      inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
    },
    {
      id: 2052, storeId: 2, name: "حذاء شتوي دافئ", description: "حذاء شتوي دافئ وعملي للأيام الباردة",
      price: 345, originalPrice: 410, images: ["/assets/sheirine/image25.jpg"],
      sizes: ["36", "37", "38", "39", "40", "41"], availableSizes: ["37", "38", "39", "40", "41"],
      colors: [{name: "أسود", value: "#000000"}, {name: "بني", value: "#8B4513"}, {name: "رمادي", value: "#6B7280"}],
      rating: 4.7, reviews: 19, views: 145, likes: 78, orders: 15, category: "أحذية نسائية",
      inStock: true, quantity: 10, tags: ["تخفيضات"], badge: "تخفيضات"
    },
    // منتجات غير متوفرة - إضافة منتجين آخرين للأحذية
    {
      id: 2067, storeId: 2, name: "حذاء كريستالي فاخر", description: "حذاء كريستالي فاخر مرصع بالكريستال",
      price: 0, originalPrice: 0, images: ["/assets/sheirine/image11.jpeg"],
      sizes: ["36", "37", "38", "39", "40"], availableSizes: ["36", "37", "38", "39", "40"],
      colors: [{name: "شفاف", value: "#E5E7EB"}, {name: "ذهبي", value: "#F59E0B"}],
      rating: 4.9, reviews: 0, views: 0, likes: 0, orders: 0, category: "أحذية نسائية",
      quantity: 10, inStock: true, tags: []
    },
    {
      id: 2068, storeId: 2, name: "بوت جلد طبيعي", description: "بوت جلد طبيعي عالي الجودة للشتاء",
      price: 0, originalPrice: 0, images: ["/assets/sheirine/image12.jpeg"],
      sizes: ["36", "37", "38", "39", "40", "41"], availableSizes: ["36", "37", "38", "39", "40", "41"],
      colors: [{name: "بني", value: "#8B4513"}, {name: "أسود", value: "#000000"}],
      rating: 4.8, reviews: 0, views: 0, likes: 0, orders: 0, category: "أحذية نسائية",
      quantity: 10, inStock: true, tags: []
    }
  ];
};

// استخراج منتجات الملابس أحجام كبيرة
const scrapeClothingProducts = async (): Promise<Product[]> => {
  // محاكاة استخراج 10 منتجات ملابس من الرابط:
  // https://sheirine.ly/products/latest-products?cat=%D9%85%D9%84%D8%A7%D8%A8%D8%B3-%D9%84%D9%84%D9%85%D9%86%D8%A7%D8%B3%D8%A8%D8%A7%D8%AA-%D8%A3%D8%AD%D8%AC%D8%A7%D9%85-%D9%83%D8%A8%D9%8A%D8%B1%D8%A9

  return [
    {
      id: 2053, storeId: 2, name: "فستان سهرة أسود مقاس كبير", description: "فستان سهرة أنيق باللون الأسود بمقاسات كبيرة",
      price: 450, originalPrice: 520, images: ["/assets/sheirine/image1.jpeg"],
      sizes: ["SX", "S", "M", "L", "XL", "2XL", "3XL", "4XL"], availableSizes: ["L", "XL", "2XL", "3XL"],
      colors: [{name: "أسود", value: "#000000"}, {name: "أحمر", value: "#DC2626"}, {name: "أزرق ملكي", value: "#1E40AF"}],
      rating: 4.7, reviews: 38, views: 423, likes: 189, orders: 32, category: "ملابس للمناسبات أحجام كبيرة",
      inStock: true, quantity: 10, tags: ["أكثر طلباً"], badge: "أكثر طلباً"
    },
    {
      id: 2054, storeId: 2, name: "بلوزة شيفون مقاس كبير", description: "بلوزة شيفون أنيقة بأكمام طويلة ومقاسات كبيرة",
      price: 185, originalPrice: 220, images: ["/assets/sheirine/image2.jpg"],
      sizes: ["SX", "S", "M", "L", "XL", "2XL", "3XL", "4XL"], availableSizes: ["M", "L", "XL", "2XL"],
      colors: [{name: "أبيض", value: "#FFFFFF"}, {name: "بيج", value: "#D4A574"}, {name: "وردي", value: "#EC4899"}],
      rating: 4.6, reviews: 44, views: 356, likes: 167, orders: 35, category: "ملابس للمناسبات أحجام كبيرة",
      inStock: true, quantity: 10, tags: ["جديد"], badge: "جديد"
    },
    {
      id: 2055, storeId: 2, name: "تنورة طويلة مقاس كبير", description: "تنورة طويلة أنيقة بتصميم عصري ومقاسات كبيرة",
      price: 285, originalPrice: 340, images: ["/assets/sheirine/image3.jpg"],
      sizes: ["SX", "S", "M", "L", "XL", "2XL", "3XL", "4XL"], availableSizes: ["L", "XL", "2XL"],
      colors: [{name: "أسود", value: "#000000"}, {name: "رمادي", value: "#6B7280"}, {name: "بنفسجي", value: "#8B5CF6"}],
      rating: 4.8, reviews: 29, views: 298, likes: 134, orders: 25, category: "ملابس للمناسبات أحجام كبيرة",
      inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
    },
    {
      id: 2056, storeId: 2, name: "جاكيت رسمي مقاس كبير", description: "جاكيت رسمي أنيق بجودة عالية ومقاسات كبيرة",
      price: 385, originalPrice: 450, images: ["/assets/sheirine/image4.jpeg"],
      sizes: ["SX", "S", "M", "L", "XL", "2XL", "3XL", "4XL"], availableSizes: ["XL", "2XL", "3XL"],
      colors: [{name: "أسود", value: "#000000"}, {name: "كحلي", value: "#1E3A8A"}, {name: "رمادي", value: "#6B7280"}],
      rating: 4.9, reviews: 22, views: 267, likes: 123, orders: 18, category: "ملابس للمناسبات أحجام كبيرة",
      inStock: true, quantity: 10, tags: ["أكثر إعجاباً"], badge: "أكثر إعجاباً"
    },
    {
      id: 2057, storeId: 2, name: "بنطال أسود رسمي مقاس كبير", description: "بنطال أسود رسمي بقصة أنيقة ومقاسات كبيرة",
      price: 225, originalPrice: 270, images: ["/assets/sheirine/image5.jpg"],
      sizes: ["SX", "S", "M", "L", "XL", "2XL", "3XL", "4XL"], availableSizes: ["L", "XL", "2XL", "3XL"],
      colors: [{name: "أسود", value: "#000000"}, {name: "كحلي", value: "#1E3A8A"}],
      rating: 4.5, reviews: 35, views: 312, likes: 145, orders: 28, category: "ملابس للمناسبات أحجام كبيرة",
      inStock: true, quantity: 10, tags: ["تخفيضات"], badge: "تخفيضات"
    },
    {
      id: 2058, storeId: 2, name: "قميص حريري مقاس كبير", description: "قميص حريري فاخر بتصميم أنيق ومقاسات كبيرة",
      price: 165, originalPrice: 195, images: ["/assets/sheirine/image6.jpg"],
      sizes: ["SX", "S", "M", "L", "XL", "2XL", "3XL", "4XL"], availableSizes: ["M", "L", "XL"],
      colors: [{name: "أبيض", value: "#FFFFFF"}, {name: "كريمي", value: "#FEF3C7"}, {name: "أزرق فاتح", value: "#60A5FA"}],
      rating: 4.7, reviews: 26, views: 234, likes: 98, orders: 21, category: "ملابس للمناسبات أحجام كبيرة",
      inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
    },
    {
      id: 2059, storeId: 2, name: "معطف شتوي مقاس كبير", description: "معطف شتوي دافئ بتصميم عصري ومقاسات كبيرة",
      price: 520, originalPrice: 620, images: ["/assets/sheirine/image7.jpg"],
      sizes: ["SX", "S", "M", "L", "XL", "2XL", "3XL", "4XL"], availableSizes: ["L", "XL", "2XL", "3XL", "4XL"],
      colors: [{name: "أسود", value: "#000000"}, {name: "كحلي", value: "#1E3A8A"}, {name: "رمادي", value: "#6B7280"}],
      rating: 4.8, reviews: 19, views: 189, likes: 87, orders: 15, category: "ملابس للمناسبات أحجام كبيرة",
      inStock: true, quantity: 10, tags: ["جديد"], badge: "جديد"
    },
    {
      id: 2060, storeId: 2, name: "توب كاجوال مقاس كبير", description: "توب كاجوال مريح بألوان متنوعة ومقاسات كبيرة",
      price: 125, originalPrice: 150, images: ["/assets/sheirine/image8.jpeg"],
      sizes: ["SX", "S", "M", "L", "XL", "2XL", "3XL", "4XL"], availableSizes: ["S", "M", "L", "XL", "2XL"],
      colors: [{name: "أبيض", value: "#FFFFFF"}, {name: "رمادي", value: "#6B7280"}, {name: "أسود", value: "#000000"}],
      rating: 4.4, reviews: 41, views: 345, likes: 156, orders: 33, category: "ملابس للمناسبات أحجام كبيرة",
      inStock: true, quantity: 10, tags: ["أكثر مبيعاً"], badge: "أكثر مبيعاً"
    },
    {
      id: 2061, storeId: 2, name: "فستان صيفي مقاس كبير", description: "فستان صيفي خفيف بتصميم أنيق ومقاسات كبيرة",
      price: 285, originalPrice: 340, images: ["/assets/sheirine/image9.jpeg"],
      sizes: ["SX", "S", "M", "L", "XL", "2XL", "3XL", "4XL"], availableSizes: ["M", "L", "XL", "2XL"],
      colors: [{name: "أزرق فاتح", value: "#60A5FA"}, {name: "وردي", value: "#EC4899"}, {name: "أصفر", value: "#FDE047"}],
      rating: 4.6, reviews: 28, views: 267, likes: 112, orders: 23, category: "ملابس للمناسبات أحجام كبيرة",
      inStock: true, quantity: 10, tags: ["مميزة"], badge: "مميزة"
    },
    {
      id: 2062, storeId: 2, name: "بليزر أسود مقاس كبير", description: "بليزر أسود كلاسيكي بجودة عالية ومقاسات كبيرة",
      price: 385, originalPrice: 450, images: ["/assets/sheirine/image10.jpeg"],
      sizes: ["SX", "S", "M", "L", "XL", "2XL", "3XL", "4XL"], availableSizes: ["L", "XL", "2XL", "3XL"],
      colors: [{name: "أسود", value: "#000000"}, {name: "كحلي", value: "#1E3A8A"}],
      rating: 4.7, reviews: 33, views: 298, likes: 134, orders: 27, category: "ملابس للمناسبات أحجام كبيرة",
      inStock: true, quantity: 10, tags: ["أكثر طلباً"], badge: "أكثر طلباً"
    }
  ];
};

// منتجات احتياطية في حالة فشل الاستخراج
const getFallbackSheirineProducts = (): Product[] => {
  return [
    {
      id: 2063, storeId: 2, name: "منتج شيرين احتياطي", description: "منتج من متجر شيرين في حالة عدم توفر البيانات",
      price: 100, originalPrice: 120, images: ["/assets/sheirine/image1.jpeg"],
      sizes: ["واحد"], availableSizes: ["واحد"],
      colors: [{name: "أسود", value: "#000000"}],
      rating: 4.5, reviews: 10, views: 100, likes: 50, orders: 10, category: "المجوهرات",
      inStock: true, quantity: 10, tags: ["جديد"], badge: "جديد"
    }
  ];
};

// دالة لتحديث منتجات شيرين في قاعدة البيانات
export const updateSheirineProducts = async (): Promise<void> => {
  try {
    const scrapedProducts = await scrapeSheirineProducts();


    // هنا يمكن حفظ المنتجات في قاعدة البيانات أو تحديث الملف المحلي
    // في هذا المثال، سنقوم فقط بطباعة النتائج

  } catch (error) {

  }
};
