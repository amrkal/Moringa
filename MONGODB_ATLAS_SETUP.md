# MongoDB Atlas Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with email (use client's email for production)
3. Verify email

### Step 2: Create Free Cluster
1. Click **"Build a Database"**
2. Choose **M0 FREE** tier (512MB, perfect for small apps)
3. Provider: **AWS** (recommended)
4. Region: Choose closest to your users:
   - **US East (N. Virginia)** - `us-east-1`
   - **EU (Ireland)** - `eu-west-1`
   - **Asia Pacific (Mumbai)** - `ap-south-1`
5. Cluster Name: `moringa-cluster`
6. Click **"Create"** (takes 3-5 minutes)

### Step 3: Create Database User
1. Go to **"Database Access"** (left sidebar under Security)
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `moringa_app`
5. Click **"Autogenerate Secure Password"**
6. **📋 COPY AND SAVE THIS PASSWORD!** You'll need it in .env file
7. Database User Privileges: **"Read and write to any database"**
8. Click **"Add User"**

### Step 4: Allow Network Access
1. Go to **"Network Access"** (left sidebar under Security)
2. Click **"Add IP Address"**

**For Development/Testing:**
3. Click **"Allow Access from Anywhere"**
4. This adds `0.0.0.0/0` (all IPs allowed)
5. Click **"Confirm"**

**For Production (after deploying):**
- Add specific IPs from Railway/Render/Vercel
- Remove `0.0.0.0/0` for security

### Step 5: Get Connection String
1. Go to **"Database"** (left sidebar)
2. Click **"Connect"** button on your cluster
3. Choose **"Drivers"**
4. Select: **Python** | **3.12 or later**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://moringa_app:<password>@moringa-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Update Backend .env File

1. Open `backend/.env`
2. Find the line:
   ```bash
   MONGODB_URL=mongodb://localhost:27017
   ```

3. Replace it with your Atlas connection string:
   ```bash
   MONGODB_URL=mongodb+srv://moringa_app:YOUR_ACTUAL_PASSWORD@moringa-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

4. **IMPORTANT**: Replace `<password>` with the actual password you copied in Step 3

5. Example final result:
   ```bash
   MONGODB_URL=mongodb+srv://moringa_app:MyP@ssw0rd123@moringa-cluster.abc12.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DATABASE_NAME=moringa_food_ordering
   ```

### Step 7: Test Connection

1. Make sure backend dependencies are installed:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Start the backend:
   ```bash
   uvicorn app.main:app --reload
   ```

3. You should see:
   ```
   ✅ Connected to MongoDB at mongodb+srv://...
   ✅ Beanie initialized successfully
   ```

4. If you see errors, check:
   - Password is correct (no `<password>` placeholder)
   - IP address is whitelisted (0.0.0.0/0 for testing)
   - Connection string is complete

## MongoDB Atlas Dashboard Features

### View Your Data
1. Go to **"Database"** → Click **"Browse Collections"**
2. See all your collections: `users`, `meals`, `orders`, etc.
3. Can manually add/edit/delete documents

### Monitoring
1. Go to **"Metrics"** tab
2. See database operations, connections, memory usage

### Backups (Free tier)
- Atlas automatically backs up your data
- Go to **"Backup"** to see snapshots

## Connection String Explained

```
mongodb+srv://moringa_app:password123@moringa-cluster.abc12.mongodb.net/?retryWrites=true&w=majority
```

- `mongodb+srv://` - Protocol (SRV record for Atlas)
- `moringa_app` - Database username
- `password123` - Database password
- `moringa-cluster.abc12.mongodb.net` - Your cluster address
- `?retryWrites=true&w=majority` - Connection options

## Security Best Practices

### For Production:

1. **Strong Password**
   - Use complex password (generated)
   - Never commit to Git

2. **IP Whitelist**
   - Remove `0.0.0.0/0`
   - Add only your server IPs:
     - Railway: Check deployment logs for IP
     - Render: Add their IP ranges
     - Vercel: Use Vercel's IP list

3. **Database Name**
   - Add database name to connection string:
   ```bash
   mongodb+srv://user:pass@cluster.mongodb.net/moringa_food_ordering?retryWrites=true&w=majority
   ```

4. **Environment Variables**
   - Never hardcode credentials
   - Use `.env` file locally
   - Use platform env vars in production

## Upgrading from Free Tier

When you need more (100+ daily customers):

### M10 Cluster ($57/month)
- 10GB storage
- 2GB RAM
- Better performance
- Automated backups
- 24/7 support

### How to Upgrade:
1. Go to cluster → **"..."** menu → **"Edit Configuration"**
2. Choose **M10**
3. Click **"Review Changes"** → **"Apply Changes"**

## Troubleshooting

### Error: "Authentication failed"
- Check password (no `<password>` placeholder)
- Check username matches database user

### Error: "Connection timeout"
- Check IP whitelist (0.0.0.0/0 for testing)
- Check firewall/network

### Error: "Server selection timeout"
- Cluster might be paused (free tier pauses after inactivity)
- Go to Atlas → Resume cluster

### Can't connect from production
- Add server IP to Network Access
- Railway: Check deployment logs for IP
- Render: Add their IP ranges

## Free Tier Limits

- ✅ 512MB storage (enough for 1000+ meals/orders)
- ✅ Shared RAM/CPU
- ✅ Perfect for development and small apps
- ✅ No credit card required
- ⚠️ Pauses after 60 days inactivity (easy to resume)

## Connection String for Different Environments

### Development (.env)
```bash
MONGODB_URL=mongodb+srv://moringa_app:pass@moringa-cluster.mongodb.net/?retryWrites=true&w=majority
```

### Production (Railway/Render env vars)
```bash
MONGODB_URL=mongodb+srv://moringa_app:pass@moringa-cluster.mongodb.net/moringa_food_ordering?retryWrites=true&w=majority
```

Note: Added `/moringa_food_ordering` before the `?` to specify database

## Next Steps

1. ✅ Create Atlas account
2. ✅ Create free M0 cluster
3. ✅ Add database user
4. ✅ Allow IP access (0.0.0.0/0)
5. ✅ Get connection string
6. ✅ Update `backend/.env`
7. ✅ Test backend connection
8. 🚀 Deploy to Railway/Render (see DEPLOYMENT.md)

## Support

- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Free tier support: Community forums
- 24/7 support: Paid tiers only
