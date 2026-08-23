/**
 * KshetraX Backend Server
 * 
 * Parametric Crop Insurance - Satellite Payout Engine
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';
import { config } from './config';
import prisma from './prismaClient';

// Routes
import plotsRouter from './routes/plots';
import weatherRouter from './routes/weather';
import insuranceRouter from './routes/insurance';
import dashboardRouter from './routes/dashboard';
import phase2Router from './routes/phase2';
import datasourcesRouter from './routes/datasources';

const app = express();

// ─── Middleware ───────────────────────────────────────────

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http://tile.openstreetmap.org"],
      connectSrc: ["'self'", "http://localhost:4000"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, server-to-server)
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      config.corsOrigin,
    ];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // In development, allow all origins
    if (config.nodeEnv === 'development') {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// OWASP: Disable X-Powered-By
app.disable('x-powered-by');

// OWASP: Additional security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Rate limiting (relaxed for demo/stress testing)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1500, // 1500 requests per minute for demo
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  skip: (req) => req.path === '/api/health', // exempt health check
});
app.use('/api/', limiter);

// ─── Routes ──────────────────────────────────────────────

app.use('/api', plotsRouter);
app.use('/api', weatherRouter);
app.use('/api', insuranceRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api', phase2Router);
app.use('/api', datasourcesRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'KshetraX Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── Error Handling ──────────────────────────────────────

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : undefined,
  });
});

// ─── Scheduled Jobs ──────────────────────────────────────

// Run monitoring check every hour during active hours
cron.schedule('0 * * * *', async () => {
  console.log('⏰ Running scheduled weather monitoring check...');
  try {
    const activePolicies = await prisma.insurance.findMany({
      where: { status: 'active' },
      include: { plot: true },
    });
    console.log(`📊 Found ${activePolicies.length} active policies to check`);
    // In production, this would fetch real weather data and check triggers
  } catch (error) {
    console.error('Scheduled monitoring error:', error);
  }
});

// ─── Server Start ────────────────────────────────────────

async function start() {
  try {
    // Connect to database
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(config.port, () => {
      console.log(`
🌾 ╔═══════════════════════════════════════════════════╗
   ║             KshetraX Backend Server                ║
   ║     Parametric Crop Insurance Engine               ║
   ╠═══════════════════════════════════════════════════╣
   ║  🌐 Server:  http://localhost:${config.port}              ║
   ║  📊 API:     http://localhost:${config.port}/api            ║
   ║  ❤️  Health:  http://localhost:${config.port}/api/health     ║
   ╚═══════════════════════════════════════════════════╝ 🌾
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
