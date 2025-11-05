"""
WebSocket Connection Monitor
Connects to the admin WebSocket and monitors connection stability
"""
import asyncio
import websockets
import json
from datetime import datetime

async def monitor_websocket():
    uri = "ws://localhost:8000/api/v1/ws/admin"
    connection_count = 0
    
    print("=" * 60)
    print("WebSocket Connection Monitor")
    print("=" * 60)
    print(f"Connecting to: {uri}")
    print("Monitoring for 60 seconds...\n")
    
    try:
        async with websockets.connect(uri) as websocket:
            connection_count += 1
            connect_time = datetime.now().strftime("%H:%M:%S")
            print(f"[{connect_time}] ✓ Connection #{connection_count} established")
            
            # Monitor for 60 seconds
            start_time = asyncio.get_event_loop().time()
            message_count = 0
            
            while (asyncio.get_event_loop().time() - start_time) < 60:
                try:
                    # Wait for messages with timeout
                    message = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                    message_count += 1
                    timestamp = datetime.now().strftime("%H:%M:%S")
                    
                    # Try to parse JSON
                    try:
                        data = json.loads(message)
                        msg_type = data.get('type', 'unknown')
                        print(f"[{timestamp}] ← Message #{message_count}: {msg_type}")
                    except json.JSONDecodeError:
                        print(f"[{timestamp}] ← Message #{message_count}: {message[:50]}")
                        
                except asyncio.TimeoutError:
                    # No message received, connection still alive
                    continue
                except websockets.exceptions.ConnectionClosed:
                    disconnect_time = datetime.now().strftime("%H:%M:%S")
                    print(f"\n[{disconnect_time}] ✗ Connection closed unexpectedly!")
                    print(f"Connection lasted: {asyncio.get_event_loop().time() - start_time:.1f} seconds")
                    return
            
            # Successful 60-second test
            end_time = datetime.now().strftime("%H:%M:%S")
            print(f"\n[{end_time}] ✓ Test completed successfully!")
            print(f"Total connections: {connection_count}")
            print(f"Messages received: {message_count}")
            print(f"Duration: 60 seconds")
            print("\n" + "=" * 60)
            print("✓ PASS: WebSocket connection remained stable!")
            print("=" * 60)
            
    except Exception as e:
        error_time = datetime.now().strftime("%H:%M:%S")
        print(f"\n[{error_time}] ✗ ERROR: {str(e)}")
        print("\n" + "=" * 60)
        print("✗ FAIL: Could not establish or maintain connection")
        print("=" * 60)

if __name__ == "__main__":
    print("\nStarting WebSocket stability test...")
    print("This will monitor the connection for 60 seconds.\n")
    
    try:
        asyncio.run(monitor_websocket())
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
