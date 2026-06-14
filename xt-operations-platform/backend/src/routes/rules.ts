import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db';
import { getRuleChain } from '../services/ruleEngine';

const router = Router();

// Get rule chain for a config
router.get('/config/:configId', (req: Request, res: Response) => {
  const rows = db.prepare(
    'SELECT * FROM rule_chain WHERE config_id = ? ORDER BY step_order'
  ).all(req.params.configId);
  res.json({ success: true, data: rows });
});

// Update rule chain step
router.put('/:id', (req: Request, res: Response) => {
  const existing = db.prepare('SELECT * FROM rule_chain WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Not found' });

  const { enabled, params } = req.body;
  db.prepare('UPDATE rule_chain SET enabled = ?, params = ? WHERE id = ?').run(
    enabled !== undefined ? enabled : (existing as any).enabled,
    params ? JSON.stringify(params) : (existing as any).params,
    req.params.id
  );

  const row = db.prepare('SELECT * FROM rule_chain WHERE id = ?').get(req.params.id);
  res.json({ success: true, data: row });
});

// Get default rule chain template
router.get('/template/default', (_req: Request, res: Response) => {
  res.json({ success: true, data: getRuleChain() });
});

// Reset rule chain to default for a config
router.post('/config/:configId/reset', (req: Request, res: Response) => {
  db.prepare('DELETE FROM rule_chain WHERE config_id = ?').run(req.params.configId);

  const chain = getRuleChain();
  const insert = db.prepare(
    'INSERT INTO rule_chain (id, config_id, step_order, rule_type, enabled, params) VALUES (?, ?, ?, ?, ?, ?)'
  );
  chain.forEach((step) => insert.run(uuid(), req.params.configId, step.step, step.rule, 1, '{}'));

  const rows = db.prepare(
    'SELECT * FROM rule_chain WHERE config_id = ? ORDER BY step_order'
  ).all(req.params.configId);
  res.json({ success: true, data: rows });
});

export default router;
