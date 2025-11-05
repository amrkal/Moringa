"""
Real-Time Notifications Test
- Connects to admin WebSocket
- Logs in as a customer (seeded or via OTP fallback)
- Fetches a meal and creates an order
- Verifies that a 'new_order' WebSocket message is received by admin
"""
import asyncio
import json
import threading
import time
from queue import Queue, Empty

import requests
import websockets

BASE_URL = "http://localhost:8000/api/v1"
ADMIN_WS = "ws://localhost:8000/api/v1/ws/admin"
ADMIN_PHONE = "+254712345678"  # Adjust if different in your DB
ADMIN_PASSWORD = "admin123"

class Colors:
    GREEN='\033[92m'
    RED='\033[91m'
    YELLOW='\033[93m'
    BLUE='\033[94m'
    END='\033[0m'


def login_or_create_customer():
    """Get a customer token. Try seeded creds; fallback to OTP-confirm flow."""
    # 1) Try seeded credentials from seed_db.py
    phone = "+1234567891"
    password = "customer123"
    try:
        r = requests.post(
            f"{BASE_URL}/auth/login",
            json={"phone": phone, "password": password},
            timeout=8,
        )
        if r.status_code == 200:
            data = r.json()
            return data.get("access_token"), data.get("user", {})
        else:
            print(f"Login (seeded) failed: {r.status_code} {r.text[:200]}")
    except Exception as e:
        print(f"Login error: {e}")

    # 2) Fallback: OTP confirm flow creates user if missing, code '123456'
    try:
        r = requests.post(
            f"{BASE_URL}/auth/confirm-phone",
            json={"phone": phone, "code": "123456"},
            timeout=8,
        )
        if r.status_code == 200:
            payload = r.json()
            data = payload.get("data", {})
            return data.get("access_token"), data.get("user", {})
        else:
            print(f"Confirm-phone failed: {r.status_code} {r.text[:200]}")
    except Exception as e:
        print(f"Confirm-phone error: {e}")

    return None, None

def login_admin():
    try:
        r = requests.post(
            f"{BASE_URL}/auth/login",
            json={"phone": ADMIN_PHONE, "password": ADMIN_PASSWORD},
            timeout=8,
        )
        if r.status_code == 200:
            data = r.json()
            return data.get("access_token"), data.get("user", {})
        else:
            print(f"Admin login failed: {r.status_code} {r.text[:200]}")
    except Exception as e:
        print(f"Admin login error: {e}")
    return None, None


def get_first_meal_id():
    try:
        r = requests.get(f"{BASE_URL}/meals/?limit=1", timeout=8)
        if r.status_code == 200:
            meals = r.json()
            if isinstance(meals, list) and meals:
                return meals[0].get("id") or meals[0].get("_id")
    except Exception:
        pass
    return None


async def admin_ws_listener(message_queue: Queue, run_event: threading.Event):
    try:
        async with websockets.connect(ADMIN_WS) as ws:
            # Wait for messages until run_event is cleared
            while run_event.is_set():
                try:
                    msg = await asyncio.wait_for(ws.recv(), timeout=2.0)
                    message_queue.put(msg)
                except asyncio.TimeoutError:
                    continue
    except Exception as e:
        message_queue.put(json.dumps({"type": "error", "error": str(e)}))


def start_ws_thread(q: Queue, run_event: threading.Event):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(admin_ws_listener(q, run_event))


def create_test_order(token: str, meal_id: str):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {
        "order_type": "DELIVERY",
        "payment_method": "CARD",
        "delivery_address": "123 Test St",
        "phone_number": "+15555555555",
        "special_instructions": "Test order - please ignore",
        "items": [
            {
                "meal_id": meal_id,
                "quantity": 1,
                "price": 0,  # ignored by backend; calculated from meal
                "selected_ingredients": [],
                "removed_ingredients": []
            }
        ]
    }
    return requests.post(f"{BASE_URL}/orders/", headers=headers, json=payload, timeout=12)


def main():
    print(f"\n{Colors.BLUE}=== Real-Time Notifications Test ==={Colors.END}")

    # Start admin WebSocket listener in background thread
    q: Queue = Queue()
    run_event = threading.Event()
    run_event.set()
    t = threading.Thread(target=start_ws_thread, args=(q, run_event), daemon=True)
    t.start()

    # Give WS a moment to connect and wait for initial 'connection' banner
    start_wait = time.time()
    connected_banner_seen = False
    while time.time() - start_wait < 5:
        try:
            raw = q.get(timeout=0.5)
            try:
                banner = json.loads(raw)
                # Log any banners
                print(f"WS: {banner}")
                if banner.get("type") == "connection":
                    connected_banner_seen = True
                    break
            except Exception:
                print(f"WS raw: {raw}")
        except Empty:
            continue

    # Prefer customer token; fallback to admin token if needed
    token, user = login_or_create_customer()
    user_label = "customer"
    if not token:
        token, user = login_admin()
        user_label = "admin"
    if not token:
        print(f"{Colors.RED}✗ Could not obtain authentication token (customer/admin){Colors.END}")
        run_event.clear()
        t.join(timeout=1)
        return
    print(f"{Colors.GREEN}✓ {user_label.title()} authenticated{Colors.END} (user: {user.get('name') or user.get('phone')})")

    # Get a meal id
    meal_id = get_first_meal_id()
    if not meal_id:
        print(f"{Colors.RED}✗ Could not fetch any meals{Colors.END}")
        run_event.clear()
        t.join(timeout=1)
        return
    print(f"{Colors.GREEN}✓ Found meal id{Colors.END}: {meal_id}")

    # Drain any remaining WS messages (keep last seen banner logged)
    try:
        while True:
            leftover = q.get_nowait()
            try:
                print(f"WS: {json.loads(leftover)}")
            except Exception:
                print(f"WS raw: {leftover}")
    except Empty:
        pass

    # Create an order
    resp = create_test_order(token, meal_id)
    if resp.status_code not in (200, 201):
        print(f"{Colors.RED}✗ Order creation failed{Colors.END} ({resp.status_code}) {resp.text[:200]}")
        run_event.clear()
        t.join(timeout=1)
        return
    data = resp.json()
    order_id = data.get("id") or data.get("_id")
    print(f"{Colors.GREEN}✓ Order created{Colors.END} (id: {order_id})")

    # Wait up to 8 seconds for new_order via WS
    received = False
    deadline = time.time() + 8
    while time.time() < deadline:
        try:
            raw = q.get(timeout=1)
            try:
                msg = json.loads(raw)
            except Exception:
                print(f"WS raw: {raw}")
                continue
            if msg.get("type") == "new_order":
                received = True
                print(f"{Colors.GREEN}✓ Received WebSocket 'new_order' notification{Colors.END}")
                break
            else:
                print(f"WS: {msg}")
        except Empty:
            continue

    run_event.clear()
    t.join(timeout=1)

    if received:
        print(f"\n{Colors.GREEN}PASS{Colors.END}: Real-time admin notification works")
    else:
        print(f"\n{Colors.YELLOW}WARN{Colors.END}: Didn't see WS notification in time. Check admin WebSocket connection and server logs.")

if __name__ == "__main__":
    main()
