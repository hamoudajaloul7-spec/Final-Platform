import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { storesData } from '@/data/ecommerceData';

interface StoresCarouselProps {
  onStoreClick: (storeSlug: string) => void;
}

interface JsonStoreSummary {
  id: number | string;
  slug: string;
  name: string;
  nameAr?: string;
  description?: string;
  logo?: string;
  categories?: string[];
  status?: string;
}

interface JsonStoreFull extends JsonStoreSummary {
  products?: any[];
  sliders?: any[];
}

const canonicalSlug = (v: any) => {
  const n = (v ?? '').toString().trim().toLowerCase().replace(/\s+/g, '-');
  const alias: Record<string, string> = {
    sherine: 'sheirine',
    sheirin: 'sheirine',
    'delta': 'delta-store',
    'details': 'delta-store',
    'detail': 'delta-store',
    'megna': 'magna-beauty',
    'magna': 'magna-beauty',
    'magna_beauty': 'magna-beauty',
  };
  return alias[n] || n;
};

function getLocalDynamicStores() {
  try {
    const stores: any[] = [];
    const processedSlugs = new Set<string>();

    const getStoreLogoFromStatic = (storeSlug: string): string | null => {
      const staticStore = storesData.find((s) => s.slug === storeSlug);
      return staticStore?.logo || null;
    };

    try {
      const rawStored = localStorage.getItem('eshro_stores');
      const eshroStores = JSON.parse(rawStored || '[]');
      
      // Cleanup Logic: Remove hamoda stores from localStorage if found
      let hasCleanup = false;
      const filteredStores = eshroStores.filter((store: any) => {
        const slug = canonicalSlug(store.subdomain || store.id?.toString());
        if (slug === 'center-hamoda' || slug === 'hamoda-center') {
            hasCleanup = true;
            return false;
        }
        return true;
      });

      if (hasCleanup) {
          localStorage.setItem('eshro_stores', JSON.stringify(filteredStores));
          // Remove specific store files as well
          localStorage.removeItem('eshro_store_files_center-hamoda');
          localStorage.removeItem('store_products_center-hamoda');
          localStorage.removeItem('store_sliders_center-hamoda');
          localStorage.removeItem('eshro_store_files_hamoda-center');
          localStorage.removeItem('store_products_hamoda-center');
          localStorage.removeItem('store_sliders_hamoda-center');
      }

      if (Array.isArray(filteredStores)) {
        for (const store of filteredStores) {
          if (store.setupComplete === true) {
            const rawSlug = store.subdomain || store.id?.toString();
            const slug = canonicalSlug(rawSlug);
            if (slug && !processedSlugs.has(slug)) {
              processedSlugs.add(slug);
              const logo = store.logo && store.logo.trim() !== '' ? store.logo : getStoreLogoFromStatic(slug);
              stores.push({
                id: store.id,
                name: store.nameAr || store.nameEn || slug,
                slug,
                description: store.description || '',
                logo,
                categories: store.categories || [],
                url: `/${slug}`,
                endpoints: {},
                social: {},
                isActive: true,
              });
            }
          }
        }
      }
    } catch {
      // Silently ignore parsing errors
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('eshro_store_files_')) {
        try {
          const storeFiles = JSON.parse(localStorage.getItem(key) || '{}');
          if (storeFiles?.storeData) {
            const s = storeFiles.storeData;
            const rawSlug = s.subdomain || s.storeSlug;
            const slug = canonicalSlug(rawSlug);

            if (slug && !processedSlugs.has(slug)) {
              processedSlugs.add(slug);
              const logo = s.logo && s.logo.trim() !== '' ? s.logo : getStoreLogoFromStatic(slug);
              stores.push({
                id: s.id,
                name: s.nameAr || s.storeName || slug,
                slug,
                description: s.description || '',
                logo,
                categories: s.categories || [],
                url: `/${slug}`,
                endpoints: {},
                social: {},
                isActive: s.status !== 'inactive',
              });
            }
          }
        } catch {
          // Silently ignore parsing errors
        }
      }
    }

    return stores;
  } catch {
    return [];
  }
}

