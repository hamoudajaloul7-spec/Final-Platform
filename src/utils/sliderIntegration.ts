import { getApiBase, stripApiBase } from '@/utils/apiConfig';

// Slider Integration Utilities for Merchant Dashboard
export interface SliderImage {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  storeSlug?: string;
  metadata?: {
    serverId?: any;
    id?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
  };
}

// Store slider configuration
export interface StoreSliderConfig {
  storeSlug: string;
  sliders: SliderImage[];
  lastSync: string;
  version: string;
}

// Real-time synchronization events
export interface SyncEvent {
  type: 'slider_update' | 'product_update' | 'price_update' | 'order_update';
  storeSlug: string;
  timestamp: string;
  data: any;
  source: 'merchant' | 'store' | 'system';
}

// Real-time synchronization system
type EventCallback<T = any> = (data?: T) => void;

class SyncManager {
  private static instance: SyncManager;
  private listeners: Map<string, EventCallback[]> = new Map();
  private syncInProgress: Set<string> = new Set();
  private syncQueue: Map<string, SyncEvent[]> = new Map();

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  // Add event listener
  on<T = any>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback as EventCallback);

    // Return cleanup function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback as EventCallback);
        if (index > -1) callbacks.splice(index, 1);
      }
    };
  }

  // Emit event
  emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          // Listener callback error
        }
      });
    }
  }

  // Queue sync event for processing
  queueSyncEvent(event: SyncEvent) {
    if (!this.syncQueue.has(event.storeSlug)) {
      this.syncQueue.set(event.storeSlug, []);
    }
    this.syncQueue.get(event.storeSlug)!.push(event);
    
    // Process queue with small delay to batch multiple updates
    setTimeout(() => this.processSyncQueue(event.storeSlug), 100);
  }

  // Process queued sync events
  private processSyncQueue(storeSlug: string) {
    const events = this.syncQueue.get(storeSlug);
    if (!events || events.length === 0) return;

    const latestEvent = events[events.length - 1]; // Process only latest event
    this.syncQueue.delete(storeSlug);

    // Broadcast to all components listening for this store
    this.emit(`store_${storeSlug}_sync`, latestEvent);
    this.emit('global_sync', latestEvent);
  }

  // Check if sync is in progress for store
  isSyncInProgress(storeSlug: string): boolean {
    return this.syncInProgress.has(storeSlug);
  }

  // Mark sync as started
  startSync(storeSlug: string) {
    this.syncInProgress.add(storeSlug);
  }

  // Mark sync as completed
  endSync(storeSlug: string) {
    this.syncInProgress.delete(storeSlug);
  }
}

export const syncManager = SyncManager.getInstance();

// Global event listener for real-time slider updates with enhanced sync
export const initializeSliderListeners = (storeSlug: string, callback?: (sliders: SliderImage[]) => void) => {
  // Listen for slider updates from the merchant interface
  const handleSliderUpdate = (event: CustomEvent) => {
    if (event.detail.storeSlug === storeSlug) {

      
      // Add to sync queue
      const syncEvent: SyncEvent = {
        type: 'slider_update',
        storeSlug,
        timestamp: new Date().toISOString(),
        data: event.detail.sliders,
        source: 'merchant'
      };
      
      syncManager.queueSyncEvent(syncEvent);
      
      callback?.(event.detail.sliders);
      
      // Show success notification
      showNotification('تم تحديث السلايدرز بنجاح!', 'success');
      
      // Trigger store refresh with debouncing
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('storeRefresh', { 
          detail: { 
            type: 'sliders', 
            storeSlug,
            timestamp: Date.now()
          } 
        }));
      }, 200);
    }
  };

  // Listen for store-specific sync events
  const handleStoreSync = (event?: SyncEvent) => {
    if (event && event.storeSlug === storeSlug && event.type === 'slider_update') {

      callback?.(event.data);
    }
  };

  // Register event listeners
  window.addEventListener('storeSliderUpdated', handleSliderUpdate as EventListener);
  const cleanupStoreSync = syncManager.on(`store_${storeSlug}_sync`, handleStoreSync);

  return () => {
    window.removeEventListener('storeSliderUpdated', handleSliderUpdate as EventListener);
    cleanupStoreSync();
  };
};

