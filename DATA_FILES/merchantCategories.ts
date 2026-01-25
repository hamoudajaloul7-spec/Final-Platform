import { getApiUrl } from '../src/utils/apiConfig';

interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  message?: string;
}

interface ApiErrorEnvelope {
  success: false;
  error: string;
  message?: string;
}

type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

export interface MerchantCategory {
  id: number;
  name: string;
  nameAr?: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  storeId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryPayload {
  name: string;
  nameAr?: string;
  description?: string;
  image?: string;
  sortOrder?: number;
  isActive?: boolean;
  storeId?: number;
}

const API_BASE_URL = getApiUrl();

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const raw = await response.text();
  const parsed = raw ? (JSON.parse(raw) as ApiEnvelope<T> | T) : null;
  if (!response.ok) {
    const message = parsed && typeof parsed === 'object' && 'error' in parsed ? (parsed as ApiErrorEnvelope).error : response.statusText;
    throw new Error(message || 'Request failed');
  }
  if (parsed && typeof parsed === 'object' && 'success' in parsed) {
    const envelope = parsed as ApiEnvelope<T>;
    if (!envelope.success) {
      throw new Error(envelope.error || 'Request failed');
    }
    return envelope.data;
  }
  return parsed as T;
}

function buildQuery(params?: { storeId?: number; includeInactive?: boolean; search?: string }): string {
  if (!params) {
    return '';
  }
  const query = new URLSearchParams();
  if (params.storeId) {
    query.set('storeId', String(params.storeId));
  }
  if (params.includeInactive) {
    query.set('includeInactive', 'true');
  }
  if (params.search) {
    query.set('search', params.search);
  }
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

export const merchantCategoriesApi = {
  list(params?: { storeId?: number; includeInactive?: boolean; search?: string }) {
    return request<MerchantCategory[]>(`/categories${buildQuery(params)}`);
  },
  create(payload: CategoryPayload) {
    return request<MerchantCategory>('/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  update(categoryId: number, payload: Partial<CategoryPayload>) {
    return request<MerchantCategory>(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  remove(categoryId: number) {
    return request<{ id: number }>(`/categories/${categoryId}`, {
      method: 'DELETE',
    });
  },
};
