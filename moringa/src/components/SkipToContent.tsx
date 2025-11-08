'use client';

/**
 * Skip to Content Link
 * 
 * Provides keyboard users with a way to skip repetitive navigation
 * and jump directly to the main content. This is a WCAG 2.1 Level A requirement.
 * 
 * The link is visually hidden until focused (Tab key), making it accessible
 * to keyboard users while not cluttering the visual design.
 */

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}
