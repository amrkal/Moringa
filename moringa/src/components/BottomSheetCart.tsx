"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCartStore } from "@/store/cart";
import Link from "next/link";
import { X, Minus, Plus, ShoppingCart } from "lucide-react";

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

  // Hide trigger if empty
  if (count <= 0) return null;

  return (
    <>
      {/* Trigger bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 md:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label={`View cart with ${count} ${count === 1 ? 'item' : 'items'}, total $${total.toFixed(2)}`}
          className="w-full flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-400 text-white px-5 py-3 rounded-full shadow-lg active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-2 font-semibold">
            <ShoppingCart className="w-5 h-5 text-white" />
            <span>{count} {count === 1 ? "item" : "items"}</span>
          </div>
          <div className="font-bold">${'{'}total.toFixed(2){'}'}</div>
          <div className="text-sm font-bold">View</div>
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

            {/* Items */}
            <div className="max-h-[50vh] overflow-auto px-4 pb-4" role="list" aria-label="Cart items">
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-3 py-3 border-b border-border/60" role="listitem">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{it.meal.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {it.selectedIngredients?.map((i) => i.name).join(", ") || "No extras"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2" role="group" aria-label="Quantity controls">
                    <button
                      onClick={() => updateQuantity(it.id, it.quantity - 1)}
                      className="p-2 rounded-md bg-muted hover:bg-muted/80"
                      aria-label={`Decrease quantity of ${it.meal.name}`}
                    >
                      <Minus className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <div className="w-8 text-center font-semibold" aria-label={`Quantity: ${it.quantity}`}>
                      {it.quantity}
                    </div>
                    <button
                      onClick={() => updateQuantity(it.id, it.quantity + 1)}
                      className="p-2 rounded-md bg-muted hover:bg-muted/80"
                      aria-label={`Increase quantity of ${it.meal.name}`}
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="w-20 text-right tabular-nums font-semibold" aria-label={`Price: $${it.totalPrice.toFixed(2)}`}>
                    ${'{'}it.totalPrice.toFixed(2){'}'}
                  </div>
                  <button
                    onClick={() => removeItem(it.id)}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                    aria-label={`Remove ${it.meal.name} from cart`}
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-card rounded-t-3xl">
              <div className="flex items-center justify-between mb-3">
                <div className="text-muted-foreground">Subtotal</div>
                <div className="text-xl font-bold tabular-nums">${'{'}total.toFixed(2){'}'}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-xl border border-border font-medium hover:bg-muted"
                >
                  Continue browsing
                </button>
                <Link href="/cart" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl bg-primary text-primary-foreground text-center font-semibold hover:bg-primary/90">
                  View cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
