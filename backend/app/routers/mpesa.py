"""
M-Pesa payment integration router.
Handles STK Push, payment callbacks, and M-Pesa transactions.
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
import hmac
import hashlib
import base64
import requests
from motor.motor_asyncio import AsyncIOMotorDatabase

from ..database import get_database
from ..config import settings

router = APIRouter()


# Pydantic models
class MPesaPaymentRequest(BaseModel):
    """M-Pesa STK Push payment request"""
    phone_number: str = Field(..., description="Phone number in format 254XXXXXXXXX")
    amount: float = Field(..., gt=0, description="Amount to charge")
    order_id: str = Field(..., description="Order ID reference")
    account_reference: str = Field(default="Order", description="Account reference")
    transaction_desc: str = Field(default="Payment", description="Transaction description")


class MPesaCallbackResponse(BaseModel):
    """M-Pesa callback response from Safaricom"""
    Body: Dict[str, Any]


# M-Pesa configuration (to be added to config.py)
class MPesaConfig:
    """M-Pesa API configuration"""
    
    @staticmethod
    def get_consumer_key() -> str:
        return getattr(settings, 'mpesa_consumer_key', '')
    
    @staticmethod
    def get_consumer_secret() -> str:
        return getattr(settings, 'mpesa_consumer_secret', '')
    
    @staticmethod
    def get_business_short_code() -> str:
        return getattr(settings, 'mpesa_business_short_code', '')
    
    @staticmethod
    def get_passkey() -> str:
        return getattr(settings, 'mpesa_passkey', '')
    
    @staticmethod
    def get_callback_url() -> str:
        return getattr(settings, 'mpesa_callback_url', '')
    
    @staticmethod
    def is_sandbox() -> bool:
        return getattr(settings, 'mpesa_environment', 'sandbox') == 'sandbox'
    
    @staticmethod
    def get_api_url() -> str:
        if MPesaConfig.is_sandbox():
            return "https://sandbox.safaricom.co.ke"
        return "https://api.safaricom.co.ke"


def generate_password(business_short_code: str, passkey: str, timestamp: str) -> str:
    """Generate M-Pesa password for STK Push"""
    data_to_encode = f"{business_short_code}{passkey}{timestamp}"
    encoded = base64.b64encode(data_to_encode.encode())
    return encoded.decode('utf-8')


async def get_access_token() -> str:
    """Get M-Pesa OAuth access token"""
    consumer_key = MPesaConfig.get_consumer_key()
    consumer_secret = MPesaConfig.get_consumer_secret()
    
    if not consumer_key or not consumer_secret:
        raise HTTPException(
            status_code=500,
            detail="M-Pesa credentials not configured"
        )
    
    api_url = f"{MPesaConfig.get_api_url()}/oauth/v1/generate?grant_type=client_credentials"
    
    try:
        response = requests.get(
            api_url,
            auth=(consumer_key, consumer_secret)
        )
        response.raise_for_status()
        return response.json()['access_token']
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get M-Pesa access token: {str(e)}"
        )


@router.post("/mpesa/stk-push")
async def initiate_stk_push(
    payment_request: MPesaPaymentRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Initiate M-Pesa STK Push payment.
    Sends a payment prompt to the customer's phone.
    """
    try:
        # Get access token
        access_token = await get_access_token()
        
        # Generate timestamp and password
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        business_short_code = MPesaConfig.get_business_short_code()
        passkey = MPesaConfig.get_passkey()
        password = generate_password(business_short_code, passkey, timestamp)
        
        # Prepare STK Push request
        api_url = f"{MPesaConfig.get_api_url()}/mpesa/stkpush/v1/processrequest"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "BusinessShortCode": business_short_code,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(payment_request.amount),
            "PartyA": payment_request.phone_number,
            "PartyB": business_short_code,
            "PhoneNumber": payment_request.phone_number,
            "CallBackURL": MPesaConfig.get_callback_url(),
            "AccountReference": payment_request.account_reference,
            "TransactionDesc": payment_request.transaction_desc
        }
        
        # Make STK Push request
        response = requests.post(api_url, json=payload, headers=headers)
        response.raise_for_status()
        result = response.json()
        
        # Store transaction in database
        transaction = {
            "order_id": payment_request.order_id,
            "phone_number": payment_request.phone_number,
            "amount": payment_request.amount,
            "merchant_request_id": result.get("MerchantRequestID"),
            "checkout_request_id": result.get("CheckoutRequestID"),
            "response_code": result.get("ResponseCode"),
            "response_description": result.get("ResponseDescription"),
            "customer_message": result.get("CustomerMessage"),
            "status": "pending",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.mpesa_transactions.insert_one(transaction)
        
        return {
            "success": True,
            "message": result.get("CustomerMessage", "STK Push sent successfully"),
            "merchant_request_id": result.get("MerchantRequestID"),
            "checkout_request_id": result.get("CheckoutRequestID")
        }
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"M-Pesa API request failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"STK Push failed: {str(e)}"
        )


