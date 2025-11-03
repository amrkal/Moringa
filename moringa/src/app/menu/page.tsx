'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { getLocalizedText } from '@/lib/i18n';
import api from '@/lib/api';
// Using native <img> for resilience with unknown external URLs; avoids next/image domain config errors
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import MealCustomizeModal, { MealForCustomize } from '@/components/MealCustomizeModal';


interface Translation { en?: string; ar?: string; he?: string }

interface Category {
  _id?: string;
  id?: string;
  name: Translation | string;
  description?: Translation | string;
  image_url?: string;
}

interface Meal {
  _id?: string;
  id?: string;
  name: Translation | string;
  description?: Translation | string;
  price: number;
  category_id: string;
  image_url?: string;
  is_available: boolean;
  ingredients?: any[];
}

export default function MenuPage() {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeMeal, setActiveMeal] = useState<MealForCustomize | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const tabsOffset = 120; // header + tabs height approx
  const itemCount = useCartStore((s) => s.getItemCount());
  const totalAmount = useCartStore((s) => s.getTotalAmount());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, mealsRes] = await Promise.all([
        api.get('/categories/'),
        api.get('/meals/'),
      ]);

      const extract = (data: any) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.items)) return data.items;
        if (Array.isArray(data?.results)) return data.results;
        if (Array.isArray(data?.data)) return data.data;
        return [] as any[];
      };

      const normalizeCategory = (c: any): Category => ({
        _id: c._id || c.id || c?._id?.$oid || undefined,
        id: c.id || c._id || c?._id?.$oid || undefined,
        name: c.name && typeof c.name === 'object'
          ? { en: c.name?.en ?? c.name_en ?? c.name ?? '', ar: c.name?.ar ?? c.name_ar ?? '', he: c.name?.he ?? c.name_he ?? '' }
          : { en: c.name_en ?? c.name ?? '', ar: c.name_ar ?? '', he: c.name_he ?? '' },
        description: c.description && typeof c.description === 'object'
          ? { en: c.description?.en ?? c.description_en ?? c.description ?? '', ar: c.description?.ar ?? c.description_ar ?? '', he: c.description?.he ?? c.description_he ?? '' }
          : { en: c.description_en ?? c.description ?? '', ar: c.description_ar ?? '', he: c.description_he ?? '' },
        image_url: c.image_url || c.image || c.imageUrl || undefined,
      });

      const normalizeMeal = (m: any): Meal => ({
        _id: m._id || m.id || m?._id?.$oid || undefined,
        id: m.id || m._id || m?._id?.$oid || undefined,
        name: m.name && typeof m.name === 'object'
          ? { en: m.name?.en ?? m.name_en ?? m.name ?? '', ar: m.name?.ar ?? m.name_ar ?? '', he: m.name?.he ?? m.name_he ?? '' }
          : { en: m.name_en ?? m.name ?? '', ar: m.name_ar ?? '', he: m.name_he ?? '' },
        description: m.description && typeof m.description === 'object'
          ? { en: m.description?.en ?? m.description_en ?? m.description ?? '', ar: m.description?.ar ?? m.description_ar ?? '', he: m.description?.he ?? m.description_he ?? '' }
          : { en: m.description_en ?? m.description ?? '', ar: m.description_ar ?? '', he: m.description_he ?? '' },
        price: Number(m.price ?? m.base_price ?? 0),
        category_id: m.category_id || m.categoryId || m.category?.id || m.category || '',
        image_url: m.image_url || m.image || m.imageUrl || undefined,
        is_available: (m.is_available ?? m.is_active ?? true) as boolean,
        ingredients: m.ingredients || [],
      });

      const catsRaw = extract(categoriesRes.data);
      const mealsRaw = extract(mealsRes.data);
      const cats = catsRaw.map(normalizeCategory);
      const ms = mealsRaw.map(normalizeMeal).filter((m: Meal) => !!m && m.is_available);

      setCategories(cats);
      setMeals(ms);

      // compute counts per category
      const map: Record<string, number> = {};
      ms.forEach((m: Meal) => {
        const key = (m.category_id || '').toString();
        if (!key) return;
        map[key] = (map[key] || 0) + 1;
      });
      setCounts(map);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocalizedName = (item: Category | Meal) => {
    const raw = (item as any).name as Translation | string | undefined;
    if (!raw) return '';
    const full = typeof raw === 'string' ? { en: raw, ar: '', he: '' } : { en: raw.en ?? '', ar: raw.ar ?? '', he: raw.he ?? '' };
    return getLocalizedText(full as { en: string; ar: string; he: string }, language);
  };

  const getLocalizedDescription = (item: Category | Meal) => {
    const raw = (item as any).description as Translation | string | undefined;
    if (!raw) return '';
    const full = typeof raw === 'string' ? { en: raw, ar: '', he: '' } : { en: raw.en ?? '', ar: raw.ar ?? '', he: raw.he ?? '' };
    return getLocalizedText(full as { en: string; ar: string; he: string }, language);
  };

  const mealsByCategory = useMemo(() => {
    const map: Record<string, Meal[]> = {};
    meals.forEach((m) => {
      const cid = (m.category_id || '').toString();
      if (!cid) return;
      if (!map[cid]) map[cid] = [];
      map[cid].push(m);
    });
    return map;
  }, [meals]);

  const handleSelectCategory = (id: string) => {
    setSelectedCategory(id);
    if (id === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = sectionRefs.current[id];
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - tabsOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // Highlight active category based on scroll position
  useEffect(() => {
    const ids = categories.map((c) => (c._id || c.id || '').toString()).filter(Boolean);
    if (ids.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        // pick the entry closest to the top that is intersecting
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target) {
          const id = (visible.target as HTMLElement).dataset.sectionId || '';
          if (id) setSelectedCategory(id);
        }
      },
      { rootMargin: `-${tabsOffset}px 0px -70% 0px`, threshold: 0 }
    );
    ids.forEach((id) => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [categories, tabsOffset]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))]">
        <div className="sticky top-16 z-40 bg-[hsl(var(--background))]/80 backdrop-blur-xl border-b border-[hsl(var(--border))]">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 overflow-x-auto py-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 w-28 bg-[hsl(var(--muted))] rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
                <div className="aspect-square bg-[hsl(var(--muted))] animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-3/4 bg-[hsl(var(--muted))] rounded-lg animate-pulse" />
                  <div className="h-4 w-full bg-[hsl(var(--muted))] rounded-lg animate-pulse" />
                  <div className="h-4 w-2/3 bg-[hsl(var(--muted))] rounded-lg animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]" dir={language === 'ar' || language === 'he' ? 'rtl' : 'ltr'}>
      {/* Fixed below nav */}
      <div>
        {/* Category Tabs - Sticky (Mobile/Tablet) */}
        <div className="sticky top-16 z-40 bg-[hsl(var(--background))]/80 backdrop-blur-xl border-b border-[hsl(var(--border))] lg:hidden">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-hide snap-x">
              <button
                onClick={() => handleSelectCategory('all')}
                className={`px-5 py-2.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]/80'
                }`}
              >
                {getTranslation('common', 'all', language)}
                <span className={`ml-2 inline-flex items-center justify-center text-xs px-2 py-0.5 rounded-lg font-medium ${
                  selectedCategory === 'all'
                    ? 'bg-[hsl(var(--card))/0.2] text-primary-foreground'
                    : 'bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))]'
                }`}>
                  {meals.length}
                </span>
              </button>
              {categories.map((category, idx) => (
                <button
                  key={category._id || category.id || idx}
                  onClick={() => handleSelectCategory(((category._id || category.id || '') as string).toString())}
                  className={`px-5 py-2.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                    selectedCategory === (category._id || category.id)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]/80'
                  }`}
                >
                  <span className="snap-center">{getLocalizedName(category)}</span>
                  <span className={`ml-2 inline-flex items-center justify-center text-xs px-2 py-0.5 rounded-lg font-medium ${
                    selectedCategory === (category._id || category.id)
                      ? 'bg-[hsl(var(--card))/0.2] text-primary-foreground'
                      : 'bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))]'
                  }`}>
                    {counts[(category._id || category.id || '') as string] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet content (single column) */}
  <div className="container mx-auto px-4 py-4 lg:hidden">
          {categories
            .filter((c) => (counts[(c._id || c.id || '') as string] || 0) > 0)
            .map((category, idx) => {
              const cid = ((category._id || category.id || '') as string).toString();
              const list = mealsByCategory[cid] || [];
              return (
                <section
                  key={cid || idx}
                  ref={(el) => { sectionRefs.current[cid] = el; }}
                  data-section-id={cid}
                  className="mb-6"
                >
                  <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-4 flex items-center">
                    {getLocalizedName(category)}
                    <span className="ml-3 text-sm font-medium text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-3 py-1 rounded-lg">{list.length}</span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {list.map((meal, mIdx) => (
                      <div
                        key={meal._id || meal.id || mIdx}
                        className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] hover:shadow-md hover:border-[hsl(var(--primary))]/30 transition-all duration-300 overflow-hidden cursor-pointer group"
                        onClick={() => {
                          setActiveMeal({
                            _id: meal._id,
                            id: meal.id,
                            name: meal.name,
                            description: meal.description,
                            price: meal.price,
                            image_url: meal.image_url,
                            ingredients: (meal as any).ingredients || [],
                          });
                          setModalOpen(true);
                        }}
                      >
                        {/* Image */}
                        <div className="relative aspect-square bg-[hsl(var(--muted))] overflow-hidden">
                          {meal.image_url && /^https?:\/\/.+\.(png|jpe?g|webp|avif|gif|svg)(\?.*)?$/i.test(meal.image_url) ? (
                            <img
                              src={meal.image_url}
                              alt={getLocalizedName(meal)}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                          ) : meal.image_url && meal.image_url.startsWith('/') ? (
                            <img
                              src={meal.image_url}
                              alt={getLocalizedName(meal)}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[hsl(var(--muted-foreground))]">
                              <svg
                                className="w-16 h-16 opacity-40"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                          {/* Add button overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                            <div className="bg-[hsl(var(--card))] backdrop-blur-sm rounded-full p-2.5 shadow-lg ring-2 ring-primary/20">
                              <Plus className="w-5 h-5 text-primary" />
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-3">
                          <h3 className="font-semibold text-sm text-[hsl(var(--foreground))] mb-1 line-clamp-1">
                            {getLocalizedName(meal)}
                          </h3>
                          {getLocalizedDescription(meal) && (
                            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2 line-clamp-2 leading-relaxed">
                              {getLocalizedDescription(meal)}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-base font-semibold text-primary">{formatPrice(meal.price, language)}</span>
                            <button
                              className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow-md active:scale-95"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMeal({
                                  _id: meal._id,
                                  id: meal.id,
                                  name: meal.name,
                                  description: meal.description,
                                  price: meal.price,
                                  image_url: meal.image_url,
                                  ingredients: (meal as any).ingredients || [],
                                });
                                setModalOpen(true);
                              }}
                            >
                              {getTranslation('common', 'addToCart', language)}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
        </div>

        {/* Desktop content: split layout with left categories and right meals */}
  <div className="hidden lg:grid lg:grid-cols-12 gap-6 container mx-auto px-4 py-4">
          {/* Left: Categories list */}
          <aside className="lg:col-span-3 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
            <div className="space-y-2">
              <button
                onClick={() => handleSelectCategory('all')}
                className={`w-full text-left px-4 py-3.5 rounded-xl font-medium transition-all ${
                  selectedCategory === 'all' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))] border border-[hsl(var(--border))]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{getTranslation('common', 'all', language)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedCategory === 'all' 
                      ? 'bg-[hsl(var(--card))/0.3] text-[hsl(var(--foreground))/0.9]' 
                      : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                  }`}>{meals.length}</span>
                </div>
              </button>

              {categories.map((category, idx) => {
                const cid = ((category._id || category.id || '') as string).toString();
                const count = counts[cid] || 0;
                if (count === 0) return null;
                const active = selectedCategory === (category._id || category.id);
                return (
                  <button
                    key={cid || idx}
                    onClick={() => handleSelectCategory(cid)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                      active 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))] border-[hsl(var(--border))] text-[hsl(var(--foreground))]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium line-clamp-1">{getLocalizedName(category)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        active 
                          ? 'bg-[hsl(var(--card))/0.3] text-[hsl(var(--foreground))/0.9]' 
                          : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                      }`}>{count}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right: Meals sections */}
          <div className="lg:col-span-9">
            {categories
              .filter((c) => (counts[(c._id || c.id || '') as string] || 0) > 0)
              .map((category, idx) => {
                const cid = ((category._id || category.id || '') as string).toString();
                const list = mealsByCategory[cid] || [];
                return (
                  <section
                    key={cid || idx}
                    ref={(el) => { sectionRefs.current[cid] = el; }}
                    data-section-id={cid}
                    className="mb-10"
                  >
                    <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                      {getLocalizedName(category)}
                      <span className="ml-3 text-sm font-medium text-muted-foreground">{list.length}</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                      {list.map((meal, mIdx) => (
                        <div
                          key={meal._id || meal.id || mIdx}
                          className="bg-card rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group border border-border"
                          onClick={() => {
                            setActiveMeal({
                              _id: meal._id,
                              id: meal.id,
                              name: meal.name,
                              description: meal.description,
                              price: meal.price,
                              image_url: meal.image_url,
                              ingredients: (meal as any).ingredients || [],
                            });
                            setModalOpen(true);
                          }}
                        >
                          {/* Image */}
                          <div className="relative aspect-square bg-muted overflow-hidden">
                            {meal.image_url && /^https?:\/\/.+\.(png|jpe?g|webp|avif|gif|svg)(\?.*)?$/i.test(meal.image_url) ? (
                              <img
                                src={meal.image_url}
                                alt={getLocalizedName(meal)}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                              />
                            ) : meal.image_url && meal.image_url.startsWith('/') ? (
                              <img
                                src={meal.image_url}
                                alt={getLocalizedName(meal)}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <svg
                                  className="w-20 h-20"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                            {/* Add button overlay */}
                            <div className="absolute inset-0 bg-[hsl(var(--foreground))/0] group-hover:bg-[hsl(var(--foreground))/0.2] transition-all duration-300 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-card rounded-full p-3 shadow-lg">
                                  <Plus className="w-6 h-6 text-primary" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-4">
                            <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1">
                              {getLocalizedName(meal)}
                            </h3>
                            {getLocalizedDescription(meal) && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {getLocalizedDescription(meal)}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-primary">{formatPrice(meal.price, language)}</span>
                              <button
                                className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMeal({
                                    _id: meal._id,
                                    id: meal.id,
                                    name: meal.name,
                                    description: meal.description,
                                    price: meal.price,
                                    image_url: meal.image_url,
                                    ingredients: (meal as any).ingredients || [],
                                  });
                                  setModalOpen(true);
                                }}
                              >
                                {getTranslation('common', 'addToCart', language)}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
          </div>
        </div>
      </div>
      <MealCustomizeModal open={modalOpen} onOpenChange={setModalOpen} meal={activeMeal} />

      {/* Sticky bottom cart bar (mobile) */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:hidden">
          <Link href="/cart" className="block">
            <div className="flex items-center justify-between bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-lg">
              <div className="font-semibold">{itemCount} {itemCount === 1 ? 'item' : 'items'}</div>
              <div className="font-bold">{formatPrice(totalAmount, language)}</div>
              <div className="text-sm font-medium">View Cart</div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}