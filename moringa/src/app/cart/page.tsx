'use client';

import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { Minus, Plus, Trash2, ShoppingBag, Pencil } from 'lucide-react';
import Link from 'next/link';
import MealCustomizeModal, { MealForCustomize } from '@/components/MealCustomizeModal';
import { mealsApi } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { getLocalizedText } from '@/lib/i18n';
import api from '@/lib/api';

interface Settings {
  delivery_fee: number;
  tax_rate: number;
}

export default function CartPage() {
  const { language } = useLanguage();
  const { items, removeItem, updateQuantity, clearCart, getTotalAmount, getItemCount } = useCartStore();
  const [editOpen, setEditOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | undefined>(undefined);
  const [editMeal, setEditMeal] = useState<MealForCustomize | null>(null);
  const [initialSelectedIds, setInitialSelectedIds] = useState<string[] | undefined>(undefined);
  const [initialQuantity, setInitialQuantity] = useState<number | undefined>(undefined);
  const [settings, setSettings] = useState<Settings>({ delivery_fee: 5.0, tax_rate: 0.15 });
  const [mounted, setMounted] = useState(false);

  // Hydration fix: only render cart content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get('/settings');
        if (response.data) {
          setSettings({
            delivery_fee: response.data.delivery_fee ?? 5.0,
            tax_rate: response.data.tax_rate ?? 0.15,
          });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        // Use defaults if API fails
      }
    };
    loadSettings();
  }, []);
  return (
    <>
      <div className="min-h-screen bg-background relative overflow-hidden" dir={language === 'ar' || language === 'he' ? 'rtl' : 'ltr'}>
        {/* Premium animated background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent/5 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 md:py-4 pb-6 sm:pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-3 sm:mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {getTranslation('common', 'cart', language)}
              </h1>
            </div>
            <div className="grid lg:grid-cols-3 gap-3 sm:gap-4 md:gap-4 lg:gap-5">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-2.5 sm:space-y-3">
                {items.map((item) => (
                  <Card key={item.id} className="card-premium overflow-hidden group rounded-lg sm:rounded-xl">
                    <CardHeader className="pb-2 sm:pb-2.5 p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-muted to-accent/10 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                          <span className="text-xl sm:text-2xl md:text-3xl">🍽️</span>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                            <CardTitle className="text-sm sm:text-base md:text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors">
                              {item.meal.name}
                            </CardTitle>
                            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    setEditingItemId(item.id);
                                    setInitialSelectedIds(item.selectedIngredients.map(si => si.id));
                                    setInitialQuantity(item.quantity);
                                    const res = await mealsApi.getById(item.mealId);
                                    const payload: any = res.data?.data ?? res.data;
                                    const meal: MealForCustomize = {
                                      _id: payload._id || payload.id || payload?._id?.$oid,
                                      id: payload.id || payload._id || payload?._id?.$oid,
                                      name: payload.name && typeof payload.name === 'object'
                                        ? { en: payload.name?.en ?? payload.name_en ?? payload.name ?? item.meal.name, ar: payload.name?.ar ?? payload.name_ar ?? '', he: payload.name?.he ?? payload.name_he ?? '' }
                                        : (payload.name_en ?? payload.name ?? item.meal.name),
                                      description: payload.description && typeof payload.description === 'object'
                                        ? { en: payload.description?.en ?? payload.description_en ?? payload.description ?? '', ar: payload.description?.ar ?? payload.description_ar ?? '', he: payload.description?.he ?? payload.description_he ?? '' }
                                        : (payload.description_en ?? payload.description ?? ''),
                                      price: Number(payload.price ?? item.meal.price ?? 0),
                                      image_url: payload.image_url || payload.image || payload.imageUrl,
                                      ingredients: payload.ingredients || [],
                                    };
                                    setEditMeal(meal);
                                    setEditOpen(true);
                                  } catch (e) {
                                    setEditMeal({
                                      id: item.mealId,
                                      name: item.meal.name,
                                      price: item.meal.price,
                                    });
                                    setEditOpen(true);
                                  }
                                }}
                                className="h-7 w-7 sm:h-8 sm:w-8 md:w-auto md:px-3 hover:bg-accent hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 p-0 md:p-2"
                                title="Edit"
                              >
                                <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                <span className="hidden md:inline ml-2 text-xs">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="h-7 w-7 sm:h-8 sm:w-8 px-0 sm:px-2 text-destructive hover:bg-destructive/10 hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                title="Remove"
                              >
                                <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                            {formatPrice(item.meal.price, language)} <span className="text-[10px] sm:text-xs font-normal">each</span>
                          </p>
                          {(item.selectedIngredients.length > 0 || (item.removedIngredients && item.removedIngredients.length > 0) || item.specialInstructions) && (
                            <div className="mt-1.5 sm:mt-2 md:mt-2.5 pt-1.5 sm:pt-2 md:pt-2.5 border-t border-border/50 space-y-1 sm:space-y-1.5 md:space-y-1.5">
                              {item.selectedIngredients.length > 0 && (
                                <div className="flex gap-1.5 sm:gap-2">
                                  <span className="text-[10px] sm:text-xs font-semibold text-success shrink-0">+ Added:</span>
                                  <span className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                                    {item.selectedIngredients.map(si => si.name).join(', ')}
                                  </span>
                                </div>
                              )}
                              {item.removedIngredients && item.removedIngredients.length > 0 && (
                                <div className="flex gap-1.5 sm:gap-2">
                                  <span className="text-[10px] sm:text-xs font-semibold text-destructive shrink-0">- Removed:</span>
                                  <span className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                                    {item.removedIngredients
                                      .map((ri: any) => typeof ri === 'string' ? ri : ri.name)
                                      .join(', ')}
                                  </span>
                                </div>
                              )}
                              {item.specialInstructions && (
                                <div className="flex gap-1.5 sm:gap-2">
                                  <span className="text-[10px] sm:text-xs font-semibold text-foreground shrink-0">Note:</span>
                                  <span className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                                    {item.specialInstructions}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex items-center justify-between bg-muted/30 p-3 sm:p-4">
                      <div className="flex items-center gap-1.5 sm:gap-2 bg-card rounded-full p-1 shadow-sm border border-border">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-destructive/10 hover:text-destructive disabled:opacity-30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                          title="Decrease quantity"
                        >
                          <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </Button>
                        <span className="w-8 sm:w-10 text-center font-bold text-xs sm:text-sm tabular-nums">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                          title="Increase quantity"
                        >
                          <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Total</p>
                        <p className="text-base sm:text-lg md:text-xl font-bold text-primary tabular-nums">
                          {formatPrice(item.totalPrice, language)}
                        </p>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="card-premium lg:sticky lg:top-20 rounded-lg sm:rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-br from-primary/5 to-accent/5 relative p-3 sm:p-4">
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      {getTranslation('common', 'orderSummary', language)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-2.5 p-3 sm:p-4">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">{getTranslation('common', 'subtotal', language)}</span>
                      <span className="font-semibold tabular-nums">{mounted ? formatPrice(getTotalAmount(), language) : '...'}</span>
                    </div>
                    {mounted && settings.tax_rate > 0 && (
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">{getTranslation('common', 'tax', language)} ({(settings.tax_rate * 100).toFixed(0)}%)</span>
                        <span className="font-semibold tabular-nums">{formatPrice(getTotalAmount() * settings.tax_rate, language)}</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-2 sm:pt-2.5 mt-2 sm:mt-2.5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm sm:text-base font-bold">{getTranslation('common', 'total', language)}</span>
                        <span className="text-lg sm:text-xl font-bold text-primary tabular-nums">
                          {mounted ? formatPrice(getTotalAmount() + (getTotalAmount() * settings.tax_rate), language) : '...'}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
                        Delivery fee ({mounted ? formatPrice(settings.delivery_fee, language) : '...'}) will be added at checkout if delivery is selected
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2 sm:gap-2.5 bg-muted/20 p-3 sm:p-4">
                    <Link href="/checkout" className="w-full">
                      <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all font-semibold text-sm sm:text-base h-11 sm:h-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                        {getTranslation('common', 'proceedToCheckout', language)}
                      </Button>
                    </Link>
                    <Link href="/menu" className="w-full">
                      <Button variant="outline" size="lg" className="w-full rounded-lg sm:rounded-xl hover:bg-accent hover:scale-[1.02] active:scale-95 transition-all text-sm sm:text-base h-10 sm:h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                        {getTranslation('common', 'continueShopping', language)}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MealCustomizeModal
        open={editOpen}
        onOpenChange={(v) => {
          setEditOpen(v);
          if (!v) {
            setEditingItemId(undefined);
            setEditMeal(null);
          }
        }}
        meal={editMeal}
        mode="edit"
        editingItemId={editingItemId}
        initialQuantity={initialQuantity}
        initialSelectedIds={initialSelectedIds}
      />
    </>
  );
}