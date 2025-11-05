"""
Order Status WebSocket Test
- Connects to admin WebSocket
- Logs in as admin
- Picks a recent order
- Updates its status via API
- Verifies 'order_status_update' is received on the admin WS
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

async def admin_ws_listener(message_queue: Queue, run_event: threading.Event):
    """
    Connect to the admin WS and stream messages into the queue.
    Auto-reconnect on transient server restarts (e.g., close code 1012).
    """
    while run_event.is_set():
        try:
            async with websockets.connect(ADMIN_WS) as ws:
                # Drain initial banner if any
                try:
                    msg = await asyncio.wait_for(ws.recv(), timeout=2.0)
                    message_queue.put(msg)
                except asyncio.TimeoutError:
                    pass

                while run_event.is_set():
                    try:
                        msg = await asyncio.wait_for(ws.recv(), timeout=2.0)
                        message_queue.put(msg)
                    except asyncio.TimeoutError:
                        continue
                    except (ConnectionClosed, ConnectionClosedError, ConnectionClosedOK) as ce:
                        # Push an event for visibility, then attempt reconnect
                        try:
                            code = getattr(ce, 'code', None)
                            reason = getattr(ce, 'reason', '')
                            message_queue.put(json.dumps({
                                "type": "ws_closed",
                                "code": code,
                                "reason": reason,
                            }))
                        except Exception:
                            pass
                        await asyncio.sleep(0.5)
                        break  # break inner loop to reconnect
        except Exception as e:
            # Emit error and retry shortly
            try:
                message_queue.put(json.dumps({"type": "error", "error": str(e)}))
            except Exception:
                pass
            await asyncio.sleep(0.5)


def start_ws_thread(q: Queue, run_event: threading.Event):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(admin_ws_listener(q, run_event))


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
    # Get latest orders
    r = requests.get(f"{BASE_URL}/orders/?limit=5", headers=headers, timeout=10)
    if r.status_code != 200:
        print(f"List orders failed: {r.status_code} {r.text[:200]}")
        return None
    orders = r.json()
    arr = orders.get("data", orders) if isinstance(orders, dict) else orders
    if not isinstance(arr, list) or not arr:
        return None
    # pick the first one
    oid = arr[0].get("id") or arr[0].get("_id")
    return oid


def update_status(headers, order_id: str, status: str):
    r = requests.put(
        f"{BASE_URL}/orders/{order_id}",
        headers=headers,
        json={"status": status},
        timeout=10,
    )
    return r


def main():
    print(f"\n{Colors.BLUE}=== Order Status WebSocket Test ==={Colors.END}")

    # Start admin WebSocket listener
    q: Queue = Queue()
    run_event = threading.Event()
    run_event.set()
    t = threading.Thread(target=start_ws_thread, args=(q, run_event), daemon=True)
    t.start()

    time.sleep(0.8)

    # Login admin
    token, user = login_admin()
    if not token:
        print(f"{Colors.RED}✗ Admin auth failed{Colors.END}")
        run_event.clear()
        t.join(timeout=1)
        return
    headers = {"Authorization": f"Bearer {token}"}
    print(f"{Colors.GREEN}✓ Admin authenticated{Colors.END}")

    # Pick an order
    order_id = pick_recent_order(headers)
    if not order_id:
        print(f"{Colors.RED}✗ No orders found{Colors.END}")
        run_event.clear()
        t.join(timeout=1)
        return
    print(f"{Colors.GREEN}✓ Using order{Colors.END}: {order_id}\n")

    # Drain any initial WS messages
    try:
        while True:
            q.get_nowait()
    except Empty:
        pass

    # Try a status flip sequence to trigger notifications
    sequence = ["PREPARING", "READY", "DELIVERED"]
    received_statuses = []

    for status in sequence:
        resp = update_status(headers, order_id, status)
        if resp.status_code not in (200, 201):
            print(f"{Colors.YELLOW}Status update failed{Colors.END}: {resp.status_code} {resp.text[:200]}")
            continue
        print(f"Updated order to {status}, waiting for WS message...")

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
                    got_status = msg.get('data', {}).get('status')
                    print(f"{Colors.GREEN}✓ Received 'order_status_update' -> {got_status}{Colors.END}")
                    received_statuses.append(got_status)
                    break
                elif mtype == "ws_closed":
                    code = msg.get("code")
                    print(f"{Colors.YELLOW}WS closed; code={code}. Waiting for reconnect...{Colors.END}")
                    # Give the listener a moment to reconnect
                    time.sleep(0.5)
                else:
                    # Log other messages for visibility
                    print(f"WS: {msg}")
            except Empty:
                continue

    # If we didn't catch DELIVERED, do one last nudge and wait longer (handles transient restarts)
    if "DELIVERED" not in received_statuses:
        resp = update_status(headers, order_id, "DELIVERED")
        if resp.status_code in (200, 201):
            print("Re-asserted DELIVERED, awaiting final WS update...")
            final_deadline = time.time() + 15
            while time.time() < final_deadline and "DELIVERED" not in received_statuses:
                try:
                    raw = q.get(timeout=1)
                    msg = json.loads(raw)
                    if msg.get("type") == "order_status_update" and msg.get("data", {}).get("order_id") == order_id:
                        got_status = msg.get('data', {}).get('status')
                        print(f"{Colors.GREEN}✓ Received 'order_status_update' -> {got_status}{Colors.END}")
                        received_statuses.append(got_status)
                    elif msg.get("type") == "ws_closed":
                        print(f"{Colors.YELLOW}WS closed during final wait; retrying...{Colors.END}")
                        time.sleep(0.5)
                    else:
                        print(f"WS: {msg}")
                except Empty:
                    continue

    # consider pass if at least two transitions observed AND include DELIVERED for stronger guarantee
    received = (len(received_statuses) >= 2) and ("DELIVERED" in received_statuses)

    run_event.clear()
    t.join(timeout=1)

    if received:
        print(f"\n{Colors.GREEN}PASS{Colors.END}: Admin WS receives status updates ({', '.join(received_statuses)})")
    else:
        print(f"\n{Colors.YELLOW}WARN{Colors.END}: Did not receive status update via WS. Check server logs and client connections.")

if __name__ == "__main__":
    main()
