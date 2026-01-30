// Merchant Product Management Page - EISHRO Platform
// إدارة المنتجات والصور للتاجر الجديد

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ShoppingBag,
  Upload,
  X,
  Image as ImageIcon,
  Plus,
  Save,
  Trash2,
  Eye,
  Package,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getDefaultProductImageSync, handleImageError } from '@/utils/imageUtils';
import { getProxyImageUrl } from '@/utils/assetProxyUtil';
import { stripApiBase } from '@/utils/apiConfig';

interface Product {
  id: number;
  nameAr: string;
  nameEn: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPercent?: number;
  images: string[];
  sizes: string[];
  availableSizes: string[];
  colors?: { name: string; value: string }[];
  category: string;
  inStock: boolean;
  quantity: number;
  tags: string[];
  badge?: string;
}

interface StoreData {
  nameAr: string;
  nameEn: string;
  description: string;
  logo: string | null;
  category: string;
  warehouseChoice: string;
  merchantEmail: string;
  merchantPhone: string;
  storeId: string;
  subdomain: string;
}

interface MerchantData {
  email: string;
  password: string;
  phone: string;
  storeName: string;
  subdomain: string;
  storeId: string;
}

interface MerchantProductManagementProps {
  storeData: StoreData | null;
  merchantData: MerchantData | null;
  onBack: () => void;
  onComplete: () => void;
}

const CLEANING_PRODUCT_SIZES = [
  '500 مل',
  '1 لتر',
  '1 كيلو غرام',
  '3 كيلو غرام',
  '500 جرام',
  '2 كيلو غرام',
  '5 لتر',
  '10 لتر',
  '25 كيلو غرام',
  '50 كيلو غرام'
];

const PRODUCT_BADGES = [
  { value: 'best_selling', label: 'أكثر مبيعاً', color: 'bg-red-500' },
  { value: 'most_requested', label: 'أكثر طلباً', color: 'bg-blue-500' },
  { value: 'most_viewed', label: 'أكثر مشاهدة', color: 'bg-green-500' },
  { value: 'new', label: 'جديد', color: 'bg-purple-500' },
  { value: 'discount', label: 'تخفيضات', color: 'bg-orange-500' },
  { value: 'out_of_stock', label: 'غير متوفر', color: 'bg-gray-500' }
];

