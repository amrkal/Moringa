# Moringa Menu Database Migration Guide

## 📋 Overview
This migration will replace your current database with the **corrected menu** that matches your actual restaurant menu exactly.

## ✅ What's Been Fixed

### **Categories** (6 total)
- כריכים (Sandwiches)
- ארוחת בוקר (Breakfast)
- שתיה חמה (Hot Drinks)
- מיץ טבעי (Fresh Juices)
- עיקריות (Main Courses)
- סלטים (Salads)

### **Ingredients** (43 total)
**Premium Add-ons (with prices):**
- אבוקדו (Avocado) - ₪5
- טונה (Tuna) - ₪5
- ביצה קשה (Hard Egg) - ₪5
- חזה עוף אפוי (Grilled Chicken) - ₪20
- שניצל אפוי (Baked Schnitzel) - ₪20
- סלמון אפוי (Baked Salmon) - ₪25

**Base Ingredients (free, included in meals):**
- All vegetables: חסה, עגבניות, מלפפון, בצל, פלפלים קלויים, etc.
- All spreads: ממרח פסטו, ממרח חציל, טחינה
- Grains: קינואה, פריקה, אורז, ספגטי
- And 30+ more ingredients

### **Meals** (40 total)

#### **כריכים (Sandwiches) - 8 meals**
1. כריך טבעוני - ₪30
2. כריך טונה - ₪30
3. כריך חביתה - ₪30
4. כריך ביצה קשה - ₪30
5. כריך גבינות - ₪30
6. כריך אבוקדו - ₪30
7. כריך עוף - ₪40
8. כריך שניצל - ₪40

#### **ארוחת בוקר (Breakfast) - 5 meals**
1. שקשוקה - ₪65
2. חביתה ירק - ₪45
3. טוסט גבינה - ₪40
4. טוסט פסטרמה - ₪40
5. טוסט בהרכבה עצמית - ₪40 ✨ **NEW**

#### **שתיה חמה (Hot Drinks) - 7 meals**
1. קפה הפוך - ₪10
2. קפה הפוך סויה - ₪13
3. קפה הפוך שיבולת שועל - ₪13
4. הפוך שקדים - ₪13 ✨ **NEW**
5. אספרסו - ₪10
6. אמריקנו - ₪10
7. תה - ₪10

#### **מיץ טבעי (Fresh Juices) - 7 meals**
1. מיץ ירוק - ₪23
2. סלק - ₪23
3. גזר - ₪23
4. תפוזים - ₪23
5. סלק וגזר - ₪23
6. גזר ותפוזים - ₪23
7. תפוזים וסלק - ₪23

#### **עיקריות (Main Courses) - 2 meals**
1. חזה עוף עם אורז - ₪65
2. סלמון עם אורז - ₪85

#### **סלטים (Salads) - 11 meals**
All salads include **base ingredients** + optional **תוספות (add-ons)**:

1. סלט קינואה - ₪45
2. סלט פריקה - ₪45
3. סלט ספגטי - ₪50
4. סלט חלומי - ₪55
5. סלט ארטישוק - ₪50
6. סלט טונה - ₪49
7. סלט ביצה קשה - ₪49
8. סלט אבוקדו - ₪49
9. סלט עוף - ₪57
10. סלט סלמון - ₪65

**Each salad supports optional add-ons:**
- + אבוקדו (₪5)
- + טונה (₪5)
- + ביצה קשה (₪5)
- + חזה עוף אפוי (₪20)
- + שניצל אפוי (₪20)
- + סלמון אפוי (₪25)

---

## 🚀 Migration Steps

### **Step 1: Backup Current Data**
The script automatically backs up your existing data to `backend/data/backups/` before making changes.

### **Step 2: Run Migration**
```powershell
cd e:\Moringa\backend
python migrate_to_atlas.py
```

The script will:
1. ✅ Connect to MongoDB Atlas
2. 💾 Backup existing categories, ingredients, and meals
3. ⚠️  Ask for confirmation (type `YES` to proceed)
4. 🗑️  Delete old data
5. 📤 Upload corrected data
6. 🔍 Verify the migration

