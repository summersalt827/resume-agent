// ==================== 基础枚举 ====================

export type ResourceCategory =
  | 'popup'       // 弹窗类
  | 'homepage'    // 首页类
  | 'welfare'     // 福利中心类
  | 'task'        // 任务类
  | 'nav'         // 导航类
  | 'other';      // 其他

export type ResourceStatus = 'active' | 'inactive' | 'draft' | 'expired';

export type ChannelId = 'A' | 'B' | 'C' | 'D';

export type DeviceType = 'ios' | 'android' | 'all';

export type FrequencyLimit = 'every_time' | 'once_daily' | 'once_only' | 'first_n';

export type ScheduleMode = 'fixed' | 'recurring';

export type CrowdCategory =
  | 'lifecycle'     // 用户生命周期
  | 'trading'       // 交易行为
  | 'channel_source' // 渠道来源
  | 'region'        // 区域市场
  | 'asset'         // 资产等级
  | 'activity';     // 活跃度

export type LogicType = 'AND' | 'OR';

export type TargetingMode = 'whitelist' | 'blacklist';

export type ABGroupType = 'control' | 'experiment';

export type ExperimentStatus = 'draft' | 'running' | 'ended';

export type PushType = 'activity' | 'trade_alert' | 'system' | 'recommendation' | 'recall' | 'task_remind';

export type PushStatus = 'draft' | 'pending' | 'sending' | 'completed' | 'cancelled';

export type PushPriority = 'high' | 'medium' | 'low';

export type TriggerType = 'scheduled' | 'event' | 'crowd' | 'delay' | 'algorithm';

export type MaterialType = 'popup' | 'banner' | 'grid' | 'task' | 'push';

// ==================== 运营控制通用配置 ====================

export interface OperationControl {
  is_active: boolean;
  grayscale_ratio: number;
  crowd_targeting: string[];
  region_targeting: RegionTargeting | null;
  device_type: DeviceType[];
  ab_group: string | null;
  experiment_id: string | null;
  frequency_cap: number;
  frequency_period: 'daily' | 'weekly' | 'total' | null;
}

export interface RegionTargeting {
  targeting_mode: TargetingMode;
  granularity: 'country' | 'province' | 'city' | 'district';
  country?: string[];
  province?: string[];
  city?: string[];
  district?: string[];
  ip_precision?: 'city' | 'district';
}

// ==================== 资源位定义 ====================

export interface ResourcePositionDef {
  id: string;
  name: string;
  code: string;
  category: ResourceCategory;
  position: string;
  default_priority: number;
  is_required: boolean;
  description?: string;
}

// ==================== 弹窗运营位 ====================

export interface RewardStage {
  stage_order: number;
  crowd_size: string;
  stage_image: string;
  prize_name: string;
  prize_value: number;
  prize_count: number;
  win_rate: number;
}

export interface PopupConfig {
  id: string;
  resource_position: string;
  priority: number;
  remark: string;
  start_time: string;
  end_time: string;
  channels: ChannelId[];
  popup_title: string;
  popup_bg_image: string;
  popup_guide_text: string;
  btn_text: string;
  btn_link: string;
  frequency_limit: FrequencyLimit;
  activity_name: string;
  activity_start: string;
  activity_end: string;
  activity_bg_image: string;
  reward_stages: RewardStage[];
  control: OperationControl;
  status: ResourceStatus;
  created_at: string;
  updated_at: string;
}

// ==================== 跑马灯 ====================

export interface MarqueeConfig {
  id: string;
  resource_position: string;
  marquee_text: string;
  text_color: string;
  link: string;
  start_time: string;
  end_time: string;
  channels: ChannelId[];
  status: ResourceStatus;
  control: OperationControl;
  created_at: string;
  updated_at: string;
}

// ==================== 顶部运营头图 / 行情区 / 交易对推荐位 ====================

export interface BannerConfig {
  id: string;
  resource_position: string;
  priority: number;
  remark: string;
  banner_image: string;
  link: string;
  start_time: string;
  end_time: string;
  channels: ChannelId[];
  status: ResourceStatus;
  control: OperationControl;
  created_at: string;
  updated_at: string;
}

