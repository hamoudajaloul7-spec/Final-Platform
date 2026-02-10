## التقرير التقني الشامل
## مشكلة تسجيل الدخول وفقدان بيانات المتاجر - منصة إشرو

---

### المحتويات
1. [ملخص تنفيذي](#ملخص-تنفيذي)
2. [تحليل الأخطاء](#تحليل-الأخطاء)
3. [السبب الجذري](#السبب-الجذري)
4. [الحلول المُنفذة](#الحلول-المنفذة)
5. [خطوات التنفيذ](#خطوات-التنفيذ)
6. [إرشادات لمنع تكرار المشكلة](#إرشادات-لمنع-تكرار-المشكلة)

---

## 1. ملخص تنفيذي

### المشكلة
بعد إنشاء متجر "shekha" آلياً عبر خطوات الـ 8، واجه المستخدم مشاكل متعددة:
- ❌ فشل تسجيل الدخول للواجهة التحكم للتاجر (خطأ 400)
- ❌ عدم ظهور المنتجات المشابهة في واجهة المنتج
- ❌ تحميل بيانات المتجر من ملف store.json يفشل (خطأ 404)
- ❌ واجهة التحكم تظهر مقتضبة (Overview + Logout فقط)

### الحل المُنفذ
✅ إنشاء Vercel Serverless Function لمعالجة طلبات تسجيل الدخول
✅ تحديث vercel.json لتوجيه API Login للـ Function
✅ إصلاح مشكلة تمرير body طلبات POST

---

## 2. تحليل الأخطاء

### خطأ تسجيل الدخول (400 Bad Request)

```
POST https://www.ishro.ly/api/auth/login
Response: 400 Bad Request
Body: {
  "error": "Validation failed",
  "details": {
    "email": ["Email is required"],
    "password": ["Password is required"]
  }
}
```

**مؤشر المشكلة:** الطلب يصل للسيرفر لكن body فارغ.
**السبب:** Vercel Rewrites لا تمرر body طلبات POST.

### خطأ ملف store.json (404 Not Found)

```
GET https://www.ishro.ly/assets/shekha/store.json
Response: 404 Not Found
```

**مؤشر المشكلة:** ملف البيانات المطلوب غير موجود.
**السبب:** ملف store.json لم يُرفع أو ضاع عند إعادة إنشاء المتجر.

---

## 3. السبب الجذري

### تقنية Vercel Rewrites

```
┌─────────────────────────────────────────────────────────────────┐
│                        Vercel Edge                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   POST /api/auth/login ──────Rewrite─────► Render Backend       │
│   (With Empty Body)           ▲                                   │
│                               │                                   │
│                      Problem: Body Lost                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**لماذا تحدث هذه المشكلة؟**
- Vercel Rewrites مصممة للاستخدام مع GET requests
- عند استخدام Rewrite لـ POST، يتم فقدان body الطلب
- هذا سلوك افتراضي في Vercel Edge Network

### لماذا حدث هذا الآن ولم يحدث مع المتاجر السابقة؟

1. **المتاجر القديمة:** تم إنشاؤها يدوياً وتعمل على Render مباشرة
2. **المتجر الجديد (shekha):** يُستضاف على Vercel ويستخدام rewrites
3. **تغيير البنية:** استخدام Vercel كـ proxy لـ Render بدون serverless functions

---

## 4. الحلول المُنفذة

### الحل 1: Vercel Serverless Function

**ملف:** `api/auth/login.js`

```javascript
export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({
        success: false,
        error: 'Validation failed',
        details: {
          email: email ? [] : ['Email is required'],
          password: password ? [] : ['Password is required']
        }
      });
    }

    const backendUrl = process.env.BACKEND_URL || 'https://final-platform-eshro.onrender.com';
    
    const backendResponse = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const responseData = await backendResponse.json();
    return response.status(backendResponse.status).json(responseData);
  } catch {
    return response.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
```

### الحل 2: تحديث vercel.json

**ملف:** `vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/api/auth/login",
      "destination": "/api/auth/login.js"
    },
    {
      "source": "/api/(.*)",
      "destination": "https://final-platform-eshro.onrender.com/api/$1"
    }
  ]
}
```

**ملاحظة:** `/api/auth/login` يُوجه الآن للـ Function وليس للـ Rewrite.

---

## 5. خطوات التنفيذ

### الخطوة 1: رفع التغييرات

```bash
git add api/auth/login.js vercel.json
git commit -m "Fix login: Use Vercel Serverless Function for auth"
git push origin main
```

### الخطوة 2: النشر التلقائي

Vercel سيكتشف التغييرات تلقائياً ونشرها.

### الخطوة 3: اختبار تسجيل الدخول

1. اذهب لـ https://www.ishro.ly
2. جرب تسجيل الدخول بـ:
   - Email: salem.mfurjani@gmail.com
   - Password: (كلمة المرور المُدخلة عند إنشاء المتجر)

### الخطوة 4: إنشاء ملف store.json

**يجب إنشاء ملف بيانات للمتجر يحتوي على:**

```json
{
  "slug": "shekha",
  "name": "متجر شيخة",
  "nameAr": "متجر شيخة",
  "nameEn": "Shekha Store",
  "description": "متجر متكامل...",
  "products": [...],
  "categories": [...],
  "sliders": [...]
}
```

**مكان الرفع:** `/public/assets/shekha/store.json`

---

## 6. إرشادات لمنع تكرار المشكلة

### للمتاجر الجديدة (الآلية)

1. **استخدام Serverless Functions**
   - ✅ جميع طلبات API POST يجب أن تمر عبر serverless functions
   - ❌ لا تستخدم rewrites لطلبات POST

2. **توحيد نظام المصادقة**
   - ✅ استخدم authService موحد في كل مكان
   - ✅ احفظ role: 'merchant' في session

3. **حفظ بيانات المتجر**
   - ✅ ارفع ملفات store.json فور إنشائها
   - ✅ احتفظ بنسخة احتياطية في GitHub
   - ✅ استخدم Supabase كـ backup

4. **إعداد Render بشكل صحيح**
   - ✅ seed_DB=false
   - ✅ BACKEND_URL=https://final-platform-eshro.onrender.com
   - ✅ SUPABASE_URL و SUPABASE_ANON_KEY صحيحة

### قائمة فحص قبل نشر أي متجر جديد

```
□ التحقق من Vercel Serverless Function يعمل
□ التحقق من ملف store.json موجود ومرفوع
□ التحقق من Supabase Storage يحتوي على صور المنتجات
□ التحقق من role='merchant' في session
□ التحقق من seed_DB=false على Render
□ اختبار تسجيل الدخول قبل إخبار المستخدم
```

---

## الخلاصة

| المشكلة | الحل | الحالة |
|---------|------|--------|
| تسجيل الدخول يفشل (400) | Vercel Serverless Function | ✅ مُنفذ |
| ملف store.json مفقود | إنشاء ورفع الملف | ⏳ يحتاج تنفيذ |
| المنتجات المشابهة لا تظهر | مراجعة productController | ⏳ يحتاج مراجعة |
| واجهة التحكم مقتضبة | التأكد من role='merchant' | ⏳ يحتاج مراجعة |

---

## الروابط المهمة

- **المنصة:** https://www.ishro.ly
- **الـ Backend:** https://final-platform-eshro.onrender.com
- **Supabase:** https://supabase.com/dashboard/project/wbakbuqvdbmweujkbzxn
- **Vercel:** https://vercel.com/dashboard

---

*تم إنشاء هذا التقرير في: 2026-02-08*
