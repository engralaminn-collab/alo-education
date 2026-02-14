import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb, ensureEntityTable } from '../db.js';
import { verifyToken } from './auth.js';

const router = Router();

// Apply auth middleware to all entity routes
router.use(verifyToken);

/**
 * Generic CRUD handler for any entity.
 * Routes:
 *   GET    /api/:entity        → list / filter
 *   GET    /api/:entity/:id    → get by id
 *   POST   /api/:entity        → create
 *   PUT    /api/:entity/:id    → update
 *   DELETE /api/:entity/:id    → delete
 */

// ─── LIST / FILTER ──────────────────────────────────────────────
router.get('/:entity', (req, res) => {
  try {
    const tableName = ensureEntityTable(req.params.entity);
    const db = getDb();

    const { sort, limit, ...filters } = req.query;

    let sql = `SELECT id, data, created_by, created_at, updated_at FROM "entity_${tableName}"`;
    const params = [];
    const conditions = [];

    // Apply filters on JSON data fields
    for (const [key, value] of Object.entries(filters)) {
      if (key === 'sort' || key === 'limit') continue;
      conditions.push(`json_extract(data, '$.${key}') = ?`);
      params.push(value);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    // Sort
    if (sort) {
      const sortDir = sort.startsWith('-') ? 'DESC' : 'ASC';
      const sortField = sort.replace(/^-/, '');
      if (sortField === 'created_at' || sortField === 'updated_at') {
        sql += ` ORDER BY ${sortField} ${sortDir}`;
      } else {
        sql += ` ORDER BY json_extract(data, '$.${sortField}') ${sortDir}`;
      }
    } else {
      sql += ' ORDER BY created_at DESC';
    }

    // Limit
    if (limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(limit, 10));
    }

    const rows = db.prepare(sql).all(...params);

    const results = rows.map(row => ({
      id: row.id,
      ...JSON.parse(row.data),
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    res.json(results);
  } catch (err) {
    console.error(`[Entities] GET /${req.params.entity} error:`, err);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET BY ID ──────────────────────────────────────────────────
router.get('/:entity/:id', (req, res) => {
  try {
    const tableName = ensureEntityTable(req.params.entity);
    const db = getDb();

    const row = db.prepare(
      `SELECT id, data, created_by, created_at, updated_at FROM "entity_${tableName}" WHERE id = ?`
    ).get(req.params.id);

    if (!row) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json({
      id: row.id,
      ...JSON.parse(row.data),
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
    });
  } catch (err) {
    console.error(`[Entities] GET /${req.params.entity}/${req.params.id} error:`, err);
    res.status(500).json({ error: err.message });
  }
});

// ─── CREATE ─────────────────────────────────────────────────────
router.post('/:entity', (req, res) => {
  try {
    const tableName = ensureEntityTable(req.params.entity);
    const db = getDb();

    const id = req.body.id || uuid();
    const createdBy = req.user?.id || null;

    // Remove id from data if present
    const { id: _id, ...data } = req.body;

    db.prepare(
      `INSERT INTO "entity_${tableName}" (id, data, created_by) VALUES (?, ?, ?)`
    ).run(id, JSON.stringify(data), createdBy);

    res.status(201).json({
      id,
      ...data,
      created_by: createdBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`[Entities] POST /${req.params.entity} error:`, err);
    res.status(500).json({ error: err.message });
  }
});

// ─── UPDATE ─────────────────────────────────────────────────────
router.put('/:entity/:id', (req, res) => {
  try {
    const tableName = ensureEntityTable(req.params.entity);
    const db = getDb();

    const existing = db.prepare(
      `SELECT data FROM "entity_${tableName}" WHERE id = ?`
    ).get(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: 'Not found' });
    }

    const oldData = JSON.parse(existing.data);
    const { id: _id, ...newData } = req.body;
    const merged = { ...oldData, ...newData };

    db.prepare(
      `UPDATE "entity_${tableName}" SET data = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(JSON.stringify(merged), req.params.id);

    res.json({
      id: req.params.id,
      ...merged,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`[Entities] PUT /${req.params.entity}/${req.params.id} error:`, err);
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE ─────────────────────────────────────────────────────
router.delete('/:entity/:id', (req, res) => {
  try {
    const tableName = ensureEntityTable(req.params.entity);
    const db = getDb();

    const result = db.prepare(
      `DELETE FROM "entity_${tableName}" WHERE id = ?`
    ).run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.status(204).end();
  } catch (err) {
    console.error(`[Entities] DELETE /${req.params.entity}/${req.params.id} error:`, err);
    res.status(500).json({ error: err.message });
  }
});

export { router as entitiesRouter };
