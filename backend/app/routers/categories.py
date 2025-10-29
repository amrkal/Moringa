from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from ..auth import get_current_admin_user
from .. import crud, models, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.CategoryWithMealCount])
async def read_categories(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
):
    """Get all categories with meal counts (MongoDB)."""
    results = await crud.crud_category.get_with_meal_count(
        skip=skip, limit=limit, active_only=active_only
    )
    response: List[schemas.CategoryWithMealCount] = []
    for item in results:
        category: models.Category = item["category"]
        meal_count: int = item["meal_count"]
        data = category.model_dump()
        data["meal_count"] = meal_count
        response.append(schemas.CategoryWithMealCount(**data))
    return response

@router.post("/", response_model=schemas.Category)
async def create_category(
    *,
    category_in: schemas.CategoryCreate,
    current_user: models.User = Depends(get_current_admin_user)
):
    """Create new category (Admin only)."""
    return await crud.crud_category.create(obj_in=category_in)

@router.get("/{category_id}", response_model=schemas.Category)
async def read_category(
    *,
    category_id: str
):
    """Get category by ID."""
    category = await crud.crud_category.get(id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.put("/{category_id}", response_model=schemas.Category)
async def update_category(
    *,
    category_id: str,
    category_in: schemas.CategoryUpdate,
    current_user: models.User = Depends(get_current_admin_user)
):
    """Update category (Admin only)."""
    category = await crud.crud_category.get(id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    category = await crud.crud_category.update(db_obj=category, obj_in=category_in)
    return category

@router.delete("/{category_id}", response_model=schemas.Category)
async def delete_category(
    *,
    category_id: str,
    current_user: models.User = Depends(get_current_admin_user)
):
    """Delete category (Admin only)."""
    category = await crud.crud_category.get(id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    # Check if category has meals
    meals = await crud.crud_meal.get_by_category(category_id=category_id, active_only=False)
    if meals:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete category with existing meals"
        )
    # Delete and return the previously found category
    await crud.crud_category.delete(id=category_id)
    return category

@router.get("/{category_id}/meals", response_model=List[schemas.Meal])
async def read_category_meals(
    *,
    category_id: str,
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True
):
    """Get all meals in a category."""
    category = await crud.crud_category.get(id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return await crud.crud_meal.get_by_category(
        category_id=category_id, skip=skip, limit=limit, active_only=active_only
    )