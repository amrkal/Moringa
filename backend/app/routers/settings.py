from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from datetime import datetime

from ..auth import get_current_admin_user
from .. import models, schemas

router = APIRouter()

@router.get("", response_model=schemas.RestaurantSettings)
async def get_settings():
    """Get restaurant settings (public)."""
    # Try to get existing settings
    settings = await models.RestaurantSettings.find_one()
    
    # If no settings exist, create default settings
    if not settings:
        settings = models.RestaurantSettings()
        await settings.insert()
    
    return settings

@router.post("", response_model=schemas.RestaurantSettings)
async def update_settings(
    *,
    settings_in: schemas.RestaurantSettingsBase,
    current_user: models.User = Depends(get_current_admin_user)
):
    """Update restaurant settings (Admin only)."""
    # Get existing settings or create new
    settings = await models.RestaurantSettings.find_one()
    
    if not settings:
        # Create new settings
        settings = models.RestaurantSettings(**settings_in.dict())
        await settings.insert()
    else:
        # Update existing settings
        update_data = settings_in.dict()
        update_data["updated_at"] = datetime.utcnow()
        
        for field, value in update_data.items():
            setattr(settings, field, value)
        
        await settings.save()
    
    return settings

@router.put("", response_model=schemas.RestaurantSettings)
async def partial_update_settings(
    *,
    settings_in: schemas.RestaurantSettingsUpdate,
    current_user: models.User = Depends(get_current_admin_user)
):
    """Partially update restaurant settings (Admin only)."""
    # Get existing settings
    settings = await models.RestaurantSettings.find_one()
    
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found. Please create settings first.")
    
    # Update only provided fields
    update_data = settings_in.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    for field, value in update_data.items():
        setattr(settings, field, value)
    
    await settings.save()
    
    return settings
