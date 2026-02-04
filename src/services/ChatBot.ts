import { allStoreProducts } from '@/data/allStoreProducts';
import fuzzySearch from './FuzzySearch';

interface ChatContext {
  userId: string;
  storeId?: number;
  conversationHistory: ChatMessage[];
  userPreferences?: {
    language: 'ar' | 'en';
    categories: string[];
    priceRange?: { min: number; max: number };
  };
}

interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'user' | 'bot';
}

interface BotResponse {
  message: string;
  confidence: number;
  actions?: BotAction[];
  followUp?: string[];
}

interface BotAction {
  type: 'show_products' | 'show_categories' | 'contact_agent' | 'show_help';
  data?: any;
}

class ChatBot {
  private responses: Map<string, BotResponse[]> = new Map();
  private contexts: Map<string, ChatContext> = new Map();

  constructor() {
    this.initializeResponses();
  }

  private initializeResponses() {
    // Arabic responses
    this.responses.set('ar', [
      // Greetings
      {
        message: 'مرحباً بك في متجر إشرو! كيف يمكنني مساعدتك اليوم؟',
        confidence: 1.0,
        followUp: ['يمكنني مساعدتك في البحث عن منتجات، معرفة الأسعار، أو الإجابة على أسئلتك']
      },

      // Product search
      {
        message: 'سأساعدك في البحث عن المنتجات المناسبة. ما نوع المنتج الذي تبحث عنه؟',
        confidence: 0.9,
        actions: [{ type: 'show_categories' }]
      },

      // Price inquiries
      {
        message: 'يمكنني إظهار المنتجات في نطاق سعري محدد. ما هو الميزانية المتاحة لديك؟',
        confidence: 0.8,
        followUp: ['مثال: أقل من 100 دينار', 'بين 50-200 دينار']
      },

      // Order status
      {
        message: 'للاستعلام عن حالة الطلب، يرجى تقديم رقم الطلب أو البريد الإلكتروني المستخدم في الشراء.',
        confidence: 0.9,
        actions: [{ type: 'contact_agent' }]
      },

      // Returns
      {
        message: 'للإرجاع أو الاستبدال، يجب أن يكون المنتج في حالته الأصلية وخلال 14 يوماً من الشراء.',
        confidence: 0.9,
        followUp: ['هل تريد معرفة المزيد عن سياسة الإرجاع؟']
      },

      // Shipping
      {
        message: 'نقدم خدمة الشحن المجاني للطلبات فوق 50 دينار. وقت التوصيل 2-5 أيام عمل.',
        confidence: 0.9,
        followUp: ['هل تريد معرفة المزيد عن طرق الشحن المتاحة؟']
      },

      // Payment
      {
        message: 'نقبل جميع طرق الدفع: البطاقات الائتمانية، المحافظ الإلكترونية، والدفع عند الاستلام.',
        confidence: 0.8,
        followUp: ['هل تحتاج مساعدة في عملية الدفع؟']
      },

      // Contact
      {
        message: 'يمكنك التواصل معنا عبر الهاتف أو البريد الإلكتروني. سأقوم بتوجيهك إلى ممثل خدمة العملاء.',
        confidence: 0.9,
        actions: [{ type: 'contact_agent' }]
      }
    ]);

    // English responses
    this.responses.set('en', [
      {
        message: 'Welcome to Eishro store! How can I help you today?',
        confidence: 1.0,
        followUp: ['I can help you search for products, check prices, or answer your questions']
      }
    ]);
  }

  // Analyze user message and generate response
  generateResponse(userMessage: string, userId: string, language: 'ar' | 'en' = 'ar', storeId?: number): BotResponse {
    const message = userMessage.toLowerCase().trim();
    const context = this.getContext(userId);
    
    // Update store context if provided
    if (storeId) {
      context.storeId = storeId;
    }

    // Update conversation history
    context.conversationHistory.push({
      id: `msg_${Date.now()}`,
      content: userMessage,
      timestamp: new Date(),
      sender: 'user'
    });

    // Check for specific intents
    const intent = this.detectIntent(message, language);

    switch (intent) {
      case 'greeting':
        return this.getGreetingResponse(language);

      case 'product_search':
        return this.handleProductSearch(message, context, language);

      case 'price_inquiry':
        return this.handlePriceInquiry(message, context, language);

      case 'order_status':
        return this.handleOrderStatus(language);

      case 'returns':
        return this.handleReturns(language);

      case 'shipping':
        return this.handleShipping(language);

      case 'payment':
        return this.handlePayment(language);

      case 'contact':
        return this.handleContact(language);

      default:
        return this.getDefaultResponse(message, language);
    }
  }