// ==================== 四宫图 ====================

export interface GridItem {
  grid_order: number;
  activity_name: string;
  grid_icon: string;
  link: string;
}

export interface GridConfig {
  id: string;
  resource_position: string;
  priority: number;
  remark: string;
  start_time: string;
  end_time: string;
  channels: ChannelId[];
  status: ResourceStatus;
  grid_items: GridItem[];
  control: OperationControl;
  created_at: string;
  updated_at: string;
}

// ==================== 任务类 ====================

export interface TaskStage {
  stage_order: number;
  stage_name: string;
  stage_icon?: string;
  stage_reward_text: string;
  reward_range?: string;
  link: string;
  btn_text: string;
  is_completed?: boolean;
}

export interface TaskItem {
  task_order: number;
  task_name: string;
  task_description?: string;
  reward_text: string;
  target_value: number;
  current_value?: number;
  link: string;
  btn_text: string;
}

export interface ChallengeMetric {
  metric_order: number;
  metric_name: string;
  metric_unit: string;
  target_value: number;
  current_value?: number;
  progress_text: string;
  link?: string;
}

export interface DepositTaskConfig {
  id: string;
  resource_position: string;
  priority: number;
  remark: string;
  task_title: string;
  task_description: string;
  reward_text: string;
  reward_icon?: string;
  link: string;
  start_time: string;
  end_time: string;
  channels: ChannelId[];
  status: ResourceStatus;
  completion_condition: string;
  min_deposit_amount: number;
  reward_distribution: string;
  reward_account: string;
  control: OperationControl & {
    task_validity_period: number;
    user_type_limit: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface TradeTaskConfig {
  id: string;
  resource_position: string;
  priority: number;
  remark: string;
  task_title: string;
  task_description: string;
  reward_text: string;
  reward_icon?: string;
  link: string;
  start_time: string;
  end_time: string;
  channels: ChannelId[];
  status: ResourceStatus;
  completion_condition: string;
  trade_type_limit: string[];
  trading_pair_limit: string;
  min_trade_amount: number;
  reward_distribution: string;
  reward_account: string;
  linked_first_deposit: boolean;
  control: OperationControl & {
    task_validity_period: number;
    user_type_limit: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface NewUserTaskConfig {
  id: string;
  resource_position: string;
  priority: number;
  remark: string;
  task_title: string;
  total_reward_text: string;
  countdown_text?: string;
  start_time: string;
  end_time: string;
  channels: ChannelId[];
  status: ResourceStatus;
  task_stages: TaskStage[];
  control: OperationControl & { frequency_limit: FrequencyLimit };
  created_at: string;
  updated_at: string;
}

export interface GrowthTaskConfig {
  id: string;
  resource_position: string;
  priority: number;
  remark: string;
  task_title: string;
  task_list: TaskItem[];
  start_time: string;
  end_time: string;
  channels: ChannelId[];
  status: ResourceStatus;
  control: OperationControl;
  created_at: string;
  updated_at: string;
}

export interface ExclusiveTaskConfig {
  id: string;
  resource_position: string;
  priority: number;
  remark: string;
  task_title: string;
  crowd_targeting: string[];
  task_list: TaskItem[];
  start_time: string;
  end_time: string;
  channels: ChannelId[];
  status: ResourceStatus;
  control: OperationControl;
  created_at: string;
  updated_at: string;
}

export interface ChallengeConfig {
  id: string;
  resource_position: string;
  priority: number;
  remark: string;
  challenge_title: string;
  challenge_description?: string;
  countdown_text: string;
  reward_limit_text: string;
  start_time: string;
  end_time: string;
  channels: ChannelId[];
  status: ResourceStatus;
  challenge_metrics: ChallengeMetric[];
  control: OperationControl;
  created_at: string;
  updated_at: string;
}

// ==================== 新用户引导弹窗 ====================

export interface GuidePopupConfig {
  id: string;
  resource_position: string;
  priority: number;
  remark: string;
  popup_title: string;
  popup_bg_image: string;
  popup_guide_text: string;
  btn_text: string;
  btn_link: string;
  frequency_limit: FrequencyLimit;
  start_time: string;
  end_time: string;
  channels: ChannelId[];
  status: ResourceStatus;
  control: OperationControl & {
    trigger_timing: string;
    show_delay: number;
  };
  created_at: string;
  updated_at: string;
}

// ==================== 福利中心入口 ====================

export interface WelfareEntryConfig {
  id: string;
  resource_position: string;
  priority: number;
  remark: string;
  entry_icon: string;
  entry_text: string;
  link: string;
  position: string;
  start_time: string;
  end_time: string;
  channels: ChannelId[];
  status: ResourceStatus;
  control: OperationControl;
  created_at: string;
  updated_at: string;
}

// ==================== 活动日历 ====================

export interface ActivityItem {
  activity_order: number;
  activity_name: string;
  activity_type: string;
  activity_icon?: string;
  start_time: string;
  end_time: string;
  link: string;
  subscribe_enabled: boolean;
  subscribe_status?: boolean;
  activity_tags: string[];
}

export interface ActivityCalendarConfig {
  id: string;
  resource_position: string;
  remark: string;
  calendar_view: string;
  default_date?: string;
  status: ResourceStatus;
  channels: ChannelId[];
  activity_list: ActivityItem[];
  control: OperationControl;
  created_at: string;
  updated_at: string;
}

// ==================== 卡券中心 ====================

export interface CouponItem {
  coupon_order: number;
  coupon_name: string;
  coupon_icon?: string;
  coupon_value: string;
  use_condition: string;
  validity_period: [string, string];
  remaining_count?: number;
  claim_link?: string;
  coupon_status: string;
}

export interface CouponCenterConfig {
  id: string;
  resource_position: string;
  remark: string;
  status: ResourceStatus;
  channels: ChannelId[];
  coupon_list: CouponItem[];
  control: OperationControl;
  created_at: string;
  updated_at: string;
}

// ==================== PUSH推送 ====================

export interface TypeCapItem {
  push_type: PushType;
  type_daily_cap: number;
}

export interface ChannelCapItem {
  channel: string;
  channel_daily_cap: number;
}

export interface PushConfig {
  id: string;
  push_name: string;
  push_type: PushType;
  push_title: string;
  push_body: string;
  push_icon?: string;
  deeplink: string;
  push_channel: string[];
  start_time: string;
  end_time: string;
  status: PushStatus;
  push_priority: PushPriority;
  activity_id?: string;
  control: OperationControl & {
    frequency_control: string;
    frequency_cap: number;
    time_window: [string, string];
    dnd_time_range?: [string, string];
    delay_strategy?: string;
  };
  daily_cap: number;
  weekly_cap: number;
  monthly_cap: number;
  type_cap: TypeCapItem[];
  channel_cap: ChannelCapItem[];
  priority_override: boolean;
  trigger_type: TriggerType;
  scheduled_time?: string;
  batch_delivery: boolean;
  batch_ratio: number;
  event_id?: string;
  delay_minutes?: number;
  incomplete_condition?: string;
  created_at: string;
  updated_at: string;
}

// ==================== 搜索栏 ====================

export interface SearchBarConfig {
  id: string;
  resource_position: string;
  hot_keywords: string[];
  placeholder_text: string;
  channels: ChannelId[];
  status: ResourceStatus;
  created_at: string;
  updated_at: string;
}

// ==================== 导航菜单 ====================

export interface NavMenuItem {
  id: string;
  name: string;
  code: string;
  link: string;
  icon?: string;
  is_new: boolean;
  sort_order: number;
  parent_menu: string;
  status: ResourceStatus;
}

// ==================== 联合类型 ====================

export type AnyResourceConfig =
  | PopupConfig
  | MarqueeConfig
  | BannerConfig
  | GridConfig
  | DepositTaskConfig
  | TradeTaskConfig
  | NewUserTaskConfig
  | GrowthTaskConfig
  | ExclusiveTaskConfig
  | ChallengeConfig
  | GuidePopupConfig
  | WelfareEntryConfig
  | ActivityCalendarConfig
  | CouponCenterConfig
  | SearchBarConfig
  | PushConfig;

// ==================== 人群包 ====================

export interface CrowdPackage {
  id: string;
  crowd_name: string;
  crowd_code: string;
  crowd_category: CrowdCategory;
  filter_rules: string;
  typical_scenario: string;
  user_type?: string[];
  member_level?: string[];
  register_range?: [string, string];
  last_login_range?: [string, string];
  consumption_range?: [number, number];
  order_count_range?: [number, number];
  user_tags?: string[];
  logic_type: LogicType;
  estimated_users: number;
  linked_positions: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// ==================== 素材包 ====================

export interface MaterialPackage {
  id: string;
  name: string;
  type: MaterialType;
  resource_position_code: string;
  resource_position_name: string;
  images: { url: string; lang: string; desc: string }[];
  texts: { field: string; value: string; lang: string }[];
  links: { url: string; lang: string }[];
  status: ResourceStatus;
  created_at: string;
  updated_at: string;
}

// ==================== 渠道 ====================

export interface Channel {
  id: ChannelId;
  name: string;
  description: string;
  coverage_ratio: number;
  linked_positions: number;
  status: 'active' | 'inactive';
}

// ==================== 排期 ====================

export interface Schedule {
  id: string;
  schedule_name: string;
  bound_positions: string[];
  bound_position_names: string[];
  schedule_mode: ScheduleMode;
  schedule_start: string;
  schedule_end: string;
  repeat_rule: string;
  repeat_time_range?: [string, string];
  auto_online_time?: string;
  auto_offline_time?: string;
  conflict_check: boolean;
  color: string;
  status: ResourceStatus;
  created_at: string;
}

// ==================== 数据监控 ====================

export interface AlertRule {
  metric: string;
  condition: string;
  threshold: number;
  unit: string;
  duration: number;
}

export interface MonitorConfig {
  id: string;
  monitor_name: string;
  bound_positions: string[];
  metrics: string[];
  refresh_interval: string;
  alert_enabled: boolean;
  alert_rules: AlertRule[];
  alert_channel: string[];
  alert_receivers: string[];
}

export interface MetricData {
  metric_name: string;
  metric_code: string;
  value: number;
  change: number;
  trend: number[];
  unit: string;
}

export interface AlertHistory {
  id: string;
  monitor_name: string;
  metric: string;
  condition: string;
  threshold: number;
  actual_value: number;
  level: string;
  channel: string;
  status: string;
  created_at: string;
}

// ==================== 人货场策略 ====================

export interface CampaignStrategy {
  id: string;
  name: string;
  crowd_id: string;
  crowd_name: string;
  material_id: string;
  material_name: string;
  position_code: string;
  position_name: string;
  channel_ids: ChannelId[];
  priority: number;
  status: 'active' | 'draft' | 'ended';
  created_at: string;
}

// ==================== 规则引擎 ====================

export interface RuleEngineStep {
  order: number;
  name: string;
  description: string;
  impact: string;
  degradation?: string;
  status: 'pass' | 'fail' | 'skip';
}

// ==================== 竞品对比 ====================

export interface CompetitiveMetric {
  dimension: string;
  binance: number; // 0-100 score
  bybit: number;
  xt: number;
  xt_advantage: boolean;
  xt_weakness: boolean;
  note?: string;
}

export interface CompetitiveSuggestion {
  priority: 'short' | 'mid' | 'long';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'done';
}

// ==================== Push 优先级增强 ====================

export type PushPriorityLevel = 'P0' | 'P1' | 'P2';

export interface PushPriorityRule {
  level: PushPriorityLevel;
  label: string;
  types: string[];
  frequency_strategy: string;
  color: string;
}

export interface PushTimeWindow {
  time_range: [string, string];
  content_type: string;
  color: string;
}

export interface UserSubscriptionPreference {
  category: string;
  label: string;
  enabled: boolean;
  description: string;
}

// ==================== 资产化分类 ====================

export interface AssetCategory {
  key: string;
  name: string;
  positions: string[];
  priority_range: string;
  strategy: string;
  count: number;
}
