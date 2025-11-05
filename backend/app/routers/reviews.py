from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from app.models import Review, ReviewStatus, User, Meal, Order
from app.auth import get_current_user, get_current_admin_user
from beanie import PydanticObjectId
from beanie.operators import In, And
import os
import uuid
from pathlib import Path

router = APIRouter()

# Schemas
class ReviewCreate(BaseModel):
    meal_id: str
    order_id: Optional[str] = None
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = None

class ReviewModeration(BaseModel):
    status: ReviewStatus
    moderation_notes: Optional[str] = None

class AdminResponse(BaseModel):
    admin_response: str

class ReviewResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    meal_id: str
    meal_name: str
    order_id: Optional[str]
    rating: int
    comment: Optional[str]
    photos: List[str]
    status: ReviewStatus
    is_verified: bool
    helpful_count: int
    unhelpful_count: int
    admin_response: Optional[str]
    admin_response_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

class MealRatingStats(BaseModel):
    meal_id: str
    average_rating: float
    total_reviews: int
    rating_distribution: dict  # {1: count, 2: count, ...}

# Helper function to save uploaded photo
async def save_review_photo(file: UploadFile) -> str:
    """Save uploaded review photo and return the URL"""
    # Create reviews directory if it doesn't exist
    upload_dir = Path("uploads/reviews")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = upload_dir / unique_filename
    
    # Save file
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Return relative URL
    return f"/uploads/reviews/{unique_filename}"

