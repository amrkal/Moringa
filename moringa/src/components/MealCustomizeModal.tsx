"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MealImage } from "@/components/ui/optimized-image";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/lib/translations";
import { getLocalizedText } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import api, { ingredientsApi } from "@/lib/api";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

type Translation = { en?: string; ar?: string; he?: string };

type Ingredient = {
  _id?: string;
  id?: string;
  name?: Translation | string;
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
  name: Translation | string;
  description?: Translation | string;
  price: number;
  image_url?: string;
  ingredients?: MealIngredient[];
};

function getName(item: { name?: Translation | string } | undefined, language: 'en' | 'ar' | 'he') {
  if (!item) return "";
  const raw = item.name;
  if (!raw) return "";
  if (typeof raw === 'string') return raw;
  const full = { en: raw.en ?? '', ar: raw.ar ?? '', he: raw.he ?? '' };
  return getLocalizedText(full, language);
}

function getDesc(item: { description?: Translation | string } | undefined, language: 'en' | 'ar' | 'he') {
  if (!item) return "";
  const raw = item.description;
  if (!raw) return "";
  if (typeof raw === 'string') return raw;
  const full = { en: raw.en ?? '', ar: raw.ar ?? '', he: raw.he ?? '' };
  return getLocalizedText(full, language);
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
  const { language } = useLanguage();
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
    if (!open) {
      // Reset state when closing
      setQuantity(1);
      setSelectedExtras({});
      setRemovedDefaults({});
      return;
    }
    // Prefill for add/edit
    setQuantity(initialQuantity && initialQuantity > 0 ? initialQuantity : 1);
    const init: Record<string, boolean> = {};
    (initialSelectedIds || []).forEach((id) => (init[id] = true));
    setSelectedExtras(init);
    setRemovedDefaults({});
    
    // Debug log
    console.log('Modal opened with:', { 
      mode, 
      meal: meal ? getName(meal, language) : undefined, 
      mealId: meal?.id || meal?._id,
      ingredients: meal?.ingredients,
      initialQuantity, 
      initialSelectedIds 
    });
  }, [open, meal?._id, meal?.id, initialQuantity, initialSelectedIds, mode, meal, meal?.ingredients, language]);

  const ingredientById = useMemo(() => {
    const map = new Map<string, Ingredient>();
    allIngredients.forEach((ing) => {
      // Map all possible ID formats
      if (ing._id) map.set(ing._id, ing);
      if (ing.id) map.set(ing.id, ing);
      // Also try without any prefix
      const cleanId = (ing._id || ing.id || "").replace(/^(ObjectId\()?["']?/, '').replace(/["']\)?$/, '');
      if (cleanId) map.set(cleanId, ing);
    });
    console.log('Ingredient map created with', map.size, 'entries. Keys:', Array.from(map.keys()).slice(0, 5), '...');
    console.log('All ingredients:', allIngredients.map(i => ({ id: i.id, _id: i._id })));
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
        // Get price from the ingredient object
        let ing = ingredientById.get(id);
        if (!ing) {
          const cleanId = id.replace(/^(ObjectId\()?["']?/, '').replace(/["']\)?$/, '');
          ing = ingredientById.get(cleanId);
        }
        total += ing?.price || mi.extra_price || 0;
      }
    });
    return total;
  }, [optionals, selectedExtras, ingredientById]);

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
          let ing = ingredientById.get(mi.ingredient_id);
          if (!ing) {
            const cleanId = mi.ingredient_id.replace(/^(ObjectId\()?["']?/, '').replace(/["']\)?$/, '');
            ing = ingredientById.get(cleanId);
          }
          return {
            id: mi.ingredient_id,
            name: ing ? getName(ing, language) : mi.ingredient_id,
            price: ing?.price || mi.extra_price || 0,
          };
        });

      // Get list of removed default ingredients
  const removedDefaultIngredients = defaults
        .filter((mi) => removedDefaults[mi.ingredient_id])
        .map((mi) => {
          let ing = ingredientById.get(mi.ingredient_id);
          if (!ing) {
            const cleanId = mi.ingredient_id.replace(/^(ObjectId\()?["']?/, '').replace(/["']\)?$/, '');
            ing = ingredientById.get(cleanId);
          }
          return {
            id: mi.ingredient_id,
            name: ing ? getName(ing, language) : mi.ingredient_id,
            price: 0,
          };
        });

      if (mode === 'edit' && editingItemId) {
        // Update existing cart item
  updateIngredients(editingItemId, selected, removedDefaultIngredients);
        updateQuantity(editingItemId, quantity);
      } else {
        // Add as new cart item
        // Extract English name as string for cart (API requires meal_name as string)
        const mealNameEn = typeof meal.name === 'string' 
          ? meal.name 
          : (meal.name?.en || meal.name?.ar || meal.name?.he || '');

        addItem({
          mealId: (meal._id || meal.id || "").toString(),
          meal: {
            id: (meal._id || meal.id || "").toString(),
            name: mealNameEn,
            price: meal.price,
          },
          quantity,
          selectedIngredients: selected,
          removedIngredients: removedDefaultIngredients.length > 0 ? removedDefaultIngredients : undefined,
        });
      }

      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {!meal ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading meal details...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header with optional small image for edit mode */}
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {getName(meal, language)}
                  </DialogTitle>
                  {getDesc(meal, language) && (
                    <DialogDescription>{getDesc(meal, language)}</DialogDescription>
                  )}
                </DialogHeader>
              </div>
              
              {/* Small image in edit mode */}
              {mode === 'edit' && meal.image_url && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <MealImage
                    src={meal.image_url}
                    alt={getName(meal, language)}
                    priority
                  />
                </div>
              )}
            </div>

            {/* Smaller image in add mode */}
            {mode === 'add' && meal.image_url && (
              <div className="relative w-full h-40 rounded-lg overflow-hidden bg-muted">
                <MealImage
                  src={meal.image_url}
                  alt={getName(meal, language)}
                  priority
                />
              </div>
            )}

            {/* Ingredients Section */}
            {(defaults.length > 0 || optionals.length > 0) ? (
              <>
                {/* Included by default */}
                {defaults.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-foreground">
                      {getTranslation('common', 'includedByDefault', language)}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {defaults.map((mi) => {
                        // Try multiple ID formats
                        let ing = ingredientById.get(mi.ingredient_id);
                        if (!ing) {
                          const cleanId = mi.ingredient_id.replace(/^(ObjectId\()?["']?/, '').replace(/["']\)?$/, '');
                          ing = ingredientById.get(cleanId);
                        }
                        
                        // Debug: log if ingredient not found
                        if (!ing) {
                          console.warn('Ingredient not found for ID:', mi.ingredient_id, 'Map has:', ingredientById.size, 'entries');
                          console.warn('Tried IDs:', [mi.ingredient_id, mi.ingredient_id.replace(/^(ObjectId\()?["']?/, '').replace(/["']\)?$/, '')]);
                        }
                        const computed = ing ? (getName(ing, language) || (ing as any).name) : undefined;
                        const label = computed && String(computed).trim().length > 0
                          ? String(computed)
                          : `[${mi.ingredient_id.substring(0, 8)}...]`;
                        const removed = removedDefaults[mi.ingredient_id];
                        return (
                          <button
                            key={`def-${mi.ingredient_id}`}
                            type="button"
                            onClick={() => toggleDefault(mi.ingredient_id)}
                            className={`px-3 py-1.5 rounded-full text-sm border transition ${
                              removed
                                ? 'bg-destructive-soft text-destructive border-[hsl(var(--destructive))/0.3]'
                                : 'bg-muted text-foreground border-border'
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
                    <div className="text-sm font-medium text-foreground">
                      {getTranslation('common', 'addExtras', language)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {optionals.map((mi) => {
                        // Try multiple ID formats
                        let ing = ingredientById.get(mi.ingredient_id);
                        if (!ing) {
                          const cleanId = mi.ingredient_id.replace(/^(ObjectId\()?["']?/, '').replace(/["']\)?$/, '');
                          ing = ingredientById.get(cleanId);
                        }
                        
                        // Debug: log if ingredient not found
                        if (!ing) {
                          console.warn('Optional ingredient not found for ID:', mi.ingredient_id);
                        }
                        const computed = ing ? (getName(ing, language) || (ing as any).name) : undefined;
                        const label = computed && String(computed).trim().length > 0
                          ? String(computed)
                          : `[${mi.ingredient_id.substring(0, 8)}...]`;
                        // Get price from the ingredient object, not from MealIngredient
                        const price = ing?.price || mi.extra_price || 0;
                        const selected = selectedExtras[mi.ingredient_id] || false;
                        return (
                          <label
                            key={`opt-${mi.ingredient_id}`}
                            className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition ${
                              selected ? 'border-primary bg-primary/10' : 'border-border bg-card'
                            }`}
                          >
                            <div>
                              <div className="font-medium text-foreground">{label}</div>
                              <div className="text-sm text-muted-foreground">+ {formatPrice(price, language)}</div>
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
              </>
            ) : (
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  This meal has no customizable ingredients. Adjust quantity below.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="w-9 h-9 rounded-full bg-muted text-foreground hover:bg-muted/80 transition"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  -
                </button>
                <div className="min-w-[2ch] text-center font-semibold text-foreground">{quantity}</div>
                <button
                  type="button"
                  className="w-9 h-9 rounded-full bg-muted text-foreground hover:bg-muted/80 transition"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>

              <Button disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={onConfirm}>
                {mode === 'edit' ? getTranslation('common', 'save', language) || 'Save' : getTranslation('common', 'addToCart', language)} • {formatPrice(computedPrice, language)}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
