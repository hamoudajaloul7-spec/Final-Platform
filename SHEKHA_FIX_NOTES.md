# تصحيحات مشكلة متجر شيخة

## المشكلة الأساسية
عند النقر على منتج في متجر شيخة، كان يعرض "هذا المنتج غير متوفر حالياً" حتى للمنتجات المتوفرة.

## التحليل
1. متجر `shekha` هو متجر ديناميكي (بدون ملفات محلية في `src/data/stores/shekha/`)
2. يعتمد على API كلياً: `/api/stores/public/shekha`
3. بيانات من API قد تأتي بصيغ مختلفة للتوفر (مثل: `stock`, `availability`, `status` بدلاً من `inStock`)

## الإصلاحات المطبقة

### 1. تحسين دالة `normalizeApiProduct` (src/utils/storeConfigLoader.ts)
- الآن تتحقق من **جميع الصيغ المحتملة** للكمية والتوفر:
  - `quantity`, `stock`, `available_quantity`, `availableQuantity`
  - `inStock`, `isAvailable`, `availability`, `status`
- تعطي الأولوية لـ `quantity` كمؤشر أساسي للتوفر
- تتعامل مع قيم `null` و `undefined` بشكل صحيح

### 2. تطبيق `normalizeApiProduct` على المنتجات المحلية أيضاً (src/utils/storeLoader.ts:202)
- تأكد أن جميع المنتجات (محلية وAPI) تمر عبر نفس معالجة التوفر

## النقاط المهمة

### إذا استمرت المشكلة بعد الرفع:
1. **تحقق من response API**:
   - افتح DevTools (F12) → Network
   - ابحث عن `/api/stores/public/shekha`
   - فحص البيانات - هل تحتوي على `quantity` أو `inStock`؟

2. **تحقق من localStorage** (في Console):
   ```javascript
   JSON.parse(localStorage.getItem('store_products_shekha'))?.slice(0,1)
   ```
   - هل البيانات محفوظة بشكل صحيح؟

3. **المشاكل المحتملة الأخرى**:
   - API لا يرجع البيانات على الإطلاق
   - البيانات تأتي بـ `quantity: 0` فعلاً
   - صيغة البيانات من API مختلفة عما متوقع

## خطوات الاختبار
1. ادخل متجر شيخة
2. انقر على أي منتج
3. يجب أن يعرض صفحة المنتج الكاملة
4. إذا كان المنتج متوفر، يجب أن يظهر "أضف للسلة" و "اشتري الآن"
5. إذا كان غير متوفر، يجب أن يظهر "نبهني عند التوفر"

## الملفات المعدلة
- `src/utils/storeConfigLoader.ts` - تحسين `normalizeApiProduct`
- `src/utils/storeLoader.ts` - تطبيق التطبيع على جميع المنتجات
