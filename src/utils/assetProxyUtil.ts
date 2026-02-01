import { getApiBase } from './apiConfig';

export const SUPABASE_PROJECT_ID = 'wbakbuqvdbmweujkbzxn';
const BUCKET_NAME = 'ishro-assets';
const SUPABASE_PUBLIC_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${BUCKET_NAME}`;

export const getProxyImageUrl = (
  imagePath: string,
  storeSlug?: string | undefined,
  imageType: 'products' | 'sliders' | 'logo' = 'products'
): string => {
  if (!imagePath) return '';

  // 1. If it's already a data URI, return it
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }

  const base = getApiBase();
  const getProxyUrl = (src: string) => {
    const apiUrl = base ? `${base}/api` : '/api';
    return `${apiUrl}/assets/proxy?src=${encodeURIComponent(src)}`;
  };

  // 2. If it's an absolute URL, use the proxy for external ones to get caching/optimization
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    // If it's already from our own storage or domain, return as is
    if (imagePath.includes(SUPABASE_PROJECT_ID) || (base && imagePath.startsWith(base))) {
      return imagePath;
    }
    // Otherwise, proxy it
    return getProxyUrl(imagePath);
  }

  // 3. Handle known local asset paths
  if (imagePath.startsWith('/assets/')) {
    // التحقق مما إذا كان هذا مساراً لمتجر ديناميكي يحتاج للتحويل إلى Supabase
    // النمط: /assets/[slug]/[type]/[filename]
    const parts = imagePath.split('/').filter(Boolean);
    if (parts.length >= 4 && parts[0] === 'assets') {
      const slug = parts[1]!;
      const type = (parts[2] || 'products') as 'products' | 'sliders' | 'logo';
      const filename = parts.slice(3).join('/');
      
      // إذا كان المتجر معروفاً كمتجر ديناميكي (أو تم تمرير storeSlug مطابق)
      // أضفنا shekha هنا لضمان معالجة صور السلايدر الخاصة بها بشكل صحيح
      const isKnownDynamicStore = ['shekha', 'indeesh'].includes(slug);
      
      if (slug === storeSlug || isKnownDynamicStore || (storeSlug === undefined && filename.includes('.'))) {
        const folder = type === 'products' ? 'products' : (type === 'sliders' ? 'sliders' : 'logo');
        return `${SUPABASE_PUBLIC_URL}/${folder}/stores/${slug}/${folder}/${filename}`;
      }
    }
    return imagePath;
  }
  
  // معالجة إضافية لمسارات السلايدر التي قد تأتي بشكل غير كامل للمتاجر الديناميكية
  if (imagePath.startsWith('/sliders/') || imagePath.includes('banner-shekha')) {
    const knownDynamicStores = ['shekha', 'indeesh'];
    const effectiveSlug = storeSlug || knownDynamicStores.find(s => imagePath.includes(s)) || (imagePath.includes('shekha') ? 'shekha' : undefined);
    
    if (effectiveSlug) {
      const filename = imagePath.split('/').pop() || imagePath;
      // محاولة المسار الأكثر دقة أولاً، وسيتم التعامل مع البدائل في onError إذا لزم الأمر
      return `${SUPABASE_PUBLIC_URL}/sliders/stores/${effectiveSlug}/sliders/${filename}`;
    }
  }

  if (imagePath.startsWith('/AdsForms/') || 
      imagePath.startsWith('/data/') || 
      imagePath.startsWith('/logo-brands/')) {
    return imagePath;
  }

  // 4. Performance: Direct Supabase URL for uploaded assets
  if (!imagePath.startsWith('/') && imagePath.includes('.')) {
    // إذا كان المسار يحتوي بالفعل على هيكل المجلدات الصحيح، نستخدمه مباشرة
    if (imagePath.includes('stores/') && (imagePath.includes('/sliders/') || imagePath.includes('/products/') || imagePath.includes('/logo/'))) {
      return `${SUPABASE_PUBLIC_URL}/${imagePath}`;
    }
    
    // إذا كان المسار يبدأ بالمجلد الأساسي (sliders/ أو products/ أو logo/) ولكن ينقصه الـ stores/
    // وكان لدينا storeSlug، نقوم بتصحيح المسار
    const baseFolders = ['sliders/', 'products/', 'logo/'];
    const matchedFolder = baseFolders.find(f => imagePath.startsWith(f));
    
    if (matchedFolder && storeSlug) {
      const fileName = imagePath.replace(matchedFolder, '');
      const folder = matchedFolder.replace('/', '');
      return `${SUPABASE_PUBLIC_URL}/${folder}/stores/${storeSlug}/${folder}/${fileName}`;
    }

    // إذا كان المسار يبدأ بالمجلد الأساسي، نستخدمه كما هو (للملفات العامة)
    if (matchedFolder) {
      return `${SUPABASE_PUBLIC_URL}/${imagePath}`;
    }

    // إذا كان مجرد اسم ملف بسيط، نقوم ببناء المسار الكامل بناءً على نوع الصورة والمتجر
    const folder = imageType === 'products' ? 'products' : (imageType === 'sliders' ? 'sliders' : 'logo');
    if (storeSlug) {
      return `${SUPABASE_PUBLIC_URL}/${folder}/stores/${storeSlug}/${folder}/${imagePath}`;
    }
    
    // كخيار أخير، نضعه في المجلد العام للنوع
    return `${SUPABASE_PUBLIC_URL}/${folder}/${imagePath}`;
  }

  if (base) {
    // Ensure relative paths from backend are prefixed
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${base}${cleanPath}`;
  }

  return imagePath;
};

export const convertProductImages = (
  images: string[] | undefined,
  storeSlug?: string | undefined
): string[] => {
  if (!images || images.length === 0) return [];
  
  return images.map(img => getProxyImageUrl(img, storeSlug, 'products'));
};
