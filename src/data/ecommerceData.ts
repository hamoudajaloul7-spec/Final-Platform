// E-commerce data module for EISHRO platform
// بيانات المناطق والمدن
// citiesData: City and area data for delivery locations
export const citiesData = {
  tripoli: {
    name: "طرابلس",
    areas: [
      "طرابلس المركز",
      "المدينة القديمة",
      "السياحية",
      "حي الاندلس",
      "قرجي",
      "قرقارش",
      "غوط الشعال",
      "تاجوراء",
      "جنزور",
      "شارع النصر",
      "شارع الجمهورية",
      "جامع الصقع",
      "زاوية الدهماني",
      "الظهرة",
      "الفرناج",
      "زناته",
      "زناته القديمة",
      "الجرابة",
      "بن عاشور",
      "طريق الشط",
      "سوق الجمعة",
      "عرادة",
      "17 الطير",
      "الترسانة",
      "11 يونيو",
      "طريق 16",
      "السبعة",
      "المشتل",
      "عين زارة",
      "صلاح الدين",
      "حي دمشق",
      "بوسته",
      "سيدي المصري",
      "شارع المدار",
      "الحشان",
      "راس حسن",
      "المنشية",
      "طريق السكه",
      "جزيرة النبراس",
      "باب بن غشير",
      "الهضبة",
      "بوسليم",
      "طريق المطار",
      "الفلاح",
      "الدريبي",
      "حي الإسلامي",
      "غرغور",
      "حي الانتصار",
      "طريق الشوك",
      "مشروع الهضبة",
      "قصر بن غشير",
      "شارع عمر المختار",
      "شارع أول سبتمبر",
      "شارع هايتي",
      "شارع ميزران",
      "شارع الرشيد"
    ]
  },
  benghazi: {
    name: "بنغازي",
    areas: ["المنطقة الشرقية", "المنطقة الغربية", "وسط المدينة"]
  },
  misrata: {
    name: "مصراتة", 
    areas: ["وسط مصراتة", "المنطقة الصناعية", "الأحياء السكنية"]
  },
  zawiya: {
    name: "الزاوية",
    areas: ["وسط الزاوية", "الأحياء الجديدة", "المنطقة الساحلية"]
  }
};

// shippingData: Shipping costs and times for different regions
// بيانات الشحن والتوصيل
export const shippingData = {
  tripoli: {
    normal: { time: "24-96 ساعة", price: { min: 30, max: 45 } },
    express: { time: "9-12 ساعة", price: { min: 85, max: 120 } }
  },
  outside: {
    normal: { time: "24-96 ساعة", price: { min: 50, max: 85 } },
    express: { time: "9-12 ساعة", price: { min: 120, max: 185 } }
  }
};

// paymentMethods: Available payment methods and options
// طرق الدفع المتاحة
export const paymentMethods = {
  onDelivery: {
    name: "عند الاستلام",
    methods: [
      { name: "نقدي", icon: "/assets/payment/cash-on-delivery.png" },
      { name: "بطاقات ائتمانية", icon: "/assets/payment/debit.png" }
    ]
  },
  immediate: {
    name: "دفع فوري", 
    methods: [
      { name: "معاملات", icon: "/assets/payment/moamalat.png" },
      { name: "بطاقات ائتمانية", icon: "/assets/payment/debit.png" },
      { name: "يوسر", icon: "/assets/payment/youssr.png" },
      { name: "سداد", icon: "/assets/payment/sadad.png" },
      { name: "تداول", icon: "/assets/payment/tadawul.png" },
      { name: "موبي كاش", icon: "/assets/payment/mobicash.png" },
      { name: "1باي", icon: "/assets/payment/1Pay.png" },
      { name: "أنيس", icon: "/assets/partners/payment/anis.png" },
      { name: "بكم", icon: "/assets/payment/Becom.png" },
      { name: "بلو لاين", icon: "/assets/payment/BlueLine.png" },
      { name: "نابفور", icon: "/assets/payment/nab4pay.png" },
      { name: "ادفع لي", icon: "/assets/payment/edfali.png" }
    ]
  }
};

