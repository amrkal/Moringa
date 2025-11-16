from fastapi import APIRouter, Depends, HTTPException
from typing import List

from ..auth import get_current_admin_user
from .. import crud, models, schemas

router = APIRouter()

@router.get("", response_model=List[schemas.Ingredient])
async def read_ingredients(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True
):
    """Get all ingredients."""
    return await crud.crud_ingredient.get_multi(
        skip=skip, limit=limit, active_only=active_only
    )

@router.post("", response_model=schemas.Ingredient)
async def create_ingredient(
    *,
    ingredient_in: schemas.IngredientCreate,
    current_user: models.User = Depends(get_current_admin_user)
):
    """Create new ingredient (Admin only)."""
    return await crud.crud_ingredient.create(obj_in=ingredient_in)

@router.get("/{ingredient_id}", response_model=schemas.Ingredient)
async def read_ingredient(ingredient_id: str):
    """Get ingredient by ID."""
    ingredient = await crud.crud_ingredient.get(id=ingredient_id)
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return ingredient

@router.put("/{ingredient_id}", response_model=schemas.Ingredient)
async def update_ingredient(
    *,
    ingredient_id: str,
    ingredient_in: schemas.IngredientUpdate,
    current_user: models.User = Depends(get_current_admin_user)
):
    """Update ingredient (Admin only)."""
    ingredient = await crud.crud_ingredient.get(id=ingredient_id)
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    ingredient = await crud.crud_ingredient.update(db_obj=ingredient, obj_in=ingredient_in)
    return ingredient

@router.delete("/{ingredient_id}", response_model=schemas.Ingredient)
async def delete_ingredient(
    *,
    ingredient_id: str,
    current_user: models.User = Depends(get_current_admin_user)
):
    """Delete ingredient (Admin only)."""
    ingredient = await crud.crud_ingredient.get(id=ingredient_id)
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    return await crud.crud_ingredient.delete(id=ingredient_id)