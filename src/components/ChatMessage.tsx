import React from 'react';
import { Heart, ShoppingCart, Eye, Star, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getProxyImageUrl } from '@/utils/assetProxyUtil';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  storeSlug?: string;
  category: string;
  store: string;
  rating?: number;
  reviews?: number;
  discount?: number;
  inStock: boolean;
  description?: string;
}

interface ChatMessageProps {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'agent' | 'bot';
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'product';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  productData?: Product;
  isOwnMessage?: boolean;
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  onSendMessage?: (message: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  id,
  senderId,
  senderName,
  senderType,
  content,
  timestamp,
  type,
  status,
  productData,
  isOwnMessage = false,
  onProductClick,
  onAddToCart,
  onToggleWishlist,
  onSendMessage
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = () => {
    if (!isOwnMessage) return null;

    switch (status) {
      case 'sending':
        return <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" />;
      case 'sent':
        return <span className="text-gray-400 text-xs">✓</span>;
      case 'delivered':
        return <span className="text-gray-400 text-xs">✓✓</span>;
      case 'read':
        return <span className="text-blue-500 text-xs">✓✓</span>;
      default:
        return null;
    }
  };

  const getSenderColor = () => {
    switch (senderType) {
      case 'user':
        return 'bg-blue-600 text-white';
      case 'agent':
        return 'bg-gray-100 text-gray-900 border border-gray-200';
      case 'bot':
        return 'bg-green-100 text-gray-900 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  const renderProductCard = () => {
    if (!productData) return null;

    return (
      <Card className="w-full max-w-sm mx-auto shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onProductClick?.(productData)}>
        <div className="relative">
          <img
            src={getProxyImageUrl(productData.image, productData.storeSlug, 'products')}
            alt={productData.name}
            className="w-full h-32 object-cover rounded-t-lg"
          />
          {productData.discount && (
            <Badge className="absolute top-2 right-2 bg-red-500">
              -{productData.discount}%
            </Badge>
          )}
          {!productData.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-t-lg flex items-center justify-center">
              <span className="text-white font-semibold">غير متوفر</span>
            </div>
          )}
        </div>

        <CardContent className="p-3">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm line-clamp-2 text-right">
              {productData.name}
            </h4>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {productData.rating && (
                  <>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">{productData.rating}</span>
                    {productData.reviews && (
                      <span className="text-xs text-gray-500">({productData.reviews})</span>
                    )}
                  </>
                )}
              </div>
              <Badge variant="outline" className="text-xs">
                {productData.category}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-green-600">
                  {productData.price} د.ل
                </span>
                {productData.originalPrice && (
                  <span className="text-xs text-gray-500 line-through">
                    {productData.originalPrice} د.ل
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">{productData.store}</span>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist?.(productData);
                }}
              >
                <Heart className="w-3 h-3 ml-1" />
                مفضلة
              </Button>
              <Button
                size="sm"
                className="flex-1 text-xs bg-blue-600 hover:bg-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart?.(productData);
                }}
                disabled={!productData.inStock}
              >
                <ShoppingCart className="w-3 h-3 ml-1" />
                إضافة للسلة
              </Button>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant="ghost"
                className="flex-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onProductClick?.(productData);
                }}
              >
                <Eye className="w-3 h-3 ml-1" />
                عرض
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="flex-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onSendMessage?.(`أريد معرفة المزيد عن ${productData.name}`);
                }}
              >
                <MessageCircle className="w-3 h-3 ml-1" />
                استفسار
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderMessageContent = () => {
    switch (type) {
      case 'product':
        return renderProductCard();

      case 'image':
        return (
          <div className="space-y-2">
            <img
              src={content}
              alt="Shared image"
              className="max-w-xs max-h-48 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(content, '_blank')}
            />
            <p className="text-sm">{content}</p>
          </div>
        );

      case 'file':
        return (
          <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
              <span className="text-xs font-semibold text-blue-600">📎</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{content}</p>
              <p className="text-xs text-gray-500">ملف مرفق</p>
            </div>
          </div>
        );

      default:
        return <p className="text-sm whitespace-pre-wrap">{content}</p>;
    }
  };

  return (
    <div className={`flex gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      {/* Avatar for others */}
      {!isOwnMessage && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="text-xs">
            {senderName.charAt(0)}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message bubble */}
      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-first' : ''}`}>
        {/* Sender name for group chat */}
        {!isOwnMessage && (
          <div className="text-xs text-gray-500 mb-1 px-1">
            {senderName}
          </div>
        )}

        {/* Message content */}
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            type === 'product'
              ? 'p-0 bg-transparent shadow-none'
              : getSenderColor()
          }`}
        >
          {renderMessageContent()}
        </div>

        {/* Timestamp and status */}
        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
          isOwnMessage ? 'justify-end' : 'justify-start'
        }`}>
          <span>{formatTime(timestamp)}</span>
          {getStatusIcon()}
        </div>
      </div>

      {/* Avatar for own messages */}
      {isOwnMessage && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="text-xs">
            {senderName.charAt(0)}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
