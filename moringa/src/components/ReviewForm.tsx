'use client';

import React, { useState } from 'react';
import { X, Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import StarRating from './StarRating';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  mealId: string;
  mealName: string;
  orderId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  mealId,
  mealName,
  orderId,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (photos.length + files.length > 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }

    // Validate file types and sizes
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setPhotos([...photos, ...validFiles]);
    setPhotoPreviews([...photoPreviews, ...newPreviews]);
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    
    // Revoke object URL to free memory
    URL.revokeObjectURL(photoPreviews[index]);
    
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      setError('Please write a review');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create review
      const reviewData = {
        meal_id: mealId,
        order_id: orderId,
        rating,
        comment: comment.trim(),
      };

      const response = await api.post('/reviews', reviewData);
      const reviewId = response.data.id;

      // Upload photos if any
      if (photos.length > 0) {
        const formData = new FormData();
        photos.forEach((photo) => {
          formData.append('files', photo);
        });

        await api.post(`/reviews/${reviewId}/photos`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      toast.success('Review submitted successfully!');
      
      // Clean up
      photoPreviews.forEach(URL.revokeObjectURL);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError(
        err.response?.data?.detail || 'Failed to submit review. Please try again.'
      );
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h3 className="text-lg font-semibold text-foreground">Write a Review</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Share your experience with {mealName}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <StarRating
          rating={rating}
          onRatingChange={setRating}
          size="lg"
          showLabel
        />
      </div>

      {/* Comment */}
      <div>
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience with this meal..."
          rows={5}
          className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Minimum 10 characters ({comment.length}/500)
        </p>
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Add Photos (Optional)
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          Upload up to 5 photos (max 5MB each)
        </p>

        {/* Photo Previews */}
        {photoPreviews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
            {photoPreviews.map((preview, index) => (
              <div key={index} className="relative aspect-square group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-border"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {photos.length < 5 && (
          <label
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer bg-background hover:bg-muted/50 transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Click to upload photos
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, JPEG (max 5MB)
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handlePhotoSelect}
              disabled={isSubmitting}
            />
          </label>
        )}
      </div>

      {/* Verified Purchase Badge */}
      {orderId && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">
            Verified Purchase - Your review will be marked as verified
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0 || !comment.trim()}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
}
