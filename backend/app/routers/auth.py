from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from datetime import timedelta
from typing import List

from ..auth import create_access_token, get_current_active_user, get_current_admin_user
from ..config import settings
from .. import crud, models, schemas

router = APIRouter()
security = HTTPBearer()

@router.post("/register", response_model=schemas.User)
async def register_user(
    *,
    user_in: schemas.UserCreate
):
    """Register a new user."""
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

@router.post("/login", response_model=schemas.Token)
async def login_user(
    *,
    user_credentials: schemas.UserLogin
):
    """Login user and return access token."""
    user = await crud.crud_user.authenticate(phone=user_credentials.phone, password=user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.phone}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_active_user)):
    """Get current user profile."""
    return current_user

@router.put("/me", response_model=schemas.User)
async def update_user_me(
    *,
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_active_user)
):
    """Update current user profile."""
    user = await crud.crud_user.update(db_obj=current_user, obj_in=user_in)
    return user

@router.post("/verify-phone", response_model=schemas.APIResponse)
async def request_phone_verification(
    *,
    verification_request: schemas.PhoneVerification
):
    """Request phone verification via SMS/WhatsApp."""
    # TODO: Implement Twilio integration
    # For now, return success
    return schemas.APIResponse(
        success=True,
        message=f"Verification code sent to {verification_request.phone} via {verification_request.method}"
    )

@router.post("/confirm-phone", response_model=schemas.APIResponse)
async def confirm_phone_verification(
    *,
    verification_confirm: schemas.PhoneVerificationConfirm
):
    """Confirm phone verification code."""
    # TODO: Implement actual verification logic
    # For now, just mark user as verified if code is '123456'
    if verification_confirm.code != "123456":
        raise HTTPException(
            status_code=400,
            detail="Invalid verification code"
        )

    # Find or create user by phone
    user = await crud.crud_user.get_by_phone(phone=verification_confirm.phone)
    if not user:
        # Create a minimal customer user record for OTP login
        # Email is optional for phone-only users
        user = await crud.crud_user.create(
            obj_in=schemas.UserCreate(
                phone=verification_confirm.phone,
                name="Guest",
                email=None,
                password=None,
            )
        )

    # Mark verified
    user_update = schemas.UserUpdate(is_verified=True)
    user = await crud.crud_user.update(db_obj=user, obj_in=user_update)

    # Issue access token similar to /login
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.phone}, expires_delta=access_token_expires
    )

    return schemas.APIResponse(
        success=True,
        message="Phone number verified successfully",
        data={
            "access_token": access_token,
            "token_type": "bearer",
            "user": user,
            "verified": True,
        },
    )

# Admin endpoints
@router.get("/", response_model=List[schemas.User])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get all users (Admin only)."""
    users = await crud.crud_user.get_multi(skip=skip, limit=limit)
    return users

@router.get("/{user_id}", response_model=schemas.User)
async def read_user(
    *,
    user_id: str,
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get user by ID (Admin only)."""
    user = await crud.crud_user.get(id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=schemas.User)
async def update_user(
    *,
    user_id: str,
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_admin_user)
):
    """Update user by ID (Admin only)."""
    user = await crud.crud_user.get(id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user = await crud.crud_user.update(db_obj=user, obj_in=user_in)
    return user

@router.delete("/{user_id}")
async def delete_user(
    *,
    user_id: str,
    current_user: models.User = Depends(get_current_admin_user)
):
    """Delete user by ID (Admin only)."""
    user = await crud.crud_user.get(id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deleting yourself
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    await crud.crud_user.remove(id=user_id)
    return {"success": True, "message": "User deleted successfully"}