const MerchantProductManagement: React.FC<MerchantProductManagementProps> = ({
  storeData,
  merchantData,
  onBack,
  onComplete
}) => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [sliderImages, setSliderImages] = useState<string[]>([]);
  const [sliderFiles, setSliderFiles] = useState<File[]>([]);
  const [currentSliderIndex, setCurrentSliderIndex] = useState(0);
  const [productImageIndices, setProductImageIndices] = useState<Record<number, number>>({});

  // Refs for file inputs
  const productImageInputRef = useRef<HTMLInputElement>(null);
  const sliderImageInputRef = useRef<HTMLInputElement>(null);

  // Product form state
  const [productForm, setProductForm] = useState({
    nameAr: '',
    nameEn: '',
    description: '',
    price: '',
    originalPrice: '',
    discountPercent: '',
    images: [] as File[],
    imageUrls: [] as string[],
    sizes: [] as string[],
    selectedSizes: [] as string[],
    category: storeData?.category || 'cleaning',
    quantity: '',
    tags: [] as string[],
    badge: '',
    customSize: ''
  });

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Load existing data
  useEffect(() => {
    if (storeData?.subdomain) {
      const storedProducts = localStorage.getItem(`store_products_${storeData.subdomain}`);
      if (storedProducts) {
        try {
          const parsedProducts = JSON.parse(storedProducts);
          // Filter out default products and migrate old format
          const userProducts = parsedProducts
            .filter((p: any) => !p.name?.includes('منتج جديد'))
            .map((p: any) => ({
              ...p,
              nameAr: p.nameAr || p.name || '',
              nameEn: p.nameEn || ''
            }));
          setProducts(userProducts);
        } catch (error) {

        }
      }

      const storedSliders = localStorage.getItem(`store_sliders_${storeData.subdomain}`);
      if (storedSliders) {
        try {
          setSliderImages(JSON.parse(storedSliders));
        } catch (error) {

        }
      }
    }
  }, [storeData]);

  // Auto-advance slider every 5 seconds
  useEffect(() => {
    if (sliderImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentSliderIndex((prevIndex) => (prevIndex + 1) % sliderImages.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [sliderImages.length]);

  const handleProductImageUpload = (files: FileList) => {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/webp', 'image/png', 'image/bmp', 
      'image/gif', 'image/tiff', 'application/pdf', 'image/avif', 'image/svg+xml'
    ];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif', '.tiff', '.svg', '.pdf', '.avif'];
    const fileArray = Array.from(files).filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidType = allowedTypes.includes(file.type.toLowerCase());
      const isValidExtension = allowedExtensions.includes(extension);
      
      if (!isValidType && !isValidExtension) {
        alert(`نوع الملف غير مدعوم: ${file.name}. الامتدادات المدعومة: ${allowedExtensions.join(', ')}`);
        return false;
      }
      return true;
    });

    if (fileArray.length > 0) {
      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, ...fileArray],
        imageUrls: [...prev.imageUrls, ...fileArray.map(file => URL.createObjectURL(file))]
      }));
    }
  };

  const handleSliderImageUpload = (files: FileList) => {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/webp', 'image/png', 'image/bmp', 
      'image/gif', 'image/tiff', 'application/pdf', 'image/avif', 'image/svg+xml'
    ];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif', '.tiff', '.svg', '.pdf', '.avif'];
    const fileArray = Array.from(files).filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidType = allowedTypes.includes(file.type.toLowerCase());
      const isValidExtension = allowedExtensions.includes(extension);
      
      if (!isValidType && !isValidExtension) {
        alert(`نوع الملف غير مدعوم: ${file.name}. الامتدادات المدعومة: ${allowedExtensions.join(', ')}`);
        return false;
      }
      return true;
    });

    if (fileArray.length > 0) {
      setSliderFiles(prev => [...prev, ...fileArray]);
      setSliderImages(prev => [...prev, ...fileArray.map(file => URL.createObjectURL(file))]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, uploadHandler: (files: FileList) => void) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadHandler(files);
    }
  };

  const removeProductImage = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const removeSliderImage = (index: number) => {
    setSliderImages(prev => prev.filter((_, i) => i !== index));
    setSliderFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSizeToggle = (size: string) => {
    setProductForm(prev => ({
      ...prev,
      selectedSizes: prev.selectedSizes.includes(size)
        ? prev.selectedSizes.filter(s => s !== size)
        : [...prev.selectedSizes, size]
    }));
  };

  const handleProductImageNavigation = (productId: number, direction: 'next' | 'prev') => {
    setProductImageIndices(prev => {
      const currentIndex = prev[productId] || 0;
      const product = products.find(p => p.id === productId);
      if (!product || product.images.length <= 1) return prev;

      let newIndex;
      if (direction === 'next') {
        newIndex = (currentIndex + 1) % product.images.length;
      } else {
        newIndex = currentIndex === 0 ? product.images.length - 1 : currentIndex - 1;
      }

      return { ...prev, [productId]: newIndex };
    });
  };

  const saveProduct = () => {
    if (!productForm.nameAr.trim() || !productForm.price) {
      alert('يرجى إدخال اسم المنتج وسعره على الأقل');
      return;
    }

    const newProduct: Product = {
      id: editingProduct?.id || Date.now(),
      nameAr: productForm.nameAr,
      nameEn: productForm.nameEn,
      description: productForm.description,
      price: parseFloat(productForm.price) || 0,
      originalPrice: parseFloat(productForm.originalPrice) || parseFloat(productForm.price) || 0,
      ...(productForm.discountPercent && { discountPercent: parseFloat(productForm.discountPercent) }),
      images: productForm.imageUrls.length > 0 ? productForm.imageUrls : [getDefaultProductImageSync(storeData?.subdomain)],
      sizes: productForm.selectedSizes,
      availableSizes: productForm.selectedSizes,
      category: productForm.category,
      inStock: true,
      quantity: parseInt(productForm.quantity) || 0,
      tags: productForm.tags,
      ...(productForm.badge && { badge: productForm.badge })
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? newProduct : p));
    } else {
      setProducts(prev => [...prev, newProduct]);
    }

    // Reset form
    setProductForm({
      nameAr: '',
      nameEn: '',
      description: '',
      price: '',
      originalPrice: '',
      discountPercent: '',
      images: [],
      imageUrls: [],
      sizes: [],
      selectedSizes: [],
      category: storeData?.category || 'cleaning',
      quantity: '',
      tags: [],
      badge: '',
      customSize: ''
    });
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const editProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice.toString(),
      discountPercent: product.discountPercent?.toString() || '',
      images: [],
      imageUrls: product.images,
      sizes: product.sizes,
      selectedSizes: product.availableSizes,
      category: product.category,
      quantity: product.quantity.toString(),
      tags: product.tags,
      badge: product.badge || '',
      customSize: ''
    });
    setShowProductForm(true);
  };

  const deleteProduct = (productId: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const saveAllData = () => {






    if (!storeData?.subdomain) {

      alert('خطأ: بيانات المتجر غير مكتملة. يرجى المحاولة مرة أخرى.');
      return;
    }

    try {
      // Save products
      localStorage.setItem(`store_products_${storeData.subdomain}`, JSON.stringify(products));


      // Save slider images
      localStorage.setItem(`store_sliders_${storeData.subdomain}`, JSON.stringify(sliderImages));


      // Mark store as setup complete
      const storedStores = JSON.parse(localStorage.getItem('eshro_stores') || '[]');


      const updatedStores = storedStores.map((store: any) => {
        if (store.subdomain === storeData.subdomain) {

          return { ...store, setupComplete: true };
        }
        return store;
      });

      localStorage.setItem('eshro_stores', JSON.stringify(updatedStores));


      alert('تم حفظ جميع البيانات بنجاح! متجرك الآن جاهز ومُعروض على المنصة');


      onComplete();


    } catch (error) {

      alert('حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.');
    }
  };

  const canComplete = products.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            إعداد متجر {storeData?.nameAr}
          </h1>
          <p className="text-gray-600">
            أضف منتجاتك وصور السلايدر لإكمال إعداد المتجر
          </p>
          <div className="mt-4">
            <Progress value={products.length > 0 ? 100 : 0} className="w-full max-w-md mx-auto" />
            <p className="text-sm text-gray-500 mt-2">
              {products.length} منتج • {sliderImages.length} صورة سلايدر
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              إدارة المنتجات ({products.length})
            </TabsTrigger>
            <TabsTrigger value="sliders" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              صور السلايدر ({sliderImages.length})
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-blue-600" />
                    منتجات المتجر
                  </CardTitle>
                  <Button
                    onClick={() => setShowProductForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    إضافة منتج جديد
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منتجات بعد</h3>
                    <p className="text-gray-500 mb-4">ابدأ بإضافة منتجاتك الأولى</p>
                    <Button onClick={() => setShowProductForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      إضافة المنتج الأول
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <Card key={product.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="aspect-square bg-gray-100 rounded-lg mb-4 relative overflow-hidden group">
                            {(() => {
                              const currentImageIndex = productImageIndices[product.id] || 0;
                              const currentImage = product.images[currentImageIndex] || product.images[0];

                              if (currentImage && currentImage.endsWith('.pdf')) {
                                return (
                                  <div className="w-full h-full bg-red-50 flex items-center justify-center">
                                    <div className="text-center">
                                      <FileText className="h-12 w-12 text-red-500 mx-auto mb-2" />
                                      <p className="text-xs text-red-600">PDF</p>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <img
                                  src={getProxyImageUrl(currentImage || getDefaultProductImageSync(storeData?.subdomain), storeData?.subdomain, 'products')}
                                  alt={product.nameAr}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    handleImageError(e, storeData?.subdomain);
                                  }}
                                />
                              );
                            })()}

                            {/* Navigation arrows - only show if multiple images */}
                            {product.images.length > 1 && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleProductImageNavigation(product.id, 'prev');
                                  }}
                                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                                  aria-label="الصورة السابقة"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleProductImageNavigation(product.id, 'next');
                                  }}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                                  aria-label="الصورة التالية"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                              </>
                            )}

                            {/* Image indicators */}
                            {product.images.length > 1 && (
                              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                                {product.images.map((_, index) => (
                                  <button
                                    key={index}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setProductImageIndices(prev => ({ ...prev, [product.id]: index }));
                                    }}
                                    className={`w-2 h-2 rounded-full transition-colors ${
                                      (productImageIndices[product.id] || 0) === index
                                        ? 'bg-white'
                                        : 'bg-white/50'
                                    }`}
                                    aria-label={`الصورة ${index + 1} من ${product.images.length}`}
                                  />
                                ))}
                              </div>
                            )}

                            {/* Image count indicator */}
                            {product.images.length > 1 && (
                              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                {(productImageIndices[product.id] || 0) + 1}/{product.images.length}
                              </div>
                            )}

                            {product.badge && (
                              <Badge className="absolute top-2 right-2">
                                {PRODUCT_BADGES.find(b => b.value === product.badge)?.label}
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-semibold text-lg mb-2">{product.nameAr}</h4>
                          {product.nameEn && <p className="text-sm text-gray-500 mb-2">{product.nameEn}</p>}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-bold text-green-600">{product.price} د.ل</span>
                            {product.originalPrice > product.price && (
                              <span className="text-sm text-gray-500 line-through">{product.originalPrice} د.ل</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => editProduct(product)}>
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => deleteProduct(product.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <Badge variant={product.inStock ? "default" : "secondary"}>
                              {product.inStock ? 'متوفر' : 'غير متوفر'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sliders Tab */}
          <TabsContent value="sliders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-purple-600" />
                  صور السلايدر
                </CardTitle>
                <p className="text-sm text-gray-600">
                  أضف صوراً تعرض في سلايدر متجرك لجذب العملاء
                </p>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, handleSliderImageUpload)}
                  onClick={() => sliderImageInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 mb-2">اسحب وأفلت صور السلايدر هنا</p>
                  <p className="text-sm text-gray-500 mb-4">أو انقر لاختيار الصور</p>
                  <input
                    ref={sliderImageInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/webp,image/png,image/bmp,image/gif,image/tiff,application/pdf,image/avif,image/svg+xml"
                    onChange={(e) => e.target.files && handleSliderImageUpload(e.target.files)}
                    className="hidden"
                    id="slider-images"
                    aria-label="رفع صور السلايدر"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => sliderImageInputRef.current?.click()}
                  >
                    اختر الصور
                  </Button>
                </div>

                {sliderImages.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-4">الصور المختارة ({sliderImages.length})</h4>

                    {/* Slider Preview */}
                    <div className="mb-6">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">معاينة السلايدر (يتحرك كل 5 ثواني)</h5>
                      <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                        {sliderImages.map((url, index) => {
                          const isPdf = sliderFiles[index]?.type === 'application/pdf';
                          return isPdf ? (
                            <div
                              key={index}
                              className={`absolute inset-0 w-full h-full bg-red-50 flex items-center justify-center transition-opacity duration-1000 ${
                                index === currentSliderIndex ? 'opacity-100' : 'opacity-0'
                              }`}
                            >
                              <div className="text-center">
                                <FileText className="h-16 w-16 text-red-500 mx-auto mb-2" />
                                <p className="text-red-600 font-medium">ملف PDF</p>
                              </div>
                            </div>
                          ) : (
                            <img
                              key={index}
                              src={url}
                              alt={`Slider ${index + 1}`}
                              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                                index === currentSliderIndex ? 'opacity-100' : 'opacity-0'
                              }`}
                            />
                          );
                        })}
                        {/* Slider indicators */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {sliderImages.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentSliderIndex(index)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentSliderIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                              aria-label={`صورة السلايدر ${index + 1} من ${sliderImages.length}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {sliderImages.map((url, index) => {
                        const isPdf = sliderFiles[index]?.type === 'application/pdf';
                        return (
                          <div key={index} className="relative group">
                            {isPdf ? (
                              <div className="w-full h-32 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <FileText className="h-10 w-10 text-red-500 mx-auto mb-1" />
                                  <p className="text-xs text-red-600">PDF</p>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={url}
                                alt={`Slider ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                            )}
                            <button
                              type="button"
                              title="حذف صورة السلايدر"
                              onClick={() => removeSliderImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Product Form Modal */}
        {showProductForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-blue-600" />
                  {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Info */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="product-name-ar">اسم المنتج بالعربية *</Label>
                      <Input
                        id="product-name-ar"
                        value={productForm.nameAr}
                        onChange={(e) => setProductForm(prev => ({ ...prev, nameAr: e.target.value }))}
                        placeholder="أدخل اسم المنتج بالعربية"
                      />
                    </div>

                    <div>
                      <Label htmlFor="product-name-en">اسم المنتج بالإنجليزية</Label>
                      <Input
                        id="product-name-en"
                        value={productForm.nameEn}
                        onChange={(e) => setProductForm(prev => ({ ...prev, nameEn: e.target.value }))}
                        placeholder="أدخل اسم المنتج بالإنجليزية"
                      />
                    </div>

                    <div>
                      <Label htmlFor="product-description">وصف المنتج</Label>
                      <Textarea
                        id="product-description"
                        value={productForm.description}
                        onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="وصف تفصيلي للمنتج"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="product-price">السعر *</Label>
                        <div className="relative">
                          <Input
                            id="product-price"
                            type="number"
                            value={productForm.price}
                            onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                            placeholder="0.00"
                            className="pr-12"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">د.ل</span>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="product-original-price">السعر قبل التخفيض</Label>
                        <div className="relative">
                          <Input
                            id="product-original-price"
                            type="number"
                            value={productForm.originalPrice}
                            onChange={(e) => setProductForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                            placeholder="0.00"
                            className="pr-12"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">د.ل</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="product-quantity">الكمية المتوفرة</Label>
                      <Input
                        id="product-quantity"
                        type="number"
                        value={productForm.quantity}
                        onChange={(e) => setProductForm(prev => ({ ...prev, quantity: e.target.value }))}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label>التصنيف</Label>
                      <Select value={productForm.category} onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر التصنيف" />
                        </SelectTrigger>
                        <SelectContent>
                          {storeData?.category === 'cleaning_supplies' ? (
                            <>
                              <SelectItem value="مستلزمات مساحيق الغسالات">مستلزمات مساحيق الغسالات</SelectItem>
                              <SelectItem value="مستلزمات تنظف ارضيات">مستلزمات تنظف ارضيات</SelectItem>
                              <SelectItem value="مستلزمات التنظيف للغاز">مستلزمات التنظيف للغاز</SelectItem>
                              <SelectItem value="مستلزمات تنظيف الخشب">مستلزمات تنظيف الخشب</SelectItem>
                              <SelectItem value="مستلزمات تنظيف الزجاج">مستلزمات تنظيف الزجاج</SelectItem>
                              <SelectItem value="مستلزمات تنظيف وإزالة البقع">مستلزمات تنظيف وإزالة البقع</SelectItem>
                              <SelectItem value="معطرات جو">معطرات جو</SelectItem>
                              <SelectItem value="معطرات أرضيات">معطرات أرضيات</SelectItem>
                              <SelectItem value="مساحيق تلميع">مساحيق تلميع</SelectItem>
                              <SelectItem value="مستلزمات مركبات">مستلزمات مركبات</SelectItem>
                              <SelectItem value="مستلزمات العناية بالبشرة">مستلزمات العناية بالبشرة</SelectItem>
                              <SelectItem value="مستلزمات العناية الشخصية">مستلزمات العناية الشخصية</SelectItem>
                              <SelectItem value="مستلزمات المطابخ">مستلزمات المطابخ</SelectItem>
                              <SelectItem value="مستلزمات المناسبات والاعياد">مستلزمات المناسبات والاعياد</SelectItem>
                              <SelectItem value="مستلزمات الاطفال">مستلزمات الاطفال</SelectItem>
                              <SelectItem value="العطورات الخشبية والبخور">العطورات الخشبية والبخور</SelectItem>
                              <SelectItem value="العطور النسائية">العطور النسائية</SelectItem>
                              <SelectItem value="العطور الرجالية">العطور الرجالية</SelectItem>
                              <SelectItem value="عطور للاطفال">عطور للاطفال</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="cleaning">مواد تنظيف</SelectItem>
                              <SelectItem value="electronics">إلكترونيات</SelectItem>
                              <SelectItem value="fashion">أزياء</SelectItem>
                              <SelectItem value="home">منزل وحديقة</SelectItem>
                              <SelectItem value="sports">رياضة</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>شارة المنتج</Label>
                      <Select value={productForm.badge} onValueChange={(value) => setProductForm(prev => ({ ...prev, badge: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر شارة (اختياري)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">بدون شارة</SelectItem>
                          {PRODUCT_BADGES.map((badge) => (
                            <SelectItem key={badge.value} value={badge.value}>
                              {badge.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Images and Sizes */}
                  <div className="space-y-4">
                    <div>
                      <Label>صور المنتج</Label>
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, handleProductImageUpload)}
                        onClick={() => productImageInputRef.current?.click()}
                      >
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">اسحب وأفلت الصور هنا</p>
                        <p className="text-xs text-gray-500 mb-2">أو انقر لاختيار الصور</p>
                        <input
                          ref={productImageInputRef}
                          type="file"
                          multiple
                          accept="image/jpeg,image/jpg,image/webp,image/png,image/bmp,image/gif,image/tiff,application/pdf,image/avif,image/svg+xml"
                          onChange={(e) => e.target.files && handleProductImageUpload(e.target.files)}
                          className="hidden"
                          id="product-form-images"
                          aria-label="رفع صور المنتج"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => productImageInputRef.current?.click()}
                        >
                          اختر الصور
                        </Button>
                      </div>

                      {productForm.imageUrls.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          {productForm.imageUrls.map((url, index) => {
                            const isPdf = productForm.images[index]?.type === 'application/pdf';
                            return (
                              <div key={index} className="relative group">
                                {isPdf ? (
                                  <div className="w-full h-20 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                      <FileText className="h-8 w-8 text-red-500 mx-auto mb-1" />
                                      <p className="text-xs text-red-600">PDF</p>
                                    </div>
                                  </div>
                                ) : (
                                  <img
                                    src={url}
                                    alt={`Product ${index + 1}`}
                                    className="w-full h-20 object-cover rounded-lg border"
                                  />
                                )}
                                <button
                                  type="button"
                                  title="حذف صورة المنتج"
                                  onClick={() => removeProductImage(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>الأحجام المتوفرة</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {CLEANING_PRODUCT_SIZES.map((size) => (
                          <div key={size} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`size-${size}`}
                              aria-label={`حجم ${size}`}
                              checked={productForm.selectedSizes.includes(size)}
                              onChange={() => handleSizeToggle(size)}
                              className="rounded"
                            />
                            <Label htmlFor={`size-${size}`} className="text-sm">{size}</Label>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4">
                        <Label htmlFor="custom-size">حجم مخصص (اختياري)</Label>
                        <Input
                          id="custom-size"
                          value={productForm.customSize}
                          onChange={(e) => setProductForm(prev => ({ ...prev, customSize: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && productForm.customSize.trim()) {
                              const customSize = productForm.customSize.trim();
                              if (!productForm.selectedSizes.includes(customSize)) {
                                setProductForm(prev => ({
                                  ...prev,
                                  selectedSizes: [...prev.selectedSizes, customSize],
                                  customSize: ''
                                }));
                              } else {
                                setProductForm(prev => ({ ...prev, customSize: '' }));
                              }
                            }
                          }}
                          placeholder="أدخل حجم مخصص (مثل: 2.5 لتر، 500 مل، 1 كيلو)"
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">اضغط Enter لإضافة الحجم المخصص</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                    setProductForm({
                      nameAr: '',
                      nameEn: '',
                      description: '',
                      price: '',
                      originalPrice: '',
                      discountPercent: '',
                      images: [],
                      imageUrls: [],
                      sizes: [],
                      selectedSizes: [],
                      category: storeData?.category || 'cleaning',
                      quantity: '',
                      tags: [],
                      badge: '',
                      customSize: ''
                    });
                  }}>
                    إلغاء
                  </Button>
                  <Button onClick={saveProduct} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    {editingProduct ? 'تحديث المنتج' : 'حفظ المنتج'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            العودة
          </Button>

          <div className="flex items-center gap-4">
            {!canComplete && (
              <p className="text-sm text-gray-500">
                يجب إضافة منتج واحد على الأقل
              </p>
            )}
            <Button
              onClick={saveAllData}
              disabled={!canComplete}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              حفظ البيانات والانتهاء
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantProductManagement;
