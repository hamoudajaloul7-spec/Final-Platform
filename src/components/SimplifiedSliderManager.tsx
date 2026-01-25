import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Upload,
  Save,
  X,
  Eye,
  Percent,
  Loader
} from 'lucide-react';
import { getApiUrl } from '@/utils/apiConfig';

interface SliderData {
  id: string;
  imageUrl?: string;
  imagePath?: string;
  title: string;
  subtitle?: string;
  discount?: string;
  buttonText?: string;
  sortOrder?: number;
  order?: number;
}

interface SimplifiedSliderManagerProps {
  storeSlug: string;
  currentMerchant?: any;
}

const SimplifiedSliderManager: React.FC<SimplifiedSliderManagerProps> = ({
  storeSlug,
  currentMerchant
}) => {
  const [sliders, setSliders] = useState<SliderData[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSlider, setSelectedSlider] = useState<SliderData | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    subtitle: '',
    discount: '',
    buttonText: '',
    imageUrl: ''
  });
  const [createForm, setCreateForm] = useState({
    title: '',
    subtitle: '',
    discount: '',
    buttonText: '',
    imageUrl: ''
  });
  const [selectedForDeletion, setSelectedForDeletion] = useState<Set<string>>(new Set());
  const [showDeleteMode, setShowDeleteMode] = useState(false);
  const [loading, setLoading] = useState(false);