// Enhanced notification system with progress and actions
export interface NotificationOptions {
  duration?: number;
  persistent?: boolean;
  actionText?: string;
  onAction?: () => void;
  storeSlug?: string;
  level?: 'info' | 'warning' | 'error' | 'success';
}

export const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info', options: NotificationOptions = {}) => {
  const {
    duration = 5000,
    persistent = false,
    actionText,
    onAction,
    storeSlug,
    level = 'info'
  } = options;

  // Create notification container
  const notification = document.createElement('div');
  
  // Get theme colors based on type and level
  const getThemeColors = () => {
    if (type === 'success') {
      return {
        bg: 'bg-gradient-to-r from-green-400 to-green-600',
        icon: 'text-white',
        progress: 'bg-green-300'
      };
    } else if (type === 'error') {
      return {
        bg: 'bg-gradient-to-r from-red-400 to-red-600',
        icon: 'text-white',
        progress: 'bg-red-300'
      };
    } else {
      return {
        bg: level === 'warning' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-blue-400 to-blue-600',
        icon: 'text-white',
        progress: 'bg-blue-300'
      };
    }
  };

  const theme = getThemeColors();
  
  notification.className = `
    fixed top-4 right-4 ${theme.bg} text-white px-6 py-4 rounded-lg shadow-2xl z-50 
    flex items-center gap-3 transform transition-all duration-500 translate-x-full
    min-w-[320px] max-w-md border border-white/20 backdrop-blur-sm
  `;

  // Create icon based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>';
      case 'error':
        return '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>';
      case 'info':
      default:
        return '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>';
    }
  };

  // Store indicator
  const storeIndicator = storeSlug ? 
    `<div class="text-xs opacity-80 bg-white/20 px-2 py-1 rounded-full">${storeSlug}</div>` : '';

  // Action button if provided
  const actionButton = actionText && onAction ? 
    `<button class="ml-auto text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors" id="notification-action">
       ${actionText}
     </button>` : '';

  notification.innerHTML = `
    <svg class="w-6 h-6 ${theme.icon} flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      ${getIcon()}
    </svg>
    <div class="flex-1">
      <div class="font-medium">${message}</div>
      ${storeIndicator}
    </div>
    ${actionButton}
    <button class="text-white/80 hover:text-white transition-colors p-1" id="notification-close">
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
      </svg>
    </button>
    ${!persistent ? `<div class="absolute bottom-0 left-0 h-1 ${theme.progress} transition-all duration-100 ease-linear" style="width: 0%" id="notification-progress"></div>` : ''}
  `;

  document.body.appendChild(notification);

  // Slide in animation
  setTimeout(() => {
    notification.classList.remove('translate-x-full');
  }, 50);

  // Progress bar animation
  if (!persistent) {
    const progress = notification.querySelector('#notification-progress') as HTMLElement;
    setTimeout(() => {
      if (progress) {
        progress.style.width = '100%';
      }
    }, 100);
  }

  // Close button handler
  const closeNotification = () => {
    notification.classList.add('translate-x-full');
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 500);
  };

  const closeBtn = notification.querySelector('#notification-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeNotification);
  }

  // Action button handler
  const actionBtn = notification.querySelector('#notification-action');
  if (actionBtn && onAction) {
    actionBtn.addEventListener('click', () => {
      onAction();
      closeNotification();
    });
  }

  // Auto remove if not persistent
  if (!persistent) {
    setTimeout(closeNotification, duration);
  }

  return {
    close: closeNotification,
    update: (newMessage: string, newType?: typeof type) => {
      const messageEl = notification.querySelector('.font-medium');
      if (messageEl) messageEl.textContent = newMessage;
      
      if (newType && newType !== type) {
        // Update colors and icon
        const newTheme = getThemeColors();
        notification.className = notification.className.replace(/bg-gradient-to-r from-\w+-\d+ to-\w+-\d+/, newTheme.bg);
      }
    }
  };
};