@router.post("/mpesa/callback")
async def mpesa_callback(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Handle M-Pesa payment callback.
    Called by Safaricom when payment is completed or fails.
    """
    try:
        body = await request.json()
        
        # Extract callback data
        stk_callback = body.get("Body", {}).get("stkCallback", {})
        merchant_request_id = stk_callback.get("MerchantRequestID")
        checkout_request_id = stk_callback.get("CheckoutRequestID")
        result_code = stk_callback.get("ResultCode")
        result_desc = stk_callback.get("ResultDesc")
        
        # Extract callback metadata if payment was successful
        callback_metadata = {}
        if result_code == 0:
            metadata_items = stk_callback.get("CallbackMetadata", {}).get("Item", [])
            for item in metadata_items:
                callback_metadata[item.get("Name")] = item.get("Value")
        
        # Update transaction in database
        update_data = {
            "result_code": result_code,
            "result_description": result_desc,
            "status": "success" if result_code == 0 else "failed",
            "mpesa_receipt_number": callback_metadata.get("MpesaReceiptNumber"),
            "transaction_date": callback_metadata.get("TransactionDate"),
            "phone_number": callback_metadata.get("PhoneNumber"),
            "updated_at": datetime.utcnow()
        }
        
        transaction = await db.mpesa_transactions.find_one_and_update(
            {"checkout_request_id": checkout_request_id},
            {"$set": update_data},
            return_document=True
        )
        
        # Update order status if payment was successful
        if result_code == 0 and transaction:
            order_id = transaction.get("order_id")
            await db.orders.update_one(
                {"_id": order_id},
                {
                    "$set": {
                        "payment_status": "paid",
                        "payment_method": "mpesa",
                        "mpesa_receipt": callback_metadata.get("MpesaReceiptNumber"),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
        
        return {
            "ResultCode": 0,
            "ResultDesc": "Callback processed successfully"
        }
        
    except Exception as e:
        # Log error but return success to M-Pesa to avoid retries
        print(f"M-Pesa callback error: {str(e)}")
        return {
            "ResultCode": 0,
            "ResultDesc": "Callback received"
        }


@router.get("/mpesa/config")
async def get_mpesa_config():
    """
    Get M-Pesa configuration for frontend.
    Returns business short code and environment.
    """
    return {
        "business_short_code": MPesaConfig.get_business_short_code(),
        "environment": "sandbox" if MPesaConfig.is_sandbox() else "production",
        "enabled": bool(MPesaConfig.get_consumer_key() and MPesaConfig.get_consumer_secret())
    }


@router.get("/mpesa/transaction/{checkout_request_id}")
async def get_transaction_status(
    checkout_request_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Check M-Pesa transaction status.
    Returns the current status of a transaction.
    """
    transaction = await db.mpesa_transactions.find_one(
        {"checkout_request_id": checkout_request_id}
    )
    
    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )
    
    return {
        "status": transaction.get("status"),
        "result_code": transaction.get("result_code"),
        "result_description": transaction.get("result_description"),
        "mpesa_receipt_number": transaction.get("mpesa_receipt_number"),
        "amount": transaction.get("amount"),
        "phone_number": transaction.get("phone_number")
    }
