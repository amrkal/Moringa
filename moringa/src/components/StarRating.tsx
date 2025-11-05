'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showLabel?: boolean;
}

export default function StarRating({
  rating,
  onRatingChange,
  size = 'md',
  readonly = false,
  showLabel = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-8 w-8',
  };

  const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`transition-all ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            }`}
          >
            <Star
              className={`${sizes[size]} transition-colors ${
                value <= displayRating
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-none text-gray-300 dark:text-gray-600'
              }`}
              strokeWidth={2}
            />
          </button>
        ))}
        {showLabel && displayRating > 0 && (
          <span className="ml-2 text-sm font-medium text-muted-foreground">
            {labels[displayRating - 1]}
          </span>
        )}
      </div>
      {!readonly && hoverRating > 0 && (
        <p className="text-xs text-muted-foreground">
          Click to rate {hoverRating} star{hoverRating > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
