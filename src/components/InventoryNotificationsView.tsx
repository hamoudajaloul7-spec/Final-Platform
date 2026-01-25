import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Save,
  X,
  Bell,
  BellOff,
  Clock,
  Mail,
  Phone,
  Package,
  Users,
  DollarSign,
  Settings,
  Eye,
  CheckCircle,
  AlertCircle,
  Calendar,
  MessageSquare,
  Percent,
  Gift,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { getApiUrl } from '@/utils/apiConfig';

interface InventoryNotification {
  id: string;
  productName: string;
  brand: string;
  notificationDate: string;
  customerEmail: string;
  customerPhone: string;
  requestedQuantity: number;
  subscriptionDate: string;
  status: 'active' | 'inactive';
  communicationMethod: 'email' | 'sms' | 'both';
}

interface InventoryNotificationsViewProps {
  storeData: any;
  setStoreData: (data: any) => void;
  onSave: () => void;
}

const InventoryNotificationsView: React.FC<InventoryNotificationsViewProps> = ({ storeData, setStoreData, onSave }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settingsForm, setSettingsForm] = useState({
    delayTime: 60,
    delayUnit: 'minutes',
    discountCode: '',
    notificationMessageAr: 'عزيزنا {customer_name}، تم توفر {product_name} في منصة إشرو، بإمكانك طلبه الآن {product_url}',
    notificationMessageEn: 'Dear {customer_name}, {product_name} is now back in stock, you can order it now {product_url}',
    whatsappEnabled: true,
    smsEnabled: false,
    emailEnabled: false,
  });

  React.useEffect(() => {
    fetchLowStockProducts();
  }, [storeData]);

  const fetchLowStockProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const storeId = storeData?.slug || storeData?.id || storeData?.storeSlug;
      if (!storeId) {
        setError('معرف المتجر غير محدد');
        return;
      }

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/inventory/store/${storeId}/low-stock`);
      if (response.ok) {
        const result = await response.json();
        setLowStockAlerts(result.data || []);
      }
    } catch (err) {
      // Error fetching low stock products
    } finally {
      setLoading(false);
    }
  };

  const notifications: InventoryNotification[] = [
    {
      id: '1',
      productName: 'فستان أحمر بالدانتيل',
      brand: 'SAMARA',
      notificationDate: '20/04/2025 10:30:23 صباحا',
      customerEmail: 'ahmed.salem@gmail.com',
      customerPhone: '0922682101',
      requestedQuantity: 2,
      subscriptionDate: '10/01/2025',
      status: 'active',
      communicationMethod: 'email',
    },
    {
      id: '2',
      productName: 'حذاء نسائي أنيق',
      brand: 'ZARA',
      notificationDate: '18/04/2025 14:15:45 ظهرا',
      customerEmail: 'fatima.mohammed@hotmail.com',
      customerPhone: '0915234567',
      requestedQuantity: 1,
      subscriptionDate: '05/02/2025',
      status: 'active',
      communicationMethod: 'sms',
    },
    {
      id: '3',
      productName: 'فستان سهرين طويل Hermes',
      brand: 'Hermes',
      notificationDate: '15/04/2025 09:20:12 صباحا',
      customerEmail: 'omar.ali@gmail.com',
      customerPhone: '0918765432',
      requestedQuantity: 1,
      subscriptionDate: '20/01/2025',
      status: 'active',
      communicationMethod: 'both',
    },
  ];

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch =
      notification.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.customerPhone.includes(searchTerm);

    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'today') return matchesSearch && notification.notificationDate.includes(new Date().toLocaleDateString('ar'));
    if (activeFilter === 'yesterday') return matchesSearch && notification.notificationDate.includes(new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('ar'));
    if (activeFilter === 'this_month') return matchesSearch && notification.notificationDate.includes(new Date().getMonth().toString());

    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800">مفعل</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">غير مفعل</Badge>
    );
  };

  const getCommunicationBadge = (method: string) => {
    const methodConfig = {
      email: { label: 'البريد الإلكتروني', color: 'bg-blue-100 text-blue-800' },
      sms: { label: 'رسالة نصية', color: 'bg-green-100 text-green-800' },
      both: { label: 'الكل', color: 'bg-purple-100 text-purple-800' },
    };

    const config = methodConfig[method as keyof typeof methodConfig] || methodConfig.email;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">إشعارات المخزون</h2>
          <p className="text-gray-600 mt-1">إشعار العملاء عند توفر المنتجات مرة أخرى</p>
        </div>
        <Button
          onClick={() => setShowSettingsModal(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          الإعدادات
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              تنبيهات المخزون المنخفض
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockAlerts.map((alert) => (
                <div key={alert.id} className="border border-yellow-300 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 truncate">{alert.name}</h4>
                    <Badge className={alert.type === 'out_of_stock' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                      {alert.type === 'out_of_stock' ? 'نفاد المخزون' : 'مخزون منخفض'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">SKU: {alert.sku}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">الكمية الحالية:</span>
                    <span className={`font-bold ${alert.quantity === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                      {alert.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">المخزون المنخفض</p>
                <p className="text-3xl font-bold text-yellow-600">{lowStockAlerts.length}</p>
                <p className="text-sm text-gray-600">منتج يحتاج إعادة تخزين</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">نفاد المخزون</p>
                <p className="text-3xl font-bold text-red-600">{lowStockAlerts.filter(a => a.type === 'out_of_stock').length}</p>
                <p className="text-sm text-gray-600">منتج غير متوفر</p>
              </div>
              <Package className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الإشعارات المرسلة</p>
                <p className="text-3xl font-bold text-gray-900">30 تنبيه</p>
              </div>
              <Bell className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">معدل التحويل</p>
                <p className="text-3xl font-bold text-gray-900">0%</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardContent className="p-4">
          <Tabs value={activeFilter} onValueChange={setActiveFilter}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">الكل</TabsTrigger>
              <TabsTrigger value="today">اليوم</TabsTrigger>
              <TabsTrigger value="yesterday">الأمس</TabsTrigger>
              <TabsTrigger value="this_month">الشهر الجاري</TabsTrigger>
              <TabsTrigger value="last_month">الشهر الماضي</TabsTrigger>
              <TabsTrigger value="this_year">السنة الحالية</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>قائمة التنبيهات</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="بحث عن تنبيه معين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 ml-2" />
                تصدير
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-semibold">المنتج</th>
                  <th className="text-right p-3 font-semibold">الماركة</th>
                  <th className="text-right p-3 font-semibold">تاريخ الإشعار بتوفير المنتج</th>
                  <th className="text-right p-3 font-semibold">البريد الإلكتروني</th>
                  <th className="text-right p-3 font-semibold">رقم الموبايل</th>
                  <th className="text-right p-3 font-semibold">الكمية المطلوبة</th>
                  <th className="text-right p-3 font-semibold">تاريخ الاشتراك</th>
                  <th className="text-right p-3 font-semibold">حالة الإشعار</th>
                  <th className="text-right p-3 font-semibold">التواصل</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotifications.map((notification) => (
                  <tr key={notification.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <p className="font-semibold">{notification.productName}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-semibold">{notification.brand}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-sm">{notification.notificationDate}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-sm">{notification.customerEmail}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-sm">{notification.customerPhone}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-sm">{notification.requestedQuantity}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-sm">{notification.subscriptionDate}</p>
                    </td>
                    <td className="p-3">
                      {getStatusBadge(notification.status)}
                    </td>
                    <td className="p-3">
                      {getCommunicationBadge(notification.communicationMethod)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredNotifications.length === 0 && (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد تنبيهات تطابق معايير البحث</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowSettingsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">إعدادات التنبيهات التلقائية</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettingsModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Delay Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      إعدادات التأخير
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>بعد:</Label>
                        <Input
                          type="number"
                          value={settingsForm.delayTime}
                          onChange={(e) => setSettingsForm({ ...settingsForm, delayTime: Number(e.target.value) })}
                          placeholder="60"
                        />
                      </div>
                      <div>
                        <Label>الوحدة الزمنية</Label>
                        <Select value={settingsForm.delayUnit} onValueChange={(value) => setSettingsForm({ ...settingsForm, delayUnit: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minutes">دقيقة</SelectItem>
                            <SelectItem value="hours">ساعة</SelectItem>
                            <SelectItem value="days">يوم</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <p className="text-sm text-gray-600">منذ إعادة توفير المنتج</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Discount Code */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="h-5 w-5" />
                      إضافة عرض
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>كود الخصم</Label>
                        <Select value={settingsForm.discountCode} onValueChange={(value) => setSettingsForm({ ...settingsForm, discountCode: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="بدون عرض" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">بدون عرض</SelectItem>
                            <SelectItem value="WELCOME10">خصم 10%</SelectItem>
                            <SelectItem value="WELCOME20">خصم 20%</SelectItem>
                            <SelectItem value="WELCOME30">خصم 30%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notification Messages */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      رسائل الإشعارات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>المنتج بالعربية</Label>
                        <Textarea
                          value={settingsForm.notificationMessageAr}
                          onChange={(e) => setSettingsForm({ ...settingsForm, notificationMessageAr: e.target.value })}
                          placeholder="عزيزنا {customer_name}، تم توفر {product_name} في منصة إشرو، بإمكانك طلبه الآن {product_url}"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>المنتج بالإنجليزية</Label>
                        <Textarea
                          value={settingsForm.notificationMessageEn}
                          onChange={(e) => setSettingsForm({ ...settingsForm, notificationMessageEn: e.target.value })}
                          placeholder="Dear {customer_name}, {product_name} is now back in stock, you can order it now {product_url}"
                          rows={3}
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="font-semibold mb-2">القيم المقترحة:</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <Badge variant="outline">customer_name - اسم العميل</Badge>
                          <Badge variant="outline">product_name - اسم المنتج</Badge>
                          <Badge variant="outline">product_url - رابط المنتج</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Communication Methods */}
                <Card>
                  <CardHeader>
                    <CardTitle>طرق التواصل</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="whatsapp"
                          checked={settingsForm.whatsappEnabled}
                          onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, whatsappEnabled: checked as boolean })}
                        />
                        <Label htmlFor="whatsapp">واتساب</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sms"
                          checked={settingsForm.smsEnabled}
                          onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, smsEnabled: checked as boolean })}
                        />
                        <Label htmlFor="sms">رسالة SMS تصل للتاجر</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="email"
                          checked={settingsForm.emailEnabled}
                          onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, emailEnabled: checked as boolean })}
                        />
                        <Label htmlFor="email">البريد الإلكتروني للتاجر</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Save className="h-4 w-4 ml-2" />
                  حفظ الإعدادات
                </Button>
                <Button variant="outline" onClick={() => setShowSettingsModal(false)}>
                  إلغاء
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { InventoryNotificationsView };
