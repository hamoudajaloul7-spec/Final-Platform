import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Sliders,
  Plus,
  Edit,
  Trash2,
  Upload,
  Image as ImageIcon,
  Eye,
  Save,
  X,
  Move,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Download,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Camera,
  RefreshCw,
  Wifi,
  WifiOff,
  RotateCw
} from 'lucide-react';
import { 
  SliderImage, 
  storageManager, 
  syncManager,
  showNotification, 
  showSyncNotification,
  type SyncEvent 
} from '@/utils/sliderIntegration';
import { getApiBase, getApiUrl } from '@/utils/apiConfig';

interface MerchantSliderManagementProps {
  storeSlug: string;
  onSliderUpdate?: (sliders: SliderImage[]) => void;
}

const MerchantSliderManagement: React.FC<MerchantSliderManagementProps> = ({
  storeSlug,
  onSliderUpdate
}) => {
  const [sliders, setSliders] = useState<SliderImage[]>([]);
  const [selectedSlider, setSelectedSlider] = useState<SliderImage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'connected' | 'disconnected' | 'syncing'>('connected');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSliders();
    setupSyncListeners();
    
    return () => {
      // Cleanup listeners
    };
  }, [storeSlug]);

  const loadSliders = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus('syncing');
      
      let loadedSliders: SliderImage[] = [];
      const apiBase = getApiBase();
      
      try {
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/sliders/store/${storeSlug}`);
        
        if (response.ok) {
          const result = await response.json();
          if (result.data && Array.isArray(result.data)) {
            loadedSliders = result.data.map((slider: any) => ({
              id: slider.id || slider.metadata?.id || Date.now().toString(),
              title: slider.title || '',
              subtitle: slider.subtitle || '',
              buttonText: slider.buttonText || 'تسوق الآن',
              imageUrl: slider.imagePath || slider.image || '/assets/default-slider.png',
              isActive: slider.metadata?.isActive !== false,
              order: slider.sortOrder || 0,
              createdAt: slider.createdAt || new Date().toISOString(),
              updatedAt: slider.updatedAt || new Date().toISOString(),
              metadata: {
                serverId: slider.id,
                ...slider.metadata
              }
            }));
            
            storageManager.saveStoreSliders(storeSlug, loadedSliders);
            
            // Prepend apiBase for rendering
            const rendered = loadedSliders.map(s => ({
              ...s,
              imageUrl: (s.imageUrl && !s.imageUrl.startsWith('http')) ? apiBase + s.imageUrl : s.imageUrl
            }));
            
            setSliders(rendered);
            setSyncStatus('connected');
            return;
          }
        }
      } catch (apiError) {
        console.error('Error fetching sliders from API:', apiError);
      }
      
      loadedSliders = storageManager.loadStoreSliders(storeSlug);
      
      // Prepend apiBase for rendering
      const renderedFromStorage = loadedSliders.map(s => ({
        ...s,
        imageUrl: (s.imageUrl && !s.imageUrl.startsWith('http')) ? apiBase + s.imageUrl : s.imageUrl
      }));
      
      setSliders(renderedFromStorage);
      setSyncStatus('connected');

    } catch (error) {
      console.error('Error loading sliders:', error);
      setSyncStatus('disconnected');
      showNotification('فشل في تحميل السلايدرز', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const saveSliders = async (updatedSliders: SliderImage[]) => {
    try {
      setIsSaving(true);
      setIsSyncing(true);
      setSyncStatus('syncing');
      
      const success = storageManager.saveStoreSliders(storeSlug, updatedSliders);
      
      if (success) {
        setSliders(updatedSliders);
        onSliderUpdate?.(updatedSliders);
        
        try {
          const apiUrl = getApiUrl();
          for (const slider of updatedSliders) {
            const serverId = slider.metadata?.serverId;
            const isDataUrl = slider.imageUrl?.startsWith('data:');
            
            const sliderData = {
              title: slider.title,
              subtitle: slider.subtitle,
              buttonText: slider.buttonText,
              imagePath: isDataUrl ? undefined : slider.imageUrl,
              sortOrder: slider.order,
              metadata: {
                id: slider.id,
                isActive: slider.isActive,
                createdAt: slider.createdAt,
                updatedAt: slider.updatedAt
              }
            };

            if (serverId) {
              await fetch(`${apiUrl}/sliders/store/${storeSlug}/${serverId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sliderData)
              });
            } else {
              const response = await fetch(`${apiUrl}/sliders/store/${storeSlug}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sliderData)
              });
              if (response.ok) {
                const result = await response.json();
                if (result.data?.id) {
                  slider.metadata = slider.metadata || {};
                  slider.metadata.serverId = result.data.id;
                }
              }
            }
          }
          
          storageManager.saveStoreSliders(storeSlug, updatedSliders);
          
          window.dispatchEvent(new CustomEvent('storeSlidersUpdated', {
            detail: { storeSlug, sliders: updatedSliders }
          }));
        } catch (apiError) {
          console.error('Error syncing sliders to backend:', apiError);
        }
        
        setSyncStatus('connected');
        showSyncNotification(storeSlug, 'slider_update', true);

      } else {
        throw new Error('Save operation failed');
      }
    } catch (error) {

      setSyncStatus('disconnected');
      showSyncNotification(storeSlug, 'slider_update', false);
    } finally {
      setIsSaving(false);
      setIsSyncing(false);
    }
  };

  const setupSyncListeners = () => {
    const handleGlobalSync = (event?: SyncEvent) => {
      if (event && event.storeSlug === storeSlug && event.type === 'slider_update') {

        setSliders(event.data);
        setSyncStatus('connected');
        showNotification('تم تحديث السلايدرز من متجرك', 'info', {
          storeSlug,
          duration: 2000
        });
      }
    };

    const handleRetrySync = (event: any) => {
      if (event.detail.storeSlug === storeSlug) {
        loadSliders();
      }
    };

    const cleanupGlobalSync = syncManager.on('global_sync', handleGlobalSync);
    window.addEventListener('retrySync', handleRetrySync as EventListener);

    storageManager.enableAutoSync(storeSlug);

    return () => {
      cleanupGlobalSync();
      window.removeEventListener('retrySync', handleRetrySync as EventListener);
      storageManager.disableAutoSync(storeSlug);
    };
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, sliderId?: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صحيح');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    try {
      setIsSaving(true);
      
      const formData = new FormData();
      formData.append('sliderImage_0', file);
      
      const apiUrl = getApiUrl();
      const uploadResponse = await fetch(`${apiUrl}/stores/${storeSlug}/upload-slider-image`, {
        method: 'POST',
        body: formData
      });
      
      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();
        const imageUrl = uploadResult.data?.imagePath || `/assets/sliders/${uploadResult.data?.filename}`;
        
        if (sliderId) {
          const updatedSliders = sliders.map(slider =>
            slider.id === sliderId 
              ? { ...slider, imageUrl, updatedAt: new Date().toISOString() }
              : slider
          );
          saveSliders(updatedSliders);
          showNotification('تم تحميل الصورة بنجاح', 'success');
        }
      } else {
        showNotification('فشل تحميل الصورة على الخادم. الرجاء المحاولة مرة أخرى.', 'error');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showNotification('حدث خطأ في تحميل الصورة', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const addNewSlider = () => {
    const newSlider: SliderImage = {
      id: Date.now().toString(),
      title: '',
      subtitle: '',
      buttonText: 'تسوق الآن',
      imageUrl: '/assets/default-slider.png',
      isActive: true,
      order: sliders.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedSliders = [...sliders, newSlider];
    saveSliders(updatedSliders);
    setSelectedSlider(newSlider);
    setIsEditing(true);
  };

  const updateSlider = (updatedSlider: SliderImage) => {
    const updatedSliders = sliders.map(slider =>
      slider.id === updatedSlider.id 
        ? { ...updatedSlider, updatedAt: new Date().toISOString() }
        : slider
    );
    saveSliders(updatedSliders);
  };

  const deleteSlider = (sliderId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السلايدر؟')) {
      const updatedSliders = sliders.filter(slider => slider.id !== sliderId);
      saveSliders(updatedSliders);
      setSelectedSlider(null);
      setIsEditing(false);
    }
  };

  const toggleSliderStatus = (sliderId: string) => {
    const updatedSliders = sliders.map(slider =>
      slider.id === sliderId 
        ? { ...slider, isActive: !slider.isActive, updatedAt: new Date().toISOString() }
        : slider
    );
    saveSliders(updatedSliders);
  };

  const moveSlider = (sliderId: string, direction: 'up' | 'down') => {
    const currentIndex = sliders.findIndex(s => s.id === sliderId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sliders.length) return;

    const updatedSliders = [...sliders];
    const movedSlider = updatedSliders.splice(currentIndex, 1)[0];
    if (movedSlider) {
      updatedSliders.splice(newIndex, 0, movedSlider);
      
      updatedSliders.forEach((slider, index) => {
        slider.order = index + 1;
      });
      
      saveSliders(updatedSliders);
    }
  };

  const duplicateSlider = (sliderId: string) => {
    const original = sliders.find(s => s.id === sliderId);
    if (!original) return;

    const duplicated: SliderImage = {
      ...original,
      id: Date.now().toString(),
      title: `${original.title} (نسخة)`,
      order: sliders.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedSliders = [...sliders, duplicated];
    saveSliders(updatedSliders);
  };

  const resetToDefaults = () => {
    if (window.confirm('هل تريد إعادة تعيين السلايدرز للقيم الافتراضية؟ سيتم فقدان جميع التغييرات.')) {
      const defaultSliders = [
        {
          id: '1',
          title: 'مرحباً بك في متجرنا',
          subtitle: 'اكتشف مجموعتنا المميزة من المنتجات',
          buttonText: 'تسوق الآن',
          imageUrl: '/assets/default-slider.png',
          isActive: true,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      saveSliders(defaultSliders);
      setSelectedSlider(null);
      setIsEditing(false);
    }
  };

  const exportSliders = () => {
    const dataStr = JSON.stringify(sliders, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${storeSlug}-sliders-backup.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const activeSlidersCount = sliders.filter(s => s.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sliders className="h-6 w-6" />
            إدارة السلايدرز
          </h2>
          <p className="text-gray-600 mt-1">
            إدارة صور السلايدر الرئيسية لمتجر <strong>{storeSlug}</strong>
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
            syncStatus === 'connected' ? 'bg-green-100 text-green-800' :
            syncStatus === 'syncing' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            {syncStatus === 'syncing' ? (
              <RotateCw className="h-3 w-3 animate-spin" />
            ) : syncStatus === 'connected' ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {syncStatus === 'syncing' ? 'جاري المزامنة' :
             syncStatus === 'connected' ? 'متصل' : 'غير متصل'}
          </div>
          
          <Button onClick={loadSliders} variant="outline" size="sm" disabled={isSyncing}>
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => setShowPreview(true)} variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          معاينة
        </Button>
        <Button onClick={exportSliders} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          تصدير
        </Button>
        <Button onClick={resetToDefaults} variant="outline" className="text-orange-600">
          <RotateCcw className="h-4 w-4 mr-2" />
          إعادة تعيين
        </Button>
        <Button onClick={addNewSlider} className="bg-primary hover:bg-primary/90" disabled={isSaving}>
          <Plus className="h-4 w-4 mr-2" />
          إضافة سلايدر جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي السلايدرز</p>
                <p className="text-2xl font-bold">{sliders.length}</p>
              </div>
              <Sliders className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">السلايدرز المفعلة</p>
                <p className="text-2xl font-bold text-green-600">{activeSlidersCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">آخر تحديث</p>
                <p className="text-sm font-medium">
                  {sliders.length > 0 
                    ? new Date(Math.max(...sliders.map(s => new Date(s.updatedAt).getTime()))).toLocaleDateString('ar-LY')
                    : 'لا يوجد'
                  }
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة السلايدرز</CardTitle>
        </CardHeader>
        <CardContent>
          {sliders.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد سلايدرز حالياً</p>
              <Button onClick={addNewSlider} className="mt-4">
                إضافة أول سلايدر
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sliders
                .sort((a, b) => a.order - b.order)
                .map((slider, index) => (
                <div
                  key={slider.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    slider.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                  } ${selectedSlider?.id === slider.id ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {slider.imageUrl ? (
                        <img
                          src={slider.imageUrl}
                          alt={slider.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/default-slider.png';
                          }}
                        />
                      ) : (
                        <Camera className="h-6 w-6 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{slider.title || 'بدون عنوان'}</h4>
                        <Badge variant={slider.isActive ? 'default' : 'secondary'}>
                          {slider.isActive ? 'مفعل' : 'معطل'}
                        </Badge>
                        <Badge variant="outline">الترتيب: {slider.order}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {slider.subtitle || 'بدون وصف'}
                      </p>
                      <p className="text-xs text-gray-500">
                        آخر تحديث: {new Date(slider.updatedAt).toLocaleDateString('ar-LY')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedSlider(slider);
                          setIsEditing(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSliderStatus(slider.id)}
                      >
                        {slider.isActive ? <Eye className="h-4 w-4" /> : <Eye className="h-4 w-4 text-gray-400" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveSlider(slider.id, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveSlider(slider.id, 'down')}
                        disabled={index === sliders.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => duplicateSlider(slider.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSlider(slider.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, slider.id)}
                      aria-label={`رفع صورة للسلايدر ${slider.title}`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      تغيير الصورة
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isEditing && selectedSlider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">تعديل السلايدر</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedSlider(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">العنوان</label>
                  <Input
                    value={selectedSlider.title}
                    onChange={(e) => setSelectedSlider({
                      ...selectedSlider,
                      title: e.target.value
                    })}
                    placeholder="أدخل عنوان السلايدر"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">الوصف</label>
                  <Textarea
                    value={selectedSlider.subtitle}
                    onChange={(e) => setSelectedSlider({
                      ...selectedSlider,
                      subtitle: e.target.value
                    })}
                    placeholder="أدخل وصف السلايدر"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">نص الزر</label>
                  <Input
                    value={selectedSlider.buttonText}
                    onChange={(e) => setSelectedSlider({
                      ...selectedSlider,
                      buttonText: e.target.value
                    })}
                    placeholder="تسوق الآن"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={selectedSlider.isActive}
                    onChange={(e) => setSelectedSlider({
                      ...selectedSlider,
                      isActive: e.target.checked
                    })}
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    تفعيل هذا السلايدر
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedSlider(null);
                  }}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={() => {
                    updateSlider(selectedSlider);
                    setIsEditing(false);
                    setSelectedSlider(null);
                  }}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  حفظ التغييرات
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">معاينة السلايدرز</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {sliders.filter(s => s.isActive).length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">لا توجد سلايدرز مفعلة للعرض</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sliders
                      .filter(s => s.isActive)
                      .sort((a, b) => a.order - b.order)
                      .map((slider) => (
                      <div key={slider.id} className="border rounded-lg overflow-hidden">
                        <img
                          src={slider.imageUrl}
                          alt={slider.title}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/default-slider.png';
                          }}
                        />
                        <div className="p-4">
                          <h4 className="font-semibold text-lg">{slider.title}</h4>
                          <p className="text-gray-600 mb-2">{slider.subtitle}</p>
                          <Button size="sm">{slider.buttonText}</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantSliderManagement;
