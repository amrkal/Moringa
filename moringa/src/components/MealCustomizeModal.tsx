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
  ingredient_type: string;  // "required" | "removable" | "extra"
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

  // Split ingredients by type
  const removableIngredients = useMemo(() => {
    return meal?.ingredients?.filter((mi) => mi.ingredient_type === 'removable') || [];
  }, [meal]);

  const extraIngredients = useMemo(() => {
    return meal?.ingredients?.filter((mi) => mi.ingredient_type === 'extra') || [];
  }, [meal]);

  // Note: "required" ingredients are hidden from customers

  const extrasTotal = useMemo(() => {
    let total = 0;
    extraIngredients.forEach((mi) => {
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
  }, [extraIngredients, selectedExtras, ingredientById]);

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
      const selected = extraIngredients
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

      // Get list of removed removable ingredients
      const removedDefaultIngredients = removableIngredients
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background via-background to-muted/20 border-2 border-border/50 shadow-2xl">
        {!meal ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading meal details...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Smaller image in add mode */}
            {mode === 'add' && meal.image_url && (
              <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-accent/10 shadow-lg">
                <MealImage
                  src={meal.image_url}
                  alt={getName(meal, language)}
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <DialogTitle className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                    {getName(meal, language)}
                  </DialogTitle>
                  {getDesc(meal, language) && (
                    <DialogDescription className="text-white/90 mt-2 drop-shadow">
                      {getDesc(meal, language)}
                    </DialogDescription>
                  )}
                </div>
              </div>
            )}

            {/* Header for edit mode */}
            {mode === 'edit' && (
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <DialogHeader>
                    <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {getName(meal, language)}
                    </DialogTitle>
                    {getDesc(meal, language) && (
                      <DialogDescription className="text-base mt-2">{getDesc(meal, language)}</DialogDescription>
                    )}
                  </DialogHeader>
                </div>
                
                {/* Small image in edit mode */}
                {meal.image_url && (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0 ring-2 ring-primary/20 shadow-lg">
                    <MealImage
                      src={meal.image_url}
                      alt={getName(meal, language)}
                      priority
                    />
                  </div>
                )}
              </div>
            )}

            {/* Ingredients Section */}
            {(removableIngredients.length > 0 || extraIngredients.length > 0) ? (
              <div className="space-y-5">
                {/* Included by default - Removable ingredients */}
                {removableIngredients.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-primary"></div>
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                        {getTranslation('common', 'includedByDefault', language)}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {removableIngredients.map((mi) => {
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
                            key={`removable-${mi.ingredient_id}`}
                            type="button"
                            onClick={() => toggleDefault(mi.ingredient_id)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all hover:scale-105 active:scale-95 ${
                              removed
                                ? 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-900 shadow-sm'
                                : 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-900'
                            }`}
                          >
                            {removed ? '− Remove' : '✓ Included'} • {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Extras - ingredients with extra price */}
                {extraIngredients.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-accent"></div>
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                        {getTranslation('common', 'addExtras', language)}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {extraIngredients.map((mi) => {
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
                            key={`extra-${mi.ingredient_id}`}
                            className={`flex items-center justify-between rounded-xl border-2 p-4 cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                              selected 
                                ? 'border-primary bg-primary/10 shadow-md' 
                                : 'border-border bg-card hover:border-primary/50 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex-1">
                              <div className="font-semibold text-foreground text-sm">{label}</div>
                              <div className="text-sm font-bold text-primary">+ {formatPrice(price, language)}</div>
                            </div>
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                              selected 
                                ? 'border-primary bg-primary' 
                                : 'border-border bg-background'
                            }`}>
                              {selected && <span className="text-primary-foreground text-sm">✓</span>}
                            </div>
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={selected}
                              onChange={() => toggleExtra(mi.ingredient_id)}
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-muted to-accent/10 rounded-xl p-6 text-center border-2 border-dashed border-border">
                <p className="text-sm text-muted-foreground font-medium">
                  This meal has no customizable ingredients. Adjust quantity below.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t-2 border-border/50">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-muted-foreground">Quantity:</span>
                <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-1.5 border-2 border-border">
                  <button
                    type="button"
                    className="w-10 h-10 rounded-lg bg-card hover:bg-destructive/10 hover:text-destructive text-foreground font-bold transition-all hover:scale-110 active:scale-95 border border-border"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    −
                  </button>
                  <div className="min-w-[3ch] text-center font-bold text-lg text-foreground tabular-nums">{quantity}</div>
                  <button
                    type="button"
                    className="w-10 h-10 rounded-lg bg-card hover:bg-primary/10 hover:text-primary text-foreground font-bold transition-all hover:scale-110 active:scale-95 border border-border"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <Button 
                disabled={loading} 
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all font-bold text-base px-8 py-6" 
                onClick={onConfirm}
              >
                {mode === 'edit' ? getTranslation('common', 'save', language) || 'Save' : getTranslation('common', 'addToCart', language)} • {formatPrice(computedPrice, language)}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
