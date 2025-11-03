'use client';

import { usePathname } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../lib/translations';
import { Check } from 'lucide-react';

function currentStepFromPath(path: string): string {
  if (path.startsWith('/checkout')) return 'checkout';
  if (path.startsWith('/cart')) return 'cart';
  if (path.startsWith('/menu')) return 'menu';
  return 'menu';
}

export default function StepHeader() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const current = currentStepFromPath(pathname || '/');

  const steps = [
    { key: 'menu', label: getTranslation('common', 'menu', language) },
    { key: 'cart', label: getTranslation('common', 'cart', language) },
    { key: 'checkout', label: getTranslation('common', 'checkout', language) },
    { key: 'confirmation', label: getTranslation('common', 'confirmation', language) },
  ];

  const currentIndex = steps.findIndex((s) => s.key === current);

  return (
    <div className="w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 md:gap-4 py-4">
          {steps.map((step, index) => {
            const isActive = step.key === current;
            const isCompleted = index < currentIndex;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.key} className="flex items-center gap-2">
                {/* Step circle and label */}
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                      isCompleted
                        ? 'bg-primary border-primary text-primary-foreground'
                        : isActive
                        ? 'border-primary text-primary bg-primary-soft'
                        : 'border-[hsl(var(--input))] text-[hsl(var(--muted-foreground))] bg-[hsl(var(--card))]'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium hidden sm:inline transition-colors ${
                      isActive ? 'text-primary' : isCompleted ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div
                    className={`h-0.5 w-8 md:w-12 transition-colors ${
                      isCompleted ? 'bg-primary' : 'bg-[hsl(var(--muted))]'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
