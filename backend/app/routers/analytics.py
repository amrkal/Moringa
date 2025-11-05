"""
Analytics endpoints for sales, revenue, and order statistics
"""
from fastapi import APIRouter, Depends, Query
from typing import Optional
from datetime import datetime, timedelta
from collections import defaultdict

from ..auth import get_current_admin_user
from .. import models

router = APIRouter()


@router.get("/sales/overview")
async def get_sales_overview(
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get overall sales statistics"""
    
    # Total orders
    total_orders = await models.Order.count()
    
    # Total revenue (delivered orders only)
    delivered_orders = await models.Order.find(
        models.Order.status == models.OrderStatus.DELIVERED
    ).to_list()
    total_revenue = sum(order.total_amount for order in delivered_orders)
    
    # Today's stats
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_orders = await models.Order.find(
        models.Order.created_at >= today
    ).to_list()
    today_count = len(today_orders)
    today_revenue = sum(
        order.total_amount for order in today_orders 
        if order.status == models.OrderStatus.DELIVERED
    )
    
    # This week
    week_start = today - timedelta(days=today.weekday())
    week_orders = await models.Order.find(
        models.Order.created_at >= week_start
    ).to_list()
    week_revenue = sum(
        order.total_amount for order in week_orders 
        if order.status == models.OrderStatus.DELIVERED
    )
    
    # This month
    month_start = today.replace(day=1)
    month_orders = await models.Order.find(
        models.Order.created_at >= month_start
    ).to_list()
    month_revenue = sum(
        order.total_amount for order in month_orders 
        if order.status == models.OrderStatus.DELIVERED
    )
    
    # Average order value
    avg_order_value = total_revenue / len(delivered_orders) if delivered_orders else 0
    
    # Total customers
    total_customers = await models.User.find(
        models.User.role == models.UserRole.CUSTOMER
    ).count()
    
    return {
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2),
        "today_orders": today_count,
        "today_revenue": round(today_revenue, 2),
        "week_revenue": round(week_revenue, 2),
        "month_revenue": round(month_revenue, 2),
        "avg_order_value": round(avg_order_value, 2),
        "total_customers": total_customers,
    }


@router.get("/sales/daily")
async def get_daily_sales(
    days: int = Query(default=30, ge=1, le=365),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get daily sales data for the last N days"""
    
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    start_date = today - timedelta(days=days)
    
    orders = await models.Order.find(
        models.Order.created_at >= start_date
    ).to_list()
    
    # Group by date
    daily_stats = defaultdict(lambda: {"orders": 0, "revenue": 0})
    
    for order in orders:
        date_key = order.created_at.strftime("%Y-%m-%d")
        daily_stats[date_key]["orders"] += 1
        if order.status == models.OrderStatus.DELIVERED:
            daily_stats[date_key]["revenue"] += float(order.total_amount)
    
    # Format response
    result = []
    for i in range(days):
        date = today - timedelta(days=days - i - 1)
        date_key = date.strftime("%Y-%m-%d")
        result.append({
            "date": date_key,
            "orders": daily_stats[date_key]["orders"],
            "revenue": round(daily_stats[date_key]["revenue"], 2)
        })
    
    return result


@router.get("/sales/weekly")
async def get_weekly_sales(
    weeks: int = Query(default=12, ge=1, le=52),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get weekly sales data"""
    
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    start_date = today - timedelta(weeks=weeks)
    
    orders = await models.Order.find(
        models.Order.created_at >= start_date
    ).to_list()
    
    # Group by week
    weekly_stats = defaultdict(lambda: {"orders": 0, "revenue": 0})
    
    for order in orders:
        # Get week number
        week_start = order.created_at - timedelta(days=order.created_at.weekday())
        week_key = week_start.strftime("%Y-W%U")
        weekly_stats[week_key]["orders"] += 1
        if order.status == models.OrderStatus.DELIVERED:
            weekly_stats[week_key]["revenue"] += float(order.total_amount)
    
    # Format response
    result = []
    for i in range(weeks):
        week_start = today - timedelta(weeks=weeks - i, days=today.weekday())
        week_key = week_start.strftime("%Y-W%U")
        result.append({
            "week": week_key,
            "week_start": week_start.strftime("%Y-%m-%d"),
            "orders": weekly_stats[week_key]["orders"],
            "revenue": round(weekly_stats[week_key]["revenue"], 2)
        })
    
    return result


@router.get("/sales/monthly")
async def get_monthly_sales(
    months: int = Query(default=12, ge=1, le=24),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get monthly sales data"""
    
    today = datetime.utcnow()
    
    result = []
    for i in range(months):
        # Calculate month
        month_date = today - timedelta(days=30 * (months - i - 1))
        month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Get next month start for range query
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1)
        
        # Query orders in this month
        orders = await models.Order.find(
            models.Order.created_at >= month_start,
            models.Order.created_at < month_end
        ).to_list()
        
        month_revenue = sum(
            order.total_amount for order in orders 
            if order.status == models.OrderStatus.DELIVERED
        )
        
        result.append({
            "month": month_start.strftime("%Y-%m"),
            "month_name": month_start.strftime("%B %Y"),
            "orders": len(orders),
            "revenue": round(month_revenue, 2)
        })
    
    return result


@router.get("/meals/popular")
async def get_popular_meals(
    limit: int = Query(default=10, ge=1, le=50),
    days: Optional[int] = Query(default=None, ge=1, le=365),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get most popular meals by order count"""
    
    # Build query
    query = {}
    if days:
        start_date = datetime.utcnow() - timedelta(days=days)
        query["created_at"] = {"$gte": start_date}
    
    orders = await models.Order.find(query).to_list()
    
    # Count meal occurrences
    meal_stats = defaultdict(lambda: {"name": "", "count": 0, "revenue": 0})
    
    for order in orders:
        for item in order.items:
            meal_id = item.meal_id
            meal_stats[meal_id]["name"] = item.meal_name
            meal_stats[meal_id]["count"] += item.quantity
            if order.status == models.OrderStatus.DELIVERED:
                meal_stats[meal_id]["revenue"] += float(item.subtotal)
    
    # Sort by count and limit
    sorted_meals = sorted(
        [
            {
                "meal_id": meal_id,
                "meal_name": stats["name"],
                "order_count": stats["count"],
                "revenue": round(stats["revenue"], 2)
            }
            for meal_id, stats in meal_stats.items()
        ],
        key=lambda x: x["order_count"],
        reverse=True
    )[:limit]
    
    return sorted_meals


@router.get("/orders/peak-hours")
async def get_peak_hours(
    days: int = Query(default=30, ge=1, le=365),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get order distribution by hour of day"""
    
    start_date = datetime.utcnow() - timedelta(days=days)
    orders = await models.Order.find(
        models.Order.created_at >= start_date
    ).to_list()
    
    # Count orders by hour
    hourly_stats = defaultdict(int)
    for order in orders:
        hour = order.created_at.hour
        hourly_stats[hour] += 1
    
    # Format response (all 24 hours)
    result = []
    for hour in range(24):
        result.append({
            "hour": hour,
            "hour_label": f"{hour:02d}:00",
            "orders": hourly_stats[hour]
        })
    
    return result


@router.get("/orders/by-type")
async def get_orders_by_type(
    days: Optional[int] = Query(default=None, ge=1, le=365),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get order distribution by type (Delivery, Dine-in, Take-away)"""
    
    query = {}
    if days:
        start_date = datetime.utcnow() - timedelta(days=days)
        query["created_at"] = {"$gte": start_date}
    
    orders = await models.Order.find(query).to_list()
    
    # Count by type
    type_stats = defaultdict(lambda: {"count": 0, "revenue": 0})
    
    for order in orders:
        order_type = order.order_type
        type_stats[order_type]["count"] += 1
        if order.status == models.OrderStatus.DELIVERED:
            type_stats[order_type]["revenue"] += float(order.total_amount)
    
    # Format response
    result = []
    for order_type in models.OrderType:
        result.append({
            "type": order_type,
            "count": type_stats[order_type]["count"],
            "revenue": round(type_stats[order_type]["revenue"], 2)
        })
    
    return result


@router.get("/orders/by-status")
async def get_orders_by_status(
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get current order distribution by status"""
    
    orders = await models.Order.find().to_list()
    
    # Count by status
    status_stats = defaultdict(int)
    for order in orders:
        status_stats[order.status] += 1
    
    # Format response
    result = []
    for status in models.OrderStatus:
        result.append({
            "status": status,
            "count": status_stats[status]
        })
    
    return result


@router.get("/revenue/trends")
async def get_revenue_trends(
    days: int = Query(default=30, ge=1, le=365),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get revenue trends with comparisons"""
    
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    current_start = today - timedelta(days=days)
    previous_start = current_start - timedelta(days=days)
    
    # Current period
    current_orders = await models.Order.find(
        models.Order.created_at >= current_start
    ).to_list()
    current_revenue = sum(
        order.total_amount for order in current_orders 
        if order.status == models.OrderStatus.DELIVERED
    )
    
    # Previous period
    previous_orders = await models.Order.find(
        models.Order.created_at >= previous_start,
        models.Order.created_at < current_start
    ).to_list()
    previous_revenue = sum(
        order.total_amount for order in previous_orders 
        if order.status == models.OrderStatus.DELIVERED
    )
    
    # Calculate growth
    growth = 0
    if previous_revenue > 0:
        growth = ((current_revenue - previous_revenue) / previous_revenue) * 100
    
    return {
        "current_period": {
            "orders": len([o for o in current_orders if o.status == models.OrderStatus.DELIVERED]),
            "revenue": round(current_revenue, 2)
        },
        "previous_period": {
            "orders": len([o for o in previous_orders if o.status == models.OrderStatus.DELIVERED]),
            "revenue": round(previous_revenue, 2)
        },
        "growth_percentage": round(growth, 2),
        "days": days
    }