// Real-time notification for sync events
export const showSyncNotification = (storeSlug: string, type: string, success: boolean) => {
  const messages = {
    slider_update: success ? 'تم تحديث السلايدرز بنجاح' : 'فشل في تحديث السلايدرز',
    product_update: success ? 'تم تحديث المنتجات بنجاح' : 'فشل في تحديث المنتجات',
    price_update: success ? 'تم تحديث الأسعار بنجاح' : 'فشل في تحديث الأسعار',
    order_update: success ? 'تم تحديث الطلبات بنجاح' : 'فشل في تحديث الطلبات'
  };

  const message = messages[type as keyof typeof messages] || 'تم التحديث بنجاح';
  
  return showNotification(message, success ? 'success' : 'error', {
    storeSlug,
    duration: 3000,
    actionText: 'إعادة المحاولة',
    onAction: () => {
      // Retry the sync operation
      window.dispatchEvent(new CustomEvent('retrySync', { detail: { storeSlug, type } }));
    }
  });
};

// Enhanced storage management with auto-sync and backup
class StorageManager {
  private static instance: StorageManager;
  private readonly STORAGE_PREFIX = 'eshro_';
  private readonly SYNC_INTERVAL = 5000; // 5 seconds
  private syncTimers: Map<string, NodeJS.Timeout> = new Map();
  private changeListeners: Map<string, EventCallback<SliderImage[]>[]> = new Map();

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  // Enhanced load with validation and fallback
  loadStoreSliders(storeSlug: string): SliderImage[] {
    try {
      // Try to load from main storage
      const mainData = localStorage.getItem(`${this.STORAGE_PREFIX}sliders_${storeSlug}`);
      if (mainData) {
        const sliders = JSON.parse(mainData);
        if (this.validateSliders(sliders)) {
          return this.normalizeSliders(sliders);
        }
      }

      // Try to load from backup
      const backupData = localStorage.getItem(`${this.STORAGE_PREFIX}sliders_${storeSlug}_backup`);
      if (backupData) {
        const sliders = JSON.parse(backupData);
        if (this.validateSliders(sliders)) {
          // Restore main storage from backup
          const normalized = this.normalizeSliders(sliders);
          this.saveStoreSliders(storeSlug, normalized);
          return normalized;
        }
      }

      // Return default if no valid data found
      return this.normalizeSliders(this.getDefaultSliders(storeSlug));
    } catch (error) {
      return this.normalizeSliders(this.getDefaultSliders(storeSlug));
    }
  }

  // Enhanced save with validation, backup, and sync
  saveStoreSliders(storeSlug: string, sliders: SliderImage[]): boolean {
    try {
      if (!this.validateSliders(sliders)) {
        return false;
      }

      const normalized = this.normalizeSliders(sliders);

      // Create backup before saving
      const existingData = localStorage.getItem(`${this.STORAGE_PREFIX}sliders_${storeSlug}`);
      if (existingData) {
        localStorage.setItem(`${this.STORAGE_PREFIX}sliders_${storeSlug}_backup`, existingData);
      }

      // Save main data
      localStorage.setItem(`${this.STORAGE_PREFIX}sliders_${storeSlug}`, JSON.stringify(normalized));

      // Update global store data
      this.updateGlobalStoreData(storeSlug, normalized);

      // Update configuration
      this.updateStoreConfig(storeSlug, normalized);

      // Notify listeners
      this.notifyListeners(`slider_change_${storeSlug}`, normalized);

      // Trigger sync event
      this.triggerSyncEvent(storeSlug, 'slider_update', normalized);

      return true;
    } catch (error) {
      return false;
    }
  }