// partnerCompanies: Partner companies for delivery and services
// الشركات الشريكة
export const partnerCompanies = {
  delivery: [
    "بريستو",
    "مندوب توصيل", 
    "فانيكس",
    "درب السيل",
    "أميال",
    "زام"
  ]
};

// partnersData: Partner data for display on the website (banks, payments, transport)
// شركاء النجاح - للعرض في الموقع
export const partnersData = {
  banks: [
    { name: 'مصرف المعاملات التجارية', logo: '/assets/partners/banks/moamalat.png' },
    { name: 'مصرف الأندلس', logo: '/assets/partners/banks/andalus.png' },
    { name: 'مصرف الوحدة', logo: '/assets/partners/banks/wahda.png' },
    { name: 'مصرف الإتحاد الأفريقي التجاري', logo: '/assets/partners/banks/ATIB.svg' },
    { name: 'مصرف نوران', logo: '/assets/partners/banks/nuran.png' },
    { name: 'مصرف أمان', logo: '/assets/partners/banks/aman-bank.png' },
    { name: 'مصرف شمال أفريقيا', logo: '/assets/partners/banks/north-africa.png' },
    { name: 'مصرف الجمهورية', logo: '/assets/partners/banks/jumhouria.png' },
    { name: 'مصرف يكن', logo: '/assets/partners/banks/yaken.png' },
    { name: 'المصرف التجاري الوطني', logo: '/assets/partners/banks/national-commercial-bank.png' },
    { name: 'مصرف الصحراء', logo: '/assets/partners/banks/sahara-bank.jpg' },
    { name: 'مصرف ليبيا الخليجي', logo: '/assets/partners/banks/libyan-golf.jpg' },
    { name: 'المصرف الليبي الإسلامي', logo: '/assets/partners/banks/Libyan-islamic.png' },
    { name: 'المصرف الوطني العربي', logo: '/assets/partners/banks/nab.png' },
    { name: 'مصرف جسر التجارة', logo: '/assets/partners/banks/jussor.png' },
    { name: 'مصرف يونايتد', logo: '/assets/partners/banks/united.jpg' },
    { name: 'مصرف التجارة', logo: '/assets/partners/banks/commerce-bank.png' }
  ],
  payment: [
    { name: 'معاملات', logo: '/assets/partners/payment/moamalat.png' },
    { name: 'بطاقات ائتمانية', logo: '/assets/partners/payment/debit.png' },
    { name: 'سداد', logo: '/assets/partners/payment/sadad.png' },
    { name: 'تداول', logo: '/assets/partners/payment/tadawul.png' },
    { name: 'موبي كاش', logo: '/assets/partners/payment/mobicash.png' },
    { name: '1باي', logo: '/assets/partners/payment/1Pay.png' },
    { name: 'أنيس', logo: '/assets/partners/payment/anis.png' },
    { name: 'بكم', logo: '/assets/partners/payment/Becom.png' },
    { name: 'بلو لاين', logo: '/assets/partners/payment/BlueLine.png' },
    { name: 'إدفعلي', logo: '/assets/partners/payment/edfali.png' },
    { name: 'قصتلي', logo: '/assets/partners/payment/qasatli.png' },
    { name: 'إشرو', logo: '/assets/partners/payment/ishro.jpg' }
  ],
  transport: [
    { name: 'أميال', logo: '/assets/partners/transport/amyal.png' },
    { name: 'كاش', logo: '/assets/partners/transport/cash.png' },
    { name: 'درب السيل', logo: '/assets/partners/transport/darbsail.png' },
    { name: 'بريستو', logo: '/assets/partners/transport/presto.jpg' },
    { name: 'فانكس', logo: '/assets/partners/transport/vanex.png' },
    { name: 'زام', logo: '/assets/partners/transport/ZAM.png' },
    { name: 'أرامكس', logo: '/assets/partners/transport/aramex.webp' },
    { name: 'بيبو فاست', logo: '/assets/partners/transport/bebo_fast.webp' },
    { name: 'دي إكسبريس', logo: '/assets/partners/transport/dexpress.webp' },
    { name: 'دي إتش إل', logo: '/assets/partners/transport/dhl.png' },
    { name: 'جيدكس', logo: '/assets/partners/transport/gedex.webp' },
    { name: 'جو ديليفري', logo: '/assets/partners/transport/go-delivery.webp' },
    { name: 'هدهد', logo: '/assets/partners/transport/hudhud.jpeg' },
    { name: 'توصيل آخر', logo: '/assets/partners/transport/other_delivery.png' },
    { name: 'سكاي إكس', logo: '/assets/partners/transport/skyex.webp' },
    { name: 'سونيك إكسبريس', logo: '/assets/partners/transport/sonicexpress.webp' },
    { name: 'إس تي بي إكس', logo: '/assets/partners/transport/stpx.webp' },
    { name: 'توربو إكس إل جي', logo: '/assets/partners/transport/turboexlg.webp' },
    { name: 'وينجسلي', logo: '/assets/partners/transport/wingsly.webp' }
  ]
};

// storesData: Store information and configurations
// بيانات المتاجر
const baseStoresData = [
  {
    id: 1,
    name: "نواعم",
    slug: "nawaem",
    description: "متجر الأزياء النسائية العصرية والعبايات الراقية",
    logo: "/assets/stores/nawaem.webp",
    categories: ["فساتين", "عبايات", "ملابس يومية", "اكسسوارات"],
    url: "https://nawaem.ly/",
    endpoints: {
      products: "https://nawaem.ly/products/latest-products?cat=%D8%A7%D9%84%D9%83%D9%84",
      discounts: "https://nawaem.ly/products/discounts"
    },
    social: {
      facebook: "https://facebook.com/nawaem",
      instagram: "https://instagram.com/nawaem",
      website: "https://nawaem.ly/"
    },
    isActive: true
  },
  {
    id: 2,
    name: "شيرين",
    slug: "sheirine",
    description: "متجر شيرين للمجوهرات والإكسسوارات الفاخرة",
    logo: "/assets/stores/sheirine.webp",
    categories: ["All", "Engagement Rings", "Jewelry Sets", "Bracelets", "Necklaces and Chains", "Earrings", "Rings", "Hair Jewelry", "Leggings", "Body Jewelry and Accessories"],
    url: "https://sheirine.ly/",
    endpoints: {
      products: "https://sheirine.ly/products?cat=%D8%A7%D9%84%D9%83%D9%84",
      discounts: "https://sheirine.ly/products/discounts"
    },
    social: {
      website: "https://sheirine.ly/"
    },
    isActive: true
  },
  {
    id: 3,
    name: "Pretty",
    slug: "pretty",
    description: "متجر الأزياء والإكسسوارات الأنيقة",
    logo: "/assets/stores/pretty.webp",
    categories: ["ملابس نسائية", "فساتين", "إكسسوارات", "أحذية"],
    url: "https://pretty.ezone.ly/",
    endpoints: {
      products: "https://pretty.ezone.ly/products?cat=%D8%A7%D9%84%D9%83%D9%84",
      discounts: "https://pretty.ezone.ly/products/discounts"
    },
    social: {},
    isActive: true
  },
  {
    id: 4,
    name: "Delta Store",
    slug: "delta-store",
    description: "متجر الأزياء والملابس العصرية",
    logo: "/assets/stores/delta-store.webp",
    categories: ["أزياء", "ملابس", "إكسسوارات"],
    url: "https://details.ly/",
    endpoints: {
      products: "https://details.ly/products?cat=%D8%A7%D9%84%D9%83%D9%84",
      discounts: "https://details.ly/products/discounts"
    },
    social: {},
    isActive: true
  },
  {
    id: 5,
    name: "Megna",
    slug: "magna-beauty",
    description: "متجر منتجات التجميل والعناية بالجمال",
    logo: "/assets/stores/magna-beauty.webp",
    categories: ["مكياج", "عناية بالبشرة", "منتجات تجميل"],
    url: "https://store.magna-beauty.com/",
    endpoints: {
      products: "https://store.magna-beauty.com/products?cat=%D8%A7%D9%84%D9%83%D9%84",
      discounts: "https://store.magna-beauty.com/products/discounts"
    },
    social: {},
    isActive: true
  },
  {
    id: 1764003948994,
    name: "انديش",
    slug: "indeesh",
    description: "متجر انديش للعطور والمنظفات والعناية الشخصية",
    logo: "/assets/indeesh/logo/1764003949069-2wl3b2-Indeesh.png",
    categories: ["عطور", "منظفات", "عناية شخصية"],
    url: "/indeesh",
    endpoints: {
      products: "",
      discounts: ""
    },
    social: {},
    isActive: true
  },
  {
    id: 6,
    name: "مكانك",
    slug: "mkanek",
    description: "متجر مكانك للأثاث والديكور العصري",
    logo: "/assets/stores/mkanek.webp",
    categories: ["أثاث", "ديكور", "إضاءة"],
    url: "/store/mkanek",
    endpoints: { products: "", discounts: "" },
    social: {},
    isActive: true
  },
  {
    id: 7,
    name: "كومفي",
    slug: "comfy",
    description: "متجر كومفي للملابس الرياضية والمريحة",
    logo: "/assets/stores/comfy.webp",
    categories: ["رياضة", "ملابس مريحة", "أحذية"],
    url: "/store/comfy",
    endpoints: { products: "", discounts: "" },
    social: {},
    isActive: true
  },
  {
    id: 8,
    name: "مكنون",
    slug: "maknoon",
    description: "متجر مكنون للمجوهرات والقطع الفريدة",
    logo: "/assets/stores/maknoon.webp",
    categories: ["مجوهرات", "إكسسوارات"],
    url: "/store/maknoon",
    endpoints: { products: "", discounts: "" },
    social: {},
    isActive: true
  },
  {
    id: 10,
    name: "تحفة",
    slug: "tohfa",
    description: "متجر تحفة للهدايا والقطع التراثية",
    logo: "/assets/stores/tohfa.webp",
    categories: ["هدايا", "تراث", "ديكور"],
    url: "/store/tohfa",
    endpoints: { products: "", discounts: "" },
    social: {},
    isActive: true
  },
  {
    id: 11,
    name: "برشت بلو",
    slug: "brushtblue",
    description: "متجر برشت بلو للفنون والأدوات المكتبية",
    logo: "/assets/stores/brushtblue.webp",
    categories: ["فنون", "قرطاسية"],
    url: "/store/brushtblue",
    endpoints: { products: "", discounts: "" },
    social: {},
    isActive: true
  },
  {
    id: 13,
    name: "ان باسو",
    slug: "unpasso",
    description: "متجر ان باسو للأحذية الجلدية الفاخرة",
    logo: "/assets/stores/unpasso.webp",
    categories: ["أحذية نسائية", "أحذية رجالية"],
    url: "/store/unpasso",
    endpoints: { products: "", discounts: "" },
    social: {},
    isActive: true
  },
  {
    id: 16,
    name: "الوردة البيضاء",
    slug: "alwardaalbayda",
    description: "متجر الوردة البيضاء للعطور والزهور",
    logo: "/assets/stores/alwardaalbayda.webp",
    categories: ["عطور", "زهور"],
    url: "/store/alwardaalbayda",
    endpoints: { products: "", discounts: "" },
    social: {},
    isActive: true
  },
  {
    id: 17,
    name: "الركن الليبي",
    slug: "tlcwatches",
    description: "متجر الركن الليبي للساعات والإكسسوارات",
    logo: "/assets/stores/tlcwatches.webp",
    categories: ["ساعات", "إكسسوارات"],
    url: "/store/tlcwatches",
    endpoints: { products: "", discounts: "" },
    social: {},
    isActive: true
  },
  {
    id: 18,
    name: "أيلول",
    slug: "eylul",
    description: "متجر أيلول للأزياء التركية العصرية",
    logo: "/assets/stores/eylul.webp",
    categories: ["أزياء نسائية", "فساتين"],
    url: "/store/eylul",
    endpoints: { products: "", discounts: "" },
    social: {},
    isActive: true
  },
  {
    id: 19,
    name: "كوزيت بوتيك",
    slug: "cozetboutique",
    description: "متجر كوزيت بوتيك للحقائب الراقية",
    logo: "/assets/stores/cozetboutique.webp",
    categories: ["حقائب", "إكسسوارات"],
    url: "/store/cozetboutique",
    endpoints: { products: "", discounts: "" },
    social: {},
    isActive: true
  },
];

