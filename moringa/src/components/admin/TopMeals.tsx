"use client";

import React from 'react';
import { useAnalyticsPopularMeals, RangeParams } from '@/hooks/useAnalytics';
import { Award } from 'lucide-react';

export function TopMeals({ range, limit = 5 }: { range?: RangeParams; limit?: number }) {
  const { data = [], isLoading } = useAnalyticsPopularMeals(range, limit);

  return (
    <div className="card-premium p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Top {limit} Meals</h3>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="text-sm text-muted-foreground">No data for selected period</div>
      ) : (
        <ul className="space-y-2">
          {data.slice(0, limit).map((m, idx) => (
            <li key={m.meal_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`h-8 w-8 rounded-lg border flex items-center justify-center ${idx === 0 ? 'border-amber-400 text-amber-600' : 'border-border text-muted-foreground'}`}>
                  {idx < 3 ? <Award className="h-4 w-4" /> : <span className="text-xs font-semibold">#{idx + 1}</span>}
                </div>
                <span className="truncate text-sm font-medium">{m.meal_name}</span>
              </div>
              <div className="text-xs text-muted-foreground shrink-0">{m.order_count} orders</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
