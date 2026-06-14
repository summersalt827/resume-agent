import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db';
import * as analyticsService from '../services/analyticsService';

const router = Router();

// Overview dashboard
router.get('/overview', (req: Request, res: Response) => {
  const { timeRange } = req.query;
  const data = analyticsService.getOverview((timeRange as string) || 'today');
  res.json({ success: true, data });
});

// Position analytics with daily series
router.get('/positions/:id', (req: Request, res: Response) => {
  const { timeRange } = req.query;
  const data = analyticsService.getPositionAnalytics(req.params.id, (timeRange as string) || '7d');
  res.json({ success: true, data });
});

// Config analytics
router.get('/configs/:id', (req: Request, res: Response) => {
  const data = analyticsService.getConfigAnalytics(req.params.id);
  res.json({ success: true, data });
});

// Record analytics event (called by client SDK)
router.post('/events', (req: Request, res: Response) => {
  const { config_id, position_id, event_type, user_id, device_info } = req.body;
  if (!position_id || !event_type) {
    return res.status(400).json({ success: false, error: 'position_id and event_type are required' });
  }

  const id = uuid();
  db.prepare(
    'INSERT INTO analytics_events (id, config_id, position_id, event_type, user_id, device_info) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, config_id || '', position_id, event_type, user_id || '', JSON.stringify(device_info || {}));

  res.status(201).json({ success: true, data: { id } });
});

// Batch record events
router.post('/events/batch', (req: Request, res: Response) => {
  const { events } = req.body;
  if (!events || !Array.isArray(events)) {
    return res.status(400).json({ success: false, error: 'events array is required' });
  }

  const insert = db.prepare(
    'INSERT INTO analytics_events (id, config_id, position_id, event_type, user_id, device_info) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const insertMany = db.transaction((items: any[]) => {
    for (const e of items) {
      insert.run(uuid(), e.config_id || '', e.position_id, e.event_type, e.user_id || '', JSON.stringify(e.device_info || {}));
    }
  });

  insertMany(events);
  res.status(201).json({ success: true, data: { count: events.length } });
});

export default router;
