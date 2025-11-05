'use client';

import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import api from '@/lib/api';

interface MealRatingProps {
  mealId: string;
  showCount?: boolean;
  size?: 'sm' | 'md';
}

interface RatingStats {
  average_rating: number;
  total_reviews: number;
}

// Cache for rating stats with 5 minute expiry
const statsCache = new Map<string, { data: RatingStats; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Pending requests to avoid duplicate fetches
const pendingRequests = new Map<string, Promise<RatingStats>>();

// Export function to clear cache (useful when a new review is added)
export function clearRatingCache(mealId?: string) {
  if (mealId) {
    statsCache.delete(mealId);
  } else {
    statsCache.clear();
  }
}

export default function MealRating({ mealId, showCount = true, size = 'sm' }: MealRatingProps) {
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatingStats();
  }, [mealId]);

  const fetchRatingStats = async () => {
    try {
      // Check cache first
      const cached = statsCache.get(mealId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setStats(cached.data);
        setLoading(false);
        return;
      }

      // Check if there's already a pending request for this meal
      let request = pendingRequests.get(mealId);
      
      if (!request) {
        // Create new request
        request = api.get(`/reviews/meal/${mealId}/stats`).then(response => {
          const data = response.data;
          // Cache the result
          statsCache.set(mealId, { data, timestamp: Date.now() });
          // Remove from pending
          pendingRequests.delete(mealId);
          return data;
        });
        pendingRequests.set(mealId, request);
      }

      const data = await request;
      setStats(data);
    } catch (error) {
      console.error('Error fetching rating stats:', error);
      setStats({ average_rating: 0, total_reviews: 0 });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats || stats.total_reviews === 0) {
    return null;
  }

  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        <Star className={`${iconSize} fill-amber-400 text-amber-400`} strokeWidth={2} />
        <span className={`${textSize} font-semibold text-foreground`}>
          {stats.average_rating.toFixed(1)}
        </span>
      </div>
      {showCount && (
        <span className={`${textSize} text-muted-foreground`}>
          ({stats.total_reviews})
        </span>
      )}
    </div>
  );
}
