export type DashboardSection =
  | 'dashboard'
  | 'products-management'
  | 'categories-management'
  | 'bidding-system'
  | 'logistics-management'
  | 'warehouse-management'
  | 'orders-management'
  | 'reports-analytics'
  | 'support-tickets'
  | 'settings-interface'
  | 'loyalty-program'
  | 'subscription'
  | 'wallet'
  | 'sliders-management'
  | 'unavailable-orders';

export type TicketPriority = 'عالية' | 'متوسطة' | 'منخفضة';
export type TicketStatus = 'مفتوحة' | 'قيد المعالجة' | 'تم الحل';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  ticketId: string;
}

export type StoreMatrix = Record<string, Record<string, boolean>>;

export interface FlattenedSection {
  id: string;
  name: string;
  parent?: string | undefined;
  required: boolean;
}

export interface StoreInventoryProduct {
  id: string;
  name: string;
  price?: number;
  originalPrice?: number;
  images: string[];
  category: string;
  inStock: boolean;
  quantity: number;
  productCode: string;
}

export interface StoreInventoryCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  productCount: number;
  sortOrder: number;
  isActive: boolean;
}

export interface StoreInventorySnapshot {
  storeId: string;
  storeName: string;
  products: StoreInventoryProduct[];
  categories: StoreInventoryCategory[];
  lastUpdated: string;
}

export interface LogisticsCompany {
  name: string;
  phone: string;
  mobilePhone: string;
  email: string;
  location: string;
  city?: string;
  src: string;
  lat?: number;
  lng?: number;
}

export interface DashboardState {
  currentSection: DashboardSection;
  isLoading: boolean;
  products: StoreInventoryProduct[];
  categories: StoreInventoryCategory[];
  activeTicket?: Ticket;
  tickets: Ticket[];
  chatMessages: ChatMessage[];
}
