'use client';

import { useState } from 'react';
import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { getLocalizedText } from '@/lib/i18n';

type Translation = { en?: string; ar?: string; he?: string };

interface MealDetailsDialogProps {
  meal: {
    id: string;
    name?: Translation | string;
    description?: Translation | string;
    price: number;
    image: string;
    ingredients: Array<{
      id: string;
      isOptional: boolean;
      isDefault: boolean;
      ingredient: {
        id: string;
        name?: Translation | string;
        price: number;
        description?: Translation | string;
      };
    }>;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MealDetailsDialog({ meal, open, onOpenChange }: MealDetailsDialogProps) {
  const [quantity, setQuantity] = useState(1);
  // We track selected ingredient IDs for extras and defaults, but only extras impact price
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const addItem = useCartStore((state) => state.addItem);
  const { language } = useLanguage();

  // Initialize selected ingredients when meal changes
  React.useEffect(() => {
    if (meal) {
      const defaults = meal.ingredients
        .filter((mi) => mi.isDefault)
        .map((mi) => mi.ingredient.id);
      setSelectedIngredients(defaults);
    }
  }, [meal]);

  if (!meal) return null;

  const toggleIngredient = (ingredientId: string, isOptional: boolean) => {
    if (!isOptional) return; // Non-optional ingredients cannot be changed
    setSelectedIngredients((prev) =>
      prev.includes(ingredientId)
        ? prev.filter((id) => id !== ingredientId)
        : [...prev, ingredientId]
    );
  };

  const calculateTotal = () => {
    // Only charge for extras (non-default ingredients that are selected)
    const extrasPrice = selectedIngredients.reduce((total, ingredientId) => {
      const mi = meal.ingredients.find((mi) => mi.ingredient.id === ingredientId);
      if (!mi) return total;
      const isExtra = !mi.isDefault; // default ones are included in base price
      return total + (isExtra ? (mi.ingredient.price || 0) : 0);
    }, 0);
    return (meal.price + extrasPrice) * quantity;
  };

  const handleAddToCart = () => {
    // Build selected extras payload with name and price for cart calculations
    const extras = selectedIngredients
      .map((id) => meal.ingredients.find((mi) => mi.ingredient.id === id))
      .filter((mi): mi is NonNullable<typeof mi> => Boolean(mi))
      .filter((mi) => !mi.isDefault) // only extras are billable
      .map((mi) => ({
        id: mi.ingredient.id,
        name: getLocalizedText(
          typeof mi.ingredient.name === 'string'
            ? { en: mi.ingredient.name, ar: '', he: '' }
            : { en: mi.ingredient.name?.en ?? '', ar: mi.ingredient.name?.ar ?? '', he: mi.ingredient.name?.he ?? '' },
          language
        ),
        price: mi.ingredient.price || 0,
      }));

    // Track removed default ingredients
    const defaultIngredientIds = meal.ingredients
      .filter((mi) => mi.isDefault)
      .map((mi) => mi.ingredient.id);
    const removedDefaults = defaultIngredientIds.filter((id) => !selectedIngredients.includes(id));
    const removedDefaultsDetailed = removedDefaults
      .map((id) => meal.ingredients.find((mi) => mi.ingredient.id === id))
      .filter((mi): mi is NonNullable<typeof mi> => Boolean(mi))
      .map((mi) => ({
        id: mi.ingredient.id,
        name: getLocalizedText(
          typeof mi.ingredient.name === 'string'
            ? { en: mi.ingredient.name, ar: '', he: '' }
            : { en: mi.ingredient.name?.en ?? '', ar: mi.ingredient.name?.ar ?? '', he: mi.ingredient.name?.he ?? '' },
          language
        ),
        price: 0,
      }));

    // Extract English name as string for cart (API requires meal_name as string)
    const mealNameEn = typeof meal.name === 'string' 
      ? meal.name 
      : (meal.name?.en || meal.name?.ar || meal.name?.he || '');

    addItem({
      mealId: meal.id,
      meal: {
        id: meal.id,
        name: mealNameEn,
        price: meal.price,
      },
      quantity,
      selectedIngredients: extras,
  removedIngredients: removedDefaultsDetailed.length > 0 ? removedDefaultsDetailed : undefined,
      specialInstructions,
    });

    const localizedName = getLocalizedText(
      typeof meal.name === 'string'
        ? { en: meal.name, ar: '', he: '' }
        : { en: meal.name?.en ?? '', ar: meal.name?.ar ?? '', he: meal.name?.he ?? '' },
      language
    );
    toast.success(`${localizedName} added to cart!`);
    onOpenChange(false);
    
    // Reset form
    setQuantity(1);
    setSpecialInstructions('');
    const defaults = meal.ingredients
      .filter((mi) => mi.isDefault)
      .map((mi) => mi.ingredient.id);
    setSelectedIngredients(defaults);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {getLocalizedText(
              typeof meal.name === 'string'
                ? { en: meal.name, ar: '', he: '' }
                : { en: meal.name?.en ?? '', ar: meal.name?.ar ?? '', he: meal.name?.he ?? '' },
              language
            )}
          </DialogTitle>
          <DialogDescription>
            {getLocalizedText(
              typeof meal.description === 'string'
                ? { en: meal.description, ar: '', he: '' }
                : { en: meal.description?.en ?? '', ar: meal.description?.ar ?? '', he: meal.description?.he ?? '' },
              language
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Meal Image */}
          <div className="aspect-video bg-[hsl(var(--muted))] rounded-lg overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
              <span className="text-6xl">🍽️</span>
            </div>
          </div>

          {/* Ingredients */}
          {meal.ingredients.length > 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">{getTranslation('common', 'includedByDefault', language)}</h3>
                <div className="space-y-2">
                  {meal.ingredients.filter(mi => mi.isDefault).map((mi) => {
                    const ingredient = mi.ingredient;
                    const isSelected = selectedIngredients.includes(ingredient.id);
                    return (
                      <div
                        key={`def-${ingredient.id}`}
                        className="flex items-center justify-between p-3 border rounded-lg bg-[hsl(var(--muted))]"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={!mi.isOptional}
                            onChange={() => toggleIngredient(ingredient.id, mi.isOptional)}
                            className="rounded border-[hsl(var(--input))] disabled:opacity-50"
                          />
                          <div>
                            <p className="font-medium">
                              {getLocalizedText(
                                typeof ingredient.name === 'string'
                                  ? { en: ingredient.name, ar: '', he: '' }
                                  : { en: ingredient.name?.en ?? '', ar: ingredient.name?.ar ?? '', he: ingredient.name?.he ?? '' },
                                language
                              )}
                            </p>
                            {ingredient.description && (
                              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                {getLocalizedText(
                                  typeof ingredient.description === 'string'
                                    ? { en: ingredient.description, ar: '', he: '' }
                                    : { en: ingredient.description?.en ?? '', ar: ingredient.description?.ar ?? '', he: ingredient.description?.he ?? '' },
                                  language
                                )}
                              </p>
                            )}
                            {!mi.isOptional && (
                              <span className="text-xs text-success">{getTranslation('common', 'required', language)}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">{getTranslation('common', 'included', language)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">{getTranslation('common', 'addExtras', language)}</h3>
                <div className="space-y-2">
                  {meal.ingredients.filter(mi => !mi.isDefault).map((mi) => {
                    const ingredient = mi.ingredient;
                    const isSelected = selectedIngredients.includes(ingredient.id);
                    return (
                      <div
                        key={`extra-${ingredient.id}`}
                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-[hsl(var(--muted))]"
                        onClick={() => toggleIngredient(ingredient.id, true)}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleIngredient(ingredient.id, true)}
                            className="rounded border-[hsl(var(--input))]"
                          />
                          <div>
                            <p className="font-medium">
                              {getLocalizedText(
                                typeof ingredient.name === 'string'
                                  ? { en: ingredient.name, ar: '', he: '' }
                                  : { en: ingredient.name?.en ?? '', ar: ingredient.name?.ar ?? '', he: ingredient.name?.he ?? '' },
                                language
                              )}
                            </p>
                            {ingredient.description && (
                              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                {getLocalizedText(
                                  typeof ingredient.description === 'string'
                                    ? { en: ingredient.description, ar: '', he: '' }
                                    : { en: ingredient.description?.en ?? '', ar: ingredient.description?.ar ?? '', he: ingredient.description?.he ?? '' },
                                  language
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                        {ingredient.price > 0 && (
                          <span className="font-medium text-success">
                            +{formatPrice(ingredient.price, language)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {getTranslation('common', 'specialInstructions', language)} ({getTranslation('common', 'optional', language)})
            </label>
            <Textarea
              placeholder="Any special requests or dietary notes..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={3}
            />
          </div>

          {/* Quantity and Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium">{getTranslation('common', 'quantity', language)}:</label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">{getTranslation('common', 'total', language)}</p>
              <p className="text-2xl font-bold text-success">
                {formatPrice(calculateTotal(), language)}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddToCart}>
            {getTranslation('common', 'addToCart', language)} - {formatPrice(calculateTotal(), language)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}