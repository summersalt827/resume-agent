/**
 * 10-Layer Display Rule Engine
 *
 * Pipeline: ①switch → ②schedule → ③channel → ④device → ⑤region
 *          → ⑥crowd → ⑦gray → ⑧ab → ⑨frequency → ⑩priority
 *
 * Each layer short-circuits on failure.
 */

interface RuleContext {
  config: any;
  user: {
    userId: string;
    deviceType: 'ios' | 'android';
    region: string;
    channel: string;
    crowdTags: string[];
    abGroup?: string;
    freqCount?: number;
  };
  now: Date;
}

interface RuleResult {
  passed: boolean;
  step: number;
  rule: string;
  reason?: string;
}

const RULE_CHAIN = [
  { step: 1, rule: 'switch', label: '上线开关' },
  { step: 2, rule: 'schedule', label: '投放排期' },
  { step: 3, rule: 'channel', label: '渠道校验' },
  { step: 4, rule: 'device', label: '设备定向' },
  { step: 5, rule: 'region', label: '地域定向' },
  { step: 6, rule: 'crowd', label: '人群定向' },
  { step: 7, rule: 'gray', label: '灰度比例' },
  { step: 8, rule: 'ab', label: 'AB测试分组' },
  { step: 9, rule: 'frequency', label: '频次控制' },
  { step: 10, rule: 'priority', label: '优先级判断' },
];

function checkSwitch(ctx: RuleContext): RuleResult {
  const passed = ctx.config.status === 'online';
  return { passed, step: 1, rule: 'switch', reason: passed ? undefined : '配置已下线' };
}

function checkSchedule(ctx: RuleContext): RuleResult {
  const { start_time, end_time } = ctx.config;
  if (!start_time && !end_time) return { passed: true, step: 2, rule: 'schedule' };

  const now = ctx.now.toISOString();
  if (start_time && now < start_time) {
    return { passed: false, step: 2, rule: 'schedule', reason: '未到投放开始时间' };
  }
  if (end_time && now > end_time) {
    return { passed: false, step: 2, rule: 'schedule', reason: '已过投放结束时间' };
  }
  return { passed: true, step: 2, rule: 'schedule' };
}

function checkChannel(ctx: RuleContext): RuleResult {
  const channels: string[] = JSON.parse(ctx.config.channels || '[]');
  if (channels.length === 0) return { passed: true, step: 3, rule: 'channel' };

  const passed = channels.includes('all') || channels.includes(ctx.user.channel);
  return { passed, step: 3, rule: 'channel', reason: passed ? undefined : `渠道不匹配: ${ctx.user.channel}` };
}

function checkDevice(ctx: RuleContext): RuleResult {
  const deviceType = ctx.config.device_type || 'all';
  if (deviceType === 'all') return { passed: true, step: 4, rule: 'device' };

  const passed = deviceType === ctx.user.deviceType;
  return { passed, step: 4, rule: 'device', reason: passed ? undefined : `设备不匹配: ${ctx.user.deviceType}` };
}

function checkRegion(ctx: RuleContext): RuleResult {
  const regions: { code: string; type: string }[] = JSON.parse(ctx.config.regions || '[]');
  if (regions.length === 0) return { passed: true, step: 5, rule: 'region' };

  const regionType = ctx.config.region_type || 'whitelist';
  const userRegion = ctx.user.region;
  const regionCodes = regions.map((r: any) => r.code || r);

  if (regionType === 'whitelist') {
    const passed = regionCodes.includes(userRegion) || regionCodes.includes('all');
    return { passed, step: 5, rule: 'region', reason: passed ? undefined : `地域不在白名单: ${userRegion}` };
  } else {
    const passed = !regionCodes.includes(userRegion);
    return { passed, step: 5, rule: 'region', reason: passed ? undefined : `地域在黑名单: ${userRegion}` };
  }
}

function checkCrowd(ctx: RuleContext): RuleResult {
  // If no crowd_pack_id, it's open to all users
  if (!ctx.config.crowd_pack_id) return { passed: true, step: 6, rule: 'crowd' };

  // Simulated: check if user's crowd tags match
  const passed = ctx.user.crowdTags.includes(ctx.config.crowd_pack_id) || Math.random() > 0.5;
  return { passed, step: 6, rule: 'crowd', reason: passed ? undefined : '用户不在目标人群包中' };
}

function checkGray(ctx: RuleContext): RuleResult {
  const grayRatio = ctx.config.gray_ratio || 100;
  if (grayRatio >= 100) return { passed: true, step: 7, rule: 'gray' };

  // Hash user ID to get a consistent 0-99 bucket
  const hash = ctx.user.userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const bucket = hash % 100;
  const passed = bucket < grayRatio;
  return { passed, step: 7, rule: 'gray', reason: passed ? undefined : `灰度未命中: bucket=${bucket}, ratio=${grayRatio}%` };
}

function checkAB(ctx: RuleContext): RuleResult {
  const abGroup = ctx.config.ab_group;
  if (!abGroup) return { passed: true, step: 8, rule: 'ab' };

  // Hash to get consistent 0-1 bucket for AB split
  const hash = ctx.user.userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const bucket = hash % 2;
  // ab_group: 'A' or 'B', user is assigned based on hash
  const userGroup = bucket === 0 ? 'A' : 'B';
  const passed = userGroup === abGroup;
  return { passed, step: 8, rule: 'ab', reason: passed ? undefined : `AB分组不匹配: user=${userGroup}, config=${abGroup}` };
}

function checkFrequency(ctx: RuleContext): RuleResult {
  const freqType = ctx.config.freq_limit_type;
  if (!freqType || freqType === 'none') return { passed: true, step: 9, rule: 'frequency' };

  const limit = ctx.config.freq_limit_count || 0;
  const current = ctx.user.freqCount || 0;
  const passed = current < limit;
  return { passed, step: 9, rule: 'frequency', reason: passed ? undefined : `频控已达上限: ${current}/${limit}` };
}

export function evaluate(ctx: RuleContext): { passed: boolean; results: RuleResult[]; finalConfig?: any } {
  const results: RuleResult[] = [];

  for (const step of RULE_CHAIN) {
    let result: RuleResult;
    switch (step.rule) {
      case 'switch': result = checkSwitch(ctx); break;
      case 'schedule': result = checkSchedule(ctx); break;
      case 'channel': result = checkChannel(ctx); break;
      case 'device': result = checkDevice(ctx); break;
      case 'region': result = checkRegion(ctx); break;
      case 'crowd': result = checkCrowd(ctx); break;
      case 'gray': result = checkGray(ctx); break;
      case 'ab': result = checkAB(ctx); break;
      case 'frequency': result = checkFrequency(ctx); break;
      case 'priority': result = { passed: true, step: 10, rule: 'priority' }; break;
      default: result = { passed: true, step: step.step, rule: step.rule };
    }
    results.push(result);
    if (!result.passed) {
      return { passed: false, results };
    }
  }

  return { passed: true, results, finalConfig: ctx.config };
}

export function getRuleChain() {
  return RULE_CHAIN;
}
