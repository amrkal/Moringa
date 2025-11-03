# Accessibility Features Documentation

## Overview
The Moringa app now includes comprehensive accessibility features to ensure all users can comfortably use the application regardless of their abilities or preferences.

## Features

### 1. **Color Mode (Dark/Light/System)**
- **Light Mode**: Traditional bright interface
- **Dark Mode**: Easy on the eyes in low-light conditions
- **System Mode**: Automatically follows your device's color scheme preference

### 2. **Font Size Control**
- **Small**: 14px - Compact view for users who prefer more content on screen
- **Normal**: 16px - Standard, comfortable reading size
- **Large**: 18px - Easier to read for users with mild vision impairment
- **Extra Large**: 20px - Maximum readability for visually impaired users

### 3. **High Contrast Mode**
- Increases color contrast between text and background
- Makes borders more prominent
- Enhances focus indicators
- Helpful for users with:
  - Color blindness
  - Low vision
  - Light sensitivity

### 4. **Reduced Motion**
- Minimizes or removes animations
- Reduces transition effects
- Automatically enabled if system preference is detected
- Benefits users with:
  - Vestibular disorders
  - Motion sensitivity
  - Cognitive disabilities
  - Epilepsy

## How to Use

### Accessing the Accessibility Menu
1. Look for the floating **accessibility button** (♿) in the bottom-right corner of the screen
2. Click/tap the button to open the accessibility menu
3. Adjust settings as needed
4. Settings are automatically saved to your browser

### Keyboard Navigation
- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate buttons and links
- **Escape**: Close menus and modals
- All interactive elements have visible focus indicators

### Screen Reader Support
- All images have descriptive alt text
- Buttons have clear aria-labels
- Form fields are properly labeled
- Semantic HTML structure for easy navigation

## Technical Implementation

### Context Provider
```tsx
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';

// Settings are persisted in localStorage
// System preferences are respected by default
```

### CSS Classes Applied
- `.dark` - Dark mode styling
- `.font-{size}` - Font size adjustments (small, normal, large, extra-large)
- `.high-contrast` - Enhanced contrast styling
- `.reduce-motion` - Disabled/minimized animations

### Settings Persistence
- All settings are saved to `localStorage` under `accessibility-settings`
- Settings persist across browser sessions
- Settings are applied immediately without page reload

## Browser Compatibility

### Supported Browsers
- ✅ Chrome/Edge (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### System Preference Detection
The app automatically detects and respects:
- `prefers-color-scheme` (dark/light mode)
- `prefers-reduced-motion` (animation preferences)

## Multilingual Support

All accessibility options are available in:
- 🇬🇧 **English** (EN)
- 🇸🇦 **Arabic** (AR) - Right-to-left support
- 🇮🇱 **Hebrew** (HE) - Right-to-left support

## Accessibility Standards

The implementation follows:
- **WCAG 2.1 Level AA** guidelines
- **WAI-ARIA** best practices
- **Web Content Accessibility Guidelines**

### Key Compliance Areas
- ✅ Color contrast ratios meet AA standards (4.5:1 for normal text)
- ✅ Interactive elements have minimum touch target size (44×44px)
- ✅ Focus indicators are visible and meet contrast requirements
- ✅ Content is keyboard accessible
- ✅ Screen reader compatible

## Future Enhancements

Potential additions:
- Voice control integration
- Text-to-speech for menu items
- Dyslexia-friendly font option
- Custom color theme builder
- Zoom level controls
- Reading mode for order details

## User Feedback

We're committed to improving accessibility. If you encounter any issues or have suggestions, please:
1. Contact support with details about the accessibility issue
2. Include your device, browser, and assistive technology information
3. Describe the expected vs. actual behavior

## Testing Recommendations

For developers testing accessibility:
1. Test with keyboard only (no mouse)
2. Use screen reader (NVDA, JAWS, VoiceOver)
3. Test with browser zoom at 200%
4. Verify with color blindness simulators
5. Test on mobile devices with accessibility features enabled

## Resources

- [WebAIM](https://webaim.org/) - Web accessibility guidelines
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) - Quick reference
- [A11y Project](https://www.a11yproject.com/) - Accessibility resources
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility) - Developer docs
