import { getApiUrl } from '@/utils/apiConfig';

interface NotificationData {
  id: string;
  type: 'order' | 'promotion' | 'system' | 'chat' | 'product' | 'delivery';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  categories: {
    orders: boolean;
    promotions: boolean;
    system: boolean;
    chat: boolean;
    products: boolean;
    delivery: boolean;
  };
}

class NotificationManager {
  private notifications: NotificationData[] = [];
  private settings: NotificationSettings;
  private pushSubscription: PushSubscription | null = null;
  private listeners: Map<string, Array<(...args: any[]) => void>> = new Map();
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.settings = this.loadSettings();
    this.notifications = this.loadNotifications();
    this.initializeServiceWorker();
    this.requestNotificationPermission();
  }

  // Initialize service worker for push notifications
  private async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
      } catch (error) {
        // Service worker registration failed - silent handling
      }
    }
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Subscribe to push notifications
  async subscribeToPush(): Promise<boolean> {
    if (!this.serviceWorkerRegistration) return false;

    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          'BKxQzAkP7vQ8VzYHnR8Q8VzYHnR8Q8VzYHnR8Q8VzYHnR8Q8VzYHnR8Q8VzYHnR8Q' // Mock VAPID key
        ) as BufferSource
      });

      this.pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
        }
      };

      // Save subscription to server (mock)
      await this.savePushSubscription(this.pushSubscription);

      return true;
    } catch (error) {
      return false;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush(): Promise<void> {
    if (this.pushSubscription) {
      const subscription = await this.serviceWorkerRegistration?.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
      this.pushSubscription = null;
    }
  }

  // Send push notification
  private async sendPushNotification(notification: NotificationData): Promise<void> {
    if (!this.pushSubscription || !this.settings.pushEnabled) return;

    try {
      // In a real implementation, this would send to your push service
      await fetch(`${getApiUrl()}/send-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: this.pushSubscription,
          notification: {
            title: notification.title,
            body: notification.message,
            icon: '/eshro-logo.png',
            badge: '/badge.png',
            data: {
              url: notification.actionUrl,
              notificationId: notification.id
            }
          }
        })
      });
    } catch (error) {
      // Push notification failed - silent handling
    }
  }

  // Show browser notification
  private showBrowserNotification(notification: NotificationData): void {
    if (Notification.permission !== 'granted' || !this.settings.pushEnabled) return;

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/eshro-logo.png',
      badge: '/badge.png',
      tag: notification.id,
      requireInteraction: notification.priority === 'urgent',
      silent: !this.settings.soundEnabled
    });

    browserNotification.onclick = () => {
      if (notification.actionUrl) {
        window.focus();
        window.location.href = notification.actionUrl;
      }
      browserNotification.close();
    };

    // Auto close after 5 seconds for non-urgent notifications
    if (notification.priority !== 'urgent') {
      setTimeout(() => browserNotification.close(), 5000);
    }
  }

  // Play notification sound
  private playNotificationSound(): void {
    if (!this.settings.soundEnabled) return;

    // Create audio context and play notification sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Fallback to simple beep - silent handling
    }
  }

  // Vibrate device
  private vibrateDevice(): void {
    if (!this.settings.vibrationEnabled || !navigator.vibrate) return;

    const pattern = [200, 100, 200]; // Vibrate for 200ms, pause 100ms, vibrate 200ms
    navigator.vibrate(pattern);
  }

  // Create and send notification
  async createNotification(notificationData: Omit<NotificationData, 'id' | 'timestamp' | 'read'>): Promise<string> {
    const notification: NotificationData = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
      ...notificationData
    };

    // Check if category is enabled
    if (!this.settings.categories[notification.type]) {
      return notification.id; // Still create but don't show
    }

    this.notifications.unshift(notification);
    this.saveNotifications();

    // Show notification based on settings
    if (this.settings.pushEnabled) {
      this.showBrowserNotification(notification);
      await this.sendPushNotification(notification);
    }

    // Play sound and vibrate
    this.playNotificationSound();
    this.vibrateDevice();

    // Notify listeners
    this.notifyListeners('notification', notification);

    // Auto-expire notifications
    if (notification.expiresAt) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.expiresAt.getTime() - Date.now());
    }

    return notification.id;
  }

  // Get all notifications
  getNotifications(filter?: { read?: boolean; type?: string }): NotificationData[] {
    let filtered = this.notifications;

    if (filter?.read !== undefined) {
      filtered = filtered.filter(n => n.read === filter.read);
    }

    if (filter?.type) {
      filtered = filtered.filter(n => n.type === filter.type);
    }

    return filtered;
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      this.saveNotifications();
      this.notifyListeners('read', notificationId);
    }
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.notifyListeners('allRead');
  }

  // Remove notification
  removeNotification(notificationId: string): void {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.saveNotifications();
      this.notifyListeners('removed', notificationId);
    }
  }

  // Clear all notifications
  clearAllNotifications(): void {
    this.notifications = [];
    this.saveNotifications();
    this.notifyListeners('cleared');
  }

  // Update notification settings
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();

    if (newSettings.pushEnabled === false) {
      this.unsubscribeFromPush();
    } else if (newSettings.pushEnabled === true) {
      this.subscribeToPush();
    }

    this.notifyListeners('settingsUpdated', this.settings);
  }

  // Get current settings
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Event listeners
  on(event: string, callback: (notification: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (notification: any) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private notifyListeners(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(...args));
    }
  }

  // Utility functions
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private async savePushSubscription(subscription: PushSubscription): Promise<void> {
    // Mock API call to save subscription - silent handling
  }

  private loadSettings(): NotificationSettings {
    try {
      const saved = localStorage.getItem('eshro_notification_settings');
      return saved ? JSON.parse(saved) : {
        pushEnabled: false,
        emailEnabled: true,
        smsEnabled: false,
        soundEnabled: true,
        vibrationEnabled: true,
        categories: {
          orders: true,
          promotions: true,
          system: true,
          chat: true,
          products: false,
          delivery: true
        }
      };
    } catch {
      return {
        pushEnabled: false,
        emailEnabled: true,
        smsEnabled: false,
        soundEnabled: true,
        vibrationEnabled: true,
        categories: {
          orders: true,
          promotions: true,
          system: true,
          chat: true,
          products: false,
          delivery: true
        }
      };
    }
  }

  private saveSettings(): void {
    localStorage.setItem('eshro_notification_settings', JSON.stringify(this.settings));
  }

  private loadNotifications(): NotificationData[] {
    try {
      const saved = localStorage.getItem('eshro_notifications');
      if (!saved) return [];

      const notifications = JSON.parse(saved);
      return notifications.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp),
        expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined
      }));
    } catch {
      return [];
    }
  }

  private saveNotifications(): void {
    localStorage.setItem('eshro_notifications', JSON.stringify(this.notifications));
  }

  // Predefined notification templates
  async notifyOrderStatus(orderId: string, status: string, customerId: string): Promise<void> {
    const messages = {
      confirmed: { title: 'تم تأكيد طلبك', message: `طلبك رقم ${orderId} تم تأكيده بنجاح` },
      preparing: { title: 'جاري تحضير طلبك', message: `طلبك رقم ${orderId} قيد التحضير` },
      shipped: { title: 'تم شحن طلبك', message: `طلبك رقم ${orderId} في طريقه إليك` },
      delivered: { title: 'تم توصيل طلبك', message: `طلبك رقم ${orderId} تم توصيله بنجاح` }
    };

    const notification = messages[status as keyof typeof messages];
    if (notification) {
      await this.createNotification({
        type: 'order',
        priority: 'high',
        title: notification.title,
        message: notification.message,
        actionUrl: `/orders/${orderId}`,
        actionText: 'عرض الطلب',
        metadata: { orderId, customerId }
      });
    }
  }

  async notifyPromotion(title: string, message: string, actionUrl?: string): Promise<void> {
    await this.createNotification({
      type: 'promotion',
      priority: 'medium',
      title,
      message,
      ...(actionUrl && { actionUrl }),
      actionText: 'عرض العرض',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
    });
  }

  async notifyNewMessage(chatId: string, senderName: string, message: string): Promise<void> {
    await this.createNotification({
      type: 'chat',
      priority: 'medium',
      title: `رسالة جديدة من ${senderName}`,
      message: message.length > 50 ? message.substring(0, 50) + '...' : message,
      actionUrl: `/chat/${chatId}`,
      actionText: 'عرض المحادثة',
      metadata: { chatId, senderName }
    });
  }

  async notifyProductAvailable(productId: string, productName: string): Promise<void> {
    await this.createNotification({
      type: 'product',
      priority: 'low',
      title: 'المنتج متوفر الآن',
      message: `${productName} متوفر الآن في المخزون`,
      actionUrl: `/products/${productId}`,
      actionText: 'عرض المنتج',
      metadata: { productId, productName }
    });
  }

  async notifySystemAlert(title: string, message: string, priority: 'high' | 'urgent' = 'high'): Promise<void> {
    await this.createNotification({
      type: 'system',
      priority,
      title,
      message,
      metadata: { systemAlert: true }
    });
  }
}

// Export singleton instance
const notificationManager = new NotificationManager();
export default notificationManager;
export { NotificationManager };
