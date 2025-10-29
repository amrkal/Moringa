'use client';

import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { Minus, Plus, Trash2, ShoppingBag, Pencil } from 'lucide-react';
import Link from 'next/link';
// Note: using theme classes for consistency
import StepHeader from '@/components/StepHeader';
import MealCustomizeModal, { MealForCustomize } from '@/components/MealCustomizeModal';
import { mealsApi } from '@/lib/api';
import { useState } from 'react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotalAmount, getItemCount } = useCartStore();
  const [editOpen, setEditOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | undefined>(undefined);
  const [editMeal, setEditMeal] = useState<MealForCustomize | null>(null);
  const [initialSelectedIds, setInitialSelectedIds] = useState<string[] | undefined>(undefined);
  const [initialQuantity, setInitialQuantity] = useState<number | undefined>(undefined);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <StepHeader />
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-300" />
            <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Your Cart is Empty</h1>
            <p className="text-gray-600">
              Looks like you haven&apos;t added any items to your cart yet.
            </p>
          </div>
          
          <Link href="/menu">
            <Button size="lg" className="bg-primary hover:opacity-90 text-primary-foreground">
              Browse Menu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalAmount = getTotalAmount();
  const itemCount = getItemCount();

  return (
    <div className="container mx-auto px-4 py-8">
      <StepHeader />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
          <Button 
            variant="outline" 
            onClick={clearCart}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Cart
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
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                          <span className="text-2xl">🍽️</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{item.meal.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatPrice(item.meal.price)} each
                        </p>
                        
                        {item.selectedIngredients.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700">Added ingredients:</p>
                            <p className="text-sm text-gray-600">
                              {item.selectedIngredients.map(si => si.name).join(', ')}
                            </p>
                          </div>
                        )}
                        
                        {item.specialInstructions && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700">Special instructions:</p>
                            <p className="text-sm text-gray-600">{item.specialInstructions}</p>
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
                              name_en: payload.name_en || payload.name?.en || payload.name || item.meal.name,
                              name_ar: payload.name_ar || payload.name?.ar || '',
                              name_he: payload.name_he || payload.name?.he || '',
                              description_en: payload.description_en || payload.description?.en || payload.description || '',
                              description_ar: payload.description_ar || payload.description?.ar || '',
                              description_he: payload.description_he || payload.description?.he || '',
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
                              name_en: item.meal.name,
                              name_ar: item.meal.name,
                              name_he: item.meal.name,
                              price: item.meal.price,
                            });
                            setEditOpen(true);
                          }
                        }}
                        className="text-gray-700"
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700"
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
                      {formatPrice(item.totalPrice)}
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
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{formatPrice(2.99)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatPrice(totalAmount * 0.08)}</span>
                </div>
                
                <hr />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatPrice(totalAmount + 2.99 + (totalAmount * 0.08))}
                  </span>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-2">
                <Link href="/checkout" className="w-full">
                  <Button size="lg" className="w-full bg-primary hover:opacity-90 text-primary-foreground">
                    Proceed to Checkout
                  </Button>
                </Link>
                
                <Link href="/menu" className="w-full">
                  <Button variant="outline" size="lg" className="w-full">
                    Continue Shopping
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
  );
}