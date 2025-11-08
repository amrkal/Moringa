# Accessibility Implementation Guide

## Overview
This document outlines the comprehensive accessibility features implemented in the Moringa Restaurant application, following WCAG 2.1 Level AA standards.

---

## ✅ Implemented Features

### 1. Skip Navigation
**Location:** `components/SkipToContent.tsx`

A "Skip to main content" link appears when users press Tab. This allows keyboard users to bypass repetitive navigation and jump directly to the main content.

```tsx
// Usage: Automatically included in root layout
<SkipToContent />
```

**Keyboard Shortcut:** Press `Tab` on page load to reveal the skip link.

---

### 2. ARIA Labels & Roles

#### Navigation Components
- **Main Navigation** (`components/Navigation.tsx`)
  - `role="navigation"` with `aria-label="Main navigation"`
  - `role="menubar"` for desktop and mobile menus
  - `role="menuitem"` for each navigation link
  - `aria-current="page"` for active page indication
  - Cart badge with descriptive `aria-label` showing item count

- **Notification Bell** (`components/NotificationBell.tsx`)
  - Button with dynamic `aria-label` showing unread count
  - `aria-expanded` to indicate dropdown state
  - `aria-haspopup="dialog"` for dropdown behavior
  - `role="dialog"` for notification panel
  - `role="tablist"` for filter tabs
  - `role="tab"` with `aria-selected` for each filter
  - Quick action buttons with descriptive labels

- **Shopping Cart** (`components/BottomSheetCart.tsx`)
  - Trigger button with full description (item count, total)
  - `role="dialog"` with `aria-modal="true"` for cart sheet
  - `role="list"` for cart items
  - Quantity controls with item-specific labels
  - Remove buttons with item identification

#### Admin Components
- **Category Management** (`app/admin/categories/page.tsx`)
  - Modal with `role="dialog"` and `aria-modal="true"`
  - `aria-labelledby` pointing to modal title
  - Search input with associated label
  - Language tabs with `role="tablist"`/`role="tab"`
  - Form inputs with proper `id` and `htmlFor` associations
  - `aria-required="true"` for required fields

---

### 3. Semantic HTML Structure

#### Landmark Regions
```tsx
<nav role="navigation" aria-label="Main navigation">
  <!-- Navigation content -->
</nav>

<main id="main-content" role="main" aria-label="Main content">
  <!-- Page content -->
</main>

<footer role="contentinfo">
  <!-- Footer content -->
</footer>
```

#### Proper Heading Hierarchy
- H1: Page title (only one per page)
- H2: Major sections
- H3: Subsections
- H4+: Nested content

---

### 4. Keyboard Navigation

#### Focus Management
**Global Focus Styles** (`styles/keyboard-focus.css`)

All interactive elements have clear focus indicators:
- 2px ring outline with 2px offset
- Semi-transparent box shadow for depth
- Enhanced contrast for visibility
- Smooth transitions

#### Keyboard Shortcuts Reference

| Action | Shortcut |
|--------|----------|
| Skip to main content | `Tab` (on page load) |
| Navigate forward | `Tab` |
| Navigate backward | `Shift + Tab` |
| Activate button/link | `Enter` or `Space` |
| Close modal/dropdown | `Escape` |
| Navigate tabs | `Arrow Left/Right` |
| Select dropdown item | `Arrow Up/Down` |

#### Focus Trapping
Modals and dropdowns implement focus trapping:
- Focus stays within dialog when open
- Tab cycles through focusable elements
- Escape key closes dialog
- Focus returns to trigger element on close

---

### 5. Form Accessibility

#### Input Labels
All form inputs have associated labels:
```tsx
<label htmlFor="category-name">Category Name *</label>
<input
  id="category-name"
  type="text"
  aria-required="true"
  aria-describedby="name-hint"
/>
<span id="name-hint">Enter a unique category name</span>
```

#### Error Handling
- Errors displayed with `role="alert"`
- Error messages associated with inputs via `aria-describedby`
- Visual indicators (color) supplemented with text/icons
- Required fields marked with `*` and `aria-required="true"`

---

### 6. Color & Contrast

#### WCAG AA Compliance
- **Normal text:** Minimum 4.5:1 contrast ratio
- **Large text:** Minimum 3:1 contrast ratio
- **UI components:** Minimum 3:1 contrast ratio

#### Color Independence
- Information never conveyed by color alone
- Icons and text accompany color indicators
- Status indicators use both color and icons
- Form errors show icons + text + color

#### Dark/Light Mode
- Both modes meet WCAG AA standards
- CSS variables ensure consistent contrast
- Automatic system preference detection
- Manual toggle available

---

### 7. Interactive Elements

#### Button States
All buttons provide clear states:
- Default state
- Hover state
- Focus state (keyboard)
- Active/pressed state
- Disabled state
- Loading state (with spinner + text)

#### Touch Targets
- Minimum 44x44px touch target size
- Adequate spacing between interactive elements
- Mobile-optimized touch areas

---

### 8. Screen Reader Support

#### ARIA Live Regions
Toast notifications use implicit `role="status"` for announcements:
```tsx
<Toaster /> // Automatically announces messages
```

#### Hidden Content
- Decorative elements: `aria-hidden="true"`
- Screen reader only text: `.sr-only` class
- Skip navigation link: Hidden until focused

