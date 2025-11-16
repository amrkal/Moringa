import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ButtonSpinner } from './spinner';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        // Solid (high contrast) - WCAG AA compliant
        solid: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/95 disabled:shadow-none',
        
        // Default (alias for solid for backward compatibility)
        default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/95 disabled:shadow-none',
        
        // Outline (transparent bg, visible border) - WCAG AA compliant
        outline: 'border-2 border-border bg-transparent text-foreground hover:bg-accent/60 hover:border-accent-foreground/20 active:bg-accent/80 ring-1 ring-border/50',
        
        // Ghost (transparent, ensure contrast) - WCAG AA compliant with ring
        ghost: 'bg-transparent text-foreground hover:bg-accent/60 hover:text-accent-foreground active:bg-accent/80 ring-1 ring-transparent hover:ring-border/50',
        
        // Secondary (subdued, muted bg + visible border) - WCAG AA compliant
        secondary: 'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 hover:border-border/80 active:bg-secondary/90 ring-1 ring-border/30',
        
        // Destructive (danger actions) - WCAG AA compliant
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/95 disabled:shadow-none',
        
        // Link style
        link: 'text-primary underline-offset-4 hover:underline active:text-primary/80',
        
        // Gradient (premium style)
        gradient: 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-12 rounded-lg px-10 text-base',
        icon: 'h-10 w-10',
      },
      shape: {
        default: '',
        pill: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      shape: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, asChild = false, loading, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, shape, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && <ButtonSpinner className="mr-1" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };