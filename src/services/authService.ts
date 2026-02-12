import { getApiUrl } from '@/utils/apiConfig';

export interface AuthSession {
  id: number;
  email: string;
  storeName?: string;
  subdomain?: string;
  storeSlug?: string;
  role: 'merchant' | 'admin' | 'user';
  token?: string;
  refreshToken?: string;
  setupComplete: boolean;
  loginTime: string;
  lastActivity?: string;
}

class AuthService {
  private readonly API_URL = getApiUrl();
  private readonly SESSION_KEY = 'eshro_current_merchant';
  private readonly USER_KEY = 'eshro_current_user';
  private readonly STORES_LIST_KEY = 'eshro_stores';
  private readonly USERS_LIST_KEY = 'eshro_users';
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  /**
   * تسجيل الدخول مع محاولات إعادة الاتصال (Retry Logic)
   */
  async login(email: string, password: string): Promise<{ success: boolean; user?: AuthSession; error?: string }> {
    // 1. تحقق من الكاش أولاً
    const cachedUser = this.getCachedUser();
    if (cachedUser && cachedUser.email === email) {
      this.saveSession(cachedUser);
      return { success: true, user: cachedUser };
    }

    let lastError = '';
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(`${this.API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const serverUser = data.data.user;
          const session: AuthSession = {
            ...serverUser,
            token: data.data.token,
            refreshToken: data.data.refreshToken,
            role: serverUser.role || 'merchant',
            setupComplete: true,
            loginTime: new Date().toISOString()
          };

          this.saveSession(session);
          this.setCachedUser(session);
          return { success: true, user: session };
        } else {
          lastError = data.message || 'فشل تسجيل الدخول من الخادم';
          
          // إذا كان الخطأ بسبب بيانات الاعتماد، لا تكرر المحاولة
          if (response.status === 401 || response.status === 404) {
            return { success: false, error: lastError };
          }
          
          throw new Error(lastError);
        }
      } catch (error: any) {
        console.warn(`Login attempt ${attempt} failed:`, error.message);
        lastError = error.message;

        if (attempt === this.MAX_RETRIES) {
          // محاولة البحث المحلي كخيار أخير
          return this.localLoginFallback(email, password);
        }

        // انتظار تصاعدي قبل المحاولة التالية
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
      }
    }

    return { success: false, error: lastError };
  }

  private setCachedUser(user: AuthSession): void {
    const cacheData = {
      user,
      timestamp: Date.now()
    };
    localStorage.setItem('eshro_user_cache', JSON.stringify(cacheData));
  }

  private getCachedUser(): AuthSession | null {
    const cacheData = localStorage.getItem('eshro_user_cache');
    if (!cacheData) return null;

    try {
      const { user, timestamp } = JSON.parse(cacheData);
      if (Date.now() - timestamp > this.CACHE_TTL) {
        localStorage.removeItem('eshro_user_cache');
        return null;
      }
      return user;
    } catch {
      return null;
    }
  }

  /**
   * البحث المحلي في حال انقطاع الإنترنت (Fallback)
   */
  private localLoginFallback(email: string, password: string): { success: boolean; user?: AuthSession; error?: string } {
    // 1. التحقق من المتاجر
    const stores = JSON.parse(localStorage.getItem(this.STORES_LIST_KEY) || '[]');
    const localMerchant = stores.find((s: any) => s.email === email && s.password === password);

    if (localMerchant) {
      const session: AuthSession = {
        ...localMerchant,
        role: 'merchant',
        loginTime: new Date().toISOString()
      };
      this.saveSession(session);
      return { success: true, user: session };
    }

    // 2. التحقق من المستخدمين العاديين
    const users = JSON.parse(localStorage.getItem(this.USERS_LIST_KEY) || '[]');
    const localUser = users.find((u: any) => (u.email === email || u.phone === email) && u.password === password);

    if (localUser) {
      const session: AuthSession = {
        ...localUser,
        role: 'user',
        setupComplete: true,
        loginTime: new Date().toISOString()
      };
      this.saveSession(session);
      return { success: true, user: session };
    }

    // 3. التحقق من المسؤول (Admin)
    if (email === 'admin@eshro.ly' && password === 'admin123') {
      const session: AuthSession = {
        id: 0,
        email: 'admin@eshro.ly',
        role: 'admin',
        setupComplete: true,
        loginTime: new Date().toISOString()
      };
      this.saveSession(session);
      return { success: true, user: session };
    }

    return { success: false, error: 'فشل الاتصال بالخادم ولم يتم العثور على بيانات محلية مطابقة' };
  }

  /**
   * حفظ الجلسة ومزامنتها مع الذاكرة المحلية
   */
  saveSession(session: AuthSession): void {
    const sessionStr = JSON.stringify(session);
    localStorage.setItem(this.SESSION_KEY, sessionStr);
    localStorage.setItem(this.USER_KEY, sessionStr);
    localStorage.setItem('eshro_logged_in_as_merchant', session.role === 'merchant' ? 'true' : 'false');

    // مزامنة مع قائمة المتاجر المحلية لضمان الكاش المستقبلي
    const stores = JSON.parse(localStorage.getItem(this.STORES_LIST_KEY) || '[]');
    if (!stores.some((s: any) => s.email === session.email)) {
      stores.push(session);
      localStorage.setItem(this.STORES_LIST_KEY, JSON.stringify(stores));
    }
    
    // مزامنة مفتاح المتجر الفردي
    const slug = session.storeSlug || session.subdomain;
    if (slug) {
      localStorage.setItem(`store_${slug}`, JSON.stringify({ ...session, subdomain: slug, setupComplete: true }));
    }
  }

  /**
   * تسجيل الخروج وتطهير الجلسة
   */
  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('eshro_logged_in_as_merchant');
  }

  /**
   * التحقق من الجلسة الحالية
   */
  getCurrentSession(): AuthSession | null {
    const session = localStorage.getItem(this.SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }
}

export const authService = new AuthService();
export default authService;
