from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional

from ..auth import get_current_admin_user
from .. import crud, models, schemas

router = APIRouter()

@router.get("", response_model=List[schemas.Meal])
async def read_meals(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    category_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    """Get all meals with optional filtering."""
    if search:
        return await crud.crud_meal.search(search=search, skip=skip, limit=limit)
    elif category_id:
        return await crud.crud_meal.get_by_category(
            category_id=category_id, skip=skip, limit=limit, active_only=active_only
        )
    else:
        return await crud.crud_meal.get_multi(skip=skip, limit=limit, active_only=active_only)

@router.post("", response_model=schemas.Meal)
async def create_meal(
    *,
    meal_in: schemas.MealCreate,
    current_user: models.User = Depends(get_current_admin_user)
):
    """Create new meal (Admin only)."""
    # Verify category exists
    category = await crud.crud_category.get(id=meal_in.category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return await crud.crud_meal.create(obj_in=meal_in)

@router.get("/{meal_id}", response_model=schemas.Meal)
async def read_meal(meal_id: str):
    """Get meal by ID."""
    meal = await crud.crud_meal.get(id=meal_id)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    return meal

@router.put("/{meal_id}", response_model=schemas.Meal)
async def update_meal(
    *,
    meal_id: str,
    meal_in: schemas.MealUpdate,
    current_user: models.User = Depends(get_current_admin_user)
):
    """Update meal (Admin only)."""
    meal = await crud.crud_meal.get(id=meal_id)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    # Verify category exists if updating category_id
    if meal_in.category_id:
        category = await crud.crud_category.get(id=meal_in.category_id)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
    
    meal = await crud.crud_meal.update(db_obj=meal, obj_in=meal_in)
    return meal

@router.delete("/{meal_id}", response_model=schemas.Meal)
async def delete_meal(
    *,
    meal_id: str,
    current_user: models.User = Depends(get_current_admin_user)
):
    """Delete meal (Admin only)."""
    meal = await crud.crud_meal.get(id=meal_id)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    return await crud.crud_meal.delete(id=meal_id)