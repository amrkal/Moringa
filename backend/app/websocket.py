"""
WebSocket Manager for real-time notifications
"""
from typing import Dict, Set
from fastapi import WebSocket, WebSocketDisconnect
import json
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for real-time updates"""
    
    def __init__(self):
        # Store active connections by type (admin, customer)
        self.active_connections: Dict[str, Set[WebSocket]] = {
            "admin": set(),
            "customer": set()
        }
        # Store customer connections by user_id
        self.customer_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, client_type: str = "admin", user_id: str = None):
        """Accept and register a new WebSocket connection"""
        await websocket.accept()
        
        if client_type in self.active_connections:
            self.active_connections[client_type].add(websocket)
            
        # Track customer connections by user_id for targeted notifications
        if client_type == "customer" and user_id:
            self.customer_connections[user_id] = websocket
            
        logger.info(f"New {client_type} connection established. Total: {len(self.active_connections[client_type])}")
    
    def disconnect(self, websocket: WebSocket, client_type: str = "admin", user_id: str = None):
        """Remove a WebSocket connection"""
        if client_type in self.active_connections:
            self.active_connections[client_type].discard(websocket)
            
        if user_id and user_id in self.customer_connections:
            del self.customer_connections[user_id]
            
        logger.info(f"{client_type} disconnected. Remaining: {len(self.active_connections[client_type])}")
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send a message to a specific WebSocket connection"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
    
    async def broadcast_to_admins(self, message: dict):
        """Broadcast a message to all admin connections"""
        disconnected = set()
        for connection in self.active_connections["admin"]:
            try:
                await connection.send_json(message)
            except WebSocketDisconnect:
                disconnected.add(connection)
            except Exception as e:
                logger.error(f"Error broadcasting to admin: {e}")
                disconnected.add(connection)
        
        # Clean up disconnected connections
        for conn in disconnected:
            self.active_connections["admin"].discard(conn)
    
    async def broadcast_to_customers(self, message: dict):
        """Broadcast a message to all customer connections"""
        disconnected = set()
        for connection in self.active_connections["customer"]:
            try:
                await connection.send_json(message)
            except WebSocketDisconnect:
                disconnected.add(connection)
            except Exception as e:
                logger.error(f"Error broadcasting to customer: {e}")
                disconnected.add(connection)
        
        # Clean up disconnected connections
        for conn in disconnected:
            self.active_connections["customer"].discard(conn)
    
    async def send_to_customer(self, user_id: str, message: dict):
        """Send a message to a specific customer by user_id"""
        if user_id in self.customer_connections:
            try:
                await self.customer_connections[user_id].send_json(message)
            except Exception as e:
                logger.error(f"Error sending to customer {user_id}: {e}")
                # Remove disconnected customer
                del self.customer_connections[user_id]
    
    async def notify_new_order(self, order_data: dict):
        """Notify admins about a new order"""
        message = {
            "type": "new_order",
            "data": order_data
        }
        await self.broadcast_to_admins(message)
        logger.info(f"Notified admins about new order: {order_data.get('id')}")
    
    async def notify_order_status_update(self, order_id: str, status: str, customer_id: str = None):
        """Notify customer about order status update"""
        message = {
            "type": "order_status_update",
            "data": {
                "order_id": order_id,
                "status": status
            }
        }
        
        # Send to specific customer if user_id provided
        if customer_id:
            await self.send_to_customer(customer_id, message)
        
        # Also broadcast to admins
        await self.broadcast_to_admins(message)
        logger.info(f"Notified about order {order_id} status: {status}")


# Global connection manager instance
manager = ConnectionManager()
