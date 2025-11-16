# Deployment Checklist - Moringa Food Ordering App

## 🎯 Goal: Deploy app for $5/month with client-owned billing

**Stack:**
- Frontend: Vercel (Free)
- Backend: Railway (Hobby $5/month)
- Database: MongoDB Atlas (Free M0)
- Domain: Namecheap/Cloudflare (~$12/year)

---

## Pre-Deployment Checklist

### 1. MongoDB Atlas Setup ✅
- [ ] Create MongoDB Atlas account (client's email)
- [ ] Create free M0 cluster
- [ ] Add database user with password
- [ ] Whitelist IP (0.0.0.0/0 for now)
- [ ] Get connection string
- [ ] Update `backend/.env` with connection string
- [ ] Test local connection

📖 See `MONGODB_ATLAS_SETUP.md` for detailed steps

### 2. GitHub Repository
- [ ] Push all code to GitHub
- [ ] Create `.gitignore` (ignore `.env`, `node_modules`, etc.)
- [ ] Repository is public or client has access
- [ ] All changes committed and pushed

### 3. Environment Variables Prepared

**Backend (.env):**
```bash
MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net/moringa_food_ordering?retryWrites=true&w=majority
SECRET_KEY=generate-new-random-secret-key-for-production
FRONTEND_URL=https://your-domain.com
ALLOWED_ORIGINS=["https://your-domain.com","https://www.your-domain.com"]
STRIPE_DEMO_MODE=true
DEBUG=false
ENVIRONMENT=production
```

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.up.railway.app/api/v1
NEXT_PUBLIC_APP_NAME=Moringa Restaurant
```

---

## Deployment Steps

### Phase 1: Deploy Backend (Railway)

#### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with client's email
3. Choose **Hobby Plan** ($5/month)
4. Add payment method

#### Step 2: Deploy Backend
1. Click **"New Project"** → **"Deploy from GitHub repo"**
2. Connect GitHub account
3. Select `Moringa` repository
4. Railway auto-detects Python/FastAPI

#### Step 3: Configure Backend
1. **Root Directory**: Set to `backend` if monorepo
2. **Start Command**: 
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
3. **Environment Variables**: Add all from backend `.env`:
   - `MONGODB_URL` - Your Atlas connection string
   - `SECRET_KEY` - New random secret (generate with `openssl rand -hex 32`)
   - `FRONTEND_URL` - Will update after frontend deploy
   - `ALLOWED_ORIGINS` - Will update after frontend deploy
   - `DEBUG` - `false`
   - `ENVIRONMENT` - `production`
   - `STRIPE_DEMO_MODE` - `true`

4. **Generate Domain**: Railway gives you `xxx.up.railway.app`
   - Copy this URL (e.g., `moringa-backend.up.railway.app`)

#### Step 4: Update MongoDB Atlas IP Whitelist
1. Go to Atlas → Network Access
2. Add Railway's IP addresses:
   - Check Railway deployment logs for outbound IP
   - Or keep 0.0.0.0/0 for simplicity (less secure)

#### Step 5: Test Backend
- Visit `https://your-backend.up.railway.app/docs`
- Should see FastAPI Swagger docs
- Test an endpoint

---

### Phase 2: Deploy Frontend (Vercel)

#### Step 1: Create Vercel Account
1. Go to https://vercel.com/signup
2. Sign up with client's email
3. Connect GitHub account

#### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Select `Moringa` repository
3. Framework: **Next.js** (auto-detected)
4. Root Directory: `moringa` (if monorepo)

#### Step 3: Configure Build Settings
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

#### Step 4: Environment Variables
Add these in Vercel project settings:

```bash
NEXT_PUBLIC_API_BASE_URL=https://moringa-backend.up.railway.app/api/v1
NEXT_PUBLIC_APP_NAME=Moringa Restaurant
```

Replace `moringa-backend.up.railway.app` with your actual Railway URL

#### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Get your URL: `your-app.vercel.app`

#### Step 6: Update Backend CORS
1. Go back to Railway → Backend environment variables
2. Update:
   ```bash
   FRONTEND_URL=https://your-app.vercel.app
   ALLOWED_ORIGINS=["https://your-app.vercel.app"]
   ```
3. Backend will auto-redeploy

#### Step 7: Test Full App
- Visit `https://your-app.vercel.app`
- Test: Browse menu, add to cart, create order
- Check admin dashboard works

---

### Phase 3: Custom Domain (Optional)

#### Step 1: Buy Domain
1. **Namecheap**: https://www.namecheap.com (~$12/year)
2. **Cloudflare Registrar**: At-cost pricing (~$10/year)
3. Buy: `moringarestaurant.com` (or client's choice)

#### Step 2: Add Domain to Vercel (Frontend)
1. Vercel Dashboard → Project → Settings → Domains
2. Add `moringarestaurant.com` and `www.moringarestaurant.com`
3. Vercel gives you DNS records:
   - A record: `76.76.21.21` (example)
   - CNAME: `cname.vercel-dns.com`

#### Step 3: Configure DNS (Namecheap/Cloudflare)
1. Log into domain registrar
2. Go to DNS settings
3. Add records from Vercel:
   - **A record**: `@` → `76.76.21.21`
   - **CNAME**: `www` → `cname.vercel-dns.com`

#### Step 4: Add Custom Domain to Railway (Backend)
1. Railway → Project → Settings → Domains
2. Add `api.moringarestaurant.com`
3. Railway gives you CNAME:
   - Copy the CNAME target

4. Add to DNS:
   - **CNAME**: `api` → `railway-domain.up.railway.app`

#### Step 5: Update Environment Variables
**Railway (Backend):**
```bash
FRONTEND_URL=https://moringarestaurant.com
ALLOWED_ORIGINS=["https://moringarestaurant.com","https://www.moringarestaurant.com"]
```

**Vercel (Frontend):**
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.moringarestaurant.com/api/v1
```

#### Step 6: Wait for DNS Propagation
- Can take 5 minutes to 48 hours
- Usually works in 15-30 minutes
- Check: https://dnschecker.org

#### Step 7: Enable SSL (Automatic)
- Vercel: Auto-generates SSL (Let's Encrypt)
- Railway: Auto-generates SSL
- Both free and automatic

---

## Post-Deployment

### 1. Test Production App
- [ ] Frontend loads on custom domain
- [ ] Backend API responds
- [ ] Browse menu works
- [ ] Add items to cart
- [ ] Checkout creates order
- [ ] Admin dashboard accessible
- [ ] Phone verification works (if Twilio configured)
- [ ] Notifications work
- [ ] Mobile responsive
- [ ] Dark mode works

### 2. Setup Monitoring
- [ ] Railway: Check deployment logs
- [ ] Vercel: Check Analytics tab
- [ ] MongoDB Atlas: Check Metrics tab

### 3. Create Admin Account
1. Visit `https://your-domain.com/admin`
2. Sign up with admin credentials
3. Manually promote to admin in MongoDB:
   - Atlas → Browse Collections → `users`
   - Find your user → Edit
   - Set `role: "admin"`

### 4. Add Initial Data
- [ ] Add food categories
- [ ] Upload meal images
- [ ] Add meals with prices
- [ ] Test ordering flow

### 5. Security Checklist
- [ ] MongoDB Atlas: Proper IP whitelist (not 0.0.0.0/0)
- [ ] Railway: Environment variables secured
- [ ] Vercel: Environment variables secured
- [ ] Backend: `DEBUG=false`
- [ ] Backend: Strong `SECRET_KEY`
- [ ] CORS: Only allow your domains

### 6. Client Handover
- [ ] Give client Railway login (billing access)
- [ ] Give client Vercel login
- [ ] Give client MongoDB Atlas login
- [ ] Give client domain registrar login
- [ ] Document admin credentials
- [ ] Provide this deployment guide

---

## Costs Summary

| Service | Plan | Cost |
|---------|------|------|
| **Railway (Backend)** | Hobby | $5/month |
| **Vercel (Frontend)** | Free | $0/month |
| **MongoDB Atlas** | M0 Free | $0/month |
| **Domain** | Namecheap .com | $12/year |
| **SSL Certificates** | Auto (Let's Encrypt) | $0 |
| **Total** | | **~$5/month + $12/year** |

---

## Scaling Options (When Needed)

### More Traffic (100+ customers/day):
- **MongoDB**: Upgrade to M10 (~$57/month)
- **Railway**: Usage-based (grows with traffic)
- **Vercel**: Stay on Free (bandwidth limits high)

### Growing Business (500+ customers/day):
- **MongoDB**: M30+ ($200+/month)
- **Railway**: Developer Plan ($20/month)
- **Vercel**: Pro ($20/month) for better analytics

---

## Troubleshooting

### Frontend can't connect to backend
- Check `NEXT_PUBLIC_API_BASE_URL` is correct
- Check backend CORS allows frontend domain
- Check backend is running (Railway logs)

### Database connection errors
- Check `MONGODB_URL` in Railway env vars
- Check MongoDB Atlas IP whitelist
- Check database user password correct

### Domain not working
- Wait for DNS propagation (15-30 min)
- Check DNS records are correct
- Check domain is pointed to right servers

### 500 errors on backend
- Check Railway deployment logs
- Check environment variables are set
- Check MongoDB connection

---

## Support Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Next.js**: https://nextjs.org/docs
- **FastAPI**: https://fastapi.tiangolo.com

---

## Quick Commands

### Generate Secret Key
```bash
openssl rand -hex 32
```

### Test Backend Locally
```bash
cd backend
uvicorn app.main:app --reload
```

### Test Frontend Locally
```bash
cd moringa
npm run dev
```

### Build Frontend for Production
```bash
cd moringa
npm run build
npm start
```

---

## Client Billing Setup

### Railway (Client pays $5/month)
1. Client creates account with their email
2. Adds payment method (credit card)
3. Adds you as collaborator:
   - Settings → Members → Add Member
   - Your email with Developer role

### Vercel (Free, no billing)
1. Client creates account (optional)
2. Or you deploy under your account and transfer later

### MongoDB Atlas (Free M0)
1. Client creates account with their email
2. Adds you as Project Member:
   - Project → Access Manager → Invite to Project
   - Your email with "Project Owner" role

### Domain Renewal (Client pays ~$12/year)
1. Client buys domain with their email
2. Adds you as contact for management
3. Auto-renewal enabled

---

## Next Steps After This Guide

1. ✅ Complete MongoDB Atlas setup
2. ✅ Push code to GitHub
3. ✅ Deploy backend to Railway
4. ✅ Deploy frontend to Vercel
5. ✅ Test production app
6. ✅ (Optional) Add custom domain
7. ✅ Handover to client

**Ready to deploy? Start with MongoDB Atlas setup!**
