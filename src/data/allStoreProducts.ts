// بيانات شاملة لجميع المنتجات في جميع المتاجر
import type { Product } from './storeProducts';
import { nawaemProducts } from './stores/nawaem/products';
import { sheirineProducts } from './stores/sheirine/products';
import { deltaProducts } from './stores/delta-store/products';
import { magnaBeautyProducts as importedMagnaBeautyProducts } from './stores/magna-beauty/products';
import { indeeshProducts } from './stores/indeesh/products';
import { prettyProducts } from './stores/pretty/products';
import { mkanekProducts } from './stores/mkanek/products';
import { comfyProducts } from './stores/comfy/products';
import { maknoonProducts } from './stores/maknoon/products';
import { tohfaProducts } from './stores/tohfa/products';
import { brushtblueProducts } from './stores/brushtblue/products';
import { tlcwatchesProducts } from './stores/tlcwatches/products';
import { unpassoProducts } from './stores/unpasso/products';
import { eylulProducts } from './stores/eylul/products';
import { cozetboutiqueProducts } from './stores/cozetboutique/products';
import { alwardaalbaydaProducts } from './stores/alwardaalbayda/products';
import { calculateBadge } from '@/utils/badgeCalculator';

// أيقونات المتاجر والفئات
export const storeIcons = {
  1: "👑", // نواعم - أزياء راقية
  2: "✨", // شيرين - أزياء
  3: "🧴", // بريتي - عطور وتجميل
  4: "🛍️", // دلتا ستور - أزياء عائلية
  5: "💄", // ماجنا بيوتي - تجميل  
  6: "🛋️", // مكانك - أثاث
  7: "👟", // كومفي - رياضة
  8: "💎", // مكنون - مجوهرات
  10: "🏺", // تحفة - تراث
  11: "🎨", // برشت بلو - فنون
  13: "👞", // ان باسو - أحذية
  16: "🌸", // الوردة البيضاء - عطور وورود
  17: "⌚", // الركن الليبي - ساعات
  18: "👗", // أيلول - أزياء تركية
  19: "👜", // كوزيت بوتيك - حقائب وإكسسوارات
  1764003948994: "🧹", // انديش - مواد تنظيف
};

// ألوان المتاجر
export const storeColors = {
  1: "from-amber-400 to-yellow-600", // نواعم
  2: "from-pink-400 to-purple-600", // شيرين
  3: "from-rose-400 to-pink-600", // بريتي
  4: "from-blue-400 to-cyan-600", // دلتا ستور
  5: "from-purple-500 to-violet-600", // ماجنا بيوتي
  6: "from-blue-500 to-indigo-600", // مكانك
  7: "from-green-500 to-emerald-600", // كومفي
  8: "from-yellow-500 to-orange-600", // مكنون
  10: "from-orange-500 to-red-600", // تحفة
  11: "from-cyan-500 to-blue-600", // برشت بلو
  13: "from-stone-500 to-neutral-700", // ان باسو
  16: "from-pink-200 to-rose-400", // الوردة البيضاء
  17: "from-gray-500 to-slate-600", // الركن الليبي
  18: "from-teal-400 to-emerald-600", // أيلول
  19: "from-amber-600 to-yellow-800", // كوزيت بوتيك
  1764003948994: "from-blue-300 to-blue-500", // انديش
};

const MAGNA_BEAUTY_STORE_ID = 5;

// استخدام magnaBeautyProducts المستورد بدلاً من تعريفه محلياً
const magnaBeautyProducts = importedMagnaBeautyProducts;

// تم نقل جميع منتجات المتاجر إلى ملفاتهم الخاصة في src/data/stores/
// لضمان مصدر واحد للحقيقة وتسهيل إدارة البيانات

const applyAutoBadges = (products: Product[]): Product[] => {
  return products.map(product => {
    const badge = calculateBadge(product);
    return {
      ...product,
      badge,
      tags: product.tags ? [...new Set([...product.tags, badge])] : [badge]
    };
  });
};

// تصدير المنتجات الشاملة - استخدام المنتجات الحقيقية للمتاجر
export const allStoreProducts: Product[] = applyAutoBadges([
  ...indeeshProducts,
  ...nawaemProducts,
  ...sheirineProducts,
  ...deltaProducts,
  ...magnaBeautyProducts,
  ...prettyProducts,
  ...mkanekProducts,
  ...comfyProducts,
  ...maknoonProducts,
  ...tohfaProducts,
  ...brushtblueProducts,
  ...tlcwatchesProducts,
  ...unpassoProducts,
  ...eylulProducts,
  ...cozetboutiqueProducts,
  ...alwardaalbaydaProducts
]);

// دالة للحصول على منتجات متجر معين
export const getStoreProducts = (storeId: number): Product[] => {
  return allStoreProducts.filter(product => product.storeId === storeId);
};

// دالة للحصول على المنتجات المخفضة
export const getDiscountedProducts = (storeId?: number): Product[] => {
  const products = storeId 
    ? allStoreProducts.filter(p => p.storeId === storeId)
    : allStoreProducts;
  
  return products.filter(product => product.originalPrice > product.price);
};

// دالة للحصول على المنتجات الجديدة
export const getNewProducts = (storeId?: number): Product[] => {
  const products = storeId 
    ? allStoreProducts.filter(p => p.storeId === storeId)
    : allStoreProducts;
  
  return products.filter(product => product.tags.includes('جديد'));
};
