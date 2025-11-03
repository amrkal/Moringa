"""
Script to populate the Moringa menu from the actual restaurant menu
Based on: https://adverwizemenu.com/full-menu/q2#cat-38
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import uuid

# MongoDB connection
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "moringa_db"

async def populate_menu():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    print("🚀 Starting Moringa menu population...")
    
    # Clear existing data
    await db.categories.delete_many({})
    await db.ingredients.delete_many({})
    await db.meals.delete_many({})
    print("✅ Cleared existing data")
    
    # Create categories with Hebrew names
    categories_data = [
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Sandwiches", "ar": "ساندويتشات", "he": "כריכים"},
            "description": {"en": "Fresh and healthy sandwiches", "ar": "ساندويتشات طازجة وصحية", "he": "כריכים טריים ובריאים"},
            "order": 1,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Breakfast", "ar": "إفطار", "he": "ארוחת בוקר"},
            "description": {"en": "Start your day right", "ar": "ابدأ يومك بشكل صحيح", "he": "התחל את היום בצורה נכונה"},
            "order": 2,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Hot Drinks", "ar": "مشروبات ساخنة", "he": "שתיה חמה"},
            "description": {"en": "Coffee and tea", "ar": "قهوة وشاي", "he": "קפה ותה"},
            "order": 3,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Fresh Juices", "ar": "عصائر طبيعية", "he": "מיץ טבעי"},
            "description": {"en": "Freshly squeezed juices", "ar": "عصائر طازجة", "he": "מיצים סחוטים טריים"},
            "order": 4,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Main Dishes", "ar": "أطباق رئيسية", "he": "עיקריות"},
            "description": {"en": "Main course meals", "ar": "وجبات رئيسية", "he": "מנות עיקריות"},
            "order": 5,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Salads", "ar": "سلطات", "he": "סלטים"},
            "description": {"en": "Fresh and healthy salads", "ar": "سلطات طازجة وصحية", "he": "סלטים טריים ובריאים"},
            "order": 6,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Vegan Menu", "ar": "قائمة نباتية", "he": "תפריט טבעוני"},
            "description": {"en": "100% plant-based", "ar": "نباتي بالكامل", "he": "צמחוני לחלוטין"},
            "order": 7,
            "is_active": True,
            "created_at": datetime.utcnow()
        }
    ]
    
    await db.categories.insert_many(categories_data)
    print(f"✅ Created {len(categories_data)} categories")
    
    # Create ingredients
    ingredients_data = [
        # Vegetables
        {"_id": str(uuid.uuid4()), "name": {"en": "Lettuce", "ar": "خس", "he": "חסה"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Cucumber", "ar": "خيار", "he": "מלפפון"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Tomato", "ar": "طماطم", "he": "עגבניות"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Roasted Peppers", "ar": "فلفل محمص", "he": "פלפלים קלויים"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Sweet Potato", "ar": "بطاطا حلوة", "he": "בטטה"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Avocado", "ar": "أفوكادو", "he": "אבוקדו"}, "description": {"en": "", "ar": "", "he": ""}, "price": 5, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Roasted Eggplant", "ar": "باذنجان محمص", "he": "חציל קלוי"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Mushrooms", "ar": "فطر", "he": "פטריות"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Red Onion", "ar": "بصل أحمر", "he": "בצל סגול"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Green Onion", "ar": "بصل أخضر", "he": "בצל ירוק"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Carrot", "ar": "جزر", "he": "גזר"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Beet", "ar": "شمندر", "he": "סלק"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Broccoli", "ar": "بروكلي", "he": "ברוקלי"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "White Cabbage", "ar": "ملفوف أبيض", "he": "כרוב לבן"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Red Cabbage", "ar": "ملفوف أحمر", "he": "כרוב אדום"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Cherry Tomatoes", "ar": "طماطم كرزية", "he": "שירי צבעים"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Parsley", "ar": "بقدونس", "he": "פטרוזליה"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Mint", "ar": "نعناع", "he": "נענע"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Basil", "ar": "ريحان", "he": "בזיליקום"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        
        # Proteins
        {"_id": str(uuid.uuid4()), "name": {"en": "Tuna", "ar": "تونة", "he": "טונה"}, "description": {"en": "", "ar": "", "he": ""}, "price": 5, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Hard Boiled Egg", "ar": "بيضة مسلوقة", "he": "ביצה קשה"}, "description": {"en": "", "ar": "", "he": ""}, "price": 5, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Omelet", "ar": "عجة", "he": "חביתה"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Chicken Breast", "ar": "صدر دجاج", "he": "חזה עוף"}, "description": {"en": "Baked", "ar": "مخبوز", "he": "אפוי"}, "price": 20, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Schnitzel", "ar": "شنيتسل", "he": "שניצל"}, "description": {"en": "Baked", "ar": "مخبوز", "he": "אפוי"}, "price": 20, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Salmon", "ar": "سلمون", "he": "סלמון"}, "description": {"en": "Baked", "ar": "مخبوز", "he": "אפוי"}, "price": 25, "is_active": True, "created_at": datetime.utcnow()},
        
        # Cheese & Dairy
        {"_id": str(uuid.uuid4()), "name": {"en": "Gouda Cheese", "ar": "جبنة غودا", "he": "גבינה גאודה"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Bulgarian Cheese", "ar": "جبنة بلغارية", "he": "בולגרית"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Halloumi Cheese", "ar": "جبنة حلومي", "he": "גבינת חלומי"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Parmesan Cheese", "ar": "جبنة بارميزان", "he": "גבינת פרמיז'ן"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Garlic Cream", "ar": "كريمة الثوم", "he": "שמנת שום"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Vegetable Cream", "ar": "كريمة خضار", "he": "שמנת ירקות"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        
        # Spreads & Sauces
        {"_id": str(uuid.uuid4()), "name": {"en": "Pesto Spread", "ar": "معجون بيستو", "he": "ממרח פסטו"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Eggplant Spread", "ar": "معجون باذنجان", "he": "ממרח חציל"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Tahini", "ar": "طحينة", "he": "טחינה מלאה"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Pesto Sauce", "ar": "صلصة بيستو", "he": "רוטב פסטו"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        
        # Grains & Legumes
        {"_id": str(uuid.uuid4()), "name": {"en": "Quinoa", "ar": "كينوا", "he": "קינואה"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Freekeh", "ar": "فريكة", "he": "פריקה"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Chickpeas", "ar": "حمص", "he": "חומוס גרגרים"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Red Beans", "ar": "فاصوليا حمراء", "he": "שעועית אדומה"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Spaghetti", "ar": "سباغيتي", "he": "ספגטי"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Rice", "ar": "أرز", "he": "אורז"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        
        # Others
        {"_id": str(uuid.uuid4()), "name": {"en": "Artichoke", "ar": "أرضي شوكي", "he": "ארטישוק"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Sun-dried Tomatoes", "ar": "طماطم مجففة", "he": "עגבניות מיובשות"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Pickles", "ar": "مخلل", "he": "מלפפון חמוץ"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Pastrami", "ar": "بسطرمة", "he": "פסטרמה"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "name": {"en": "Black Pepper", "ar": "فلفل أسود", "he": "פלפל"}, "description": {"en": "", "ar": "", "he": ""}, "price": 0, "is_active": True, "created_at": datetime.utcnow()},
    ]
    
    await db.ingredients.insert_many(ingredients_data)
    print(f"✅ Created {len(ingredients_data)} ingredients")
    
    # Get category IDs
    categories = await db.categories.find().to_list(length=100)
    cat_map = {cat["name"]["en"]: cat["_id"] for cat in categories}
    
    # Get ingredient IDs
    ingredients = await db.ingredients.find().to_list(length=200)
    ing_map = {ing["name"]["en"]: ing["_id"] for ing in ingredients}
    
    # Helper function to create meal ingredients
    def create_ingredients(ing_names):
        return [{"ingredient_id": ing_map.get(name, ""), "is_optional": True, "is_default": True, "extra_price": 0} 
                for name in ing_names if name in ing_map]
    
    # Create meals
    meals_data = [
        # Sandwiches
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Vegan Sandwich", "ar": "ساندويتش نباتي", "he": "כריך טבעוני"},
            "description": {"en": "Pesto spread, eggplant spread, roasted eggplant, sweet potato, roasted peppers and avocado", 
                          "ar": "معجون بيستو، معجون باذنجان، باذنجان محمص، بطاطا حلوة، فلفل محمص وأفوكادو",
                          "he": "ממרח פסטו, ממרח חציל, חציל קלוי, בטטה, פלפלים קלויים ואבוקדו"},
            "price": 30,
            "category_id": cat_map["Sandwiches"],
            "ingredients": create_ingredients(["Pesto Spread", "Eggplant Spread", "Roasted Eggplant", "Sweet Potato", "Roasted Peppers", "Avocado"]),
            "is_active": True,
            "is_available": True,
            "is_vegan": True,
            "is_vegetarian": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Tuna Sandwich", "ar": "ساندويتش تونة", "he": "כריך טונה"},
            "description": {"en": "Eggplant or avocado spread, tuna, roasted peppers and tahini with lemon salt seasoning",
                          "ar": "معجون باذنجان أو أفوكادو، تونة، فلفل محمص وطحينة مع ملح الليمون",
                          "he": "ממרח חציל או אבוקדו, טונה, פלפלים קלויים וטחינה מלאה בתיבול מלח לימון"},
            "price": 30,
            "category_id": cat_map["Sandwiches"],
            "ingredients": create_ingredients(["Eggplant Spread", "Avocado", "Tuna", "Roasted Peppers", "Tahini"]),
            "is_active": True,
            "is_available": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Omelet Sandwich", "ar": "ساندويتش عجة", "he": "כריך חביתה"},
            "description": {"en": "Omelet", "ar": "عجة", "he": "חביתה"},
            "price": 30,
            "category_id": cat_map["Sandwiches"],
            "ingredients": create_ingredients(["Omelet"]),
            "is_active": True,
            "is_available": True,
            "is_vegetarian": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Hard Boiled Egg Sandwich", "ar": "ساندويتش بيضة مسلوقة", "he": "כריך ביצה קשה"},
            "description": {"en": "Hard boiled egg and avocado", "ar": "بيضة مسلوقة وأفوكادو", "he": "ביצה קשה ואבוקדו"},
            "price": 30,
            "category_id": cat_map["Sandwiches"],
            "ingredients": create_ingredients(["Hard Boiled Egg", "Avocado"]),
            "is_active": True,
            "is_available": True,
            "is_vegetarian": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Cheese Sandwich", "ar": "ساندويتش جبن", "he": "כריך גבינות"},
            "description": {"en": "Three types of cheese: garlic cream, vegetable cream and Bulgarian", 
                          "ar": "ثلاثة أنواع من الجبن: كريمة الثوم، كريمة الخضار والبلغارية",
                          "he": "שלושה סוגי גבינות בכריך: שמנת שום שמיר, שמנת ירקות ובולגרית"},
            "price": 30,
            "category_id": cat_map["Sandwiches"],
            "ingredients": create_ingredients(["Garlic Cream", "Vegetable Cream", "Bulgarian Cheese"]),
            "is_active": True,
            "is_available": True,
            "is_vegetarian": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Avocado Sandwich", "ar": "ساندويتش أفوكادو", "he": "כריך אבוקדו"},
            "description": {"en": "Avocado sandwich", "ar": "ساندويتش أفوكادو", "he": "כריך אבוקדו"},
            "price": 30,
            "category_id": cat_map["Sandwiches"],
            "ingredients": create_ingredients(["Avocado"]),
            "is_active": True,
            "is_available": True,
            "is_vegan": True,
            "is_vegetarian": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Chicken Sandwich", "ar": "ساندويتش دجاج", "he": "כריך עוף"},
            "description": {"en": "Eggplant spread, roasted peppers, sweet potato, lettuce, tomatoes, cucumber",
                          "ar": "معجون باذنجان، فلفل محمص، بطاطا حلوة، خس، طماطم، خيار",
                          "he": "ממרח חציל, פלפלים קלויים, בטטה, חסה, עגבניות, מלפפון"},
            "price": 40,
            "category_id": cat_map["Sandwiches"],
            "ingredients": create_ingredients(["Chicken Breast", "Eggplant Spread", "Roasted Peppers", "Sweet Potato", "Lettuce", "Tomato", "Cucumber"]),
            "is_active": True,
            "is_available": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Schnitzel Sandwich", "ar": "ساندويتش شنيتسل", "he": "כריך שניצל"},
            "description": {"en": "Pesto spread, lettuce, tomatoes, cucumber, sweet potato, roasted peppers",
                          "ar": "معجون بيستو، خس، طماطم، خيار، بطاطا حلوة، فلفل محمص",
                          "he": "ממרח פסטו, חסה, עגבניות, מלפפון, בטטה, פלפלים קלויים"},
            "price": 40,
            "category_id": cat_map["Sandwiches"],
            "ingredients": create_ingredients(["Schnitzel", "Pesto Spread", "Lettuce", "Tomato", "Cucumber", "Sweet Potato", "Roasted Peppers"]),
            "is_active": True,
            "is_available": True,
            "created_at": datetime.utcnow()
        },
        
        # Breakfast
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Shakshuka", "ar": "شكشوكة", "he": "שקשוקה"},
            "description": {"en": "Shakshuka with personal salad and cheese & dips set",
                          "ar": "شكشوكة مع سلطة شخصية ومجموعة الجبن والمقبلات",
                          "he": "שקשוקה בתוספת סלט אישי וסט גבינות ומטבלים"},
            "price": 65,
            "category_id": cat_map["Breakfast"],
            "ingredients": [],
            "is_active": True,
            "is_available": True,
            "is_vegetarian": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Vegetable Omelet", "ar": "عجة خضار", "he": "חביתה ירק"},
            "description": {"en": "Eggs of your choice, with personal salad or vegetables",
                          "ar": "بيض من اختيارك، مع سلطة شخصية أو خضار",
                          "he": "ביצים לבחירתך, תוספת סלט אישי או ירקות"},
            "price": 45,
            "category_id": cat_map["Breakfast"],
            "ingredients": create_ingredients(["Omelet"]),
            "is_active": True,
            "is_available": True,
            "is_vegetarian": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Cheese Toast", "ar": "توست جبن", "he": "טוסט גבינה"},
            "description": {"en": "Gouda cheese toast with pesto", "ar": "توست جبنة غودا مع بيستو", "he": "טוסט גבינה גאודה עם פסטו"},
            "price": 40,
            "category_id": cat_map["Breakfast"],
            "ingredients": create_ingredients(["Gouda Cheese", "Pesto Spread"]),
            "is_active": True,
            "is_available": True,
            "is_vegetarian": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Pastrami Toast", "ar": "توست بسطرمة", "he": "טוסט פסטרמה"},
            "description": {"en": "Beef pastrami toast with pepper cheese, pesto and vegetables of your choice",
                          "ar": "توست بسطرمة لحم البقر مع الجبن والفلفل والبيستو والخضار من اختيارك",
                          "he": "טוסט פסטרמה בקר פלפל + גבינה פסטו וירקות לבחירתך"},
            "price": 40,
            "category_id": cat_map["Breakfast"],
            "ingredients": create_ingredients(["Pastrami", "Gouda Cheese", "Black Pepper", "Pesto Spread"]),
            "is_active": True,
            "is_available": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Custom Toast", "ar": "توست حسب الطلب", "he": "טוסט בהרכבה עצמית"},
            "description": {"en": "Custom toast", "ar": "توست حسب الطلب", "he": "טוסט בהרכבה עצמית"},
            "price": 40,
            "category_id": cat_map["Breakfast"],
            "ingredients": [],
            "is_active": True,
            "is_available": True,
            "created_at": datetime.utcnow()
        },
        
        # Hot Drinks
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Cafe Hafuch", "ar": "قهوة حافوخ", "he": "קפה הפוך"},
            "description": {"en": "Cafe Hafuch", "ar": "قهوة حافوخ", "he": "קפה הפוך"},
            "price": 10,
            "category_id": cat_map["Hot Drinks"],
            "ingredients": [],
            "is_active": True,
            "is_available": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Soy Cafe Hafuch", "ar": "قهوة حافوخ صويا", "he": "קפה הפוך סויה"},
            "description": {"en": "Soy cafe hafuch", "ar": "قهوة حافوخ صويا", "he": "קפה הפוך סויה"},
            "price": 13,
            "category_id": cat_map["Hot Drinks"],
            "ingredients": [],
            "is_active": True,
            "is_available": True,
            "is_vegan": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Oat Milk Cafe Hafuch", "ar": "قهوة حافوخ شوفان", "he": "קפה הפוך שיבולת שועל"},
            "description": {"en": "Oat milk cafe hafuch", "ar": "قهوة حافوخ شوفان", "he": "קפה הפוך שיבולת שועל"},
            "price": 13,
            "category_id": cat_map["Hot Drinks"],
            "ingredients": [],
            "is_active": True,
            "is_available": True,
            "is_vegan": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Espresso", "ar": "إسبريسو", "he": "אספרסו"},
            "description": {"en": "Short or long espresso", "ar": "إسبريسو قصير أو طويل", "he": "אספרסו קצר | ארוך"},
            "price": 10,
            "category_id": cat_map["Hot Drinks"],
            "ingredients": [],
            "is_active": True,
            "is_available": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Almond Cafe Hafuch", "ar": "قهوة حافوخ لوز", "he": "הפוך שקדים"},
            "description": {"en": "Almond cafe hafuch", "ar": "قهوة حافوخ لوز", "he": "הפוך שקדים"},
            "price": 13,
            "category_id": cat_map["Hot Drinks"],
            "ingredients": [],
            "is_active": True,
            "is_available": True,
            "is_vegan": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Americano", "ar": "أمريكانو", "he": "אמריקנו"},
            "description": {"en": "Americano", "ar": "أمريكانو", "he": "אמריקנו"},
            "price": 10,
            "category_id": cat_map["Hot Drinks"],
            "ingredients": [],
            "is_active": True,
            "is_available": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Tea", "ar": "شاي", "he": "תה"},
            "description": {"en": "Tea", "ar": "شاي", "he": "תה"},
            "price": 10,
            "category_id": cat_map["Hot Drinks"],
            "ingredients": [],
            "is_active": True,
            "is_available": True,
            "created_at": datetime.utcnow()
        },
        
        # Fresh Juices
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Green Juice", "ar": "عصير أخضر", "he": "מיץ ירוק"},
            "description": {"en": "Cucumber, green apple, celery, mint", "ar": "خيار، تفاح أخضر، كرفس، نعناع", "he": "מלפפון, תפוח ירוק, סלרי, נענע"},
            "price": 23,
            "category_id": cat_map["Fresh Juices"],
            "ingredients": [],
            "is_active": True,
            "is_available": True,
            "is_vegan": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Beet Juice", "ar": "عصير شمندر", "he": "סלק"},
            "description": {"en": "Beet", "ar": "شمندر", "he": "סלק"},
            "price": 23,
            "category_id": cat_map["Fresh Juices"],
            "ingredients": [],
            "is_active": True,
            "is_available": True,
            "is_vegan": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Carrot Juice", "ar": "عصير جزر", "he": "גזר"},
            "description": {"en": "Carrot", "ar": "جزر", "he": "גזר"},
            "price": 23,
            "category_id": cat_map["Fresh Juices"],
            "ingredients": [],
            "is_active": True,
            "is_available": True,
            "is_vegan": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Orange Juice", "ar": "عصير برتقال", "he": "תפוזים"},
            "description": {"en": "Oranges", "ar": "برتقال", "he": "תפוזים"},
            "price": 23,
            "category_id": cat_map["Fresh Juices"],
            "ingredients": [],
            "is_active": True,
            "is_available": True,
            "is_vegan": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Beet & Carrot Juice", "ar": "عصير شمندر وجزر", "he": "סלק וגזר"},
            "description": {"en": "Beet, carrot", "ar": "شمندر، جزر", "he": "סלק, גזר"},
            "price": 23,
            "category_id": cat_map["Fresh Juices"],
            "ingredients": [],
            "is_active": True,
            "is_available": True,
            "is_vegan": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Carrot & Orange Juice", "ar": "عصير جزر وبرتقال", "he": "גזר ותפוזים"},
            "description": {"en": "Carrot, oranges", "ar": "جزر، برتقال", "he": "גזר, תפוזים"},
            "price": 23,
            "category_id": cat_map["Fresh Juices"],
            "ingredients": [],
            "is_active": True,
            "is_available": True,
            "is_vegan": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Orange & Beet Juice", "ar": "عصير برتقال وشمندر", "he": "תפוזים וסלק"},
            "description": {"en": "Oranges, beet", "ar": "برتقال، شمندر", "he": "תפוזים, סלק"},
            "price": 23,
            "category_id": cat_map["Fresh Juices"],
            "ingredients": [],
            "is_active": True,
            "is_available": True,
            "is_vegan": True,
            "created_at": datetime.utcnow()
        },
        
        # Main Dishes
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Chicken Breast with Rice", "ar": "صدر دجاج مع أرز", "he": "חזה עוף עם אורז"},
            "description": {"en": "Chicken breast with rice and vegetables", "ar": "صدر دجاج مع أرز وخضار", "he": "חזה עוף עם אורז וירקות"},
            "price": 65,
            "category_id": cat_map["Main Dishes"],
            "ingredients": create_ingredients(["Chicken Breast", "Rice"]),
            "is_active": True,
            "is_available": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Salmon with Rice", "ar": "سلمون مع أرز", "he": "סלמון עם אורז"},
            "description": {"en": "Baked salmon with rice and vegetables", "ar": "سلمون مخبوز مع أرز وخضار", "he": "סלמון אפוי עם אורז וירקות"},
            "price": 85,
            "category_id": cat_map["Main Dishes"],
            "ingredients": create_ingredients(["Salmon", "Rice"]),
            "is_active": True,
            "is_available": True,
            "created_at": datetime.utcnow()
        },
        
        # Salads
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Quinoa Salad", "ar": "سلطة كينوا", "he": "סלט קינואה"},
            "description": {"en": "Lettuce, cucumber, sweet potato, beet, red onion, quinoa",
                          "ar": "خس، خيار، بطاطا حلوة، شمندر، بصل أحمر، كينوا",
                          "he": "חסה, מלפפון, בטטה, סלק, בצל סגול, קינואה"},
            "price": 45,
            "category_id": cat_map["Salads"],
            "ingredients": create_ingredients(["Lettuce", "Cucumber", "Sweet Potato", "Beet", "Red Onion", "Quinoa"]),
            "is_active": True,
            "is_available": True,
            "is_vegan": True,
            "is_vegetarian": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Freekeh Salad", "ar": "سلطة فريكة", "he": "סלט פריקה"},
            "description": {"en": "Lettuce, green onion, mint, cherry tomatoes, chickpeas, freekeh",
                          "ar": "خس، بصل أخضر، نعناع، طماطم كرزية، حمص، فريكة",
                          "he": "חסה, בצל ירוק, נענע, שירי צבעים, חומוס גרגרים, פריקה"},
            "price": 45,
            "category_id": cat_map["Salads"],
            "ingredients": create_ingredients(["Lettuce", "Green Onion", "Mint", "Cherry Tomatoes", "Chickpeas", "Freekeh"]),
            "is_active": True,
            "is_available": True,
            "is_vegan": True,
            "is_vegetarian": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Spaghetti Salad", "ar": "سلطة سباغيتي", "he": "סלט ספגטי"},
            "description": {"en": "Lettuce, cucumber, cherry tomatoes, carrot, white cabbage, red cabbage, red onion, mushrooms, spaghetti, pesto sauce, parmesan cheese",
                          "ar": "خس، خيار، طماطم كرزية، جزر، ملفوف أبيض، ملفوف أحمر، بصل أحمر، فطر، سباغيتي، صلصة بيستو، جبن بارميزان",
                          "he": "חסה, מלפפון, שירי, גזר, כרוב לבן, כרוב אדום, בצל סגול, פטריות, ספגטי, רוטב פסטו, גבינת פרמיז'ן"},
            "price": 50,
            "category_id": cat_map["Salads"],
            "ingredients": create_ingredients(["Lettuce", "Cucumber", "Cherry Tomatoes", "Carrot", "White Cabbage", "Red Cabbage", "Red Onion", "Mushrooms", "Spaghetti", "Pesto Sauce", "Parmesan Cheese"]),
            "is_active": True,
            "is_available": True,
            "is_vegetarian": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Halloumi Salad", "ar": "سلطة حلومي", "he": "סלט חלומי"},
            "description": {"en": "Lettuce, cucumber, cherry tomatoes, red onion, mushrooms, sweet potato, halloumi cheese",
                          "ar": "خس، خيار، طماطم كرزية، بصل أحمر، فطر، بطاطا حلوة، جبنة حلومي",
                          "he": "חסה, מלפפון, שירי, בצל סגול, פטריות, בטטה, גבינת חלומי"},
            "price": 55,
            "category_id": cat_map["Salads"],
            "ingredients": create_ingredients(["Lettuce", "Cucumber", "Cherry Tomatoes", "Red Onion", "Mushrooms", "Sweet Potato", "Halloumi Cheese"]),
            "is_active": True,
            "is_available": True,
            "is_vegetarian": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Artichoke Salad", "ar": "سلطة أرضي شوكي", "he": "סלט ארטישוק"},
            "description": {"en": "Cherry tomatoes, red onion, artichoke, sun-dried tomatoes, basil",
                          "ar": "طماطم كرزية، بصل أحمر، أرضي شوكي، طماطم مجففة، ريحان",
                          "he": "שירי, בצל סגול, ארטישוק, עגבניות מיובשות, בזיליקום"},
            "price": 50,
            "category_id": cat_map["Salads"],
            "ingredients": create_ingredients(["Cherry Tomatoes", "Red Onion", "Artichoke", "Sun-dried Tomatoes", "Basil"]),
            "is_active": True,
            "is_available": True,
            "is_vegan": True,
            "is_vegetarian": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Tuna Salad", "ar": "سلطة تونة", "he": "סלט טונה"},
            "description": {"en": "Lettuce, white/red cabbage, red onion, mushrooms, carrot, parsley, pickles",
                          "ar": "خس، ملفوف أبيض/أحمر، بصل أحمر، فطر، جزر، بقدونس، مخلل",
                          "he": "חסה, כרוב לבן/אדום, בצל אדום, פטריות, גזר, פטרוזליה, מלפפון חמוץ"},
            "price": 49,
            "category_id": cat_map["Salads"],
            "ingredients": create_ingredients(["Tuna", "Lettuce", "White Cabbage", "Red Cabbage", "Red Onion", "Mushrooms", "Carrot", "Parsley", "Pickles"]),
            "is_active": True,
            "is_available": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Hard Boiled Egg Salad", "ar": "سلطة بيضة مسلوقة", "he": "סלט ביצה קשה"},
            "description": {"en": "Lettuce, cucumber, carrot, white/red cabbage, broccoli, mushrooms, mint, sweet potato",
                          "ar": "خس، خيار، جزر، ملفوف أبيض/أحمر، بروكلي، فطر، نعناع، بطاطا حلوة",
                          "he": "חסה, מלפפון, גזר, כרוב לבן/אדום, ברוקלי, פטריות, נענע, בטטה"},
            "price": 49,
            "category_id": cat_map["Salads"],
            "ingredients": create_ingredients(["Hard Boiled Egg", "Lettuce", "Cucumber", "Carrot", "White Cabbage", "Red Cabbage", "Broccoli", "Mushrooms", "Mint", "Sweet Potato"]),
            "is_active": True,
            "is_available": True,
            "is_vegetarian": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Avocado Salad", "ar": "سلطة أفوكادو", "he": "סלט אבוקדו"},
            "description": {"en": "Lettuce, cucumber, cherry tomatoes, carrot, sweet potato, beet, broccoli, red beans",
                          "ar": "خس، خيار، طماطم كرزية، جزر، بطاطا حلوة، شمندر، بروكلي، فاصوليا حمراء",
                          "he": "חסה, מלפפון, שירי צבעים, גזר, בטטה, סלק, ברוקלי, שעועית אדומה"},
            "price": 49,
            "category_id": cat_map["Salads"],
            "ingredients": create_ingredients(["Avocado", "Lettuce", "Cucumber", "Cherry Tomatoes", "Carrot", "Sweet Potato", "Beet", "Broccoli", "Red Beans"]),
            "is_active": True,
            "is_available": True,
            "is_vegan": True,
            "is_vegetarian": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Chicken Salad", "ar": "سلطة دجاج", "he": "סלט עוף"},
            "description": {"en": "Lettuce, cherry tomatoes, cucumber, carrot, white/red cabbage, mushrooms, red onion",
                          "ar": "خس، طماطم كرزية، خيار، جزر، ملفوف أبيض/أحمر، فطر، بصل أحمر",
                          "he": "חסה, שירי צבעים, מלפפון, גזר, כרוב לבן אדום, פטריות, בצל סגול"},
            "price": 57,
            "category_id": cat_map["Salads"],
            "ingredients": create_ingredients(["Chicken Breast", "Lettuce", "Cherry Tomatoes", "Cucumber", "Carrot", "White Cabbage", "Red Cabbage", "Mushrooms", "Red Onion"]),
            "is_active": True,
            "is_available": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": {"en": "Salmon Salad", "ar": "سلطة سلمون", "he": "סלט סלמון"},
            "description": {"en": "Lettuce, cucumber, carrot, white/red cabbage, sweet potato, broccoli, green onion",
                          "ar": "خس، خيار، جزر، ملفوف أبيض/أحمر، بطاطا حلوة، بروكلي، بصل أخضر",
                          "he": "חסה, מלפפון, גזר, כרוב לבן אדום, בטטה, ברוקלי, בצל ירוק"},
            "price": 65,
            "category_id": cat_map["Salads"],
            "ingredients": create_ingredients(["Salmon", "Lettuce", "Cucumber", "Carrot", "White Cabbage", "Red Cabbage", "Sweet Potato", "Broccoli", "Green Onion"]),
            "is_active": True,
            "is_available": True,
            "created_at": datetime.utcnow()
        },
    ]
    
    await db.meals.insert_many(meals_data)
    print(f"✅ Created {len(meals_data)} meals")
    
    print("\n🎉 Menu population completed successfully!")
    print(f"   Categories: {len(categories_data)}")
    print(f"   Ingredients: {len(ingredients_data)}")
    print(f"   Meals: {len(meals_data)}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(populate_menu())
