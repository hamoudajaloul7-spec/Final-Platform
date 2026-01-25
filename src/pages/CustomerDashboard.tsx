import React, { useEffect, useMemo, useState } from 'react';
import { getProxyImageUrl } from '@/utils/assetProxyUtil';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Activity,
  Check,
  Clock,
  CreditCard,
  Download as DownloadIcon,
  Headphones,
  LogOut,
  Mail,
  MessageCircle,
  Package,
  Phone,
  Share2,
  Sparkles,
  Star,
  Trophy,
  UploadCloud,
  User as UserIcon,
  Users,
  Wallet
} from 'lucide-react';
import { allStoreProducts } from '@/data/allStoreProducts';
import { getCityAreas, libyanAreas, libyanCities } from '@/data/libya/cities/cities';

type SectionId = 'dashboard' | 'orders' | 'subscriptions' | 'referrals' | 'downloads' | 'profile' | 'support';

type ShippingSpeed = 'normal' | 'express';

export interface OrderRecord {
  id: string;
  date?: string;
  time?: string;
  status?: string;
  subtotal?: number;
  total?: number;
  totalAmount?: number;
  finalTotal?: number;
  shippingCost?: number;
  discountAmount?: number;
  discountPercentage?: number;
  createdAt?: string;
  created_at?: string;
  items?: Array<{ id?: number; name?: string; price?: number; quantity?: number; product?: any }>;
  customer?: { name?: string; address?: string; phone?: string; firstName?: string; lastName?: string; email?: string; city?: string; area?: string };
  shipping?: { type?: string; cost?: number; estimatedTime?: string; company?: string; address?: string };
  payment?: { method?: string; type?: string };
  notes?: string;
  location?: { latitude?: number; longitude?: number; accuracy?: number };
}

interface CustomerInfo {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  membershipType?: string;
  joinDate?: string;
  loyaltyPoints?: number;
  monthlyGoal?: number;
  referralsCount?: number;
  referralsJoined?: number;
  loyaltyTier?: string;
  avatar?: string;
  city?: string;
  area?: string;
  address?: string;
  birthDate?: string;
  bankName?: string;
  bankAccount?: string;
  bankAccountHolder?: string;
  accountStatus?: string;
  satisfactionRate?: number;
  activityDays?: number;
}

export interface CreateOrderPayload {
  orderType: 'normal' | 'urgent';
  productId: number;
  quantity: number;
  fullName: string;
  phone: string;
  email: string;
  cityId: string;
  areaId: string;
  address: string;
  latitude?: number;
  longitude?: number;
  shippingOptionId: string;
  shippingCompany: string;
  notes?: string;
}

interface CustomerDashboardProps {
  customerData?: CustomerInfo;
  favorites?: any[];
  orders?: OrderRecord[];
  unavailableItems?: any[];
  onBack: () => void;
  onLogout: () => void;
  onCreateOrder?: (payload: CreateOrderPayload) => Promise<OrderRecord | void> | OrderRecord | void;
  onUpdateProfile?: (data: CustomerInfo) => void;
  onPasswordChange?: (payload: { currentPassword: string; newPassword: string }) => Promise<void> | void;
}

interface NewOrderFormState {
  orderType: 'normal' | 'urgent';
  productId: string;
  quantity: number;
  fullName: string;
  phone: string;
  email: string;
  cityId: string;
  areaId: string;
  address: string;
  latitude: string;
  longitude: string;
  shippingOptionId: string;
  shippingCompany: string;
  notes: string;
}

interface ProfileFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  city: string;
  area: string;
  address: string;
  bankName: string;
  bankAccount: string;
  bankAccountHolder: string;
  avatar?: string;
}

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const featuredStoreIds = [1, 2, 4, 6, 8];

const shippingOptions = [
  {
    id: 'normal-tripoli',
    label: 'عادي - داخل طرابلس',
    duration: '24-96 ساعة',
    priceRange: 'من 35 -45 د.ل',
    speed: 'normal' as ShippingSpeed
  },
  {
    id: 'normal-outside',
    label: 'عادي - خارج طرابلس',
    duration: '24-96 ساعة',
    priceRange: 'من 100-130 د.ل',
    speed: 'normal' as ShippingSpeed
  },
  {
    id: 'express-tripoli',
    label: 'سريع - داخل طرابلس',
    duration: '5-12 ساعة',
    priceRange: 'من 55-85 د.ل',
    speed: 'express' as ShippingSpeed
  },
  {
    id: 'express-outside',
    label: 'سريع - خارج طرابلس',
    duration: '5-12 ساعة',
    priceRange: 'من 120-210 د.ل',
    speed: 'express' as ShippingSpeed
  }
];

const shippingCompanies = [
  'أميال',
  'درب السيل',
  'بريستو',
  'فانكس',
  'زام',
  'أرامكس',
  'بيبو فاست',
  'دي إكسبريس',
  'دي إتش إل',
  'جيدكس',
  'جو ديليفري',
  'هدهد',
  'سكاي إكس',
  'سونيك إكسبريس',
  'إس تي بي إكس',
  'توربو إكس إل جي',
  'وينجسلي'
];

const currencyFormatter = new Intl.NumberFormat('ar-LY', {
  style: 'currency',
  currency: 'LYD',
  maximumFractionDigits: 2
});

const numberFormatter = new Intl.NumberFormat('ar-LY', {
  maximumFractionDigits: 0
});

const formatCurrency = (value: number) => currencyFormatter.format(value || 0);

const formatNumber = (value: number) => numberFormatter.format(value || 0);

const parseOrderDate = (order: OrderRecord) => {
  const source = order.date || order.createdAt || order.created_at;
  if (!source) {
    return new Date();
  }
  const normalized = source.includes('/') ? source.replace(/\//g, '-') : source;
  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }
  if (order.time) {
    const combined = new Date(`${normalized} ${order.time}`);
    if (!Number.isNaN(combined.getTime())) {
      return combined;
    }
  }
  const fallback = new Date(Date.parse(normalized));
  if (!Number.isNaN(fallback.getTime())) {
    return fallback;
  }
  return new Date();
};

const getOrderTotal = (order: OrderRecord) => {
  if (!order) {
    return 0;
  }
  if (typeof order.finalTotal === 'number') {
    return order.finalTotal;
  }
  if (typeof order.totalAmount === 'number') {
    return order.totalAmount;
  }
  if (typeof order.total === 'number') {
    return order.total;
  }
  if (typeof order.subtotal === 'number') {
    return order.subtotal;
  }
  const itemsTotal = order.items?.reduce((sum, item) => {
    const price = item?.price ?? item?.product?.price ?? 0;
    const quantity = item?.quantity ?? 1;
    return sum + price * quantity;
  }, 0);
  return itemsTotal ?? 0;
};

