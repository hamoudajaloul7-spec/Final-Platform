// نظام إدارة البيانات المحسن لمنصة إشرو
// Enhanced Database Management System for EISHRO Platform

interface MerchantData {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  storeName: string;
  storeSlug: string;
  storeDescription: string;
  businessType: string;
  logo?: string;
  address?: string;
  city?: string;
  country: string;
  isActive: boolean;
  plan: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  settings: {
    notifications: boolean;
    autoSync: boolean;
    language: string;
    currency: string;
    timezone: string;
  };
}

interface ProductData {
  id: string;
  merchantId: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  originalPrice?: number;
  categoryId?: string;
  images: string[];
  stock: number;
  minStockLevel: number;
  sku: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  isActive: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  inventory: InventoryLocation[];
}

interface InventoryLocation {
  id: string;
  name: string;
  type: 'main' | 'warehouse' | 'branch';
  address: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
}

interface CategoryData {
  id: string;
  merchantId: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  image?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  productsCount: number;
  businessType: string; // مرتبط بنشاط التاجر
  createdAt: string;
  updatedAt: string;
}

interface OrderData {
  id: string;
  merchantId: string;
  customerId?: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderType: 'available' | 'unavailable';
  totalAmount: number;
  shippingAddress: any;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  notifications: OrderNotification[];
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  image?: string;
}

interface OrderNotification {
  id: string;
  type: 'email' | 'whatsapp' | 'sms';
  message: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'failed';
  response?: string;
}

class EnhancedDatabase {
  private storageKey = 'eishro_enhanced_database';

  constructor() {
    this.initializeDefaultData();
  }

  // حفظ بيانات التاجر
  saveMerchant(merchantData: MerchantData): boolean {
    try {
      const merchants = this.getAllMerchants();
      const existingIndex = merchants.findIndex(m => m.id === merchantData.id);
      
      if (existingIndex >= 0) {
        merchants[existingIndex] = { ...merchantData, updatedAt: new Date().toISOString() };
      } else {
        merchants.push(merchantData);
      }
      
      localStorage.setItem(`${this.storageKey}_merchants`, JSON.stringify(merchants));
      return true;
    } catch (error) {

      return false;
    }
  }

  // جلب التاجر بالبريد الإلكتروني
  getMerchantByEmail(email: string): MerchantData | null {
    try {
      const merchants = this.getAllMerchants();
      return merchants.find(m => m.email === email) || null;
    } catch (error) {

      return null;
    }
  }

  // جلب التاجر بالـ ID
  getMerchantById(id: string): MerchantData | null {
    try {
      const merchants = this.getAllMerchants();
      return merchants.find(m => m.id === id) || null;
    } catch (error) {

      return null;
    }
  }

  // جلب جميع التجار
  getAllMerchants(): MerchantData[] {
    try {
      const data = localStorage.getItem(`${this.storageKey}_merchants`);
      return data ? JSON.parse(data) : [];
    } catch (error) {

      return [];
    }
  }

  // حفظ منتج
  saveProduct(productData: ProductData): boolean {
    try {
      const products = this.getAllProducts();
      const existingIndex = products.findIndex(p => p.id === productData.id);
      
      if (existingIndex >= 0) {
        products[existingIndex] = { ...productData, updatedAt: new Date().toISOString() };
      } else {
        products.push(productData);
      }
      
      localStorage.setItem(`${this.storageKey}_products`, JSON.stringify(products));
      return true;
    } catch (error) {

      return false;
    }
  }

  // جلب منتجات التاجر
  getMerchantProducts(merchantId: string): ProductData[] {
    try {
      const products = this.getAllProducts();
      return products.filter(p => p.merchantId === merchantId);
    } catch (error) {

      return [];
    }
  }

  // جلب جميع المنتجات
  getAllProducts(): ProductData[] {
    try {
      const data = localStorage.getItem(`${this.storageKey}_products`);
      return data ? JSON.parse(data) : [];
    } catch (error) {

      return [];
    }
  }