  private detectIntent(message: string, language: 'ar' | 'en'): string {
    const arabicPatterns = {
      greeting: /(مرحبا|اهلا|صباح|مساء|هاي|هلو)/,
      product_search: /(ابحث|أريد|أبحث|أشتري|منتج|سلعة)/,
      price_inquiry: /(سعر|كم|كلفة|غلاء|رخيص|غالي)/,
      order_status: /(طلب|حالة|وصل|توصيل|شحن)/,
      returns: /(إرجاع|استبدال|رد|ترجيع)/,
      shipping: /(شحن|توصيل|إرسال|ترسل)/,
      payment: /(دفع|دفع|أدفع|طريقة)/,
      contact: /(اتصل|هاتف|بريد|تواصل|مساعدة)/
    };

    const englishPatterns = {
      greeting: /(hello|hi|hey|good|morning|evening)/,
      product_search: /(search|find|looking|buy|product|item)/,
      price_inquiry: /(price|cost|expensive|cheap|how much)/,
      order_status: /(order|status|delivery|shipping)/,
      returns: /(return|exchange|refund)/,
      shipping: /(shipping|delivery|send)/,
      payment: /(payment|pay|method)/,
      contact: /(contact|call|email|help|support)/
    };

    const patterns = language === 'ar' ? arabicPatterns : englishPatterns;

    for (const [intent, pattern] of Object.entries(patterns)) {
      if (pattern.test(message)) {
        return intent;
      }
    }

    return 'unknown';
  }

  private getGreetingResponse(language: 'ar' | 'en'): BotResponse {
    const responses = this.responses.get(language) || [];
    return responses.find(r => r.message.includes('مرحبا') || r.message.includes('Welcome')) ??
           responses[0] ??
           { message: language === 'ar' ? 'مرحبا' : 'Welcome', confidence: 1, actions: [] };
  }

  private handleProductSearch(message: string, context: ChatContext, language: 'ar' | 'en'): BotResponse {
    // Extract product keywords from message
    const keywords = this.extractKeywords(message, language);

    if (keywords.length > 0) {
      // Search for products using fuzzy search
      const searchResults = fuzzySearch.searchWithCorrection(
        keywords.join(' '),
        (query) => {
          const storeProducts = context.storeId 
            ? allStoreProducts.filter(p => p.storeId === context.storeId)
            : allStoreProducts;
          return storeProducts.filter(product =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.category?.toLowerCase().includes(query.toLowerCase())
          );
        }
      );

      if (searchResults.results.length > 0) {
        const product = searchResults.results[0];
        const response = language === 'ar'
          ? `وجدت ${searchResults.results.length} منتج متعلق بـ "${keywords.join(' ')}". أحد المنتجات الشائعة: ${product.name} بسعر ${product.price} د.ل`
          : `Found ${searchResults.results.length} products related to "${keywords.join(' ')}". One popular product: ${product.name} for ${product.price} LYD`;

        return {
          message: response,
          confidence: 0.9,
          actions: [{
            type: 'show_products',
            data: { keywords, results: searchResults.results.slice(0, 5) }
          }]
        };
      }
    }

    // Fallback to category suggestion
    return {
      message: language === 'ar'
        ? 'ما نوع المنتج الذي تبحث عنه؟ يمكنني مساعدتك في العثور على: إلكترونيات، ملابس، أحذية، أو مستحضرات تجميل.'
        : 'What type of product are you looking for? I can help you find: electronics, clothing, shoes, or cosmetics.',
      confidence: 0.7,
      actions: [{ type: 'show_categories' }]
    };
  }

  private handlePriceInquiry(message: string, context: ChatContext, language: 'ar' | 'en'): BotResponse {
    // Try to extract price range from message
    const priceMatch = message.match(/(\d+)/g);
    if (priceMatch) {
      const price = parseInt(priceMatch[0]);
      const affordableProducts = (context.storeId 
        ? allStoreProducts.filter(p => p.storeId === context.storeId)
        : allStoreProducts).filter(p => p.price <= price);

      return {
        message: language === 'ar'
          ? `وجدت ${affordableProducts.length} منتج بسعر ${price} د.ل أو أقل. هل تريد رؤية بعض الاقتراحات؟`
          : `Found ${affordableProducts.length} products for ${price} LYD or less. Would you like to see some suggestions?`,
        confidence: 0.8,
        actions: [{
          type: 'show_products',
          data: { priceRange: { max: price }, results: affordableProducts.slice(0, 5) }
        }]
      };
    }

    return {
      message: language === 'ar'
        ? 'ما هو نطاق السعر الذي تفضله؟ على سبيل المثال: أقل من 100 د.ل، أو بين 50-200 د.ل'
        : 'What price range are you looking for? For example: under 100 LYD, or between 50-200 LYD',
      confidence: 0.7
    };
  }

  private handleOrderStatus(language: 'ar' | 'en'): BotResponse {
    return {
      message: language === 'ar'
        ? 'للاستعلام عن حالة طلبك، يرجى تقديم رقم الطلب أو البريد الإلكتروني المستخدم في الشراء. سأقوم بتوجيهك إلى قسم خدمة العملاء.'
        : 'To check your order status, please provide your order number or the email used for purchase. I\'ll connect you with our customer service team.',
      confidence: 0.9,
      actions: [{ type: 'contact_agent' }]
    };
  }

