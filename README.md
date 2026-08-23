# 🌾 KshetraX — Parametric Crop Insurance Satellite Payout Engine

<p align="center">
  <strong>🛰️ Satellite-powered crop insurance with instant, transparent payouts 🛡️</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" />
  <img src="https://img.shields.io/badge/Node.js-20-green?logo=node.js" />
  <img src="https://img.shields.io/badge/Prisma-5-blue?logo=prisma" />
  <img src="https://img.shields.io/badge/Leaflet-1.9-green?logo=leaflet" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" />
</p>

---

## 📋 Problem Statement

**PS-19: Parametric Crop Insurance – Satellite Payout Engine**

Millions of farmers in India face crop losses due to drought, irregular rainfall, and extreme weather. Traditional crop insurance involves:

- ❌ Manual field inspections (6-12 month delays)
- ❌ Opaque payout formulas
- ❌ Corruption in damage assessment
- ❌ Complex claim processes that farmers abandon

**KshetraX** solves this with **parametric insurance** — automatic, satellite-based trigger detection with instant, transparent payouts. Currently seeded with 8 farmers, 12 plots across India, 720 weather data points, and real Sentinel-2 satellite integration.

---

## 🔄 How It Works

```
📍 Plot Registration → 🛰️ Satellite Monitoring → ⚡ Auto-Trigger → 💰 Instant Payout
```

1. **Plot Registration**: Farmer provides plot coordinates → system links to nearest weather station + satellite tile
2. **Continuous Monitoring**: Ingests rainfall, NDVI (vegetation index), soil moisture data
3. **Trigger Detection**: When threshold is crossed (e.g., rainfall < 70% of normal), trigger is flagged
4. **Payout Calculation**: Formula engine computes payout instantly → visible to farmer

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js + Express + TypeScript |
| **Database** | Prisma ORM + SQLite (PostgreSQL in prod) |
| **Frontend** | Next.js 14 + Tailwind CSS |
| **Maps** | Leaflet + OpenStreetMap |
| **Satellite Data** | STAC API (Sentinel-2 via Earth Search) |
| **Weather Data** | Open-Meteo (real) + IMD-compatible synthetic + OpenWeatherMap |
| **Security** | Helmet, CORS, Rate Limiting |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/saatvikraghuvanshi-lab/KshetraX.git
cd KshetraX
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Install root dependencies (for concurrently)
cd .. && npm install
```

### 3. Setup Database

```bash
cd backend
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts
```

### 4. Run the Application

```bash
# From root directory - runs both backend and frontend
npm run dev

# Or run separately:
# Backend (port 4000)
cd backend && npm run dev

# Frontend (port 3000)
cd frontend && npm run dev
```

### 5. Access the Application

| Component | URL | Description |
|-----------|-----|-------------|
| 🖥️ **Frontend (Next.js)** | [http://localhost:3000](http://localhost:3000) | Full farmer dashboard with maps, triggers, payouts |
| ⚙️ **Backend API (Express)** | [http://localhost:4000/api](http://localhost:4000/api) | REST API endpoints for all data operations |
| ❤️ **Health Check** | [http://localhost:4000/api/health](http://localhost:4000/api/health) | Server health status |
| 🌾 **Dashboard** | [http://localhost:3000](http://localhost:3000) | Overview stats, crop summary, recent triggers |
| 🗺️ **Map View** | [http://localhost:3000/map](http://localhost:3000/map) | Interactive Leaflet map with all plots |
| 📋 **Plots** | [http://localhost:3000/plots](http://localhost:3000/plots) | All registered plots with insurance status |
| ⚡ **Triggers** | [http://localhost:3000/triggers](http://localhost:3000/triggers) | Trigger event history with severity filters |
| 💰 **Payouts** | [http://localhost:3000/payouts](http://localhost:3000/payouts) | Payout tracking with formula breakdown |
| 🎬 **Live Demo** | [http://localhost:3000/demo](http://localhost:3000/demo) | Interactive simulation for hackathon showcase |
| 🚀 **Landing** | [http://localhost:3000/landing](http://localhost:3000/landing) | Public marketing page |
| 📝 **Register** | [http://localhost:3000/register](http://localhost:3000/register) | Plot registration wizard with map |
| 🚶 **Journey** | [http://localhost:3000/journey](http://localhost:3000/journey) | End-to-end farmer journey walkthrough |
| 📖 **Storyboard** | [http://localhost:3000/storyboard](http://localhost:3000/storyboard) | Impact story and data flow visualization |
| 💻 **Tech Stack** | [http://localhost:3000/tech](http://localhost:3000/tech) | Interactive tech stack showcase |

> **💡 Quick Start**: Run `npm run dev` from root → Backend starts on `:4000`, Frontend on `:3000`

---

## 📊 API Endpoints

### Farmers & Plots
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/farmers` | Register new farmer |
| `GET` | `/api/farmers` | List all farmers |
| `GET` | `/api/farmers/:id` | Get farmer details |
| `POST` | `/api/plots` | Register new plot |
| `GET` | `/api/plots` | List all plots |
| `GET` | `/api/plots/:id` | Get plot with full data |

