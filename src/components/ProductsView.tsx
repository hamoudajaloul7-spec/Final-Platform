import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Archive,
  Barcode,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Copy,
  DollarSign,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Gift,
  Hash,
  Image as ImageIcon,
  Layers,
  Minus,
  MoreVertical,
  Package,
  Percent,
  RefreshCw,
  Plus,
  Plus as PlusIcon,
  Save,
  Search,
  Settings,
  ShoppingBag,
  Star,
  Tag as TagIcon,
  ToggleLeft,
  ToggleRight,
  Trash2,
  TrendingDown,
  TrendingUp,
  Truck,
  User,
  X,
  Zap,
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
import { libyanCities } from '@/data/libya/cities/cities';
import { getApiUrl } from '@/utils/apiConfig';

const API_BASE_URL = getApiUrl();

interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  sku: string;
  barcode?: string;
  price: number;
  discountPercentage: number;
  isActive: boolean;
  isSimilarProductsEnabled: boolean;
  type: 'individual' | 'grouped' | 'digital' | 'subscription';
  category: string;
  brand?: string;
  description?: string;
  images: string[];
  inventory: WarehouseInventory[];
  totalQuantity: number;
  unlimitedQuantity: boolean;
  tags: string[];
  isFreeShipping: boolean;
  isDiscounted: boolean;
  isFeatured: boolean;
  isLimitedQuantity: boolean;
  isFastSelling: boolean;
  isPaidShipping: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

interface WarehouseInventory {
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

interface ProductsViewProps {
  storeData: any;
  setStoreData: (data: any) => void;
  onSave: () => void;
}

const normalizeProductRecord = (record: any, index: number): Product => {
  const resolvedQuantity = Number(record.quantity ?? record.stock ?? 0) || 0;
  const baseName = String(record.name ?? `منتج ${index + 1}`);
  const normalizedImages = Array.isArray(record.images) && record.images.length > 0
    ? record.images
    : record.image
    ? [record.image]
    : [];

  return {
    id: String(record.id ?? index + 1),
    nameAr: baseName,
    nameEn: baseName,
    sku: record.sku ?? `SKU-${record.id ?? index + 1}`,
    barcode: record.barcode ?? '',
    price: Number(record.price ?? 0),
    discountPercentage: Number(record.discountPercent ?? 0),
    isActive: record.inStock !== false,
    isSimilarProductsEnabled: true,
    type: 'individual',
    category: record.category ?? '',
    brand: record.brand ?? '',
    description: record.description ?? '',
    images: normalizedImages,
    inventory: [
      {
        warehouseId: 'default',
        warehouseName: 'المخزون الرئيسي',
        quantity: resolvedQuantity,
        reservedQuantity: 0,
        availableQuantity: resolvedQuantity,
      },
    ],
    totalQuantity: resolvedQuantity,
    unlimitedQuantity: false,
    tags: Array.isArray(record.tags) ? record.tags : [],
    isFreeShipping: false,
    isDiscounted: Boolean(record.discountPercent),
    isFeatured: false,
    isLimitedQuantity: resolvedQuantity < 10,
    isFastSelling: false,
    isPaidShipping: false,
    weight: Number(record.weight ?? 0),
    dimensions: record.dimensions ?? { length: 0, width: 0, height: 0 },
    seoTitle: record.seoTitle ?? baseName,
    seoDescription: record.seoDescription ?? record.description ?? '',
    createdAt: record.createdAt ?? new Date().toISOString(),
    updatedAt: record.updatedAt ?? new Date().toISOString(),
  };
};

const ProductsView: React.FC<ProductsViewProps> = ({ storeData, setStoreData, onSave }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  // Form state
  const [productForm, setProductForm] = useState({
    nameAr: '',
    nameEn: '',
    sku: '',
    barcode: '',
    price: 0,
    discountPercentage: 0,
    type: 'individual' as Product['type'],
    category: '',
    brand: '',
    description: '',
    images: [] as string[],
    inventory: [
      { warehouseId: '1', warehouseName: 'مخزن الكريمية', quantity: 0 },
      { warehouseId: '2', warehouseName: 'مخزن غوط الشعال', quantity: 0 },
      { warehouseId: '3', warehouseName: 'مخزن بن عاشور', quantity: 0 },
    ],
    unlimitedQuantity: false,
    tags: [] as string[],
    isActive: true,
    isSimilarProductsEnabled: true,
    isFreeShipping: false,
    isDiscounted: false,
    isFeatured: false,
    isLimitedQuantity: false,
    isFastSelling: false,
    isPaidShipping: false,
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 },
    seoTitle: '',
    seoDescription: '',
  });
  const [products, setProducts] = useState<Product[]>(storeData?.products || []);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [deletePendingId, setDeletePendingId] = useState<string | null>(null);
  const latestStoreDataRef = useRef(storeData);