  private handleReturns(language: 'ar' | 'en'): BotResponse {
    return {
      message: language === 'ar'
        ? 'يمكنك إرجاع المنتج خلال 14 يوماً من تاريخ الشراء إذا كان في حالته الأصلية. هل تريد معرفة المزيد عن إجراءات الإرجاع؟'
        : 'You can return products within 14 days of purchase if they are in original condition. Would you like to know more about our return procedures?',
      confidence: 0.9
    };
  }

  private handleShipping(language: 'ar' | 'en'): BotResponse {
    return {
      message: language === 'ar'
        ? 'نقدم خدمة الشحن المجاني للطلبات فوق 50 د.ل. وقت التوصيل العادي 2-5 أيام عمل داخل ليبيا.'
        : 'We offer free shipping for orders over 50 LYD. Standard delivery time is 2-5 business days within Libya.',
      confidence: 0.9
    };
  }

  private handlePayment(language: 'ar' | 'en'): BotResponse {
    return {
      message: language === 'ar'
        ? 'نقبل جميع طرق الدفع: البطاقات الائتمانية (Visa, MasterCard)، المحافظ الإلكترونية، والدفع عند الاستلام.'
        : 'We accept all payment methods: Credit cards (Visa, MasterCard), digital wallets, and cash on delivery.',
      confidence: 0.8
    };
  }

  private handleContact(language: 'ar' | 'en'): BotResponse {
    return {
      message: language === 'ar'
        ? 'يمكنك التواصل معنا على: الهاتف: 0912345678، البريد الإلكتروني: support@eishro.com، أو الدردشة مع ممثل خدمة العملاء.'
        : 'You can contact us at: Phone: 0912345678, Email: support@eishro.com, or chat with our customer service representative.',
      confidence: 0.9,
      actions: [{ type: 'contact_agent' }]
    };
  }

  private getDefaultResponse(message: string, language: 'ar' | 'en'): BotResponse {
    const responses = [
      language === 'ar'
        ? 'عذراً، لم أفهم سؤالك تماماً. يمكنني مساعدتك في البحث عن منتجات، معرفة الأسعار، أو الإجابة على أسئلة حول الطلبات والشحن.'
        : 'Sorry, I didn\'t understand your question completely. I can help you search for products, check prices, or answer questions about orders and shipping.',
      language === 'ar'
        ? 'هل يمكنك إعادة صياغة سؤالك؟ أنا هنا لمساعدتك في العثور على ما تبحث عنه.'
        : 'Could you rephrase your question? I\'m here to help you find what you\'re looking for.'
    ];

    const fallbackMessage = language === 'ar'
      ? 'عذراً، لم أفهم سؤالك تماماً. يمكنني مساعدتك في البحث عن منتجات، معرفة الأسعار، أو الإجابة على أسئلة حول الطلبات والشحن.'
      : 'Sorry, I didn\'t understand your question completely. I can help you search for products, check prices, or answer questions about orders and shipping.';
    
    const selectedResponse = responses.length > 0 
      ? responses[Math.floor(Math.random() * responses.length)]
      : null;
    
    const selectedMessage = selectedResponse ?? fallbackMessage;
    
    return {
      message: selectedMessage,
      confidence: 0.5,
      actions: [{ type: 'show_help' }]
    };
  }

  private extractKeywords(message: string, language: 'ar' | 'en'): string[] {
    // Remove common words and extract meaningful keywords
    const stopWords = language === 'ar'
      ? ['أريد', 'أبحث', 'عن', 'منتج', 'سعر', 'كم', 'هل', 'ما', 'كيف', 'متى', 'أين']
      : ['i', 'want', 'search', 'for', 'product', 'price', 'how', 'much', 'is', 'the', 'a', 'an'];

    const words = message.split(/\s+/).filter(word =>
      word.length > 1 && !stopWords.includes(word.toLowerCase())
    );

    return words.slice(0, 3); // Limit to 3 keywords
  }

  private getContext(userId: string): ChatContext {
    if (!this.contexts.has(userId)) {
      this.contexts.set(userId, {
        userId,
        conversationHistory: [],
        userPreferences: {
          language: 'ar',
          categories: []
        }
      });
    }
    return this.contexts.get(userId)!;
  }

  // Get conversation history
  getConversationHistory(userId: string): ChatMessage[] {
    const context = this.getContext(userId);
    return context.conversationHistory;
  }

  // Clear conversation history
  clearHistory(userId: string): void {
    const context = this.getContext(userId);
    context.conversationHistory = [];
  }

  // Update user preferences
  updatePreferences(userId: string, preferences: Partial<ChatContext['userPreferences']>): void {
    const context = this.getContext(userId);
    if (context.userPreferences) {
      context.userPreferences = { ...context.userPreferences, ...preferences };
    }
  }
}

// Export singleton instance
const chatBot = new ChatBot();
export default chatBot;
export { ChatBot };
