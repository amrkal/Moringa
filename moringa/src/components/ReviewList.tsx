'use client';

import React from 'react';
import { ThumbsUp, ThumbsDown, Shield, MessageCircle } from 'lucide-react';
import StarRating from './StarRating';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  photos: string[];
  is_verified: boolean;
  helpful_count: number;
  unhelpful_count: number;
  admin_response?: string;
  admin_response_at?: string;
  created_at: string;
}

interface ReviewListProps {
  reviews: Review[];
  onHelpful?: (reviewId: string) => void;
  onUnhelpful?: (reviewId: string) => void;
}

export default function ReviewList({
  reviews,
  onHelpful,
  onUnhelpful,
}: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-muted-foreground">No reviews yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Be the first to review this meal
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-card border border-border rounded-xl p-6 space-y-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {review.user_name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* User Info */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-foreground">
                    {review.user_name}
                  </h4>
                  {review.is_verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-full border border-green-200 dark:border-green-900">
                      <Shield className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} size="sm" readonly />
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(review.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Comment */}
          <p className="text-foreground leading-relaxed">{review.comment}</p>

          {/* Photos */}
          {review.photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {review.photos.map((photo, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden border border-border group cursor-pointer"
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${photo}`}
                    alt={`Review photo ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Admin Response */}
          {review.admin_response && (
            <div className="ml-6 pl-4 border-l-2 border-primary/30 bg-primary/5 rounded-r-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary-foreground">
                    M
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Moringa Restaurant
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {review.admin_response_at &&
                      formatDistanceToNow(new Date(review.admin_response_at), {
                        addSuffix: true,
                      })}
                  </p>
                </div>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {review.admin_response}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-2 border-t border-border">
            <button
              onClick={() => onHelpful?.(review.id)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ThumbsUp className="h-4 w-4 group-hover:fill-current" />
              <span>Helpful ({review.helpful_count})</span>
            </button>
            <button
              onClick={() => onUnhelpful?.(review.id)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ThumbsDown className="h-4 w-4 group-hover:fill-current" />
              <span>Not Helpful ({review.unhelpful_count})</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
