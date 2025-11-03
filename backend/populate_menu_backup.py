"""
Script to populate Moringa database with menu data
Run this script to add categories, ingredients, and meals to the database
"""

import asyncio
import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent))

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config import settings
from app import models
import uuid
from datetime import datetime

async def populate_database():
    # Connect to MongoDB
    client = AsyncIOMotorClient(settings.mongodb_url)
    
    # Initialize Beanie with document models
    await init_beanie(
        database=client[settings.mongodb_database_name],
        document_models=[
            models.User,
            models.Category,
            models.Ingredient,
            models.Meal,
            models.Order,
            models.RestaurantSettings
        ]
    )
    
    print("🗄️  Starting database population...")
    
    # Clear existing data (optional - comment out if you want to keep existing data)
    print("🧹 Clearing existing data...")
    await models.Category.delete_all()
    await models.Ingredient.delete_all()
    await models.Meal.delete_all()
    
    # Categories data
    categories_data = [
        {
            "name": {"en": "Sandwiches", "ar": "ساندويشات", "he": "כריכים"},
            "description": {"en": "Fresh and healthy sandwiches", "ar": "ساندويشات طازجة وصحية", "he": "כריכים טריים ובריאים"},
            "image": "https://images.unsplash.com/photo-1509722747041-616f39b57569"
        },
        {
            "name": {"en": "Breakfast", "ar": "فطور", "he": "ארוחת בוקר"},
            "description": {"en": "Nutritious breakfast meals", "ar": "وجبات فطور مغذية", "he": "ארוחות בוקר מזינות"},
            "image": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666"
        },
        {
            "name": {"en": "Hot Drinks", "ar": "مشروبات ساخنة", "he": "שתיה חמה"},
            "description": {"en": "Quality coffee and tea", "ar": "قهوة وشاي عالي الجودة", "he": "קפה ותה איכותי"},
            "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085"
        },
        {
            "name": {"en": "Natural Juice", "ar": "عصائر طبيعية", "he": "מיץ טבעי"},
            "description": {"en": "Fresh squeezed natural juices", "ar": "عصائر طبيعية طازجة", "he": "מיצים טבעיים סחוטים"},
            "image": "https://images.unsplash.com/photo-1600271886742-f049cd451bba"
        },
        {
            "name": {"en": "Main Dishes", "ar": "أطباق رئيسية", "he": "עיקריות"},
            "description": {"en": "Nutritious main dishes", "ar": "أطباق رئيسية مغذية", "he": "מנות עיקריות מזינות"},
            "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
        },
        {
            "name": {"en": "Salads", "ar": "سلطات", "he": "סלטים"},
            "description": {"en": "Fresh and healthy salads", "ar": "سلطات طازجة وصحية", "he": "סלטים טריים ובריאים"},
            "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd"
        }
    ]
    
    # Create categories
    print("\n📁 Creating categories...")
    categories = {}
    for cat_data in categories_data:
        category = models.Category(
            id=str(uuid.uuid4()),
            name=cat_data["name"],
            description=cat_data["description"],
            image=cat_data["image"],
            is_active=True
        )
        await category.insert()
        categories[cat_data['name']['en']] = category.id
        print(f"✅ Created category: {cat_data['name']['en']}")
    
    # Common ingredients
    print("\n🥗 Creating ingredients...")
    ingredients_data = [
        {"name": {"en": "Avocado", "ar": "أفوكادو", "he": "אבוקדו"}, "price": 5.0},
        {"name": {"en": "Tuna", "ar": "تونة", "he": "טונה"}, "price": 5.0},
        {"name": {"en": "Hard Boiled Egg", "ar": "بيضة مسلوقة", "he": "ביצה קשה"}, "price": 5.0},
        {"name": {"en": "Grilled Chicken Breast", "ar": "صدر دجاج مشوي", "he": "חזה עוף אפוי"}, "price": 20.0},
        {"name": {"en": "Baked Schnitzel", "ar": "شنيتسل مشوي", "he": "שניצל אפוי"}, "price": 20.0},
        {"name": {"en": "Baked Salmon", "ar": "سلمون مشوي", "he": "סלמון אפוי"}, "price": 25.0},
        {"name": {"en": "Lettuce", "ar": "خس", "he": "חסה"}, "price": 0.0},
        {"name": {"en": "Tomatoes", "ar": "طماطم", "he": "עגבניות"}, "price": 0.0},
        {"name": {"en": "Cucumber", "ar": "خيار", "he": "מלפפון"}, "price": 0.0},
        {"name": {"en": "Onion", "ar": "بصل", "he": "בצל"}, "price": 0.0},
        {"name": {"en": "Roasted Peppers", "ar": "فلفل مشوي", "he": "פלפלים קלויים"}, "price": 0.0},
        {"name": {"en": "Sweet Potato", "ar": "بطاطا حلوة", "he": "בטטה"}, "price": 0.0},
        {"name": {"en": "Eggplant Spread", "ar": "معجون باذنجان", "he": "ממרח חציל"}, "price": 0.0},
        {"name": {"en": "Pesto Spread", "ar": "صلصة بيستو", "he": "ממרח פסטו"}, "price": 0.0},
        {"name": {"en": "Tahini", "ar": "طحينة", "he": "טחינה"}, "price": 0.0},
        {"name": {"en": "Quinoa", "ar": "كينوا", "he": "קינואה"}, "price": 0.0},
        {"name": {"en": "Freekeh", "ar": "فريكة", "he": "פריקה"}, "price": 0.0},
        {"name": {"en": "Halloumi Cheese", "ar": "جبنة حلومي", "he": "גבינת חלומי"}, "price": 0.0},
        {"name": {"en": "Artichoke", "ar": "أرضي شوكي", "he": "ארטישוק"}, "price": 0.0},
        {"name": {"en": "Beet", "ar": "شمندر", "he": "סלק"}, "price": 0.0},
    ]
    
    ingredients = {}
    for ing_data in ingredients_data:
        ingredient = models.Ingredient(
            id=str(uuid.uuid4()),
            name=ing_data["name"],
            description={"en": "", "ar": "", "he": ""},
            price=ing_data["price"],
            is_active=True
        )
        await ingredient.insert()
        ingredients[ing_data["name"]["en"]] = ingredient.id
        print(f"✅ Created ingredient: {ing_data['name']['en']}")
    
    # Meals data
    print("\n🍽️  Creating meals...")
    meals_data = [
        # Sandwiches
        {
            "category": "Sandwiches",
            "name": "כריך טבעוני",
            "name_ar": "ساندويش نباتي",
            "name_en": "Vegan Sandwich",
            "description": "ממרח פסטו, ממרח חציל, חציל קלוי, בטטה, פלפלים קלויים ואבוקדו",
            "description_ar": "معجون بيستو، معجون باذنجان، باذنجان مشوي، بطاطا حلوة، فلفل مشوي وأفوكادو",
            "description_en": "Pesto spread, eggplant spread, roasted eggplant, sweet potato, roasted peppers and avocado",
            "price": 30.0,
            "image": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af",
            "is_vegetarian": True,
            "is_vegan": True
        },
        {
            "category": "Sandwiches",
            "name": "כריך טונה",
            "name_ar": "ساندويش تونة",
            "name_en": "Tuna Sandwich",
            "description": "ממרח חציל או אבוקדו, טונה, פלפלים קלויים וטחינה מלאה בתיבול מלח לימון",
            "description_ar": "معجون باذنجان أو أفوكادو، تونة، فلفل مشوي وطحينة كاملة بتوابل ملح ليمون",
            "description_en": "Eggplant or avocado spread, tuna, roasted peppers and whole tahini with lemon salt seasoning",
            "price": 30.0,
            "image": "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5"
        },
        {
            "category": "Sandwiches",
            "name": "כריך חביתה",
            "name_ar": "ساندويش عجة",
            "name_en": "Omelette Sandwich",
            "description": "חביתה",
            "description_ar": "عجة",
            "description_en": "Omelette",
            "price": 30.0,
            "image": "https://images.unsplash.com/photo-1525351484163-7529414344d8",
            "is_vegetarian": True
        },
        {
            "category": "Sandwiches",
            "name": "כריך ביצה קשה",
            "name_ar": "ساندويش بيض مسلوق",
            "name_en": "Hard Boiled Egg Sandwich",
            "description": "ביצה קשה ואבוקדו",
            "description_ar": "بيض مسلوق وأفوكادو",
            "description_en": "Hard boiled egg and avocado",
            "price": 30.0,
            "image": "https://images.unsplash.com/photo-1482049016688-2d3e1b311543",
            "is_vegetarian": True
        },
        {
            "category": "Sandwiches",
            "name": "כריך גבינות",
            "name_ar": "ساندويش أجبان",
            "name_en": "Cheese Sandwich",
            "description": "שלושה סוגי גבינות בכריך: שמנת שום שמיר, שמנת ירקות ובולגרית",
            "description_ar": "ثلاثة أنواع من الجبن في الساندويش: كريمة ثوم شمير، كريمة خضار وبلغارية",
            "description_en": "Three types of cheese: garlic cream cheese, vegetable cream and Bulgarian cheese",
            "price": 30.0,
            "image": "https://images.unsplash.com/photo-1553909489-cd47e0907980",
            "is_vegetarian": True
        },
        {
            "category": "Sandwiches",
            "name": "כריך אבוקדו",
            "name_ar": "ساندويش أفوكادو",
            "name_en": "Avocado Sandwich",
            "description": "כריך אבוקדו",
            "description_ar": "ساندويش أفوكادو",
            "description_en": "Avocado sandwich",
            "price": 30.0,
            "image": "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d",
            "is_vegetarian": True,
            "is_vegan": True
        },
        {
            "category": "Sandwiches",
            "name": "כריך עוף",
            "name_ar": "ساندويش دجاج",
            "name_en": "Chicken Sandwich",
            "description": "ממרח חציל, פלפלים קלויים, בטטה, חסה, עגבניות, מלפפון",
            "description_ar": "معجون باذنجان، فلفل مشوي، بطاطا حلوة، خس، طماطم، خيار",
            "description_en": "Eggplant spread, roasted peppers, sweet potato, lettuce, tomatoes, cucumber",
            "price": 40.0,
            "image": "https://images.unsplash.com/photo-1606755962773-d324e0a13086"
        },
        {
            "category": "Sandwiches",
            "name": "כריך שניצל",
            "name_ar": "ساندويش شنيتسل",
            "name_en": "Schnitzel Sandwich",
            "description": "ממרח פסטו, חסה, עגבניות, מלפפון, בטטה, פלפלים קלויים",
            "description_ar": "صلصة بيستو، خس، طماطم، خيار، بطاطا حلوة، فلفل مشوي",
            "description_en": "Pesto spread, lettuce, tomatoes, cucumber, sweet potato, roasted peppers",
            "price": 40.0,
            "image": "https://images.unsplash.com/photo-1619894991209-e2aa59f7e4fc"
        },
        
        # Breakfast
        {
            "category": "Breakfast",
            "name": "שקשוקה",
            "name_ar": "شكشوكة",
            "name_en": "Shakshuka",
            "description": "שקשוקה בתוספת סלט אישי וסט גבינות ומטבלים",
            "description_ar": "شكشوكة مع سلطة شخصية ومجموعة أجبان ومقبلات",
            "description_en": "Shakshuka with personal salad and cheese and dips set",
            "price": 65.0,
            "image": "https://images.unsplash.com/photo-1587593810167-a84920ea0781",
            "is_vegetarian": True
        },
        {
            "category": "Breakfast",
            "name": "חביתה ירק",
            "name_ar": "عجة خضار",
            "name_en": "Vegetable Omelette",
            "description": "ביצים לבחירתך, תוספת סלט אישי או ירקות",
            "description_ar": "بيض حسب اختيارك، مع سلطة شخصية أو خضار",
            "description_en": "Eggs of your choice, with personal salad or vegetables",
            "price": 45.0,
            "image": "https://images.unsplash.com/photo-1608039755401-742074f0548d",
            "is_vegetarian": True
        },
        {
            "category": "Breakfast",
            "name": "טוסט גבינה",
            "name_ar": "توست جبن",
            "name_en": "Cheese Toast",
            "description": "טוסט גבינה גאודה עם פסטו",
            "description_ar": "توست جبن جودا مع بيستو",
            "description_en": "Gouda cheese toast with pesto",
            "price": 40.0,
            "image": "https://images.unsplash.com/photo-1528736235302-52922df5c122",
            "is_vegetarian": True
        },
        {
            "category": "Breakfast",
            "name": "טוסט פסטרמה",
            "name_ar": "توست باستارما",
            "name_en": "Pastrami Toast",
            "description": "טוסט פסטרמה בקר פלפל + גבינה פסטו וירקות לבחירתך",
            "description_ar": "توست باستارما لحم بقري فلفل + جبن بيستو وخضار حسب اختيارك",
            "description_en": "Beef pastrami pepper toast + pesto cheese and vegetables of your choice",
            "price": 40.0,
            "image": "https://images.unsplash.com/photo-1590759668628-05b0fc34b304"
        },
        
        # Hot Drinks
        {
            "category": "Hot Drinks",
            "name": "קפה הפוך",
            "name_ar": "قهوة مقلوبة",
            "name_en": "Latte",
            "description": "קפה הפוך",
            "description_ar": "قهوة لاتيه",
            "description_en": "Latte coffee",
            "price": 10.0,
            "image": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735"
        },
        {
            "category": "Hot Drinks",
            "name": "קפה הפוך סויה",
            "name_ar": "لاتيه صويا",
            "name_en": "Soy Latte",
            "description": "קפה הפוך עם חלב סויה",
            "description_ar": "لاتيه مع حليب الصويا",
            "description_en": "Latte with soy milk",
            "price": 13.0,
            "image": "https://images.unsplash.com/photo-1572442388796-11668a67e53d",
            "is_vegan": True
        },
        {
            "category": "Hot Drinks",
            "name": "קפה הפוך שיבולת שועל",
            "name_ar": "لاتيه شوفان",
            "name_en": "Oat Latte",
            "description": "קפה הפוך עם חלב שיבולת שועל",
            "description_ar": "لاتيه مع حليب الشوفان",
            "description_en": "Latte with oat milk",
            "price": 13.0,
            "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e",
            "is_vegan": True
        },
        {
            "category": "Hot Drinks",
            "name": "אספרסו",
            "name_ar": "إسبريسو",
            "name_en": "Espresso",
            "description": "אספרסו קצר | ארוך",
            "description_ar": "إسبريسو قصير | طويل",
            "description_en": "Short | Long espresso",
            "price": 10.0,
            "image": "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04"
        },
        {
            "category": "Hot Drinks",
            "name": "אמריקנו",
            "name_ar": "أمريكانو",
            "name_en": "Americano",
            "description": "אמריקנו",
            "description_ar": "أمريكانو",
            "description_en": "Americano",
            "price": 10.0,
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd"
        },
        {
            "category": "Hot Drinks",
            "name": "תה",
            "name_ar": "شاي",
            "name_en": "Tea",
            "description": "תה",
            "description_ar": "شاي",
            "description_en": "Tea",
            "price": 10.0,
            "image": "https://images.unsplash.com/photo-1556679343-c7306c1976bc"
        },
        
        # Natural Juices
        {
            "category": "Natural Juice",
            "name": "מיץ ירוק",
            "name_ar": "عصير أخضر",
            "name_en": "Green Juice",
            "description": "מלפפון, תפוח ירוק, סלרי, נענע",
            "description_ar": "خيار، تفاح أخضر، كرفس، نعناع",
            "description_en": "Cucumber, green apple, celery, mint",
            "price": 23.0,
            "image": "https://images.unsplash.com/photo-1610970881699-44a5587cabec",
            "is_vegan": True
        },
        {
            "category": "Natural Juice",
            "name": "סלק",
            "name_ar": "شمندر",
            "name_en": "Beet Juice",
            "description": "סלק",
            "description_ar": "عصير شمندر",
            "description_en": "Beet juice",
            "price": 23.0,
            "image": "https://images.unsplash.com/photo-1553530666-ba11a7da3888",
            "is_vegan": True
        },
        {
            "category": "Natural Juice",
            "name": "גזר",
            "name_ar": "جزر",
            "name_en": "Carrot Juice",
            "description": "גזר",
            "description_ar": "عصير جزر",
            "description_en": "Carrot juice",
            "price": 23.0,
            "image": "https://images.unsplash.com/photo-1600271886742-f049cd451bba",
            "is_vegan": True
        },
        {
            "category": "Natural Juice",
            "name": "תפוזים",
            "name_ar": "برتقال",
            "name_en": "Orange Juice",
            "description": "תפוזים",
            "description_ar": "عصير برتقال",
            "description_en": "Orange juice",
            "price": 23.0,
            "image": "https://images.unsplash.com/photo-1600271886742-f049cd451bba",
            "is_vegan": True
        },
        {
            "category": "Natural Juice",
            "name": "סלק וגזר",
            "name_ar": "شمندر وجزر",
            "name_en": "Beet & Carrot Juice",
            "description": "סלק, גזר",
            "description_ar": "شمندر، جزر",
            "description_en": "Beet, carrot",
            "price": 23.0,
            "image": "https://images.unsplash.com/photo-1622597467836-f3285f2131b8",
            "is_vegan": True
        },
        {
            "category": "Natural Juice",
            "name": "גזר ותפוזים",
            "name_ar": "جزر وبرتقال",
            "name_en": "Carrot & Orange Juice",
            "description": "גזר, תפוזים",
            "description_ar": "جزر، برتقال",
            "description_en": "Carrot, orange",
            "price": 23.0,
            "image": "https://images.unsplash.com/photo-1600271886742-f049cd451bba",
            "is_vegan": True
        },
        {
            "category": "Natural Juice",
            "name": "תפוזים וסלק",
            "name_ar": "برتقال وشمندر",
            "name_en": "Orange & Beet Juice",
            "description": "תפוזים, סלק",
            "description_ar": "برتقال، شمندر",
            "description_en": "Orange, beet",
            "price": 23.0,
            "image": "https://images.unsplash.com/photo-1600271886742-f049cd451bba",
            "is_vegan": True
        },
        
        # Main Dishes
        {
            "category": "Main Dishes",
            "name": "חזה עוף עם אורז",
            "name_ar": "صدر دجاج مع أرز",
            "name_en": "Chicken Breast with Rice",
            "description": "חזה עוף עם אורז וירקות",
            "description_ar": "صدر دجاج مع أرز وخضار",
            "description_en": "Chicken breast with rice and vegetables",
            "price": 65.0,
            "image": "https://images.unsplash.com/photo-1598103442097-8b74394b95c6"
        },
        {
            "category": "Main Dishes",
            "name": "סלמון עם אורז",
            "name_ar": "سلمون مع أرز",
            "name_en": "Salmon with Rice",
            "description": "סלמון אפוי עם אורז וירקות",
            "description_ar": "سلمون مشوي مع أرز وخضار",
            "description_en": "Baked salmon with rice and vegetables",
            "price": 85.0,
            "image": "https://images.unsplash.com/photo-1467003909585-2f8a72700288"
        },
        
        # Salads
        {
            "category": "Salads",
            "name": "סלט קינואה",
            "name_ar": "سلطة كينوا",
            "name_en": "Quinoa Salad",
            "description": "חסה, מלפפון, בטטה, סלק, בצל סגול, קינואה",
            "description_ar": "خس، خيار، بطاطا حلوة، شمندر، بصل أحمر، كينوا",
            "description_en": "Lettuce, cucumber, sweet potato, beet, red onion, quinoa",
            "price": 45.0,
            "image": "https://images.unsplash.com/photo-1505253758473-96b7015fcd40",
            "is_vegetarian": True,
            "is_vegan": True
        },
        {
            "category": "Salads",
            "name": "סלט פריקה",
            "name_ar": "سلطة فريكة",
            "name_en": "Freekeh Salad",
            "description": "חסה, בצל ירוק, נענע, שירי צבעים, חומוס גרגרים, פריקה",
            "description_ar": "خس، بصل أخضر، نعناع، طماطم كرزية، حمص مقطع، فريكة",
            "description_en": "Lettuce, green onion, mint, cherry tomatoes, chickpeas, freekeh",
            "price": 45.0,
            "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
            "is_vegetarian": True,
            "is_vegan": True
        },
        {
            "category": "Salads",
            "name": "סלט ספגטי",
            "name_ar": "سلطة سباغيتي",
            "name_en": "Spaghetti Salad",
            "description": "חסה, מלפפון, שירי, גזר, כרוב לבן, כרוב אדום, גמבה, בצל סגול, פטריות, ספגטי, רוטב פסטו, גבינת פרמיז'ן",
            "description_ar": "خس، خيار، طماطم كرزية، جزر، ملفوف أبيض، ملفوف أحمر، ذرة، بصل أحمر، فطر، سباغيتي، صلصة بيستو، جبن بارميزان",
            "description_en": "Lettuce, cucumber, cherry tomatoes, carrot, white cabbage, red cabbage, corn, red onion, mushrooms, spaghetti, pesto sauce, parmesan cheese",
            "price": 50.0,
            "image": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9",
            "is_vegetarian": True
        },
        {
            "category": "Salads",
            "name": "סלט חלומי",
            "name_ar": "سلطة حلومي",
            "name_en": "Halloumi Salad",
            "description": "חסה, מלפפון, שירי, בצל סגול, פטריות, בטטה, גבינת חלומי",
            "description_ar": "خس، خيار، طماطم كرزية، بصل أحمر، فطر، بطاطا حلوة، جبن حلومي",
            "description_en": "Lettuce, cucumber, cherry tomatoes, red onion, mushrooms, sweet potato, halloumi cheese",
            "price": 55.0,
            "image": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
            "is_vegetarian": True
        },
        {
            "category": "Salads",
            "name": "סלט ארטישוק",
            "name_ar": "سلطة أرضي شوكي",
            "name_en": "Artichoke Salad",
            "description": "שירי, בצל סגול, ארטישוק, עגבניות מיובשות, בזיליקום",
            "description_ar": "طماطم كرزية، بصل أحمر، أرضي شوكي، طماطم مجففة، ريحان",
            "description_en": "Cherry tomatoes, red onion, artichoke, sun-dried tomatoes, basil",
            "price": 50.0,
            "image": "https://images.unsplash.com/photo-1604909052743-94e838986d24",
            "is_vegetarian": True,
            "is_vegan": True
        },
        {
            "category": "Salads",
            "name": "סלט טונה",
            "name_ar": "سلطة تونة",
            "name_en": "Tuna Salad",
            "description": "חסה, כרוב לבן/אדום, בצל אדום, פטריות, גזר, פטרוזליה, מלפפון חמוץ, גמבה",
            "description_ar": "خس، ملفوف أبيض/أحمر، بصل أحمر، فطر، جزر، بقدونس، مخلل خيار، ذرة",
            "description_en": "Lettuce, white/red cabbage, red onion, mushrooms, carrot, parsley, pickles, corn",
            "price": 49.0,
            "image": "https://images.unsplash.com/photo-1551248429-40975aa4de74"
        },
        {
            "category": "Salads",
            "name": "סלט ביצה קשה",
            "name_ar": "سلطة بيض مسلوق",
            "name_en": "Hard Boiled Egg Salad",
            "description": "חסה, טרד, מלפפון, גזר, כרוב לבן/אדום, ברוקלי, פטריות, נענע, בטטה",
            "description_ar": "خس، جرجير، خيار، جزر، ملفوف أبيض/أحمر، بروكلي، فطر، نعناع، بطاطا حلوة",
            "description_en": "Lettuce, arugula, cucumber, carrot, white/red cabbage, broccoli, mushrooms, mint, sweet potato",
            "price": 49.0,
            "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
            "is_vegetarian": True
        },
        {
            "category": "Salads",
            "name": "סלט אבוקדו",
            "name_ar": "سلطة أفوكادو",
            "name_en": "Avocado Salad",
            "description": "חסה, טרד, מלפפון, שירי צבעים, גזר, בטטה, סלק, ברוקלי, שעועית אדומה",
            "description_ar": "خس، جرجير، خيار، طماطم كرزية، جزر، بطاطا حلوة، شمندر، بروكلي، فاصولياء حمراء",
            "description_en": "Lettuce, arugula, cucumber, cherry tomatoes, carrot, sweet potato, beet, broccoli, red beans",
            "price": 49.0,
            "image": "https://images.unsplash.com/photo-1550304943-4f24f54ddde9",
            "is_vegetarian": True,
            "is_vegan": True
        },
        {
            "category": "Salads",
            "name": "סלט עוף",
            "name_ar": "سلطة دجاج",
            "name_en": "Chicken Salad",
            "description": "חסה, שירי צבעים, מלפפון, גזר, כרוב לבן אדום, פטריות, בצל סגול",
            "description_ar": "خس، طماطم كرزية، خيار، جزר، ملفوף أبيض أحمر، فطر، بصل أحمر",
            "description_en": "Lettuce, cherry tomatoes, cucumber, carrot, white/red cabbage, mushrooms, red onion",
            "price": 57.0,
            "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
        },
        {
            "category": "Salads",
            "name": "סלט סלמון",
            "name_ar": "سلطة سلمون",
            "name_en": "Salmon Salad",
            "description": "חסה, מלפפון, גזר, כרוב לבן אדום, בטטה, ברוקלי, בצל ירוק",
            "description_ar": "خس، خيار، جزر، ملفوف أبيض أحمر، بطاطا حلوة، بروكلي، بصل أخضر",
            "description_en": "Lettuce, cucumber, carrot, white/red cabbage, sweet potato, broccoli, green onion",
            "price": 65.0,
            "image": "https://images.unsplash.com/photo-1467003909585-2f8a72700288"
        }
    ]
    
    for meal_data in meals_data:
        meal = models.Meal(
            id=str(uuid.uuid4()),
            category_id=categories[meal_data["category"]],
            name=meal_data["name"],
            name_ar=meal_data["name_ar"],
            name_en=meal_data["name_en"],
            description=meal_data["description"],
            description_ar=meal_data["description_ar"],
            description_en=meal_data["description_en"],
            price=meal_data["price"],
            image=meal_data["image"],
            is_available=True,
            is_vegetarian=meal_data.get("is_vegetarian", False),
            is_vegan=meal_data.get("is_vegan", False),
            is_spicy=False,
            preparation_time=15
        )
        await meal.insert()
        print(f"✅ Created meal: {meal_data['name_en']}")
    
    print("\n✨ Database population completed successfully!")
    print(f"📊 Summary:")
    print(f"   - Categories: {len(categories_data)}")
    print(f"   - Ingredients: {len(ingredients_data)}")
    print(f"   - Meals: {len(meals_data)}")

if __name__ == "__main__":
    asyncio.run(populate_database())
