import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { MealGrid } from '@/components/MealGrid';
import { SearchBar } from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { categoryId: string };
  searchParams: { search?: string };
}) {
  const { categoryId } = params;
  const { search } = searchParams;

  // Fetch category with meals
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
      isActive: true,
    },
    include: {
      meals: {
        where: {
          isActive: true,
          ...(search && {
            OR: [
              { name: { contains: search } },
              { description: { contains: search } },
            ],
          }),
        },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/menu">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Menu
          </Button>
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{category.name}</h1>
        <p className="text-lg text-gray-600 mb-6">{category.description}</p>
        
        <SearchBar />
      </div>

      {category.meals.length > 0 ? (
        <MealGrid meals={category.meals.map(meal => ({
          ...meal,
          ingredients: meal.ingredients.map(ing => ({
            ...ing,
            ingredient: {
              ...ing.ingredient,
              description: ing.ingredient.description ?? undefined
            }
          }))
        }))} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {search 
              ? `No meals found matching "${search}" in ${category.name}`
              : `No meals available in ${category.name} category`
            }
          </p>
        </div>
      )}
    </div>
  );
}