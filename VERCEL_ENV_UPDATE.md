# 🔧 Vercel Environment Variable Update Guide

## ⚠️ Important: Your Vercel site needs to know where the backend is!

Currently your Vercel deployment is trying to connect to `localhost:8000` which doesn't exist in production.

## 📍 Update Steps:

### **Option 1: Via Vercel Dashboard (Recommended)**

1. **Open Vercel Settings:**
   - Go to: https://vercel.com/amrkals-projects/moringa-two/settings/environment-variables

2. **Find or Add Variable:**
   - If `NEXT_PUBLIC_API_BASE_URL` exists, click "Edit"
   - If it doesn't exist, click "Add New"

3. **Set the Value:**
   ```
   Variable Name: NEXT_PUBLIC_API_URL
   Value: https://moringa-production-93eb.up.railway.app/api/v1
   ```
   
   **Also add WebSocket URL:**
   ```
   Variable Name: NEXT_PUBLIC_WS_URL
   Value: wss://moringa-production-93eb.up.railway.app/api/v1/ws/admin
   ```

4. **Select Environments:**
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

5. **Click "Save"**

6. **Redeploy:**
   - Go to: https://vercel.com/amrkals-projects/moringa-two
   - Click "Deployments" tab
   - Click the three dots (•••) on the latest deployment
   - Select "Redeploy"
   - Wait ~1-2 minutes for deployment

### **Option 2: Via Vercel CLI**

```powershell
# Install Vercel CLI if not already installed
npm i -g vercel

# Login
vercel login

# Set environment variable
vercel env add NEXT_PUBLIC_API_BASE_URL production
# When prompted, enter: https://moringa-production-93eb.up.railway.app/api/v1

# Redeploy
vercel --prod
```

## ✅ After Update:

1. Visit: https://moringa-two.vercel.app/menu
2. Open browser DevTools (F12)
3. Go to Network tab
4. Refresh page
5. You should see requests to: `https://moringa-production-93eb.up.railway.app/api/v1/...`
6. Menu should load with all 39 meals! 🎉

## 🧪 Test Checklist:

After Vercel redeploys:
- [ ] Visit https://moringa-two.vercel.app/menu
- [ ] See all 6 categories (כריכים, ארוחת בוקר, שתיה חמה, מיץ טבעי, עיקריות, סלטים)
- [ ] Click "סלטים" (Salads)
- [ ] Click "סלט קינואה" 
- [ ] See price: ₪45
- [ ] See ingredients list
- [ ] See "תוספות" (Add-ons) section with:
  - + אבוקדו (₪5)
  - + טונה (₪5)
  - + ביצה קשה (₪5)
  - + חזה עוף (₪20)
  - + שניצל (₪20)
  - + סלמון (₪25)
- [ ] Select an add-on
- [ ] Verify price updates
- [ ] Add to cart
- [ ] Complete checkout

---

## 🚨 Troubleshooting:

**If menu still doesn't load after Vercel redeploy:**

1. **Check Backend Health:**
   - Visit: https://moringa-production-93eb.up.railway.app/api/v1/health
   - Should return: `{"status": "healthy"}`

2. **Check Categories API:**
   - Visit: https://moringa-production-93eb.up.railway.app/api/v1/categories
   - Should return 6 categories

3. **Check Browser Console:**
   - F12 → Console tab
   - Look for API errors
   - Verify requests go to Railway URL (not localhost)

4. **Clear Vercel Cache:**
   - In Vercel dashboard, redeploy with "Use existing Build Cache" unchecked

---

## 📊 Current Status:

✅ Database migrated to MongoDB Atlas (39 meals, 43 ingredients, 6 categories)  
✅ Backend deployed on Railway (https://moringa-production-93eb.up.railway.app)  
✅ Frontend deployed on Vercel (https://moringa-two.vercel.app)  
⏳ **Need to update Vercel env var to connect frontend → backend**

Once you update the Vercel environment variable, everything will work! 🚀
