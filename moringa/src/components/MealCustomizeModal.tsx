"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
// Use native <img> to avoid next/image domain restrictions for arbitrary URLs
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import api, { ingredientsApi } from "@/lib/api";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

type Ingredient = {
  _id?: string;
  id?: string;
  name_en: string;
  name_ar: string;
  name_he: string;
  price?: number;
};

export type MealIngredient = {
  ingredient_id: string;
  is_optional?: boolean;
  is_default?: boolean;
  extra_price?: number;
};

export type MealForCustomize = {
  _id?: string;
  id?: string;
  name_en: string;
  name_ar: string;
  name_he: string;
  description_en?: string;
  description_ar?: string;
  description_he?: string;
  price: number;
  image_url?: string;
  ingredients?: MealIngredient[];
};

function useLocalized() {
  const { language } = useLanguage();
  const name = (item: { [k: string]: any; name_en: string }) =>
    (item[`name_${language}`] as string) || item.name_en;
  const description = (item: { [k: string]: any; description_en?: string }) =>
    (item[`description_${language}`] as string) || item.description_en || "";
  return { language, name, description };
}

export default function MealCustomizeModal({
  open,
  onOpenChange,
  meal,
  mode = 'add',
  editingItemId,
  initialQuantity,
  initialSelectedIds,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  meal: MealForCustomize | null;
  mode?: 'add' | 'edit';
  editingItemId?: string;
  initialQuantity?: number;
  initialSelectedIds?: string[];
}) {
  const { language, name, description } = useLocalized();
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const updateIngredients = useCartStore((s) => s.updateIngredients);
  const [loading, setLoading] = useState(false);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<Record<string, boolean>>({});
  const [removedDefaults, setRemovedDefaults] = useState<Record<string, boolean>>({});

  // Load ingredients when opened
  useEffect(() => {
    if (!open) return;
    let mounted = true;
    (async () => {
      try {
        const res = await ingredientsApi.getAll();
        if (mounted) setAllIngredients(res.data);
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Prefill for add/edit
    setQuantity(initialQuantity && initialQuantity > 0 ? initialQuantity : 1);
    const init: Record<string, boolean> = {};
    (initialSelectedIds || []).forEach((id) => (init[id] = true));
    setSelectedExtras(init);
    setRemovedDefaults({});
  }, [open, meal?._id, meal?.id, initialQuantity, initialSelectedIds]);

  const ingredientById = useMemo(() => {
    const map = new Map<string, Ingredient>();
    allIngredients.forEach((ing) => {
      const key = ing._id || ing.id || "";
      if (key) map.set(key, ing);
    });
    return map;
  }, [allIngredients]);

  const defaults = useMemo(() => {
    return (
      meal?.ingredients?.filter((mi) => mi.is_default) || []
    );
  }, [meal]);

  const optionals = useMemo(() => {
    return (
      meal?.ingredients?.filter((mi) => !mi.is_default) || []
    );
  }, [meal]);

  const extrasTotal = useMemo(() => {
    let total = 0;
    optionals.forEach((mi) => {
      const id = mi.ingredient_id;
      if (selectedExtras[id]) {
        total += mi.extra_price || 0;
      }
    });
    return total;
  }, [optionals, selectedExtras]);

  const computedPrice = useMemo(() => {
    const base = meal?.price || 0;
    return (base + extrasTotal) * quantity;
  }, [meal?.price, extrasTotal, quantity]);

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleDefault = (id: string) => {
    setRemovedDefaults((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const onConfirm = () => {
    if (!meal) return;
    setLoading(true);
    try {
      const selected = optionals
        .filter((mi) => selectedExtras[mi.ingredient_id])
        .map((mi) => {
          const ing = ingredientById.get(mi.ingredient_id);
          return {
            id: mi.ingredient_id,
            name: ing ? name(ing) : mi.ingredient_id,
            price: mi.extra_price || 0,
          };
        });

      if (mode === 'edit' && editingItemId) {
        // Update existing cart item
        updateIngredients(editingItemId, selected);
        updateQuantity(editingItemId, quantity);
      } else {
        // Add as new cart item
        addItem({
          mealId: (meal._id || meal.id || "").toString(),
          meal: {
            id: (meal._id || meal.id || "").toString(),
            name: name(meal),
            price: meal.price,
          },
          quantity,
          selectedIngredients: selected,
        });
      }

      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {meal && (
          <div className="space-y-4">
            {/* Header */}
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {name(meal)}
              </DialogTitle>
              {description(meal) && (
                <DialogDescription>{description(meal)}</DialogDescription>
              )}
            </DialogHeader>

            {/* Image */}
            {meal.image_url && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img src={meal.image_url} alt={name(meal)} className="w-full h-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
              </div>
            )}

            {/* Included by default */}
            {defaults.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-900">
                  {getTranslation('common', 'includedByDefault', language)}
                </div>
                <div className="flex flex-wrap gap-2">
                  {defaults.map((mi) => {
                    const ing = ingredientById.get(mi.ingredient_id);
                    const label = ing ? name(ing) : mi.ingredient_id;
                    const removed = removedDefaults[mi.ingredient_id];
                    return (
                      <button
                        key={`def-${mi.ingredient_id}`}
                        type="button"
                        onClick={() => toggleDefault(mi.ingredient_id)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition ${
                          removed
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        }`}
                      >
                        {removed ? 'Remove' : 'Included'} • {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Extras */}
            {optionals.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-900">
                  {getTranslation('common', 'addExtras', language)}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {optionals.map((mi) => {
                    const ing = ingredientById.get(mi.ingredient_id);
                    const label = ing ? name(ing) : mi.ingredient_id;
                    const price = mi.extra_price || 0;
                    const selected = selectedExtras[mi.ingredient_id] || false;
                    return (
                      <label
                        key={`opt-${mi.ingredient_id}`}
                        className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition ${
                          selected ? 'border-primary bg-primary-softer' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-gray-900">{label}</div>
                          <div className="text-sm text-gray-500">+ {formatPrice(price)}</div>
                        </div>
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={selected}
                          onChange={() => toggleExtra(mi.ingredient_id)}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="w-9 h-9 rounded-full bg-gray-100 text-gray-900"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  -
                </button>
                <div className="min-w-[2ch] text-center font-semibold">{quantity}</div>
                <button
                  type="button"
                  className="w-9 h-9 rounded-full bg-gray-100 text-gray-900"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>

              <Button disabled={loading} className="bg-primary text-white" onClick={onConfirm}>
                {mode === 'edit' ? getTranslation('common', 'save', language) || 'Save' : getTranslation('common', 'addToCart', language)} • {formatPrice(computedPrice)}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
