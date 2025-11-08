# Centralized Style Configuration Guide

## Overview
All button and input styles are now centralized in `src/lib/styles.ts`. Change styles in one place and they automatically apply everywhere.

## Location
`src/lib/styles.ts`

## Usage Examples

### 1. Import the styles
```typescript
import { buttonStyles, inputStyles, modalStyles, getButtonStyle, getInputStyle } from '@/lib/styles';
```

### 2. Using Button Styles

#### Primary Action Buttons (Submit, Create, Update)
```tsx
<button
  type="submit"
  className={buttonStyles.primary}
>
  Create Category
</button>
```

#### Secondary/Cancel Buttons
```tsx
<button
  type="button"
  onClick={closeModal}
  className={buttonStyles.secondary}
>
  Cancel
</button>
```

#### Add Buttons (Top Right)
```tsx
<button
  onClick={openModal}
  className={buttonStyles.add}
>
  <Plus size={20} />
  Add Category
</button>
```

#### Table Action Buttons
```tsx
{/* Edit Button */}
<button
  onClick={() => handleEdit(item)}
  className={buttonStyles.tableEdit}
>
  <Pencil size={16} />
</button>

{/* Delete Button */}
<button
  onClick={() => handleDelete(item.id)}
  className={buttonStyles.tableDelete}
>
  <Trash2 size={16} />
</button>

{/* Toggle Active Button */}
<button
  onClick={() => toggleActive(item)}
  className={item.is_active ? buttonStyles.tableToggleActive : buttonStyles.tableToggleInactive}
>
  {item.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
</button>
```

### 3. Using Input Styles

#### Text Input
```tsx
<input
  type="text"
  value={formData.name}
  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
  className={inputStyles.text}
  placeholder="Enter name"
  required
/>
```

#### Textarea
```tsx
<textarea
  value={formData.description}
  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
  className={inputStyles.textarea}
  rows={3}
/>
```

#### Select Dropdown
```tsx
<select
  value={formData.role}
  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
  className={inputStyles.select}
>
  <option value="ADMIN">Admin</option>
  <option value="CUSTOMER">Customer</option>
</select>
```

#### Label
```tsx
<label className={inputStyles.label}>
  Category Name *
</label>
```

### 4. Using Modal Styles

```tsx
{showModal && (
  <div 
    className={modalStyles.backdrop}
    onClick={closeModal}
  >
    <div 
      className={modalStyles.card}  {/* or modalStyles.cardLarge for wider modals */}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal Header */}
      <div className={modalStyles.header}>
        <h2>Edit Category</h2>
        <button onClick={closeModal} className={modalStyles.closeButton}>
          <X size={20} />
        </button>
      </div>

      {/* Modal Body */}
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <div className={modalStyles.body}>
          {/* Form fields here */}
        </div>

        {/* Modal Footer */}
        <div className={modalStyles.footer}>
          <button type="button" onClick={closeModal} className={buttonStyles.secondary}>
            Cancel
          </button>
          <button type="submit" className={buttonStyles.primary}>
            Update
          </button>
        </div>
      </form>
    </div>
  </div>
)}
```

### 5. Using Tab Styles

```tsx
<div className={tabStyles.container}>
  <button
    type="button"
    onClick={() => setActiveTab('en')}
    className={activeTab === 'en' ? tabStyles.active : tabStyles.inactive}
  >
    English
  </button>
  <button
    type="button"
    onClick={() => setActiveTab('ar')}
    className={activeTab === 'ar' ? tabStyles.active : tabStyles.inactive}
  >
    العربية
  </button>
</div>
```

### 6. Using Helper Functions

#### With Additional Classes
```tsx
<button className={getButtonStyle('primary', 'w-full')}>
  Submit
</button>

<input className={getInputStyle('text', 'max-w-md')} />
```

## How to Change Styles Globally

### Change Primary Button Color
Open `src/lib/styles.ts` and modify:
```typescript
export const buttonStyles = {
  primary: "bg-gradient-to-r from-blue-600 to-blue-500 text-white...",  // Change colors here
  // ...
};
```

### Change Input Border Color
```typescript
export const inputStyles = {
  text: "... border border-blue-500 ...",  // Change border color
  // ...
};
```

### Change Modal Backdrop Opacity
```typescript
export const modalStyles = {
  backdrop: "... bg-black/80 ...",  // Change from /60 to /80 for darker
  // ...
};
```

## Available Style Categories

1. **Button Styles**: `buttonStyles`
   - primary, secondary, add
   - tableEdit, tableDelete, tableToggleActive, tableToggleInactive
   - statusActive, statusInactive

2. **Input Styles**: `inputStyles`
   - text, textarea, select, withIcon, label

3. **Modal Styles**: `modalStyles`
   - backdrop, card, cardLarge, header, body, footer, closeButton

4. **Tab Styles**: `tabStyles`
   - container, active, inactive

5. **Card Styles**: `cardStyles`
   - standard, hover, header

6. **Notification Styles**: `notificationStyles`
   - panel, header, footer, item, itemUnread

## Migration Guide

### Before (Old Way - Inconsistent)
```tsx
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Submit
</button>
```

### After (New Way - Centralized)
```tsx
<button className={buttonStyles.primary}>
  Submit
</button>
```

## Benefits

✅ **One Place to Change**: Modify all buttons/inputs from `src/lib/styles.ts`
✅ **Consistent**: All components use the same styles
✅ **Easy Maintenance**: No need to search through multiple files
✅ **Type Safe**: TypeScript autocomplete for style names
✅ **Flexible**: Can still add custom classes when needed

## Quick Reference

| Component | Style Variable |
|-----------|---------------|
| Submit/Create/Update Button | `buttonStyles.primary` |
| Cancel Button | `buttonStyles.secondary` |
| Add Button (Top) | `buttonStyles.add` |
| Edit Button (Table) | `buttonStyles.tableEdit` |
| Delete Button (Table) | `buttonStyles.tableDelete` |
| Text Input | `inputStyles.text` |
| Textarea | `inputStyles.textarea` |
| Select | `inputStyles.select` |
| Label | `inputStyles.label` |
| Modal Backdrop | `modalStyles.backdrop` |
| Modal Card | `modalStyles.card` |
| Modal Header | `modalStyles.header` |
| Modal Footer | `modalStyles.footer` |

## Need Help?

1. Check `src/lib/styles.ts` for all available styles
2. See this guide for usage examples
3. Use TypeScript autocomplete: `buttonStyles.` will show all options
