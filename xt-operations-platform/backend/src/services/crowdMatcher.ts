/**
 * Crowd Pack Matcher - simulates matching users against crowd pack rules.
 * In production, this would query a user profile service.
 */

interface CrowdRule {
  dimension: string;   // user_type, member_level, register_days, login_active, consume_amount, order_count, custom_tag
  operator: string;    // eq, neq, gt, gte, lt, lte, in, not_in, contains
  value: string | string[];
}

interface CrowdPack {
  id: string;
  name: string;
  rules: CrowdRule[];
  logic: 'AND' | 'OR';
}

interface UserProfile {
  user_type: string;
  member_level: number;
  register_days: number;
  login_active: boolean;
  consume_amount: number;
  order_count: number;
  custom_tags: string[];
}

export function matchCrowdPack(pack: CrowdPack, user: UserProfile): boolean {
  if (!pack.rules || pack.rules.length === 0) return true;

  const results = pack.rules.map((rule) => matchRule(rule, user));

  if (pack.logic === 'AND') {
    return results.every(Boolean);
  }
  return results.some(Boolean);
}

function matchRule(rule: CrowdRule, user: UserProfile): boolean {
  const userVal = (user as any)[rule.dimension];
  if (userVal === undefined) return false;

  switch (rule.operator) {
    case 'eq': return userVal === rule.value;
    case 'neq': return userVal !== rule.value;
    case 'gt': return Number(userVal) > Number(rule.value);
    case 'gte': return Number(userVal) >= Number(rule.value);
    case 'lt': return Number(userVal) < Number(rule.value);
    case 'lte': return Number(userVal) <= Number(rule.value);
    case 'in': {
      const arr = Array.isArray(rule.value) ? rule.value : [rule.value];
      return arr.includes(String(userVal));
    }
    case 'not_in': {
      const arr = Array.isArray(rule.value) ? rule.value : [rule.value];
      return !arr.includes(String(userVal));
    }
    case 'contains': {
      if (Array.isArray(userVal)) {
        return userVal.some((v) => String(v).includes(String(rule.value)));
      }
      return String(userVal).includes(String(rule.value));
    }
    default: return false;
  }
}

export const CROWD_DIMENSIONS = [
  { key: 'user_type', label: '用户类型', options: ['new_user', 'active_user', 'silent_user', 'churned_user'] },
  { key: 'member_level', label: '会员等级', options: ['0', '1', '2', '3', '4', '5'] },
  { key: 'register_days', label: '注册天数', type: 'number' },
  { key: 'login_active', label: '登录活跃', options: ['true', 'false'] },
  { key: 'consume_amount', label: '消费金额区间', type: 'number' },
  { key: 'order_count', label: '累计下单次数', type: 'number' },
  { key: 'custom_tags', label: '自定义标签', type: 'tag' },
];

export const CROWD_OPERATORS: Record<string, { key: string; label: string }[]> = {
  user_type: [
    { key: 'eq', label: '等于' },
    { key: 'neq', label: '不等于' },
    { key: 'in', label: '包含于' },
  ],
  member_level: [
    { key: 'eq', label: '等于' },
    { key: 'gte', label: '大于等于' },
    { key: 'lte', label: '小于等于' },
    { key: 'in', label: '包含于' },
  ],
  register_days: [
    { key: 'gt', label: '大于' },
    { key: 'lt', label: '小于' },
    { key: 'gte', label: '大于等于' },
    { key: 'lte', label: '小于等于' },
  ],
  login_active: [
    { key: 'eq', label: '是/否' },
  ],
  consume_amount: [
    { key: 'gt', label: '大于' },
    { key: 'lt', label: '小于' },
    { key: 'gte', label: '大于等于' },
    { key: 'lte', label: '小于等于' },
  ],
  order_count: [
    { key: 'gt', label: '大于' },
    { key: 'lt', label: '小于' },
    { key: 'gte', label: '大于等于' },
    { key: 'lte', label: '小于等于' },
  ],
  custom_tags: [
    { key: 'contains', label: '包含' },
    { key: 'in', label: '包含于' },
  ],
};
