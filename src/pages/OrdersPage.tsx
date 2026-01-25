import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Package,
  Heart,
  ShoppingCart,
  Clock,
  CheckCircle,
  Truck,
  Star,
  Eye,
  Calendar,
  X
} from "lucide-react";
import ShareMenu from '@/components/ShareMenu';
import NotifyWhenAvailable from '@/components/NotifyWhenAvailable';
import { getProxyImageUrl } from '@/utils/assetProxyUtil';

interface Order {
  id: string;
  date: string;
  items: any[];
  total: number;
  finalTotal?: number;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  shippingCost: number;
  discountAmount: number;
  customer: any;
  payment: any;
  shipping: any;
}

interface OrdersPageProps {
  orders: Order[];
  favorites: any[];
  unavailableItems: any[];
  onBack: () => void;
  onRemoveUnavailableItem?: (index: number) => void;
}

const OrdersPage: React.FC<OrdersPageProps> = ({
  orders = [],
  favorites = [],
  unavailableItems = [],
  onBack,
  onRemoveUnavailableItem
}) => {
  //    localStorage    
  const [localUnavailableItems, setLocalUnavailableItems] = useState<any[]>([]);

  React.useEffect(() => {
    const loadUnavailableItems = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('eshro_unavailable') || '[]');
        setLocalUnavailableItems(saved);
      } catch (error) {
        setLocalUnavailableItems([]);
      }
    };

    loadUnavailableItems();

    //   localStorage
    const handleStorageChange = () => {
      loadUnavailableItems();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notificationModal, setNotificationModal] = useState<{
    isOpen: boolean;
    product: any;
  }>({ isOpen: false, product: null });
  const [showRemoveConfirmModal, setShowRemoveConfirmModal] = useState<number | null>(null);
  
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { label: '', color: 'bg-blue-500', icon: <CheckCircle className="h-4 w-4" /> };
      case 'processing':
        return { label: ' ', color: 'bg-yellow-500', icon: <Clock className="h-4 w-4" /> };
      case 'shipped':
        return { label: ' ', color: 'bg-purple-500', icon: <Truck className="h-4 w-4" /> };
      case 'delivered':
        return { label: ' ', color: 'bg-green-500', icon: <Package className="h-4 w-4" /> };
      default:
        return { label: ' ', color: 'bg-gray-500', icon: <Clock className="h-4 w-4" /> };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('ar-LY'),
      time: date.toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const openNotificationModal = (product: any) => {
    setNotificationModal({ isOpen: true, product });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/*  */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                
              </Button>
              <h1 className="text-xl font-semibold text-gray-900"></h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {orders.length} 
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="purchases" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
                ({favorites.length})
            </TabsTrigger>
            <TabsTrigger value="unavailable" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
                 ({JSON.parse(localStorage.getItem('eshro_unavailable') || '[]').length})
            </TabsTrigger>
            <TabsTrigger value="purchases" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
               ({orders.length})
            </TabsTrigger>
          </TabsList>
          
          {/*   */}
          <TabsContent value="favorites" className="space-y-4">
            {favorites.length === 0 ? (
              <EmptyState 
                icon="" 
                title="   " 
                description="      " 
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((item, index) => (
                  <FavoriteCard key={index} item={item} />
                ))}
              </div>
            )}
          </TabsContent>
          
          {/*    */}
          <TabsContent value="unavailable" className="space-y-4">
            {localUnavailableItems.length === 0 ? (
              <EmptyState
                icon=""
                title="  "
                description="      "
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {localUnavailableItems.map((item, index) => (
                  <UnavailableCard
                    key={index}
                    item={item}
                    onNotifyWhenAvailable={openNotificationModal}
                    onRemoveUnavailableItem={onRemoveUnavailableItem || (() => {})}
                    index={index}
                    onShowRemoveConfirm={setShowRemoveConfirmModal}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          {/*   */}
          <TabsContent value="purchases" className="space-y-4">
            {orders.length === 0 ? (
              <EmptyState 
                icon="" 
                title="     " 
                description="     " 
              />
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onViewDetails={() => setSelectedOrder(order)}
                    formatDate={formatDate}
                    getStatusInfo={getStatusInfo}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/*    */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          formatDate={formatDate}
          getStatusInfo={getStatusInfo}
        />
      )}

      {/*     */}
      {notificationModal.product && (
        <NotifyWhenAvailable
          product={notificationModal.product}
          isOpen={notificationModal.isOpen}
          onClose={() => setNotificationModal({ isOpen: false, product: null })}
          storeSlug={notificationModal.product?.storeSlug}
          storeName={notificationModal.product?.storeName}
        />
      )}

      {/*    */}
      {showRemoveConfirmModal !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="h-8 w-8 text-red-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                 
              </h3>
              <p className="text-gray-600 mb-6">
                             
                <br />
                        .
              </p>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    //    localStorage 
                    const currentItems = JSON.parse(localStorage.getItem('eshro_unavailable') || '[]');
                    const updatedItems = currentItems.filter((_, i) => i !== showRemoveConfirmModal);
                    localStorage.setItem('eshro_unavailable', JSON.stringify(updatedItems));

                    //    
                    setLocalUnavailableItems(updatedItems);

                    //    
                    window.dispatchEvent(new Event('storage'));

                    //   
                    setShowRemoveConfirmModal(null);

                    //    
                    alert('   !');
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  
                </Button>
                <Button
                  onClick={() => setShowRemoveConfirmModal(null)}
                  variant="outline"
                  className="flex-1"
                >
                  
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

//   
const EmptyState: React.FC<{ icon: string; title: string; description: string }> = ({ 
  icon, title, description 
}) => (
  <div className="text-center py-16">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-600 mb-2">{title}</h3>
    <p className="text-gray-500">{description}</p>
  </div>
);

//   
const FavoriteCard: React.FC<{ item: any }> = ({ item }) => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
    <CardContent className="p-0">
      <div className="aspect-[3/2] relative overflow-hidden bg-gray-100">
        <img
          src={getProxyImageUrl(item.images?.[0] || item.image || '/assets/products/placeholder.png')}
          alt={item.name || ' '}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/products/placeholder.png';
          }}
        />
        <div className="absolute top-2 right-2">
          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
        </div>
        <div className="absolute top-2 left-2">
          <ShareMenu 
            url={`${window.location.origin}/product/${item.id || Date.now()}`}
            title={`   : ${item.name}`}
            size="sm"
            variant="outline"
            className="w-8 h-8 p-0 bg-white border-gray-200 hover:bg-gray-50 shadow-sm"
          />
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-1">{item.name || ' '}</h3>
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-primary">{item.price || 185} .</span>
          <Button size="sm" className="text-xs px-3">
            <ShoppingCart className="h-3 w-3 mr-1" />
             
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

//     -    
const UnavailableCard: React.FC<{
  item: any;
  onNotifyWhenAvailable: (product: any) => void;
  onRemoveUnavailableItem?: (index: number) => void;
  index: number;
  onShowRemoveConfirm: (index: number) => void;
}> = ({ item, onNotifyWhenAvailable, onRemoveUnavailableItem, index, onShowRemoveConfirm }) => (
  <Card className="overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50">
    <CardContent className="p-0">
      <div className="aspect-square bg-white flex items-center justify-center relative border-b border-gray-200">
        {/*   */}
        <div className="w-full h-full flex items-center justify-center">
          {item.image || item.images?.[0] ? (
            <img 
              src={getProxyImageUrl(item.image || item.images[0])} 
              alt={item.name || '  '}
              className="w-full h-full object-cover opacity-80"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.setAttribute('style', 'display: flex');
              }}
            />
          ) : null}
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center" style={{ display: item.image || item.images?.[0] ? 'none' : 'flex' }}>
            <span className="text-6xl opacity-40"></span>
          </div>
        </div>
        
        {/*    */}
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
          <Badge variant="destructive" className="text-lg px-4 py-2 shadow-lg">
             
          </Badge>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1 text-lg">{item.name || '  '}</h3>
        {item.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
        )}
        
        {/*   */}
        <div className="space-y-2 mb-4">
          {item.color && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">:</span>
              <span>{item.color}</span>
            </div>
          )}
          {item.size && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">:</span>
              <span>{item.size}</span>
            </div>
          )}
          {item.quantity && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium"> :</span>
              <span>{item.quantity}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-600">{item.price || '185'} .</span>
          <Button
            size="sm"
            variant="outline"
            className="text-primary border-primary hover:bg-primary hover:text-white"
            onClick={() => onNotifyWhenAvailable(item)}
          >
              
          </Button>
        </div>
        
        {/*     */}
        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
          {item.requestDate && (
            <p className="text-xs text-gray-500">
               : {new Date(item.requestDate).toLocaleDateString('ar-LY')}
            </p>
          )}
          {onRemoveUnavailableItem && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShowRemoveConfirm(index)}
              className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
            >
              <X className="h-4 w-4 mr-1" />
              
            </Button>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

//   
const OrderCard: React.FC<{ 
  order: Order; 
  onViewDetails: () => void;
  formatDate: (date: string) => any;
  getStatusInfo: (status: string) => any;
}> = ({ order, onViewDetails, formatDate, getStatusInfo }) => {
  const statusInfo = getStatusInfo(order.status);
  const dateInfo = formatDate(order.date);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="font-mono text-lg font-bold text-primary">
              {order.id}
            </div>
            <Badge className={`${statusInfo.color} text-white`}>
              <div className="flex items-center gap-1">
                {statusInfo.icon}
                <span>{statusInfo.label}</span>
              </div>
            </Badge>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Calendar className="h-4 w-4" />
              <span>{dateInfo.date}</span>
            </div>
            <div className="text-xs text-gray-500">{dateInfo.time}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-600"> </div>
            <div className="font-semibold">{(order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0)} </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600"> </div>
            <div className="font-semibold">{(order.shippingCost || 0).toFixed(2)} .</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600"></div>
            <div className="text-xl font-bold text-primary">{order.finalTotal || order.total} .</div>
          </div>
        </div>
        
        {(order.discountAmount || 0) > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <span>  : {(order.discountAmount || 0).toFixed(2)} .</span>
            </Badge>
          </div>
        )}
        
        {/*    */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {(order.items || []).slice(0, 4).map((item, index) => (
            <div key={index} className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden">
              <img
                src={item.product?.images?.[0] || '/assets/products/placeholder.png'}
                alt={item.product?.name || ''}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/products/placeholder.png';
                }}
              />
            </div>
          ))}
          {(order.items || []).length > 4 && (
            <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 text-xs">
              +{(order.items || []).length - 4}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>: {order.payment?.method ? (order.payment.method === 'onDelivery' ? ' ' : ' ') : ' '}</span>
          </div>
          
          <Button variant="outline" onClick={onViewDetails} className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
             
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

//    
const OrderDetailsModal: React.FC<{
  order: Order;
  onClose: () => void;
  formatDate: (date: string) => any;
  getStatusInfo: (status: string) => any;
}> = ({ order, onClose, formatDate, getStatusInfo }) => {
  const statusInfo = getStatusInfo(order.status);
  const dateInfo = formatDate(order.date);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <span> </span>
              <Badge className={`${statusInfo.color} text-white`}>
                <div className="flex items-center gap-1">
                  {statusInfo.icon}
                  <span>{statusInfo.label}</span>
                </div>
              </Badge>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {order.id}  {dateInfo.date} - {dateInfo.time}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/*   */}
          <div>
            <h3 className="font-semibold mb-3"> </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <div><strong>:</strong> {order.customer?.firstName || order.customer?.name || ''} {order.customer?.lastName || ''}</div>
              <div><strong>:</strong> {order.customer?.phone || ' '}</div>
              <div><strong>:</strong> {order.customer?.area || ''} {order.customer?.city || ''}</div>
              {order.customer?.address && <div><strong> :</strong> {order.customer.address}</div>}
            </div>
          </div>
          
          {/*  */}
          <div>
            <h3 className="font-semibold mb-3"> </h3>
            <div className="space-y-3">
              {(order.items || []).map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl"></span>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product?.name || '  '}</h4>
                    <p className="text-sm text-gray-600">
                      : {item.size || ' '}  : {item.color || ' '}  : {item.quantity || 0}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-primary">{((item.product?.price || 0) * (item.quantity || 0)).toFixed(2)} .</div>
                    <div className="text-sm text-gray-500">{(item.product?.price || 0).toFixed(2)} .  {item.quantity || 0}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/*   */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3"> </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span> :</span>
                <span className="font-medium">{order.total - order.shippingCost + order.discountAmount} .</span>
              </div>
              
              <div className="flex justify-between">
                <span>  :</span>
                <span className="font-medium">{order.shippingCost} .</span>
              </div>
              
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>  :</span>
                  <span className="font-medium">-{order.discountAmount} .</span>
                </div>
              )}
              
              <hr className="border-gray-300" />
              <div className="flex justify-between text-lg font-bold pt-1">
                <span> :</span>
                <span className="text-primary">{(order.finalTotal !== undefined ? order.finalTotal : order.total || 0).toFixed(2)} .</span>
              </div>
            </div>
          </div>
          
          {/*    */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2"> </h4>
              <p className="text-sm">
                {order.payment?.method ? (order.payment.method === 'onDelivery' ? ' ' : ' ') : ' '}
                {order.payment?.type ? ` - ${order.payment.type}` : ''}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2"> </h4>
              <p className="text-sm">
                {order.shipping?.type === 'normal' ? ' ' : ' '}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersPage;
