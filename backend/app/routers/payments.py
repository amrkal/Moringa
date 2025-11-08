from typing import Optional
from pydantic import BaseModel

class ConfirmPaymentRequest(BaseModel):
    order_id: str
    payment_intent_id: str
    client_secret: str

class ConfirmPaymentResponse(BaseModel):
    status: str
    message: Optional[str] = None

# Add endpoint to simulate payment confirmation
from fastapi import APIRouter, HTTPException, Request, Header, Depends
from fastapi.responses import JSONResponse
from typing import Optional
import os
import uuid
import stripe
try:
    # Older versions expose error classes under stripe.error
    from stripe.error import StripeError, SignatureVerificationError  # type: ignore
except Exception:  # pragma: no cover
    # Fallback: define minimal stand-ins so exception handling works
    class StripeError(Exception):
        pass
    class SignatureVerificationError(StripeError):
        pass
from ..database import get_db
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/payments", tags=["payments"])

# Initialize Stripe (empty string if not provided)
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")



class CreatePaymentIntentRequest(BaseModel):
    order_id: str
    amount: float
    currency: str = "usd"

class PaymentIntentResponse(BaseModel):
    client_secret: str
    payment_intent_id: str

def _build_id_filter(id_str: str):
    """Return a MongoDB filter that works for ObjectId or string UUID _id."""
    try:
        return {"_id": ObjectId(id_str)}
    except Exception:
        # Fallback to direct string match (supports UUID stored as string in _id)
        return {"_id": id_str}


@router.post("/create-payment-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(request: CreatePaymentIntentRequest, db=Depends(get_db)):
    """Create a Stripe PaymentIntent. In demo mode, simulate without Stripe API."""
    try:
        # Verify order exists
        orders_col = db["orders"]
        order = await orders_col.find_one(_build_id_filter(request.order_id))
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        # If no real Stripe key, simulate PaymentIntent
        publishable_key = os.getenv("STRIPE_PUBLISHABLE_KEY", "").strip()
        secret_key = os.getenv("STRIPE_SECRET_KEY", "").strip()
        if not publishable_key or not secret_key or publishable_key == "pk_test_demo_placeholder":
            # Stripe expects: pi_<24+hex>_secret_<24+hex>
            pi_id = f"pi_{uuid.uuid4().hex[:24]}"
            secret = uuid.uuid4().hex[:24]
            simulated_client_secret = f"{pi_id}_secret_{secret}"
            await orders_col.update_one(
                _build_id_filter(request.order_id),
                {
                    "$set": {
                        "payment_intent_id": pi_id,
                        "payment_status": "PENDING",
                        "updated_at": datetime.utcnow(),
                    }
                }
            )
            return PaymentIntentResponse(client_secret=simulated_client_secret, payment_intent_id=pi_id)

        # Real Stripe integration
        payment_intent = stripe.PaymentIntent.create(
            amount=int(request.amount * 100),
            currency=request.currency,
            metadata={"order_id": request.order_id, "integration_check": "accept_a_payment"},
            automatic_payment_methods={"enabled": True},
        )

        await orders_col.update_one(
            _build_id_filter(request.order_id),
            {
                "$set": {
                    "payment_intent_id": payment_intent.id,
                    "payment_status": "PENDING",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return PaymentIntentResponse(client_secret=payment_intent.client_secret, payment_intent_id=payment_intent.id)

    except StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment intent creation failed: {str(e)}")

@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: Optional[str] = Header(None), db=Depends(get_db)):
    """
    Handle Stripe webhook events for payment confirmation
    """
    payload = await request.body()
    
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        order_id = payment_intent['metadata'].get('order_id')
        
        if order_id:
            # Update order status
            orders_col = db["orders"]
            await orders_col.update_one(
                _build_id_filter(order_id),
                {
                    "$set": {
                        "payment_status": "PAID",
                        "status": "CONFIRMED",
                        "paid_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
    
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        order_id = payment_intent['metadata'].get('order_id')
        
        if order_id:
            # Update order with failed payment
            orders_col = db["orders"]
            await orders_col.update_one(
                _build_id_filter(order_id),
                {
                    "$set": {
                        "payment_status": "FAILED",
                        "status": "CANCELLED",
                        "updated_at": datetime.utcnow()
                    }
                }
            )
    
    return JSONResponse(content={"status": "success"})



@router.get("/config")
async def get_stripe_config():
    """Return Stripe publishable key. If not set, provide a placeholder."""
    publishable_key = os.getenv("STRIPE_PUBLISHABLE_KEY", "").strip()
    if not publishable_key or publishable_key == "pk_test_demo_placeholder":
        # Provide a valid-looking test key so Stripe Elements can mount
        return {"publishable_key": "pk_test_1234567890abcdef12345678"}
    return {"publishable_key": publishable_key}


@router.post("/confirm-payment", response_model=ConfirmPaymentResponse)
async def confirm_payment(request: ConfirmPaymentRequest, db=Depends(get_db)):
    """Simulate payment confirmation for fake PaymentIntents."""
    orders_col = db["orders"]
    order = await orders_col.find_one(_build_id_filter(request.order_id))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    publishable_key = os.getenv("STRIPE_PUBLISHABLE_KEY", "").strip()
    secret_key = os.getenv("STRIPE_SECRET_KEY", "").strip()
    # If in simulation mode (no real keys or placeholder key), and payment_intent_id is fake
    if (not publishable_key or not secret_key or publishable_key == "pk_test_demo_placeholder") and request.payment_intent_id.startswith("pi_"):
        # Mark order as paid
        await orders_col.update_one(
            _build_id_filter(request.order_id),
            {
                "$set": {
                    "payment_status": "PAID",
                    "status": "CONFIRMED",
                    "paid_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                }
            }
        )
        return ConfirmPaymentResponse(status="succeeded", message="Simulated payment confirmed.")

    # If real Stripe, do nothing (frontend will use Stripe Elements flow)
    return ConfirmPaymentResponse(status="pending", message="No simulation. Use Stripe Elements flow.")