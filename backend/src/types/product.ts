// Product interface for backend use
// Copied from frontend storeProducts.ts to avoid cross-import issues

export interface Product {
  id: number;
  storeId: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  images: string[];
  sizes: string[];
  availableSizes: string[];
  colors: Array<{ name: string; value: string }>;
  rating: number;
  reviews: number;
  views: number;
  likes: number;
  orders: number;
  category: string;
  inStock: boolean;
  tags: string[];
  badge?: string;
  quantity: number;
  expiryDate?: string;
  endDate?: string;
}
