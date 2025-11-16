"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCartStore } from "@/store/cart";
import Link from "next/link";
import { X, Minus, Plus, ShoppingCart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

function useLockBody(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);
}

export default function BottomSheetCart() {
  const items = useCartStore((s) => s.items);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const getTotalAmount = useCartStore((s) => s.getTotalAmount);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const [open, setOpen] = useState(false);
  const total = getTotalAmount();
  const count = getItemCount();

  useLockBody(open);

  // Close on route change (safety)
  useEffect(() => {
    const handler = () => setOpen(false);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  // Hide trigger if empty - show empty state in drawer instead
  const isEmpty = count <= 0;

  return (
    <>
      {/* Trigger bar - always show on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 md:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label={isEmpty ? 'View empty cart' : `View cart with ${count} ${count === 1 ? 'item' : 'items'}, total $${total.toFixed(2)}`}
          className="w-full flex items-center justify-between bg-gradient-to-r from-primary to-accent text-white px-5 py-3.5 rounded-full shadow-lg active:scale-[0.98] transition-all hover:shadow-xl"
        >
          <div className="flex items-center gap-2.5 font-semibold">
            <ShoppingCart className="w-5 h-5 text-white" />
            <span>{isEmpty ? 'Cart' : `${count} ${count === 1 ? "item" : "items"}`}</span>
          </div>
          {!isEmpty && (
            <>
              <div className="font-bold tabular-nums">${total.toFixed(2)}</div>
              <div className="text-sm font-bold">View</div>
            </>
          )}
          {isEmpty && <div className="text-sm font-medium opacity-80">Empty</div>}
        </button>
      </div>

      {/* Sheet overlay */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div 
            className="absolute left-0 right-0 bottom-0 rounded-t-3xl bg-background border-t border-border shadow-2xl"
            role="dialog"
            aria-label="Shopping cart"
            aria-modal="true"
          >
            {/* Handle */}
            <div className="pt-3 flex justify-center" aria-hidden="true">
              <div className="h-1.5 w-12 rounded-full bg-muted" />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="text-lg font-semibold">Your cart</div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-muted"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items or Empty State */}
            {isEmpty ? (
              <div className="px-4 py-12 text-center">
                <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Your cart is empty</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Add some delicious meals to get started!
                </p>
                <Button variant="solid" onClick={() => setOpen(false)} className="mx-auto">
                  Browse Menu
                </Button>
              </div>
            ) : (
              <div className="max-h-[50vh] overflow-auto px-4 pb-4" role="list" aria-label="Cart items">
                {items.map((it) => (
                  <div key={it.id} className="flex flex-col gap-2 py-3 border-b border-border/60 last:border-0" role="listitem">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground">{it.meal.name}</div>
                        
                        {/* Show added ingredients */}
                        {it.selectedIngredients && it.selectedIngredients.length > 0 && (
                          <div className="text-xs text-success mt-1">
                            + {it.selectedIngredients.map((i) => i.name).join(", ")}
                          </div>
                        )}
                        
                        {/* Show removed ingredients */}
                        {it.removedIngredients && it.removedIngredients.length > 0 && (
                          <div className="text-xs text-destructive mt-0.5">
                            - {it.removedIngredients.map((ri: any) => typeof ri === 'string' ? ri : ri.name).join(", ")}
                          </div>
                        )}
                        
                        {/* Show special instructions */}
                        {it.specialInstructions && (
                          <div className="text-xs text-muted-foreground mt-0.5 italic">
                            Note: {it.specialInstructions}
                          </div>
                        )}
                      </div>
                      
                      <div className="w-20 text-right">
                        <div className="text-sm font-semibold text-foreground tabular-nums">${it.totalPrice.toFixed(2)}</div>
                      </div>
                      
                      <button
                        onClick={() => removeItem(it.id)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                        aria-label={`Remove ${it.meal.name} from cart`}
                      >
                        <X className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-1.5" role="group" aria-label="Quantity controls">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(it.id, it.quantity - 1)}
                        aria-label={`Decrease quantity of ${it.meal.name}`}
                        className="h-8 w-8 rounded-md"
                      >
                        <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                      </Button>
                      <div className="w-8 text-center font-semibold text-sm tabular-nums" aria-label={`Quantity: ${it.quantity}`}>
                        {it.quantity}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(it.id, it.quantity + 1)}
                        aria-label={`Increase quantity of ${it.meal.name}`}
                        className="h-8 w-8 rounded-md"
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer with totals - only show if not empty */}
            {!isEmpty && (
              <div className="p-4 border-t-2 border-border bg-card">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
                  <div className="text-sm text-muted-foreground font-medium">Subtotal</div>
                  <div className="text-2xl font-bold tabular-nums text-foreground">${total.toFixed(2)}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="h-11"
                  >
                    Keep browsing
                  </Button>
                  <Button
                    variant="solid"
                    asChild
                    className="h-11"
                  >
                    <Link href="/cart" onClick={() => setOpen(false)}>
                      View cart
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