  private normalizeSliders(sliders: SliderImage[]): SliderImage[] {
    if (!Array.isArray(sliders)) return [];
    return sliders.map(slider => ({
      ...slider,
      imageUrl: this.normalizeImageUrl(slider.imageUrl)
    }));
  }

  private normalizeImageUrl(path: string): string {
    return stripApiBase(path);
  }

  // Validate slider data integrity
  private validateSliders(sliders: any[]): boolean {
    if (!Array.isArray(sliders)) return false;
    
    return sliders.every(slider => 
      slider &&
      typeof slider.id === 'string' &&
      typeof slider.title === 'string' &&
      typeof slider.imageUrl === 'string' &&
      typeof slider.isActive === 'boolean' &&
      typeof slider.order === 'number'
    );
  }

  // Get default sliders for a store
  private getDefaultSliders(storeSlug: string): SliderImage[] {
    const defaults: Record<string, SliderImage[]> = {
      'nawaem': [
        {
          id: '1',
          title: 'حقائب نواعم الأنيقة',
          subtitle: 'اكتشف مجموعتنا المميزة من الحقائب الفاخرة',
          buttonText: 'تسوقي الآن',
          imageUrl: '/assets/nawaem/bag2.jpg',
          isActive: true,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        }
      ],
      'delta': [
        {
          id: 'delta-banner1',
          title: 'مجموعة الأوشحة الفاخرة في دلتا ستور',
          subtitle: '',
          buttonText: 'تسوقي الآن',
          imageUrl: '/assets/delta/slider1.webp',
          isActive: true,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'delta-banner2',
          title: 'حجاب أنيق وعصري',
          subtitle: '',
          buttonText: 'تسوقي الآن',
          imageUrl: '/assets/delta/slider2.webp',
          isActive: true,
          order: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'delta-banner3',
          title: 'إكسسوارات حجاب مميزة',
          subtitle: '',
          buttonText: 'تسوقي الآن',
          imageUrl: '/assets/delta/slider3.webp',
          isActive: true,
          order: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'delta-banner4',
          title: 'ملابس نسائية أنيقة',
          subtitle: '',
          buttonText: 'تسوقي الآن',
          imageUrl: '/assets/delta/slider4.webp',
          isActive: true,
          order: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'delta-banner5',
          title: 'تشكيلة صيفية مميزة',
          subtitle: '',
          buttonText: 'تسوقي الآن',
          imageUrl: '/assets/delta/slider5.webp',
          isActive: true,
          order: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'delta-banner6',
          title: 'أحدث صيحات الموضة',
          subtitle: '',
          buttonText: 'تسوقي الآن',
          imageUrl: '/assets/delta/slider6.webp',
          isActive: true,
          order: 6,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        }
      ],
      'delta-store': [
        {
          id: 'delta-banner1',
          title: 'مجموعة الأوشحة الفاخرة في دلتا ستور',
          subtitle: '',
          buttonText: 'تسوقي الآن',
          imageUrl: '/assets/delta/slider1.webp',
          isActive: true,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'delta-banner2',
          title: 'حجاب أنيق وعصري',
          subtitle: '',
          buttonText: 'تسوقي الآن',
          imageUrl: '/assets/delta/slider2.webp',
          isActive: true,
          order: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'delta-banner3',
          title: 'إكسسوارات حجاب مميزة',
          subtitle: '',
          buttonText: 'تسوقي الآن',
          imageUrl: '/assets/delta/slider3.webp',
          isActive: true,
          order: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'delta-banner4',
          title: 'ملابس نسائية أنيقة',
          subtitle: '',
          buttonText: 'تسوقي الآن',
          imageUrl: '/assets/delta/slider4.webp',
          isActive: true,
          order: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'delta-banner5',
          title: 'تشكيلة صيفية مميزة',
          subtitle: '',
          buttonText: 'تسوقي الآن',
          imageUrl: '/assets/delta/slider5.webp',
          isActive: true,
          order: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'delta-banner6',
          title: 'أحدث صيحات الموضة',
          subtitle: '',
          buttonText: 'تسوقي الآن',
          imageUrl: '/assets/delta/slider6.webp',
          isActive: true,
          order: 6,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        }
      ],
      'sheirine': [
        {
          id: 'banner1',
          title: 'مجموعة العطور الفاخرة في شيرين',
          subtitle: '',
          buttonText: 'تسوق الآن',
          imageUrl: '/assets/sheirine/slider1.jpg',
          isActive: true,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'banner2',
          title: 'عطور نسائية أنيقة',
          subtitle: '',
          buttonText: 'تسوق الآن',
          imageUrl: '/assets/sheirine/slider2.jpg',
          isActive: true,
          order: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'banner3',
          title: 'عطور رجالية مميزة',
          subtitle: '',
          buttonText: 'تسوق الآن',
          imageUrl: '/assets/sheirine/slider3.jpg',
          isActive: true,
          order: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'banner4',
          title: 'مجموعات عطور خاصة',
          subtitle: '',
          buttonText: 'تسوق الآن',
          imageUrl: '/assets/sheirine/slider4.jpg',
          isActive: true,
          order: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        }
      ],
      'pretty': [
        {
          id: 'banner1',
          title: 'مجموعة العطور الفاخرة في بريتي',
          subtitle: '',
          buttonText: 'تسوق الآن',
          imageUrl: '/assets/real-stores/pretty/slider10.webp',
          isActive: true,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'banner2',
          title: 'عطور نسائية أنيقة',
          subtitle: '',
          buttonText: 'تسوق الآن',
          imageUrl: '/assets/real-stores/pretty/slider11.webp',
          isActive: true,
          order: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'banner3',
          title: 'عطور رجالية مميزة',
          subtitle: '',
          buttonText: 'تسوق الآن',
          imageUrl: '/assets/real-stores/pretty/slider12.webp',
          isActive: true,
          order: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'banner4',
          title: 'مجموعات عطور خاصة',
          subtitle: '',
          buttonText: 'تسوق الآن',
          imageUrl: '/assets/real-stores/pretty/slider13.webp',
          isActive: true,
          order: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'banner5',
          title: 'مجموعات عطور فاخرة',
          subtitle: '',
          buttonText: 'تسوق الآن',
          imageUrl: '/assets/real-stores/pretty/slider14.webp',
          isActive: true,
          order: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'banner6',
          title: 'مجموعات عطور جديدة',
          subtitle: '',
          buttonText: 'تسوق الآن',
          imageUrl: '/assets/real-stores/pretty/slider15.webp',
          isActive: true,
          order: 6,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        }
      ],
      'magna-beauty': [
        {
          id: 'magna-beauty-banner1',
          title: 'مكياج عصري أنيق',
          subtitle: '',
          buttonText: 'تسوقي الآن',
          imageUrl: '/assets/magna-beauty/slide1.webp',
          isActive: true,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'magna-beauty-banner2',
          title: 'رموش أنيقة وعصرية',
          subtitle: '',
          buttonText: 'تسوقي الآن',
          imageUrl: '/assets/magna-beauty/slide2.webp',
          isActive: true,
          order: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'magna-beauty-banner3',
          title: 'إكسسوارات مميزة',
          subtitle: '',
          buttonText: 'تسوقي الآن',
          imageUrl: '/assets/magna-beauty/slide3.webp',
          isActive: true,
          order: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'magna-beauty-banner4',
          title: 'مكياج عصري أنيق',
          subtitle: '',
          buttonText: 'تسوقي الآن',
          imageUrl: '/assets/magna-beauty/slide4.webp',
          isActive: true,
          order: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'magna-beauty-banner5',
          title: 'تشكيلة عصرية مميزة',
          subtitle: '',
          buttonText: 'تسوقي الآن',
          imageUrl: '/assets/magna-beauty/slide5.webp',
          isActive: true,
          order: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        }
      ],
      'indeesh': [
        {
          id: 'banner1',
          title: 'منتجات باف العالمية',
          subtitle: '',
          buttonText: 'تسوق الآن',
          imageUrl: '/assets/indeesh/sliders/1764003949431-7n5h5h-3.jpg',
          isActive: true,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'banner2',
          title: 'عطور و روائح أطفال تدوم لوقت أطول',
          subtitle: '',
          buttonText: 'تسوق الآن',
          imageUrl: '/assets/indeesh/sliders/1764003949444-z43zxk-9.jpg',
          isActive: true,
          order: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'banner3',
          title: 'معطرات عربية أصيلة ',
          subtitle: '',
          buttonText: 'تسوق الآن',
          imageUrl: '/assets/indeesh/sliders/1764003949446-93ffbn-8.jpg',
          isActive: true,
          order: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'banner4',
          title: 'منتجات بيكمان الرائدة بعالم المنظفات',
          subtitle: '',
          buttonText: 'تسوق الآن',
          imageUrl: '/assets/indeesh/sliders/1764003949455-gvxg6e-7.jpg',
          isActive: true,
          order: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        },
        {
          id: 'banner5',
          title: 'مجموعة العناية الشخصية التي تدوم لوقت أطول',
          subtitle: '',
          buttonText: 'تسوق الآن',
          imageUrl: '/assets/indeesh/sliders/1764003949480-48hujc-1.jpg',
          isActive: true,
          order: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeSlug
        }
      ]
    };

    return defaults[storeSlug] || [
      {
        id: '1',
        title: 'مرحباً بك في متجرنا',
        subtitle: 'اكتشف مجموعتنا المميزة من المنتجات',
        buttonText: 'تسوق الآن',
        imageUrl: '/assets/default-slider.png',
        isActive: true,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        storeSlug
      }
    ];
  }

