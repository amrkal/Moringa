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