const getStatusDetails = (status?: string) => {
  const value = status ? status.toLowerCase() : '';
  if (value === 'pending') {
    return { label: 'قيد المراجعة', tone: 'text-amber-600 bg-amber-50' };
  }
  if (value === 'confirmed') {
    return { label: 'تم التأكيد', tone: 'text-blue-600 bg-blue-50' };
  }
  if (value === 'processing') {
    return { label: 'قيد التنفيذ', tone: 'text-indigo-600 bg-indigo-50' };
  }
  if (value === 'shipped') {
    return { label: 'تم الشحن', tone: 'text-sky-600 bg-sky-50' };
  }
  if (value === 'delivered' || value === 'completed') {
    return { label: 'تم التسليم', tone: 'text-emerald-600 bg-emerald-50' };
  }
  if (value === 'cancelled') {
    return { label: 'ملغي', tone: 'text-rose-600 bg-rose-50' };
  }
  return { label: 'غير محدد', tone: 'text-gray-600 bg-gray-100' };
};

const resolveMembershipTier = (info: CustomerInfo, totalSpent: number) => {
  if (info.loyaltyTier) {
    return info.loyaltyTier;
  }
  if (totalSpent >= 8000) {
    return 'عضو بلاتيني';
  }
  if (totalSpent >= 4000) {
    return 'عضو ذهبي';
  }
  if (totalSpent >= 2000) {
    return 'عضو فضي';
  }
  return info.membershipType || 'عضو جديد';
};

const computeProfileCompletion = (form: ProfileFormState) => {
  const fields = [
    form.firstName,
    form.lastName,
    form.email,
    form.phone,
    form.birthDate,
    form.city,
    form.area,
    form.address,
    form.bankName,
    form.bankAccount,
    form.bankAccountHolder
  ];
  const filled = fields.filter((value) => Boolean(value && value.trim().length > 0)).length;
  return Math.round((filled / fields.length) * 100);
};

const createNewOrderFormState = (info: CustomerInfo): NewOrderFormState => {
  const name = info.name && info.name.trim().length > 0 ? info.name : `${info.firstName || ''} ${info.lastName || ''}`.trim();
  return {
    orderType: 'normal',
    productId: '',
    quantity: 1,
    fullName: name || 'مستخدم إشرو',
    phone: info.phone || '',
    email: info.email || '',
    cityId: info.city || '',
    areaId: info.area || '',
    address: info.address || '',
    latitude: '',
    longitude: '',
    shippingOptionId: '',
    shippingCompany: '',
    notes: ''
  };
};

