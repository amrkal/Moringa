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
      <div className="min-h-screen bg-[hsl(var(--background))]" dir={language === 'ar' || language === 'he' ? 'rtl' : 'ltr'}>
  <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto bg-[hsl(var(--muted))] rounded-3xl flex items-center justify-center mb-6">
                <ShoppingBag className="h-16 w-16 text-[hsl(var(--muted-foreground))]" />
              </div>
              <h1 className="text-3xl font-semibold text-[hsl(var(--foreground))] mb-3">
                {getTranslation('common', 'emptyCart', language)}
              </h1>
              <p className="text-[hsl(var(--muted-foreground))] text-lg">
                {getTranslation('common', 'startShopping', language)}
              </p>
            </div>
            
            <Link href="/menu">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm hover:shadow-md transition-all">
                {getTranslation('common', 'menu', language)}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = getTotalAmount();
  const itemCount = getItemCount();

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]" dir={language === 'ar' || language === 'he' ? 'rtl' : 'ltr'}>
  <div className="container mx-auto px-4 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-semibold text-[hsl(var(--foreground))]">
              {getTranslation('common', 'cart', language)} 
              <span className="ml-3 text-lg font-medium text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-4 py-1.5 rounded-xl">
                {itemCount} {itemCount === 1 ? getTranslation('common', 'itemInCart', language) : getTranslation('common', 'itemsInCart', language)}
              </span>
            </h1>
            <Button 
              variant="outline" 
              onClick={clearCart}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 border-[hsl(var(--border))] rounded-xl"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {getTranslation('common', 'remove', language)}
            </Button>
          </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[hsl(var(--muted))] flex items-center justify-center">
                        <span className="text-2xl">🍽️</span>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {item.meal.name}
                        </CardTitle>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                          {formatPrice(item.meal.price, language)} each
                        </p>
                        
                        {item.selectedIngredients.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                              {getTranslation('common', 'addedIngredients', language)}:
                            </p>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                              {item.selectedIngredients.map(si => si.name).join(', ')}
                            </p>
                          </div>
                        )}
                        
                        {item.removedIngredients && item.removedIngredients.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                              {getTranslation('common', 'removedIngredients', language)}:
                            </p>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                              {item.removedIngredients
                                .map((ri: any) => typeof ri === 'string' ? ri : ri.name)
                                .join(', ')}
                            </p>
                          </div>
                        )}
                        
                        {item.specialInstructions && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                              {getTranslation('common', 'specialInstructions', language)}:
                            </p>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.specialInstructions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
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
                        className="text-[hsl(var(--foreground))]"
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardFooter className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-semibold text-primary">
                      {formatPrice(item.totalPrice, language)}
                    </p>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>{getTranslation('common', 'orderSummary', language)}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>{getTranslation('common', 'subtotal', language)}</span>
                  <span>{formatPrice(totalAmount, language)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>{getTranslation('common', 'deliveryFee', language)}</span>
                  <span>{formatPrice(2.99, language)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>{getTranslation('common', 'tax', language)}</span>
                  <span>{formatPrice(totalAmount * 0.08, language)}</span>
                </div>
                
                <hr />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>{getTranslation('common', 'total', language)}</span>
                  <span className="text-primary">
                    {formatPrice(totalAmount + 2.99 + (totalAmount * 0.08), language)}
                  </span>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-2">
                <Link href="/checkout" className="w-full">
                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    {getTranslation('common', 'proceedToCheckout', language)}
                  </Button>
                </Link>
                
                <Link href="/menu" className="w-full">
                  <Button variant="outline" size="lg" className="w-full">
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