  // حفظ تصنيف
  saveCategory(categoryData: CategoryData): boolean {
    try {
      const categories = this.getAllCategories();
      const existingIndex = categories.findIndex(c => c.id === categoryData.id);
      
      if (existingIndex >= 0) {
        categories[existingIndex] = { ...categoryData, updatedAt: new Date().toISOString() };
      } else {
        categories.push(categoryData);
      }
      
      localStorage.setItem(`${this.storageKey}_categories`, JSON.stringify(categories));
      return true;
    } catch (error) {

      return false;
    }
  }

  // جلب تصنيفات التاجر المرتبطة بنشاطه
  getMerchantCategories(merchantId: string, businessType?: string): CategoryData[] {
    try {
      const categories = this.getAllCategories();
      return categories.filter(c => {
        const matchesMerchant = c.merchantId === merchantId;
        const matchesBusinessType = businessType ? c.businessType === businessType : true;
        return matchesMerchant && matchesBusinessType;
      });
    } catch (error) {

      return [];
    }
  }

  // جلب جميع التصنيفات
  getAllCategories(): CategoryData[] {
    try {
      const data = localStorage.getItem(`${this.storageKey}_categories`);
      return data ? JSON.parse(data) : [];
    } catch (error) {

      return [];
    }
  }

  // حفظ طلب
  saveOrder(orderData: OrderData): boolean {
    try {
      const orders = this.getAllOrders();
      const existingIndex = orders.findIndex(o => o.id === orderData.id);
      
      if (existingIndex >= 0) {
        orders[existingIndex] = { ...orderData, updatedAt: new Date().toISOString() };
      } else {
        orders.push(orderData);
      }
      
      localStorage.setItem(`${this.storageKey}_orders`, JSON.stringify(orders));
      return true;
    } catch (error) {

      return false;
    }
  }

  // جلب طلبات التاجر
  getMerchantOrders(merchantId: string, orderType?: 'available' | 'unavailable'): OrderData[] {
    try {
      const orders = this.getAllOrders();
      return orders.filter(o => {
        const matchesMerchant = o.merchantId === merchantId;
        const matchesOrderType = orderType ? o.orderType === orderType : true;
        return matchesMerchant && matchesOrderType;
      });
    } catch (error) {

      return [];
    }
  }

  // جلب جميع الطلبات
  getAllOrders(): OrderData[] {
    try {
      const data = localStorage.getItem(`${this.storageKey}_orders`);
      return data ? JSON.parse(data) : [];
    } catch (error) {

      return [];
    }
  }

  // تحديث حالة المخزون
  updateProductStock(productId: string, newStock: number, locationId?: string): boolean {
    try {
      const products = this.getAllProducts();
      const productIndex = products.findIndex(p => p.id === productId);
      
      if (productIndex >= 0) {
        const product = products[productIndex]!;
        
        if (locationId) {
          // تحديث المخزون في موقع محدد
          const inventoryIndex = product.inventory?.findIndex(inv => inv.id === locationId) ?? -1;
          if (inventoryIndex >= 0 && product.inventory && product.inventory[inventoryIndex]) {
            product.inventory[inventoryIndex].currentStock = newStock;
            product.inventory[inventoryIndex].availableStock = newStock - (product.inventory[inventoryIndex].reservedStock || 0);
          }
        } else {
          // تحديث المخزون العام
          product.stock = newStock;
        }
        
        product.updatedAt = new Date().toISOString();
        products[productIndex] = product;
        
        localStorage.setItem(`${this.storageKey}_products`, JSON.stringify(products));
        return true;
      }
      
      return false;
    } catch (error) {

      return false;
    }
  }

