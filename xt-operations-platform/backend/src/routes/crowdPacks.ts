import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db';

const router = Router();

// List all crowd packs
router.get('/', (_req: Request, res: Response) => {
  const { search, status } = _req.query;
  let sql = 'SELECT * FROM crowd_packs WHERE 1=1';
  const params: any[] = [];

  if (search) {
    sql += ' AND name LIKE ?';
    params.push(`%${search}%`);
  }
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  sql += ' ORDER BY created_at DESC';

  const rows = db.prepare(sql).all(...params);
  res.json({ success: true, data: rows });
});

// Get single crowd pack
router.get('/:id', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM crowd_packs WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: row });
});

// Create crowd pack
router.post('/', (req: Request, res: Response) => {
  const { name, description, rules, logic, status: st } = req.body;
  if (!name) return res.status(400).json({ success: false, error: 'Name is required' });

  const id = uuid();
  const now = new Date().toISOString();
  const rulesStr = JSON.stringify(rules || []);
  const logicStr = logic || 'AND';
  const statusVal = st || 'active';
  const userCount = Math.floor(Math.random() * 50000) + 1000; // Simulated count

  db.prepare(
    'INSERT INTO crowd_packs (id, name, description, rules, logic, status, user_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(id, name, description || '', rulesStr, logicStr, statusVal, userCount, now, now);

  const row = db.prepare('SELECT * FROM crowd_packs WHERE id = ?').get(id);
  res.status(201).json({ success: true, data: row });
});

// Update crowd pack
router.put('/:id', (req: Request, res: Response) => {
  const existing = db.prepare('SELECT * FROM crowd_packs WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Not found' });

  const { name, description, rules, logic, status: st } = req.body;
  const now = new Date().toISOString();

  db.prepare(
    `UPDATE crowd_packs SET name=?, description=?, rules=?, logic=?, status=?, updated_at=? WHERE id=?`
  ).run(
    name || (existing as any).name,
    description !== undefined ? description : (existing as any).description,
    rules ? JSON.stringify(rules) : (existing as any).rules,
    logic || (existing as any).logic,
    st || (existing as any).status,
    now,
    req.params.id
  );

  const row = db.prepare('SELECT * FROM crowd_packs WHERE id = ?').get(req.params.id);
  res.json({ success: true, data: row });
});

// Delete crowd pack
router.delete('/:id', (req: Request, res: Response) => {
  const existing = db.prepare('SELECT * FROM crowd_packs WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Not found' });
  db.prepare('DELETE FROM crowd_packs WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Preview estimated user count
router.get('/:id/preview-count', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM crowd_packs WHERE id = ?').get(req.params.id) as any;
  if (!row) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: { estimated_count: row.user_count } });
});

export default router;
