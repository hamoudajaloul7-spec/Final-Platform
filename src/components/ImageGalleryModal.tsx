import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Eye, Download, Plus, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { getApiBase } from '@/utils/apiConfig';
import { getProxyImageUrl } from '@/utils/assetProxyUtil';

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (imageUrl: string) => void;
  storeSlug?: string;
  allowedExtensions?: string[];
}

interface ImageItem {
  id: string;
  url: string;
  filename: string;
  extension: string;
  size: number;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  isOpen,
  onClose,
  onImageSelect,
  storeSlug = 'indeesh',
  allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'svg']
}) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);

  // Extended image extensions for filtering
  const allImageExtensions = [
    ...allowedExtensions,
    'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'svg',
    'JPG', 'JPEG', 'PNG', 'WEBP', 'GIF', 'BMP', 'TIFF', 'SVG'
  ];

  // Load store data to get existing images
  const loadStoreImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${getApiBase()}/assets/${storeSlug}/store.json`);
      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات المتجر');
      }
      
      const storeData = await response.json();
      const foundImages: ImageItem[] = [];

      // Extract images from products
      if (storeData.products && Array.isArray(storeData.products)) {
        storeData.products.forEach((product: any, productIndex: number) => {
          if (product.images && Array.isArray(product.images)) {
            product.images.forEach((imageUrl: string, imageIndex: number) => {
              const url = imageUrl;
              const filename = url.split('/').pop() || `image-${productIndex}-${imageIndex}`;
              const extension = filename.split('.').pop()?.toLowerCase() || '';
              
              if (allImageExtensions.includes(extension)) {
                foundImages.push({
                  id: `${productIndex}-${imageIndex}`,
                  url,
                  filename,
                  extension,
                  size: 0 // Size would need to be fetched separately
                });
              }
            });
          }
        });
      }

      // Extract slider images
      if (storeData.slider && storeData.slider.images) {
        storeData.slider.images.forEach((imageUrl: string, index: number) => {
          const url = imageUrl;
          const filename = url.split('/').pop() || `slider-${index}`;
          const extension = filename.split('.').pop()?.toLowerCase() || '';
          
          if (allImageExtensions.includes(extension)) {
            foundImages.push({
              id: `slider-${index}`,
              url,
              filename,
              extension,
              size: 0
            });
          }
        });
      }

      setImages(foundImages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل الصور');
    } finally {
      setLoading(false);
    }
  }, [storeSlug]);

  useEffect(() => {
    if (isOpen) {
      loadStoreImages();
    }
  }, [isOpen, loadStoreImages]);

  const filteredImages = images.filter(image =>
    image.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageSelect = (image: ImageItem) => {
    setSelectedImage(image);
  };

  const confirmSelection = () => {
    if (selectedImage) {
      onImageSelect(selectedImage.url);
      onClose();
      setSelectedImage(null);
    }
  };

  const handleDownload = (image: ImageItem) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getImageTypeIcon = (extension: string) => {
    const ext = extension.toLowerCase();
    if (ext === 'svg') return '📐';
    if (ext === 'gif') return '🎭';
    if (ext === 'webp') return '🖼️';
    if (ext === 'bmp') return '🖼️';
    if (ext === 'tiff') return '📸';
    return '🖼️';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-900">
              🖼️ معرض صور المتجر
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Search and Actions */}
        <div className="flex-shrink-0 space-y-4 p-4 border-b">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث في أسماء الملفات أو الروابط..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadStoreImages}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </div>

          {/* Statistics */}
          <div className="text-sm text-gray-600">
            📊 {filteredImages.length} صورة من أصل {images.length} صورة
            {allowedExtensions.length > 0 && (
              <span className="ml-2">
                • الامتدادات المدعومة: {allowedExtensions.join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* Images Grid */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
                <p className="text-gray-500">جارٍ تحميل الصور...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-red-500">
                <p className="mb-4">{error}</p>
                <Button variant="outline" onClick={loadStoreImages}>
                  <RefreshCw className="h-4 w-4 ml-2" />
                  إعادة المحاولة
                </Button>
              </div>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-gray-500">
                <Eye className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg mb-2">لا توجد صور مطابقة</p>
                <p className="text-sm">
                  {images.length === 0 
                    ? 'لم يتم العثور على أي صور في متجر هذا' 
                    : 'حاول البحث بكلمات أخرى'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredImages.map((image) => (
                <Card 
                  key={image.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedImage?.id === image.id
                      ? 'ring-2 ring-blue-500 shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleImageSelect(image)}
                >
                  <CardContent className="p-2">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden relative group">
                      <img
                        src={getProxyImageUrl(image.url)}
                        alt={image.filename}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/assets/default-product.png';
                        }}
                      />
                      
                      {/* File type badge */}
                      <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1 py-0.5 rounded">
                        {getImageTypeIcon(image.extension)}
                      </div>
                      
                      {/* Selection indicator */}
                      {selectedImage?.id === image.id && (
                        <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                          <Plus className="h-3 w-3 transform rotate-45" />
                        </div>
                      )}
                      
                      {/* Hover actions */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(image);
                            }}
                            title="تحميل الصورة"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-900 truncate" title={image.filename}>
                        {image.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        .{image.extension}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {filteredImages.length > 0 && (
          <div className="flex-shrink-0 p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedImage ? (
                  <span className="text-blue-600 font-medium">
                    ✅ صورة مختارة: {selectedImage.filename}
                  </span>
                ) : (
                  <span>اختر صورة من المعرض</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  إلغاء
                </Button>
                <Button
                  onClick={confirmSelection}
                  disabled={!selectedImage}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  استخدام هذه الصورة
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { ImageGalleryModal };