  // Update global store data
  private updateGlobalStoreData(storeSlug: string, sliders: SliderImage[]) {
    try {
      const globalStores = JSON.parse(localStorage.getItem(`${this.STORAGE_PREFIX}stores`) || '[]');
      const storeIndex = globalStores.findIndex((store: any) => 
        store.subdomain === storeSlug || store.storeSlug === storeSlug
      );
      
      if (storeIndex >= 0) {
        globalStores[storeIndex].sliderImages = sliders;
        globalStores[storeIndex].lastSliderUpdate = new Date().toISOString();
        localStorage.setItem(`${this.STORAGE_PREFIX}stores`, JSON.stringify(globalStores));
      }
    } catch (error) {
      // Global store update failed
    }
  }

  // Update store configuration
  private updateStoreConfig(storeSlug: string, sliders: SliderImage[]) {
    try {
      const config: StoreSliderConfig = {
        storeSlug,
        sliders,
        lastSync: new Date().toISOString(),
        version: '2.0'
      };
      localStorage.setItem(`${this.STORAGE_PREFIX}slider_config_${storeSlug}`, JSON.stringify(config));
    } catch (error) {
      // Store config update failed
    }
  }

  // Add change listener
  addChangeListener(storeSlug: string, callback: (sliders: SliderImage[]) => void): () => void {
    const key = `slider_change_${storeSlug}`;
    if (!this.changeListeners.has(key)) {
      this.changeListeners.set(key, []);
    }
    const typedCallback = callback as EventCallback<SliderImage[]>;
    this.changeListeners.get(key)!.push(typedCallback);

    return () => {
      const callbacks = this.changeListeners.get(key);
      if (callbacks) {
        const index = callbacks.indexOf(typedCallback);
        if (index > -1) callbacks.splice(index, 1);
      }
    };
  }

