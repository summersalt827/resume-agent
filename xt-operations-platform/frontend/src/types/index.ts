export interface CrowdPack {
  id: string;
  name: string;
  description: string;
  rules: CrowdRule[];
  logic: 'AND' | 'OR';
  status: string;
  user_count: number;
  created_at: string;
  updated_at: string;
}

export interface CrowdRule {
  dimension: string;
  operator: string;
  value: string | string[];
}

export interface Material {
  id: string;
  name: string;
  type: 'image' | 'text' | 'link' | 'video';
  content: Record<string, any>;
  file_url: string;
  fallback_url: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ResourcePosition {
  id: string;
  code: string;
  name: string;
  category: string;
  priority_base: number;
  description: string;
  status: string;
  config_count?: number;
}

export interface PositionConfig {
  id: string;
  resource_position_id: string;
  crowd_pack_id: string | null;
  material_id: string;
  priority: number;
  start_time: string;
  end_time: string;
  channels: string[];
  device_type: string;
  gray_ratio: number;
  ab_group: string;
  freq_limit_type: string;
  freq_limit_count: number;
  regions: RegionRule[];
  region_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  position_name?: string;
  position_code?: string;
  position_category?: string;
  crowd_pack_name?: string;
  material_name?: string;
  material_type?: string;
  material_content?: string;
  material_file_url?: string;
  schedules?: Schedule[];
  rule_chain?: RuleChainStep[];
}

export interface RegionRule {
  code: string;
  type?: string;
}

export interface Schedule {
  id: string;
  config_id: string;
  type: 'fixed' | 'recurring';
  start_time: string;
  end_time: string;
  cron_expression: string;
  status: string;
}

export interface RuleChainStep {
  id: string;
  config_id: string;
  step_order: number;
  rule_type: string;
  enabled: number;
  params: string;
}

export interface AnalyticsOverview {
  total_exposures: number;
  total_clicks: number;
  total_conversions: number;
  ctr: string;
  cvr: string;
  total_configs: number;
  online_configs: number;
  total_positions: number;
  total_crowd_packs: number;
  total_materials: number;
}

export interface PositionAnalytics {
  series: DailyPoint[];
  totals: {
    exposure: number;
    click: number;
    conversion: number;
    ctr: string;
    cvr: string;
  };
}

export interface DailyPoint {
  day: string;
  exposure: number;
  click: number;
  conversion: number;
}

export interface DeliveryMatchResult {
  user: any;
  total_configs: number;
  matched_count: number;
  results: any[];
  matched: any[];
}

export const CATEGORY_LABELS: Record<string, string> = {
  popup: '弹窗类',
  banner: 'Banner类',
  icon_grid: '图标矩阵类',
  marquee: '文字滚动类',
  task: '任务体系类',
  info: '信息聚合类',
  widget: 'Widget组件',
};

export const CATEGORY_COLORS: Record<string, string> = {
  popup: '#ff4d4f',
  banner: '#1890ff',
  icon_grid: '#52c41a',
  marquee: '#faad14',
  task: '#722ed1',
  info: '#13c2c2',
  widget: '#eb2f96',
};

export const STATUS_COLORS: Record<string, string> = {
  online: 'green',
  offline: 'default',
  draft: 'blue',
  expired: 'orange',
  active: 'green',
  inactive: 'default',
};
