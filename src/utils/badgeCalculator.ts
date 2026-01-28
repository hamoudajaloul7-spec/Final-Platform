import type { Product } from '@/data/storeProducts';

export interface BadgeMetrics {
  views?: number;
  likes?: number;
  orders?: number;
  rating?: number;
  quantity?: number;
  originalPrice?: number;
  price?: number;
  isNew?: boolean;
  createdDate?: string;
}

const resolveQuantity = (product: any, metrics?: BadgeMetrics): number => {
  const rawQuantity = metrics?.quantity ?? product.quantity;
  if (Number.isFinite(Number(rawQuantity))) {
    return Number(rawQuantity);
  }
  const inStock = product.inStock !== false;
  const isAvailable = product.isAvailable !== false;
  return inStock && isAvailable ? 1 : 0;
};

export function calculateBadge(product: any, metrics?: BadgeMetrics): string {
  const views = metrics?.views ?? product.views ?? 0;
  const likes = metrics?.likes ?? product.likes ?? 0;
  const orders = metrics?.orders ?? product.orders ?? 0;
  const quantity = resolveQuantity(product, metrics);
  const originalPrice = metrics?.originalPrice ?? product.originalPrice ?? 0;
  const price = metrics?.price ?? product.price ?? 0;
  const isNew = metrics?.isNew ?? product.isNew ?? false;

  // ✅_FIX: Handle undefined inStock and isAvailable correctly
  // undefined/null should NOT be treated as false - treat as available if quantity > 0
  const inStock = product.inStock !== false && quantity > 0;
  const isAvailable = product.isAvailable !== false && quantity > 0;

  if (!inStock || !isAvailable) {
    return 'غير متوفر';
  }

  if (quantity <= 0) {
    return 'غير متوفر';
  }

  if (originalPrice > price && ((originalPrice - price) / originalPrice) >= 0.1) {
    return 'تخفيضات';
  }

  if (orders > 100 && likes > 200) {
    return 'مميزة';
  }

  if (orders > 100) {
    return 'أكثر مبيعاً';
  }

  if (likes > 200) {
    return 'أكثر إعجاباً';
  }

  if (views > 400) {
    return 'أكثر مشاهدة';
  }

  if (orders > 50) {
    return 'أكثر طلباً';
  }

  if (isNew || (orders === 0 && likes === 0 && views === 0)) {
    return 'جديد';
  }

  return 'جديد';
}

export function applyAutoBadges(products: any[]): any[] {
  return products.map(product => {
    const finalBadge = product.badge || calculateBadge(product);
    return {
      ...product,
      badge: finalBadge,
      tags: product.tags ? [...new Set([...product.tags, finalBadge])] : [finalBadge]
    };
  });
}

export function getTagColor(badge: string): { className: string; style: React.CSSProperties } {
  const colorMap: Record<string, { className: string; style: React.CSSProperties }> = {
    'جديد': { 
      className: 'text-white px-2 py-1 rounded-lg text-xs font-semibold',
      style: { backgroundColor: '#008080' }
    },
    'أكثر مبيعاً': { 
      className: 'text-white px-2 py-1 rounded-lg text-xs font-semibold',
      style: { backgroundColor: '#FF6B6B' }
    },
    'أكثر إعجاباً': { 
      className: 'text-black px-2 py-1 rounded-lg text-xs font-semibold',
      style: { backgroundColor: '#FFD700' }
    },
    'مميزة': { 
      className: 'text-white px-2 py-1 rounded-lg text-xs font-semibold',
      style: { backgroundColor: '#808000' }
    },
    'أكثر مشاهدة': { 
      className: 'text-white px-2 py-1 rounded-lg text-xs font-semibold',
      style: { backgroundColor: '#000080' }
    },
    'أكثر طلباً': { 
      className: 'text-white px-2 py-1 rounded-lg text-xs font-semibold',
      style: { backgroundColor: '#FF7F50' }
    },
    'تخفيضات': { 
      className: 'text-white px-2 py-1 rounded-lg text-xs font-semibold',
      style: { backgroundColor: '#FF1493' }
    },
    'غير متوفر': { 
      className: 'text-white px-2 py-1 rounded-lg text-xs font-semibold',
      style: { backgroundColor: '#FF6347' }
    }
  };
  
  return colorMap[badge] || { 
    className: 'text-white px-2 py-1 rounded-lg text-xs font-semibold bg-gray-500',
    style: {}
  };
}

export function getStockStatus(product: any): 'available' | 'low' | 'unavailable' {
  const quantity = resolveQuantity(product);
  // ✅_FIX: Handle undefined inStock and isAvailable correctly
  const inStock = product.inStock !== false && quantity > 0;
  const isAvailable = product.isAvailable !== false && quantity > 0;
  
  if (quantity <= 0 || inStock === false || isAvailable === false) return 'unavailable';
  if (quantity < 5) return 'low';
  return 'available';
}

export function getButtonConfig(product: any) {
  const status = getStockStatus(product);
  
  if (status === 'unavailable') {
    return {
      status,
      buttonText: '🔔 نبهني عند التوفر',
      buttonClassName: 'bg-orange-700 hover:bg-orange-800 text-white font-semibold px-4 py-2 rounded-lg',
      isDisabled: false,
      emoji: '🔔',
      productState: 'out_of_stock'
    };
  }
  
  if (status === 'low') {
    return {
      status,
      buttonText: 'أضف للسلة',
      buttonClassName: 'bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded-lg',
      isDisabled: false,
      emoji: '⚠️',
      productState: 'low_stock'
    };
  }
  
  return {
    status,
    buttonText: 'أضف للسلة',
    buttonClassName: 'bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg',
    isDisabled: false,
    emoji: '🛒',
    productState: 'available'
  };
}
