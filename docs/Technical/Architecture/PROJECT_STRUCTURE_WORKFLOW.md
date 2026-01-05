# 🏗️ هيكلية المشروع وسير العمل - Project Structure & Workflow

**تاريخ التحديث:** 28 ديسمبر 2025
**الحالة:** Production (Cloud-Based)

---

## 1. نظرة عامة على النظام (System Overview)

منصة **إشروا (Eishro)** هي منصة تجارة إلكترونية متعددة المتاجر (Multi-Store Platform) تعمل بالكامل على السحابة (Cloud).

### 🌐 البنية التحتية (Infrastructure)
*   **Frontend:** React (Vite) + Tailwind CSS - مستضاف على **Vercel**.
*   **Backend:** Node.js + Express - مستضاف على **Render/Koyeb**.
*   **Database:** MongoDB Atlas (Cloud Database).
*   **Media Storage:** Cloudinary (لإدارة الصور والوسائط).
*   **Authentication:** JWT (JSON Web Tokens) مع حماية XSS/CSRF.

---

## 2. مخطط سير العمل (Workflow Diagram)

### 🛒 سيناريو الشراء الكامل (End-to-End Purchase Flow)

#### المرحلة 1: التصفح والاكتشاف (Discovery)
1.  **الزائر** يدخل المنصة.
2.  **Frontend** يطلب قائمة المتاجر `GET /api/stores`.
3.  **Backend** يستعلم من MongoDB ويعيد البيانات.
4.  يتم عرض المتاجر في `UnifiedStoreSlider`.
5.  الزائر يختار متجراً (مثلاً: Delta Store).

#### المرحلة 2: اختيار المنتجات (Selection)
1.  تحميل منتجات المتجر `GET /api/products?store_id=X`.
2.  عرض المنتجات مع "شارات" (Badges) وحالة التوفر.
3.  الزائر يضيف منتجاً للسلة.
    *   يتم التحقق من المخزون في الـ Backend.
    *   يتم تحديث `CartState` محلياً ومزامنتها مع الخادم.

#### المرحلة 3: الدفع وإتمام الطلب (Checkout)
1.  تسجيل الدخول/إنشاء حساب (مع `autoComplete=off` لخصوصية البيانات).
2.  إدخال بيانات الشحن (المدينة، العنوان).
3.  اختيار طريقة الدفع (دفع عند الاستلام / معاملات).
4.  **تأكيد الطلب:**
    *   `POST /api/orders`
    *   خصم الكمية من المخزون (Transaction).
    *   إرسال إشعار للمتجر (Merchant Dashboard).
    *   عرض صفحة النجاح والفاتورة للعميل.

---

## 3. هيكلية المجلدات (Folder Structure)

```text
/
├── backend/                 # كود الخادم (Node.js/Express)
│   ├── src/
│   │   ├── controllers/     # منطق العمل (Orders, Products, Auth)
│   │   ├── models/          # نماذج قواعد البيانات (Mongoose Schemas)
│   │   ├── routes/          # تعريف روابط الـ API
│   │   └── middleware/      # حماية وتحقق (AuthMiddleware)
│   └── ...
│
├── src/                     # كود الواجهة الأمامية (React)
│   ├── components/          # المكونات المعاد استخدامها (Sliders, Cards)
│   ├── pages/               # صفحات الموقع (StorePage, Checkout, Dashboard)
│   ├── hooks/               # منطق الحالة (useCart, useAuth)
│   └── services/            # الاتصال بالـ API (api.ts)
│
└── docs/                    # التوثيق والمستندات
    ├── General/             # وثائق عامة وإدارية
    ├── Technical/           # وثائق تقنية وهندسية
    ├── Security/            # وثائق الحماية والأمان
    ├── UserManuals/         # أدلة الاستخدام
    └── Support/             # الدعم الفني وحل المشاكل
```

## 4. تدفق البيانات (Data Flow)

`Client (React)` <--> `Secure API (HTTPS)` <--> `Controller` <--> `Service Layer` <--> `MongoDB Atlas`

*   **الصور:** يتم رفعها مباشرة أو عبر وسيط إلى Cloudinary ويخزن الرابط فقط في قاعدة البيانات.
*   **الجلسات:** لا يتم تخزين جلسات في السيرفر (Stateless JWT)، مما يسهل التوسع (Scaling).