  // Notify listeners
  private notifyListeners(event: string, data: SliderImage[]) {
    const listeners = this.changeListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          // Callback error
        }
      });
    }
  }

  // Trigger sync event
  private triggerSyncEvent(storeSlug: string, type: string, data: any) {
    const syncEvent: SyncEvent = {
      type: type as any,
      storeSlug,
      timestamp: new Date().toISOString(),
      data,
      source: 'merchant'
    };
    
    syncManager.queueSyncEvent(syncEvent);
  }

  // Auto-sync enabled stores
  enableAutoSync(storeSlug: string) {
    if (this.syncTimers.has(storeSlug)) return;

    const timer = setInterval(() => {
      try {
        const configData = localStorage.getItem(`${this.STORAGE_PREFIX}slider_config_${storeSlug}`);
        if (configData) {
          const config: StoreSliderConfig = JSON.parse(configData);
          const currentSliders = this.loadStoreSliders(storeSlug);
          
          // Check if data has changed
          if (JSON.stringify(config.sliders) !== JSON.stringify(currentSliders)) {

            this.saveStoreSliders(storeSlug, currentSliders);
          }
        }
      } catch (error) {
        // Auto-sync error
      }
    }, this.SYNC_INTERVAL);

    this.syncTimers.set(storeSlug, timer);
  }

  // Disable auto-sync
  disableAutoSync(storeSlug: string) {
    const timer = this.syncTimers.get(storeSlug);
    if (timer) {
      clearInterval(timer);
      this.syncTimers.delete(storeSlug);
    }
  }

  // Clean up old backups (keep only last 3)
  cleanupBackups(storeSlug: string) {
    try {
      const backups: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`${this.STORAGE_PREFIX}sliders_${storeSlug}_backup_`)) {
          backups.push(key);
        }
      }
      
      // Sort by timestamp (newest first)
      backups.sort().reverse();
      
      // Remove old backups, keep only last 3
      backups.slice(3).forEach(key => localStorage.removeItem(key));
    } catch (error) {
      // Backup cleanup error
    }
  }
}

