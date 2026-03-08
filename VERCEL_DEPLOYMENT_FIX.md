# 🚨 URGENT: Vercel Production Deployment Fix

## Problem Identified

Your production site at https://nechabest.vercel.app is failing because:

1. ❌ **Using Clerk DEVELOPMENT keys in production** - These have strict limits and are not meant for production
2. ❌ **Environment variables not configured in Vercel** - Vercel doesn't use your local .env.local file
3. ❌ **401 Unauthorized errors** - Admin authentication failing due to missing/wrong configuration

## 🔧 Solution: Configure Production Clerk Keys

### Step 1: Get Production Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your **NECHABEST** application
3. In the left sidebar, click **"API Keys"**
4. Switch to **"Production"** tab (important!)
5. Copy these keys:
   - **Publishable key** (starts with `pk_live_...`)
   - **Secret key** (starts with `sk_live_...`)

### Step 2: Configure Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **nechabest** project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://<username>:<password>@<cluster-url>/<db>?retryWrites=true&w=majority` | Production, Preview, Development |
| `MONGODB_DB` | `nechabest` | Production, Preview, Development |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_YOUR_PRODUCTION_KEY` | Production, Preview, Development |
| `CLERK_SECRET_KEY` | `sk_live_YOUR_PRODUCTION_SECRET` | Production, Preview, Development |
| `ADMIN_EMAILS` | `owner@nechabest.org` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://nechabest.vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | (leave empty or preview URL) | Preview |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Development |

**Important Notes:**
- ⚠️ **NEVER commit production keys to Git** - Only set them in Vercel dashboard
- ✅ Check **all three checkboxes** (Production, Preview, Development) for most variables
- ✅ Use `pk_live_...` and `sk_live_...` keys (NOT `pk_test_...` or `sk_test_...`)

### Step 3: Configure Clerk Production Instance

1. In [Clerk Dashboard](https://dashboard.clerk.com/), go to your app
2. Switch to **"Production"** mode
3. Go to **"Domains"** section
4. Add your production domain: `nechabest.vercel.app`
5. Go to **"Paths"** → Configure these:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/`
   - After sign-up URL: `/`

### Step 4: Redeploy in Vercel

After setting all environment variables:

1. Go to **Deployments** tab in Vercel
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"** → Check **"Use existing build cache"** OFF
4. Click **"Redeploy"**

**OR** push a new commit to trigger deployment:
```bash
git commit --allow-empty -m "Trigger Vercel redeploy with production env vars"
git push origin main
```

### Step 5: Verify Production Deployment

1. Wait for deployment to complete (~2-3 minutes)
2. Open https://nechabest.vercel.app
3. Open browser DevTools Console (F12)
4. Check for:
   - ✅ NO "development keys" warning from Clerk
   - ✅ NO 401 errors on admin API calls
5. Try signing in and accessing `/admin` dashboard

## 🔒 Security Checklist

- [ ] Production Clerk keys (`pk_live_...`, `sk_live_...`) configured in Vercel
- [ ] Development Clerk keys (`pk_test_...`, `sk_test_...`) ONLY in local `.env.local`
- [ ] MongoDB URI configured in Vercel with proper credentials
- [ ] `ADMIN_EMAILS` set to your actual admin email(s)
- [ ] `.env.local` file is in `.gitignore` (already done)
- [ ] No secrets committed to Git repository

## 📋 Environment Variables Reference

### Local Development (.env.local)
```env
# Use TEST keys for development
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster-url>/nechabest?retryWrites=true&w=majority"
MONGODB_DB=nechabest
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
ADMIN_EMAILS=owner@nechabest.org
APP_URL="http://localhost:3000"
```

### Production (Vercel Dashboard)
```env
# Use LIVE keys for production - SET IN VERCEL DASHBOARD ONLY
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/nechabest?retryWrites=true&w=majority
MONGODB_DB=nechabest
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_[GET_FROM_CLERK_DASHBOARD]
CLERK_SECRET_KEY=sk_live_[GET_FROM_CLERK_DASHBOARD]
ADMIN_EMAILS=owner@nechabest.org
NEXT_PUBLIC_APP_URL=https://nechabest.vercel.app
```

## 🆘 Troubleshooting

### Still seeing "development keys" warning?
- Verify you're using `pk_live_...` and `sk_live_...` in Vercel
- Clear Vercel cache and redeploy (uncheck "Use existing build cache")
- Check Vercel deployment logs for environment variable errors

### Still getting 401 errors on admin dashboard?
- Verify `ADMIN_EMAILS` matches your Clerk account email
- Check Clerk dashboard: Make sure your email is verified
- Verify `CLERK_SECRET_KEY` is the LIVE key, not TEST key
- Check Vercel logs: `vercel logs [deployment-url]`

### MongoDB connection failing?
- Verify MongoDB Atlas allows connections from `0.0.0.0/0` (all IPs) or Vercel IPs
- Check MongoDB Atlas → Network Access → Add IP Address → "Allow from Anywhere"
- Verify credentials in `MONGODB_URI` are correct

## 📞 Next Steps

1. **Right now**: Get production Clerk keys from dashboard
2. **Then**: Add all environment variables to Vercel
3. **Finally**: Redeploy and verify everything works

Your local development will continue using test keys (which is correct), but production will use proper live keys.
