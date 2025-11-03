'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { MealDetailsDialog } from '@/components/MealDetailsDialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { getLocalizedText } from '@/lib/i18n';

interface MealGridProps {
  meals: Array<{
    id: string;
    name?: { en?: string; ar?: string; he?: string } | string;
    description?: { en?: string; ar?: string; he?: string } | string;
    price: number;
    image: string;
    ingredients: Array<{
      id: string;
      isOptional: boolean;
      isDefault: boolean;
      ingredient: {
        id: string;
        name?: { en?: string; ar?: string; he?: string } | string;
        price: number;
        description?: { en?: string; ar?: string; he?: string } | string;
      };
    }>;
  }>;
}

export function MealGrid({ meals }: MealGridProps) {
  const [selectedMeal, setSelectedMeal] = useState<typeof meals[0] | null>(null);
  const { language } = useLanguage();

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {meals.map((meal) => (
          <Card key={meal.id} className="hover:shadow-md transition-shadow duration-200">
            <div className="aspect-video bg-[hsl(var(--muted))] rounded-t-lg overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--accent))/0.15] to-[hsl(var(--primary))/0.15] flex items-center justify-center">
                <span className="text-3xl">🍽️</span>
              </div>
            </div>
            <CardHeader className="p-3">
              <CardTitle className="text-base">
                {getLocalizedText(
                  typeof meal.name === 'string'
                    ? { en: meal.name, ar: '', he: '' }
                    : { en: meal.name?.en ?? '', ar: meal.name?.ar ?? '', he: meal.name?.he ?? '' },
                  language
                )}
              </CardTitle>
              <CardDescription className="line-clamp-2 text-xs">
                {getLocalizedText(
                  typeof meal.description === 'string'
                    ? { en: meal.description, ar: '', he: '' }
                    : { en: meal.description?.en ?? '', ar: meal.description?.ar ?? '', he: meal.description?.he ?? '' },
                  language
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-xl font-bold text-success">
                {formatPrice(meal.price, language)}
              </p>
              {meal.ingredients.length > 0 && (
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  {getTranslation('common', 'customizableWith', language)} {meal.ingredients.length} {getTranslation('common', 'ingredientOptions', language)}
                </p>
              )}
            </CardContent>
            <CardFooter className="p-3 pt-0">
              <Button 
                className="w-full py-2 text-sm"
                onClick={() => setSelectedMeal(meal)}
              >
                <Plus className="mr-2 h-4 w-4" />
                {getTranslation('common', 'addToCart', language)}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <MealDetailsDialog
        meal={selectedMeal}
        open={!!selectedMeal}
        onOpenChange={(open: boolean) => !open && setSelectedMeal(null)}
      />
    </>
  );
}