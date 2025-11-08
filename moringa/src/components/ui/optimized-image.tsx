'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string | null | undefined;
  alt: string;
  fallback?: React.ReactNode;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  fallbackType?: 'meal' | 'category' | 'logo' | 'avatar';
}

/**
 * Optimized Image Component
 * 
 * Features:
 * - Automatic blur placeholder
 * - Error handling with fallback
 * - Lazy loading by default
 * - Responsive sizing
 * - WebP/AVIF automatic optimization
 * - Proper aspect ratio maintenance
 */
export function OptimizedImage({
  src,
  alt,
  fallback,
  fallbackType,
  aspectRatio = 'square',
  className,
  fill = false,
  quality = 85,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Aspect ratio classes
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  };

  // Check if src is valid
  const isValidSrc = src && (
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('/') ||
    src.startsWith('data:')
  );

  // Show fallback if no valid src or error occurred
  if (!isValidSrc || error) {
    return (
      <div className={cn(
        'relative overflow-hidden bg-gradient-to-br from-muted to-muted/50',
        !fill && aspectClasses[aspectRatio],
        fill && 'w-full h-full',
        className
      )}>
        {fallback || (
          <FallbackGraphic type={fallbackType} alt={alt} />
        )}
      </div>
    );
  }

  // For Next.js Image
  return (
    <div className={cn(
      'relative overflow-hidden',
      !fill && aspectClasses[aspectRatio],
      fill && 'w-full h-full'
    )}>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        quality={quality}
        priority={priority}
        sizes={props.sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        className={cn(
          'object-cover transition-opacity duration-300',
          isLoading && 'opacity-0',
          !isLoading && 'opacity-100',
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
        loading={priority ? undefined : 'lazy'}
        {...props}
      />
      
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
      )}
    </div>
  );
}

function FallbackGraphic({ type, alt }: { type?: 'meal' | 'category' | 'logo' | 'avatar'; alt: string }) {
  const base = 'absolute inset-0 flex items-center justify-center';
  switch (type) {
    case 'meal':
      return (
        <div className={`${base} bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/20`}> 
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-orange-500 dark:text-orange-400 opacity-70" aria-hidden="true" role="img" aria-label={alt}> 
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 3h2l3 13a3 3 0 003 2h6a3 3 0 003-2l3-13h2" />
          </svg>
        </div>
      );
    case 'category':
      return (
        <div className={`${base} bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/20`}> 
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-500 dark:text-purple-400 opacity-70" aria-hidden="true" role="img" aria-label={alt}> 
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
      );
    case 'logo':
      return (
        <div className={`${base} bg-gradient-to-br from-primary/10 to-accent/10`}> 
          <span className="text-xs font-bold tracking-wide text-primary/60">LOGO</span>
        </div>
      );
    case 'avatar':
      return (
        <div className={`${base} bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700/40 dark:to-slate-600/30 rounded-full`}> 
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500 dark:text-slate-300 opacity-70" aria-hidden="true" role="img" aria-label={alt}> 
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className={`${base} text-muted-foreground`}> 
          <svg
            className="w-1/3 h-1/3 opacity-30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      );
  }
}

/**
 * MealImage - Specialized for meal cards
 */
export function MealImage({
  src,
  alt,
  priority = false,
  className,
  fallback,
}: {
  src: string | null | undefined;
  alt: string;
  priority?: boolean;
  className?: string;
  fallback?: React.ReactNode;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      aspectRatio="square"
      fill
      priority={priority}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className={cn('group-hover:scale-110 transition-transform duration-500', className)}
      fallback={fallback}
      fallbackType="meal"
    />
  );
}

/**
 * CategoryImage - Specialized for category cards
 */
export function CategoryImage({
  src,
  alt,
  priority = false,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      aspectRatio="landscape"
      fill
      priority={priority}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
      className={className}
      fallbackType="category"
    />
  );
}

/**
 * LogoImage - For logos with fixed sizes
 */
export function LogoImage({
  src,
  alt,
  width = 100,
  height = 100,
  className,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <Image
      src={src || '/logo.jpg'}
      alt={alt}
      width={width}
      height={height}
      quality={90}
      priority
      className={className}
    />
  );
}
