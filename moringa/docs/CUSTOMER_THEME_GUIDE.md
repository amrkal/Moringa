# Customer UI Theme Customization Guide

This guide explains how to customize the look and feel of customer-facing pages (Menu, Cart, Checkout, Orders).

## Quick Start

All customer UI theming is centralized in `src/styles/customer-theme.ts`. Edit this single file to change colors, spacing, typography, and component styles across all customer pages.

## Design Tokens

### Button Variants

Four button styles available:

```typescript
// Primary - Main CTAs (Checkout, Place Order)
<CustomerButton variant="primary" size="md">
  Place Order
</CustomerButton>

// Secondary - Alternative actions
<CustomerButton variant="secondary" size="md">
  Continue Shopping
</CustomerButton>

// Ghost - Subtle actions
<CustomerButton variant="ghost" size="sm">
  Cancel
</CustomerButton>

// Destructive - Delete/Remove actions
<CustomerButton variant="destructive" size="sm">
  Remove Item
</CustomerButton>
```

### Customizing Button Colors

Edit `src/styles/customer-theme.ts`:

```typescript
buttons: {
  primary: {
    // Change gradient colors here
    className: 'bg-gradient-to-r from-blue-500 to-purple-600 ...',
  },
  secondary: {
    // Customize border/background
    className: 'bg-white border-2 border-gray-300 ...',
  }
}
```

### Status Badge Colors

Order status colors are defined in the theme file:

```typescript
status: {
  PENDING: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-900',
    text: 'text-amber-600 dark:text-amber-400',
  },
  // ... other statuses
}
```

**To change a status color:**
1. Open `src/styles/customer-theme.ts`
2. Find the status (e.g., `CONFIRMED`)
3. Update the Tailwind classes for `bg`, `border`, and `text`

### Typography Scale

Predefined text styles for consistency:

```typescript
typography: {
  pageTitle: 'text-2xl sm:text-3xl font-bold ...',
  sectionTitle: 'text-xl sm:text-2xl font-bold ...',
  cardTitle: 'text-lg font-bold ...',
  body: 'text-base text-foreground',
  bodyMuted: 'text-sm text-muted-foreground',
}
```

### Spacing & Layout

Consistent spacing across pages:

```typescript
spacing: {
  page: 'container mx-auto px-4 py-6 sm:py-8',
  section: 'mb-6 sm:mb-8',
  cardGap: 'space-y-4 sm:space-y-6',
}
```

## Theme-Aware Colors

All customer pages now use CSS variables for automatic light/dark mode:

- `bg-card` - Card backgrounds
- `bg-background` - Page backgrounds  
- `bg-muted` - Subtle backgrounds
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text
- `border-border` - Borders
- `bg-primary` - Brand color
- `bg-accent` - Accent color

**Never use hardcoded colors** like `bg-white` or `bg-gray-900` - they break dark mode!

## Component Examples

### Card with Theme Tokens

```tsx
<div className={customerTheme.card.className}>
  <h3 className={customerTheme.typography.cardTitle}>
    Order Summary
  </h3>
  <p className={customerTheme.typography.bodyMuted}>
    Review your items
  </p>
</div>
```

### Status Badge

```tsx
import { getStatusClasses } from '@/styles/customer-theme';

<span className={getStatusClasses('CONFIRMED')}>
  <CheckIcon />
  Confirmed
</span>
```

### Custom Button with Icon

```tsx
import { CustomerButton } from '@/components/CustomerButton';
import { ShoppingCart } from 'lucide-react';

<CustomerButton 
  variant="primary" 
  size="lg"
  icon={<ShoppingCart />}
  loading={isSubmitting}
>
  Add to Cart
</CustomerButton>
```

## Best Practices

1. **Use Components**: Prefer `<CustomerButton>` over raw `<button>` tags
2. **Use Theme Tokens**: Import and use `customerTheme` constants
3. **Test Both Modes**: Always check light and dark mode
4. **Mobile First**: All spacing uses responsive classes (`px-4 sm:px-6`)
5. **Accessibility**: All interactive elements have focus-visible rings

## Translations

Customer pages use the translation system:

```tsx
import { getTranslation } from '@/lib/translations';
import { useLanguage } from '@/contexts/LanguageContext';

const { language } = useLanguage();
const text = getTranslation('common', 'cart', language);
```

### Adding New Translations

Edit `src/lib/translations.ts`:

```typescript
export const translations = {
  common: {
    newKey: {
      en: 'English text',
      ar: 'نص عربي',
      he: 'טקסט עברי',
    }
  }
}
```

## File Structure

```
src/
├── styles/
│   └── customer-theme.ts          # Theme tokens & helpers
├── components/
│   └── CustomerButton.tsx         # Reusable button component
├── app/
│   ├── menu/                      # Menu page
│   ├── cart/                      # Cart page
│   ├── checkout/                  # Checkout page
│   └── orders/                    # Orders pages
└── lib/
    └── translations.ts            # Translation strings
```

## Troubleshooting

**Problem**: Buttons look wrong in dark mode
- **Solution**: Check that you're using theme tokens (`bg-card`, not `bg-white`)

**Problem**: Text is hard to read
- **Solution**: Use `text-foreground` for body text, `text-muted-foreground` for secondary

**Problem**: Translations not showing
- **Solution**: Verify the key exists in `translations.ts` and you're using `getTranslation()`

## Examples

See these files for reference implementations:
- `/app/orders/[orderId]/page.tsx` - Fully themed order detail page
- `/styles/customer-theme.ts` - Complete theme configuration
- `/components/CustomerButton.tsx` - Reusable component pattern

---

**Need help?** Check the existing pages for patterns and always test in both light and dark modes!