let cachedStoresData: any[] | null = null;

const ALLOWED_STORES = ['nawaem', 'sheirine', 'pretty', 'delta-store', 'magna-beauty'];

export function cleanupAnonymousStores() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }

  try {
    // لا نحذف أي متجر مُسجل ما دام موجودًا في eshro_stores.
    // نكتفي بتنظيف المفاتيح اليتيمة فقط.
    const registeredStores = JSON.parse(localStorage.getItem('eshro_stores') || '[]');
    if (!Array.isArray(registeredStores)) return;

    // إعادة كتابة القائمة كما هي لضمان صحة التخزين فقط
    localStorage.setItem('eshro_stores', JSON.stringify(registeredStores));

    // إزالة المفاتيح اليتيمة
    cleanupOrphanedStoreFiles();
    invalidateStoresCache();
  } catch (error) {

  }
}

function removeStoreData(slug: string) {
  localStorage.removeItem(`eshro_store_files_${slug}`);
  localStorage.removeItem(`store_products_${slug}`);
  localStorage.removeItem(`store_sliders_${slug}`);
}

export function removeStoreCompletely(slug: string) {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {

    return;
  }

  try {
    removeStoreData(slug);
    
    const registeredStores = JSON.parse(localStorage.getItem('eshro_stores') || '[]');
    const filtered = registeredStores.filter((s: any) => {
      const storeSlug = (s?.subdomain || s?.id?.toString() || '').toString().toLowerCase().trim().replace(/\s+/g, '-');
      return storeSlug !== slug.toLowerCase().trim().replace(/\s+/g, '-');
    });
    
    if (filtered.length !== registeredStores.length) {
      localStorage.setItem('eshro_stores', JSON.stringify(filtered));

    }
    
    cleanupOrphanedStoreFiles();
    invalidateStoresCache();
    

  } catch (error) {

  }
}

