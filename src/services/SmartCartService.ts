import { allStoreProducts } from '@/data/allStoreProducts';

export interface CartItem {
  id: number;
  product: any;
  size: string;
  color: string;
  quantity: number;
  addedAt: Date;
  deviceId: string;
}

export interface WishlistItem {
  id: number;
  product: any;
  addedAt: Date;
  shared: boolean;
  sharedBy?: string;
}

export interface CartSuggestion {
  product: any;
  reason: 'frequently_bought' | 'similar' | 'complementary' | 'popular';
  confidence: number;
}

class SmartCartService {
  private deviceId: string;

  constructor() {
    this.deviceId = this.getOrCreateDeviceId();
  }

  static getInstance(): SmartCartService {
    return new SmartCartService();
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('eshro_device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('eshro_device_id', deviceId);
    }
    return deviceId;
  }

  // حفظ السلة عبر الأجهزة
  saveCartAcrossDevices(cartItems: CartItem[]): void {
    const cartData = {
      items: cartItems.map(item => ({
        ...item,
        deviceId: this.deviceId,
        lastModified: new Date().toISOString()
      })),
      lastSync: new Date().toISOString(),
      deviceId: this.deviceId
    };

    // حفظ محلياً
    localStorage.setItem('eshro_smart_cart', JSON.stringify(cartData));

    // محاكاة حفظ في السحابة (في التطبيق الحقيقي سيتم إرسال للخادم)
    this.syncToCloud(cartData);
  }

  // تحميل السلة مع المزامنة
  loadCartWithSync(): CartItem[] {
    try {
      const localCart = localStorage.getItem('eshro_smart_cart');
      if (!localCart) return [];

      const cartData = JSON.parse(localCart);

      // محاكاة تحميل من السحابة ودمج البيانات
      const cloudCart = this.loadFromCloud();
      const mergedCart = this.mergeCartData(cartData.items, cloudCart);

      return mergedCart;
    } catch (error) {

      return [];
    }
  }

  // دمج بيانات السلة من مصادر مختلفة
  private mergeCartData(localItems: any[], cloudItems: any[]): CartItem[] {
    const allItems = [...localItems, ...cloudItems];
    const mergedMap = new Map<number, CartItem>();

    allItems.forEach(item => {
      const existing = mergedMap.get(item.id);
      if (!existing || new Date(item.lastModified) > new Date(existing.addedAt)) {
        mergedMap.set(item.id, {
          ...item,
          addedAt: new Date(item.lastModified || item.addedAt)
        });
      } else if (existing) {
        // دمج الكميات إذا كان نفس المنتج
        existing.quantity += item.quantity;
      }
    });

    return Array.from(mergedMap.values());
  }

  // اقتراحات المنتجات الذكية
  getSmartSuggestions(cartItems: CartItem[]): CartSuggestion[] {
    const suggestions: CartSuggestion[] = [];
    const cartProductIds = cartItems.map(item => item.product.id);
    
    // الحصول على معرف المتجر من أول منتج في السلة إن وجد
    const storeId = cartItems.length > 0 && cartItems[0] ? cartItems[0].product?.storeId : null;

    // اقتراحات المنتجات المكملة (complementary)
    cartItems.forEach(cartItem => {
      const complementary = this.findComplementaryProducts(cartItem.product);
      complementary.forEach(product => {
        if (!cartProductIds.includes(product.id)) {
          suggestions.push({
            product,
            reason: 'complementary',
            confidence: 0.8
          });
        }
      });
    });

    // اقتراحات المنتجات الشائعة (popular) - تصفية حسب المتجر لضمان العزل
    const popularProducts = this.getPopularProducts(storeId);
    popularProducts.forEach(product => {
      if (!cartProductIds.includes(product.id)) {
        suggestions.push({
          product,
          reason: 'popular',
          confidence: 0.6
        });
      }
    });

    // اقتراحات المنتجات المشابهة (similar)
    cartItems.forEach(cartItem => {
      const similar = this.findSimilarProducts(cartItem.product);
      similar.forEach(product => {
        if (!cartProductIds.includes(product.id)) {
          suggestions.push({
            product,
            reason: 'similar',
            confidence: 0.7
          });
        }
      });
    });

    // ترتيب حسب الثقة وإزالة التكرارات
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .filter((suggestion, index, self) =>
        index === self.findIndex(s => s.product.id === suggestion.product.id)
      )
      .slice(0, 6); // أقصى 6 اقتراحات
  }

