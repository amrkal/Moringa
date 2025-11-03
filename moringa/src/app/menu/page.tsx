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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]/50 overflow-hidden" style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.04)' }}>
                <div className="aspect-square bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--muted))/0.5] animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 bg-[hsl(var(--muted))] rounded-lg animate-pulse" />
                  <div className="h-3 w-full bg-[hsl(var(--muted))] rounded-lg animate-pulse" />
                  <div className="h-3 w-2/3 bg-[hsl(var(--muted))] rounded-lg animate-pulse" />
                  <div className="flex justify-between items-center mt-3">
                    <div className="h-5 w-16 bg-[hsl(var(--muted))] rounded-lg animate-pulse" />
                    <div className="h-8 w-20 bg-[hsl(var(--muted))] rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state when no meals available
  if (meals.length === 0) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-muted to-accent/20 flex items-center justify-center">
            <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">
            {language === 'ar' ? 'لا توجد وجبات متاحة' : 'No Meals Available'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {language === 'ar' 
              ? 'نعمل على إضافة وجبات لذيذة. يرجى المحاولة مرة أخرى لاحقًا!'
              : 'We\'re working on adding delicious meals. Please check back later!'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]" dir={language === 'ar' || language === 'he' ? 'rtl' : 'ltr'}>
      {/* Fixed below nav */}
      <div>
        {/* Category Tabs - Sticky (Mobile/Tablet) */}
        <div className="sticky top-16 z-40 bg-[hsl(var(--background))]/95 backdrop-blur-xl border-b border-[hsl(var(--border))]/50 lg:hidden" style={{ boxShadow: '0 1px 0 rgba(0, 0, 0, 0.04)' }}>
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide snap-x">
              <button
                onClick={() => handleSelectCategory('all')}
                className={`px-5 py-2.5 rounded-2xl whitespace-nowrap font-semibold transition-all duration-300 tracking-tight ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-primary-foreground shadow-glow-primary scale-105'
                    : 'bg-[hsl(var(--muted))]/60 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] hover:scale-105 active:scale-95'
                }`}
                style={selectedCategory === 'all' ? { boxShadow: '0 4px 12px rgba(251, 115, 22, 0.25)' } : {}}
              >
                {getTranslation('common', 'all', language)}
                <span className={`ml-2 inline-flex items-center justify-center text-xs px-2.5 py-1 rounded-full font-medium ${
                  selectedCategory === 'all'
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))]'
                }`}>
                  {meals.length}
                </span>
              </button>
              {categories.map((category, idx) => {
                const isActive = selectedCategory === (category._id || category.id);
                return (
                  <button
                    key={category._id || category.id || idx}
                    onClick={() => handleSelectCategory(((category._id || category.id || '') as string).toString())}
                    className={`px-5 py-2.5 rounded-2xl whitespace-nowrap font-semibold transition-all duration-300 tracking-tight ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-glow-primary scale-105'
                        : 'bg-[hsl(var(--muted))]/60 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] hover:scale-105 active:scale-95'
                    }`}
                    style={isActive ? { boxShadow: '0 4px 12px rgba(251, 115, 22, 0.25)' } : {}}
                  >
                    <span className="snap-center">{getLocalizedName(category)}</span>
                    <span className={`ml-2 inline-flex items-center justify-center text-xs px-2.5 py-1 rounded-full font-medium ${
                      selectedCategory === (category._id || category.id)
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))]'
                    }`}>
                      {counts[(category._id || category.id || '') as string] || 0}
                    </span>
                  </button>
                );
              })}
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
                  <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-4 flex items-center tracking-tight">
                    {getLocalizedName(category)}
                    <span className="ml-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]/60 px-3 py-1.5 rounded-full">{list.length}</span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {list.map((meal, mIdx) => (
                      <div
                        key={meal._id || meal.id || mIdx}
                        className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]/50 hover:shadow-medium hover:border-[hsl(var(--primary))]/30 hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden cursor-pointer group"
                        style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.04)' }}
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
                        <div className="relative aspect-square bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--muted))/0.5] overflow-hidden">
                          {meal.image_url && /^https?:\/\/.+\.(png|jpe?g|webp|avif|gif|svg)(\?.*)?$/i.test(meal.image_url) ? (
                            <img
                              src={meal.image_url}
                              alt={getLocalizedName(meal)}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                          ) : meal.image_url && meal.image_url.startsWith('/') ? (
                            <img
                              src={meal.image_url}
                              alt={getLocalizedName(meal)}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[hsl(var(--muted-foreground))] bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--accent))]/10">
                              <svg
                                className="w-12 h-12 opacity-30"
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
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-3">
                            <div className="bg-primary text-primary-foreground backdrop-blur-sm rounded-full p-2 shadow-xl ring-2 ring-primary/50 transform scale-90 group-hover:scale-100 transition-transform">
                              <Plus className="w-5 h-5" />
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-3 flex flex-col h-full">
                          <h3 className="font-semibold text-sm text-[hsl(var(--foreground))] mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                            {getLocalizedName(meal)}
                          </h3>
                          {getLocalizedDescription(meal) && (
                            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2.5 line-clamp-2 leading-relaxed flex-1">
                              {getLocalizedDescription(meal)}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-auto pt-2 border-t border-[hsl(var(--border))]/50">
                            <span className="text-base font-bold text-primary tabular-nums">{formatPrice(meal.price, language)}</span>
                            <button
                              className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-1"
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
                              <Plus className="w-3.5 h-3.5" />
                              {language === 'ar' ? 'أضف' : 'Add'}
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
                className={`w-full text-left px-5 py-4 rounded-2xl font-semibold transition-all duration-300 relative overflow-hidden group tracking-tight ${
                  selectedCategory === 'all' 
                    ? 'bg-primary text-primary-foreground scale-[1.02]' 
                    : 'bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))] border border-[hsl(var(--border))]/50 hover:border-[hsl(var(--primary))]/30 hover:scale-[1.02]'
                }`}
                style={selectedCategory === 'all' ? { boxShadow: '0 4px 12px rgba(251, 115, 22, 0.25)' } : { boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)' }}
              >
                {selectedCategory === 'all' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0 animate-shimmer" />
                )}
                <div className="flex items-center justify-between relative">
                  <span className="font-bold">{getTranslation('common', 'all', language)}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold transition-all ${
                    selectedCategory === 'all' 
                      ? 'bg-primary-foreground/20 text-primary-foreground' 
                      : 'bg-[hsl(var(--muted))]/80 text-[hsl(var(--muted-foreground))] group-hover:bg-[hsl(var(--muted))]'
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
                    className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 relative overflow-hidden group tracking-tight ${
                      active 
                        ? 'bg-primary text-primary-foreground scale-[1.02]' 
                        : 'bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))] border border-[hsl(var(--border))]/50 hover:border-[hsl(var(--primary))]/30 hover:scale-[1.02] text-[hsl(var(--foreground))]'
                    }`}
                    style={active ? { boxShadow: '0 4px 12px rgba(251, 115, 22, 0.25)' } : { boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)' }}
                  >
                    {active && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0 animate-shimmer" />
                    )}
                    <div className="flex items-center justify-between relative">
                      <span className={`line-clamp-1 ${active ? 'font-bold' : 'font-semibold'}`}>{getLocalizedName(category)}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold transition-all ${
                        active 
                          ? 'bg-primary-foreground/20 text-primary-foreground' 
                          : 'bg-[hsl(var(--muted))]/80 text-[hsl(var(--muted-foreground))] group-hover:bg-[hsl(var(--muted))]'
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
                    <h2 className="text-2xl font-bold text-foreground mb-5 flex items-center tracking-tight">
                      {getLocalizedName(category)}
                      <span className="ml-3 text-xs font-semibold text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full">{list.length}</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                      {list.map((meal, mIdx) => (
                        <div
                          key={meal._id || meal.id || mIdx}
                          className="bg-card rounded-2xl hover:shadow-large hover:border-primary/30 hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden cursor-pointer group border border-border/50"
                          style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.04)' }}
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
                          <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
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
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-accent/10">
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
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
                              <div className="bg-primary text-primary-foreground backdrop-blur-sm rounded-full p-3 shadow-xl ring-2 ring-primary/50 transform scale-90 group-hover:scale-100 transition-transform">
                                <Plus className="w-6 h-6" />
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-5 flex flex-col">
                            <h3 className="font-bold text-lg text-foreground mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
                              {getLocalizedName(meal)}
                            </h3>
                            {getLocalizedDescription(meal) && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed flex-1">
                                {getLocalizedDescription(meal)}
                              </p>
                            )}
                            <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
                              <span className="text-xl font-bold text-primary tabular-nums">{formatPrice(meal.price, language)}</span>
                              <button
                                className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 hover:shadow-md active:scale-95 transition-all flex items-center gap-2"
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
                                <Plus className="w-4 h-4" />
                                {language === 'ar' ? 'أضف' : 'Add'}
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