"use client";

import { usePathname } from 'next/navigation';

const steps = [
  { key: 'enter', label: 'Enter', href: '/' },
  { key: 'menu', label: 'Menu', href: '/menu' },
  { key: 'basket', label: 'Basket', href: '/cart' },
  { key: 'payment', label: 'Payment', href: '/checkout' },
];

function currentStepFromPath(path: string): string {
  if (path.startsWith('/checkout')) return 'payment';
  if (path.startsWith('/cart')) return 'basket';
  if (path.startsWith('/menu')) return 'menu';
  return 'enter';
}

export default function StepHeader() {
  const pathname = usePathname();
  const current = currentStepFromPath(pathname || '/');

  return (
    <div className="w-full border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <ol className="flex items-center justify-center gap-4 py-4 text-sm">
          {steps.map((s, idx) => {
            const isActive = s.key === current;
            const isCompleted = steps.findIndex((x) => x.key === current) > idx;
            return (
              <li key={s.key} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border text-xs font-semibold transition ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : isCompleted
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'bg-gray-100 text-gray-600 border-gray-300'
                  }`}
                >
                  {idx + 1}
                </div>
                <span className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>{s.label}</span>
                {idx < steps.length - 1 && (
                  <span className="mx-2 h-px w-8 bg-gray-200" aria-hidden />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
