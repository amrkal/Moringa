/**
 * Centralized Style Configuration
 * Change button and input styles in one place
 */

// ============= BUTTON STYLES =============

export const buttonStyles = {
  // Primary action buttons (Submit, Create, Update, Place Order, etc.)
  primary: "bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:from-orange-600 hover:to-orange-500 hover:shadow-xl transition-all font-medium hover:scale-105 shadow-md",
  
  // Secondary/Cancel buttons
  secondary: "bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:from-orange-600 hover:to-orange-500 hover:shadow-xl transition-all font-medium hover:scale-105 shadow-md",
  
  // Add buttons (top right of pages)
  add: "flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-2xl hover:from-orange-600 hover:to-orange-500 hover:scale-105 transition-all shadow-lg hover:shadow-xl font-medium",
  
  // Action buttons in tables (Edit, Delete, Toggle)
  tableEdit: "p-2.5 rounded-xl border-2 border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all hover:scale-110 shadow-sm",
  tableDelete: "p-2.5 rounded-xl border-2 border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all hover:scale-110 shadow-sm",
  tableToggleActive: "p-2 rounded-lg border-2 border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-all hover:scale-105 shadow-sm",
  tableToggleInactive: "p-2 rounded-lg border-2 border-gray-500/20 bg-gray-500/10 text-gray-600 dark:text-gray-400 hover:bg-gray-500/20 transition-all hover:scale-105 shadow-sm",
  
  // Status badges
  statusActive: "px-3 py-1.5 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border-2 border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 transition-all hover:scale-105 shadow-sm",
  statusInactive: "px-3 py-1.5 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border-2 border-gray-500/20 bg-gray-500/10 text-gray-700 dark:text-gray-400 hover:bg-gray-500/20 transition-all hover:scale-105 shadow-sm",
};

// ============= INPUT STYLES =============

export const inputStyles = {
  // Standard text input
  text: "w-full px-4 py-2.5 border-2 border-[hsl(var(--border))] rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] shadow-sm",
  
  // Textarea
  textarea: "w-full px-4 py-2.5 border-2 border-[hsl(var(--border))] rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all resize-none bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] shadow-sm",
  
  // Select dropdown
  select: "w-full px-4 py-2.5 border-2 border-[hsl(var(--border))] rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm appearance-none cursor-pointer",
  
  // Input with icon (price fields, etc.)
  withIcon: "w-full pl-10 pr-4 py-3 border-2 border-[hsl(var(--border))] rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] font-medium shadow-sm",
  
  // Label
  label: "block text-sm font-medium text-[hsl(var(--foreground))] mb-2",
  
  // Checkbox
  checkbox: "h-5 w-5 text-primary focus:ring-2 focus:ring-primary/50 border-border rounded-md cursor-pointer",
  
  // Checkbox container
  checkboxContainer: "flex items-center gap-3 p-4 bg-muted/30 rounded-xl",
  
  // Checkbox label
  checkboxLabel: "text-sm font-medium text-foreground cursor-pointer flex-1",
  
  // Toggle switch (iOS style)
  toggleInput: "sr-only peer",
  toggleSlider: "w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[hsl(var(--background))] after:rounded-full after:h-5 after:w-5 after:transition-all",
  toggleLabel: "relative inline-flex items-center cursor-pointer",
  toggleContainer: "flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border",
};

// ============= MODAL STYLES =============

export const modalStyles = {
  // Backdrop overlay - lighter and with blur for modern look
  backdrop: "fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto",
  
  // Modal card container
  card: "bg-[hsl(var(--card))] rounded-3xl max-w-2xl w-full shadow-2xl border border-[hsl(var(--border))] animate-in slide-in-from-bottom-4 duration-300 my-8 max-h-[90vh] flex flex-col",
  
  // Large modal card (for meals)
  cardLarge: "bg-[hsl(var(--card))] rounded-3xl max-w-3xl w-full shadow-2xl border border-[hsl(var(--border))] animate-in slide-in-from-bottom-4 duration-300 my-8 max-h-[90vh] flex flex-col",
  
  // Modal header
  header: "flex items-center justify-between p-6 border-b border-[hsl(var(--border))] bg-gradient-to-r from-orange-500/5 via-transparent to-transparent flex-shrink-0",
  
  // Modal body
  body: "p-6 space-y-6 overflow-y-auto flex-1 bg-[hsl(var(--card))]",
  
  // Modal footer
  footer: "flex gap-3 p-6 border-t border-[hsl(var(--border))] flex-shrink-0 bg-[hsl(var(--muted))]/30",
  
  // Close button
  closeButton: "p-2.5 hover:bg-[hsl(var(--muted))] rounded-xl transition-all hover:scale-110 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
};

// ============= TAB STYLES =============

export const tabStyles = {
  // Tab container
  container: "flex gap-1 p-1 bg-[hsl(var(--muted))] rounded-xl border border-[hsl(var(--border))]",
  
  // Active tab
  active: "flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all bg-[hsl(var(--background))] text-orange-600 dark:text-orange-400 shadow-sm border border-orange-500/20",
  
  // Inactive tab
  inactive: "flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--background))]/70",
};

// ============= CARD STYLES =============

export const cardStyles = {
  // Standard card
  standard: "bg-card rounded-2xl shadow-sm border border-border overflow-hidden",
  
  // Card with hover effect
  hover: "bg-card rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-xl transition-all duration-300",
  
  // Card header
  header: "p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent",
};

// ============= NOTIFICATION STYLES =============

export const notificationStyles = {
  // Notification panel
  panel: "absolute right-0 mt-2 w-96 bg-card border border-border rounded-2xl shadow-2xl z-50 animate-in slide-in-from-top-4 duration-200 opacity-100",
  
  // Notification header
  header: "p-4 border-b border-border bg-muted space-y-3",
  
  // Notification footer
  footer: "p-3 border-t border-border bg-muted",
  
  // Notification item
  item: "p-4 hover:bg-muted/50 transition-colors",
  itemUnread: "p-4 hover:bg-muted/50 transition-colors bg-primary/5",
};

// ============= HELPER FUNCTIONS =============

/**
 * Combine multiple style classes
 */
export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Get button style by type
 */
export const getButtonStyle = (type: keyof typeof buttonStyles, additionalClasses?: string) => {
  return cn(buttonStyles[type], additionalClasses);
};

/**
 * Get input style by type
 */
export const getInputStyle = (type: keyof typeof inputStyles, additionalClasses?: string) => {
  return cn(inputStyles[type], additionalClasses);
};
