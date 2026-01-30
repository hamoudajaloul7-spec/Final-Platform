import React, { useState, useRef } from 'react';
import { Camera, Loader2, Search, Upload, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import OpenAI from 'openai';
import { getProxyImageUrl } from '@/utils/assetProxyUtil';
import { allStoreProducts } from '@/data/allStoreProducts';
import { storesData } from '@/data/ecommerceData';
import type { Product } from '@/data/storeProducts';

interface SearchResult {
  product: Product;
  similarity: number;
  matchedFeatures: string[];
  storeName: string;
}

const storeNameMap = new Map(storesData.map(store => [store.id, store.name] as const));

const SearchComponent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'your-openai-api-key-here',
    dangerouslyAllowBrowser: true
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const analyzeImageWithAI = async (imageBase64: string): Promise<string[]> => {
    try {
      setIsAnalyzing(true);

      // Remove data URL prefix for OpenAI API
      const base64Image = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image and describe the product in detail. Include: category, color, style, material, brand if visible, and any distinctive features. Be specific and detailed."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 300
      });

      const analysis = response.choices[0]?.message?.content || '';


      // Extract keywords from the analysis
      const keywords = extractKeywordsFromAnalysis(analysis);
      return keywords;

    } catch (error) {

      return [];
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractKeywordsFromAnalysis = (analysis: string): string[] => {
    // Simple keyword extraction - in production, you might use NLP libraries
    const keywords: string[] = [];

    // Common product categories and attributes
    const categoryKeywords = [
      'shirt', 'dress', 'pants', 'shoes', 'bag', 'watch', 'jewelry', 'electronics',
      'phone', 'laptop', 'book', 'furniture', 'cosmetics', 'perfume', 'toy'
    ];

    const colorKeywords = [
      'red', 'blue', 'green', 'black', 'white', 'yellow', 'purple', 'pink', 'gray',
      'brown', 'orange', 'navy', 'beige', 'gold', 'silver'
    ];

    const materialKeywords = [
      'cotton', 'wool', 'leather', 'silk', 'denim', 'nylon', 'polyester', 'metal'
    ];

    const styleKeywords = [
      'casual', 'formal', 'sport', 'vintage', 'modern', 'classic', 'elegant'
    ];

    const lowerAnalysis = analysis.toLowerCase();

    // Extract matching keywords
    [...categoryKeywords, ...colorKeywords, ...materialKeywords, ...styleKeywords]
      .forEach(keyword => {
        if (lowerAnalysis.includes(keyword)) {
          keywords.push(keyword);
        }
      });

    return [...new Set(keywords)]; // Remove duplicates
  };

  const searchProducts = async () => {
    if (!searchQuery.trim() && !uploadedImage) return;

    setIsSearching(true);
    let searchKeywords: string[] = [];

    try {
      if (uploadedImage) {
        // Analyze image first
        searchKeywords = await analyzeImageWithAI(uploadedImage);
      }

      // Add text search keywords
      if (searchQuery.trim()) {
        searchKeywords.push(...searchQuery.toLowerCase().split(' '));
      }

      // Search products based on keywords
      const results: SearchResult[] = [];

      allStoreProducts.forEach(product => {
        const storeName = storeNameMap.get(product.storeId) ?? '';
        const productText = `${product.name} ${product.category} ${storeName}`.toLowerCase();
        const matchedFeatures: string[] = [];
        let similarity = 0;

        searchKeywords.forEach(keyword => {
          if (productText.includes(keyword)) {
            matchedFeatures.push(keyword);
            similarity += 0.2; // Increase similarity for each match
          }
        });

        if (matchedFeatures.some(feature => product.category.toLowerCase().includes(feature))) {
          similarity += 0.3;
        }

        if (similarity > 0) {
          results.push({
            product,
            similarity: Math.min(similarity, 1),
            matchedFeatures,
            storeName
          });
        }
      });

      // Sort by similarity and limit results
      const sortedResults = results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 20);

      setSearchResults(sortedResults);

    } catch (error) {

    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      searchProducts();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            حر ابحث اتد
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Text Search */}
          <div className="flex gap-2">
            <Input
              placeholder="ابحث ع تج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={searchProducts}
              disabled={isSearching || isAnalyzing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Image Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              {uploadedImage ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="max-w-xs max-h-48 rounded-lg shadow-md"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0 text-red-600 hover:text-red-700"
                      onClick={removeImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    {isAnalyzing ? 'جار تح اصرة...' : 'ت رفع اصرة بجاح'}
                  </p>
                  {isAnalyzing && (
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Camera className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      ابحث باصرة
                    </p>
                    <p className="text-sm text-gray-600">
                      ارفع صرة تج اذ تبحث ع
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    اختر صرة
                  </Button>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              aria-label="رفع صرة بحث"
              id="image-upload-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>تائج ابحث ({searchResults.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map(result => (
                <div key={result.product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="aspect-square mb-3">
                    <img
                      src={getProxyImageUrl(result.product.images[0] ?? '', result.product.storeSlug, 'products')}
                      alt={result.product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm line-clamp-2">
                      {result.product.name}
                    </h3>
                    <p className="text-lg font-bold text-green-600">
                      {result.product.price} د.
                    </p>
                    <p className="text-sm text-gray-600">{result.storeName}</p>
                    <div className="flex flex-wrap gap-1">
                      {result.matchedFeatures.slice(0, 3).map(feature => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>دة اتطاب: {Math.round(result.similarity * 100)}%</span>
                      {result.product.rating > 0 && (
                        <span>⭐ {result.product.rating}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {searchResults.length === 0 && !isSearching && (searchQuery || uploadedImage) && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
               ت اعثر ع تائج
            </h3>
            <p className="text-gray-600">
              جرب ات بحث ختفة أ صرة أخر
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchComponent;