async function fetchJsonStores(): Promise<any[]> {
  try {
    const apiUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL ? import.meta.env.VITE_API_URL : '/api';
    const backendUrl = apiUrl.replace('/api', '');

    try {
      const res = await fetch(`${apiUrl}/stores/list`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json().catch(() => null);
        const stores = json?.data?.stores || json?.stores || [];
        if (Array.isArray(stores) && stores.length > 0) {
          return stores
            .map((s: any) => {
              const slug = canonicalSlug(s.slug || s.storeSlug || s.subdomain || s.name);
              if (!slug) return null;
              return {
                id: s.id || slug,
                name: s.name || s.nameAr || slug,
                slug,
                description: s.description || '',
                logo: s.logo || '/assets/default-store.png',
                categories: s.category ? [s.category] : (s.categories || []),
                url: `/${slug}`,
                endpoints: {},
                social: {},
                isActive: Boolean(s.isActive ?? true),
                source: 'server'
              };
            })
            .filter(Boolean);
        }
      }
    } catch {
    }
    
    let idxRes = await fetch(`${backendUrl}/assets/stores/index.json`, { cache: 'no-store' }).catch(() => null);
    if (!idxRes?.ok) {
      idxRes = await fetch('/assets/stores/index.json', { cache: 'no-store' }).catch(() => null);
    }
    if (!idxRes?.ok) {
      idxRes = await fetch('/index.json', { cache: 'no-store' }).catch(() => null);
      if (!idxRes?.ok) return [];
    }

    const jsonData = await idxRes.json().catch(() => ({ stores: [] }));
    const index: JsonStoreSummary[] = jsonData && jsonData.stores ? jsonData.stores : Array.isArray(jsonData) ? jsonData : [];
    if (!Array.isArray(index) || index.length === 0) return [];

    const getStoreLogoFromStatic = (storeSlug: string): string | null => {
      const staticStore = storesData.find((s) => s.slug === storeSlug);
      return staticStore?.logo || null;
    };

    const jsonStores: any[] = [];
    for (const item of index) {
      const rawSlug = item.slug || (item as any).subdomain || item.name?.toLowerCase().replace(/\s+/g, '-');
      const slug = canonicalSlug(rawSlug);
      if (!slug) continue;
      let sRes = await fetch(`${backendUrl}/assets/${slug}/store.json`, { cache: 'no-store' }).catch(() => null);
      if (!sRes?.ok) {
        sRes = await fetch(`/assets/${slug}/store.json`, { cache: 'no-store' }).catch(() => null);
      }
      if (!sRes?.ok) {
        const logo = item.logo || getStoreLogoFromStatic(slug);
        jsonStores.push({
          id: item.id || slug,
          name: item.name || item.nameAr || slug,
          slug,
          description: item.description || '',
          logo,
          categories: item.categories || [],
          url: `/${slug}`,
          endpoints: {},
          social: {},
          isActive: true,
        });
        continue;
      }

      const s: JsonStoreFull = await sRes.json().catch(() => ({} as any));
      const storeSlug = canonicalSlug((s as any).slug || slug);
      const logo = s.logo || item.logo || getStoreLogoFromStatic(storeSlug);
      jsonStores.push({
        id: (s as any).id || (item as any).id || storeSlug,
        name: (s as any).name || (s as any).nameAr || item.name || storeSlug,
        slug: storeSlug,
        description: s.description || item.description || '',
        logo,
        categories: s.categories || item.categories || [],
        url: `/${storeSlug}`,
        endpoints: {},
        social: {},
        isActive: (s as any).status !== 'inactive',
      });
    }

    return jsonStores;
  } catch {
    return [];
  }
}

