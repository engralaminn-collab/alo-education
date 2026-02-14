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
  res.json({
    response: 'AI integration is not yet configured. Please set up an AI provider.',
    model: 'stub',
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