### Weather & Monitoring
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/weather/generate` | Generate synthetic weather data |
| `POST` | `/api/weather/monitor` | Run risk assessment on a plot |
| `GET` | `/api/weather/:plotId` | Get weather time series |

### Insurance & Payouts
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/insurance/create` | Create insurance policy |
| `GET` | `/api/insurance/:plotId` | Get policy for a plot |
| `GET` | `/api/insurance` | List all policies |
| `GET` | `/api/payouts` | List all payouts |
| `GET` | `/api/payouts/:id` | Get payout details |
| `PATCH` | `/api/payouts/:id/disburse` | Process payout disbursement |

### Phase 2 — Yield & Station Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/yield-history` | Yield summary across all plots |
| `GET` | `/api/yield-history/:plotId` | Historical yield with correlation analysis |
| `GET` | `/api/stations` | Weather stations with nearest backup lookup |
| `GET` | `/api/risk-trends` | Monthly composite risk trends |
| `GET` | `/api/crop-sensitivity` | Crop-specific sensitivity configurations |

### Satellite & Data Sources
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/satellite/search` | Search Sentinel-2 scenes via STAC API |
| `GET` | `/api/satellite/metadata/:plotId` | Satellite metadata for a plot |
| `POST` | `/api/weather/fetch-real` | Fetch real weather from Open-Meteo |
| `GET` | `/api/datasources` | List all data sources and their live status |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard/stats` | System statistics |
| `GET` | `/api/dashboard/recent-activity` | Recent triggers & payouts |
| `GET` | `/api/dashboard/map-data` | Plot locations with status |
| `GET` | `/api/dashboard/crop-summary` | Summary by crop type |

---

## 🌾 Supported Crops

| Crop | Min Rainfall (mm) | Sensitivity |
|------|-------------------|-------------|
| 🍚 Rice | 1000 | Rainfall-heavy (45% weight) |
| 🌾 Wheat | 500 | Balanced (40% rainfall, 30% soil moisture) |
| 🫘 Pulses | 400 | Rainfall-heavy (50% weight) |
| 🏵️ Cotton | 700 | NDVI-sensitive (40% weight) |
| 🍬 Sugarcane | 1500 | Balanced (40/30/30) |

---

## ⚡ Payout Formula

```
Composite Risk = (Rainfall Weight × Rainfall Deviation%) 
               + (NDVI Weight × NDVI Drop%) 
               + (Soil Moisture Weight × Soil Moisture Deficit%)

Payout = Sum Insured × Tier Multiplier
```

### Tier Slabs
| Severity | Deviation Range | Multiplier |
|----------|----------------|------------|
| 🟡 Minor | 0-30% | 25% of sum insured |
| 🟠 Moderate | 30-60% | 50% of sum insured |
| 🔴 Severe | 60%+ | 100% of sum insured |

---

## 🗂️ Project Structure

```
KshetraX/
├── backend/
│   ├── src/
│   │   ├── config/          # App configuration & crop sensitivity configs
│   │   ├── routes/          # API routes (plots, weather, insurance, dashboard, phase2, datasources)
│   │   ├── services/        # Core logic (payout engine, weather service, satellite service)
│   │   ├── prismaClient.ts  # Prisma client singleton
│   │   └── index.ts         # Express server entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema (8 models)
│   │   ├── seed.ts          # Demo data seeder (farmers, plots, weather, triggers)
│   │   └── seedYield.ts     # Historical yield data seeder (5 years × 12 plots)
│   ├── .env                 # Environment variables (SQLite for MVP)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   │   ├── page.tsx     # Dashboard (stats, map, crop summary)
│   │   │   ├── map/         # Interactive Leaflet map
│   │   │   ├── plots/       # Plot list + detail with charts
│   │   │   ├── triggers/    # Claims with severity filters
│   │   │   ├── payouts/     # Payout tracking & disbursement
│   │   │   ├── register/    # Plot registration wizard
│   │   │   ├── landing/     # Public landing page
│   │   │   ├── demo/        # Live simulation UI
│   │   │   ├── journey/     # Farmer journey walkthrough
│   │   │   ├── storyboard/  # Impact story
│   │   │   └── tech/        # Tech stack showcase
│   │   ├── components/      # Navigation + UI components (shadcn/ui)
│   │   └── lib/             # API client & utilities
│   ├── public/
│   └── package.json
└── README.md
```

---

## 🛰️ Data Sources & APIs

