// نظام المصادقة المحسن للتجار
// Enhanced Authentication System for Merchants

import { enhancedDatabase, type MerchantData } from './enhancedDatabase';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthSession {
  id: string;
  email: string;
  name: string;
  storeName: string;
  loginTime: string;
  lastActivity?: string;
  userType?: string;
  token?: string;
}

class AuthManager {
  private readonly SESSION_KEY = 'eshro_current_merchant';
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 ساعة

  constructor() {
    this.initializeAuth();
  }

  // تسجيل الدخول
  login(credentials: LoginCredentials): { success: boolean; message: string; merchant?: MerchantData } {
    try {
      // البحث عن التاجر بالبريد الإلكتروني
      const merchant = enhancedDatabase.getMerchantByEmail(credentials.email);
      
      if (!merchant) {
        return {
          success: false,
          message: 'البريد الإلكتروني غير مسجل في النظام'
        };
      }

      if (!merchant.isActive) {
        return {
          success: false,
          message: 'الحساب معطل. يرجى التواصل مع الدعم الفني'
        };
      }

      // فحص كلمة المرور (في النسخة الحقيقية يجب استخدام تشفير)
      if (merchant.password !== credentials.password) {
        return {
          success: false,
          message: 'كلمة المرور غير صحيحة'
        };
      }

      // إنشاء جلسة جديدة
      const session: AuthSession = {
        id: merchant.id,
        email: merchant.email,
        name: merchant.name,
        storeName: merchant.storeName,
        loginTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        userType: 'merchant'
      };

      // حفظ الجلسة
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

      // تحديث آخر تسجيل دخول
      merchant.lastLoginAt = new Date().toISOString();
      merchant.updatedAt = new Date().toISOString();
      enhancedDatabase.saveMerchant(merchant);

      return {
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        merchant
      };

    } catch (error) {
      return {
        success: false,
        message: 'حدث خطأ أثناء تسجيل الدخول'
      };
    }
  }

  // تسجيل الخروج
  logout(): boolean {
    try {
      localStorage.removeItem(this.SESSION_KEY);
      return true;
    } catch (error) {
      return false;
    }
  }

  // التحقق من الجلسة النشطة
  isAuthenticated(): boolean {
    try {
      const session = this.getSession();
      if (!session) return false;

      // فحص انتهاء الجلسة
      const loginTime = new Date(session.loginTime).getTime();
      const now = Date.now();
      const timeDiff = now - loginTime;

      if (timeDiff > this.SESSION_TIMEOUT) {
        this.logout();
        return false;
      }

      // تحديث آخر نشاط
      this.updateLastActivity();
      return true;

    } catch (error) {
      return false;
    }
  }