  useEffect(() => {
    latestStoreDataRef.current = storeData;
  }, [storeData]);

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || product.type === typeFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && product.isActive) ||
      (statusFilter === 'inactive' && !product.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  const fetchProducts = useCallback(async () => {
    setIsCatalogLoading(true);
    setSyncError(null);
    setSyncSuccess(null);
    try {
      const response = await fetch(`${API_BASE_URL}/products?limit=200`, {
        method: 'GET',
        credentials: 'include',
      });
      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.error || 'تعذر تحميل المنتجات');
      }
      const incoming = Array.isArray(result.data) ? result.data : [];
      const normalized = incoming.map((item: any, index: number) => normalizeProductRecord(item, index));
      setProducts(normalized);
      const currentStoreData = latestStoreDataRef.current;
      if (currentStoreData) {
        setStoreData({ ...currentStoreData, products: normalized });
      }
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'تعذر تحميل المنتجات');
    } finally {
      setIsCatalogLoading(false);
    }
  }, [setStoreData]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (Array.isArray(storeData?.products)) {
      setProducts(storeData.products);
    }
  }, [storeData?.products]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setSyncError(null);
    setSyncSuccess(null);
    setProductForm({
      nameAr: '',
      nameEn: '',
      sku: `SKU-${Date.now()}`,
      barcode: '',
      price: 0,
      discountPercentage: 0,
      type: 'individual',
      category: '',
      brand: '',
      description: '',
      images: [],
      inventory: [
        { warehouseId: '1', warehouseName: 'مخزن الكريمية', quantity: 0 },
        { warehouseId: '2', warehouseName: 'مخزن غوط الشعال', quantity: 0 },
        { warehouseId: '3', warehouseName: 'مخزن بن عاشور', quantity: 0 },
      ],
      unlimitedQuantity: false,
      tags: [],
      isActive: true,
      isSimilarProductsEnabled: true,
      isFreeShipping: false,
      isDiscounted: false,
      isFeatured: false,
      isLimitedQuantity: false,
      isFastSelling: false,
      isPaidShipping: false,
      weight: 0,
      dimensions: { length: 0, width: 0, height: 0 },
      seoTitle: '',
      seoDescription: '',
    });
    setShowProductModal(true);
    setActiveTab('basic');
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setSyncError(null);
    setSyncSuccess(null);
    setProductForm({
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      sku: product.sku,
      barcode: product.barcode || '',
      price: product.price,
      discountPercentage: product.discountPercentage,
      type: product.type,
      category: product.category,
      brand: product.brand || '',
      description: product.description || '',
      images: product.images,
      inventory: product.inventory,
      unlimitedQuantity: product.unlimitedQuantity,
      tags: product.tags,
      isActive: product.isActive,
      isSimilarProductsEnabled: product.isSimilarProductsEnabled,
      isFreeShipping: product.isFreeShipping,
      isDiscounted: product.isDiscounted,
      isFeatured: product.isFeatured,
      isLimitedQuantity: product.isLimitedQuantity,
      isFastSelling: product.isFastSelling,
      isPaidShipping: product.isPaidShipping,
      weight: product.weight || 0,
      dimensions: product.dimensions || { length: 0, width: 0, height: 0 },
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || '',
    });
    setShowProductModal(true);
    setActiveTab('basic');
  };

  const handleSaveProduct = async () => {
    if (!storeData) return;
    setSyncError(null);
    setSyncSuccess(null);

    const trimmedName = productForm.nameAr.trim() || productForm.nameEn.trim();
    if (!trimmedName) {
      setSyncError('يرجى إدخال اسم المنتج');
      return;
    }

    if (!productForm.description.trim()) {
      setSyncError('يرجى إدخال وصف المنتج');
      return;
    }

    if (!productForm.category.trim()) {
      setSyncError('يرجى تحديد التصنيف');
      return;
    }

    const totalQuantity = productForm.inventory.reduce((sum, inv) => sum + inv.quantity, 0);

    const payload: Record<string, unknown> = {
      name: trimmedName,
      description: productForm.description.trim(),
      price: Number(productForm.price ?? 0),
      stock: Math.max(totalQuantity, 1),
      quantity: totalQuantity,
      inStock: totalQuantity > 0 && productForm.isActive,
      category: productForm.category,
      sku: productForm.sku,
      images: productForm.images.filter(Boolean),
    };

    if (productForm.brand) {
      payload.brand = productForm.brand;
    }

    if (productForm.images[0]) {
      payload.thumbnail = productForm.images[0];
    }

    if (productForm.discountPercentage) {
      payload.discountPercent = Number(productForm.discountPercentage);
      payload.discountType = 'percentage';
      payload.originalPrice = Number(productForm.price ?? 0);
    }

    setIsSavingProduct(true);

    try {
      const endpoint = editingProduct ? `/products/${editingProduct.id}` : '/products';
      const method = editingProduct ? 'PUT' : 'POST';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.error || 'تعذر حفظ المنتج');
      }
      await fetchProducts();
      setShowProductModal(false);
      setEditingProduct(null);
      setSyncSuccess(editingProduct ? 'تم تحديث المنتج بنجاح ✓ سيتم تحديث المتجر' : 'تم إنشاء المنتج بنجاح ✓');
      
      window.dispatchEvent(new CustomEvent('productUpdated', {
        detail: { storeId: storeData?.id, products: products }
      }));
      
      onSave();
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'تعذر حفظ المنتج');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setSyncError(null);
    setSyncSuccess(null);
    setDeletePendingId(productId);
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) {
        throw new Error(result.error || 'تعذر حذف المنتج');
      }
      await fetchProducts();
      setSyncSuccess('تم حذف المنتج');
      onSave();
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'تعذر حذف المنتج');
    } finally {
      setDeletePendingId(null);
    }
  };

  const getTypeBadge = (type: Product['type']) => {
    const typeConfig: Record<Product['type'], { label: string; color: string }> = {
      individual: { label: 'فردي', color: 'bg-blue-100 text-blue-800' },
      grouped: { label: 'مجمع', color: 'bg-green-100 text-green-800' },
      digital: { label: 'رقمي', color: 'bg-purple-100 text-purple-800' },
      subscription: { label: 'اشتراك', color: 'bg-orange-100 text-orange-800' },
    };

    const config = typeConfig[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getProductTags = (product: Product): Array<{label: string, color: string}> => {
    const tags: Array<{label: string, color: string}> = [];
    if (product.isFreeShipping) tags.push({ label: 'شحن مجاني', color: 'bg-green-100 text-green-800' });
    if (product.isDiscounted) tags.push({ label: 'مخفض', color: 'bg-red-100 text-red-800' });
    if (product.isFeatured) tags.push({ label: 'مميز', color: 'bg-purple-100 text-purple-800' });
    if (product.isLimitedQuantity) tags.push({ label: 'كمية محدودة', color: 'bg-orange-100 text-orange-800' });
    if (product.isFastSelling) tags.push({ label: 'يباع سريعاً', color: 'bg-pink-100 text-pink-800' });
    if (product.isPaidShipping) tags.push({ label: 'شحن مدفوع', color: 'bg-gray-100 text-gray-800' });
    return tags;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">المنتجات</h2>
          <p className="text-gray-600 mt-1">جميع منتجات متجرك هنا</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchProducts}
            disabled={isCatalogLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isCatalogLoading ? 'animate-spin' : ''}`} />
            {isCatalogLoading ? 'جاري المزامنة' : 'مزامنة المخزون'}
          </Button>
          <Button
            onClick={handleAddProduct}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Plus className="h-4 w-4 ml-2" />
            إضافة منتج جديد
          </Button>
        </div>
      </div>

      {syncError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {syncError}
        </div>
      )}

      {syncSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {syncSuccess}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الطلبات الرقمية</p>
                <p className="text-3xl font-bold text-gray-900">1</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">المنتجات المجمعة</p>
                <p className="text-3xl font-bold text-gray-900">1</p>
              </div>
              <Layers className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الشحنية</p>
                <p className="text-3xl font-bold text-gray-900">1</p>
              </div>
              <Truck className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">المنتجات الفردية</p>
                <p className="text-3xl font-bold text-gray-900">4</p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-4">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الكل</p>
                <p className="text-3xl font-bold text-gray-900">{products.length}</p>
              </div>
              <div className="text-4xl font-bold text-gray-400">{products.length}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث في المنتجات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="نوع المنتج" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="individual">فردي</SelectItem>
                <SelectItem value="grouped">مجمع</SelectItem>
                <SelectItem value="digital">رقمي</SelectItem>
                <SelectItem value="subscription">اشتراك</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="حالة المنتج" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 ml-2" />
              تصفية
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 ml-2" />
              تصدير
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المنتجات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-semibold">الاسم / SKU</th>
                  <th className="text-right p-3 font-semibold">الكمية</th>
                  <th className="text-right p-3 font-semibold">السعر</th>
                  <th className="text-right p-3 font-semibold">الحالة</th>
                  <th className="text-right p-3 font-semibold">تاريخ الإنشاء</th>
                  <th className="text-right p-3 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <p className="font-semibold">{product.nameAr}</p>
                        <p className="text-sm text-gray-600">{product.sku}</p>
                        <div className="flex gap-1 mt-1">
                          {getTypeBadge(product.type)}
                          {getProductTags(product).map((tag, index) => (
                            <Badge key={index} className={tag.color} variant="outline">
                              {tag.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-center">
                        {product.unlimitedQuantity ? (
                          <Badge variant="outline">غير محدود</Badge>
                        ) : (
                          <div>
                            <p className="font-semibold">{product.totalQuantity}</p>
                            <p className="text-sm text-gray-600">إجمالي الكمية</p>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-semibold">{product.price} د.ل</p>
                        {product.discountPercentage > 0 && (
                          <p className="text-sm text-red-600">{product.discountPercentage}% خصم</p>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant={product.isActive ? 'default' : 'secondary'}>
                        {product.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <p className="text-sm">{product.createdAt}</p>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-700"
                          disabled={deletePendingId === product.id}
                        >
                          <Trash2 className={`h-4 w-4 ${deletePendingId === product.id ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد منتجات تطابق معايير البحث</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showProductModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowProductModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-full">
                {/* Sidebar */}
                <div className="w-80 bg-gray-50 border-l p-6 overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                      {editingProduct ? 'تعديل المنتج' : 'إنشاء منتج جديد'}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowProductModal(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <nav className="space-y-2">
                    <button
                      onClick={() => setActiveTab('basic')}
                      className={`w-full text-right p-3 rounded-lg transition-colors ${
                        activeTab === 'basic' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                      }`}
                    >
                      معلومات المنتج
                    </button>
                    <button
                      onClick={() => setActiveTab('inventory')}
                      className={`w-full text-right p-3 rounded-lg transition-colors ${
                        activeTab === 'inventory' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                      }`}
                    >
                      إدارة المخزون
                    </button>
                    <button
                      onClick={() => setActiveTab('shipping')}
                      className={`w-full text-right p-3 rounded-lg transition-colors ${
                        activeTab === 'shipping' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                      }`}
                    >
                      الشحن والتوصيل
                    </button>
                    <button
                      onClick={() => setActiveTab('seo')}
                      className={`w-full text-right p-3 rounded-lg transition-colors ${
                        activeTab === 'seo' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                      }`}
                    >
                      تحسين محركات البحث
                    </button>
                  </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {activeTab === 'basic' && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900">معلومات المنتج</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="nameAr">إسم المنتج باللغة العربية *</Label>
                          <Input
                            id="nameAr"
                            value={productForm.nameAr}
                            onChange={(e) => setProductForm({ ...productForm, nameAr: e.target.value })}
                            placeholder="أدخل اسم المنتج بالعربي"
                          />
                        </div>

                        <div>
                          <Label htmlFor="nameEn">اسم المنتج باللغة الإنجليزية</Label>
                          <Input
                            id="nameEn"
                            value={productForm.nameEn}
                            onChange={(e) => setProductForm({ ...productForm, nameEn: e.target.value })}
                            placeholder="Product name in English"
                          />
                        </div>

                        <div>
                          <Label htmlFor="price">سعر المنتج *</Label>
                          <Input
                            id="price"
                            type="number"
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                            placeholder="0.00"
                          />
                          <span className="text-sm text-gray-600">د.ل</span>
                        </div>

                        <div>
                          <Label htmlFor="sku">رمز المنتج SKU</Label>
                          <Input
                            id="sku"
                            value={productForm.sku}
                            onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                            placeholder="SKU-001"
                          />
                        </div>

                        <div>
                          <Label htmlFor="barcode">الباركود</Label>
                          <div className="relative">
                            <Input
                              id="barcode"
                              value={productForm.barcode}
                              onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                              placeholder="123456789012"
                              className="pr-10"
                            />
                            <Barcode className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="discountPercentage">قيمة التخفيض (%)</Label>
                          <Input
                            id="discountPercentage"
                            type="number"
                            value={productForm.discountPercentage}
                            onChange={(e) => setProductForm({ ...productForm, discountPercentage: Number(e.target.value) })}
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <Label htmlFor="type">نوع المنتج</Label>
                          <Select value={productForm.type} onValueChange={(value) => setProductForm({ ...productForm, type: value as Product['type'] })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="individual">فردي</SelectItem>
                              <SelectItem value="grouped">مجمع</SelectItem>
                              <SelectItem value="digital">رقمي</SelectItem>
                              <SelectItem value="subscription">اشتراك</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="category">التصنيف</Label>
                          <Select value={productForm.category} onValueChange={(value) => setProductForm({ ...productForm, category: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر التصنيف" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="العطور">العطور</SelectItem>
                              <SelectItem value="الملابس النسائية">الملابس النسائية</SelectItem>
                              <SelectItem value="الإكسسوارات">الإكسسوارات</SelectItem>
                              <SelectItem value="الأحذية">الأحذية</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="brand">الماركة</Label>
                          <Input
                            id="brand"
                            value={productForm.brand}
                            onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                            placeholder="اسم الماركة"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">وصف المنتج</Label>
                        <Textarea
                          id="description"
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          placeholder="وصف تفصيلي للمنتج"
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="isActive"
                              checked={productForm.isActive}
                              onCheckedChange={(checked) => setProductForm({ ...productForm, isActive: checked as boolean })}
                            />
                            <Label htmlFor="isActive">عرض المنتج على المنصة</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="isSimilarProductsEnabled"
                              checked={productForm.isSimilarProductsEnabled}
                              onCheckedChange={(checked) => setProductForm({ ...productForm, isSimilarProductsEnabled: checked as boolean })}
                            />
                            <Label htmlFor="isSimilarProductsEnabled">تفعيل المنتجات المشابهة</Label>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label>ملصقات المنتج</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { key: 'isFreeShipping', label: 'شحن مجاني' },
                              { key: 'isDiscounted', label: 'مخفض' },
                              { key: 'isFeatured', label: 'منتج مميز' },
                              { key: 'isLimitedQuantity', label: 'كمية محدودة' },
                              { key: 'isFastSelling', label: 'يباع سريعاً' },
                              { key: 'isPaidShipping', label: 'شحن مدفوع' },
                            ].map((tag) => (
                              <div key={tag.key} className="flex items-center space-x-2">
                                <Checkbox
                                  id={tag.key}
                                  checked={productForm[tag.key as keyof typeof productForm] as boolean}
                                  onCheckedChange={(checked) => setProductForm({ ...productForm, [tag.key]: checked })}
                                />
                                <Label htmlFor={tag.key} className="text-sm">{tag.label}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'inventory' && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900">إدارة المخزون</h3>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="unlimitedQuantity"
                            checked={productForm.unlimitedQuantity}
                            onCheckedChange={(checked) => setProductForm({ ...productForm, unlimitedQuantity: checked as boolean })}
                          />
                          <Label htmlFor="unlimitedQuantity">كمية غير محدودة</Label>
                        </div>

                        {!productForm.unlimitedQuantity && (
                          <div className="space-y-4">
                            <h4 className="font-semibold">الكميات بالمخزون</h4>
                            {productForm.inventory.map((inv, index) => (
                              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                                <div>
                                  <Label>{inv.warehouseName}</Label>
                                  <Input
                                    type="number"
                                    value={inv.quantity}
                                    onChange={(e) => {
                                      const updatedInventory = [...productForm.inventory];
                                      if (updatedInventory[index]) {
                                        updatedInventory[index].quantity = Number(e.target.value);
                                      }
                                      setProductForm({ ...productForm, inventory: updatedInventory });
                                    }}
                                    placeholder="0"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">الكمية الإجمالية:</span>
                                  <span className="font-semibold">
                                    {productForm.inventory.reduce((sum, inv) => sum + inv.quantity, 0)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'shipping' && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900">الشحن والتوصيل</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="weight">الوزن (كجم)</Label>
                          <Input
                            id="weight"
                            type="number"
                            value={productForm.weight}
                            onChange={(e) => setProductForm({ ...productForm, weight: Number(e.target.value) })}
                            placeholder="0"
                          />
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold">الأبعاد (سم)</h4>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label>الطول</Label>
                              <Input
                                type="number"
                                value={productForm.dimensions.length}
                                onChange={(e) => setProductForm({
                                  ...productForm,
                                  dimensions: { ...productForm.dimensions, length: Number(e.target.value) }
                                })}
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <Label>العرض</Label>
                              <Input
                                type="number"
                                value={productForm.dimensions.width}
                                onChange={(e) => setProductForm({
                                  ...productForm,
                                  dimensions: { ...productForm.dimensions, width: Number(e.target.value) }
                                })}
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <Label>الارتفاع</Label>
                              <Input
                                type="number"
                                value={productForm.dimensions.height}
                                onChange={(e) => setProductForm({
                                  ...productForm,
                                  dimensions: { ...productForm.dimensions, height: Number(e.target.value) }
                                })}
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'seo' && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900">تحسين محركات البحث</h3>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="seoTitle">عنوان صفحة المنتج بالعربية</Label>
                          <Input
                            id="seoTitle"
                            value={productForm.seoTitle}
                            onChange={(e) => setProductForm({ ...productForm, seoTitle: e.target.value })}
                            placeholder="عنوان محسن لمحركات البحث"
                          />
                          <p className="text-sm text-gray-600 mt-1">عدد الأحرف: {productForm.seoTitle.length}/70</p>
                        </div>

                        <div>
                          <Label htmlFor="seoDescription">وصف صفحة المنتج بالعربية</Label>
                          <Textarea
                            id="seoDescription"
                            value={productForm.seoDescription}
                            onChange={(e) => setProductForm({ ...productForm, seoDescription: e.target.value })}
                            placeholder="وصف محسن لمحركات البحث باللغة العربية"
                            rows={4}
                          />
                          <p className="text-sm text-gray-600 mt-1">عدد الأحرف: {productForm.seoDescription.length}/320</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Modal Actions */}
                  <div className="flex justify-between mt-8 pt-6 border-t">
                    <Button variant="outline" onClick={() => setShowProductModal(false)}>
                      إلغاء
                    </Button>
                    <Button
                      onClick={handleSaveProduct}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      disabled={isSavingProduct || !productForm.nameAr.trim() || !productForm.price}
                    >
                      <Package className={`h-4 w-4 ml-2 ${isSavingProduct ? 'animate-spin' : ''}`} />
                      {isSavingProduct ? 'جاري الحفظ...' : editingProduct ? 'حفظ التغييرات' : 'إنشاء المنتج'}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { ProductsView };