### Satellite Data
| Source | What it provides | Status |
|--------|-----------------|--------|
| [Sentinel-2 via Earth Search](https://earth-search.aws.element84.com/v1) | NDVI, vegetation health at 10m resolution | ✅ Live |
| [Planetary Computer STAC](https://planetarycomputer.microsoft.com/api/stac/v1) | Fallback Sentinel-2 source | ✅ Live |
| [Copernicus Data Space](https://dataspace.copernicus.eu/) | Satellite imagery archive | ✅ Available |

### Weather Data
| Source | What it provides | Status |
|--------|-----------------|--------|
| [Open-Meteo](https://open-meteo.com/) | Rainfall, temperature, soil moisture (free, no auth) | ✅ Live |
| [IMD Historical Normals](https://mausam.imd.gov.in/) | Seasonal rainfall/temperature baselines | ✅ Used |
| [OpenWeatherMap](https://openweathermap.org/) | Real-time weather (optional API key) | ⚙️ Optional |
| NASA SMAP via Open-Meteo | Soil moisture 0-7cm depth | ✅ Live |

### Libraries
| Library | Purpose |
|---------|--------|
| [Prisma](https://prisma.io/) | Database ORM (SQLite dev, PostgreSQL prod) |
| [Leaflet](https://leafletjs.com/) | Interactive maps with OpenStreetMap tiles |
| [STAC](https://stacspec.org/) | SpatioTemporal Asset Catalog protocol |
| [Express](https://expressjs.com/) | Backend API framework |
| [Chart.js](https://www.chartjs.org/) | Rainfall & yield charts |
| [shadcn/ui](https://ui.shadcn.com/) | UI component library |

---

## 🎬 Demo Workflow

1. **Open the Demo page** at http://localhost:3000/demo
2. **Select a plot** (e.g., "Rajesh Rice Field" — severe drought scenario)
3. **Choose a weather scenario**: Normal, Mild Deficit, Severe Drought, or Extreme Drought
4. **Click "Run Simulation"** and watch:
   - 🛰️ Satellite & weather data ingestion
   - 📊 Risk index computation
   - ⚡ Trigger detection
   - 💰 Instant payout calculation with full formula breakdown

---

## 🔒 Security Features

- **Rate Limiting**: 1500 requests per minute (relaxed for demo)
- **Helmet**: HTTP security headers (CSP, HSTS, X-Frame-Options)
- **CORS**: Dynamic origin whitelist (localhost, 127.0.0.1)
- **OWASP Headers**: X-Content-Type-Options, X-XSS-Protection, Permissions-Policy
- **Input Validation**: Zod schema validation (ready)

---

## 📊 Database Schema

The system uses 8 interconnected tables:

- `Farmer` — Farmer registration (name, phone, aadhaar, village, district, state)
- `Plot` — Plot details with GPS coordinates and linked weather station
- `Insurance` — Policy details with rainfall/NDVI/soil moisture thresholds
- `WeatherData` — Time series weather + NDVI + soil moisture data
- `Trigger` — Trigger events with plain-language explanations
- `Payout` — Payout records with full formula breakdown
- `RiskIndex` — Historical composite risk index per weather station
- `YieldHistory` — 5-year historical yield data per plot (for correlation analysis)

---

## 🎯 Future Enhancements

### ✅ Completed
- [x] Real STAC API integration for Sentinel-2 NDVI
- [x] Soil moisture data from SMAP via Open-Meteo
- [x] Multi-station weather redundancy (10 IMD stations)
- [x] Historical yield correlation analysis (5-year data)
- [x] Crop-specific sensitivity weights per crop type

### 🔜 Phase 3
- [ ] ML-based anomaly detection (scikit-learn)
- [ ] Mobile app for farmers (React Native)
- [ ] Blockchain-based payout verification
- [ ] WhatsApp notifications for triggers
- [ ] Multi-language support (Hindi, Tamil, Telugu)
- [ ] Stress testing with k6 (1000+ concurrent queries)
- [ ] OWASP ZAP security audit

---

## 🚀 Deployment

| Platform | Component | URL |
|----------|-----------|-----|
| **Railway** | Backend API | Deploy from GitHub → add PostgreSQL → set env vars |
| **Vercel** | Frontend | Deploy from GitHub → set `NEXT_PUBLIC_API_URL` |

> 📖 **Full step-by-step guide**: See [DEPLOY.md](DEPLOY.md) for detailed Railway + Vercel deployment instructions, environment variables, troubleshooting, and a Docker Compose alternative.

**Quick deploy**:
```bash
# 1. Push to GitHub
git push origin main

# 2. Deploy backend on Railway (add PostgreSQL, set DATABASE_URL)
# 3. Deploy frontend on Vercel (set NEXT_PUBLIC_API_URL to your Railway URL)
# 4. Update CORS_ORIGIN on Railway to your Vercel URL
```

---

## 👥 Team

Built with ❤️ for Indian farmers.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>🌾 KshetraX</strong> — Because every farmer deserves instant, transparent crop insurance.
</p>
