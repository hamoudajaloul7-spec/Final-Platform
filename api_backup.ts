const getDefaultApiUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // Detect from current location
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const port = typeof window !== 'undefined' ? window.location.port : '';
  
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  
  return `https://${currentHost}${port ? ':' + port : ''}/api`;
};

const API_BASE_URL = getDefaultApiUrl();
const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');

const MINIMAX_API_CONFIG = {
  baseURL: import.meta.env.VITE_MINIMAX_API_URL || 'https://api.minimax.chat/v1',
  apiKey: import.meta.env.VITE_MINIMAX_API_KEY || 'demo_key',
  timeout: 5000,
  retries: 1,
  enabled: import.meta.env.VITE_MINIMAX_ENABLED !== 'false'
};

interface StoreCreationData {
  storeId: string;
  storeSlug: string;
  storeName: string;
  storeNameEn?: string;
  description?: string;
  icon?: string;
  color?: string;
  categories: string[];
  products: any[];
  sliderImages: any[];
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  fallback?: boolean;
}

interface MinimaxToolCall {
  tool_id: string;
  parameters: any;
}

class UnifiedApiService {
  private validateToolId(toolId: string): boolean {
    if (!MINIMAX_API_CONFIG.enabled) {
      return false;
    }

    if (!toolId || typeof toolId !== 'string' || toolId.length < 3) {
      return false;
    }

    const validPatterns = [
      /^call_function_\w+_\d+$/,
      /^text_generation$/,
      /^image_generation$/,
      /^data_analysis$/,
      /^code_analysis$/,
      /^document_processing$/
    ];

    return validPatterns.some(pattern => pattern.test(toolId));
  }

