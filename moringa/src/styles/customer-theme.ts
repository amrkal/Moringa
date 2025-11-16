/**
 * Customer-facing UI Design Tokens
 * 
 * Centralized theme configuration for easy customization across
 * Menu, Cart, Checkout, and Orders pages.
 * 
 * Modify these values to change the look and feel of customer pages.
 */

export const customerTheme = {
  // Card Styling
  card: {
    className: 'bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow',
    padding: 'p-6',
    header: 'text-lg font-bold text-foreground tracking-tight',
  },
  
  // Button Variants
  buttons: {
    primary: {
      className: 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      sizes: {
        sm: 'px-4 py-2 text-sm rounded-lg',
        md: 'px-6 py-3 text-base rounded-xl',
        lg: 'px-8 py-4 text-lg rounded-xl',
      }
    },
    secondary: {
      className: 'bg-card border-2 border-border hover:bg-muted hover:border-primary/50 text-foreground font-semibold hover:scale-[1.02] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      sizes: {
        sm: 'px-4 py-2 text-sm rounded-lg',
        md: 'px-6 py-3 text-base rounded-xl',
        lg: 'px-8 py-4 text-lg rounded-xl',
      }
    },
    ghost: {
      className: 'bg-transparent hover:bg-muted text-foreground font-medium hover:scale-[1.02] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      sizes: {
        sm: 'px-3 py-1.5 text-sm rounded-lg',
        md: 'px-4 py-2 text-base rounded-xl',
        lg: 'px-6 py-3 text-lg rounded-xl',
      }
    },
    destructive: {
      className: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2',
      sizes: {
        sm: 'px-4 py-2 text-sm rounded-lg',
        md: 'px-6 py-3 text-base rounded-xl',
        lg: 'px-8 py-4 text-lg rounded-xl',
      }
    },
  },
  
  // Status Badges
  status: {
    PENDING: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-900',
      text: 'text-amber-600 dark:text-amber-400',
    },
    CONFIRMED: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-900',
      text: 'text-blue-600 dark:text-blue-400',
    },
    PREPARING: {
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      border: 'border-purple-200 dark:border-purple-900',
      text: 'text-purple-600 dark:text-purple-400',
    },
    READY: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-900',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    OUT_FOR_DELIVERY: {
      bg: 'bg-cyan-50 dark:bg-cyan-950/30',
      border: 'border-cyan-200 dark:border-cyan-900',
      text: 'text-cyan-600 dark:text-cyan-400',
    },
    DELIVERED: {
      bg: 'bg-green-50 dark:bg-green-950/30',
      border: 'border-green-200 dark:border-green-900',
      text: 'text-green-600 dark:text-green-400',
    },
    CANCELLED: {
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-900',
      text: 'text-red-600 dark:text-red-400',
    },
  },
  
  // Spacing & Layout
  spacing: {
    page: 'container mx-auto px-4 py-6 sm:py-8',
    section: 'mb-6 sm:mb-8',
    cardGap: 'space-y-4 sm:space-y-6',
  },
  
  // Typography
  typography: {
    pageTitle: 'text-2xl sm:text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent',
    sectionTitle: 'text-xl sm:text-2xl font-bold text-foreground',
    cardTitle: 'text-lg font-bold text-foreground tracking-tight',
    body: 'text-base text-foreground',
    bodyMuted: 'text-sm text-muted-foreground',
    caption: 'text-xs text-muted-foreground',
  },
  
  // Animations
  animations: {
    fadeIn: 'animate-fadeIn',
    slideUp: 'animate-slideUp',
    pulse: 'animate-pulse',
  },
  
  // Empty States
  emptyState: {
    container: 'min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden',
    iconWrapper: 'relative w-32 h-32 mx-auto mb-8',
    iconBg: 'absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-2xl opacity-20 animate-pulse',
    icon: 'relative w-full h-full rounded-full bg-gradient-to-br from-muted to-accent/20 flex items-center justify-center ring-4 ring-primary/10',
    title: 'text-3xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent',
    description: 'text-muted-foreground text-lg mb-8 leading-relaxed',
  },
} as const;

// Helper function to combine button classes
export function getButtonClasses(variant: keyof typeof customerTheme.buttons = 'primary', size: 'sm' | 'md' | 'lg' = 'md') {
  const variantConfig = customerTheme.buttons[variant];
  return `${variantConfig.className} ${variantConfig.sizes[size]}`;
}

// Helper function to get status badge classes
export function getStatusClasses(status: keyof typeof customerTheme.status) {
  const config = customerTheme.status[status];
  return `inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${config.bg} ${config.border} ${config.text}`;
}