const fileInputRef = useRef<HTMLInputElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const [storeData, setStoreData] = useState<any>(null);

  useEffect(() => {
    if (!storeSlug) return;
    if (currentMerchant?.id) {
      setStoreData({ id: currentMerchant.id });
    }
  }, [storeSlug, currentMerchant]);

  const storeId = storeSlug || currentMerchant?.storeSlug || currentMerchant?.slug || storeData?.slug || storeData?.id || currentMerchant?.id;

  useEffect(() => {
    if (storeId) {
      loadSliders();
    }
  }, [storeId]);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [currentSlideIndex, sliders.length, isEditing, showDeleteMode, isCreating]);
  const loadSliders = async () => {
    if (!storeId) {
      showNotification('معرف المتجر غير صحيح', 'error');
      return;
    }

    if (typeof storeId !== 'string' && typeof storeId !== 'number') {
      showNotification('معرف المتجر بصيغة غير صحيحة', 'error');
      return;
    }

    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/sliders/store/${storeId}`);
      if (response.ok) {
        const result = await response.json();
        const formattedSliders = result.data.map((slider: any) => ({
          id: slider.id,
          imageUrl: slider.imagePath,
          imagePath: slider.imagePath,
          title: slider.title,
          subtitle: slider.subtitle || '',
          discount: slider.metadata?.discount || '',
          buttonText: slider.buttonText || '',
          sortOrder: slider.sortOrder || 0,
          order: slider.sortOrder || 0
        }));
        setSliders(formattedSliders);
        broadcastSliderUpdate(formattedSliders);
      } else {
        const errorData = await response.json().catch(() => ({}));
        showNotification(`خطأ تحميل السلايدرز: ${errorData.message || response.statusText}`, 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      showNotification(`فشل تحميل السلايدرز: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const broadcastSliderUpdate = (slidersToSync?: SliderData[]) => {
    const dataToSync = slidersToSync || sliders;
    const storageKey = `eshro_sliders_${storeSlug}`;
    localStorage.setItem(storageKey, JSON.stringify(dataToSync));
    window.dispatchEvent(new CustomEvent('storeSliderUpdated', {
      detail: { storeSlug, sliders: dataToSync }
    }));
  };

  const createSlider = async () => {
    if (!createForm.title.trim()) {
      showNotification('يرجى إدخال النص الدعائي الرئيسي', 'error');
      return;
    }

    if (!createForm.imageUrl) {
      showNotification('يرجى اختيار صورة', 'error');
      return;
    }

    if (!storeId) {
      showNotification('معرف المتجر غير صحيح', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: createForm.title,
        subtitle: createForm.subtitle || undefined,
        buttonText: createForm.buttonText || undefined,
        imagePath: createForm.imageUrl,
        metadata: { discount: createForm.discount || '0' }
      };

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/sliders/store/${storeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showNotification('تم إضافة السلايدر بنجاح', 'success');
        await loadSliders();
        closeCreateDialog();
      } else {
        const errorData = await response.json().catch(() => ({}));
        showNotification(`فشل الإضافة: ${errorData.message || response.statusText}`, 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      showNotification(`حدث خطأ أثناء إضافة السلايدر: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    if (sliders.length > 1 && !isEditing && !showDeleteMode && !isCreating) {
      autoPlayRef.current = setTimeout(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % sliders.length);
      }, 5000);
    }
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearTimeout(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  };

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % sliders.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + sliders.length) % sliders.length);
  };

const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, forEdit: boolean = false) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showNotification('يرجى اختيار ملف صورة صحيح', 'error');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showNotification('حجم الصورة يجب أن يكون أقل من 5 ميجابايت', 'error');
    return;
  }

  try {
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    
    const apiUrl = getApiUrl();
    const uploadResponse = await fetch(`${apiUrl}/sliders/store/${storeId}/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (uploadResponse.ok) {
      const uploadResult = await uploadResponse.json();
      const imagePath = uploadResult.data?.imagePath || `/assets/${storeId}/sliders/${uploadResult.data?.filename}`;
      
      if (forEdit) {
        setEditForm({ ...editForm, imageUrl: imagePath });
      } else {
        setCreateForm({ ...createForm, imageUrl: imagePath });
      }
      showNotification('تم تحميل الصورة بنجاح', 'success');
    } else {
      showNotification('فشل تحميل الصورة', 'error');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    showNotification(`خطأ في تحميل الصورة: ${errorMessage}`, 'error');
  } finally {
    setLoading(false);
  }
};

  const openEditDialog = (slider: SliderData) => {
    stopAutoPlay();
    setSelectedSlider(slider);
    setEditForm({
      title: slider.title,
      subtitle: slider.subtitle || '',
      discount: slider.discount || '',
      buttonText: slider.buttonText || '',
      imageUrl: slider.imageUrl || ''
    });
    setIsEditing(true);
  };

  const closeCreateDialog = () => {
    setIsCreating(false);
    setCreateForm({ title: '', subtitle: '', discount: '', buttonText: '', imageUrl: '' });
    startAutoPlay();
  };

  const saveEdit = async () => {
    if (!selectedSlider) return;

    if (!editForm.title.trim()) {
      showNotification('يرجى إدخال العنوان', 'error');
      return;
    }

    if (!storeId) {
      showNotification('معرف المتجر غير صحيح', 'error');
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        title: editForm.title,
        subtitle: editForm.subtitle || undefined,
        buttonText: editForm.buttonText || undefined,
        imagePath: editForm.imageUrl || selectedSlider.imageUrl,
        metadata: { discount: editForm.discount }
      };

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/sliders/store/${storeId}/${selectedSlider.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        showNotification('تم تحديث السلايدر بنجاح', 'success');
        await loadSliders();
        closeEditDialog();
      } else {
        const errorData = await response.json().catch(() => ({}));
        showNotification(`فشل التحديث: ${errorData.message || response.statusText}`, 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      showNotification(`حدث خطأ أثناء الحفظ: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const closeEditDialog = () => {
    setIsEditing(false);
    setSelectedSlider(null);
    setEditForm({ title: '', subtitle: '', discount: '', buttonText: '', imageUrl: '' });
    startAutoPlay();
  };

  const toggleDeleteSelection = (id: string) => {
    const newSelection = new Set(selectedForDeletion);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedForDeletion(newSelection);
  };

  const executeDelete = async () => {
    if (selectedForDeletion.size === 0) {
      showNotification('يرجى اختيار صور للحذف', 'error');
      return;
    }

    if (!storeId) {
      showNotification('معرف المتجر غير صحيح', 'error');
      return;
    }

    if (!window.confirm(`هل أنت متأكد من حذف ${selectedForDeletion.size} صورة؟`)) {
      return;
    }

    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/sliders/store/${storeId}/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sliderIds: Array.from(selectedForDeletion) })
      });

      if (response.ok) {
        showNotification('تم الحذف بنجاح', 'success');
        setSelectedForDeletion(new Set());
        setShowDeleteMode(false);
        await loadSliders();
        broadcastSliderUpdate();
      } else {
        const errorData = await response.json().catch(() => ({}));
        showNotification(`فشل الحذف: ${errorData.message || response.statusText}`, 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      showNotification(`حدث خطأ أثناء الحذف: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 5000);
  };

  if (!storeId) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center text-gray-500">
          <p>لم يتم تحديد المتجر</p>
        </div>
      </div>
    );
  }

  if (sliders.length === 0 && !isCreating) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">إدارة السلايدرز</h2>
          <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة سلايدر
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, false)}
            className="hidden"
            title="اختر صورة السلايدر"
          />
        </div>
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <p>لا توجد سلايدرات حالياً</p>
            <Button onClick={() => fileInputRef.current?.click()} className="mt-4">
              إضافة سلايدر أول
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentSlider = sliders[currentSlideIndex];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">إدارة السلايدرز</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowDeleteMode(!showDeleteMode)}
            variant={showDeleteMode ? 'destructive' : 'outline'}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {showDeleteMode ? 'إلغاء الحذف' : 'وضع الحذف'}
          </Button>
          {showDeleteMode && selectedForDeletion.size > 0 && (
            <Button onClick={executeDelete} variant="destructive" className="gap-2">
              حذف ({selectedForDeletion.size})
            </Button>
          )}
          <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة سلايدر
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, false)}
            className="hidden"
            title="اختر صورة السلايدر"
          />
        </div>
      </div>

      {isCreating && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">سلايدر جديد</h3>
              {createForm.imageUrl && (
                <img src={createForm.imageUrl} alt="preview" className="w-full h-64 object-cover rounded-lg" />
              )}
              <Input
                placeholder="العنوان الرئيسي"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              />
              <Input
                placeholder="العنوان الفرعي"
                value={createForm.subtitle}
                onChange={(e) => setCreateForm({ ...createForm, subtitle: e.target.value })}
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="نسبة الخصم"
                  value={createForm.discount}
                  onChange={(e) => setCreateForm({ ...createForm, discount: e.target.value })}
                  className="flex-1"
                />
                <span className="flex items-center text-gray-500">%</span>
              </div>
              <Input
                placeholder="نص الزر"
                value={createForm.buttonText}
                onChange={(e) => setCreateForm({ ...createForm, buttonText: e.target.value })}
              />
              <div className="flex gap-2">
                <Button onClick={createSlider} className="flex-1 gap-2" disabled={loading}>
                  {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  حفظ
                </Button>
                <Button onClick={closeCreateDialog} variant="outline" className="flex-1">
                  إلغاء
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {sliders.length > 0 && currentSlider && (
        <Card>
          <CardContent className="pt-6">
            <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden mb-4">
              {currentSlider.imageUrl && (
                <img
                  src={currentSlider.imageUrl}
                  alt={currentSlider.title}
                  className="w-full h-full object-cover"
                />
              )}
              {sliders.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition"
                    title="السلايدر السابق"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition"
                    title="السلايدر التالي"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <h3 className="font-semibold text-lg">{currentSlider.title}</h3>
              {currentSlider.subtitle && (
                <p className="text-gray-600">{currentSlider.subtitle}</p>
              )}
              {currentSlider.discount && (
                <p className="text-red-600 font-semibold">خصم {currentSlider.discount}%</p>
              )}
            </div>

            <div className="flex gap-2 mb-4">
              <Button
                onClick={() => openEditDialog(currentSlider)}
                variant="outline"
                className="flex-1 gap-2"
              >
                <Edit className="h-4 w-4" />
                تعديل
              </Button>
              {showDeleteMode && (
                <Button
                  onClick={() => toggleDeleteSelection(currentSlider.id)}
                  variant={selectedForDeletion.has(currentSlider.id) ? 'destructive' : 'outline'}
                  className="flex-1"
                >
                  {selectedForDeletion.has(currentSlider.id) ? '✓ محدد' : 'تحديد للحذف'}
                </Button>
              )}
            </div>

            {sliders.length > 1 && (
              <div className="flex gap-1 justify-center">
                {sliders.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlideIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlideIndex
                        ? 'bg-blue-600 w-8'
                        : 'bg-gray-300 w-2 hover:bg-gray-400'
                    }`}
                    title="انتقل للصورة"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isEditing && selectedSlider && (
        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">تعديل السلايدر</h3>
              {editForm.imageUrl && (
                <img src={editForm.imageUrl} alt="preview" className="w-full h-64 object-cover rounded-lg" />
              )}
              <Input
                placeholder="العنوان الرئيسي"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
              <Input
                placeholder="العنوان الفرعي"
                value={editForm.subtitle}
                onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="نسبة الخصم"
                  value={editForm.discount}
                  onChange={(e) => setEditForm({ ...editForm, discount: e.target.value })}
                  className="flex-1"
                />
                <span className="flex items-center text-gray-500">%</span>
              </div>
              <Input
                placeholder="نص الزر"
                value={editForm.buttonText}
                onChange={(e) => setEditForm({ ...editForm, buttonText: e.target.value })}
              />
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full gap-2">
                <Upload className="h-4 w-4" />
                تغيير الصورة
              </Button>
              <div className="flex gap-2">
                <Button onClick={saveEdit} className="flex-1 gap-2" disabled={loading}>
                  {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  حفظ التعديلات
                </Button>
                <Button onClick={closeEditDialog} variant="outline" className="flex-1">
                  إلغاء
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SimplifiedSliderManager;
