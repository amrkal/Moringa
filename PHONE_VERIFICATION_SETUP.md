# Phone Verification System - Backend Setup

## Overview
The phone verification system allows users to verify their phone numbers via SMS or WhatsApp before accessing orders or completing checkout.

## Required Backend Endpoints

### 1. Send OTP Code
```
POST /api/v1/auth/send-otp/
```

**Request Body:**
```json
{
  "phone_number": "+972501234567",
  "method": "sms"  // or "whatsapp"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### 2. Verify OTP Code
```
POST /api/v1/auth/verify-otp/
```

**Request Body:**
```json
{
  "phone_number": "+972501234567",
  "otp_code": "123456"
}
```

**Response:**
```json
{
  "verified": true,
  "data": {
    "verified": true,
    "phone_number": "+972501234567"
  }
}
```

## Backend Implementation Guide (Python/FastAPI)

### Install Dependencies
```bash
pip install twilio  # For SMS
# or
pip install python-whatsapp-business  # For WhatsApp
```

### Example FastAPI Implementation

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from twilio.rest import Client
import random
import redis

router = APIRouter(prefix="/auth", tags=["auth"])

# Redis for OTP storage (expires in 5 minutes)
redis_client = redis.Redis(host='localhost', port=6379, db=0)

# Twilio credentials (get from twilio.com)
TWILIO_ACCOUNT_SID = "your_account_sid"
TWILIO_AUTH_TOKEN = "your_auth_token"
TWILIO_PHONE_NUMBER = "+1234567890"
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

class SendOTPRequest(BaseModel):
    phone_number: str
    method: str = "sms"  # "sms" or "whatsapp"

class VerifyOTPRequest(BaseModel):
    phone_number: str
    otp_code: str

@router.post("/send-otp/")
async def send_otp(request: SendOTPRequest):
    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    
    # Store in Redis with 5-minute expiry
    redis_key = f"otp:{request.phone_number}"
    redis_client.setex(redis_key, 300, otp)
    
    try:
        if request.method == "sms":
            # Send via SMS
            message = twilio_client.messages.create(
                body=f"Your Moringa verification code is: {otp}",
                from_=TWILIO_PHONE_NUMBER,
                to=request.phone_number
            )
        elif request.method == "whatsapp":
            # Send via WhatsApp
            message = twilio_client.messages.create(
                body=f"Your Moringa verification code is: {otp}",
                from_=f"whatsapp:{TWILIO_PHONE_NUMBER}",
                to=f"whatsapp:{request.phone_number}"
            )
        
        return {
            "success": True,
            "message": f"OTP sent successfully via {request.method}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-otp/")
async def verify_otp(request: VerifyOTPRequest):
    redis_key = f"otp:{request.phone_number}"
    stored_otp = redis_client.get(redis_key)
    
    if not stored_otp:
        raise HTTPException(
            status_code=400,
            detail="OTP expired or not found. Please request a new code."
        )
    
    if stored_otp.decode() != request.otp_code:
        raise HTTPException(status_code=400, detail="Invalid OTP code")
    
    # Delete OTP after successful verification
    redis_client.delete(redis_key)
    
    return {
        "verified": True,
        "data": {
            "verified": True,
            "phone_number": request.phone_number
        }
    }
```

## Environment Variables

Add to your `.env` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Redis Configuration (for OTP storage)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
```

## Alternative: Testing Mode

For development/testing without actual SMS/WhatsApp:

```python
# Add to your settings
TESTING_MODE = True
TESTING_OTP = "123456"

@router.post("/send-otp/")
async def send_otp(request: SendOTPRequest):
    if TESTING_MODE:
        # In testing mode, always use 123456
        redis_key = f"otp:{request.phone_number}"
        redis_client.setex(redis_key, 300, TESTING_OTP)
        return {
            "success": True,
            "message": f"Testing mode: Use OTP {TESTING_OTP}"
        }
    # ... rest of production code
```

## Security Considerations

1. **Rate Limiting**: Limit OTP requests per phone number (e.g., max 3 per hour)
2. **IP Blocking**: Block suspicious IPs making too many requests
3. **Phone Validation**: Validate phone number format before sending
4. **Expiry**: OTPs expire after 5 minutes
5. **One-time Use**: OTP is deleted after successful verification

## Testing the System

1. Start your backend server
2. Go to `/menu` and add items to cart
3. Click "Proceed to Checkout"
4. Fill in delivery details
5. Click "Place Order" - verification modal appears
6. Enter phone number and choose SMS or WhatsApp
7. Enter the 6-digit code received
8. Order is placed successfully

## Troubleshooting

- **"Failed to send verification code"**: Check Twilio credentials
- **"Invalid OTP code"**: OTP may have expired (5 min limit)
- **WhatsApp not working**: Ensure WhatsApp Business API is enabled in Twilio
- **Redis connection error**: Ensure Redis server is running

## Cost Estimates (Twilio)

- SMS: ~$0.0075 per message
- WhatsApp: ~$0.005 per message
- Free trial includes $15.50 credit (good for ~2000 SMS messages)
