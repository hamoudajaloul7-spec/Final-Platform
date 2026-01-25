import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Building,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Globe,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  Save,
  Search,
  ShoppingBag,
  Trash2,
  Truck,
  User,
  Users,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { libyanCities } from '@/data/libya';
import { getApiUrl } from '@/utils/apiConfig';

const API_BASE_URL = getApiUrl();

interface ManualOrder {
  id: string;
  orderNumber: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingType?: string;
  shippingAddress?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  productId?: number;
  productName: string;
  sku?: string;
  quantity: number;
  price: number;
  total: number;
}

interface ProductOption {
  id: number;
  name: string;
  sku?: string;
  price: number;
  quantity?: number;
}

interface ManualOrdersViewProps {
  storeData: any;
  setStoreData: (data: any) => void;
  onSave: () => void;
}

const buildInitialForm = () => ({
  orderNumber: `ORD-${Date.now()}`,
  customerFirstName: '',
  customerLastName: '',
  customerEmail: '',
  customerPhone: '',
  customerCity: '',
  customerArea: '',
  shippingAddress: '',
  paymentMethod: 'onDelivery',
  paymentPlan: 'immediate',
  bankName: '',
  accountHolder: '',
  transactionStatus: 'pending',
  shippingType: 'normal',
  expectedDelivery: '',
  identityNumber: '',
  deliveryAgent: '',
  deliveryNote: '',
  customerNotes: '',
  internalNotes: '',
  items: [] as OrderItem[],
});

const normalizeOrderItems = (items: any[] = []): OrderItem[] =>
  items.map((item) => {
    const price = Number(item.productPrice ?? item.price ?? 0);
    const quantity = Number(item.quantity ?? 0);
    return {
      id: String(item.id ?? `${item.orderId ?? 'order'}-${item.productId ?? Date.now()}`),
      productId: item.productId,
      productName: item.productName ?? 'عنصر',
      sku: item.sku ?? item.size ?? item.color ?? '',
      quantity,
      price,
      total: Number(item.lineTotal ?? price * quantity),
    };
  });

const normalizeOrderRecord = (record: any): ManualOrder => {
  const fallbackName = typeof record.customerName === 'string' ? record.customerName.trim().split(' ') : [];
  const firstFromFallback = fallbackName.shift() || '';
  const lastFromFallback = fallbackName.join(' ');

  return {
    id: record.id ?? record.orderId ?? String(Date.now()),
    orderNumber: record.orderNumber ?? 'ORD',
    customerFirstName: record.customerFirstName ?? firstFromFallback,
    customerLastName: record.customerLastName ?? lastFromFallback,
    customerEmail: record.customerEmail ?? '',
    customerPhone: record.customerPhone ?? '',
    status: record.orderStatus ?? 'pending',
    paymentMethod: record.paymentMethod ?? '',
    paymentStatus: record.paymentStatus ?? 'pending',
    shippingType: record.shippingType,
    shippingAddress: record.customerAddress,
    items: normalizeOrderItems(record.items ?? []),
    subtotal: Number(record.subtotal ?? 0),
    shipping: Number(record.shippingCost ?? 0),
    tax: 0,
    total: Number(record.finalTotal ?? 0),
    notes: record.notes,
    createdAt: record.createdAt ?? new Date().toISOString(),
    updatedAt: record.updatedAt ?? record.createdAt ?? new Date().toISOString(),
  };
};

