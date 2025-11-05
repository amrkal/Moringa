"""
WebSocket endpoints for real-time communication
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional
import logging

from ..websocket import manager

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/ws/admin")
async def websocket_admin_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None)
):
    """
    WebSocket endpoint for admin real-time notifications
    Connect with: ws://localhost:8000/api/v1/ws/admin?token=<jwt_token>
    """
    await manager.connect(websocket, client_type="admin")
    
    try:
        # Send initial connection success message
        await manager.send_personal_message({
            "type": "connection",
            "status": "connected",
            "message": "Admin WebSocket connected successfully"
        }, websocket)
        
        # Keep connection alive and handle incoming messages
        while True:
            data = await websocket.receive_text()
            
            # Handle ping/pong for keepalive
            if data == "ping":
                await manager.send_personal_message({"type": "pong"}, websocket)
            
            # You can add more message handlers here
            logger.info(f"Received from admin: {data}")
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_type="admin")
        logger.info("Admin WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, client_type="admin")


@router.websocket("/ws/customer/{user_id}")
async def websocket_customer_endpoint(
    websocket: WebSocket,
    user_id: str,
    token: Optional[str] = Query(None)
):
    """
    WebSocket endpoint for customer real-time notifications
    Connect with: ws://localhost:8000/api/v1/ws/customer/{user_id}?token=<jwt_token>
    """
    await manager.connect(websocket, client_type="customer", user_id=user_id)
    
    try:
        # Send initial connection success message
        await manager.send_personal_message({
            "type": "connection",
            "status": "connected",
            "message": "Customer WebSocket connected successfully"
        }, websocket)
        
        # Keep connection alive and handle incoming messages
        while True:
            data = await websocket.receive_text()
            
            # Handle ping/pong for keepalive
            if data == "ping":
                await manager.send_personal_message({"type": "pong"}, websocket)
            
            logger.info(f"Received from customer {user_id}: {data}")
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_type="customer", user_id=user_id)
        logger.info(f"Customer {user_id} WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, client_type="customer", user_id=user_id)
