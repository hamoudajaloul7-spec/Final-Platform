# دليل التنفيذ الفني الشامل 🛠️
## Tooltips + PDF + Intercom

---

## 📋 مقدمة

هذا الدليل يشرح كيفية تنفيذ وتكامل:
- ✅ نظام Tooltips الذكي
- ✅ دليل PDF التفاعلي
- ✅ دعم Intercom الحي

---

## **الجزء 1️⃣: نظام Tooltips الذكي**

### **البنية الأساسية**

```typescript
// src/components/Tooltip/TooltipProvider.tsx
import React, { createContext, useState } from 'react';

interface TooltipData {
  id: string;
  text_ar: string;
  text_en: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  icon?: string;
  type?: 'info' | 'warning' | 'success' | 'error';
}

export const TooltipContext = createContext<{
  showTooltip: (id: string) => void;
  hideTooltip: () => void;
  activeTooltip: string | null;
}>({
  showTooltip: () => {},
  hideTooltip: () => {},
  activeTooltip: null,
});

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  return (
    <TooltipContext.Provider
      value={{
        showTooltip: setActiveTooltip,
        hideTooltip: () => setActiveTooltip(null),
        activeTooltip,
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
}
```

### **مكون Tooltip التفاعلي**

```typescript
// src/components/Tooltip/Tooltip.tsx
import React, { useContext } from 'react';
import { TooltipContext } from './TooltipProvider';
import tooltips from '@/config/tooltips.json';
import { useLanguage } from '@/hooks/useLanguage';

interface TooltipProps {
  id: string;
  children: React.ReactNode;
}

export function Tooltip({ id, children }: TooltipProps) {
  const { activeTooltip, showTooltip, hideTooltip } = useContext(TooltipContext);
  const { language } = useLanguage();
  const tooltip = tooltips[id];

  if (!tooltip) return <>{children}</>;

  const text = language === 'ar' ? tooltip.text_ar : tooltip.text_en;
  const isActive = activeTooltip === id;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => showTooltip(id)}
      onMouseLeave={hideTooltip}
    >
      {children}
      
      {isActive && (
        <div
          className={`
            absolute z-50 p-3 bg-gray-900 text-white rounded-lg shadow-lg
            text-sm max-w-xs whitespace-normal
            ${tooltip.position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
            ${tooltip.position === 'left' ? 'right-full mr-2' : ''}
            ${tooltip.position === 'right' ? 'left-full ml-2' : ''}
          `}
        >
          {text}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
        </div>
      )}
    </div>
  );
}
```

### **استخدام Tooltip في النموذج**

```typescript
// src/pages/CreateStorePage.tsx
import { Tooltip } from '@/components/Tooltip/Tooltip';

export function CreateStorePage() {
  return (
    <form>
      <div className="mb-4">
        <Tooltip id="storeName">
          <label htmlFor="storeName" className="flex items-center gap-2">
            اسم المتجر
            <span className="text-blue-500 cursor-help">ℹ️</span>
          </label>
        </Tooltip>
        <input
          id="storeName"
          type="text"
          placeholder="أدخل اسم متجرك"
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div className="mb-4">
        <Tooltip id="subdomain">
          <label htmlFor="subdomain" className="flex items-center gap-2">
            اسم النطاق ⚠️
            <span className="text-red-500 cursor-help">!</span>
          </label>
        </Tooltip>
        <input
          id="subdomain"
          type="text"
          placeholder="your-store"
          className="w-full px-4 py-2 border border-red-300 rounded-lg"
        />
      </div>
    </form>
  );
}
```

### **تحميل Tooltips من JSON**

```typescript
// src/hooks/useTooltips.ts
import { useEffect, useState } from 'react';
import tooltipsData from '@/config/tooltips.json';

export function useTooltips() {
  const [tooltips, setTooltips] = useState(tooltipsData);

  useEffect(() => {
    // يمكن جلب الـ tooltips من API إذا لزم الأمر
    setTooltips(tooltipsData);
  }, []);

  return tooltips;
}
```

---

## **الجزء 2️⃣: دليل PDF التفاعلي**

### **استخدام jsPDF و html2canvas**

```bash
npm install jspdf html2canvas
```

### **مكون PDF Generator**

```typescript
// src/utils/generatePDF.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generateStoreCreationPDF() {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // العنوان الرئيسي
  pdf.setFontSize(24);
  pdf.text('دليل إنشاء المتجر', pageWidth / 2, 20, { align: 'center' });

  // محتوى Step 1
  let yPosition = 40;

  pdf.setFontSize(14);
  pdf.text('Step 1: معلومات التاجر الأساسية', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(11);
  const step1Content = [
    '• الاسم الكامل: اسمك الحقيقي كاملاً',
    '• البريد الإلكتروني: بريد نشط',
    '• رقم الهاتف: رقم واتس نشط',
    '• المدينة: موقعك الجغرافي',
  ];

  step1Content.forEach((line) => {
    pdf.text(line, 25, yPosition);
    yPosition += 8;
  });

  // أضف صفحات إضافية...
  
  // حفظ الملف
  pdf.save('store-creation-guide.pdf');
}
```

### **مكون تحميل PDF**

```typescript
// src/components/PDFDownloadButton.tsx
import React from 'react';
import { Download } from 'lucide-react';
import { generateStoreCreationPDF } from '@/utils/generatePDF';

export function PDFDownloadButton() {
  const handleDownload = async () => {
    try {
      await generateStoreCreationPDF();
      // رسالة نجاح (اختيارية)
      toast.success('تم تحميل الدليل بنجاح!');
    } catch (error) {
      toast.error('حدث خطأ في تحميل الدليل');
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
    >
      <Download className="w-4 h-4" />
      تحميل الدليل PDF
    </button>
  );
}
```

### **دمج في صفحة الإنشاء**

```typescript
// src/pages/CreateStorePage.tsx
import { PDFDownloadButton } from '@/components/PDFDownloadButton';

export function CreateStorePage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>إنشاء متجرك</h1>
        <PDFDownloadButton />
      </div>
      
      {/* باقي محتوى الصفحة */}
    </div>
  );
}
```

---

## **الجزء 3️⃣: تكامل Intercom**

### **ملف التكوين (.env)**

```env
VITE_INTERCOM_APP_ID=xxx123
VITE_INTERCOM_API_KEY=yyy456
```

### **مكون Intercom Widget**

```typescript
// src/components/Intercom/IntercomWidget.tsx
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

declare global {
  interface Window {
    Intercom?: (cmd: string, data?: any) => void;
    intercomSettings?: Record<string, any>;
  }
}

export function IntercomWidget() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // تحميل سكريبت Intercom
    const script = document.createElement('script');
    script.innerHTML = `
      window.intercomSettings = {
        api_base: "https://api-iam.intercom.io",
        app_id: "${import.meta.env.VITE_INTERCOM_APP_ID}",
        ${isAuthenticated && user ? `
        user_id: "${user.id}",
        name: "${user.name}",
        email: "${user.email}",
        created_at: ${Math.floor(new Date(user.createdAt).getTime() / 1000)},
        custom_attributes: {
          role: "${user.role}",
          store_id: "${user.storeId || 'none'}",
          store_name: "${user.storeName || 'none'}",
          account_type: "${user.accountType || 'visitor'}"
        }
        ` : ''}
      };
    `;
    document.head.appendChild(script);

    // تحميل الـ widget
    const widgetScript = document.createElement('script');
    widgetScript.src = `https://widget.intercom.io/widget/${import.meta.env.VITE_INTERCOM_APP_ID}`;
    widgetScript.async = true;
    document.head.appendChild(widgetScript);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
      if (widgetScript.parentNode) widgetScript.parentNode.removeChild(widgetScript);
    };
  }, [isAuthenticated, user]);

  return null;
}
```

### **دمج في App.tsx**

```typescript
// src/App.tsx
import { IntercomWidget } from '@/components/Intercom/IntercomWidget';
import { TooltipProvider } from '@/components/Tooltip/TooltipProvider';

