# Testing Guide

This guide covers all automated tests for the Moringa system.

## Prerequisites

- MongoDB running at `mongodb://localhost:27017`
- Backend dependencies installed (`pip install -r backend/requirements.txt`)
- Frontend dependencies installed (`npm install` in `moringa/`)
- Chromium browser for Playwright (`npx playwright install chromium` in `moringa/`)

## Backend Tests (Python)

All backend tests run against a live FastAPI server on port 8000. Start the backend first:

```powershell
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Test Suite Overview

| Test Script | Purpose | Key Validations |
|-------------|---------|-----------------|
| `test_endpoints.py` | Basic CRUD endpoints | Auth, categories, meals, ingredients, orders |
| `test_features.py` | Feature integration | Menu browsing, cart, checkout flows |
| `test_real_time_notifications.py` | WebSocket admin channel | Admin receives `new_order` event |
| `test_order_status_ws.py` | Admin order status updates | Admin WS receives PREPARING/READY/DELIVERED |
| `test_customer_status_ws.py` | Customer order status updates | Customer WS receives full order lifecycle |
| `test_reviews_flow.py` | Verified purchase reviews | Auto-approval, stats, listing |
| `test_reviews_moderation_flow.py` | Unverified review moderation | PENDING→APPROVED→REJECTED flows |

### Running Backend Tests

From the `backend/` directory with the server running:

```powershell
python test_endpoints.py
python test_features.py
python test_real_time_notifications.py
python test_order_status_ws.py
python test_customer_status_ws.py
python test_reviews_flow.py
python test_reviews_moderation_flow.py
```

All tests use:
- **Admin credentials**: +254712345678 / admin123 (or default +1234567890 / admin123)
- **Customer credentials**: +1234567891 / customer123

WebSocket tests include auto-reconnect logic with exponential backoff to handle transient service restarts.

## Frontend Tests (Playwright E2E)

### Analytics Exports E2E

Located at `moringa/tests/e2e/analytics-exports.spec.ts`

**What it tests:**
- Admin login via API (bypassing UI login for speed)
- Navigation to `/admin/dashboard`
- CSV export: filename pattern, header content ("Date,Orders,Revenue")
- PDF export: filename pattern, non-empty file (>500 bytes)

**Running the test:**

#### Option 1: One-command orchestration (Windows)

From the repo root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-e2e.ps1
```

The script:
1. Starts backend on :8000 and waits for readiness
2. Starts frontend on :3002 and waits for readiness
3. Runs `npm run test:e2e` in `moringa/`
4. Stops both servers and cleans up

#### Option 2: Manual (three terminals)

```powershell
# Terminal 1: Backend
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
cd moringa
npm install
npx playwright install chromium
npm run dev -- -p 3002

# Terminal 3: Run Playwright
cd moringa
npm run test:e2e
```

**Environment variables:**

The test uses:
- `BASE_URL` (default: http://localhost:3002)
- `NEXT_PUBLIC_API_URL` in `.env.local` (default: http://localhost:8000/api/v1)

Override the base URL if needed:

```powershell
$env:BASE_URL='http://localhost:3002'; npm run test:e2e
```

## CI/CD (GitHub Actions)

The CI workflow at `.github/workflows/ci.yml` runs on push/PR and:
- Spins up MongoDB service
- Seeds the database with `backend/seed_db.py`
- Starts FastAPI backend
- Runs all backend Python tests
- Installs frontend dependencies and Playwright
- Starts Next.js dev server
- Runs Playwright E2E tests
- Uploads trace artifacts on failure

## Troubleshooting

### Backend tests fail with connection errors
- Ensure MongoDB is running: `net start MongoDB` (Windows) or check your MongoDB service
- Verify backend is reachable: `curl http://localhost:8000/docs`

### WebSocket tests timeout or miss events
- The tests have built-in reconnect logic. If they still fail, restart the backend.
- Check for firewall/antivirus blocking WebSocket connections.

### Playwright tests fail with "page not found"
- Ensure frontend is running on port 3002: `curl http://localhost:3002`
- Check `moringa/playwright.config.ts` baseURL setting

### Downloads not captured in Playwright
- The test saves downloads to OS temp directory (`os.tmpdir()`)
- Verify the dashboard buttons are enabled (requires analytics data; run seed script if empty)

### CI fails on "seed duplicate key"
- The seeder is now idempotent. If you see this, pull the latest `backend/seed_db.py`.

## Test Credentials

All tests use these seeded accounts:

| Role | Phone | Password | Usage |
|------|-------|----------|-------|
| Admin (default) | +1234567890 | admin123 | Backend tests, manual login |
| Admin (test) | +254712345678 | admin123 | Playwright E2E, CI |
| Customer | +1234567891 | customer123 | Backend tests, customer flows |

To reset or re-seed:

```powershell
cd backend
python seed_db.py
```

## Coverage and Future Enhancements

**Current coverage:**
- ✅ Auth flows (login, register, JWT refresh)
- ✅ CRUD for categories, meals, ingredients, orders, users
- ✅ Real-time WebSocket admin and customer notifications
- ✅ Reviews lifecycle (verified and moderation)
- ✅ Admin dashboard analytics exports (CSV/PDF)

**Future additions:**
- Unit tests for individual routers and services
- E2E for customer-facing pages (menu, cart, checkout)
- Load/performance tests for WebSocket concurrency
- Visual regression tests for UI components

---

For questions or issues, consult the main [README.md](README.md) or open an issue.
