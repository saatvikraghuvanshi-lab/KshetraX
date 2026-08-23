# 🚀 KshetraX Deployment Guide

## Architecture

```
┌─────────────────┐     HTTPS     ┌──────────────────────┐
│  Vercel (Frontend)│  ─────────►  │  Railway (Backend)    │
│  Next.js 14      │              │  Express + Prisma     │
│  Port 3000       │              │  Port 4000            │
└─────────────────┘               └──────────┬───────────┘
                                             │
                                    ┌────────▼───────────┐
                                    │  Railway PostgreSQL │
                                    │  (managed database) │
                                    └────────────────────┘
```

---

## Part 1: Deploy Backend to Railway

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your `KshetraX` repository
5. When prompted, choose **"Empty Project"** (don't auto-detect)

### Step 2: Add PostgreSQL Database
1. In your Railway project dashboard, click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway creates a managed PostgreSQL instance automatically
3. Copy the **PostgreSQL connection URL** (it looks like: `postgresql://postgres:xxxx@roundhouse.proxy.rlwy.net:xxxx/kshetrax`)

### Step 3: Add Backend Service
1. Click **"+ New"** → **"GitHub Repo"** → select your KshetraX repo
2. Railway auto-detects — it will try to run `npm run build` from the root. Go to **Settings** → **Service** and set:
   - **Name**: `kshetrax-backend`
   - **Root Directory**: `backend`  
     ⚠️ **This is critical** — without it, Railway runs the root build which fails
   - **Build Command**: `npm install && npx prisma generate && npx tsc`
   - **Start Command**: `npx prisma db push --skip-generate && node dist/index.js`

### Step 4: Set Environment Variables
Go to **Variables** tab and add:

```env
DATABASE_URL=postgresql://postgres:xxxx@roundhouse.proxy.rlwy.net:xxxx/kshetrax
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://kshetrax.vercel.app
OPENWEATHER_API_KEY=demo
STAC_API_URL=https://earth-search.aws.element84.com/v1
```

> ⚠️ **Replace** `CORS_ORIGIN` with your actual Vercel URL after deploying the frontend.

### Step 5: Deploy
1. Click **"Deploy"** — Railway builds and starts automatically
2. Wait for the build to finish (~2-3 minutes)
3. Click **"Settings"** → **"Networking"** → **"Generate Domain"**
4. You'll get a URL like: `kshetrax-backend-production.up.railway.app`
5. **Test**: Visit `https://kshetrax-backend-production.up.railway.app/api/health`

### Step 6: Seed the Database
Railway deploys the schema but not the demo data. To seed:

**Option A — Railway Shell (recommended):**
1. Click **"Settings"** → **"Networking"** → scroll to **"Shell"** → click **"Connect"**
2. Run:
```bash
npx ts-node prisma/seed.ts
npx ts-node prisma/seedYield.ts
```

**Option B — One-time deploy command:**
1. Add a **PostgreSQL seed** service:
   - Build: `npx prisma generate`
   - Start: `npx ts-node prisma/seed.ts && npx ts-node prisma/seedYield.ts`
   - Same env vars as backend
2. Run it once, then delete it

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"Add New..."** → **"Project"**

### Step 2: Import Repository
1. Select your `KshetraX` repository
2. **Framework Preset**: Next.js
3. **Root Directory**: `frontend`
4. **Build Command**: `next build` (auto-detected)
5. **Output Directory**: `.next` (auto-detected)

### Step 3: Set Environment Variables
Click **"Environment Variables"** and add:

```env
NEXT_PUBLIC_API_URL=https://kshetrax-backend-production.up.railway.app/api
```

> ⚠️ **Replace** with your actual Railway backend URL from Step 5 above.

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait ~1-2 minutes
3. Vercel gives you a URL like: `kshetrax.vercel.app`
4. **Test**: Visit `https://kshetrax.vercel.app` — you should see the dashboard with live data

### Step 5: Update Backend CORS
Go back to **Railway** → your backend service → **Variables**:
1. Update `CORS_ORIGIN` to your Vercel URL: `https://kshetrax.vercel.app`
2. Railway auto-redeploys (~30 seconds)

---

## Part 3: Full-Stack on Railway (Alternative)

If you want everything on one platform:

### Option A: Monorepo on Railway
1. Create a new Railway project
2. Add PostgreSQL database
3. Add **two services** from the same GitHub repo:

**Backend Service:**
- Root Directory: `backend`
- Build: `npx prisma generate && npx tsc`
- Start: `npx prisma db push --skip-generate && node dist/index.js`

**Frontend Service:**
- Root Directory: `frontend`
- Build: `next build`
- Start: `npx next start -p $PORT`

4. Set env vars:
   - Backend: `DATABASE_URL`, `PORT=4000`, `CORS_ORIGIN=https://kshetrax-frontend-production.up.railway.app`
   - Frontend: `NEXT_PUBLIC_API_URL=https://kshetrax-backend-production.up.railway.app/api`

### Option B: Docker Compose (self-hosted)
```bash
# docker-compose.yml
version: '3.8'
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: kshetrax
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@db:5432/kshetrax
      NODE_ENV: production
      CORS_ORIGIN: http://localhost:3000
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000/api

volumes:
  pgdata:
```

---

## Environment Variables Reference

### Backend (Railway)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ Yes | — | PostgreSQL connection string |
| `PORT` | No | `4000` | Server port (Railway sets $PORT) |
| `NODE_ENV` | No | `development` | `production` enables strict CORS |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed frontend origin |
| `OPENWEATHER_API_KEY` | No | `demo` | OpenWeatherMap API key |
| `STAC_API_URL` | No | earth-search | STAC API endpoint |

### Frontend (Vercel)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ Yes | `http://localhost:4000/api` | Backend API base URL |

---

## Post-Deployment Checklist

- [ ] Backend health check returns 200: `GET /api/health`
- [ ] Frontend loads without CORS errors
- [ ] Dashboard shows stats (Farmers, Plots, Policies)
- [ ] Map renders with plot markers
- [ ] Demo simulation works end-to-end
- [ ] Plot detail page shows weather charts
- [ ] Claims page shows trigger events
- [ ] Reports page shows payout records

---

## Troubleshooting

### CORS errors on Vercel
- Ensure `CORS_ORIGIN` in Railway matches your Vercel URL exactly (including `https://`)
- The backend CORS config accepts both `localhost:3000` and `127.0.0.1:3000` in development

### Database connection fails
- Verify `DATABASE_URL` is correct in Railway variables
- Ensure PostgreSQL service is running (check Railway dashboard)
- Run `npx prisma db push` in Railway shell if schema is out of sync

### Frontend shows "0" stats
- Check that `NEXT_PUBLIC_API_URL` points to your Railway backend URL
- Open browser DevTools → Network tab → check if API calls return 200
- If using Vercel rewrites, verify the backend URL in `vercel.json`

### Seed data missing after deploy
- Connect to Railway shell and run:
  ```bash
  npx ts-node prisma/seed.ts
  npx ts-node prisma/seedYield.ts
  ```
