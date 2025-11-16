import requests
import json

# Test getting a meal from the API
url = "https://moringa-production-93eb.up.railway.app/api/v1/meals"

response = requests.get(url, params={"active_only": False, "limit": 1})

if response.status_code == 200:
    meals = response.json()
    if meals:
        meal = meals[0]
        print(f"📋 Meal: {meal.get('name', {}).get('en', 'Unknown')}")
        print(f"\nIngredients ({len(meal.get('ingredients', []))} total):")
        
        for idx, ing in enumerate(meal.get('ingredients', []), 1):
            print(f"\n{idx}. Ingredient:")
            print(json.dumps(ing, indent=2))
    else:
        print("No meals returned")
else:
    print(f"Error: {response.status_code}")
    print(response.text)
