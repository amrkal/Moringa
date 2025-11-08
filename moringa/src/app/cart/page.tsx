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
      <div className="min-h-screen bg-background flex items-center justify-center px-2 sm:px-4 relative overflow-hidden" dir={language === 'ar' || language === 'he' ? 'rtl' : 'ltr'}>
        {/* Subtle animated background for modern feel */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/3 left-1/4 w-60 h-60 sm:w-96 sm:h-96 bg-primary/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-1/3 right-1/4 w-60 h-60 sm:w-96 sm:h-96 bg-accent/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
        </div>
        <div className="max-w-md w-full mx-auto text-center">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-muted to-accent/20 flex items-center justify-center ring-2 ring-primary/10">
              <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {getTranslation('common', 'emptyCart', language)}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed">
            {getTranslation('common', 'startShopping', language)}
          </p>
          <Link href="/menu">
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all px-6 sm:px-8">
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
    <div className="min-h-screen bg-background relative overflow-hidden" dir={language === 'ar' || language === 'he' ? 'rtl' : 'ltr'}>
      {/* Premium animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent/5 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {getTranslation('common', 'cart', language)}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <span className="inline-flex items-center justify-center text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full bg-primary/10 text-primary">
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
              <span className="hidden sm:inline">{getTranslation('common', 'remove', language)}</span>
              <span className="sm:hidden">Clear</span>
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="card-premium overflow-hidden group rounded-2xl p-2 sm:p-4 flex flex-row items-center gap-2 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{item.meal.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm sm:text-base line-clamp-1">{item.meal.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{formatPrice(item.meal.price, language)}</div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-semibold text-base px-1 sm:px-2 tabular-nums">{item.quantity}</span>
                    <button
                      className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-col items-end gap-1 sm:gap-2">
                    <span className="font-bold text-base tabular-nums">{formatPrice(item.totalPrice, language)}</span>
                    <button
                      className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition"
                      onClick={() => removeItem(item.id)}
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
            {/* Order Summary */}
            <div className="space-y-4">
              <Card className="rounded-2xl p-4 bg-muted/30">
                <CardContent className="pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-base sm:text-lg font-bold">{getTranslation('common', 'total', language)}</span>
                    <span className="text-xl sm:text-2xl font-bold text-primary tabular-nums">
                      {formatPrice(totalAmount + 2.99 + (totalAmount * 0.08), language)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{getTranslation('common', 'subtotal', language)}</span>
                    <span>{formatPrice(totalAmount, language)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{getTranslation('common', 'delivery', language)}</span>
                    <span>{formatPrice(2.99, language)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{getTranslation('common', 'tax', language)}</span>
                    <span>{formatPrice(totalAmount * 0.08, language)}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 bg-muted/20 p-4 sm:p-6">
                  <Link href="/checkout" className="w-full">
                    <Button size="lg" className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all font-semibold">
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
          </div> {/* end grid */}
        </div> {/* end max-w-6xl */}
      </div> {/* end container */}

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
  );
}