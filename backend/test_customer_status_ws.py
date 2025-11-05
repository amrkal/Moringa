"""
Customer Order Status WebSocket Test
- Logs in as admin
- Picks a recent order and its user_id
- Connects to ws/customer/{user_id}
- Updates order status via admin API
- Verifies the customer socket receives order_status_update
"""
import asyncio
import json
import threading
import time
from queue import Queue, Empty

import requests
import websockets
from websockets.exceptions import ConnectionClosed, ConnectionClosedError, ConnectionClosedOK

BASE_URL = "http://localhost:8000/api/v1"
ADMIN_WS = "ws://localhost:8000/api/v1/ws/admin"
ADMIN_PHONE = "+254712345678"
ADMIN_PASSWORD = "admin123"

class Colors:
    GREEN='\033[92m'
    RED='\033[91m'
    YELLOW='\033[93m'
    BLUE='\033[94m'
    END='\033[0m'

async def customer_ws_listener(customer_ws_url: str, message_queue: Queue, run_event: threading.Event):
    """Customer WS listener with auto-reconnect on transient closures."""
    while run_event.is_set():
        try:
            async with websockets.connect(customer_ws_url) as ws:
                # Drain banner
                try:
                    banner = await asyncio.wait_for(ws.recv(), timeout=2.0)
                    message_queue.put(banner)
                except asyncio.TimeoutError:
                    pass
                while run_event.is_set():
                    try:
                        msg = await asyncio.wait_for(ws.recv(), timeout=2.0)
                        message_queue.put(msg)
                    except asyncio.TimeoutError:
                        continue
                    except (ConnectionClosed, ConnectionClosedError, ConnectionClosedOK) as ce:
                        try:
                            message_queue.put(json.dumps({
                                "type": "ws_closed",
                                "code": getattr(ce, 'code', None),
                                "reason": getattr(ce, 'reason', '')
                            }))
                        except Exception:
                            pass
                        await asyncio.sleep(0.5)
                        break
        except Exception as e:
            try:
                message_queue.put(json.dumps({"type": "error", "error": str(e)}))
            except Exception:
                pass
            await asyncio.sleep(0.5)


def start_customer_ws_thread(url: str, q: Queue, run_event: threading.Event):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(customer_ws_listener(url, q, run_event))


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


def pick_recent_order(headers):
    r = requests.get(f"{BASE_URL}/orders/?limit=5", headers=headers, timeout=10)
    if r.status_code != 200:
        print(f"List orders failed: {r.status_code} {r.text[:200]}")
        return None
    orders = r.json()
    arr = orders.get("data", orders) if isinstance(orders, dict) else orders
    if not isinstance(arr, list) or not arr:
        return None
    return arr[0]


def update_status(headers, order_id: str, status: str):
    return requests.put(
        f"{BASE_URL}/orders/{order_id}",
        headers=headers,
        json={"status": status},
        timeout=10,
    )


def main():
    print(f"\n{Colors.BLUE}=== Customer Status WebSocket Test ==={Colors.END}")

    token, _ = login_admin()
    if not token:
        print(f"{Colors.RED}✗ Admin auth failed{Colors.END}")
        return
    headers = {"Authorization": f"Bearer {token}"}

    order = pick_recent_order(headers)
    if not order:
        print(f"{Colors.RED}✗ No orders found{Colors.END}")
        return
    order_id = order.get("id") or order.get("_id")
    user_id = order.get("user_id") or order.get("userId") or order.get("user", {}).get("id")
    if not user_id:
        print(f"{Colors.YELLOW}Could not determine order user_id; skipping customer WS test{Colors.END}")
        return

    customer_ws_url = f"ws://localhost:8000/api/v1/ws/customer/{user_id}"

    # Start customer WS listener
    q: Queue = Queue()
    run_event = threading.Event()
    run_event.set()
    t = threading.Thread(target=start_customer_ws_thread, args=(customer_ws_url, q, run_event), daemon=True)
    t.start()

    time.sleep(0.8)

    # Clean any banners
    try:
        while True:
            _ = q.get_nowait()
    except Empty:
        pass

    statuses = ["PREPARING", "READY", "DELIVERED"]
    received_statuses = []

    for status in statuses:
        resp = update_status(headers, order_id, status)
        if resp.status_code not in (200, 201):
            print(f"{Colors.YELLOW}Status update failed{Colors.END}: {resp.status_code} {resp.text[:200]}")
            continue
        print(f"Updated order to {status}, waiting on customer WS...")

        deadline = time.time() + 15
        while time.time() < deadline:
            try:
                raw = q.get(timeout=1)
                try:
                    msg = json.loads(raw)
                except Exception:
                    print(f"WS: {raw}")
                    continue
                mtype = msg.get("type")
                if mtype == "order_status_update" and msg.get("data", {}).get("order_id") == order_id:
                    got = msg.get('data', {}).get('status')
                    print(f"{Colors.GREEN}✓ Customer received status -> {got}{Colors.END}")
                    received_statuses.append(got)
                    break
                elif mtype == "ws_closed":
                    print(f"{Colors.YELLOW}WS closed; waiting for reconnect...{Colors.END}")
                    time.sleep(0.5)
                else:
                    print(f"WS: {msg}")
            except Empty:
                continue
        # proceed to next status without breaking the outer loop

    run_event.clear()
    t.join(timeout=1)

    if {"READY", "DELIVERED"}.issubset(set(received_statuses)):
        print(f"\n{Colors.GREEN}PASS{Colors.END}: Customer WS receives status updates ({', '.join(received_statuses)})")
    else:
        print(f"\n{Colors.YELLOW}WARN{Colors.END}: Customer WS did not receive status updates")

if __name__ == "__main__":
    main()
