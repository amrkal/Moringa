"use client";

import React from "react";

export function CategoryChipsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-9 w-24 rounded-full bg-[hsl(var(--muted))]/70 animate-pulse"
        />
      ))}
    </div>
  );
}

export function MealGridSkeleton({ cards = 8 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="card-premium overflow-hidden">
          <div className="aspect-square bg-[hsl(var(--muted))]/70 animate-pulse" />
          <div className="p-4 space-y-2">
            <div className="h-4 w-2/3 rounded bg-[hsl(var(--muted))]/70 animate-pulse" />
            <div className="h-3 w-full rounded bg-[hsl(var(--muted))]/60 animate-pulse" />
            <div className="h-3 w-5/6 rounded bg-[hsl(var(--muted))]/50 animate-pulse" />
            <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))]/50">
              <div className="h-4 w-16 rounded bg-[hsl(var(--muted))]/60 animate-pulse" />
              <div className="h-8 w-20 rounded-full bg-[hsl(var(--muted))]/70 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