export const storageManager = StorageManager.getInstance();

// Legacy compatibility functions
export const loadStoreSliders = (storeSlug: string): SliderImage[] => {
  return storageManager.loadStoreSliders(storeSlug);
};

export const saveStoreSliders = (storeSlug: string, sliders: SliderImage[]): boolean => {
  return storageManager.saveStoreSliders(storeSlug, sliders);
};

// Generate a unique slider ID
export const generateSliderId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Validate slider image
export const validateSliderImage = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'يرجى اختيار ملف صورة صحيح' };
  }

  // Check file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' };
  }

  // Check supported formats
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!supportedTypes.includes(file.type)) {
    return { valid: false, error: 'صيغة الصورة غير مدعومة. يرجى استخدام JPG أو PNG أو WEBP' };
  }

  return { valid: true };
};

// Compress image before saving
export const compressImage = (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      
      resolve(compressedDataUrl);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

// Export slider settings for backup
export const exportSliderSettings = (storeSlug: string): void => {
  const sliders = loadStoreSliders(storeSlug);
  const exportData = {
    storeSlug,
    exportDate: new Date().toISOString(),
    sliders,
    version: '1.0'
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${storeSlug}-sliders-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
};

// Import slider settings from backup
export const importSliderSettings = (file: File): Promise<{ success: boolean; sliders?: SliderImage[]; error?: string }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        
        if (!importData.sliders || !Array.isArray(importData.sliders)) {
          resolve({ success: false, error: 'ملف الاستيراد غير صحيح' });
          return;
        }

        resolve({ success: true, sliders: importData.sliders });
      } catch (error) {
        resolve({ success: false, error: 'خطأ في قراءة ملف الاستيراد' });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: 'خطأ في قراءة الملف' });
    };

    reader.readAsText(file);
  });
};