#### Dynamic Content
- Loading states announced
- Status updates communicated
- Form validation errors announced

---

## 🎯 Best Practices Followed

### 1. Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced features layer on top
- Graceful degradation for older browsers

### 2. Responsive Design
- Mobile-first approach
- Touch and keyboard friendly
- Flexible layouts adapt to zoom

### 3. Performance
- Reduced motion respected (`prefers-reduced-motion`)
- Optimized animations
- Fast page loads

### 4. Testing
Tested with:
- ✅ Keyboard only (Tab, Arrow keys, Enter, Escape)
- ✅ Screen readers (NVDA, JAWS, VoiceOver)
- ✅ Color contrast tools
- ✅ Browser zoom (up to 200%)
- ✅ Mobile devices (touch + TalkBack/VoiceOver)

---

## 📋 Testing Checklist

### Keyboard Navigation
- [ ] Tab through entire page
- [ ] All interactive elements focusable
- [ ] Focus order is logical
- [ ] Focus indicators clearly visible
- [ ] Skip link works
- [ ] Modals trap focus
- [ ] Escape closes dialogs
- [ ] Arrow keys navigate tabs/menus

### Screen Reader
- [ ] All images have alt text
- [ ] Landmarks properly labeled
- [ ] Heading hierarchy logical
- [ ] Form labels associated
- [ ] Buttons have descriptive labels
- [ ] Status updates announced
- [ ] Error messages announced

### Visual
- [ ] Sufficient color contrast
- [ ] Text resizable to 200%
- [ ] No horizontal scrolling at zoom
- [ ] Information not color-only
- [ ] Focus visible on all elements

### Mobile
- [ ] Touch targets 44x44px minimum
- [ ] No hover-only features
- [ ] Pinch to zoom enabled
- [ ] Orientation supported

---

## 🚀 Quick Start for Developers

### Adding Accessible Buttons
```tsx
<button
  onClick={handleClick}
  aria-label="Descriptive action"
  aria-pressed={isActive} // For toggles
  disabled={isDisabled}
>
  <Icon aria-hidden="true" />
  Button Text
</button>
```

### Adding Accessible Forms
```tsx
<div>
  <label htmlFor="input-id" className="...">
    Field Label *
  </label>
  <input
    id="input-id"
    type="text"
    aria-required="true"
    aria-invalid={hasError}
    aria-describedby={hasError ? "error-id" : "hint-id"}
  />
  <span id="hint-id" className="text-sm text-muted-foreground">
    Helper text
  </span>
  {hasError && (
    <span id="error-id" role="alert" className="text-sm text-destructive">
      Error message
    </span>
  )}
</div>
```

### Adding Accessible Modals
```tsx
{isOpen && (
  <div
    className="fixed inset-0 bg-black/40"
    onClick={onClose}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <div onClick={(e) => e.stopPropagation()}>
      <h2 id="modal-title">Modal Title</h2>
      <button
        onClick={onClose}
        aria-label="Close modal"
      >
        <X aria-hidden="true" />
      </button>
      {/* Modal content */}
    </div>
  </div>
)}
```

### Adding Accessible Tabs
```tsx
<div role="tablist" aria-label="Section tabs">
  <button
    role="tab"
    aria-selected={activeTab === 'tab1'}
    aria-controls="panel-tab1"
    onClick={() => setActiveTab('tab1')}
  >
    Tab 1
  </button>
  {/* More tabs */}
</div>

<div
  role="tabpanel"
  id="panel-tab1"
  hidden={activeTab !== 'tab1'}
>
  {/* Panel content */}
</div>
```

---

## 📚 Resources

### WCAG Guidelines
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Understanding WCAG 2.1](https://www.w3.org/WAI/WCAG21/Understanding/)

### ARIA
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [ARIA in HTML](https://www.w3.org/TR/html-aria/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse Accessibility Audit](https://developers.google.com/web/tools/lighthouse)

---

## 🐛 Known Issues & Future Improvements

### Planned Enhancements
- [ ] Add keyboard shortcuts help modal
- [ ] Implement roving tabindex for complex widgets
- [ ] Add high contrast mode toggle
- [ ] Improve animation controls for reduced motion
- [ ] Add voice commands for common actions

### Browser-Specific Notes
- Focus outlines may vary slightly between browsers
- Screen reader compatibility tested on major screen readers
- Some animations reduced automatically via `prefers-reduced-motion`

---

## 💡 Tips for Maintaining Accessibility

1. **Test Early, Test Often**
   - Use keyboard for all interactions during development
   - Run automated tests with axe or Lighthouse
   - Manual screen reader testing before major releases

2. **Think Semantics First**
   - Use proper HTML elements (`<button>`, `<nav>`, `<main>`)
   - Add ARIA only when HTML semantics aren't enough
   - Keep heading hierarchy logical

3. **Describe Everything**
   - Buttons and links should be self-descriptive
   - Images need meaningful alt text (or `alt=""` if decorative)
   - Form inputs need labels

4. **Consider All Users**
   - Keyboard-only users
   - Screen reader users
   - Users with low vision
   - Users with cognitive disabilities
   - Users with motor impairments

---

## 📞 Support

For accessibility questions or issues, please:
1. Check this guide first
2. Review WCAG 2.1 guidelines
3. Test with automated tools
4. Contact the development team

Remember: **Accessibility is not a feature—it's a fundamental right.** 🌟
