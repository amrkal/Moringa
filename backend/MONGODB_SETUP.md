# MongoDB Setup Instructions

## Option 1: MongoDB Atlas (Cloud - Recommended for Development)

1. Go to https://cloud.mongodb.com and create a free account
2. Create a new cluster (free tier is sufficient)
3. Get your connection string from the "Connect" button
4. Update your `.env` file with the connection string:
   ```
   MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/moringa_food_ordering?retryWrites=true&w=majority
   ```

## Option 2: Local MongoDB Installation

### Windows:
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. Start MongoDB service:
   ```
   net start MongoDB
   ```

### Alternative: Using Docker
```bash
# Pull MongoDB image
docker pull mongo:latest

# Run MongoDB container
docker run --name mongodb -p 27017:27017 -d mongo:latest
```

## Option 3: Temporary In-Memory Database (For Testing)
Update your `.env` file:
```
MONGODB_URL=mongodb://localhost:27017
```

And we'll use a fallback connection that creates an in-memory database if MongoDB is not available.

## Current Configuration
The application is configured to work with:
- MongoDB Atlas (cloud)
- Local MongoDB (if installed)
- Fallback to in-memory storage for testing

## Next Steps
1. Choose one of the options above
2. Update your `.env` file with the correct MongoDB connection string
3. Run the application:
   ```
   python -m uvicorn app.main:app --reload
   ```
4. Seed the database:
   ```
   python seed_db.py
   ```