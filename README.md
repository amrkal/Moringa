## Demo Payments Mode

Stripe keys are optional for a local demo. If you leave the `STRIPE_SECRET_KEY` blank in `backend/.env` (or set `STRIPE_DEMO_MODE=true`) the application enters demo mode:

 - `POST /payments/create-payment-intent` returns a simulated PaymentIntent id & client secret (no network call to Stripe).
 - `GET /payments/config` returns a placeholder publishable key plus `{ demo: true }` so the frontend shows a simulated payment UI with a "Simulate Success" button.
 - `POST /payments/demo-complete` marks the order as paid (used by the simulated success button).

To enable real Stripe processing later:

1. Create Stripe account & get test keys.
2. Populate in `backend/.env`:
   - `STRIPE_PUBLISHABLE_KEY=pk_test_...`
   - `STRIPE_SECRET_KEY=sk_test_...`
   - `STRIPE_WEBHOOK_SECRET=whsec_...` (after creating a webhook endpoint or using the Stripe CLI)
3. Ensure `STRIPE_DEMO_MODE=false` (or remove it).
4. Restart backend.
5. Use Stripe test cards (e.g. `4242 4242 4242 4242` with any future expiry, any CVC, any ZIP).

Webhook (optional for full flow):

Run the Stripe CLI to forward events:

```
stripe listen --forward-to localhost:8000/payments/webhook
```

Copy the displayed signing secret into `STRIPE_WEBHOOK_SECRET` and restart backend.

If webhook isn't configured, successful client confirmation still updates order to confirmed in real mode when the webhook arrives; in demo mode we bypass Stripe entirely.

# 🍽️ Moringa Food Ordering System

A comprehensive full-stack food ordering application built with **Next.js 15** (frontend) and **FastAPI + MongoDB** (backend).

## 🌟 Features

### Customer Features
- 📱 **Menu Browsing**: Browse categories and meals with detailed information
- 🛒 **Shopping Cart**: Add/remove items, customize with ingredients  
- 🍕 **Meal Customization**: Add/remove ingredients, special instructions
- 💳 **Multiple Payment Methods**: Cash, Card, Mobile Money, M-Pesa, Stripe
- 🚚 **Order Types**: Delivery, Dine-in, Take-away
- 📞 **SMS/WhatsApp Verification**: Secure phone number verification
- 📋 **Order Tracking**: Real-time order status updates

### Admin Features  
- 📊 **Dashboard**: Overview of orders, revenue, and statistics
- 🏷️ **Category Management**: Add, edit, delete, reorder categories
- 🍽️ **Meal Management**: Full CRUD operations for meals
- 🧄 **Ingredient Management**: Manage ingredients and pricing
- 📦 **Order Management**: Track and update order statuses
- 👥 **User Management**: View and manage customers

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ 
- **Python** 3.11+
- **MongoDB** (Local or MongoDB Atlas)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   venv\\Scripts\\activate  # Windows
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure MongoDB:**
   ```bash
   # Update .env file with your MongoDB connection string
   MONGODB_URL=mongodb://localhost:27017
   ```

5. **Start the server:**
   ```bash
   python -m uvicorn app.main:app --reload
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd moringa
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

### 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/v1/docs

## ✅ Testing

### Backend quick tests (Python scripts)

Run these against a running FastAPI backend on port 8000:

```powershell
cd backend
python test_endpoints.py
python test_features.py
python test_real_time_notifications.py
python test_order_status_ws.py
python test_customer_status_ws.py
python test_reviews_flow.py
python test_reviews_moderation_flow.py
```

### Frontend E2E (Playwright)

#### Option 1: One-command orchestration (Windows)

From the repo root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-e2e.ps1
```

This script:
- Starts FastAPI backend on :8000
- Starts Next.js dev server on :3002
- Runs Playwright E2E tests
- Stops both servers after completion

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

# Terminal 3: E2E tests
cd moringa
npm run test:e2e
```

Playwright will validate the Admin Dashboard exports (CSV/PDF) end-to-end, including:
- CSV filename matches `sales-report-*.csv` and contains header `Date,Orders,Revenue`
- PDF filename matches `sales-report-*.pdf` and file size > 500 bytes

Demo admin credentials (seeded):

- Admin (default): Phone +1234567890 / Password admin123
- Admin (tests): Phone +254712345678 / Password admin123
- Customer (seeded): Phone +1234567891 / Password customer123

### CI

This repository includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:
- Spins up MongoDB
- Installs and starts FastAPI backend
- Runs the Python test scripts
- Installs and starts Next.js
- Runs Playwright E2E tests

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand

### Backend
- **Framework**: FastAPI
- **Database**: MongoDB with Beanie ODM
- **Authentication**: JWT with passlib

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Submit a pull request

## 📄 License

MIT License
