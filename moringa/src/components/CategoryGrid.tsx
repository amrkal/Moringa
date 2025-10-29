'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';

interface CategoryGridProps {
  categories: {
    id: string;
    name: string;
    name_en?: string;
    name_ar?: string;
    name_he?: string;
    description: string;
    description_en?: string;
    description_ar?: string;
    description_he?: string;
    image: string;
    mealCount: number;
  }[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const { t, language } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category) => (
        <Link key={category.id} href={`/menu/${category.id}`}>
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
            <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                <span className="text-4xl">🍽️</span>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-xl">
                {t(category.name, { en: category.name_en, ar: category.name_ar, he: category.name_he })}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {t(category.description, { en: category.description_en, ar: category.description_ar, he: category.description_he })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                {category.mealCount} {category.mealCount === 1 
                  ? getTranslation('common', 'mealAvailable', language)
                  : getTranslation('common', 'mealsAvailable', language)
                }
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}