@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new review for a meal"""
    # Check if meal exists
    meal = await Meal.get(review_data.meal_id)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    # Check if order exists and belongs to user (if order_id provided)
    is_verified = False
    if review_data.order_id:
        order = await Order.get(review_data.order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        if order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Order does not belong to you")
        
        # Check if meal was in the order
        meal_in_order = any(item.meal_id == review_data.meal_id for item in order.items)
        if not meal_in_order:
            raise HTTPException(status_code=400, detail="Meal was not in this order")
        
        is_verified = True
    
    # Check if user already reviewed this meal
    existing_review = await Review.find_one(
        Review.user_id == current_user.id,
        Review.meal_id == review_data.meal_id
    )
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this meal")
    
    # Get meal name
    meal_name = meal.name.get('en', 'Unknown') if isinstance(meal.name, dict) else meal.name
    
    # Create review
    review = Review(
        user_id=current_user.id,
        user_name=current_user.name,
        meal_id=review_data.meal_id,
        meal_name=meal_name,
        order_id=review_data.order_id,
        rating=review_data.rating,
        comment=review_data.comment,
        is_verified=is_verified,
        status=ReviewStatus.APPROVED if is_verified else ReviewStatus.PENDING
    )
    
    await review.insert()
    
    return ReviewResponse(
        id=review.id,
        user_id=review.user_id,
        user_name=review.user_name or "Anonymous",
        meal_id=review.meal_id,
        meal_name=review.meal_name or "Unknown",
        order_id=review.order_id,
        rating=review.rating,
        comment=review.comment,
        photos=review.photos,
        status=review.status,
        is_verified=review.is_verified,
        helpful_count=review.helpful_count,
        unhelpful_count=review.unhelpful_count,
        admin_response=review.admin_response,
        admin_response_at=review.admin_response_at,
        created_at=review.created_at,
        updated_at=review.updated_at
    )

@router.post("/{review_id}/photos")
async def upload_review_photos(
    review_id: str,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload photos for a review (max 5 photos)"""
    review = await Review.get(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to upload photos for this review")
    
    if len(review.photos) + len(files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 photos allowed per review")
    
    # Save photos
    photo_urls = []
    for file in files:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not an image")
        
        photo_url = await save_review_photo(file)
        photo_urls.append(photo_url)
    
    # Update review
    review.photos.extend(photo_urls)
    review.updated_at = datetime.utcnow()
    await review.save()
    
    return {"message": "Photos uploaded successfully", "photos": photo_urls}

@router.get("/meal/{meal_id}", response_model=List[ReviewResponse])
async def get_meal_reviews(
    meal_id: str,
    skip: int = 0,
    limit: int = 20,
    status_filter: Optional[ReviewStatus] = None
):
    """Get all reviews for a specific meal"""
    query = Review.find(Review.meal_id == meal_id)
    
    # Filter by status (default to APPROVED for public view)
    if status_filter:
        query = query.find(Review.status == status_filter)
    else:
        query = query.find(Review.status == ReviewStatus.APPROVED)
    
    reviews = await query.sort(-Review.created_at).skip(skip).limit(limit).to_list()
    
    return [
        ReviewResponse(
            id=review.id,
            user_id=review.user_id,
            user_name=review.user_name or "Anonymous",
            meal_id=review.meal_id,
            meal_name=review.meal_name or "Unknown",
            order_id=review.order_id,
            rating=review.rating,
            comment=review.comment,
            photos=review.photos,
            status=review.status,
            is_verified=review.is_verified,
            helpful_count=review.helpful_count,
            unhelpful_count=review.unhelpful_count,
            admin_response=review.admin_response,
            admin_response_at=review.admin_response_at,
            created_at=review.created_at,
            updated_at=review.updated_at
        )
        for review in reviews
    ]

@router.get("/meal/{meal_id}/stats", response_model=MealRatingStats)
async def get_meal_rating_stats(meal_id: str):
    """Get rating statistics for a meal"""
    reviews = await Review.find(
        Review.meal_id == meal_id,
        Review.status == ReviewStatus.APPROVED
    ).to_list()
    
    if not reviews:
        return MealRatingStats(
            meal_id=meal_id,
            average_rating=0.0,
            total_reviews=0,
            rating_distribution={1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        )
    
    # Calculate stats
    total_reviews = len(reviews)
    total_rating = sum(review.rating for review in reviews)
    average_rating = round(total_rating / total_reviews, 1)
    
    # Rating distribution
    rating_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for review in reviews:
        rating_distribution[review.rating] += 1
    
    return MealRatingStats(
        meal_id=meal_id,
        average_rating=average_rating,
        total_reviews=total_reviews,
        rating_distribution=rating_distribution
    )

@router.get("/user/me", response_model=List[ReviewResponse])
async def get_my_reviews(
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 20
):
    """Get current user's reviews"""
    reviews = await Review.find(
        Review.user_id == current_user.id
    ).sort(-Review.created_at).skip(skip).limit(limit).to_list()
    
    return [
        ReviewResponse(
            id=review.id,
            user_id=review.user_id,
            user_name=review.user_name or "Anonymous",
            meal_id=review.meal_id,
            meal_name=review.meal_name or "Unknown",
            order_id=review.order_id,
            rating=review.rating,
            comment=review.comment,
            photos=review.photos,
            status=review.status,
            is_verified=review.is_verified,
            helpful_count=review.helpful_count,
            unhelpful_count=review.unhelpful_count,
            admin_response=review.admin_response,
            admin_response_at=review.admin_response_at,
            created_at=review.created_at,
            updated_at=review.updated_at
        )
        for review in reviews
    ]

@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: str,
    review_data: ReviewUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a review (only by the review author)"""
    review = await Review.get(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this review")
    
    # Update fields
    if review_data.rating is not None:
        review.rating = review_data.rating
    if review_data.comment is not None:
        review.comment = review_data.comment
    
    review.updated_at = datetime.utcnow()
    await review.save()
    
    return ReviewResponse(
        id=review.id,
        user_id=review.user_id,
        user_name=review.user_name or "Anonymous",
        meal_id=review.meal_id,
        meal_name=review.meal_name or "Unknown",
        order_id=review.order_id,
        rating=review.rating,
        comment=review.comment,
        photos=review.photos,
        status=review.status,
        is_verified=review.is_verified,
        helpful_count=review.helpful_count,
        unhelpful_count=review.unhelpful_count,
        admin_response=review.admin_response,
        admin_response_at=review.admin_response_at,
        created_at=review.created_at,
        updated_at=review.updated_at
    )

@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a review (by author or admin)"""
    review = await Review.get(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    # Allow deletion if user is the author or an admin
    if review.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized to delete this review")
    
    await review.delete()

@router.post("/{review_id}/helpful")
async def mark_review_helpful(review_id: str):
    """Mark a review as helpful"""
    review = await Review.get(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review.helpful_count += 1
    await review.save()
    
    return {"message": "Review marked as helpful", "helpful_count": review.helpful_count}

@router.post("/{review_id}/unhelpful")
async def mark_review_unhelpful(review_id: str):
    """Mark a review as unhelpful"""
    review = await Review.get(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review.unhelpful_count += 1
    await review.save()
    
    return {"message": "Review marked as unhelpful", "unhelpful_count": review.unhelpful_count}

# Admin endpoints
@router.get("/admin/all", response_model=List[ReviewResponse])
async def get_all_reviews_admin(
    current_admin: User = Depends(get_current_admin_user),
    status_filter: Optional[ReviewStatus] = None,
    skip: int = 0,
    limit: int = 50
):
    """Get all reviews (admin only)"""
    query = Review.find()
    
    if status_filter:
        query = query.find(Review.status == status_filter)
    
    reviews = await query.sort(-Review.created_at).skip(skip).limit(limit).to_list()
    
    return [
        ReviewResponse(
            id=review.id,
            user_id=review.user_id,
            user_name=review.user_name or "Anonymous",
            meal_id=review.meal_id,
            meal_name=review.meal_name or "Unknown",
            order_id=review.order_id,
            rating=review.rating,
            comment=review.comment,
            photos=review.photos,
            status=review.status,
            is_verified=review.is_verified,
            helpful_count=review.helpful_count,
            unhelpful_count=review.unhelpful_count,
            admin_response=review.admin_response,
            admin_response_at=review.admin_response_at,
            created_at=review.created_at,
            updated_at=review.updated_at
        )
        for review in reviews
    ]

@router.put("/admin/{review_id}/moderate")
async def moderate_review(
    review_id: str,
    moderation: ReviewModeration,
    current_admin: User = Depends(get_current_admin_user)
):
    """Moderate a review (admin only)"""
    review = await Review.get(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review.status = moderation.status
    review.moderation_notes = moderation.moderation_notes
    review.moderated_by = current_admin.id
    review.moderated_at = datetime.utcnow()
    
    if moderation.status == ReviewStatus.FLAGGED:
        review.flagged_reason = moderation.moderation_notes
    
    await review.save()
    
    return {"message": "Review moderated successfully", "status": review.status}

@router.post("/admin/{review_id}/respond")
async def respond_to_review(
    review_id: str,
    response: AdminResponse,
    current_admin: User = Depends(get_current_admin_user)
):
    """Add admin response to a review"""
    review = await Review.get(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review.admin_response = response.admin_response
    review.admin_response_at = datetime.utcnow()
    review.admin_responder_id = current_admin.id
    await review.save()
    
    return {"message": "Response added successfully", "admin_response": review.admin_response}
