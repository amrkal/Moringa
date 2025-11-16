# Ingredient System Refactor

## Overview
The ingredient system has been completely refactored from a confusing two-boolean system (`is_optional`, `is_default`) to a clear three-type categorization system.

## New Ingredient Types

### 1. **Required** (Fixed Ingredients)
- **Purpose**: Core ingredients that define the meal
- **Customer View**: **Hidden** - customers never see these
- **Behavior**: Cannot be removed, always included
- **Example**: Bread in a sandwich, rice in a rice bowl
- **Admin UI**: Red badge "🔒 Required (Hidden)"

### 2. **Removable** (Included but Optional)
- **Purpose**: Standard ingredients that come with the meal
- **Customer View**: **Visible** - shown with option to remove
- **Behavior**: Included by default, customer can remove for free
- **Example**: Lettuce, tomato, onions in a burger
- **Admin UI**: Blue badge "✓ Included (Removable)"

### 3. **Extra** (Add-ons)
- **Purpose**: Optional extras customers can add
- **Customer View**: **Visible** - shown as add-ons with price
- **Behavior**: Not included by default, can add for extra cost
- **Example**: Extra cheese, bacon, avocado
- **Admin UI**: Purple badge "Available as Extra"

## Database Schema

### Old Structure (Confusing)
```python
class MealIngredient(BaseModel):
    ingredient_id: str
    is_optional: bool  # True = can remove, False = required
    is_default: bool   # True = included, False = not included
```

**Problems:**
- `is_optional=False, is_default=True` meant "required" but wasn't clear
- `is_optional=True, is_default=True` meant "removable" - confusing naming
- `is_optional=True, is_default=False` meant "extra" - not intuitive

### New Structure (Clear)
```python
class MealIngredient(BaseModel):
    ingredient_id: str
    ingredient_type: str = "removable"  # "required" | "removable" | "extra"
    extra_price: float = 0.0  # Only used when type is "extra"
```

**Benefits:**
- Single field with clear enum values
- Self-documenting code
- Easy to understand at a glance
- Separated pricing logic (only extras have price)

## Migration Logic

Old system → New system mapping:
```
is_optional=False, is_default=True  → ingredient_type="required"
is_optional=True,  is_default=True  → ingredient_type="removable"
is_optional=True,  is_default=False → ingredient_type="extra"
```

Migration script: `backend/migrate_ingredient_types.py`

## Admin Interface Changes

### Before (Confusing)
- Two buttons per ingredient:
  1. Mode button: "Not Included" / "Included by Default" / "Available as Extra"
  2. Removable toggle: "✓ Removable" / "🔒 Required" (only when in default mode)
- Users had to click two buttons to configure one ingredient
- "Required" vs "Removable" was unclear

### After (Clear)
- **Single button** per ingredient that cycles through 4 states:
  1. **Gray**: "Not Included" → Click to add
  2. **Red**: "🔒 Required (Hidden)" → Fixed ingredient
  3. **Blue**: "✓ Included (Removable)" → Standard ingredient
  4. **Purple**: "Available as Extra" → Add-on with price
- Click cycles: None → Required → Removable → Extra → None
- Color-coded for instant recognition

## Customer-Facing Impact

### Before
All ingredients shown with confusing options

### After
1. **Required ingredients**: Completely hidden (customer doesn't need to see bread in a sandwich)
2. **Removable ingredients**: Shown with "Remove" option
3. **Extra ingredients**: Shown as "Add [ingredient] (+$X.XX)"

This matches how real restaurant menus work!

## Files Changed

### Backend
- `backend/app/models.py` - Updated MealIngredient model
- `backend/app/schemas.py` - Updated schemas to match
- `backend/migrate_ingredient_types.py` - Migration script

### Frontend
- `moringa/src/app/admin/meals/page.tsx` - Simplified admin UI
  - Changed state from `Record<string, {mode, removable}>` to `Record<string, string>`
  - Single toggle function instead of two
  - Clearer button labels and colors

## Testing

1. **Admin Panel** (`/admin/meals`):
   - Create new meal
   - Add ingredients and cycle through types
   - Verify color coding and labels
   - Save meal

2. **Customer View** (TODO - needs implementation):
   - Open meal details
   - Verify "required" ingredients are hidden
   - Verify "removable" ingredients show remove option
   - Verify "extra" ingredients show add option with price

## Next Steps

1. ✅ Backend model updated
2. ✅ Migration script created and tested
3. ✅ Admin panel UI updated
4. ⏳ **TODO**: Update customer-facing meal detail page to respect new types
5. ⏳ **TODO**: Update meal customization modal
6. ⏳ **TODO**: Test complete flow: admin sets types → customer sees correct UI

## API Examples

### Creating a meal with ingredients:
```json
{
  "name": {"en": "Burger", "ar": "برجر", "he": "בורגר"},
  "price": 25.0,
  "ingredients": [
    {
      "ingredient_id": "bread-123",
      "ingredient_type": "required",
      "extra_price": 0.0
    },
    {
      "ingredient_id": "lettuce-456",
      "ingredient_type": "removable",
      "extra_price": 0.0
    },
    {
      "ingredient_id": "cheese-789",
      "ingredient_type": "extra",
      "extra_price": 3.0
    }
  ]
}
```

### Response shows clear types:
```json
{
  "id": "meal-xyz",
  "ingredients": [
    {"ingredient_id": "bread-123", "ingredient_type": "required"},
    {"ingredient_id": "lettuce-456", "ingredient_type": "removable"},
    {"ingredient_id": "cheese-789", "ingredient_type": "extra", "extra_price": 3.0}
  ]
}
```

## Benefits Summary

1. **Clarity**: Single field with clear enum values
2. **Simplicity**: One button instead of two in admin UI
3. **Customer UX**: Matches real-world restaurant menus
4. **Maintainability**: Self-documenting code
5. **Flexibility**: Easy to add new types in future (e.g., "substitution")