function cleanupOrphanedStoreFiles() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }

  const keysToRemove: string[] = [];

  // اجمع كل السلاجز المسجلة فعليًا
  let registeredSlugs: string[] = [];
  try {
    const registeredStores = JSON.parse(localStorage.getItem('eshro_stores') || '[]');
    if (Array.isArray(registeredStores)) {
      registeredSlugs = registeredStores
        .map((s: any) => (typeof s?.subdomain === 'string' ? s.subdomain : (s?.id ? String(s.id) : '')))
        .filter(Boolean);
    }
  } catch {
    // ignore
  }

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    if (key.startsWith('eshro_store_files_') || key.startsWith('store_products_') || key.startsWith('store_sliders_')) {
      const slug = key
        .replace('eshro_store_files_', '')
        .replace('store_products_', '')
        .replace('store_sliders_', '');

      // احذف المفتاح إن لم يكن السلاج موجودًا ضمن eshro_stores
      if (!registeredSlugs.includes(slug)) {
        keysToRemove.push(key);
      }
    }
  }

  keysToRemove.forEach((key) => {

    localStorage.removeItem(key);
  });

  if (keysToRemove.length > 0) {
    void 0;
  }
}

export function getStoresData(forceRefresh = false) {
  if (cachedStoresData && !forceRefresh) {
    return cachedStoresData;
  }

  const normalize = (v: any) => {
    const n = (v ?? '').toString().trim().toLowerCase().replace(/\s+/g, '-');
    const alias: Record<string, string> = {
      sherine: 'sheirine',
      sheirin: 'sheirine',
      delta: 'delta-store',
      details: 'delta-store',
      detail: 'delta-store',
      megna: 'magna-beauty',
      magna: 'magna-beauty',
      magna_beauty: 'magna-beauty',
    };
    return alias[n] || n;
  };
  const allStores = [...baseStoresData];
  
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const registeredStores = JSON.parse(localStorage.getItem('eshro_stores') || '[]');
      registeredStores.forEach((newStore: any) => {
        const slug = normalize(newStore.subdomain);
        const storeIndex = allStores.findIndex(s => normalize(s.slug) === slug);
        if (storeIndex === -1) {
          const nextId = Math.max(...allStores.map(s => s.id), 0) + 1;
          allStores.push({
            id: nextId,
            name: newStore.nameAr || newStore.name,
            slug: slug,
            description: newStore.description || '',
            logo: newStore.logo || '/assets/default-store.png',
            categories: newStore.categories || [],
            url: `/store/${slug}`,
            endpoints: {
              products: '',
              discounts: ''
            },
            social: {
              facebook: '',
              instagram: '',
              website: ''
            },
            isActive: newStore.setupComplete !== false
          });
        }
      });
    } catch (error) {

    }
  }
  
  cachedStoresData = allStores;
  return allStores;
}