export default function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <main>
          {/* المحتوى الأساسي */}
        </main>
        <IntercomWidget />
      </BrowserRouter>
    </TooltipProvider>
  );
}
```

### **خدمة Intercom للرسائل الآلية**

```typescript
// src/services/intercomService.ts
export const intercomService = {
  // إرسال تنبيه عند إنشاء متجر جديد
  notifyNewStore: (storeData: any) => {
    if (window.Intercom) {
      window.Intercom('trackEvent', 'new_store_created', {
        store_id: storeData.id,
        store_name: storeData.name,
        timestamp: new Date().toISOString(),
      });
    }
  },

  // إرسال رسالة شخصية
  sendMessage: (message: string) => {
    if (window.Intercom) {
      window.Intercom('showNewMessage', message);
    }
  },

  // تسجيل أحداث مهمة
  trackEvent: (eventName: string, data?: any) => {
    if (window.Intercom) {
      window.Intercom('trackEvent', eventName, data);
    }
  },

  // تحديث بيانات المستخدم
  updateUser: (userData: Record<string, any>) => {
    if (window.Intercom) {
      window.Intercom('update', userData);
    }
  },
};
```

---

## **الجزء 4️⃣: نقاط التكامل المهمة**

### **عند بدء إنشاء المتجر**

```typescript
// src/pages/CreateStorePage.tsx
import { intercomService } from '@/services/intercomService';
import { useLanguage } from '@/hooks/useLanguage';

