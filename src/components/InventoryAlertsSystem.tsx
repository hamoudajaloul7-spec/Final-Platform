import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  X,
  Package,
  TrendingDown,
  ShoppingCart,
  Bell,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { getProxyImageUrl } from '@/utils/assetProxyUtil';

interface Product {
  id: string;
  name: string;
  image?: string;
  quantity: number;
  minimumStock: number;
  warehouse: string;
  lastUpdated: string;
  storeSlug: string;
  storeName: string;
}

interface AlertPopupProps {
  product: Product;
  type: 'minimum' | 'outofstock';
  onClose: () => void;
  onNotifyCustomer?: (product: Product) => void;
}

const AlertPopup: React.FC<AlertPopupProps> = ({ product, type, onClose, onNotifyCustomer }) => {
  const [acknowledged, setAcknowledged] = useState(false);
  
  const isMinimum = type === 'minimum';
  const title = isMinimum 
    ? '⚠️ تنبيه: وصول للحد الأدنى' 
    : '🚨 تنبيه: نفاد المخزون';
    
  const description = isMinimum
    ? `المنتج "${product.name}" وصل للحد الأدنى المطلوب`
    : `المنتج "${product.name}" نفد من المخزن بالكامل`;

  const handleAcknowledge = () => {
    setAcknowledged(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleNotify = () => {
    onNotifyCustomer?.(product);
    setAcknowledged(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !acknowledged) {
          onClose();
        }
      }}
    >
      <Card className={`w-full max-w-lg ${isMinimum ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-red-50' : 'border-red-500 bg-gradient-to-br from-red-50 to-pink-50'} shadow-2xl border-2`}>
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isMinimum ? 'bg-orange-100' : 'bg-red-100'}`}>
              {isMinimum ? (
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              ) : (
                <Package className="h-8 w-8 text-red-600" />
              )}
            </div>
          </div>
          <CardTitle className={`text-2xl font-bold ${isMinimum ? 'text-orange-800' : 'text-red-800'}`}>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          {/* Product Info */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            {product.image && (
              <img
                src={getProxyImageUrl(product.image, product.storeSlug, 'products')}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-lg mx-auto mb-3"
              />
            )}
            <h3 className="font-bold text-lg text-gray-800 mb-2">{product.name}</h3>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-semibold">الكمية الحالية:</span> {product.quantity}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">المخزن:</span> {product.warehouse}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">الحد الأدنى:</span> {product.minimumStock}
              </p>
            </div>
          </div>

          {/* Alert Description */}
          <div className={`p-4 rounded-lg ${isMinimum ? 'bg-orange-100 border border-orange-200' : 'bg-red-100 border border-red-200'}`}>
            <p className={`text-lg font-semibold ${isMinimum ? 'text-orange-800' : 'text-red-800'}`}>
              {description}
            </p>
            {!isMinimum && (
              <p className="text-red-700 mt-2 font-medium">
                💡 قم بزيادة المخزون فوراً لتجنب فقدان المبيعات
              </p>
            )}
          </div>

          {/* Store Info */}
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p><span className="font-semibold">المتجر:</span> {product.storeName}</p>
            <p><span className="font-semibold">آخر تحديث:</span> {new Date(product.lastUpdated).toLocaleDateString('ar-LY', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {!acknowledged && (
              <>
                <Button
                  variant="outline"
                  onClick={handleAcknowledge}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <CheckCircle className="h-4 w-4 ml-2" />
                  تم الاطلاع
                </Button>
                {!isMinimum && (
                  <Button
                    onClick={handleNotify}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Bell className="h-4 w-4 ml-2" />
                    إشعار العملاء
                  </Button>
                )}
              </>
            )}
            {acknowledged && (
              <div className="flex items-center justify-center w-full py-4 text-green-600">
                <CheckCircle className="h-6 w-6 ml-2" />
                <span className="font-semibold">تم تسجيل التنبيه</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface InventoryAlertsSystemProps {
  products: Product[];
  onProductUpdate?: (productId: string, quantity: number) => void;
  onNotifyCustomer?: (product: Product) => void;
}

const InventoryAlertsSystem: React.FC<InventoryAlertsSystemProps> = ({
  products,
  onProductUpdate,
  onNotifyCustomer,
}) => {
  const [alerts, setAlerts] = useState<Array<{ product: Product; type: 'minimum' | 'outofstock' }>>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<{ product: Product; type: 'minimum' | 'outofstock' } | null>(null);

  // Check for inventory alerts
  const checkInventoryAlerts = useCallback(() => {
    const newAlerts: Array<{ product: Product; type: 'minimum' | 'outofstock' }> = [];
    
    products.forEach(product => {
      if (product.quantity === 0) {
        // Out of stock alert
        newAlerts.push({ product, type: 'outofstock' });
      } else if (product.quantity <= product.minimumStock) {
        // Minimum stock alert
        newAlerts.push({ product, type: 'minimum' });
      }
    });

    setAlerts(newAlerts);

    // Show popup for new alerts
    if (newAlerts.length > 0 && (!currentAlert || !newAlerts.find(alert => 
      alert.product.id === currentAlert.product.id && alert.type === currentAlert.type
    ))) {
      const nextAlert = newAlerts.find(alert => 
        alert.type === 'outofstock' || alert.type === 'minimum'
      );
      if (nextAlert) {
        setCurrentAlert(nextAlert);
        setShowPopup(true);
      }
    }
  }, [products, currentAlert]);

  useEffect(() => {
    checkInventoryAlerts();
  }, [checkInventoryAlerts]);

  const handleClosePopup = () => {
    setShowPopup(false);
    setCurrentAlert(null);
  };

  const handleNotifyCustomer = (product: Product) => {
    // Trigger customer notification
    onNotifyCustomer?.(product);
    
    // Mark as acknowledged in the alerts list
    setAlerts(prev => 
      prev.filter(alert => !(alert.product.id === product.id))
    );
  };

  const getStockStatus = (product: Product) => {
    if (product.quantity === 0) {
      return { status: 'نفد', color: 'bg-red-100 text-red-800', icon: <Package className="h-3 w-3" /> };
    } else if (product.quantity <= product.minimumStock) {
      return { status: 'حد أدنى', color: 'bg-orange-100 text-orange-800', icon: <TrendingDown className="h-3 w-3" /> };
    } else {
      return { status: 'متوفر', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> };
    }
  };

  const totalProducts = products.length;
  const outOfStock = products.filter(p => p.quantity === 0).length;
  const minimumStock = products.filter(p => p.quantity > 0 && p.quantity <= p.minimumStock).length;
  const inStock = totalProducts - outOfStock - minimumStock;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي المنتجات</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">متوفر</p>
                <p className="text-2xl font-bold text-green-600">{inStock}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">حد أدنى</p>
                <p className="text-2xl font-bold text-orange-600">{minimumStock}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">نفد</p>
                <p className="text-2xl font-bold text-red-600">{outOfStock}</p>
              </div>
              <Package className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      {alerts.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Bell className="h-5 w-5" />
              تنبيهات المخزون ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => {
                const status = getStockStatus(alert.product);
                return (
                  <div
                    key={`${alert.product.id}-${alert.type}`}
                    className={`p-4 rounded-lg border ${
                      alert.type === 'outofstock' 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-orange-50 border-orange-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {alert.product.image && (
                          <img
                            src={getProxyImageUrl(alert.product.image, alert.product.storeSlug, 'products')}
                            alt={alert.product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <h4 className="font-semibold text-gray-800">{alert.product.name}</h4>
                          <p className="text-sm text-gray-600">
                            الكمية: {alert.product.quantity} | المخزن: {alert.product.warehouse}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={status.color}>
                          {status.icon}
                          {status.status}
                        </Badge>
                        {alert.type === 'outofstock' && (
                          <Button
                            size="sm"
                            onClick={() => handleNotifyCustomer(alert.product)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Bell className="h-3 w-3 ml-1" />
                            إشعار
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Popup */}
      <AnimatePresence>
        {showPopup && currentAlert && (
          <AlertPopup
            product={currentAlert.product}
            type={currentAlert.type}
            onClose={handleClosePopup}
            onNotifyCustomer={handleNotifyCustomer}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export { InventoryAlertsSystem, AlertPopup };
export type { Product };
