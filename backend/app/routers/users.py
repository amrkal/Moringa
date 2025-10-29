from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional

from ..auth import get_current_admin_user
from .. import crud, models, schemas

router = APIRouter()

@router.get("", response_model=List[schemas.User])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    role: Optional[models.UserRole] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get all users (Admin only)."""
    users = await crud.crud_user.get_multi(skip=skip, limit=limit)
    
    # Apply filters
    if role is not None:
        users = [u for u in users if u.role == role]
    
    if is_active is not None:
        users = [u for u in users if u.is_active == is_active]
    
    if search:
        search_lower = search.lower()
        users = [
            u for u in users 
            if (search_lower in u.name.lower() if u.name else False) or
               (search_lower in u.phone.lower() if u.phone else False) or
               (search_lower in u.email.lower() if u.email else False)
        ]
    
    return users

@router.get("/stats")
async def get_user_stats(
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get user statistics (Admin only)."""
    all_users = await crud.crud_user.get_multi(skip=0, limit=10000)
    
    total = len(all_users)
    customers = len([u for u in all_users if u.role == models.UserRole.CUSTOMER])
    admins = len([u for u in all_users if u.role == models.UserRole.ADMIN])
    active = len([u for u in all_users if u.is_active])
    inactive = len([u for u in all_users if not u.is_active])
    
    return {
        "total": total,
        "customers": customers,
        "admins": admins,
        "active": active,
        "inactive": inactive
    }

@router.get("/{user_id}", response_model=schemas.User)
async def get_user(
    user_id: str,
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get user by ID (Admin only)."""
    user = await crud.crud_user.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("", response_model=schemas.User)
async def create_user(
    *,
    user_in: schemas.UserCreate,
    current_user: models.User = Depends(get_current_admin_user)
):
    """Create new user (Admin only)."""
    # Check if user already exists
    existing_user = await crud.crud_user.get_by_phone(phone=user_in.phone)
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User with this phone number already exists"
        )
    if user_in.email:
        existing_email = await crud.crud_user.get_by_email(email=user_in.email)
        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="User with this email already exists"
            )
    
    user = await crud.crud_user.create(obj_in=user_in)
    return user

@router.put("/{user_id}", response_model=schemas.User)
async def update_user(
    user_id: str,
    *,
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_admin_user)
):
    """Update user (Admin only)."""
    user = await crud.crud_user.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if phone is being changed and if it's already taken
    if user_in.phone and user_in.phone != user.phone:
        existing_user = await crud.crud_user.get_by_phone(phone=user_in.phone)
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="User with this phone number already exists"
            )
    
    # Check if email is being changed and if it's already taken
    if user_in.email and user_in.email != user.email:
        existing_email = await crud.crud_user.get_by_email(email=user_in.email)
        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="User with this email already exists"
            )
    
    user = await crud.crud_user.update(db_obj=user, obj_in=user_in)
    return user

@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: models.User = Depends(get_current_admin_user)
):
    """Delete user (Admin only)."""
    # Prevent admin from deleting themselves
    if user_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete your own account"
        )
    
    user = await crud.crud_user.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    success = await crud.crud_user.delete(id=user_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete user")
    
    return {"message": "User deleted successfully"}
