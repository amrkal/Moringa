'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import api from '@/lib/api';
// Using native <img> for resilience with unknown external URLs; avoids next/image domain config errors
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import MealCustomizeModal, { MealForCustomize } from '@/components/MealCustomizeModal';
import StepHeader from '@/components/StepHeader';

interface Category {
  _id?: string;
  id?: string;
  name_en: string;
  name_ar: string;
  name_he: string;
  description_en?: string;
  description_ar?: string;
  description_he?: string;
  image_url?: string;
}

interface Meal {
  _id?: string;
  id?: string;
  name_en: string;
  name_ar: string;
  name_he: string;
  description_en?: string;
  description_ar?: string;
  description_he?: string;
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
        name_en: c.name_en || c.name?.en || c.name || '',
        name_ar: c.name_ar || c.name?.ar || '',
        name_he: c.name_he || c.name?.he || '',
        description_en: c.description_en || c.description?.en || c.description || '',
        description_ar: c.description_ar || c.description?.ar || '',
        description_he: c.description_he || c.description?.he || '',
        image_url: c.image_url || c.image || c.imageUrl || undefined,
      });

      const normalizeMeal = (m: any): Meal => ({
        _id: m._id || m.id || m?._id?.$oid || undefined,
        id: m.id || m._id || m?._id?.$oid || undefined,
        name_en: m.name_en || m.name?.en || m.name || '',
        name_ar: m.name_ar || m.name?.ar || '',
        name_he: m.name_he || m.name?.he || '',
        description_en: m.description_en || m.description?.en || m.description || '',
        description_ar: m.description_ar || m.description?.ar || '',
        description_he: m.description_he || m.description?.he || '',
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
    const key = `name_${language}` as keyof typeof item;
    return (item[key] as string) || item.name_en || '';
  };

  const getLocalizedDescription = (item: Category | Meal) => {
    const key = `description_${language}` as keyof typeof item;
    return (item[key] as string) || item.description_en || '';
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
      <div className="min-h-screen bg-gray-50">
        <div className="pt-16 sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 overflow-x-auto py-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-9 w-24 bg-gray-100 rounded-full animate-pulse" />
              ))}
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="aspect-square bg-gray-100 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-3/4 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StepHeader />
      {/* Fixed below nav */}
      <div className="pt-16">
        {/* Category Tabs - Sticky (Mobile/Tablet) */}
        <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm lg:hidden">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide snap-x">
              <button
                onClick={() => handleSelectCategory('all')}
                className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition-all border ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-white shadow-md border-primary'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent'
                }`}
              >
                {getTranslation('common', 'all', language)}
                <span className="ml-2 inline-flex items-center justify-center text-xs px-2 py-0.5 rounded-full bg-white/30 text-white/90">
                  {meals.length}
                </span>
              </button>
              {categories.map((category, idx) => (
                <button
                  key={category._id || category.id || idx}
                  onClick={() => handleSelectCategory(((category._id || category.id || '') as string).toString())}
                  className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition-all border ${
                    selectedCategory === (category._id || category.id)
                      ? 'bg-primary text-white shadow-md border-primary'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent'
                  }`}
                >
                  <span className="snap-center">{getLocalizedName(category)}</span>
                  <span className={`ml-2 inline-flex items-center justify-center text-xs px-2 py-0.5 rounded-full ${
                    selectedCategory === (category._id || category.id)
                      ? 'bg-white/30 text-white/90'
                      : 'bg-white text-gray-700'
                  }`}>
                    {counts[(category._id || category.id || '') as string] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet content (single column) */}
        <div className="container mx-auto px-4 py-8 lg:hidden">
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    {getLocalizedName(category)}
                    <span className="ml-3 text-sm font-medium text-gray-500">{list.length}</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {list.map((meal, mIdx) => (
                      <div
                        key={meal._id || meal.id || mIdx}
                        className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group"
                        onClick={() => {
                          setActiveMeal({
                            _id: meal._id,
                            id: meal.id,
                            name_en: meal.name_en,
                            name_ar: meal.name_ar,
                            name_he: meal.name_he,
                            description_en: meal.description_en,
                            description_ar: meal.description_ar,
                            description_he: meal.description_he,
                            price: meal.price,
                            image_url: meal.image_url,
                            ingredients: (meal as any).ingredients || [],
                          });
                          setModalOpen(true);
                        }}
                      >
                        {/* Image */}
                        <div className="relative aspect-square bg-gray-200 overflow-hidden">
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
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
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
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="bg-white rounded-full p-3 shadow-lg">
                                <Plus className="w-6 h-6 text-primary" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
                            {getLocalizedName(meal)}
                          </h3>
                          {getLocalizedDescription(meal) && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {getLocalizedDescription(meal)}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-primary">{formatPrice(meal.price)}</span>
                            <button
                              className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMeal({
                                  _id: meal._id,
                                  id: meal.id,
                                  name_en: meal.name_en,
                                  name_ar: meal.name_ar,
                                  name_he: meal.name_he,
                                  description_en: meal.description_en,
                                  description_ar: meal.description_ar,
                                  description_he: meal.description_he,
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
        <div className="hidden lg:grid lg:grid-cols-12 gap-6 container mx-auto px-4 py-8">
          {/* Left: Categories list */}
          <aside className="lg:col-span-3 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
            <div className="space-y-2">
              <button
                onClick={() => handleSelectCategory('all')}
                className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                  selectedCategory === 'all' ? 'bg-primary text-white border-primary' : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{getTranslation('common', 'all', language)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedCategory === 'all' ? 'bg-white/30 text-white/90' : 'bg-gray-100 text-gray-700'
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
                      active ? 'bg-primary text-white border-primary' : 'bg-white hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium line-clamp-1">{getLocalizedName(category)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        active ? 'bg-white/30 text-white/90' : 'bg-gray-100 text-gray-700'
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                      {getLocalizedName(category)}
                      <span className="ml-3 text-sm font-medium text-gray-500">{list.length}</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                      {list.map((meal, mIdx) => (
                        <div
                          key={meal._id || meal.id || mIdx}
                          className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group"
                          onClick={() => {
                            setActiveMeal({
                              _id: meal._id,
                              id: meal.id,
                              name_en: meal.name_en,
                              name_ar: meal.name_ar,
                              name_he: meal.name_he,
                              description_en: meal.description_en,
                              description_ar: meal.description_ar,
                              description_he: meal.description_he,
                              price: meal.price,
                              image_url: meal.image_url,
                              ingredients: (meal as any).ingredients || [],
                            });
                            setModalOpen(true);
                          }}
                        >
                          {/* Image */}
                          <div className="relative aspect-square bg-gray-200 overflow-hidden">
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
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
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
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-white rounded-full p-3 shadow-lg">
                                  <Plus className="w-6 h-6 text-primary" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-4">
                            <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
                              {getLocalizedName(meal)}
                            </h3>
                            {getLocalizedDescription(meal) && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {getLocalizedDescription(meal)}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-primary">{formatPrice(meal.price)}</span>
                              <button
                                className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMeal({
                                    _id: meal._id,
                                    id: meal.id,
                                    name_en: meal.name_en,
                                    name_ar: meal.name_ar,
                                    name_he: meal.name_he,
                                    description_en: meal.description_en,
                                    description_ar: meal.description_ar,
                                    description_he: meal.description_he,
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
              <div className="font-bold">{formatPrice(totalAmount)}</div>
              <div className="text-sm font-medium">View Cart</div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}