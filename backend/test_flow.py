"""Test order creation flow"""
import asyncio
import httpx

BASE_URL = "http://localhost:8000/api/v1"

async def test_flow():
    async with httpx.AsyncClient() as client:
        print("1. Testing phone verification...")
        # Step 1: Request OTP
        verify_resp = await client.post(
            f"{BASE_URL}/auth/verify-phone/",
            json={"phone": "+1234567890", "method": "SMS"}
        )
        print(f"   Verify phone response: {verify_resp.status_code}")
        
        # Step 2: Confirm OTP (using test code 123456)
        confirm_resp = await client.post(
            f"{BASE_URL}/auth/confirm-phone/",
            json={"phone": "+1234567890", "code": "123456"}
        )
        print(f"   Confirm phone response: {confirm_resp.status_code}")
        
        if confirm_resp.status_code == 200:
            data = confirm_resp.json()
            token = data.get("data", {}).get("access_token")
            print(f"   ✅ Got token: {token[:20]}...")
            
            # Step 3: Check if user was created
            headers = {"Authorization": f"Bearer {token}"}
            me_resp = await client.get(f"{BASE_URL}/auth/me/", headers=headers)
            print(f"   Current user response: {me_resp.status_code}")
            if me_resp.status_code == 200:
                user = me_resp.json()
                print(f"   ✅ User: {user}")
                
                # Step 4: Try to fetch orders
                orders_resp = await client.get(f"{BASE_URL}/orders/my-orders", headers=headers)
                print(f"   My orders response: {orders_resp.status_code}")
                if orders_resp.status_code == 200:
                    orders = orders_resp.json()
                    print(f"   ✅ Orders: {orders}")
                else:
                    print(f"   ❌ Orders error: {orders_resp.text}")
            else:
                print(f"   ❌ Current user error: {me_resp.text}")
        else:
            print(f"   ❌ Confirm error: {confirm_resp.text}")

if __name__ == "__main__":
    asyncio.run(test_flow())