  // إنشاء نسخة احتياطية
  createBackup(): boolean {
    try {
      const backup = {
        merchants: this.getAllMerchants(),
        products: this.getAllProducts(),
        categories: this.getAllCategories(),
        orders: this.getAllOrders(),
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(`${this.storageKey}_backup_${Date.now()}`, JSON.stringify(backup));
      
      // الاحتفاظ بآخر 3 نسخ احتياطية فقط
      this.cleanupOldBackups();
      
      return true;
    } catch (error) {

      return false;
    }
  }

  // تنظيف النسخ الاحتياطية القديمة
  private cleanupOldBackups(): void {
    try {
      const backupKeys = Object.keys(localStorage).filter(key => 
        key.startsWith(`${this.storageKey}_backup_`)
      );
      
      if (backupKeys.length > 3) {
        const sortedKeys = backupKeys.sort().reverse();
        sortedKeys.slice(3).forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {

    }
  }

  // التحقق من صحة البيانات
  validateData(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      const merchants = this.getAllMerchants();
      const products = this.getAllProducts();
      const categories = this.getAllCategories();
      
      // التحقق من التجار
      merchants.forEach(merchant => {
        if (!merchant.email || !merchant.password || !merchant.name) {
          errors.push(`بيانات ناقصة للتاجر: ${merchant.id}`);
        }
      });
      
      // التحقق من المنتجات
      products.forEach(product => {
        if (!product.nameAr || !product.price || product.price < 0) {
          errors.push(`بيانات ناقصة للمنتج: ${product.id}`);
        }
      });
      
      // التحقق من التصنيفات
      categories.forEach(category => {
        if (!category.nameAr || !category.merchantId) {
          errors.push(`بيانات ناقصة للتصنيف: ${category.id}`);
        }
      });
      
    } catch (error) {
      errors.push('خطأ في قراءة البيانات');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // إنشاء بيانات افتراضية للاختبار
  private initializeDefaultData(): void {
    try {
      const merchants = this.getAllMerchants();
      if (merchants.length === 0) {
        // إنشاء تاجر تجريبي لاختبار النظام
        const defaultMerchant: MerchantData = {
          id: 'indeesh-test',
          email: 'salm.alashqr@example.com',
          password: 'hashed_password_123',
          name: 'سالم محمد الأشقر',
          phone: '+218-91-123-4567',
          storeName: 'متجر انديش',
          storeSlug: 'indeesh',
          storeDescription: 'حلول العناية المنزلية والعطور',
          businessType: 'beauty',
          country: 'ليبيا',
          isActive: true,
          plan: 'Enterprise',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          settings: {
            notifications: true,
            autoSync: true,
            language: 'ar',
            currency: 'LYD',
            timezone: 'Africa/Tripoli'
          }
        };
        
        this.saveMerchant(defaultMerchant);
        
        // إنشاء تصنيفات مرتبطة بنشاط التاجر
        const defaultCategories: CategoryData[] = [
          {
            id: 'cat-beauty-1',
            merchantId: 'indeesh-test',
            nameAr: 'العطور',
            nameEn: 'Perfumes',
            descriptionAr: 'مجموعة متنوعة من أجود العطور',
            businessType: 'beauty',
            sortOrder: 1,
            isActive: true,
            productsCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'cat-beauty-2',
            merchantId: 'indeesh-test',
            nameAr: 'منتجات العناية المنزلية',
            nameEn: 'Home Care Products',
            descriptionAr: 'منتجات التنظيف والعناية المنزلية',
            businessType: 'beauty',
            sortOrder: 2,
            isActive: true,
            productsCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        defaultCategories.forEach(category => this.saveCategory(category));
        

      }
    } catch (error) {

    }
  }

  // إحصائيات النظام
  getStats(): { merchants: number; products: number; categories: number; orders: number } {
    return {
      merchants: this.getAllMerchants().length,
      products: this.getAllProducts().length,
      categories: this.getAllCategories().length,
      orders: this.getAllOrders().length
    };
  }
}

export const enhancedDatabase = new EnhancedDatabase();
export type {
  MerchantData,
  ProductData,
  CategoryData,
  OrderData,
  OrderItem,
  OrderNotification,
  InventoryLocation
};