  private async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    maxRetries: number = 3,
    isMinimaxRequest: boolean = false
  ): Promise<ApiResponse<T>> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const baseUrl = isMinimaxRequest ? MINIMAX_API_CONFIG.baseURL : API_BASE_URL;
        const url = `${baseUrl}${endpoint}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), MINIMAX_API_CONFIG.timeout);

        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(isMinimaxRequest && MINIMAX_API_CONFIG.apiKey ? { 'Authorization': `Bearer ${MINIMAX_API_CONFIG.apiKey}` } : {}),
            ...options.headers,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (!response.ok) {
          if (attempt === maxRetries) {
            return {
              success: false,
              error: data.message || `HTTP ${response.status}: ${response.statusText}`,
            };
          }
        } else {
          return {
            success: true,
            data,
            message: data.message || 'Success',
          };
        }
      } catch (error) {
        if (attempt === maxRetries) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    return {
      success: false,
      error: 'Max retries exceeded',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.requestWithRetry(endpoint, options, 3, false);
  }

  async createStoreWithImages(formData: FormData): Promise<ApiResponse> {
    try {
      const url = `${BACKEND_BASE_URL}/api/stores/create-with-images`;

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`;
        return {
          success: false,
          error: errorMsg,
        };
      }

      return {
        success: true,
        data,
        message: data.message,
      };
    } catch (error) {
      let errorMsg = 'Unknown error occurred';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
          errorMsg = `الخادم غير متاح. تأكد من تشغيل الـ Backend على ${BACKEND_BASE_URL}`;
        } else {
          errorMsg = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMsg,
      };
    }
  }

  async createStoreWithFiles(storeData: StoreCreationData): Promise<ApiResponse> {
    return this.request('/stores/create-with-files', {
      method: 'POST',
      body: JSON.stringify(storeData),
    });
  }

  async validateStoreData(storeData: Partial<StoreCreationData>): Promise<ApiResponse> {
    return this.request('/stores/validate', {
      method: 'POST',
      body: JSON.stringify(storeData),
    });
  }

  async getAllStores(): Promise<ApiResponse> {
    return this.request('/stores', {
      method: 'GET',
    });
  }

  async checkBackendHealth(): Promise<{ isHealthy: boolean; message: string }> {
    const backendUrl = BACKEND_BASE_URL;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return { 
          isHealthy: true, 
          message: `✅ Backend server is running on ${BACKEND_BASE_URL}` 
        };
      } else {
        return { 
          isHealthy: false, 
          message: '❌ Backend server returned an error. Status: ' + response.status 
        };
      }
    } catch (error) {
      const message = error instanceof Error && error.name === 'AbortError' 
        ? '❌ Connection timeout. Backend server may not be responding.'
        : `❌ Cannot connect to backend server. Make sure it's running on ${BACKEND_BASE_URL}`;
      
      return { 
        isHealthy: false, 
        message 
      };
    }
  }

  async callMinimaxTool(toolCall: MinimaxToolCall): Promise<ApiResponse> {
    try {
      if (!MINIMAX_API_CONFIG.enabled) {
        return this.getFallbackResponse(toolCall);
      }

      if (!this.validateToolId(toolCall.tool_id)) {
        return this.getFallbackResponse(toolCall);
      }

      if (!MINIMAX_API_CONFIG.apiKey || MINIMAX_API_CONFIG.apiKey === 'demo_key') {
        return this.getFallbackResponse(toolCall);
      }

      const response = await this.requestWithRetry('/tools/call', {
        method: 'POST',
        body: JSON.stringify(toolCall),
      }, 1, true);

      if (!response.success) {
        return this.getFallbackResponse(toolCall);
      }

      return response;
    } catch (error) {
      return this.getFallbackResponse(toolCall);
    }
  }

  private async getFallbackResponse(toolCall: MinimaxToolCall): Promise<ApiResponse> {
    const fallbackResponses: Record<string, ApiResponse> = {
      'text_generation': {
        success: true,
        fallback: true,
        message: 'AI service is currently unavailable, using local processing',
        data: {
          result: 'تم تعطيل خدمة الذكاء الاصطناعي مؤقتاً',
          tool: toolCall.tool_id,
          timestamp: new Date().toISOString()
        }
      },
      'image_generation': {
        success: true,
        fallback: true,
        message: 'Image generation service is unavailable',
        data: {
          result: 'تعذر إنشاء الصورة - الخدمة معطلة مؤقتاً',
          tool: toolCall.tool_id,
          timestamp: new Date().toISOString()
        }
      },
      'call_function': {
        success: true,
        fallback: true,
        message: 'Function execution completed with fallback',
        data: {
          result: 'تمت العملية بنجاح (وضع احتياطي)',
          tool: toolCall.tool_id,
          timestamp: new Date().toISOString()
        }
      }
    };

    const toolType = toolCall.tool_id.includes('text') ? 'text_generation' :
                    toolCall.tool_id.includes('image') ? 'image_generation' :
                    toolCall.tool_id.includes('call_function') ? 'call_function' : 'default';

    return fallbackResponses[toolType] || {
      success: true,
      fallback: true,
      message: `Tool ${toolCall.tool_id} executed with fallback`,
      data: {
        result: 'تمت العملية بنجاح (وضع احتياطي)',
        tool: toolCall.tool_id,
        parameters: toolCall.parameters,
        timestamp: new Date().toISOString()
      }
    };
  }

  async checkApiHealth(): Promise<{ isHealthy: boolean; message: string; details?: any }> {
    if (!MINIMAX_API_CONFIG.enabled) {
      return {
        isHealthy: false,
        message: '⚠️ Minimax API is disabled (by configuration)',
        details: {
          reason: 'API disabled',
          config: MINIMAX_API_CONFIG
        }
      };
    }

    if (!MINIMAX_API_CONFIG.apiKey || MINIMAX_API_CONFIG.apiKey === 'demo_key') {
      return {
        isHealthy: false,
        message: '⚠️ No valid API key configured',
        details: {
          reason: 'Missing or invalid API key',
          hasApiKey: !!MINIMAX_API_CONFIG.apiKey
        }
      };
    }

    try {
      const response = await this.requestWithRetry('/health', {}, 1, true);
      return {
        isHealthy: response.success,
        message: response.success ? '✅ Minimax API is healthy' : `❌ API error: ${response.error}`,
        details: {
          status: response.success ? 'operational' : 'error',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        isHealthy: false,
        message: `❌ Cannot connect to Minimax API: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  disableMinimaxAPI(): void {
    MINIMAX_API_CONFIG.enabled = false;
  }

  enableMinimaxAPI(): void {
    MINIMAX_API_CONFIG.enabled = true;
  }

  getAPIStatus(): { enabled: boolean; configured: boolean; message: string } {
    const hasValidKey = MINIMAX_API_CONFIG.apiKey && MINIMAX_API_CONFIG.apiKey !== 'demo_key';
    
    return {
      enabled: MINIMAX_API_CONFIG.enabled,
      configured: hasValidKey,
      message: MINIMAX_API_CONFIG.enabled && hasValidKey 
        ? '✅ Minimax API is ready' 
        : MINIMAX_API_CONFIG.enabled 
          ? '⚠️ API enabled but no valid key' 
          : '❌ Minimax API is disabled'
    };
  }
}

export const apiService = new UnifiedApiService();
export default apiService;
