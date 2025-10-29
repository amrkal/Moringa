'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { MealDetailsDialog } from '@/components/MealDetailsDialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';

interface MealGridProps {
  meals: Array<{
    id: string;
    name: string;
    name_en?: string;
    name_ar?: string;
    name_he?: string;
    description: string;
    description_en?: string;
    description_ar?: string;
    description_he?: string;
    price: number;
    image: string;
    ingredients: Array<{
      id: string;
      isOptional: boolean;
      isDefault: boolean;
      ingredient: {
        id: string;
        name: string;
        name_en?: string;
        name_ar?: string;
        name_he?: string;
        price: number;
        description?: string;
        description_en?: string;
        description_ar?: string;
        description_he?: string;
      };
    }>;
  }>;
}

export function MealGrid({ meals }: MealGridProps) {
  const [selectedMeal, setSelectedMeal] = useState<typeof meals[0] | null>(null);
  const { t, language } = useLanguage();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meals.map((meal) => (
          <Card key={meal.id} className="hover:shadow-lg transition-shadow duration-200">
            <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <span className="text-4xl">🍽️</span>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-xl">
                {t(meal.name, { en: meal.name_en, ar: meal.name_ar, he: meal.name_he })}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {t(meal.description, { en: meal.description_en, ar: meal.description_ar, he: meal.description_he })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(meal.price)}
              </p>
              {meal.ingredients.length > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  {getTranslation('common', 'customizableWith', language)} {meal.ingredients.length} {getTranslation('common', 'ingredientOptions', language)}
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
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