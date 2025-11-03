from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional

from ..auth import get_current_active_user, get_current_admin_user
from .. import crud, models, schemas

router = APIRouter()

@router.post("/", response_model=models.Order)
async def create_order(
    *,
    order_in: schemas.OrderCreate,
    current_user: models.User = Depends(get_current_active_user)
):
    """Create a new order."""
    # Verify all meals exist and calculate total
    total_amount = 0
    for item in order_in.items:
        meal = await crud.crud_meal.get(id=item.meal_id)
        if not meal:
            raise HTTPException(status_code=404, detail=f"Meal {item.meal_id} not found")
        
        # Verify ingredients exist
        for ingredient in item.selected_ingredients:
            ing = await crud.crud_ingredient.get(id=ingredient.ingredient_id)
            if not ing:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Ingredient {ingredient.ingredient_id} not found"
                )
    
    order = await crud.crud_order.create(obj_in=order_in, user_id=current_user.id)
    return order

@router.get("/my-orders", response_model=List[models.Order])
async def read_my_orders(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user)
):
    """Get current user's orders."""
    orders = await crud.crud_order.get_by_user(
        user_id=current_user.id, skip=skip, limit=limit
    )
    return orders

@router.get("/{order_id}", response_model=models.Order)
async def read_order(
    *,
    order_id: str,
    current_user: models.User = Depends(get_current_active_user)
):
    """Get order by ID."""
    order = await crud.crud_order.get(id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if user owns the order or is admin
    if order.user_id != current_user.id and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return order

# Admin endpoints
@router.get("/", response_model=List[models.Order])
async def read_orders(
    skip: int = 0,
    limit: int = 100,
    status: Optional[schemas.OrderStatus] = Query(None),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get all orders (Admin only)."""
    if status:
        orders = await crud.crud_order.get_by_status(
            status=status, skip=skip, limit=limit
        )
    else:
        orders = await crud.crud_order.get_multi(skip=skip, limit=limit)
    return orders

@router.put("/{order_id}", response_model=models.Order)
async def update_order(
    *,
    order_id: str,
    order_in: schemas.OrderUpdate,
    current_user: models.User = Depends(get_current_admin_user)
):
    """Update order (Admin only)."""
    order = await crud.crud_order.get(id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order = await crud.crud_order.update(db_obj=order, obj_in=order_in)
    return order

@router.get("/stats/dashboard", response_model=schemas.DashboardStats)
async def get_dashboard_stats(
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get dashboard statistics (Admin only)."""
    stats = await crud.crud_order.get_stats()
    return schemas.DashboardStats(**stats)