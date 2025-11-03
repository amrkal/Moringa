'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { getLocalizedText } from '@/lib/i18n';

interface CategoryGridProps {
  categories: {
    id: string;
    name?: { en?: string; ar?: string; he?: string } | string;
    description?: { en?: string; ar?: string; he?: string } | string;
    image: string;
    mealCount: number;
  }[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const { language } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category) => (
        <Link key={category.id} href={`/menu/${category.id}`}>
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
            <div className="aspect-video bg-[hsl(var(--muted))] rounded-t-lg overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                <span className="text-4xl">🍽️</span>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-xl">
                {getLocalizedText(
                  typeof category.name === 'string'
                    ? { en: category.name, ar: '', he: '' }
                    : { en: category.name?.en ?? '', ar: category.name?.ar ?? '', he: category.name?.he ?? '' },
                  language
                )}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {getLocalizedText(
                  typeof category.description === 'string'
                    ? { en: category.description, ar: '', he: '' }
                    : { en: category.description?.en ?? '', ar: category.description?.ar ?? '', he: category.description?.he ?? '' },
                  language
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
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