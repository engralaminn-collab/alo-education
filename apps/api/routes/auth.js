import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'alo-education-jwt-secret-change-in-production';
const JWT_EXPIRES = '30d';

// ─── Middleware: extract user from token ────────────────────────
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch {
    req.user = null;
  }
  next();
}

// Require authentication
export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// ─── POST /api/auth/register ────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, role = 'student', phone = '' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const id = uuid();
    const password_hash = await bcrypt.hash(password, 12);

    db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, role, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, email.toLowerCase(), password_hash, full_name || '', role, phone);

    const token = jwt.sign(
      { id, email: email.toLowerCase(), full_name: full_name || '', role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.status(201).json({
      id,
      email: email.toLowerCase(),
      full_name: full_name || '',
      role,
      token,
    });
  } catch (err) {
    console.error('[Auth] Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ─── POST /api/auth/login ───────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      phone: user.phone,
      token,
    });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ─── GET /api/auth/me ───────────────────────────────────────────
router.get('/me', verifyToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const db = getDb();
  const user = db.prepare('SELECT id, email, full_name, role, phone, avatar_url, created_at FROM users WHERE id = ?').get(req.user.id);

  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  res.json(user);
});

// ─── PUT /api/auth/me ───────────────────────────────────────────
router.put('/me', verifyToken, requireAuth, (req, res) => {
  const { full_name, phone, avatar_url } = req.body;
  const db = getDb();

  db.prepare(`
    UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone),
    avatar_url = COALESCE(?, avatar_url), updated_at = datetime('now')
    WHERE id = ?
  `).run(full_name, phone, avatar_url, req.user.id);

  const user = db.prepare('SELECT id, email, full_name, role, phone, avatar_url FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// ─── POST /api/auth/logout ──────────────────────────────────────
router.post('/logout', (_req, res) => {
  res.json({ success: true });
});

export { router as authRouter };
