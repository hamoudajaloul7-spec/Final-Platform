import {
  StoreInventoryProduct,
  StoreInventoryCategory,
  FlattenedSection,
} from '@/types/dashboard.types';

export const formatPriceValue = (value?: number | string): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return '';
  }
  return `${numeric.toLocaleString('ar-LY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} د.ل`;
};

export const computeDiscountPercent = (
  price?: number,
  originalPrice?: number
): number | null => {
  if (
    typeof price !== 'number' ||
    typeof originalPrice !== 'number' ||
    originalPrice <= price
  ) {
    return null;
  }
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

export const buildCategorySummaries = (
  products: StoreInventoryProduct[],
  categories: StoreInventoryCategory[]
): Array<{ name: string; count: number; image?: string | undefined }> => {
  const statsMap = new Map<string, { count: number; image?: string | undefined }>();

  products.forEach((product) => {
    const key = product.category || 'غير مصنف';
    const entry = statsMap.get(key) || { count: 0 };
    entry.count++;
    statsMap.set(key, entry);
  });

  categories.forEach((cat) => {
    const entry = statsMap.get(cat.name) || { count: 0 };
    entry.image = cat.image;
    statsMap.set(cat.name, entry);
  });

  const ordered =
    Array.isArray(categories) && categories.length > 0
      ? categories.map((c) => c.name)
      : Array.from(statsMap.keys());

  return ordered.map((name) => {
    const stat = statsMap.get(name) ?? { count: 0 };
    return { name, ...stat };
  });
};

export const flattenMerchantSections = (
  sections: any[] = []
): FlattenedSection[] => {
  const result: FlattenedSection[] = [];

  const traverse = (node: any, parent?: string) => {
    if (!node) return;

    if (Array.isArray(node)) {
      node.forEach((n) => traverse(n, parent));
    } else if (typeof node === 'object') {
      if ('id' in node && 'name' in node) {
        result.push({
          id: node.id,
          name: node.name,
          parent,
          required: node.required ?? false,
        });
      }

      if ('children' in node && Array.isArray(node.children)) {
        node.children.forEach((child: any) => traverse(child, node.id));
      }

      Object.values(node).forEach((value) => {
        if (typeof value === 'object' && value !== null) {
          traverse(value, parent);
        }
      });
    }
  };

  traverse(sections);
  return result;
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ar-LY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (amount: number, currency: string = 'LYD'): string => {
  return new Intl.NumberFormat('ar-LY', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '_')
    .replace(/_+/g, '_');
};

export const calculateProductDiscountInfo = (
  price: number,
  originalPrice: number
): { discount: number; percentage: number } => {
  const discount = originalPrice - price;
  const percentage = (discount / originalPrice) * 100;
  return {
    discount: Math.round(discount * 100) / 100,
    percentage: Math.round(percentage),
  };
};

export const groupProductsByCategory = (
  products: StoreInventoryProduct[]
): Map<string, StoreInventoryProduct[]> => {
  const grouped = new Map<string, StoreInventoryProduct[]>();

  products.forEach((product) => {
    const category = product.category || 'غير مصنف';
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push(product);
  });

  return grouped;
};

export const sortProductsByField = (
  products: StoreInventoryProduct[],
  field: keyof StoreInventoryProduct,
  ascending: boolean = true
): StoreInventoryProduct[] => {
  return [...products].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return ascending ? aVal - bVal : bVal - aVal;
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return ascending
        ? aVal.localeCompare(bVal, 'ar')
        : bVal.localeCompare(aVal, 'ar');
    }

    return 0;
  });
};

export const calculateInventoryStats = (products: StoreInventoryProduct[]) => {
  return {
    totalProducts: products.length,
    inStock: products.filter((p) => p.inStock).length,
    outOfStock: products.filter((p) => !p.inStock).length,
    totalValue: products.reduce((sum, p) => sum + ((p.price || 0) * p.quantity), 0),
    avgPrice: products.length > 0
      ? products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length
      : 0,
  };
};
