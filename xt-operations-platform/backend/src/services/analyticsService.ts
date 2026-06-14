import db from '../db';

export function getOverview(timeRange: string = 'today') {
  let dateFilter = '';
  if (timeRange === 'today') {
    dateFilter = "date(created_at) = date('now')";
  } else if (timeRange === 'yesterday') {
    dateFilter = "date(created_at) = date('now', '-1 day')";
  } else if (timeRange === '7d') {
    dateFilter = "created_at >= datetime('now', '-7 days')";
  } else if (timeRange === '30d') {
    dateFilter = "created_at >= datetime('now', '-30 days')";
  }

  const whereClause = dateFilter ? `WHERE ${dateFilter}` : '';

  const eventCounts = db.prepare(`
    SELECT event_type, COUNT(*) as count
    FROM analytics_events
    ${whereClause}
    GROUP BY event_type
  `).all() as any[];

  const configCount = db.prepare('SELECT COUNT(*) as count FROM position_configs').get() as any;
  const onlineCount = db.prepare("SELECT COUNT(*) as count FROM position_configs WHERE status='online'").get() as any;
  const positionCount = db.prepare('SELECT COUNT(*) as count FROM resource_positions').get() as any;
  const crowdPackCount = db.prepare('SELECT COUNT(*) as count FROM crowd_packs').get() as any;
  const materialCount = db.prepare('SELECT COUNT(*) as count FROM materials').get() as any;

  const result: any = {
    total_exposures: 0,
    total_clicks: 0,
    total_conversions: 0,
    ctr: '0',
    cvr: '0',
    total_configs: configCount.count,
    online_configs: onlineCount.count,
    total_positions: positionCount.count,
    total_crowd_packs: crowdPackCount.count,
    total_materials: materialCount.count,
  };

  eventCounts.forEach((e) => {
    if (e.event_type === 'exposure') result.total_exposures = e.count;
    if (e.event_type === 'click') result.total_clicks = e.count;
    if (e.event_type === 'conversion') result.total_conversions = e.count;
  });

  result.ctr = result.total_exposures > 0
    ? ((result.total_clicks / result.total_exposures) * 100).toFixed(2)
    : '0';
  result.cvr = result.total_clicks > 0
    ? ((result.total_conversions / result.total_clicks) * 100).toFixed(2)
    : '0';

  return result;
}

export function getPositionAnalytics(positionId: string, timeRange: string = '7d') {
  let dateFilter = '';
  if (timeRange === '7d') {
    dateFilter = "AND created_at >= datetime('now', '-7 days')";
  } else if (timeRange === '30d') {
    dateFilter = "AND created_at >= datetime('now', '-30 days')";
  }

  const daily = db.prepare(`
    SELECT
      date(created_at) as day,
      event_type,
      COUNT(*) as count
    FROM analytics_events
    WHERE position_id = ? ${dateFilter}
    GROUP BY date(created_at), event_type
    ORDER BY day ASC
  `).all(positionId) as any[];

  // Pivot into daily series
  const series: Record<string, any> = {};
  daily.forEach((d: any) => {
    if (!series[d.day]) series[d.day] = { day: d.day, exposure: 0, click: 0, conversion: 0 };
    series[d.day][d.event_type] = d.count;
  });

  const totals = db.prepare(`
    SELECT event_type, COUNT(*) as count
    FROM analytics_events
    WHERE position_id = ? ${dateFilter}
    GROUP BY event_type
  `).all(positionId) as any[];

  const totalResult: any = { exposure: 0, click: 0, conversion: 0 };
  totals.forEach((t) => { totalResult[t.event_type] = t.count; });
  totalResult.ctr = totalResult.exposure > 0
    ? ((totalResult.click / totalResult.exposure) * 100).toFixed(2) : '0';
  totalResult.cvr = totalResult.click > 0
    ? ((totalResult.conversion / totalResult.click) * 100).toFixed(2) : '0';

  return {
    series: Object.values(series),
    totals: totalResult,
  };
}

export function getConfigAnalytics(configId: string) {
  const stats = db.prepare(`
    SELECT event_type, COUNT(*) as count
    FROM analytics_events
    WHERE config_id = ?
    GROUP BY event_type
  `).all(configId) as any[];

  const result: any = { exposure: 0, click: 0, conversion: 0 };
  stats.forEach((s) => { result[s.event_type] = s.count; });
  result.ctr = result.exposure > 0 ? ((result.click / result.exposure) * 100).toFixed(2) : '0';
  result.cvr = result.click > 0 ? ((result.conversion / result.click) * 100).toFixed(2) : '0';

  return result;
}
