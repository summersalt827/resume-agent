import db from '../db';

/**
 * Simple scheduler - checks if a schedule is currently active.
 * For recurring schedules, interprets basic cron-like patterns.
 */

export function isScheduleActive(configId: string, now: Date = new Date()): boolean {
  const schedule = db.prepare(
    'SELECT * FROM schedules WHERE config_id = ? AND status = ?'
  ).get(configId, 'active') as any;

  if (!schedule) return true; // No schedule = always active

  const nowISO = now.toISOString();

  if (schedule.type === 'fixed') {
    if (schedule.start_time && nowISO < schedule.start_time) return false;
    if (schedule.end_time && nowISO > schedule.end_time) return false;
    return true;
  }

  if (schedule.type === 'recurring') {
    return matchRecurring(schedule, now);
  }

  return true;
}

function matchRecurring(schedule: any, now: Date): boolean {
  if (!schedule.cron_expression) return true;

  // Simple cron-like: "day HH:MM-HH:MM" or "weekly 1,3,5 HH:MM-HH:MM"
  const expr: string = schedule.cron_expression;
  const parts = expr.split(' ');

  if (parts[0] === 'daily') {
    const [startTime, endTime] = parts[1].split('-');
    return isTimeInRange(now, startTime, endTime);
  }

  if (parts[0] === 'weekly') {
    const days = parts[1].split(',').map(Number);
    const currentDay = now.getDay(); // 0=Sun
    if (!days.includes(currentDay)) return false;
    const [startTime, endTime] = parts[2].split('-');
    return isTimeInRange(now, startTime, endTime);
  }

  return true;
}

function isTimeInRange(now: Date, start: string, end: string): boolean {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }
  // Overnight range
  return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
}