export function CreateStorePage() {
  const { language } = useLanguage();

  useEffect(() => {
    // إظهار رسالة ترحيب من Intercom
    const welcomeMsg = language === 'ar'
      ? 'هلاً! نحن هنا لمساعدتك في كل خطوة 😊'
      : 'Hi! We are here to help you every step of the way 😊';
    
    intercomService.sendMessage(welcomeMsg);

    // تسجيل حدث البدء
    intercomService.trackEvent('store_creation_started');

    // تحديث بيانات المستخدم
    intercomService.updateUser({
      custom_attributes: {
        current_step: 1,
        creation_started_at: new Date().toISOString(),
      },
    });
  }, [language]);

  return (
    // محتوى الصفحة
  );
}
```

### **عند إكمال كل خطوة**

```typescript
// src/hooks/useStepCompletion.ts
import { intercomService } from '@/services/intercomService';

export function useStepCompletion(stepNumber: number) {
  const completeStep = () => {
    // تسجيل إكمال الخطوة
    intercomService.trackEvent(`step_${stepNumber}_completed`);

    // تحديث البيانات
    intercomService.updateUser({
      custom_attributes: {
        completed_step: stepNumber,
        last_step_at: new Date().toISOString(),
      },
    });

    // إظهار رسالة تشجيع
    const encouragingMessages = [
      'رائع! أنت تقدم بشكل جيد 🚀',
      'تمام! الخطوة التالية أسهل 💪',
      'ممتاز! أنت قريب من النهاية ✨',
    ];
    
    intercomService.sendMessage(
      encouragingMessages[stepNumber % encouragingMessages.length]
    );
  };

  return { completeStep };
}
```

### **عند إنشاء المتجر بنجاح**

```typescript
// src/pages/StoreCreationSuccess.tsx
import { intercomService } from '@/services/intercomService';

export function StoreCreationSuccess({ store }: { store: Store }) {
  useEffect(() => {
    // إرسال حدث النجاح
    intercomService.notifyNewStore(store);

    // رسالة تهنئة
    intercomService.sendMessage(
      `تهانينا! متجرك "${store.name}" جاهز الآن! 🎉`
    );

    // تسجيل المتجر المنشأ
    intercomService.trackEvent('store_creation_completed', {
      store_id: store.id,
      store_name: store.name,
      total_products: store.products?.length || 0,
    });
  }, [store]);

  return (
    // محتوى الصفحة
  );
}
```

---

## **الجزء 5️⃣: قائمة التحقق النهائية**

### **Tooltips:**
- [ ] مكون Tooltip منشأ
- [ ] TooltipProvider مدرج
- [ ] tooltips.json في المسار الصحيح
- [ ] يظهر على جميع الحقول المهمة
- [ ] يعمل على الجوال أيضاً

### **PDF:**
- [ ] مكتبة jsPDF مثبتة
- [ ] generatePDF تعمل بشكل صحيح
- [ ] زر التحميل موجود
- [ ] المحتوى محدث ودقيق
- [ ] يعمل على جميع المتصفحات

### **Intercom:**
- [ ] حساب Intercom منشأ
- [ ] App ID و API Key مضبوطة
- [ ] مكون IntercomWidget مدرج
- [ ] الرسائل تظهر صحيحة
- [ ] التتبع يعمل بشكل صحيح

---

## **نصائح الأداء**

```typescript
// تأخير تحميل Intercom لتسريع الصفحة الأولى
const IntercomWidgetLazy = React.lazy(() =>
  import('@/components/Intercom/IntercomWidget').then(m => ({
    default: m.IntercomWidget
  }))
);

// استخدام في App.tsx
<Suspense fallback={null}>
  <IntercomWidgetLazy />
</Suspense>
```

---

## **الخطوات التالية**

1. ✅ تثبيت جميع المكتبات المطلوبة
2. ✅ إنشاء ملف .env مع المفاتيح
3. ✅ تنفيذ مكونات Tooltip
4. ✅ تنفيذ PDF Generator
5. ✅ تنفيذ Intercom Integration
6. ✅ الاختبار الشامل
7. ✅ النشر إلى الإنتاج

---

**🎯 النتيجة:** تجربة مستخدم احترافية مع دعم شامل! ✨