  // جلب الجلسة الحالية
  getSession(): AuthSession | null {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      return null;
    }
  }

  // جلب بيانات التاجر الحالي
  getCurrentMerchant(): MerchantData | null {
    try {
      const session = this.getSession();
      if (!session) return null;

      return enhancedDatabase.getMerchantById(session.id);
    } catch (error) {
      return null;
    }
  }

  // تحديث آخر نشاط
  private updateLastActivity(): void {
    try {
      const session = this.getSession();
      if (session) {
        session.lastActivity = new Date().toISOString();
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      }
    } catch (error) {
      // Silently handle error
    }
  }

  // فحص انتهاء الجلسة
  isSessionExpired(): boolean {
    try {
      const session = this.getSession();
      if (!session) return true;

      const loginTime = new Date(session.loginTime).getTime();
      const now = Date.now();
      const timeDiff = now - loginTime;

      return timeDiff > this.SESSION_TIMEOUT;
    } catch (error) {
      return true;
    }
  }

  // تمديد الجلسة
  extendSession(): boolean {
    try {
      const session = this.getSession();
      if (session) {
        session.loginTime = new Date().toISOString();
        session.lastActivity = session.loginTime;
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // إنشاء حساب جديد
  register(merchantData: Omit<MerchantData, 'id' | 'createdAt' | 'updatedAt'>): { success: boolean; message: string; merchantId?: string } {
    try {
      // فحص إذا كان البريد الإلكتروني مسجل بالفعل
      const existingMerchant = enhancedDatabase.getMerchantByEmail(merchantData.email);
      if (existingMerchant) {
        return {
          success: false,
          message: 'البريد الإلكتروني مسجل بالفعل في النظام'
        };
      }

      // إنشاء ID فريد
      const merchantId = `merchant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // إنشاء التاجر الجديد
      const newMerchant: MerchantData = {
        ...merchantData,
        id: merchantId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // حفظ التاجر
      const saved = enhancedDatabase.saveMerchant(newMerchant);
      if (!saved) {
        return {
          success: false,
          message: 'فشل في حفظ بيانات التاجر'
        };
      }

      // إنشاء تصنيفات افتراضية مرتبطة بنشاط التاجر
      this.createDefaultCategories(merchantId, merchantData.businessType);

      return {
        success: true,
        message: 'تم إنشاء الحساب بنجاح',
        merchantId
      };

    } catch (error) {
      return {
        success: false,
        message: 'حدث خطأ أثناء إنشاء الحساب'
      };
    }
  }

  // إنشاء تصنيفات افتراضية حسب النشاط
  private createDefaultCategories(merchantId: string, businessType: string): void {
    try {
      const defaultCategories = this.getDefaultCategoriesByBusinessType(businessType);
      
      if (!defaultCategories) return;
      
      defaultCategories.forEach((category, index) => {
        const categoryData = {
          id: `cat_${businessType}_${index + 1}_${Date.now()}`,
          merchantId,
          nameAr: category.nameAr,
          nameEn: category.nameEn,
          descriptionAr: category.descriptionAr,
          businessType,
          sortOrder: index + 1,
          isActive: true,
          productsCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        enhancedDatabase.saveCategory(categoryData);
      });

    } catch (error) {
      // Silently handle error
    }
  }

  // التصنيفات الافتراضية حسب النشاط التجاري
  private getDefaultCategoriesByBusinessType(businessType: string) {
    const categoriesMap: Record<string, any[]> = {
      beauty: [
        {
          nameAr: 'العطور',
          nameEn: 'Perfumes',
          descriptionAr: 'مجموعة متنوعة من أجود العطور'
        },
        {
          nameAr: 'منتجات العناية الشخصية',
          nameEn: 'Personal Care',
          descriptionAr: 'منتجات العناية اليومية والشخصية'
        },
        {
          nameAr: 'مستحضرات التجميل',
          nameEn: 'Cosmetics',
          descriptionAr: 'مستحضرات التجميل والعناية بالبشرة'
        }
      ],
      fashion: [
        {
          nameAr: 'ملابس نسائية',
          nameEn: 'Women Clothing',
          descriptionAr: 'أحدث صيحات الأزياء النسائية'
        },
        {
          nameAr: 'ملابس رجالية',
          nameEn: 'Men Clothing',
          descriptionAr: 'أزياء عصرية للرجال'
        },
        {
          nameAr: 'الإكسسوارات',
          nameEn: 'Accessories',
          descriptionAr: 'إكسسوارات متنوعة للموضة'
        }
      ],
      electronics: [
        {
          nameAr: 'الهواتف الذكية',
          nameEn: 'Smartphones',
          descriptionAr: 'أحدث الهواتف والتقنيات'
        },
        {
          nameAr: 'الأجهزة المنزلية',
          nameEn: 'Home Appliances',
          descriptionAr: 'أجهزة كهربائية للمطبخ والمنزل'
        },
        {
          nameAr: 'الأجهزة التقنية',
          nameEn: 'Tech Devices',
          descriptionAr: 'أجهزة وحاسوبات متطورة'
        }
      ],
      cleaning: [
        {
          nameAr: 'منتجات التنظيف',
          nameEn: 'Cleaning Products',
          descriptionAr: 'مواد تنظيف متنوعة للمنزل'
        },
        {
          nameAr: 'منتجات العناية المنزلية',
          nameEn: 'Home Care',
          descriptionAr: 'منتجات للعناية والصيانة المنزلية'
        }
      ],
      food: [
        {
          nameAr: 'المواد الغذائية',
          nameEn: 'Food Items',
          descriptionAr: 'مواد غذائية طازجة ومعبأة'
        },
        {
          nameAr: 'المشروبات',
          nameEn: 'Beverages',
          descriptionAr: 'مجموعة واسعة من المشروبات'
        }
      ]
    };

    return categoriesMap[businessType] || categoriesMap.beauty; // افتراضي للجمال
  }

  // تهيئة المصادقة
  private initializeAuth(): void {
    try {
      // فحص الجلسة الموجودة عند تحميل الصفحة
      if (this.isSessionExpired()) {
        this.logout();
      }

      // إضافة مستمع للتغييرات في localStorage
      window.addEventListener('storage', (event) => {
        if (event.key === this.SESSION_KEY && !event.newValue) {
          // تم حذف الجلسة من تبويب آخر - لا حاجة لتسجيل هذا
        }
      });

    } catch (error) {
      // Silently handle error
    }
  }

  // إحصائيات المصادقة
  getAuthStats(): {
    isAuthenticated: boolean;
    currentMerchant: MerchantData | null;
    sessionAge: number; // بالدقائق
    lastActivity: string | null;
  } {
    const session = this.getSession();
    const merchant = this.getCurrentMerchant();
    
    let sessionAge = 0;
    let lastActivity: string | null = null;

    if (session) {
      const loginTime = new Date(session.loginTime).getTime();
      const now = Date.now();
      sessionAge = Math.floor((now - loginTime) / (1000 * 60)); // بالدقائق
      lastActivity = session.lastActivity || null;
    }

    return {
      isAuthenticated: this.isAuthenticated(),
      currentMerchant: merchant,
      sessionAge,
      lastActivity
    };
  }
}

export const authManager = new AuthManager();
export type { LoginCredentials, AuthSession };
