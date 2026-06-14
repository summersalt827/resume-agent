import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db';

const router = Router();

// List with full filter/sort
router.get('/', (req: Request, res: Response) => {
  const { type, status, category_id, search, sort, page, pageSize } = req.query;
  let sql = `
    SELECT m.*, mc.name as category_name
    FROM materials m
    LEFT JOIN material_categories mc ON m.category_id = mc.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (type) { sql += ' AND m.type = ?'; params.push(type); }
  if (status) { sql += ' AND m.status = ?'; params.push(status); }
  if (category_id) { sql += ' AND m.category_id = ?'; params.push(category_id); }
  if (search) { sql += ' AND (m.name LIKE ? OR m.tags LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  const sortMap: Record<string, string> = {
    newest: 'm.created_at DESC',
    oldest: 'm.created_at ASC',
    name: 'm.name ASC',
    size: 'm.file_size DESC',
  };
  sql += ` ORDER BY ${sortMap[sort as string] || 'm.created_at DESC'}`;

  const p = parseInt(page as string) || 1;
  const ps = parseInt(pageSize as string) || 20;
  sql += ` LIMIT ? OFFSET ?`;
  params.push(ps, (p - 1) * ps);

  const rows = db.prepare(sql).all(...params);
  const total = (db.prepare('SELECT COUNT(*) as count FROM materials').get() as any).count;

  res.json({ success: true, data: rows, total, page: p, pageSize: ps });
});

// Get by ID with usage info
router.get('/:id', (req: Request, res: Response) => {
  const row = db.prepare(`
    SELECT m.*, mc.name as category_name
    FROM materials m
    LEFT JOIN material_categories mc ON m.category_id = mc.id
    WHERE m.id = ?
  `).get(req.params.id) as any;

  if (!row) return res.status(404).json({ success: false, error: 'Not found' });

  // Get usage: which configs use this material
  const usage = db.prepare(`
    SELECT pc.id, pc.status, rp.name as position_name, rp.code as position_code,
           cp.name as crowd_pack_name
    FROM position_configs pc
    JOIN resource_positions rp ON pc.resource_position_id = rp.id
    LEFT JOIN crowd_packs cp ON pc.crowd_pack_id = cp.id
    WHERE pc.material_id = ?
    ORDER BY pc.created_at DESC
  `).all(req.params.id);

  // Get analytics for this material
  const stats = db.prepare(`
    SELECT event_type, COUNT(*) as count
    FROM analytics_events WHERE config_id IN (
      SELECT id FROM position_configs WHERE material_id = ?
    )
    GROUP BY event_type
  `).all(req.params.id) as any[];

  const analytics: any = { exposure: 0, click: 0, conversion: 0 };
  stats.forEach((s: any) => { analytics[s.event_type] = s.count; });
  analytics.ctr = analytics.exposure > 0 ? ((analytics.click / analytics.exposure) * 100).toFixed(2) : '0';

  res.json({ success: true, data: { ...row, usage, analytics } });
});

// Create material
router.post('/', (req: Request, res: Response) => {
  const { name, type, category_id, tags, content, file_url, fallback_url, file_size, dimensions, status } = req.body;
  if (!name) return res.status(400).json({ success: false, error: 'Name is required' });

  const id = uuid();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO materials (id, name, type, category_id, tags, content, file_url,
      fallback_url, file_size, dimensions, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, name, type || 'image', category_id || null,
    JSON.stringify(tags || []), JSON.stringify(content || {}),
    file_url || '', fallback_url || '', file_size || 0,
    dimensions || '', status || 'draft', now, now
  );

  const row = db.prepare('SELECT * FROM materials WHERE id = ?').get(id);
  res.status(201).json({ success: true, data: row });
});

// Update material
router.put('/:id', (req: Request, res: Response) => {
  const existing = db.prepare('SELECT * FROM materials WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Not found' });

  const now = new Date().toISOString();
  const ex = existing as any;
  const fields: Record<string, any> = {
    name: req.body.name, type: req.body.type, category_id: req.body.category_id,
    file_url: req.body.file_url, fallback_url: req.body.fallback_url,
    file_size: req.body.file_size, dimensions: req.body.dimensions,
    status: req.body.status, reviewer: req.body.reviewer, review_comment: req.body.review_comment,
  };

  const updates: string[] = [];
  const values: any[] = [];

  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined) { updates.push(`${k} = ?`); values.push(v); }
  });

  if (req.body.tags !== undefined) { updates.push('tags = ?'); values.push(JSON.stringify(req.body.tags)); }
  if (req.body.content !== undefined) { updates.push('content = ?'); values.push(JSON.stringify(req.body.content)); }

  if (updates.length === 0) {
    return res.json({ success: true, data: existing });
  }

  updates.push('updated_at = ?');
  values.push(now);
  values.push(req.params.id);

  db.prepare(`UPDATE materials SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  const row = db.prepare(`
    SELECT m.*, mc.name as category_name
    FROM materials m LEFT JOIN material_categories mc ON m.category_id = mc.id
    WHERE m.id = ?
  `).get(req.params.id);

  res.json({ success: true, data: row });
});

