import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db';
import { evaluate, getRuleChain } from '../services/ruleEngine';

const router = Router();

// List configs with joined data
router.get('/', (req: Request, res: Response) => {
  const { position_id, crowd_pack_id, status, search } = req.query;
  let sql = `
    SELECT
      pc.*,
      rp.name as position_name,
      rp.code as position_code,
      rp.category as position_category,
      cp.name as crowd_pack_name,
      m.name as material_name,
      m.type as material_type
    FROM position_configs pc
    LEFT JOIN resource_positions rp ON pc.resource_position_id = rp.id
    LEFT JOIN crowd_packs cp ON pc.crowd_pack_id = cp.id
    LEFT JOIN materials m ON pc.material_id = m.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (position_id) { sql += ' AND pc.resource_position_id = ?'; params.push(position_id); }
  if (crowd_pack_id) { sql += ' AND pc.crowd_pack_id = ?'; params.push(crowd_pack_id); }
  if (status) { sql += ' AND pc.status = ?'; params.push(status); }
  if (search) { sql += ' AND (rp.name LIKE ? OR cp.name LIKE ? OR m.name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  sql += ' ORDER BY pc.priority DESC, pc.created_at DESC';

  const rows = db.prepare(sql).all(...params);
  res.json({ success: true, data: rows });
});

// Get single config with full details
router.get('/:id', (req: Request, res: Response) => {
  const row = db.prepare(`
    SELECT
      pc.*,
      rp.name as position_name, rp.code as position_code, rp.category as position_category,
      cp.name as crowd_pack_name, cp.rules as crowd_pack_rules, cp.logic as crowd_pack_logic,
      m.name as material_name, m.type as material_type, m.content as material_content,
      m.file_url as material_file_url, m.fallback_url as material_fallback_url
    FROM position_configs pc
    LEFT JOIN resource_positions rp ON pc.resource_position_id = rp.id
    LEFT JOIN crowd_packs cp ON pc.crowd_pack_id = cp.id
    LEFT JOIN materials m ON pc.material_id = m.id
    WHERE pc.id = ?
  `).get(req.params.id);

  if (!row) return res.status(404).json({ success: false, error: 'Not found' });

  // Get schedules
  const schedules = db.prepare('SELECT * FROM schedules WHERE config_id = ?').all(req.params.id);

  // Get rule chain
  const ruleChain = db.prepare(
    'SELECT * FROM rule_chain WHERE config_id = ? ORDER BY step_order'
  ).all(req.params.id);

  res.json({ success: true, data: { ...(row as any), schedules, rule_chain: ruleChain } });
});

// Create config
router.post('/', (req: Request, res: Response) => {
  const {
    resource_position_id, crowd_pack_id, material_id, priority,
    start_time, end_time, channels, device_type, gray_ratio, ab_group,
    freq_limit_type, freq_limit_count, regions, region_type, status: st,
  } = req.body;

  if (!resource_position_id || !material_id) {
    return res.status(400).json({ success: false, error: 'resource_position_id and material_id are required' });
  }

  const id = uuid();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO position_configs (
      id, resource_position_id, crowd_pack_id, material_id, priority,
      start_time, end_time, channels, device_type, gray_ratio, ab_group,
      freq_limit_type, freq_limit_count, regions, region_type, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, resource_position_id, crowd_pack_id || null, material_id,
    priority || 340, start_time || '', end_time || '',
    JSON.stringify(channels || []), device_type || 'all', gray_ratio ?? 100, ab_group || '',
    freq_limit_type || 'none', freq_limit_count || 0,
    JSON.stringify(regions || []), region_type || 'whitelist',
    st || 'draft', now, now
  );

  // Create default rule chain
  const chain = getRuleChain();
  const insertRule = db.prepare(
    'INSERT INTO rule_chain (id, config_id, step_order, rule_type, enabled, params) VALUES (?, ?, ?, ?, ?, ?)'
  );
  chain.forEach((step) => {
    insertRule.run(uuid(), id, step.step, step.rule, 1, '{}');
  });

  const row = db.prepare(`
    SELECT pc.*, rp.name as position_name, cp.name as crowd_pack_name, m.name as material_name
    FROM position_configs pc
    LEFT JOIN resource_positions rp ON pc.resource_position_id = rp.id
    LEFT JOIN crowd_packs cp ON pc.crowd_pack_id = cp.id
    LEFT JOIN materials m ON pc.material_id = m.id
    WHERE pc.id = ?
  `).get(id);

  res.status(201).json({ success: true, data: row });
});

// Update config
router.put('/:id', (req: Request, res: Response) => {
  const existing = db.prepare('SELECT * FROM position_configs WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ success: false, error: 'Not found' });

  const now = new Date().toISOString();
  const fields = [
    'resource_position_id', 'crowd_pack_id', 'material_id', 'priority',
    'start_time', 'end_time', 'device_type', 'gray_ratio', 'ab_group',
    'freq_limit_type', 'freq_limit_count', 'region_type', 'status',
  ];

  const updates: string[] = [];
  const values: any[] = [];

  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      values.push(req.body[f]);
    }
  });

  if (req.body.channels !== undefined) {
    updates.push('channels = ?');
    values.push(JSON.stringify(req.body.channels));
  }
  if (req.body.regions !== undefined) {
    updates.push('regions = ?');
    values.push(JSON.stringify(req.body.regions));
  }

  updates.push('updated_at = ?');
  values.push(now);
  values.push(req.params.id);

  db.prepare(`UPDATE position_configs SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  const row = db.prepare(`
    SELECT pc.*, rp.name as position_name, cp.name as crowd_pack_name, m.name as material_name
    FROM position_configs pc
    LEFT JOIN resource_positions rp ON pc.resource_position_id = rp.id
    LEFT JOIN crowd_packs cp ON pc.crowd_pack_id = cp.id
    LEFT JOIN materials m ON pc.material_id = m.id
    WHERE pc.id = ?
  `).get(req.params.id);

  res.json({ success: true, data: row });
});