  // إدارة قوائم المفضلة المشتركة
  saveWishlist(wishlistItems: WishlistItem[]): void {
    const wishlistData = {
      items: wishlistItems,
      lastModified: new Date().toISOString(),
      deviceId: this.deviceId
    };

    localStorage.setItem('eshro_smart_wishlist', JSON.stringify(wishlistData));
    this.syncWishlistToCloud(wishlistData);
  }

  loadWishlist(): WishlistItem[] {
    try {
      const localWishlist = localStorage.getItem('eshro_smart_wishlist');
      if (!localWishlist) return [];

      const wishlistData = JSON.parse(localWishlist);
      const cloudWishlist = this.loadWishlistFromCloud();
      return this.mergeWishlistData(wishlistData.items, cloudWishlist);
    } catch (error) {

      return [];
    }
  }

  // تذكيرات السلة المتروكة
  checkAbandonedCart(cartItems: CartItem[]): boolean {
    if (cartItems.length === 0) return false;

    const lastActivity = localStorage.getItem('eshro_cart_last_activity');
    if (!lastActivity) {
      localStorage.setItem('eshro_cart_last_activity', new Date().toISOString());
      return false;
    }

    const lastActivityDate = new Date(lastActivity);
    const hoursSinceLastActivity = (Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60);

    // إذا مرت 24 ساعة على آخر نشاط في السلة
    return hoursSinceLastActivity >= 24;
  }

  updateCartActivity(): void {
    localStorage.setItem('eshro_cart_last_activity', new Date().toISOString());
  }

  // طرق مساعدة
  private findComplementaryProducts(product: any): any[] {
    // منطق بسيط للعثور على المنتجات المكملة من نفس المتجر لضمان عزل البيانات
    const category = product.category;
    const storeId = product.storeId;
    return allStoreProducts
      .filter(p => p.storeId === storeId && p.category === category && p.id !== product.id)
      .slice(0, 2);
  }

  private findSimilarProducts(product: any): any[] {
    // منطق بسيط للعثور على المنتجات المشابهة
    const storeId = product.storeId;
    return allStoreProducts
      .filter(p => p.storeId === storeId && p.id !== product.id)
      .slice(0, 2);
  }

  private getPopularProducts(storeId?: number | null): any[] {
    // محاكاة المنتجات الشائعة (في التطبيق الحقيقي سيأتي من التحليلات)
    // تصفية حسب المتجر لضمان عزل البيانات
    return allStoreProducts
      .filter(p => {
        const matchesStore = storeId ? p.storeId === storeId : true;
        return matchesStore && p.rating && p.rating >= 4.5;
      })
      .slice(0, 3);
  }

  // محاكاة مزامنة السحابة
  private syncToCloud(cartData: any): void {
    // في التطبيق الحقيقي: إرسال البيانات للخادم

  }

  private loadFromCloud(): any[] {
    // في التطبيق الحقيقي: تحميل البيانات من الخادم
    return [];
  }

  private syncWishlistToCloud(wishlistData: any): void {

  }

  private loadWishlistFromCloud(): any[] {
    return [];
  }

  private mergeWishlistData(localItems: any[], cloudItems: any[]): WishlistItem[] {
    const allItems = [...localItems, ...cloudItems];
    const mergedMap = new Map<number, WishlistItem>();

    allItems.forEach(item => {
      const existing = mergedMap.get(item.id);
      if (!existing || new Date(item.lastModified) > new Date(existing.addedAt)) {
        mergedMap.set(item.id, item);
      }
    });

    return Array.from(mergedMap.values());
  }


}

export default SmartCartService;