### **Step 3: Verify on Frontend**
After migration:
1. Visit https://moringa-two.vercel.app/menu
2. Check that all categories appear
3. Verify meal prices are correct
4. Test adding ingredients to a salad
5. Test the complete checkout flow

---

## 🔧 How the Ingredient System Works

### **In Backend (Already Supported!)**
Your `Meal` model already has:
```python
class MealIngredient(BaseModel):
    ingredient_id: str
    is_optional: bool = True      # Can customer choose?
    is_default: bool = False       # Included by default?
    extra_price: float = 0.0       # Extra charge
```

### **In Database**
Each meal now has ingredients array:
```json
{
  "name": {"he": "סלט קינואה"},
  "price": 45,
  "ingredients": [
    // Base ingredients (included in price)
    {"ingredient_id": "...", "is_default": true, "extra_price": 0},
    
    // Optional add-ons
    {"ingredient_id": "avocado-id", "is_optional": true, "extra_price": 5.0},
    {"ingredient_id": "chicken-id", "is_optional": true, "extra_price": 20.0}
  ]
}
```

### **In Frontend**
When customer selects a salad:
1. Show base ingredients (included)
2. Show "תוספות" section with optional add-ons
3. Calculate: `total = meal.price + sum(selected_addons.extra_price)`

---

## 📊 Database Structure

```
moringa_food_ordering/
├── categories (6 documents)
│   ├── כריכים
│   ├── ארוחת בוקר
│   ├── שתיה חמה
│   ├── מיץ טבעי
│   ├── עיקריות
│   └── סלטים
│
├── ingredients (43 documents)
│   ├── Premium (6): Avocado, Tuna, Egg, Chicken, Schnitzel, Salmon
│   └── Base (37): All vegetables, spreads, grains, etc.
│
└── meals (40 documents)
    ├── 8 Sandwiches (₪30-40)
    ├── 5 Breakfast (₪40-65)
    ├── 7 Hot Drinks (₪10-13)
    ├── 7 Juices (₪23)
    ├── 2 Main Courses (₪65-85)
    └── 11 Salads (₪45-65) with customizable add-ons
```

---

## 🎯 Testing Checklist

After migration, test:

- [ ] Menu loads on frontend
- [ ] All 6 categories appear
- [ ] Click each category to see meals
- [ ] Meal images display correctly
- [ ] Prices match the real menu
- [ ] Click on a salad
- [ ] See base ingredients listed
- [ ] See "תוספות" (add-ons) section
- [ ] Add an ingredient (e.g., Avocado ₪5)
- [ ] Price updates correctly
- [ ] Add to cart
- [ ] Cart shows meal + add-ons
- [ ] Checkout works
- [ ] Order appears in admin panel

---

## ⚠️ Important Notes

1. **Backup is automatic** - Your old data is saved before deletion
2. **Type 'YES' carefully** - Migration is irreversible (unless you restore from backup)
3. **Frontend update** - Make sure your frontend handles the `ingredients` array properly
4. **Add-on display** - Salads should show optional add-ons with prices
5. **Price calculation** - Total = base price + selected add-ons

---

## 🔄 Rollback (If Needed)

If something goes wrong:
```python
# Your backups are in: backend/data/backups/
# Format: categories_backup_YYYYMMDD_HHMMSS.json

# To restore, modify migrate_to_atlas.py to read from backup files
# instead of corrected_*.json files
```

---

## 📞 Need Help?

If you encounter issues:
1. Check the backup files in `backend/data/backups/`
2. Verify MongoDB Atlas connection
3. Test API endpoint: `https://moringa-production-93eb.up.railway.app/api/v1/meals`
4. Check frontend console for errors

---

## ✅ Success Criteria

Migration is successful when:
- ✅ All 40 meals appear on the menu
- ✅ Prices match your restaurant's actual menu
- ✅ Salads show customizable add-ons (תוספות)
- ✅ Customers can add Avocado (₪5), Chicken (₪20), etc.
- ✅ Total price calculates correctly
- ✅ Orders save with selected ingredients
- ✅ Admin panel shows ingredient selections

**Ready to migrate? Run the script!** 🚀