const ManualOrdersView: React.FC<ManualOrdersViewProps> = ({ storeData, setStoreData, onSave }) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const [orderForm, setOrderForm] = useState<ReturnType<typeof buildInitialForm>>(buildInitialForm);
  const [orders, setOrders] = useState<ManualOrder[]>(storeData?.manualOrders || []);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [productCatalog, setProductCatalog] = useState<ProductOption[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  const availableProducts = useMemo<ProductOption[]>(() => {
    if (productCatalog.length > 0) {
      return productCatalog;
    }
    if (Array.isArray(storeData?.products)) {
      return storeData.products.map((product: any, index: number) => ({
        id: Number(product.id ?? index + 1),
        name: product.name ?? `منتج ${index + 1}`,
        sku: product.sku,
        price: Number(product.price ?? 0),
        quantity: Number(product.quantity ?? product.stock ?? 0),
      }));
    }
    return [];
  }, [productCatalog, storeData?.products]);

  const itemsTotal = useMemo(() => orderForm.items.reduce((sum, item) => sum + item.total, 0), [orderForm.items]);

  const filteredOrders = orders.filter((order: ManualOrder) => {
    const fullName = `${order.customerFirstName ?? ''} ${order.customerLastName ?? ''}`.trim();
    return (
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleCreateOrder = () => {
    setOrderForm(buildInitialForm());
    setFormError(null);
    setSubmitSuccess(null);
    setCurrentStep(1);
    setShowCreateModal(true);
  };

  useEffect(() => {
    if (storeData?.manualOrders) {
      setOrders(storeData.manualOrders);
    }
  }, [storeData?.manualOrders]);

  const fetchManualOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    setFormError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/orders?type=manual&limit=100`, {
        method: 'GET',
        credentials: 'include',
      });
      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.error || 'تعذر تحميل الطلبات');
      }
      const normalized = Array.isArray(result.data)
        ? result.data.map((record: any) => normalizeOrderRecord(record))
        : [];
      setOrders(normalized);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'تعذر تحميل الطلبات');
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  const fetchProductCatalog = useCallback(async () => {
    setCatalogLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products?limit=200`, {
        method: 'GET',
        credentials: 'include',
      });
      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.error || 'تعذر تحميل المنتجات');
      }
      const normalized: ProductOption[] = Array.isArray(result.data)
        ? result.data.map((product: any) => ({
            id: product.id,
            name: product.name,
            sku: product.sku,
            price: Number(product.price ?? 0),
            quantity: Number(product.quantity ?? 0),
          }))
        : [];
      setProductCatalog(normalized);
    } catch (error) {

    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchManualOrders();
    fetchProductCatalog();
  }, [fetchManualOrders, fetchProductCatalog]);

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddItem = () => {
    const product = availableProducts.find((p) => String(p.id) === selectedProductId);
    if (!product) {
      setFormError('اختر منتجاً صالحاً');
      return;
    }
    if (selectedQuantity <= 0) {
      setFormError('الكمية يجب أن تكون أكبر من صفر');
      return;
    }
    const price = Number(product.price ?? 0);
    const quantity = Number(selectedQuantity);
    const newItem: OrderItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      quantity,
      price,
      total: price * quantity,
    };
    if (product.sku) {
      newItem.sku = product.sku;
    }
    setOrderForm((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    setSelectedProductId('');
    setSelectedQuantity(1);
    setFormError(null);
  };

  const handleRemoveItem = (index: number) => {
    setOrderForm((prev) => ({ ...prev, items: prev.items.filter((_, idx) => idx !== index) }));
  };

  const handleSaveOrder = async () => {
    if (!orderForm.customerFirstName.trim() || !orderForm.customerLastName.trim()) {
      setFormError('يرجى إدخال الاسم الأول واسم العائلة');
      return;
    }

    if (!orderForm.customerPhone.trim()) {
      setFormError('يرجى إدخال رقم الهاتف');
      return;
    }

    if (orderForm.items.length === 0) {
      setFormError('أضف منتجاً واحداً على الأقل إلى الطلب');
      return;
    }

    if (orderForm.items.some((item) => !item.productId)) {
      setFormError('كل عنصر يجب أن يرتبط بمنتج من الكتالوج');
      return;
    }

    const addressFallback = [orderForm.shippingAddress, orderForm.customerArea, orderForm.customerCity]
      .filter(Boolean)
      .join(', ');

    const payload = {
      customerFirstName: orderForm.customerFirstName.trim(),
      customerLastName: orderForm.customerLastName.trim(),
      customerPhone: orderForm.customerPhone.trim(),
      customerEmail: orderForm.customerEmail.trim(),
      customerAddress: addressFallback,
      customerCity: orderForm.customerCity.trim(),
      customerArea: orderForm.customerArea.trim(),
      shippingType: orderForm.shippingType === 'express' ? 'express' : 'normal',
      paymentMethod: orderForm.paymentMethod || 'onDelivery',
      paymentPlan: orderForm.paymentPlan,
      identityNumber: orderForm.identityNumber || undefined,
      deliveryAgent: orderForm.deliveryAgent || undefined,
      deliveryNote: orderForm.deliveryNote || undefined,
      notes: orderForm.internalNotes || orderForm.customerNotes || undefined,
      storeId: storeData?.storeId ?? storeData?.id,
      items: orderForm.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    setIsSavingOrder(true);
    setFormError(null);
    setSubmitSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/orders/manual`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.error || 'تعذر حفظ الطلب');
      }
      await fetchManualOrders();
      setSubmitSuccess('تم حفظ الطلب اليدوي بنجاح');
      setShowCreateModal(false);
      setOrderForm(buildInitialForm());
      onSave();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'تعذر حفظ الطلب');
    } finally {
      setIsSavingOrder(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { variant: 'default' as const, label: 'جديد', color: 'bg-blue-100 text-blue-800' },
      pending: { variant: 'default' as const, label: 'قيد المراجعة', color: 'bg-blue-100 text-blue-800' },
      confirmed: { variant: 'default' as const, label: 'مؤكد', color: 'bg-indigo-100 text-indigo-800' },
      paid: { variant: 'default' as const, label: 'مدفوع', color: 'bg-green-100 text-green-800' },
      processing: { variant: 'secondary' as const, label: 'قيد المعالجة', color: 'bg-yellow-100 text-yellow-800' },
      shipped: { variant: 'secondary' as const, label: 'مشحون', color: 'bg-purple-100 text-purple-800' },
      delivered: { variant: 'default' as const, label: 'تم التوصيل', color: 'bg-green-100 text-green-800' },
      cancelled: { variant: 'destructive' as const, label: 'ملغي', color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getPaymentLabel = (method: string) => {
    if (method === 'onDelivery') return 'عند الاستلام';
    if (method === 'immediate') return 'دفع فوري';
    return method;
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">إنشاء طلب جديد</h3>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">1</div>
          <span>معلومات الطلب الأساسية</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="orderNumber">رقم الطلب</Label>
          <Input
            id="orderNumber"
            value={orderForm.orderNumber}
            onChange={(e) => setOrderForm({ ...orderForm, orderNumber: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="customerFirstName">الاسم الأول *</Label>
          <Input
            id="customerFirstName"
            value={orderForm.customerFirstName}
            onChange={(e) => setOrderForm({ ...orderForm, customerFirstName: e.target.value })}
            placeholder="أدخل الاسم الأول"
          />
        </div>
        <div>
          <Label htmlFor="customerLastName">اسم العائلة *</Label>
          <Input
            id="customerLastName"
            value={orderForm.customerLastName}
            onChange={(e) => setOrderForm({ ...orderForm, customerLastName: e.target.value })}
            placeholder="أدخل اسم العائلة"
          />
        </div>
        <div>
          <Label htmlFor="customerEmail">البريد الإلكتروني</Label>
          <Input
            id="customerEmail"
            type="email"
            value={orderForm.customerEmail}
            onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })}
            placeholder="customer@example.com"
          />
        </div>
        <div>
          <Label htmlFor="customerPhone">رقم الهاتف</Label>
          <Input
            id="customerPhone"
            value={orderForm.customerPhone}
            onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })}
            placeholder="+218912345678"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">إضافة المنتجات</h3>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">2</div>
          <span>اختيار المنتجات من متجرك</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <Select value={selectedProductId} onValueChange={(value) => setSelectedProductId(value)}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={catalogLoading ? 'جاري تحميل المنتجات...' : 'اختر منتج لإضافته'} />
            </SelectTrigger>
            <SelectContent>
              {availableProducts.length === 0 && <SelectItem value="">لا توجد منتجات متاحة</SelectItem>}
              {availableProducts.map((product) => (
                <SelectItem key={product.id} value={String(product.id)}>
                  {product.name} {product.sku ? `(${product.sku})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            min={1}
            value={selectedQuantity}
            onChange={(e) => setSelectedQuantity(Math.max(1, Number(e.target.value) || 1))}
            className="md:w-32"
            placeholder="الكمية"
          />
          <Button onClick={handleAddItem} disabled={!selectedProductId || availableProducts.length === 0}>
            إضافة
          </Button>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-3">المنتجات المضافة</h4>
          {orderForm.items.length === 0 ? (
            <p className="text-gray-500 text-center py-4">لم يتم إضافة أي منتجات بعد</p>
          ) : (
            <div className="space-y-2">
              {orderForm.items.map((item, index) => (
                <div key={item.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-600">
                      {item.sku ? `SKU: ${item.sku} • ` : ''}كمية: {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{item.total.toFixed(2)} د.ل</span>
                    <Button variant="outline" size="sm" onClick={() => handleRemoveItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">معلومات العميل</h3>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">3</div>
          <span>بيانات التوصيل والتواصل</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="customerCity">المدينة</Label>
          <Select value={orderForm.customerCity} onValueChange={(value) => setOrderForm({ ...orderForm, customerCity: value })}>
            <SelectTrigger>
              <SelectValue placeholder="اختر المدينة" />
            </SelectTrigger>
            <SelectContent>
              {libyanCities.map((city) => (
                <SelectItem key={city.id} value={city.name}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="customerArea">المنطقة</Label>
          <Input
            id="customerArea"
            value={orderForm.customerArea}
            onChange={(e) => setOrderForm({ ...orderForm, customerArea: e.target.value })}
            placeholder="مثال: الفرناج"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="shippingAddress">عنوان التوصيل</Label>
          <Textarea
            id="shippingAddress"
            value={orderForm.shippingAddress}
            onChange={(e) => setOrderForm({ ...orderForm, shippingAddress: e.target.value })}
            placeholder="أدخل عنوان التوصيل التفصيلي"
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">طريقة الدفع والشحن</h3>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">4</div>
          <span>إتمام الطلب وملاحظات</span>
        </div>
      </div>

      <Tabs defaultValue="payment" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payment">طريقة الدفع</TabsTrigger>
          <TabsTrigger value="shipping">الشحن</TabsTrigger>
          <TabsTrigger value="summary">ملخص الطلب</TabsTrigger>
        </TabsList>

        <TabsContent value="payment" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>طريقة الدفع</Label>
              <Select value={orderForm.paymentMethod} onValueChange={(value) => setOrderForm({ ...orderForm, paymentMethod: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onDelivery">عند الاستلام</SelectItem>
                  <SelectItem value="immediate">دفع فوري</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>خطة الدفع</Label>
              <Select value={orderForm.paymentPlan} onValueChange={(value) => setOrderForm({ ...orderForm, paymentPlan: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر خطة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">فوري</SelectItem>
                  <SelectItem value="qasatli">قسطلتي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {orderForm.paymentMethod === 'immediate' && (
              <>
                <div>
                  <Label>المصرف</Label>
                  <Select value={orderForm.bankName} onValueChange={(value) => setOrderForm({ ...orderForm, bankName: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المصرف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_of_republic">مصرف الجمهورية</SelectItem>
                      <SelectItem value="united_bank">مصرف المتحد</SelectItem>
                      <SelectItem value="islamic_bank">مصرف الليبي الإسلامي</SelectItem>
                      <SelectItem value="foreign_bank">مصرف الخارجي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>اسم صاحب الحساب</Label>
                  <Input
                    value={orderForm.accountHolder}
                    onChange={(e) => setOrderForm({ ...orderForm, accountHolder: e.target.value })}
                    placeholder="أحمد محمد"
                  />
                </div>
                <div>
                  <Label>حالة العملية</Label>
                  <Select value={orderForm.transactionStatus} onValueChange={(value) => setOrderForm({ ...orderForm, transactionStatus: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">قيد المعالجة</SelectItem>
                      <SelectItem value="completed">نفذت مباشرة</SelectItem>
                      <SelectItem value="waiting">تحت الانتظار</SelectItem>
                      <SelectItem value="paid">مكتملة</SelectItem>
                      <SelectItem value="cancelled">ملغية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>طريقة الشحن</Label>
              <Select value={orderForm.shippingType} onValueChange={(value) => setOrderForm({ ...orderForm, shippingType: value as 'normal' | 'express' })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر طريقة الشحن" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">شحن عادي</SelectItem>
                  <SelectItem value="express">شحن سريع</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الوقت المتوقع للاستلام</Label>
              <Input
                type="datetime-local"
                value={orderForm.expectedDelivery}
                onChange={(e) => setOrderForm({ ...orderForm, expectedDelivery: e.target.value })}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>قيمة المنتجات</span>
                  <span>{itemsTotal.toFixed(2)} د.ل</span>
                </div>
                <div className="flex justify-between">
                  <span>رسوم الشحن</span>
                  <span>0.00 د.ل</span>
                </div>
                <div className="flex justify-between">
                  <span>الضرائب</span>
                  <span>0.00 د.ل</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>المجموع الكلي</span>
                  <span>{itemsTotal.toFixed(2)} د.ل</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label>رقم الهوية / السجل</Label>
              <Input
                value={orderForm.identityNumber}
                onChange={(e) => setOrderForm({ ...orderForm, identityNumber: e.target.value })}
                placeholder="مثال: 123456789"
              />
            </div>
            <div>
              <Label>مندوب التوصيل</Label>
              <Input
                value={orderForm.deliveryAgent}
                onChange={(e) => setOrderForm({ ...orderForm, deliveryAgent: e.target.value })}
                placeholder="اسم المندوب"
              />
            </div>
            <div>
              <Label>ملاحظة التوصيل</Label>
              <Input
                value={orderForm.deliveryNote}
                onChange={(e) => setOrderForm({ ...orderForm, deliveryNote: e.target.value })}
                placeholder="تعليمات خاصة"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>ملاحظات العميل</Label>
              <Textarea
                value={orderForm.customerNotes}
                onChange={(e) => setOrderForm({ ...orderForm, customerNotes: e.target.value })}
                placeholder="ملاحظات العميل"
                rows={3}
              />
            </div>
            <div>
              <Label>ملاحظات داخلية</Label>
              <Textarea
                value={orderForm.internalNotes}
                onChange={(e) => setOrderForm({ ...orderForm, internalNotes: e.target.value })}
                placeholder="ملاحظات داخلية"
                rows={3}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">الطلبات اليدوية</h2>
          <p className="text-gray-600 mt-1">إدارة وإنشاء الطلبات يدوياً مع العملاء</p>
        </div>
        <Button
          onClick={handleCreateOrder}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          <Plus className="h-4 w-4 ml-2" />
          إنشاء طلب جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الطلبات</p>
                <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                <p className="text-sm text-green-600">+12% من الشهر الماضي</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الطلبات المكتملة</p>
                <p className="text-3xl font-bold text-gray-900">{orders.filter(o => o.status === 'delivered').length}</p>
                <p className="text-sm text-gray-600">معدل الإنجاز: 80%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">قيد المعالجة</p>
                <p className="text-3xl font-bold text-gray-900">{orders.filter(o => o.status === 'processing').length}</p>
                <p className="text-sm text-gray-600">يحتاج للمتابعة</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
                <p className="text-3xl font-bold text-gray-900">{orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)} د.ل</p>
                <p className="text-sm text-gray-600">متوسط الطلب: {orders.length > 0 ? (orders.reduce((sum, o) => sum + o.total, 0) / orders.length).toFixed(2) : '0.00'} د.ل</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>الطلبات الحديثة</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث في الطلبات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 ml-2" />
                تصفية
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 ml-2" />
                تصدير
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingOrders && <p className="text-sm text-gray-500 mb-3">جاري تحميل الطلبات...</p>}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-semibold">رقم الطلب</th>
                  <th className="text-right p-3 font-semibold">العميل</th>
                  <th className="text-right p-3 font-semibold">الحالة</th>
                  <th className="text-right p-3 font-semibold">المبلغ</th>
                  <th className="text-right p-3 font-semibold">طريقة الدفع</th>
                  <th className="text-right p-3 font-semibold">التاريخ</th>
                  <th className="text-right p-3 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order: ManualOrder) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <p className="font-semibold">{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">{order.items.length} عنصر</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-semibold">
                          {`${order.customerFirstName ?? ''} ${order.customerLastName ?? ''}`.trim() || 'بدون اسم'}
                        </p>
                        <p className="text-sm text-gray-600">{order.customerPhone || '---'}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="p-3">
                      <p className="font-semibold">{order.total.toFixed(2)} د.ل</p>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{getPaymentLabel(order.paymentMethod)}</Badge>
                    </td>
                    <td className="p-3">
                      <p className="text-sm">{new Date(order.createdAt).toLocaleDateString('ar')}</p>
                      <p className="text-xs text-gray-600">{new Date(order.createdAt).toLocaleTimeString('ar')}</p>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد طلبات يدوية بعد</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Order Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">إنشاء طلب جديد</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {(formError || submitSuccess) && (
                <div
                  className={`mb-4 rounded-lg border p-3 text-sm ${
                    formError ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'
                  }`}
                >
                  {formError ?? submitSuccess}
                </div>
              )}

              {/* Step Indicators */}
              <div className="flex items-center justify-center gap-4 mb-8">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step === currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step}
                    </div>
                    {step < 4 && <div className="w-12 h-1 bg-gray-200"></div>}
                  </div>
                ))}
              </div>

              {/* Step Content */}
              <div className="min-h-[400px]">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                >
                  <ChevronRight className="h-4 w-4 ml-2" />
                  السابق
                </Button>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    إلغاء
                  </Button>
                  {currentStep < 4 ? (
                    <Button
                      onClick={handleNextStep}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      التالي
                      <ChevronLeft className="h-4 w-4 mr-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSaveOrder}
                      disabled={isSavingOrder}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-70"
                    >
                      <Save className="h-4 w-4 ml-2" />
                      {isSavingOrder ? 'جارٍ الحفظ...' : 'حفظ الطلب'}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { ManualOrdersView };
