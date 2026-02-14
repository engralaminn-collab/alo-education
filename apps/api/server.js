import express from 'express';
import cors from 'cors';
import { authRouter, verifyToken } from './routes/auth.js';
import { entitiesRouter } from './routes/entities.js';
import { initDb } from './db.js';

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ──────────────────────────────────────────────────
app.use(cors({
  origin: [
    'https://aloeducation.co.uk',
    'https://www.aloeducation.co.uk',
    'https://crm.aloeducation.co.uk',
    'http://localhost:5173',
    'http://localhost:5174',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));

// ─── Health check ───────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Auth routes ────────────────────────────────────────────────
app.use('/api/auth', authRouter);

// ─── App logs (no-op for now) ───────────────────────────────────
app.post('/api/app-logs', (_req, res) => {
  res.json({ ok: true });
});

// ─── AI invoke (stub) ──────────────────────────────────────────
app.post('/api/ai/invoke', verifyToken, (req, res) => {
  const { function_name, payload } = req.body;
  console.log('[AI] Invoking function:', function_name, 'with payload:', payload);
  
  // Return mock analytics data
  res.json({
    success: true,
    data: {
      insights: [
        { type: 'conversion_rate', value: 42, trend: 'up', message: 'Application conversion rate improved by 12%' },
        { type: 'response_time', value: 24, trend: 'down', message: 'Average response time: 24 hours' },
        { type: 'enrollment', value: 156, trend: 'up', message: '156 students enrolled this quarter' }
      ],
      recommendations: [
        'Focus on timely follow-ups to maintain high conversion rates',
        'Consider expanding partnerships with top-performing universities',
        'Increase marketing efforts in high-performing regions'
      ],
      predictions: {
        next_month_applications: 245,
        conversion_probability: 0.38,
        revenue_forecast: 125000
      }
    },
    model: 'stub',
    message: 'AI integration is not yet configured. This is mock data.'
  });
});

// ─── Email send (stub) ─────────────────────────────────────────
app.post('/api/email/send', verifyToken, (req, res) => {
  console.log('[Email] Would send:', req.body);
  res.json({ success: true, message: 'Email queued (stub)' });
});

// ─── Dynamic entity CRUD routes ────────────────────────────────
app.use('/api', entitiesRouter);

// ─── 404 fallback ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Error handler ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// ─── Start server ──────────────────────────────────────────────
initDb();
app.listen(PORT, '0.0.0.0', () => {
  console.log(`ALO Education API running on port ${PORT}`);
});