// Delete
router.delete('/:id', (req: Request, res: Response) => {
  const usage = db.prepare('SELECT COUNT(*) as count FROM position_configs WHERE material_id = ?').get(req.params.id) as any;
  if (usage.count > 0) {
    return res.status(400).json({ success: false, error: `素材被 ${usage.count} 个配置引用，无法删除` });
  }
  const existing = db.prepare('SELECT * FROM materials WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Not found' });
  db.prepare('DELETE FROM materials WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Duplicate
router.post('/:id/duplicate', (req: Request, res: Response) => {
  const existing = db.prepare('SELECT * FROM materials WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ success: false, error: 'Not found' });

  const newId = uuid();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO materials (id, name, type, category_id, tags, content, file_url,
      fallback_url, file_size, dimensions, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(newId, `${existing.name} (副本)`, existing.type, existing.category_id,
    existing.tags, existing.content, existing.file_url, existing.fallback_url,
    existing.file_size, existing.dimensions, 'draft', now, now);

  const row = db.prepare('SELECT * FROM materials WHERE id = ?').get(newId);
  res.status(201).json({ success: true, data: row });
});

// Batch status change
router.post('/batch/status', (req: Request, res: Response) => {
  const { ids, status } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, error: 'ids array required' });
  }
  if (!['draft', 'review', 'online', 'offline', 'expired'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }

  const now = new Date().toISOString();
  const update = db.prepare('UPDATE materials SET status = ?, updated_at = ? WHERE id = ?');
  const batch = db.transaction(() => {
    ids.forEach((id: string) => update.run(status, now, id));
  });
  batch();

  res.json({ success: true, data: { updated: ids.length, status } });
});

// Get usage stats for all materials
router.get('/stats/usage', (_req: Request, res: Response) => {
  const stats = db.prepare(`
    SELECT m.id, m.name, m.type, m.status,
           COUNT(pc.id) as config_count,
           SUM(CASE WHEN pc.status = 'online' THEN 1 ELSE 0 END) as online_count
    FROM materials m
    LEFT JOIN position_configs pc ON pc.material_id = m.id
    GROUP BY m.id
    ORDER BY config_count DESC
  `).all() as any[];

  res.json({ success: true, data: stats });
});

// ─── Categories ───

// List categories
router.get('/categories/all', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM material_categories ORDER BY sort_order').all();
  res.json({ success: true, data: rows });
});

// Create category
router.post('/categories', (req: Request, res: Response) => {
  const { name, description, sort_order } = req.body;
  if (!name) return res.status(400).json({ success: false, error: 'Name is required' });

  const id = uuid();
  db.prepare('INSERT INTO material_categories (id, name, description, sort_order) VALUES (?, ?, ?, ?)')
    .run(id, name, description || '', sort_order || 0);

  const row = db.prepare('SELECT * FROM material_categories WHERE id = ?').get(id);
  res.status(201).json({ success: true, data: row });
});

// Update category
router.put('/categories/:id', (req: Request, res: Response) => {
  const { name, description, sort_order } = req.body;
  db.prepare('UPDATE material_categories SET name=?, description=?, sort_order=? WHERE id=?')
    .run(name, description || '', sort_order || 0, req.params.id);
  const row = db.prepare('SELECT * FROM material_categories WHERE id = ?').get(req.params.id);
  res.json({ success: true, data: row });
});

// Delete category
router.delete('/categories/:id', (req: Request, res: Response) => {
  db.prepare('UPDATE materials SET category_id = NULL WHERE category_id = ?').run(req.params.id);
  db.prepare('DELETE FROM material_categories WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
