'use client';

import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { Minus, Plus, Trash2, ShoppingBag, Pencil } from 'lucide-react';
import Link from 'next/link';
import MealCustomizeModal, { MealForCustomize } from '@/components/MealCustomizeModal';
import { mealsApi } from '@/lib/api';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { getLocalizedText } from '@/lib/i18n';

export default function CartPage() {
  const { language } = useLanguage();
  const { items, removeItem, updateQuantity, clearCart, getTotalAmount, getItemCount } = useCartStore();
  const [editOpen, setEditOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | undefined>(undefined);
  const [editMeal, setEditMeal] = useState<MealForCustomize | null>(null);
  const [initialSelectedIds, setInitialSelectedIds] = useState<string[] | undefined>(undefined);
  const [initialQuantity, setInitialQuantity] = useState<number | undefined>(undefined);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center px-4" dir={language === 'ar' || language === 'he' ? 'rtl' : 'ltr'}>
        <div className="max-w-md mx-auto text-center">
          <div className="relative w-40 h-40 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-full h-full bg-gradient-to-br from-muted to-accent/10 rounded-full flex items-center justify-center shadow-xl">
              <ShoppingBag className="h-20 w-20 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            {getTranslation('common', 'emptyCart', language)}
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            {getTranslation('common', 'startShopping', language)}
          </p>
          
          <Link href="/menu">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all px-8">
              <ShoppingBag className="mr-2 h-5 w-5" />
              {getTranslation('common', 'menu', language)}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalAmount = getTotalAmount();
  const itemCount = getItemCount();

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]" dir={language === 'ar' || language === 'he' ? 'rtl' : 'ltr'}>
  <div className="container mx-auto px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {getTranslation('common', 'cart', language)}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <span className="inline-flex items-center justify-center text-sm font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
                  {itemCount} {itemCount === 1 ? getTranslation('common', 'itemInCart', language) : getTranslation('common', 'itemsInCart', language)}
                </span>
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={clearCart}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 border-border rounded-xl hover:scale-105 active:scale-95 transition-all self-start sm:self-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {getTranslation('common', 'remove', language)}
            </Button>
          </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="hover:shadow-medium transition-all duration-500 border-border/50 overflow-hidden group rounded-2xl" style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.04)' }}>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-muted to-accent/10 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                      <span className="text-3xl sm:text-4xl">🍽️</span>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">
                          {item.meal.name}
                        </CardTitle>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                setEditingItemId(item.id);
                                setInitialSelectedIds(item.selectedIngredients.map(si => si.id));
                                setInitialQuantity(item.quantity);
                                // Fetch meal details for ingredients
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
                                // fallback: open minimal edit with current price only
                                setEditMeal({
                                  id: item.mealId,
                                  name: item.meal.name,
                                  price: item.meal.price,
                                });
                                setEditOpen(true);
                              }
                            }}
                            className="h-8 px-2 hover:bg-accent hover:scale-105 active:scale-95 transition-all"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:scale-105 active:scale-95 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">
                        {formatPrice(item.meal.price, language)} <span className="text-xs font-normal">each</span>
                      </p>
                      
                      {(item.selectedIngredients.length > 0 || (item.removedIngredients && item.removedIngredients.length > 0) || item.specialInstructions) && (
                        <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                          {item.selectedIngredients.length > 0 && (
                            <div className="flex gap-2">
                              <span className="text-xs font-semibold text-success shrink-0">+ Added:</span>
                              <span className="text-xs text-muted-foreground line-clamp-1">
                                {item.selectedIngredients.map(si => si.name).join(', ')}
                              </span>
                            </div>
                          )}
                          
                          {item.removedIngredients && item.removedIngredients.length > 0 && (
                            <div className="flex gap-2">
                              <span className="text-xs font-semibold text-destructive shrink-0">- Removed:</span>
                              <span className="text-xs text-muted-foreground line-clamp-1">
                                {item.removedIngredients
                                  .map((ri: any) => typeof ri === 'string' ? ri : ri.name)
                                  .join(', ')}
                              </span>
                            </div>
                          )}
                          
                          {item.specialInstructions && (
                            <div className="flex gap-2">
                              <span className="text-xs font-semibold text-foreground shrink-0">Note:</span>
                              <span className="text-xs text-muted-foreground line-clamp-2">
                                {item.specialInstructions}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardFooter className="flex items-center justify-between bg-muted/30 pt-4">
                  <div className="flex items-center gap-2 bg-card rounded-full p-1 shadow-sm border border-border">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive disabled:opacity-30 transition-all"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="w-10 text-center font-bold text-sm tabular-nums">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-0.5">Total</p>
                    <p className="text-xl font-bold text-primary tabular-nums">
                      {formatPrice(item.totalPrice, language)}
                    </p>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 border-border/50 rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.06)' }}>
              <CardHeader className="bg-gradient-to-br from-primary/5 to-accent/5">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  {getTranslation('common', 'orderSummary', language)}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{getTranslation('common', 'subtotal', language)}</span>
                  <span className="font-semibold tabular-nums">{formatPrice(totalAmount, language)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{getTranslation('common', 'deliveryFee', language)}</span>
                  <span className="font-semibold tabular-nums">{formatPrice(2.99, language)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{getTranslation('common', 'tax', language)}</span>
                  <span className="font-semibold tabular-nums">{formatPrice(totalAmount * 0.08, language)}</span>
                </div>
                
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">{getTranslation('common', 'total', language)}</span>
                    <span className="text-2xl font-bold text-primary tabular-nums">
                      {formatPrice(totalAmount + 2.99 + (totalAmount * 0.08), language)}
                    </span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-3 bg-muted/20">
                <Link href="/checkout" className="w-full">
                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all font-semibold">
                    {getTranslation('common', 'proceedToCheckout', language)}
                  </Button>
                </Link>
                
                <Link href="/menu" className="w-full">
                  <Button variant="outline" size="lg" className="w-full rounded-xl hover:bg-accent hover:scale-[1.02] active:scale-95 transition-all">
                    {getTranslation('common', 'continueShopping', language)}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
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
    </div>
    </div>
  );
}