// Toggle online/offline
router.post('/:id/toggle', (req: Request, res: Response) => {
  const existing = db.prepare('SELECT * FROM position_configs WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ success: false, error: 'Not found' });

  const newStatus = existing.status === 'online' ? 'offline' : 'online';
  db.prepare('UPDATE position_configs SET status = ?, updated_at = ? WHERE id = ?')
    .run(newStatus, new Date().toISOString(), req.params.id);

  res.json({ success: true, data: { status: newStatus } });
});

// Duplicate config
router.post('/:id/duplicate', (req: Request, res: Response) => {
  const existing = db.prepare('SELECT * FROM position_configs WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ success: false, error: 'Not found' });

  const newId = uuid();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO position_configs (
      id, resource_position_id, crowd_pack_id, material_id, priority,
      start_time, end_time, channels, device_type, gray_ratio, ab_group,
      freq_limit_type, freq_limit_count, regions, region_type, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    newId, existing.resource_position_id, existing.crowd_pack_id, existing.material_id,
    existing.priority, existing.start_time, existing.end_time,
    existing.channels, existing.device_type, existing.gray_ratio, existing.ab_group,
    existing.freq_limit_type, existing.freq_limit_count,
    existing.regions, existing.region_type, 'draft', now, now
  );

  // Copy rule chain
  const rules = db.prepare('SELECT * FROM rule_chain WHERE config_id = ?').all(req.params.id) as any[];
  const insertRule = db.prepare(
    'INSERT INTO rule_chain (id, config_id, step_order, rule_type, enabled, params) VALUES (?, ?, ?, ?, ?, ?)'
  );
  rules.forEach((r) => insertRule.run(uuid(), newId, r.step_order, r.rule_type, r.enabled, r.params));

  const row = db.prepare(`
    SELECT pc.*, rp.name as position_name, cp.name as crowd_pack_name, m.name as material_name
    FROM position_configs pc
    LEFT JOIN resource_positions rp ON pc.resource_position_id = rp.id
    LEFT JOIN crowd_packs cp ON pc.crowd_pack_id = cp.id
    LEFT JOIN materials m ON pc.material_id = m.id
    WHERE pc.id = ?
  `).get(newId);

  res.status(201).json({ success: true, data: row });
});

// Preview: simulate rule engine evaluation
router.post('/:id/preview', (req: Request, res: Response) => {
  const config = db.prepare(`
    SELECT pc.*, rp.name as position_name, cp.name as crowd_pack_name, m.name as material_name
    FROM position_configs pc
    LEFT JOIN resource_positions rp ON pc.resource_position_id = rp.id
    LEFT JOIN crowd_packs cp ON pc.crowd_pack_id = cp.id
    LEFT JOIN materials m ON pc.material_id = m.id
    WHERE pc.id = ?
  `).get(req.params.id) as any;

  if (!config) return res.status(404).json({ success: false, error: 'Not found' });

  const { userId, deviceType, region, channel, crowdTags, abGroup, freqCount } = req.body;

  const result = evaluate({
    config,
    user: {
      userId: userId || 'test-user-001',
      deviceType: deviceType || 'ios',
      region: region || 'CN',
      channel: channel || 'app',
      crowdTags: crowdTags || [],
      abGroup: abGroup || 'A',
      freqCount: freqCount || 0,
    },
    now: new Date(),
  });

  res.json({ success: true, data: result });
});

export default router;
