"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { getLocalizedText } from '@/lib/i18n';
import { MealImage } from '@/components/ui/optimized-image';
import Image from 'next/image';
import { Plus, Search, X, Flame, Leaf, Sparkles } from 'lucide-react';
import Link from 'next/link';
import BottomSheetCart from '@/components/BottomSheetCart';
import { CategoryChipsSkeleton, MealGridSkeleton } from '@/components/Skeletons';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import MealCustomizeModal, { MealForCustomize } from '@/components/MealCustomizeModal';
import { useMeals, useCategories, type MealWithLegacyProps } from '@/hooks/useApi';
import type { Category } from '@/types';


interface Translation { en?: string; ar?: string; he?: string }

export default function MenuPage() {
  const { language } = useLanguage();
  
  // Use React Query for data fetching with caching
  const { data: categoriesData = [], isLoading: categoriesLoading } = useCategories(true);
  const { data: mealsData = [], isLoading: mealsLoading } = useMeals(true);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeMeal, setActiveMeal] = useState<MealForCustomize | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const tabsOffset = 120;
  const itemCount = useCartStore((s) => s.getItemCount());
  const totalAmount = useCartStore((s) => s.getTotalAmount());

  const loading = categoriesLoading || mealsLoading;

  // Compute counts per category from mealsData
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    mealsData.forEach((m: MealWithLegacyProps) => {
      const key = m.categoryId || '';
      if (!key) return;
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [mealsData]);

  // Keyboard shortcut for search (/)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !searchOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);



  const getLocalizedName = (item: Category | MealWithLegacyProps) => {
    const raw = (item as any).name as Translation | string | undefined;
    if (!raw) return '';
    const full = typeof raw === 'string' ? { en: raw, ar: '', he: '' } : { en: raw.en ?? '', ar: raw.ar ?? '', he: raw.he ?? '' };
    return getLocalizedText(full as { en: string; ar: string; he: string }, language);
  };

  const getLocalizedDescription = (item: Category | MealWithLegacyProps) => {
    const raw = (item as any).description as Translation | string | undefined;
    if (!raw) return '';
    const full = typeof raw === 'string' ? { en: raw, ar: '', he: '' } : { en: raw.en ?? '', ar: raw.ar ?? '', he: raw.he ?? '' };
    return getLocalizedText(full as { en: string; ar: string; he: string }, language);
  };

  const mealsByCategory = useMemo(() => {
    const map: Record<string, MealWithLegacyProps[]> = {};
    mealsData.forEach((m) => {
      const cid = m.categoryId || '';
      if (!cid) return;
      if (!map[cid]) map[cid] = [];
      map[cid].push(m);
    });
    return map;
  }, [mealsData]);

  // Filter meals by search query only
  const filteredMeals = useMemo(() => {
    if (!searchQuery.trim()) return mealsData;
    const query = searchQuery.toLowerCase();
    return mealsData.filter((meal) => {
      const name = getLocalizedName(meal).toLowerCase();
      const desc = getLocalizedDescription(meal).toLowerCase();
      return name.includes(query) || desc.includes(query);
    });
  }, [mealsData, searchQuery, language]);

  // Filtered meals by category
  const filteredMealsByCategory = useMemo(() => {
    const map: Record<string, MealWithLegacyProps[]> = {};
    filteredMeals.forEach((m) => {
      const cid = m.categoryId || '';
      if (!cid) return;
      if (!map[cid]) map[cid] = [];
      map[cid].push(m);
    });
    return map;
  }, [filteredMeals]);


  const handleSelectCategory = (id: string) => {
    setSelectedCategory(id);
    const el = sectionRefs.current[id];
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - tabsOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };
  // Set initial selected category to first available
  useEffect(() => {
    if (categoriesData.length > 0 && !selectedCategory) {
      const firstCatId = categoriesData[0].id || '';
      setSelectedCategory(firstCatId);
    }
  }, [categoriesData, selectedCategory]);

  // Highlight active category based on scroll position
  useEffect(() => {
    const ids = categoriesData.map((c) => c.id || '').filter(Boolean);
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
  }, [categoriesData, tabsOffset]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Premium animated background */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent/5 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
        </div>

        {/* Promo banner skeleton space */}
        <div className="pt-4" />

        {/* Category chips skeleton */}
        <div className="sticky top-20 z-40 bg-background/70 backdrop-blur-2xl border-b border-border/40">
          <div className="container mx-auto px-4 py-2">
            <CategoryChipsSkeleton count={6} />
          </div>
        </div>

        {/* Meal grid skeleton */}
        <div className="container mx-auto px-4 py-8">
          <MealGridSkeleton cards={8} />
        </div>
      </div>
    );
  }

  // Empty state when no meals available
  if (mealsData.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
        {/* Premium animated background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
        </div>

        <div className="text-center max-w-md">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-muted to-accent/20 flex items-center justify-center ring-4 ring-primary/10">
              <svg className="w-16 h-16 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {language === 'ar' ? 'لا توجد وجبات متاحة' : 'No Meals Available'}
          </h3>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            {language === 'ar' 
              ? 'نعمل على إضافة وجبات لذيذة. يرجى المحاولة مرة أخرى لاحقًا!'
              : 'We\'re working on adding delicious meals. Please check back later!'}
          </p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-background relative" dir={language === 'ar' || language === 'he' ? 'rtl' : 'ltr'}>
      {/* Premium animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent/5 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
      </div>

      {/* Floating Search Overlay - Modern Pattern */}
      {searchOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn" onClick={() => setSearchOpen(false)} />
          <div className="fixed top-20 left-0 right-0 z-50 px-4 animate-slideDown" role="dialog" aria-modal="true" aria-label="Search">
            <div className="max-w-2xl mx-auto">
              <div className="bg-card/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-border/50 p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Search className="h-6 w-6 text-primary" />
                  <input
                    type="text"
                    placeholder={language === 'ar' ? 'ابحث عن وجبات...' : 'Search for meals...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-lg text-foreground placeholder:text-muted-foreground"
                    autoFocus
                  />
                  <button onClick={() => setSearchOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors" aria-label="Close search" title="Close">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {searchQuery && (
                  <div className="text-sm text-muted-foreground px-2">
                    {filteredMeals.length} {filteredMeals.length === 1 ? 'result' : 'results'} found
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Floating Action Button - Search */}
      <button
        onClick={() => setSearchOpen(true)}
        className="fixed top-24 right-4 z-40 bg-gradient-to-br from-primary to-accent text-white p-3 sm:p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Search meals" title="Search"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Fixed below nav */}
      <div>
        {/* Category Tabs - Sticky (Mobile/Tablet) */}
        <div className="sticky top-20 z-40 bg-background/70 backdrop-blur-2xl border-b border-border/40 lg:hidden">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
          <div className="container mx-auto px-2 sm:px-4">
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-3 sm:py-4 scrollbar-hide snap-x" role="navigation" aria-label="Categories">
              {categoriesData.map((category, idx) => {
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id || idx}
                    onClick={() => handleSelectCategory(category.id || '')}
                    className={`px-6 py-3 rounded-2xl whitespace-nowrap font-semibold transition-all duration-300 tracking-tight relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isActive
                        ? 'bg-gradient-to-br from-primary to-accent text-white shadow-lg scale-105'
                        : 'bg-card/80 border border-border/50 text-foreground hover:bg-muted hover:scale-105 hover:shadow-md active:scale-95'
                    }`}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                    )}
                    <span className="snap-center relative z-10">{getLocalizedName(category)}</span>
                    <span className={`ml-2 inline-flex items-center justify-center text-xs px-3 py-1 rounded-full font-bold relative z-10 ${
                      isActive
                        ? 'bg-white/20 text-white backdrop-blur-sm'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {(filteredMealsByCategory[category.id] || []).length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>


        {/* Mobile/Tablet content (single column) */}
  <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 lg:hidden">
          {categoriesData
            .filter((c) => (counts[c.id] || 0) > 0)
            .map((category, idx) => {
              const cid = category.id || '';
              const list = filteredMealsByCategory[cid] || [];
              return (
                <section
                  key={cid || idx}
                  ref={(el) => { sectionRefs.current[cid] = el; }}
                  data-section-id={cid}
                  className="mb-6"
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {getLocalizedName(category)}
                    </h2>
                    <span className="text-sm font-bold text-muted-foreground bg-muted px-4 py-2 rounded-full">{list.length}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
                    {list.map((meal, mIdx) => (
                      <div
                        key={meal._id || meal.id || mIdx}
                        className="card-premium overflow-hidden cursor-pointer group rounded-2xl min-h-[220px] sm:min-h-[260px]"
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
                        role="button"
                        tabIndex={0}
                        aria-label={`View ${getLocalizedName(meal)}`}
                      >
                        {/* Image */}
                        <div className="relative aspect-square bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--muted))/0.5] overflow-hidden">
                          <MealImage
                            src={meal.image_url}
                            alt={getLocalizedName(meal)}
                            priority={idx < 4}
                            fallback={
                              <Image
                                src="/fallback-meal.png"
                                alt="Meal placeholder"
                                fill
                                className="object-cover"
                              />
                            }
                          />
                          
                          {/* Modern Badges - Top Left */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                            {/* New badge */}
                            {(() => {
                              const ts = meal.created_at ? Date.parse(meal.created_at) : 0;
                              const isFresh = ts && (Date.now() - ts) / (1000 * 60 * 60 * 24) <= 14;
                              return isFresh ? (
                                <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-lg backdrop-blur-sm" title={language === 'ar' ? 'جديد' : 'New'}>
                                  {language === 'ar' ? 'جديد' : 'New'}
                                </div>
                              ) : null;
                            })()}
                            {meal.is_popular && (
                              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-lg backdrop-blur-sm" title={language === 'ar' ? 'شائع' : 'Popular'}>
                                <Sparkles className="w-2.5 h-2.5" />
                                {language === 'ar' ? 'شائع' : 'Popular'}
                              </div>
                            )}
                            {meal.is_spicy && (
                              <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-lg backdrop-blur-sm" title={language === 'ar' ? 'حار' : 'Spicy'}>
                                <Flame className="w-2.5 h-2.5" />
                                {language === 'ar' ? 'حار' : 'Spicy'}
                              </div>
                            )}
                            {/* Dietary badges */}
                            {meal.is_vegetarian && (
                              <div className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-lg backdrop-blur-sm flex items-center gap-1" title={language === 'ar' ? 'نباتي' : 'Vegetarian'}>
                                <Leaf className="w-2.5 h-2.5" />
                                {language === 'ar' ? 'نباتي' : 'Veg'}
                              </div>
                            )}
                            {meal.is_vegan && (
                              <div className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-lg backdrop-blur-sm" title={language === 'ar' ? 'نباتي صرف' : 'Vegan'}>
                                {language === 'ar' ? 'نباتي صرف' : 'Vegan'}
                              </div>
                            )}
                            {meal.is_gluten_free && (
                              <div className="bg-sky-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-lg backdrop-blur-sm" title={language === 'ar' ? 'خالٍ من الغلوتين' : 'Gluten-free'}>
                                {language === 'ar' ? 'خالٍ من الغلوتين' : 'GF'}
                              </div>
                            )}
                          </div>

                          {/* Favorite Button - Top Right */}
                          
                          {/* Add button overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-3">
                            <div className="bg-gradient-to-r from-primary to-accent text-white backdrop-blur-sm rounded-full px-4 py-2 shadow-xl ring-2 ring-white/20 transform scale-90 group-hover:scale-100 transition-transform flex items-center gap-2 font-semibold">
                              <Plus className="w-4 h-4" />
                              <span className="text-sm">{language === 'ar' ? 'أضف سريع' : 'Quick Add'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-2 sm:p-3 flex flex-col h-full">
                          <h3 className="font-semibold text-xs sm:text-sm text-[hsl(var(--foreground))] mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                            {getLocalizedName(meal)}
                          </h3>
                          {getLocalizedDescription(meal) && (
                            <p className="text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))] mb-2 line-clamp-2 leading-relaxed flex-1">
                              {getLocalizedDescription(meal)}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-auto pt-2 border-t border-[hsl(var(--border))]/50">
                            <span className="text-xs sm:text-base font-bold text-primary tabular-nums">{formatPrice(meal.price, language)}</span>
                            <button
                              className="bg-gradient-to-r from-primary to-accent text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium hover:from-primary/90 hover:to-accent/90 transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 min-h-[32px] sm:min-h-[36px]"
                              title={language === 'ar' ? 'أضف إلى السلة' : 'Add to cart'}
                              aria-label={`Add ${getLocalizedName(meal)} to cart`}
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
                              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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
              {categoriesData.map((category, idx) => {
                const cid = category.id || '';
                const count = counts[cid] || 0;
                if (count === 0) return null;
                const active = selectedCategory === category.id;
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
            {categoriesData
              .filter((c) => (counts[c.id] || 0) > 0)
              .map((category, idx) => {
                const cid = category.id || '';
                const list = filteredMealsByCategory[cid] || [];
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
                          className="card-premium overflow-hidden cursor-pointer group"
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
                            <MealImage
                              src={meal.image_url}
                              alt={getLocalizedName(meal)}
                              className="transition-transform duration-300 group-hover:scale-110"
                              fallback={
                                <Image
                                  src="/fallback-meal.png"
                                  alt="Meal placeholder"
                                  fill
                                  className="object-cover"
                                />
                              }
                            />
                            
                            {/* Modern Badges - Top Left */}
                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                              {/* New badge */}
                              {(() => {
                                const ts = meal.created_at ? Date.parse(meal.created_at) : 0;
                                const isFresh = ts && (Date.now() - ts) / (1000 * 60 * 60 * 24) <= 14;
                                return isFresh ? (
                                  <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg backdrop-blur-sm" title={language === 'ar' ? 'جديد' : 'New'}>
                                    {language === 'ar' ? 'جديد' : 'New'}
                                  </div>
                                ) : null;
                              })()}
                              {meal.is_popular && (
                                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm" title={language === 'ar' ? 'شائع' : 'Popular'}>
                                  <Sparkles className="w-3 h-3" />
                                  {language === 'ar' ? 'شائع' : 'Popular'}
                                </div>
                              )}
                              {meal.is_spicy && (
                                <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm" title={language === 'ar' ? 'حار' : 'Spicy'}>
                                  <Flame className="w-3 h-3" />
                                  {language === 'ar' ? 'حار' : 'Spicy'}
                                </div>
                              )}
                              {/* Dietary badges */}
                              <div className="flex flex-col gap-2">
                                {meal.is_vegetarian && (
                                  <div className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg backdrop-blur-sm flex items-center gap-1.5" title={language === 'ar' ? 'نباتي' : 'Vegetarian'}>
                                    <Leaf className="w-3 h-3" />
                                    {language === 'ar' ? 'نباتي' : 'Vegetarian'}
                                  </div>
                                )}
                                {meal.is_vegan && (
                                  <div className="bg-emerald-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg backdrop-blur-sm" title={language === 'ar' ? 'نباتي صرف' : 'Vegan'}>
                                    {language === 'ar' ? 'نباتي صرف' : 'Vegan'}
                                  </div>
                                )}
                                {meal.is_gluten_free && (
                                  <div className="bg-sky-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg backdrop-blur-sm" title={language === 'ar' ? 'خالٍ من الغلوتين' : 'Gluten-free'}>
                                    {language === 'ar' ? 'خالٍ من الغلوتين' : 'Gluten‑free'}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Favorite Button - Top Right */}
                            
                            {/* Add button overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
                              <div className="bg-gradient-to-r from-primary to-accent text-white backdrop-blur-sm rounded-full px-5 py-2.5 shadow-xl ring-2 ring-white/20 transform scale-90 group-hover:scale-100 transition-transform flex items-center gap-2 font-semibold">
                                <Plus className="w-5 h-5" />
                                <span>{language === 'ar' ? 'أضف سريع' : 'Quick Add'}</span>
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
                                className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-full text-sm font-medium hover:from-primary/90 hover:to-accent/90 hover:shadow-md active:scale-95 transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                title={language === 'ar' ? 'أضف إلى السلة' : 'Add to cart'}
                                aria-label={`Add ${getLocalizedName(meal)} to cart`}
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
      {/* Bottom sheet cart preview (mobile) */}
      <BottomSheetCart />
    </div>
  );
}