export function invalidateStoresCache() {
  cachedStoresData = null;
}

export const storesData = getStoresData();

// sampleProducts: Sample product data for testing and display
// بيانات المنتجات التجريبية
export const sampleProducts = [
  {
    id: 1,
    storeId: 1,
    name: "فستان طويل أسود أنيق",
    description: "فستان طويل أنيق مناسب للمناسبات الرسمية والخروج، مصنوع من قماش عالي الجودة",
    price: 185,
    originalPrice: 200,
    images: [
      "/assets/products/dress-black-main.png",
      "/assets/products/dress-black-main.png",
      "/assets/products/dress-black-main.png"
    ],
    sizes: ["S", "M", "L", "XL"],
    availableSizes: ["S", "M", "L"], // XL غير متوفر
    colors: [
      { name: "أسود", value: "#000000" },
      { name: "أبيض", value: "#FFFFFF" },
      { name: "أخضر داكن", value: "#1F4E3D" }
    ],
    rating: 4.5,
    reviews: 12,
    category: "فساتين",
    inStock: true,
    quantity: 10,
    expiryDate: "2027-08-15",
    endDate: "2029-08-15"
  },
  {
    id: 2,
    storeId: 1, 
    name: "فستان طويل أزرق راقي",
    description: "فستان طويل راقي باللون الأزرق، مثالي للإطلالات العصرية والمناسبات",
    price: 195,
    originalPrice: 220,
    images: [
      "/assets/products/dress-blue-main.png",
      "/assets/products/dress-blue-main.png"
    ],
    sizes: ["S", "M", "L", "XL"],
    availableSizes: ["M", "L", "XL"],
    colors: [
      { name: "أزرق", value: "#1E3A8A" },
      { name: "أسود", value: "#000000" }
    ],
    rating: 4.8,
    reviews: 8,
    category: "فساتين",
    inStock: true,
    quantity: 8,
    expiryDate: "2027-10-22",
    endDate: "2029-10-22"
  },
  {
    id: 3,
    storeId: 1,
    name: "فستان بنفسجي عصري",
    description: "فستان بنفسجي أنيق بتصميم عصري وقماش فاخر، مناسب لجميع المناسبات",
    price: 210,
    originalPrice: 250,
    images: [
      "/assets/products/dress-purple-main.png",
      "/assets/products/dress-purple-main.png"
    ],
    sizes: ["S", "M", "L", "XL"],
    availableSizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "بنفسجي", value: "#7C3AED" },
      { name: "أسود", value: "#000000" },
      { name: "كحلي", value: "#1E40AF" }
    ],
    rating: 4.9,
    reviews: 15,
    category: "فساتين",
    inStock: true,
    quantity: 15,
    expiryDate: "2028-02-10",
    endDate: "2030-02-10"
  },
  {
    id: 4,
    storeId: 1,
    name: "عباءة كلاسيكية",
    description: "عباءة كلاسيكية أنيقة بتصميم تقليدي وجودة عالية",
    price: 165,
    originalPrice: 180,
    images: [
      "/assets/products/dress-black-main.png"
    ],
    sizes: ["S", "M", "L", "XL"],
    availableSizes: ["S", "M", "L"],
    colors: [
      { name: "أسود", value: "#000000" }
    ],
    rating: 4.6,
    reviews: 20,
    category: "عبايات", 
    inStock: true,
    quantity: 12,
    expiryDate: "2028-05-18",
    endDate: "2030-05-18"
  },
  {
    id: 5,
    storeId: 1,
    name: "فستان يومي مريح",
    description: "فستان يومي مريح للاستخدام اليومي، مصنوع من قماش قطني ناعم",
    price: 120,
    originalPrice: 140,
    images: [
      "/assets/products/dress-blue-main.png"
    ],
    sizes: ["S", "M", "L", "XL"],
    availableSizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "أزرق فاتح", value: "#3B82F6" },
      { name: "وردي", value: "#EC4899" },
      { name: "بيج", value: "#D4A574" }
    ],
    rating: 4.3,
    reviews: 25,
    category: "ملابس يومية",
    inStock: true,
    quantity: 20,
    expiryDate: "2027-11-30",
    endDate: "2029-11-30"
  },
  {
    id: 6,
    storeId: 1,
    name: "إكسسوارات أنيقة",
    description: "مجموعة إكسسوارات أنيقة تكمل إطلالتك اليومية",
    price: 85,
    originalPrice: 100,
    images: [
      "/assets/products/dress-purple-main.png"
    ],
    sizes: ["واحد"],
    availableSizes: ["واحد"],
    colors: [
      { name: "ذهبي", value: "#F59E0B" },
      { name: "فضي", value: "#6B7280" }
    ],
    rating: 4.7,
    reviews: 30,
    category: "اكسسوارات",
    inStock: true,
    quantity: 25,
    expiryDate: "2028-03-05",
    endDate: "2030-03-05"
  }
];

// generateOrderId function: Generates unique order reference numbers
// مولد الرقم المرجعي
export const generateOrderId = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `eshro-${year}${month}-${randomNum}`;
};

// generateCoupon function: Generates discount coupon codes
// مولد كوبون التخفيض
export const generateCoupon = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `eshro-${code}-${year}${month}`;
};

// availableCoupons: List of available discount coupons
// كوبونات التخفيض المتاحة
export const availableCoupons = [
  {
    code: "eshro-TT6H-202509",
    discount: 15,
    minAmount: 1500,
    description: "تخفيض 15% من إجمالي فاتورة بقيمة 1500 د.ل"
  },
  {
    code: "eshro-WX2Y-202509", 
    discount: 20,
    minAmount: 3000,
    description: "تخفيضات 20% بقيمة شراء 3000 د.ل"
  }
];



// statsData: Statistics data for the homepage display
// بيانات الإحصائيات للصفحة الرئيسية
export const statsData = [
  { label: 'معدل الرضا', value: '98%' },
  { label: 'عميل راضي', value: '+25K' },
  { label: 'منتج متاح', value: '+50K' },
  { label: 'متجر نشط', value: '+150' }
];