const StoresCarousel: React.FC<StoresCarouselProps> = ({ onStoreClick }) => {
  const [dynamicStores, setDynamicStores] = useState<any[]>([]);
  const lastStoresRef = React.useRef<string>('');

  async function loadAll() {
    const jsonStores = await fetchJsonStores();
    const localStores = getLocalDynamicStores();
    
    const map = new Map<string, any>();
    
    if (jsonStores.length > 0) {
      jsonStores.forEach((s) => {
        const slug = canonicalSlug(s.slug);
        if (slug) map.set(slug, { ...s, slug });
      });
    }
    
    if (localStores.length > 0) {
      localStores.forEach((s) => {
        const slug = canonicalSlug(s.slug);
        if (slug && !map.has(slug)) {
          map.set(slug, { ...s, slug });
        }
      });
    }

    const merged = Array.from(map.values());
    const storesJson = JSON.stringify(merged);
    if (storesJson !== lastStoresRef.current) {
      lastStoresRef.current = storesJson;
      setDynamicStores(merged);
    }
  }

  useEffect(() => {
    loadAll();
    const onChange = () => setTimeout(loadAll, 300);
    window.addEventListener('storage', onChange);
    window.addEventListener('storeCreated', onChange as any);
    const interval = setInterval(loadAll, 5000);
    return () => {
      window.removeEventListener('storage', onChange);
      window.removeEventListener('storeCreated', onChange as any);
      clearInterval(interval);
    };
  }, []);

  const allStores = (() => {
    const map = new Map<string, any>();
    const push = (arr: any[]) =>
      arr.forEach((s) => {
        const key = canonicalSlug(s.slug);
        if (!key) return;
        if (!map.has(key)) map.set(key, { ...s, slug: key });
      });
    push(storesData as any[]);
    push(dynamicStores as any[]);
    
    const result = Array.from(map.values());
    
    if (result.length === 0) {
      return (storesData as any[]).map((s) => ({
        ...s,
        slug: canonicalSlug(s.slug),
      }));
    }
    
    return result;
  })();

  const pinFirst = ['nawaem', 'sheirine', 'pretty', 'delta-store', 'magna-beauty', 'indeesh'];
  const orderedStores = [
    ...allStores.filter((s) => pinFirst.includes(canonicalSlug(s.slug))),
    ...allStores.filter((s) => !pinFirst.includes(canonicalSlug(s.slug))),
  ];

  const fallbackLogo = '/default-store.png';

  const stats = [
    { value: '150+', label: 'متجر نشط' },
    { value: '50k+', label: 'منتج متاح' },
    { value: '25k+', label: 'عميل راضٍ' },
    { value: '98%', label: 'معدل الرضا' },
  ];

  return (
    <section className="stores-carousel w-full py-10">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-center">
          <h2 className="text-2xl md:text-3xl font-bold text-emerald-700 text-center">متاجر على منصة إشرو</h2>
        </div>

        {orderedStores.length === 0 ? (
          <div className="w-full h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">لا توجد متاجر لعرضها الآن</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {orderedStores.map((store) => (
              <Card
                key={store.slug}
                className="group cursor-pointer border bg-white/70 backdrop-blur-sm hover:bg-white shadow-sm hover:shadow-2xl hover:ring-1 hover:ring-emerald-200 transition-all duration-300 hover:-translate-y-1 rounded-xl"
                onClick={() => onStoreClick(store.slug)}
              >
                <div className="p-5 flex flex-col items-center text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white border flex items-center justify-center overflow-hidden mb-3 shadow-sm group-hover:shadow-md">
                    <img
                      src={store.logo || fallbackLogo}
                      alt=""
                      role="presentation"
                      aria-hidden="true"
                      loading="lazy"
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackLogo;
                      }}
                    />
                  </div>
                  <h3 className="text-sm md:text-base font-semibold line-clamp-1 text-slate-800 group-hover:text-emerald-700 transition-colors">
                    {store.name}
                  </h3>
                  {store.description ? (
                    <p className="text-[11px] md:text-xs text-gray-500 line-clamp-2 mt-1">{store.description}</p>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto justify-items-center">
            {stats.map((s, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl border bg-white p-5 text-center shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group"
                role="region"
                aria-label={s.label}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-emerald-500 to-green-600"></div>
                <div className="relative">
                  <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 group-hover:text-white transform transition-transform duration-300 group-hover:scale-110">
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs md:text-sm text-gray-600 group-hover:text-white/90">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoresCarousel;