const createProfileFormState = (info: CustomerInfo): ProfileFormState => {
  const splitName = info.name ? info.name.split(' ') : [];
  const avatarValue = info.avatar && info.avatar.trim().length > 0 ? info.avatar : undefined;
  return {
    firstName: info.firstName || splitName[0] || '',
    lastName: info.lastName || splitName.slice(1).join(' ') || '',
    email: info.email || '',
    phone: info.phone || '',
    birthDate: info.birthDate || '',
    city: info.city || '',
    area: info.area || '',
    address: info.address || '',
    bankName: info.bankName || '',
    bankAccount: info.bankAccount || '',
    bankAccountHolder: info.bankAccountHolder || '',
    ...(avatarValue ? { avatar: avatarValue } : {})
  };
};

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  customerData,
  favorites = [],
  orders = [],
  unavailableItems = [],
  onBack,
  onLogout,
  onCreateOrder,
  onUpdateProfile,
  onPasswordChange
}) => {
  const customerInfo = useMemo<CustomerInfo>(() => {
    if (!customerData) {
      return { name: 'مستخدم إشرو', membershipType: 'عضو جديد' };
    }
    const baseName = customerData.name && customerData.name.trim().length > 0 ? customerData.name : `${customerData.firstName || ''} ${customerData.lastName || ''}`.trim();
    const name = baseName && baseName.trim().length > 0 ? baseName : 'مستخدم إشرو';
    return { ...customerData, name };
  }, [customerData]);

  const [activeSection, setActiveSection] = useState<SectionId>('dashboard');
  const [newOrderForm, setNewOrderForm] = useState<NewOrderFormState>(() => createNewOrderFormState(customerInfo));
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [profileForm, setProfileForm] = useState<ProfileFormState>(() => createProfileFormState(customerInfo));
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [avatarPreview, setAvatarPreview] = useState<string>(customerInfo.avatar || '');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [activeOrdersView, setActiveOrdersView] = useState<'favorites' | 'unavailable' | 'completed' | 'pending'>('favorites');

  useEffect(() => {
    setNewOrderForm(createNewOrderFormState(customerInfo));
    setProfileForm(createProfileFormState(customerInfo));
    setAvatarPreview(customerInfo.avatar || '');
  }, [customerInfo]);

  const resolvedAvatar = useMemo(() => {
    if (avatarPreview) {
      return avatarPreview;
    }
    if (customerInfo.avatar) {
      return customerInfo.avatar;
    }
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userProfileImage') || '';
    }
    return '';
  }, [avatarPreview, customerInfo.avatar]);

  const availableProducts = useMemo(() => {
    return allStoreProducts.filter((product) => featuredStoreIds.includes(product.storeId) && product.inStock !== false);
  }, []);

  const cityAreas = useMemo(() => {
    if (!newOrderForm.cityId) {
      return libyanAreas;
    }
    return getCityAreas(newOrderForm.cityId);
  }, [newOrderForm.cityId]);

  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter((order) => {
      const status = order.status ? order.status.toLowerCase() : '';
      return status === 'delivered' || status === 'completed';
    }).length;
    const pendingOrders = orders.filter((order) => {
      const status = order.status ? order.status.toLowerCase() : '';
      return status === 'pending' || status === 'processing' || status === 'confirmed';
    }).length;
    const totalSpent = orders.reduce((sum, order) => sum + getOrderTotal(order), 0);
    const monthlyGoal = customerInfo.monthlyGoal ?? 4500;
    const monthlyProgress = monthlyGoal > 0 ? Math.min(100, Math.round((totalSpent / monthlyGoal) * 100)) : 0;
    const loyaltyPoints = customerInfo.loyaltyPoints ?? Math.round(totalSpent * 0.35) + favorites.length * 25;
    const loyaltyGain = Math.max(50, Math.round((totalOrders || 1) * 45 + favorites.length * 8));
    const membershipTier = resolveMembershipTier(customerInfo, totalSpent);
    const joinDate = customerInfo.joinDate ? parseOrderDate({ id: 'join', date: customerInfo.joinDate }) : new Date();
    const monthsActive = Math.max(1, Math.round((Date.now() - joinDate.getTime()) / (30 * 24 * 60 * 60 * 1000)));
    const activeDays = customerInfo.activityDays ?? monthsActive * 7;
    const satisfaction = customerInfo.satisfactionRate ?? Math.min(100, 85 + favorites.length * 0.8);
    const referralsCount = customerInfo.referralsCount ?? 8;
    const referralsJoined = customerInfo.referralsJoined ?? 5;
    const loyaltyLevel = monthlyProgress >= 80 ? 'امتياز' : monthlyProgress >= 60 ? 'متألق' : 'في تقدم';
    const recentOrders = [...orders]
      .sort((a, b) => parseOrderDate(b).getTime() - parseOrderDate(a).getTime())
      .slice(0, 3);
    const newFriends = Math.max(3, Math.round(referralsJoined * 0.6 + favorites.length * 0.4));
    return {
      totalOrders,
      deliveredOrders,
      pendingOrders,
      totalSpent,
      monthlyGoal,
      monthlyProgress,
      loyaltyPoints,
      loyaltyGain,
      membershipTier,
      joinDate,
      activeDays,
      satisfaction,
      referralsCount,
      referralsJoined,
      loyaltyLevel,
      recentOrders,
      favoritesCount: favorites.length,
      unavailableCount: unavailableItems.length,
      wishlistCount: favorites.length,
      newFriends
    };
  }, [orders, favorites, customerInfo, unavailableItems]);

  const sections = [
    {
      id: 'dashboard' as SectionId,
      label: 'لوحة المعلومات',
      description: 'نظرة شاملة على إنجازاتك',
      icon: <Activity className="h-5 w-5" />,
      badge: undefined
    },
    {
      id: 'orders' as SectionId,
      label: 'الطلبات',
      description: 'إدارة الطلبات والمتابعة',
      icon: <Package className="h-5 w-5" />,
      badge: metrics.totalOrders > 0 ? formatNumber(metrics.totalOrders) : undefined
    },
    {
      id: 'subscriptions' as SectionId,
      label: 'الاشتراكات',
      description: 'تابع متاجرك المفضلة',
      icon: <CreditCard className="h-5 w-5" />,
      badge: undefined
    },
    {
      id: 'referrals' as SectionId,
      label: 'الإحالات',
      description: 'شارك عالم إشرو مع أصدقائك',
      icon: <Share2 className="h-5 w-5" />,
      badge: metrics.referralsCount > 0 ? formatNumber(metrics.referralsCount) : undefined
    },
    {
      id: 'downloads' as SectionId,
      label: 'التحميلات',
      description: 'فواتير وتقارير قابلة للتنزيل',
      icon: <DownloadIcon className="h-5 w-5" />,
      badge: metrics.totalOrders > 0 ? formatNumber(metrics.totalOrders) : undefined
    },
    {
      id: 'profile' as SectionId,
      label: 'الملف الشخصي',
      description: 'بياناتك وإعدادات الحساب',
      icon: <UserIcon className="h-5 w-5" />,
      badge: `${computeProfileCompletion(profileForm)}%`
    },
    {
      id: 'support' as SectionId,
      label: 'المساعدة والدعم',
      description: 'تواصل مباشر مع فريق إشرو',
      icon: <Headphones className="h-5 w-5" />,
      badge: undefined
    }
  ];

  const handleOrderFieldChange = (field: keyof NewOrderFormState, value: string | number) => {
    setNewOrderForm((prev) => {
      if (field === 'cityId') {
        return { ...prev, cityId: value as string, areaId: '' };
      }
      if (field === 'quantity') {
        const numeric = Number(value);
        return { ...prev, quantity: Number.isNaN(numeric) || numeric <= 0 ? 1 : numeric };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSubmitNewOrder = async () => {
    setFormStatus({ type: null, message: '' });
    if (!newOrderForm.productId) {
      setFormStatus({ type: 'error', message: 'يرجى اختيار المنتج المطلوب.' });
      return;
    }
    if (!newOrderForm.fullName.trim() || !newOrderForm.phone.trim() || !newOrderForm.cityId || !newOrderForm.areaId || !newOrderForm.address.trim()) {
      setFormStatus({ type: 'error', message: 'يرجى استكمال بيانات الاتصال والعنوان.' });
      return;
    }
    if (!newOrderForm.shippingOptionId || !newOrderForm.shippingCompany) {
      setFormStatus({ type: 'error', message: 'يرجى اختيار طريقة الشحن وشركة التوصيل.' });
      return;
    }
    const product = availableProducts.find((item) => item.id === Number(newOrderForm.productId));
    if (!product) {
      setFormStatus({ type: 'error', message: 'المنتج المحدد غير متاح حالياً.' });
      return;
    }
    const latitudeValue = newOrderForm.latitude && newOrderForm.latitude.trim().length > 0 ? Number(newOrderForm.latitude) : undefined;
    const longitudeValue = newOrderForm.longitude && newOrderForm.longitude.trim().length > 0 ? Number(newOrderForm.longitude) : undefined;
    const notesValue = newOrderForm.notes.trim();
    const payload: CreateOrderPayload = {
      orderType: newOrderForm.orderType,
      productId: product.id,
      quantity: newOrderForm.quantity,
      fullName: newOrderForm.fullName.trim(),
      phone: newOrderForm.phone.trim(),
      email: newOrderForm.email.trim(),
      cityId: newOrderForm.cityId,
      areaId: newOrderForm.areaId,
      address: newOrderForm.address.trim(),
      shippingOptionId: newOrderForm.shippingOptionId,
      shippingCompany: newOrderForm.shippingCompany,
      ...(latitudeValue !== undefined ? { latitude: latitudeValue } : {}),
      ...(longitudeValue !== undefined ? { longitude: longitudeValue } : {}),
      ...(notesValue.length > 0 ? { notes: notesValue } : {})
    };
    setIsSubmittingOrder(true);
    try {
      await Promise.resolve(onCreateOrder ? onCreateOrder(payload) : undefined);
      setFormStatus({ type: 'success', message: 'تم إرسال الطلب للتاجر بنجاح! ستصلك تحديثات فور الرد.' });
      setNewOrderForm(createNewOrderFormState(customerInfo));
    } catch (error) {
      setFormStatus({ type: 'error', message: 'تعذر إرسال الطلب حالياً. يرجى المحاولة مرة أخرى.' });
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setAvatarPreview(result);
      setProfileForm((prev) => ({ ...prev, avatar: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async () => {
    setIsSavingProfile(true);
    try {
      const avatarValue = profileForm.avatar && profileForm.avatar.trim().length > 0 ? profileForm.avatar : avatarPreview;
      const updated: CustomerInfo = {
        ...customerInfo,
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        birthDate: profileForm.birthDate,
        city: profileForm.city,
        area: profileForm.area,
        address: profileForm.address.trim(),
        bankName: profileForm.bankName,
        bankAccount: profileForm.bankAccount.trim(),
        bankAccountHolder: profileForm.bankAccountHolder.trim(),
        ...(avatarValue ? { avatar: avatarValue } : {})
      };
      onUpdateProfile?.(updated);
      setIsSavingProfile(false);
    } catch (error) {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return;
    }
    setIsSavingPassword(true);
    try {
      await Promise.resolve(onPasswordChange ? onPasswordChange({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }) : undefined);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setIsSavingPassword(false);
      return;
    }
    setIsSavingPassword(false);
  };

  const handleCopyReferral = () => {
    const base = customerInfo.email ? customerInfo.email.split('@')[0] : 'eshro-user';
    const referralLink = `https://eshro.ly/invite/${base}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(referralLink).catch(() => undefined);
    }
  };

  const handleDownloadInvoice = (order: OrderRecord) => {
    const payload = {
      id: order.id,
      date: order.date || new Date().toISOString(),
      status: getStatusDetails(order.status).label,
      total: getOrderTotal(order),
      items: order.items?.map((item) => ({
        name: item?.name || item?.product?.name || 'منتج',
        quantity: item?.quantity ?? 1,
        price: item?.price ?? item?.product?.price ?? 0
      })) || []
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eshro-order-${order.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSupportRedirect = (url: string) => {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const renderDashboardSection = () => (
    <div className="space-y-6">
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary via-purple-500 to-pink-500 text-white">
        <CardContent className="relative z-10 flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 text-sm text-white/80">
              <Sparkles className="h-5 w-5" />
              <span>أهلاً وسهلاً بك يا {customerInfo.name?.split(' ')[0] || 'صديقنا'} 🎉✨</span>
            </div>
            <h1 className="mt-4 text-3xl font-extrabold">مرحباً بك في عالم إشرو السحري - منصة التجارة الإلكترونية الأولى في ليبيا 🚀</h1>
            <p className="mt-3 text-white/80">🏆 {metrics.membershipTier} ⭐ نقاط الولاء: {formatNumber(metrics.loyaltyPoints)}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm">هدفك الشهري {metrics.monthlyProgress}% مكتمل - استمر! 💪</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm">مستواك الحالي {metrics.membershipTier} 👑</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm">🏆 إنجازات رائعة!</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-white/15 p-6 backdrop-blur">
            {resolvedAvatar ? (
              <img src={getProxyImageUrl(resolvedAvatar, undefined, 'logo')} alt="صورة المستخدم" className="h-20 w-20 rounded-full border-2 border-white object-cover shadow-lg" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-3xl font-bold text-white">
                {customerInfo.name?.charAt(0) || 'ن'}
              </div>
            )}
            <div className="text-sm text-white/70">عضو منذ</div>
            <div className="text-2xl font-bold">{metrics.joinDate.toLocaleDateString('ar-LY', { month: 'long', year: 'numeric' })}</div>
            <div className="text-sm text-white/70">⏰ {formatNumber(Math.max(1, Math.round((Date.now() - metrics.joinDate.getTime()) / (30 * 24 * 60 * 60 * 1000))))} أشهر من المتعة</div>
            <Button variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20" onClick={() => setActiveSection('orders')}>عرض الطلبات</Button>
          </div>
        </CardContent>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_55%)]" />
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card
          onClick={() => {
            setActiveSection('orders');
            setActiveOrdersView('completed');
          }}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setActiveSection('orders');
              setActiveOrdersView('completed');
            }
          }}
          className="border-transparent bg-gradient-to-br from-white to-primary/5 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 cursor-pointer"
        >
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي الطلبات</p>
                <h3 className="mt-2 text-3xl font-black text-primary">{formatNumber(metrics.totalOrders)}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <Package className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-primary">
              <ArrowUpBadge />
              <span>+{formatNumber(metrics.deliveredOrders)} هذا الشهر</span>
            </div>
          </CardContent>
        </Card>
        <Card
          onClick={() => {
            setActiveSection('orders');
            setActiveOrdersView('favorites');
          }}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setActiveSection('orders');
              setActiveOrdersView('favorites');
            }
          }}
          className="border-transparent bg-gradient-to-br from-white to-emerald-50 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 cursor-pointer"
        >
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي المبلغ</p>
                <h3 className="mt-2 text-3xl font-black text-emerald-600">{formatCurrency(metrics.totalSpent)}</h3>
              </div>
              <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <ArrowUpBadge />
              <span>+23% من الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>
        <Card
          onClick={() => {
            setActiveSection('orders');
            setActiveOrdersView('pending');
          }}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setActiveSection('orders');
              setActiveOrdersView('pending');
            }
          }}
          className="border-transparent bg-gradient-to-br from-white to-amber-50 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 cursor-pointer"
        >
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">النقاط المكتسبة</p>
                <h3 className="mt-2 text-3xl font-black text-amber-600">{formatNumber(metrics.loyaltyPoints)}</h3>
              </div>
              <div className="rounded-full bg-amber-100 p-3 text-amber-500">
                <Trophy className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <Star className="h-4 w-4" />
              <span>+{formatNumber(metrics.loyaltyGain)} نقطة جديدة</span>
            </div>
          </CardContent>
        </Card>
        <Card
          onClick={() => {
            setActiveSection('orders');
            setActiveOrdersView('unavailable');
          }}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setActiveSection('orders');
              setActiveOrdersView('unavailable');
            }
          }}
          className="border-transparent bg-gradient-to-br from-white to-pink-50 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 cursor-pointer"
        >
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">أصدقاء التقييم</p>
                <h3 className="mt-2 text-3xl font-black text-pink-600">{formatNumber(metrics.newFriends)}</h3>
              </div>
              <div className="rounded-full bg-pink-100 p-3 text-pink-500">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-pink-600">
              <ArrowUpBadge />
              <span>+3 أصدقاء جدد</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>الطلبات الأخيرة</span>
              <Button variant="ghost" size="sm" onClick={() => setActiveSection('orders')}>عرض جميع الطلبات</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.recentOrders.length === 0 && <div className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">لا توجد طلبات حديثة حتى الآن.</div>}
            {metrics.recentOrders.map((order, index) => {
              const statusDetails = getStatusDetails(order.status);
              return (
                <div key={order.id} className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between md:gap-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">{index + 1}</div>
                    <div>
                      <p className="text-sm text-gray-500">طلب #{order.id}</p>
                      <p className="text-base font-semibold text-gray-800">{order.items?.[0]?.name || order.items?.[0]?.product?.name || 'منتج من متاجر إشرو'}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(getOrderTotal(order))}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <span className={`rounded-full px-3 py-1 text-sm ${statusDetails.tone}`}>{statusDetails.label}</span>
                    <span className="text-sm text-gray-500">{parseOrderDate(order).toLocaleDateString('ar-LY', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>نشاط الحساب</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>مستوى النشاط</span>
                <span>{metrics.loyaltyLevel}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${metrics.monthlyProgress}%` }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>إكمال الملف الشخصي</span>
                <span>{computeProfileCompletion(profileForm)}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${computeProfileCompletion(profileForm)}%` }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>مستوى الولاء</span>
                <span>{formatNumber(metrics.loyaltyPoints)}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-amber-500" style={{ width: `${Math.min(100, metrics.loyaltyPoints / 1200 * 100)}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">أيام نشطة</p>
                <p className="mt-2 text-2xl font-bold text-gray-800">{formatNumber(metrics.activeDays)}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">معدل الرضا</p>
                <p className="mt-2 text-2xl font-bold text-gray-800">{Math.min(100, Math.round(metrics.satisfaction))}%</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">الطلبات المعلقة</p>
                <p className="mt-2 text-2xl font-bold text-gray-800">{formatNumber(metrics.pendingOrders)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderOrderSection = () => {
    const completedOrders = orders.filter((order) => {
      const status = order.status ? order.status.toLowerCase() : '';
      return status === 'delivered' || status === 'completed';
    });
    const pendingOrdersList = orders.filter((order) => {
      const status = order.status ? order.status.toLowerCase() : '';
      return status === 'pending' || status === 'processing' || status === 'confirmed';
    });
    const overviewTitle: Record<typeof activeOrdersView, string> = {
      favorites: 'المنتجات في قائمة المفضلة',
      unavailable: 'طلبات التنبيه عند التوفر',
      completed: 'المشتريات المكتملة',
      pending: 'طلبات قيد المتابعة'
    };
    const overviewDescription: Record<typeof activeOrdersView, string> = {
      favorites: 'كل المنتجات التي أضفتها للمفضلة تظهر هنا لسهولة الوصول إليها.',
      unavailable: 'طلبات التنبيه يتم تحديثها فور توفر المنتجات من متاجرك المفضلة.',
      completed: 'كل عمليات الشراء الناجحة مع تفاصيل المنتجات والتكلفة الكلية.',
      pending: 'الطلبات التي ما زالت قيد المعالجة أو بانتظار تأكيد التاجر.'
    };
    const renderOverviewContent = () => {
      if (activeOrdersView === 'favorites') {
        if (favorites.length === 0) {
          return <div className="rounded-xl bg-gray-50 p-6 text-center text-gray-500">لا توجد منتجات مضافة للمفضلة حالياً.</div>;
        }
        return (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {favorites.map((product) => {
              const image = resolveProductImage(product);
              return (
                <div key={product.id || product.name} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white/70 p-4 shadow-sm">
                  <div className="h-16 w-16 overflow-hidden rounded-xl bg-gray-100">
                    {image ? (
                      <img src={getProxyImageUrl(image)} alt={product.name || 'منتج'} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">بدون صورة</div>
                    )}
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-sm font-semibold text-gray-900">{product.name || product.product?.name || 'منتج من متاجر إشرو'}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(product.price ?? product.product?.price ?? 0)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        );
      }
      if (activeOrdersView === 'unavailable') {
        if (unavailableItems.length === 0) {
          return <div className="rounded-xl bg-gray-50 p-6 text-center text-gray-500">لا توجد طلبات تنبيه حالياً.</div>;
        }
        return (
          <div className="space-y-3">
            {unavailableItems.map((item, index) => {
              const image = resolveProductImage(item);
              return (
                <div key={item.id || `${item.name}-${index}`} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white/70 p-4 shadow-sm">
                  <div className="h-16 w-16 overflow-hidden rounded-xl bg-gray-100">
                    {image ? <img src={getProxyImageUrl(image)} alt={item.name || 'منتج غير متوفر'} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">قريباً</div>}
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-sm font-semibold text-gray-900">{item.name || item.product?.name || 'منتج غير متوفر'}</p>
                    <p className="text-xs text-gray-500">تم طلب التنبيه في {item.requestedAt ? new Date(item.requestedAt).toLocaleDateString('ar-LY') : 'تاريخ غير محدد'}</p>
                    {item.notificationData?.note && <p className="text-xs text-gray-500">ملاحظة: {item.notificationData.note}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }
      if (activeOrdersView === 'completed') {
        if (completedOrders.length === 0) {
          return <div className="rounded-xl bg-gray-50 p-6 text-center text-gray-500">لا توجد مشتريات مكتملة بعد.</div>;
        }
        return (
          <div className="space-y-3">
            {completedOrders.map((order) => {
              const firstItem = order.items?.[0];
              const image = resolveProductImage(firstItem?.product || firstItem);
              return (
                <div key={order.id} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white/70 p-4 shadow-sm">
                  <div className="h-16 w-16 overflow-hidden rounded-xl bg-gray-100">
                    {image ? <img src={getProxyImageUrl(image)} alt={firstItem?.name || 'منتج'} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">منتج</div>}
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-sm font-semibold text-gray-900">طلب #{order.id}</p>
                    <p className="text-xs text-gray-500">{firstItem?.name || firstItem?.product?.name || 'منتج من متاجر إشرو'}</p>
                    <p className="text-xs text-gray-500">التكلفة الإجمالية: {formatCurrency(getOrderTotal(order))}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">مكتمل</span>
                </div>
              );
            })}
          </div>
        );
      }
      if (pendingOrdersList.length === 0) {
        return <div className="rounded-xl bg-gray-50 p-6 text-center text-gray-500">لا توجد طلبات قيد المتابعة حالياً.</div>;
      }
      return (
        <div className="space-y-3">
          {pendingOrdersList.map((order) => {
            const firstItem = order.items?.[0];
            const image = resolveProductImage(firstItem?.product || firstItem);
            const status = getStatusDetails(order.status);
            return (
              <div key={order.id} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white/70 p-4 shadow-sm">
                <div className="h-16 w-16 overflow-hidden rounded-xl bg-gray-100">
                  {image ? <img src={getProxyImageUrl(image)} alt={firstItem?.name || 'منتج'} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">منتج</div>}
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm font-semibold text-gray-900">طلب #{order.id}</p>
                  <p className="text-xs text-gray-500">{firstItem?.name || firstItem?.product?.name || 'منتج من متاجر إشرو'}</p>
                  <p className="text-xs text-gray-500">تاريخ الطلب: {parseOrderDate(order).toLocaleDateString('ar-LY')}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.tone}`}>{status.label}</span>
              </div>
            );
          })}
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoStatCard
            title="طلبات المفضلة"
            value={metrics.favoritesCount}
            subtitle="منتجات في قائمة المفضلة"
            tone="primary"
            onClick={() => setActiveOrdersView('favorites')}
            isActive={activeOrdersView === 'favorites'}
          />
          <InfoStatCard
            title="طلبات غير متوفرة"
            value={metrics.unavailableCount}
            subtitle="طلبات نبهني عند التوفر"
            tone="rose"
            onClick={() => setActiveOrdersView('unavailable')}
            isActive={activeOrdersView === 'unavailable'}
          />
          <InfoStatCard
            title="المشتريات"
            value={metrics.totalOrders}
            subtitle="عملية شراء مكتملة"
            tone="emerald"
            onClick={() => setActiveOrdersView('completed')}
            isActive={activeOrdersView === 'completed'}
          />
          <InfoStatCard
            title="طلبات قيد المتابعة"
            value={metrics.pendingOrders}
            subtitle="بانتظار الإجراء"
            tone="amber"
            onClick={() => setActiveOrdersView('pending')}
            isActive={activeOrdersView === 'pending'}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{overviewTitle[activeOrdersView]}</CardTitle>
            <p className="text-sm text-gray-500">{overviewDescription[activeOrdersView]}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderOverviewContent()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <span>طلب جديد</span>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary"><Check className="h-4 w-4" /> إيصال الطلب للتاجر آلياً</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-emerald-600"><Clock className="h-4 w-4" /> استجابة خلال دقائق</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-4">
              <div className="col-span-4 flex flex-wrap items-center gap-3 rounded-2xl bg-gray-50 p-4">
                <Button variant={newOrderForm.orderType === 'normal' ? 'default' : 'outline'} className="px-6" onClick={() => handleOrderFieldChange('orderType', 'normal')}>عادي</Button>
                <Button variant={newOrderForm.orderType === 'urgent' ? 'default' : 'outline'} className="px-6" onClick={() => handleOrderFieldChange('orderType', 'urgent')}>عاجل</Button>
                <span className="text-sm text-gray-600">اختر نوع الطلب لتحديد خيارات الشحن المناسبة</span>
              </div>
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">نوع المنتج</label>
                <Select value={newOrderForm.productId} onValueChange={(value) => handleOrderFieldChange('productId', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر المنتج" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>{`${product.name} • متجر ${product.storeId}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">الكمية</label>
                <Input type="number" min={1} value={newOrderForm.quantity} onChange={(event) => handleOrderFieldChange('quantity', event.target.value)} className="text-right" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">الاسم بالكامل</label>
                <Input value={newOrderForm.fullName} onChange={(event) => handleOrderFieldChange('fullName', event.target.value)} className="text-right" placeholder="محمد أحمد" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">رقم الموبايل</label>
                <Input value={newOrderForm.phone} onChange={(event) => handleOrderFieldChange('phone', event.target.value)} className="text-right" placeholder="09XXXXXXXX" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                <Input value={newOrderForm.email} onChange={(event) => handleOrderFieldChange('email', event.target.value)} className="text-right" placeholder="user@eshro.ly" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">المدينة</label>
                <Select value={newOrderForm.cityId} onValueChange={(value) => handleOrderFieldChange('cityId', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر المدينة" />
                  </SelectTrigger>
                  <SelectContent>
                    {libyanCities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">المنطقة</label>
                <Select value={newOrderForm.areaId} onValueChange={(value) => handleOrderFieldChange('areaId', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر المنطقة" />
                  </SelectTrigger>
                  <SelectContent>
                    {cityAreas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">العنوان التفصيلي</label>
                <Input value={newOrderForm.address} onChange={(event) => handleOrderFieldChange('address', event.target.value)} className="text-right" placeholder="المدينة، المنطقة، وصف دقيق للموقع" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">إحداثيات الموقع (خط العرض)</label>
                <Input value={newOrderForm.latitude} onChange={(event) => handleOrderFieldChange('latitude', event.target.value)} className="text-right" placeholder="32.123456" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">إحداثيات الموقع (خط الطول)</label>
                <Input value={newOrderForm.longitude} onChange={(event) => handleOrderFieldChange('longitude', event.target.value)} className="text-right" placeholder="13.123456" />
              </div>
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">طريقة الشحن والتوصيل</label>
                <div className="grid gap-3 md:grid-cols-2">
                  {shippingOptions
                    .filter((option) => (newOrderForm.orderType === 'urgent' ? option.speed === 'express' || option.speed === 'normal' : option.speed === 'normal'))
                    .map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleOrderFieldChange('shippingOptionId', option.id)}
                        className={`flex flex-col gap-2 rounded-xl border p-4 text-right transition ${
                          newOrderForm.shippingOptionId === option.id ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-primary/40'
                        }`}
                      >
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{option.duration}</span>
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">{option.speed === 'express' ? '⚡ سريع' : '📦 عادي'}</span>
                        </div>
                        <div className="text-base font-semibold text-gray-800">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.priceRange}</div>
                      </button>
                    ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">شركة الشحن</label>
                <Select value={newOrderForm.shippingCompany} onValueChange={(value) => handleOrderFieldChange('shippingCompany', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر شركة الشحن" />
                  </SelectTrigger>
                  <SelectContent>
                    {shippingCompanies.map((company) => (
                      <SelectItem key={company} value={company}>{company}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">ملاحظات إضافية</label>
                <Textarea value={newOrderForm.notes} onChange={(event) => handleOrderFieldChange('notes', event.target.value)} rows={4} placeholder="أي تفاصيل إضافية تساعد التاجر على تلبية طلبك" />
              </div>
            </div>
            {formStatus.message && (
              <div className={`rounded-xl px-4 py-3 text-sm ${formStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>
                {formStatus.message}
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSubmitNewOrder} disabled={isSubmittingOrder} className="min-w-[160px]">
                {isSubmittingOrder ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </Button>
              <Button variant="outline" onClick={() => setNewOrderForm(createNewOrderFormState(customerInfo))} className="min-w-[160px]">إلغاء</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>قائمة الطلبات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orders.length === 0 && <div className="rounded-xl bg-gray-50 p-6 text-center text-gray-500">لم تقم بإنشاء طلبات بعد. ابدأ رحلتك الآن!</div>}
            {orders.map((order) => {
              const status = getStatusDetails(order.status);
              return (
                <div key={order.id} className="grid gap-4 rounded-2xl border p-4 md:grid-cols-4">
                  <div>
                    <p className="text-sm text-gray-500">الطلب</p>
                    <p className="mt-1 text-base font-semibold text-gray-900">#{order.id}</p>
                    <p className="text-sm text-gray-500">{parseOrderDate(order).toLocaleDateString('ar-LY')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">المنتج</p>
                    <p className="mt-1 text-base font-semibold text-gray-900">{order.items?.[0]?.name || order.items?.[0]?.product?.name || 'منتج متنوع'}</p>
                    <p className="text-sm text-gray-500">الكمية {order.items?.[0]?.quantity ?? 1}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">إجمالي المبلغ</p>
                    <p className="mt-1 text-base font-semibold text-gray-900">{formatCurrency(getOrderTotal(order))}</p>
                  </div>
                  <div className="flex flex-col justify-between gap-3">
                    <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-medium ${status.tone}`}>{status.label}</span>
                    <Button variant="outline" onClick={() => handleDownloadInvoice(order)}>تحميل الفاتورة</Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSubscriptionsSection = () => {
    const platforms = [
      { name: 'فيس بوك', description: 'تابع آخر العروض من متاجرك المفضلة', color: 'from-blue-500 to-indigo-500', url: 'https://www.facebook.com/eshro.ly' },
      { name: 'واتساب', description: 'استقبل التنبيهات الفورية عبر الواتساب', color: 'from-emerald-500 to-green-500', url: 'https://wa.me/218944062927' },
      { name: 'تويتر', description: 'تابع أخبار إشرو السريعة', color: 'from-sky-500 to-blue-500', url: 'https://twitter.com' },
      { name: 'سناب شات', description: 'لقطات حية للمنتجات الجديدة', color: 'from-yellow-400 to-orange-500', url: 'https://www.snapchat.com' },
      { name: 'تيك توك', description: 'فيديوهات ممتعة لعروض لا تفوت', color: 'from-pink-500 to-purple-600', url: 'https://www.tiktok.com' }
    ];
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>اشترك في تحديثات المتاجر</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {platforms.map((platform) => (
              <div key={platform.name} className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${platform.color} text-white shadow-lg`}>
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative flex flex-col gap-3 p-6">
                  <span className="text-sm text-white/70">قنوات رسمية لإشرو</span>
                  <h3 className="text-2xl font-bold">{platform.name}</h3>
                  <p className="text-sm text-white/85">{platform.description}</p>
                  <Button variant="outline" className="w-fit border-white/60 bg-white/10 text-white hover:bg-white/20" onClick={() => handleSupportRedirect(platform.url)}>اشترك الآن</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderReferralsSection = () => (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary to-purple-600 text-white">
          <CardTitle className="flex flex-col gap-2">
            <span>برنامج الإحالات</span>
            <span className="text-sm text-white/80">ادع أصدقاءك واكسب مكافآت ذهبية</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="rounded-2xl bg-primary/5 p-6 text-right">
            <p className="text-lg font-semibold text-primary">رابط الإحالة الخاص بك:</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-primary/20 bg-white px-4 py-2 text-sm text-gray-700">
                https://eshro.ly/invite/{customerInfo.email ? customerInfo.email.split('@')[0] : 'eshro-user'}
              </div>
              <Button onClick={handleCopyReferral} className="flex items-center gap-2">
                <UploadCloud className="h-4 w-4" />
                نسخ الرابط
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <InfoStatCard title="أصدقاء مدعوين" value={metrics.referralsCount} subtitle="شاركوا رابطك" tone="primary" />
            <InfoStatCard title="انضموا بالفعل" value={metrics.referralsJoined} subtitle="يشترون من إشرو الآن" tone="emerald" />
            <InfoStatCard title="نقاط مكافآت" value={Math.max(750, metrics.referralsJoined * 120)} subtitle="مكافآت قابلة للاستخدام" tone="amber" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDownloadsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle>سجل التحميلات والفواتير</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {orders.length === 0 && <div className="rounded-xl bg-gray-50 p-6 text-center text-gray-500">لا توجد فواتير متاحة للتنزيل حالياً.</div>}
        {orders.map((order) => (
          <div key={order.id} className="flex flex-col gap-4 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-gray-500">طلب #{order.id}</p>
              <p className="text-base font-semibold text-gray-900">{formatCurrency(getOrderTotal(order))}</p>
              <p className="text-sm text-gray-500">{parseOrderDate(order).toLocaleDateString('ar-LY')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={() => handleDownloadInvoice(order)} className="flex items-center gap-2">
                <DownloadIcon className="h-4 w-4" />
                تنزيل الفاتورة
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderProfileSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>الملف الشخصي</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-3xl text-primary">
              {avatarPreview ? <img src={getProxyImageUrl(avatarPreview, undefined, 'logo')} alt="صورة المستخدم" className="h-full w-full object-cover" /> : customerInfo.name?.charAt(0) || 'ن'}
            </div>
            <div className="space-y-2">
              <p className="text-lg font-bold text-gray-900">{customerInfo.name}</p>
              <p className="text-sm text-gray-500">{customerInfo.membershipType || 'حساب عميل'}</p>
              <div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary px-4 py-2 text-sm text-primary hover:bg-primary/5">
                  <UploadCloud className="h-4 w-4" />
                  تغيير الصورة الشخصية
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ProfileField label="الاسم الأول" value={profileForm.firstName} onChange={(event) => setProfileForm((prev) => ({ ...prev, firstName: event.target.value }))} />
            <ProfileField label="الاسم الأخير" value={profileForm.lastName} onChange={(event) => setProfileForm((prev) => ({ ...prev, lastName: event.target.value }))} />
            <ProfileField label="البريد الإلكتروني" value={profileForm.email} onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))} />
            <ProfileField label="رقم الموبايل" value={profileForm.phone} onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))} />
            <ProfileField label="تاريخ الميلاد" type="date" value={profileForm.birthDate} onChange={(event) => setProfileForm((prev) => ({ ...prev, birthDate: event.target.value }))} />
            <ProfileField label="المدينة" value={profileForm.city} onChange={(event) => setProfileForm((prev) => ({ ...prev, city: event.target.value }))} />
            <ProfileField label="المنطقة" value={profileForm.area} onChange={(event) => setProfileForm((prev) => ({ ...prev, area: event.target.value }))} />
            <ProfileField label="العنوان التفصيلي" value={profileForm.address} onChange={(event) => setProfileForm((prev) => ({ ...prev, address: event.target.value }))} />
            <ProfileField label="اختر المصرف التجاري" value={profileForm.bankName} onChange={(event) => setProfileForm((prev) => ({ ...prev, bankName: event.target.value }))} />
            <ProfileField label="رقم الحساب المصرفي" value={profileForm.bankAccount} onChange={(event) => setProfileForm((prev) => ({ ...prev, bankAccount: event.target.value }))} />
            <ProfileField label="اسم صاحب الحساب" value={profileForm.bankAccountHolder} onChange={(event) => setProfileForm((prev) => ({ ...prev, bankAccountHolder: event.target.value }))} />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleProfileSave} disabled={isSavingProfile}>
              {isSavingProfile ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
            <Button variant="outline" onClick={() => setProfileForm(createProfileFormState(customerInfo))}>إلغاء</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>تغيير كلمة المرور</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <ProfileField label="كلمة المرور الحالية" type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))} />
          <ProfileField label="كلمة المرور الجديدة" type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))} />
          <ProfileField label="إعادة تعيين كلمة المرور" type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))} />
          <div className="col-span-3 flex flex-wrap gap-3">
            <Button onClick={handlePasswordSave} disabled={isSavingPassword}>
              {isSavingPassword ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
            <Button variant="outline" onClick={() => setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })}>إلغاء</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSupportSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>المساعدة والدعم</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <SupportCard
              icon={<MessageCircle className="h-8 w-8 text-primary" />}
              title="الشات بوت"
              description="احصل على إجابات فورية على استفساراتك"
              actions={<Button onClick={() => handleSupportRedirect('https://wa.me/218944062927')} className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> بدء محادثة فورية</Button>}
            />
            <SupportCard
              icon={<Headphones className="h-8 w-8 text-emerald-600" />}
              title="واتساب الدعم الفني"
              description="تحدث مع فريق الدعم مباشرة عبر واتساب"
              actions={<Button onClick={() => handleSupportRedirect('https://wa.me/218944062927')} className="flex items-center gap-2"><Phone className="h-4 w-4" /> فتح واتساب</Button>}
            />
          </div>
          <div className="rounded-2xl border p-6">
            <h3 className="text-lg font-semibold text-gray-900">الأسئلة الشائعة</h3>
            <div className="mt-4 space-y-4 text-sm text-gray-600">
              <FaqItem question="كيف يمكنني المشاركة معكم؟" answer="عبر التسجيل المباشر على منصة إشرو كعميل أو تاجر، واتباع خطوات التسجيل البسيطة." />
              <FaqItem question="ما هي طرق الدفع المتاحة؟" answer="نوفر جميع طرق الدفع المحلية والإلكترونية مثل البطاقات المصرفية، المحافظ الإلكترونية، والدفع عند الاستلام." />
              <FaqItem question="كم تستغرق عملية التوصيل؟" answer="التوصيل العادي: 24-96 ساعة، التوصيل السريع: 5-12 ساعة. يختلف حسب المنطقة." />
              <FaqItem question="هل يمكنني إرجاع المنتجات؟" answer="نعم، يمكن إرجاع المنتجات خلال 7 أيام من تاريخ الاستلام بشرط عدم الاستخدام." />
              <FaqItem question="كيف أتتبع طلبي؟" answer="يمكنك تتبع طلبك من لوحة التحكم > الطلبات، أو عبر الرسائل النصية التي نرسلها لك." />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <SupportInfo icon={<Mail className="h-6 w-6 text-primary" />} label="البريد الإلكتروني" value="support@eshro.ly" onClick={() => handleSupportRedirect('mailto:support@eshro.ly')} />
            <SupportInfo icon={<Phone className="h-6 w-6 text-emerald-600" />} label="رقم الهاتف" value="+218944062927" onClick={() => handleSupportRedirect('tel:+218944062927')} />
            <SupportInfo icon={<Clock className="h-6 w-6 text-amber-500" />} label="ساعات العمل" value="الأحد - الخميس، من 9:00 صباحاً - 6:00 مساءً" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderActiveSection = () => {
    if (activeSection === 'dashboard') {
      return renderDashboardSection();
    }
    if (activeSection === 'orders') {
      return renderOrderSection();
    }
    if (activeSection === 'subscriptions') {
      return renderSubscriptionsSection();
    }
    if (activeSection === 'referrals') {
      return renderReferralsSection();
    }
    if (activeSection === 'downloads') {
      return renderDownloadsSection();
    }
    if (activeSection === 'profile') {
      return renderProfileSection();
    }
    if (activeSection === 'support') {
      return renderSupportSection();
    }
    return renderDashboardSection();
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/60 to-purple-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_55%)]" />
      <div className="relative z-10 mx-auto flex w-full flex-col gap-6 px-6 py-10 lg:flex-row xl:px-12">
        <aside className="w-full rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl backdrop-blur lg:w-72">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {resolvedAvatar ? (
                <img src={getProxyImageUrl(resolvedAvatar, undefined, 'logo')} alt="صورة المستخدم" className="h-12 w-12 rounded-full border border-white/60 object-cover shadow" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                  {customerInfo.name?.charAt(0) || 'ن'}
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">مرحباً</p>
                <p className="text-lg font-bold text-gray-900">{customerInfo.name}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onBack} className="flex items-center gap-2">
              العودة
            </Button>
          </div>
          <div className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full rounded-xl border px-4 py-3 text-right transition ${
                  activeSection === section.id ? 'border-primary bg-primary/10 text-primary shadow-sm' : 'border-transparent hover:border-primary/30 hover:bg-primary/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${activeSection === section.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>{section.icon}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{section.label}</span>
                      <span className="text-xs text-gray-500">{section.description}</span>
                    </div>
                  </div>
                  {section.badge && <span className="rounded-full bg-white px-3 py-1 text-xs text-primary">{section.badge}</span>}
                </div>
              </button>
            ))}
          </div>
          <div className="mt-6 border-t pt-6">
            <Button variant="outline" className="w-full" onClick={onLogout}>
              <LogOut className="ml-2 h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>
        </aside>
        <main className="flex-1 space-y-6">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
};

const ArrowUpBadge = () => (
  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-primary shadow">↑</span>
);

const resolveProductImage = (item: any): string | undefined => {
  if (!item) {
    return undefined;
  }
  if (typeof item === 'string') {
    return item;
  }
  if (item.image) {
    return item.image;
  }
  if (item.thumbnail) {
    return item.thumbnail;
  }
  if (Array.isArray(item.images) && item.images.length > 0) {
    return item.images[0];
  }
  if (item.cover) {
    return item.cover;
  }
  if (item.product?.image) {
    return item.product.image;
  }
  if (Array.isArray(item.product?.images) && item.product.images.length > 0) {
    return item.product.images[0];
  }
  return undefined;
};

const InfoStatCard = ({ title, value, subtitle, tone, onClick, isActive }: { title: string; value: number; subtitle: string; tone: 'primary' | 'emerald' | 'amber' | 'rose'; onClick?: () => void; isActive?: boolean }) => {
  const palette: Record<'primary' | 'emerald' | 'amber' | 'rose', { bg: string; text: string }> = {
    primary: { bg: 'bg-primary/10', text: 'text-primary' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
    rose: { bg: 'bg-rose-100', text: 'text-rose-600' }
  };
  const colors = palette[tone];
  const interactive = typeof onClick === 'function';
  return (
    <Card
      onClick={onClick}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={(event) => {
        if (!interactive) {
          return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.();
        }
      }}
      className={`border-transparent bg-white/80 text-right shadow transition ${interactive ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60' : ''} ${isActive ? 'ring-2 ring-primary/60 ring-offset-2 ring-offset-white' : ''}`}
    >
      <CardContent className="space-y-2 p-6">
        <p className="text-sm text-gray-500">{title}</p>
        <p className={`text-3xl font-bold ${colors.text}`}>{formatNumber(value)}</p>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs ${colors.bg} ${colors.text}`}>{subtitle}</span>
      </CardContent>
    </Card>
  );
};

const ProfileField = ({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; type?: string }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <Input value={value} onChange={onChange} type={type} className="text-right" />
  </div>
);

const SupportCard = ({ icon, title, description, actions }: { icon: React.ReactNode; title: string; description: string; actions: React.ReactNode }) => (
  <div className="rounded-2xl border p-6">
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
    {actions}
  </div>
);

const SupportInfo = ({ icon, label, value, onClick }: { icon: React.ReactNode; label: string; value: string; onClick?: () => void }) => (
  <button type="button" onClick={onClick} className="flex w-full items-center gap-4 rounded-2xl border p-4 text-right transition hover:border-primary/40 hover:bg-primary/5">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">{icon}</div>
    <div className="flex flex-col">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  </button>
);

const FaqItem = ({ question, answer }: { question: string; answer: string }) => (
  <div className="rounded-xl border border-gray-200 p-4">
    <h4 className="text-sm font-semibold text-gray-900">{question}</h4>
    <p className="mt-2 text-sm text-gray-600">{answer}</p>
  </div>
);

export default CustomerDashboard;
