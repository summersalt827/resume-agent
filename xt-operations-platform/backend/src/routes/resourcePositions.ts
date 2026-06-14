import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const { category, status } = _req.query;
  let sql = 'SELECT * FROM resource_positions WHERE 1=1';
  const params: any[] = [];
  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (status) { sql += ' AND status = ?'; params.push(status); }
  sql += ' ORDER BY priority_base DESC';

  const rows = db.prepare(sql).all(...params);
  res.json({ success: true, data: rows });
});

router.get('/:id', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM resource_positions WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ success: false, error: 'Not found' });

  // Get associated configs count
  const configCount = db.prepare(
    'SELECT COUNT(*) as count FROM position_configs WHERE resource_position_id = ?'
  ).get(req.params.id) as any;

  res.json({ success: true, data: { ...(row as any), config_count: configCount.count } });
});

router.post('/', (req: Request, res: Response) => {
  const { code, name, category, priority_base, description, status: st } = req.body;
  if (!code || !name || !category) {
    return res.status(400).json({ success: false, error: 'code, name, category are required' });
  }

  const id = uuid();
  db.prepare(
    'INSERT INTO resource_positions (id, code, name, category, priority_base, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(id, code, name, category, priority_base || 340, description || '', st || 'online', new Date().toISOString());

  const row = db.prepare('SELECT * FROM resource_positions WHERE id = ?').get(id);
  res.status(201).json({ success: true, data: row });
});

router.put('/:id', (req: Request, res: Response) => {
  const existing = db.prepare('SELECT * FROM resource_positions WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Not found' });

  const { name, category, priority_base, description, status: st } = req.body;
  const ex = existing as any;

  db.prepare(
    'UPDATE resource_positions SET name=?, category=?, priority_base=?, description=?, status=? WHERE id=?'
  ).run(
    name || ex.name, category || ex.category,
    priority_base !== undefined ? priority_base : ex.priority_base,
    description !== undefined ? description : ex.description,
    st || ex.status, req.params.id
  );

  const row = db.prepare('SELECT * FROM resource_positions WHERE id = ?').get(req.params.id);
  res.json({ success: true, data: row });
});

router.get('/:id/analytics', (req: Request, res: Response) => {
  const positionId = req.params.id;
  const stats = db.prepare(`
    SELECT
      event_type,
      COUNT(*) as count
    FROM analytics_events
    WHERE position_id = ?
    GROUP BY event_type
  `).all(positionId) as any[];

  const result: any = { exposure: 0, click: 0, conversion: 0 };
  stats.forEach((s) => { result[s.event_type] = s.count; });
  result.ctr = result.exposure > 0 ? ((result.click / result.exposure) * 100).toFixed(2) : '0';
  result.cvr = result.click > 0 ? ((result.conversion / result.click) * 100).toFixed(2) : '0';

  res.json({ success: true, data: result });
});

export default router;
