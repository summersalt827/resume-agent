import { Router, Request, Response } from 'express';
import db from '../db';
import { evaluate } from '../services/ruleEngine';

const router = Router();

// Client delivery: get all active position configs
router.get('/positions', (req: Request, res: Response) => {
  const configs = db.prepare(`
    SELECT
      pc.*,
      rp.code as position_code,
      rp.name as position_name,
      rp.category as position_category,
      m.name as material_name,
      m.type as material_type,
      m.content as material_content,
      m.file_url as material_file_url,
      m.fallback_url as material_fallback_url
    FROM position_configs pc
    JOIN resource_positions rp ON pc.resource_position_id = rp.id
    JOIN materials m ON pc.material_id = m.id
    WHERE pc.status = 'online' AND rp.status = 'online'
    ORDER BY pc.priority DESC
  `).all();

  // Group by position code
  const grouped: Record<string, any[]> = {};
  (configs as any[]).forEach((c) => {
    const code = c.position_code;
    if (!grouped[code]) grouped[code] = [];
    grouped[code].push({
      id: c.id,
      priority: c.priority,
      material: {
        name: c.material_name,
        type: c.material_type,
        content: JSON.parse(c.material_content || '{}'),
        file_url: c.material_file_url,
        fallback_url: c.material_fallback_url,
      },
      device_type: c.device_type,
      gray_ratio: c.gray_ratio,
      ab_group: c.ab_group,
      channels: JSON.parse(c.channels || '[]'),
      regions: JSON.parse(c.regions || '[]'),
      region_type: c.region_type,
      start_time: c.start_time,
      end_time: c.end_time,
      freq_limit_type: c.freq_limit_type,
      freq_limit_count: c.freq_limit_count,
    });
  });

  res.json({ success: true, data: grouped });
});

// Match: simulate a user request against all configs
router.post('/match', (req: Request, res: Response) => {
  const {
    userId, deviceType, region, channel, crowdTags, abGroup, freqCount, positionCode,
  } = req.body;

  const user = {
    userId: userId || `user-${Math.random().toString(36).slice(2, 8)}`,
    deviceType: deviceType || 'ios',
    region: region || 'CN',
    channel: channel || 'app',
    crowdTags: crowdTags || [],
    abGroup: abGroup || 'A',
    freqCount: freqCount || 0,
  };

  let configQuery = `
    SELECT pc.*, rp.code as position_code, rp.name as position_name,
           m.name as material_name, m.type as material_type, m.content as material_content,
           m.file_url as material_file_url
    FROM position_configs pc
    JOIN resource_positions rp ON pc.resource_position_id = rp.id
    JOIN materials m ON pc.material_id = m.id
    WHERE pc.status = 'online' AND rp.status = 'online'
  `;
  const params: any[] = [];

  if (positionCode) {
    configQuery += ' AND rp.code = ?';
    params.push(positionCode);
  }

  configQuery += ' ORDER BY pc.priority DESC';

  const configs = db.prepare(configQuery).all(...params) as any[];

  const results = configs.map((config) => {
    const result = evaluate({ config, user, now: new Date() });
    return {
      config_id: config.id,
      position_code: config.position_code,
      position_name: config.position_name,
      material_name: config.material_name,
      priority: config.priority,
      ...result,
    };
  });

  // Return only passed configs, sorted by priority, highest first
  const matched = results
    .filter((r) => r.passed)
    .sort((a, b) => b.priority - a.priority);

  res.json({
    success: true,
    data: {
      user,
      total_configs: results.length,
      matched_count: matched.length,
      results,
      matched,
    },
  });
});

export default router;
