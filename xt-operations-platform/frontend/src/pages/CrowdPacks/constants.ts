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
    { key: 'gte', label: '≥' },
    { key: 'lte', label: '≤' },
    { key: 'in', label: '包含于' },
  ],
  register_days: [
    { key: 'gt', label: '>' },
    { key: 'lt', label: '<' },
    { key: 'gte', label: '≥' },
    { key: 'lte', label: '≤' },
  ],
  login_active: [
    { key: 'eq', label: '是/否' },
  ],
  consume_amount: [
    { key: 'gt', label: '>' },
    { key: 'lt', label: '<' },
    { key: 'gte', label: '≥' },
    { key: 'lte', label: '≤' },
  ],
  order_count: [
    { key: 'gt', label: '>' },
    { key: 'lt', label: '<' },
    { key: 'gte', label: '≥' },
    { key: 'lte', label: '≤' },
  ],
  custom_tags: [
    { key: 'contains', label: '包含' },
    { key: 'in', label: '包含于' },
  ],
};
