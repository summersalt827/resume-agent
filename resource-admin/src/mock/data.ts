import type {
  ResourcePositionDef, PopupConfig, MarqueeConfig, BannerConfig, GridConfig,
  DepositTaskConfig, TradeTaskConfig, NewUserTaskConfig, GrowthTaskConfig,
  ExclusiveTaskConfig, ChallengeConfig, GuidePopupConfig, WelfareEntryConfig,
  ActivityCalendarConfig, CouponCenterConfig, SearchBarConfig, PushConfig,
  CrowdPackage, MaterialPackage, Channel, Schedule, MonitorConfig,
  MetricData, AlertHistory, NavMenuItem, DeviceType,
  CampaignStrategy, RuleEngineStep, CompetitiveMetric, CompetitiveSuggestion,
  PushPriorityRule, PushTimeWindow, UserSubscriptionPreference, AssetCategory,
} from '../types';

// ==================== 资源位定义 ====================

export const resourcePositionDefs: ResourcePositionDef[] = [
  { id: 'rp-01', name: '弹窗运营位', code: 'popup_operation', category: 'popup', position: '首页弹窗层', default_priority: 352, is_required: false },
  { id: 'rp-02', name: '首页跑马灯', code: 'marquee', category: 'homepage', position: '首页顶部通知栏', default_priority: 0, is_required: false },
  { id: 'rp-03', name: '顶部运营头图', code: 'top_banner', category: 'homepage', position: '首页顶部视觉区', default_priority: 351, is_required: false },
  { id: 'rp-04', name: '福利中心入口', code: 'welfare_entry', category: 'welfare', position: '首页功能区', default_priority: 340, is_required: false },
  { id: 'rp-05', name: '底部运营四宫图', code: 'bottom_grid', category: 'homepage', position: '首页中下方运营区', default_priority: 350, is_required: false },
  { id: 'rp-06', name: '新人专享任务', code: 'new_user_task', category: 'task', position: '福利中心-新人专享Tab', default_priority: 360, is_required: false },
  { id: 'rp-07', name: '成长任务', code: 'growth_task', category: 'task', position: '福利中心-成长任务Tab', default_priority: 361, is_required: false },
  { id: 'rp-08', name: '专属任务', code: 'exclusive_task', category: 'task', position: '福利中心-专属任务Tab', default_priority: 362, is_required: false },
  { id: 'rp-09', name: '限时挑战', code: 'time_challenge', category: 'task', position: '福利中心-限时挑战区', default_priority: 363, is_required: false },
  { id: 'rp-10', name: '注册后首充任务', code: 'first_deposit_task', category: 'task', position: '首页充值Tab', default_priority: 355, is_required: false },
  { id: 'rp-11', name: '首次交易任务', code: 'first_trade_task', category: 'task', position: '首页交易Tab', default_priority: 356, is_required: false },
  { id: 'rp-12', name: '新用户引导弹窗', code: 'new_user_guide_popup', category: 'popup', position: '首页首次加载', default_priority: 353, is_required: false },
  { id: 'rp-13', name: '活动日历', code: 'activity_calendar', category: 'welfare', position: '福利中心-活动日历Tab', default_priority: 0, is_required: false },
  { id: 'rp-14', name: '卡券中心', code: 'coupon_center', category: 'welfare', position: '福利中心-卡券中心Tab', default_priority: 0, is_required: false },
  { id: 'rp-15', name: '行情区资源位', code: 'market_banner', category: 'other', position: '行情页运营区', default_priority: 330, is_required: false },
  { id: 'rp-16', name: '交易对推荐位', code: 'trading_pair_rec', category: 'other', position: '交易页推荐区', default_priority: 331, is_required: false },
  { id: 'rp-17', name: 'PUSH推送', code: 'push', category: 'other', position: '用户设备通知栏/站内信', default_priority: 0, is_required: false },
  { id: 'rp-18', name: '搜索栏', code: 'search_bar', category: 'homepage', position: '首页顶部搜索栏区域', default_priority: 0, is_required: true },
  { id: 'rp-19', name: 'AI交易套件', code: 'ai_trading_kit', category: 'nav', position: '"更多"下拉菜单', default_priority: 0, is_required: false },
  { id: 'rp-20', name: '导航菜单-交易', code: 'nav_trade', category: 'nav', position: '顶部导航栏', default_priority: 0, is_required: false },
  { id: 'rp-21', name: '导航菜单-合约', code: 'nav_futures', category: 'nav', position: '顶部导航栏', default_priority: 0, is_required: false },
  { id: 'rp-22', name: '导航菜单-工具', code: 'nav_tools', category: 'nav', position: '顶部导航栏', default_priority: 0, is_required: false },
  { id: 'rp-23', name: '导航菜单-金融', code: 'nav_finance', category: 'nav', position: '顶部导航栏', default_priority: 0, is_required: false },
  { id: 'rp-24', name: '导航菜单-活动', code: 'nav_activity', category: 'nav', position: '顶部导航栏', default_priority: 0, is_required: false },
  { id: 'rp-25', name: '导航菜单-邀请返佣', code: 'nav_referral', category: 'nav', position: '"更多"下拉左列', default_priority: 0, is_required: false },
  { id: 'rp-26', name: '导航菜单-XT合伙人', code: 'nav_partner', category: 'nav', position: '"更多"下拉左列', default_priority: 0, is_required: false },
  { id: 'rp-27', name: '导航菜单-经纪人', code: 'nav_broker', category: 'nav', position: '"更多"下拉左列', default_priority: 0, is_required: false },
  { id: 'rp-28', name: '导航菜单-XT智能链', code: 'nav_smart_chain', category: 'nav', position: '"更多"下拉左列', default_priority: 0, is_required: false },
  { id: 'rp-29', name: '导航菜单-实验室', code: 'nav_lab', category: 'nav', position: '"更多"下拉左列', default_priority: 0, is_required: false },
  { id: 'rp-30', name: '导航菜单-公告', code: 'nav_announce', category: 'nav', position: '"更多"下拉右列', default_priority: 0, is_required: false },
  { id: 'rp-31', name: '导航菜单-XT博客', code: 'nav_blog', category: 'nav', position: '"更多"下拉右列', default_priority: 0, is_required: false },
  { id: 'rp-32', name: '导航菜单-学院', code: 'nav_academy', category: 'nav', position: '"更多"下拉右列', default_priority: 0, is_required: false },
  { id: 'rp-33', name: '导航菜单-上币', code: 'nav_listing', category: 'nav', position: '"更多"下拉右列', default_priority: 0, is_required: false },
  { id: 'rp-34', name: '导航菜单-AI交易套件', code: 'nav_ai_trading', category: 'nav', position: '"更多"下拉右列', default_priority: 0, is_required: false },
];

const defaultControl = {
  is_active: true,
  grayscale_ratio: 100,
  crowd_targeting: [] as string[],
  region_targeting: null,
  device_type: ['all'] as DeviceType[],
  ab_group: null,
  experiment_id: null,
  frequency_cap: 0,
  frequency_period: null,
};

// ==================== 弹窗运营位 ====================

export const popupConfigs: PopupConfig[] = [
  {
    id: 'popup-001',
    resource_position: '弹窗运营位',
    priority: 352,
    remark: 'BTC突破10万U庆祝活动弹窗',
    start_time: '2026-05-20 00:00:00',
    end_time: '2026-06-20 23:59:59',
    channels: ['A', 'B'],
    popup_title: 'BTC 突破 $100,000！',
    popup_bg_image: 'https://picsum.photos/750/1334?random=1',
    popup_guide_text: '庆祝 BTC 历史性时刻，参与交易大赛瓜分 50,000 USDT 奖池',
    btn_text: '去参与',
    btn_link: '/activity/btc-100k',
    frequency_limit: 'once_daily',
    activity_name: 'BTC突破10万U交易大赛',
    activity_start: '2026-05-20 00:00:00',
    activity_end: '2026-06-20 23:59:59',
    activity_bg_image: 'https://picsum.photos/750/1334?random=2',
    reward_stages: [
      { stage_order: 1, crowd_size: '100-200人', stage_image: 'https://picsum.photos/200/200?random=3', prize_name: 'XT定制周边礼盒', prize_value: 200, prize_count: 50, win_rate: 100 },
      { stage_order: 2, crowd_size: '200-500人', stage_image: 'https://picsum.photos/200/200?random=4', prize_name: 'USDT体验金', prize_value: 50, prize_count: 200, win_rate: 300 },
      { stage_order: 3, crowd_size: '500-1000人', stage_image: 'https://picsum.photos/200/200?random=5', prize_name: '交易手续费抵扣券', prize_value: 10, prize_count: 500, win_rate: 500 },
    ],
    control: { ...defaultControl, grayscale_ratio: 50, crowd_targeting: ['active_trader'] },
    status: 'active',
    created_at: '2026-05-18 10:00:00',
    updated_at: '2026-05-20 09:00:00',
  },
];

// ==================== 跑马灯 ====================

export const marqueeConfigs: MarqueeConfig[] = [
  {
    id: 'marquee-001',
    resource_position: '首页跑马灯',
    marquee_text: '恭喜 {username} 在合约交易中获得 {amount} USDT 奖励！',
    text_color: '#FFD700',
    link: '/activity/trading-reward',
    start_time: '2026-05-15 00:00:00',
    end_time: '2026-06-15 23:59:59',
    channels: ['A', 'B', 'C', 'D'],
    status: 'active',
    control: { ...defaultControl },
    created_at: '2026-05-14 10:00:00',
    updated_at: '2026-05-14 10:00:00',
  },
  {
    id: 'marquee-002',
    resource_position: '首页跑马灯',
    marquee_text: 'Meme币狂欢周开启！交易指定Meme币享手续费5折优惠',
    text_color: '#FF6B6B',
    link: '/activity/meme-week',
    start_time: '2026-05-22 00:00:00',
    end_time: '2026-05-29 23:59:59',
    channels: ['A', 'C'],
    status: 'active',
    control: { ...defaultControl, grayscale_ratio: 80 },
    created_at: '2026-05-21 14:00:00',
    updated_at: '2026-05-21 14:00:00',
  },
];

// ==================== 顶部运营头图 ====================

export const bannerConfigs: BannerConfig[] = [
  {
    id: 'banner-001',
    resource_position: '顶部运营头图',
    priority: 351,
    remark: 'ETH ETF上线推广',
    banner_image: 'https://picsum.photos/750/360?random=10',
    link: '/activity/eth-etf',
    start_time: '2026-05-20 00:00:00',
    end_time: '2026-06-10 23:59:59',
    channels: ['A', 'B', 'C'],
    status: 'active',
    control: { ...defaultControl },
    created_at: '2026-05-19 09:00:00',
    updated_at: '2026-05-20 08:00:00',
  },
];

// ==================== 四宫图 ====================

export const gridConfigs: GridConfig[] = [
  {
    id: 'grid-001',
    resource_position: '底部运营四宫图',
    priority: 350,
    remark: '5月运营活动矩阵',
    start_time: '2026-05-01 00:00:00',
    end_time: '2026-05-31 23:59:59',
    channels: ['A', 'B', 'C', 'D'],
    status: 'active',
    grid_items: [
      { grid_order: 1, activity_name: '邀请有礼', grid_icon: 'https://picsum.photos/120/120?random=11', link: '/activity/referral' },
      { grid_order: 2, activity_name: '交易大赛', grid_icon: 'https://picsum.photos/120/120?random=12', link: '/activity/trading-contest' },
      { grid_order: 3, activity_name: '新手任务', grid_icon: 'https://picsum.photos/120/120?random=13', link: '/activity/newbie' },
      { grid_order: 4, activity_name: '理财专区', grid_icon: 'https://picsum.photos/120/120?random=14', link: '/earn' },
    ],
    control: { ...defaultControl },
    created_at: '2026-04-28 11:00:00',
    updated_at: '2026-05-01 00:00:00',
  },
];

// ==================== 首充任务 ====================

export const depositTaskConfigs: DepositTaskConfig[] = [
  {
    id: 'deposit-001',
    resource_position: '注册后首充任务',
    priority: 355,
    remark: '新用户首充激励',
    task_title: '完成首充，奖励 USDT',
    task_description: '首次充值任意金额即可获得最高 200 USDT 奖励，充值越多奖励越多！',
    reward_text: '最高 200 USDT',
    reward_icon: 'https://picsum.photos/48/48?random=20',
    link: '/deposit',
    start_time: '2026-05-01 00:00:00',
    end_time: '2026-06-30 23:59:59',
    channels: ['A', 'B', 'C', 'D'],
    status: 'active',
    completion_condition: '单笔充值 ≥ 10 USDT',
    min_deposit_amount: 10,
    reward_distribution: '即时发放',
    reward_account: '现货账户',
    control: { ...defaultControl, task_validity_period: 7, user_type_limit: ['仅新用户'] },
    created_at: '2026-04-25 10:00:00',
    updated_at: '2026-05-01 00:00:00',
  },
];

// ==================== 首交任务 ====================

export const tradeTaskConfigs: TradeTaskConfig[] = [
  {
    id: 'trade-001',
    resource_position: '首次交易任务',
    priority: 356,
    remark: '新用户首交激励',
    task_title: '完成首笔交易，奖励 USDT',
    task_description: '完成任意一笔现货或合约交易即可获得 USDT 奖励',
    reward_text: '最高 100 USDT',
    reward_icon: 'https://picsum.photos/48/48?random=21',
    link: '/trade',
    start_time: '2026-05-01 00:00:00',
    end_time: '2026-06-30 23:59:59',
    channels: ['A', 'B', 'C', 'D'],
    status: 'active',
    completion_condition: '任意交易',
    trade_type_limit: [],
    trading_pair_limit: '',
    min_trade_amount: 0,
    reward_distribution: '即时发放',
    reward_account: '现货账户',
    linked_first_deposit: true,
    control: { ...defaultControl, task_validity_period: 14, user_type_limit: ['仅新用户'] },
    created_at: '2026-04-25 10:30:00',
    updated_at: '2026-05-01 00:00:00',
  },
];

// ==================== 新人专享任务 ====================

export const newUserTaskConfigs: NewUserTaskConfig[] = [
  {
    id: 'newuser-001',
    resource_position: '新人专享任务',
    priority: 360,
    remark: '新人四阶段任务',
    task_title: '新人专享最高 8,888 USDT 奖励',
    total_reward_text: '最高 8,888 USDT',
    countdown_text: '距离活动结束还有 30 天',
    start_time: '2026-05-01 00:00:00',
    end_time: '2026-06-30 23:59:59',
    channels: ['A', 'B', 'C', 'D'],
    status: 'active',
    task_stages: [
      { stage_order: 1, stage_name: '完成注册', stage_icon: 'https://picsum.photos/48/48?random=30', stage_reward_text: '5 ~ 88 USDT', reward_range: '5-88', link: '/register', btn_text: '去完成' },
      { stage_order: 2, stage_name: '完成KYC', stage_icon: 'https://picsum.photos/48/48?random=31', stage_reward_text: '10 ~ 188 USDT', reward_range: '10-188', link: '/kyc', btn_text: '去认证' },
      { stage_order: 3, stage_name: '首次充值', stage_icon: 'https://picsum.photos/48/48?random=32', stage_reward_text: '20 ~ 888 USDT', reward_range: '20-888', link: '/deposit', btn_text: '去充值' },
      { stage_order: 4, stage_name: '首次交易', stage_icon: 'https://picsum.photos/48/48?random=33', stage_reward_text: '50 ~ 8,888 USDT', reward_range: '50-8888', link: '/trade', btn_text: '去交易' },
    ],
    control: { ...defaultControl, frequency_limit: 'once_daily' },
    created_at: '2026-04-28 14:00:00',
    updated_at: '2026-05-01 00:00:00',
  },
];

// ==================== 成长任务 ====================

export const growthTaskConfigs: GrowthTaskConfig[] = [
  {
    id: 'growth-001',
    resource_position: '成长任务',
    priority: 361,
    remark: '用户成长体系任务',
    task_title: '成长任务',
    task_list: [
      { task_order: 1, task_name: '累计充值 100 USDT', task_description: '累计充值达到 100 USDT', reward_text: '5 USDT', target_value: 100, current_value: 0, link: '/deposit', btn_text: '去完成' },
      { task_order: 2, task_name: '累计交易 500 USDT', task_description: '累计交易额达到 500 USDT', reward_text: '10 USDT', target_value: 500, current_value: 0, link: '/trade', btn_text: '去完成' },
      { task_order: 3, task_name: '完成首次合约交易', task_description: '完成第一笔合约交易', reward_text: '20 USDT', target_value: 1, current_value: 0, link: '/futures', btn_text: '去完成' },
      { task_order: 4, task_name: '邀请1位好友', task_description: '成功邀请1位好友注册并完成KYC', reward_text: '30 USDT', target_value: 1, current_value: 0, link: '/referral', btn_text: '去邀请' },
    ],
    start_time: '2026-05-01 00:00:00',
    end_time: '2026-12-31 23:59:59',
    channels: ['A', 'B', 'C', 'D'],
    status: 'active',
    control: { ...defaultControl },
    created_at: '2026-04-20 10:00:00',
    updated_at: '2026-05-01 00:00:00',
  },
];

// ==================== 专属任务 ====================

export const exclusiveTaskConfigs: ExclusiveTaskConfig[] = [
  {
    id: 'exclusive-001',
    resource_position: '专属任务',
    priority: 362,
    remark: 'VIP用户专属任务',
    task_title: 'VIP 专属任务',
    crowd_targeting: ['high_balance', 'whale'],
    task_list: [
      { task_order: 1, task_name: '合约交易 10,000 USDT', reward_text: '100 USDT', target_value: 10000, link: '/futures', btn_text: '去交易' },
      { task_order: 2, task_name: '理财存入 5,000 USDT', reward_text: '200 USDT', target_value: 5000, link: '/earn', btn_text: '去理财' },
    ],
    start_time: '2026-05-01 00:00:00',
    end_time: '2026-08-31 23:59:59',
    channels: ['A', 'B', 'C', 'D'],
    status: 'active',
    control: { ...defaultControl },
    created_at: '2026-04-22 10:00:00',
    updated_at: '2026-05-01 00:00:00',
  },
];

// ==================== 限时挑战 ====================

export const challengeConfigs: ChallengeConfig[] = [
  {
    id: 'challenge-001',
    resource_position: '限时挑战',
    priority: 363,
    remark: '6月交易挑战',
    challenge_title: '6月交易挑战',
    challenge_description: '完成净充值和交易量目标，瓜分大奖',
    countdown_text: '距离挑战结束还有 30 天',
    reward_limit_text: '当前奖励 0/8,000 USDT',
    start_time: '2026-06-01 00:00:00',
    end_time: '2026-06-30 23:59:59',
    channels: ['A', 'B', 'C', 'D'],
    status: 'draft',
    challenge_metrics: [
      { metric_order: 1, metric_name: '净充值', metric_unit: 'USDT', target_value: 500, progress_text: '0 USDT', link: '/deposit' },
      { metric_order: 2, metric_name: '交易量', metric_unit: 'USDT', target_value: 5000, progress_text: '0 USDT', link: '/trade' },
    ],
    control: { ...defaultControl },
    created_at: '2026-05-20 15:00:00',
    updated_at: '2026-05-20 15:00:00',
  },
];

// ==================== 新用户引导弹窗 ====================

export const guidePopupConfigs: GuidePopupConfig[] = [
  {
    id: 'guide-001',
    resource_position: '新用户引导弹窗',
    priority: 353,
    remark: '新用户首次进入引导',
    popup_title: '欢迎来到 XT',
    popup_bg_image: 'https://picsum.photos/750/1334?random=40',
    popup_guide_text: '完成新手任务，领取最高 8,888 USDT 新人奖励！',
    btn_text: '开始探索',
    btn_link: '/newbie',
    frequency_limit: 'once_only',
    start_time: '2026-05-01 00:00:00',
    end_time: '2026-12-31 23:59:59',
    channels: ['A', 'B', 'C', 'D'],
    status: 'active',
    control: { ...defaultControl, crowd_targeting: ['new_user_3d'], trigger_timing: '首次进入App', show_delay: 1 },
    created_at: '2026-04-15 10:00:00',
    updated_at: '2026-05-01 00:00:00',
  },
];

// ==================== 福利中心入口 ====================

export const welfareEntryConfigs: WelfareEntryConfig[] = [
  {
    id: 'welfare-001',
    resource_position: '福利中心入口',
    priority: 340,
    remark: '福利中心首页入口',
    entry_icon: 'https://picsum.photos/120/120?random=50',
    entry_text: '福利中心',
    link: '/welfare',
    position: '首页功能区',
    start_time: '2026-05-01 00:00:00',
    end_time: '2026-12-31 23:59:59',
    channels: ['A', 'B', 'C', 'D'],
    status: 'active',
    control: { ...defaultControl },
    created_at: '2026-04-10 10:00:00',
    updated_at: '2026-05-01 00:00:00',
  },
];

// ==================== 活动日历 ====================

export const activityCalendarConfigs: ActivityCalendarConfig[] = [
  {
    id: 'calendar-001',
    resource_position: '活动日历',
    remark: '6月活动日历',
    calendar_view: '月视图',
    status: 'active',
    channels: ['A', 'B', 'C', 'D'],
    activity_list: [
      { activity_order: 1, activity_name: '交易BTC、ETH、SOL，瓜分$50,000奖励', activity_type: '交易活动', activity_icon: 'https://picsum.photos/32/32?random=60', start_time: '2026-06-01 00:00:00', end_time: '2026-06-07 23:59:59', link: '/activity/june-trading', subscribe_enabled: true, activity_tags: ['热门'] },
      { activity_order: 2, activity_name: '合约交易大赛：争夺最强交易员', activity_type: '合约活动', activity_icon: 'https://picsum.photos/32/32?random=61', start_time: '2026-06-05 00:00:00', end_time: '2026-06-15 23:59:59', link: '/activity/futures-contest', subscribe_enabled: true, activity_tags: ['新上线'] },
      { activity_order: 3, activity_name: 'Earn理财节：年化最高30%', activity_type: '理财活动', activity_icon: 'https://picsum.photos/32/32?random=62', start_time: '2026-06-10 00:00:00', end_time: '2026-06-20 23:59:59', link: '/activity/earn-festival', subscribe_enabled: true, activity_tags: ['即将结束'] },
      { activity_order: 4, activity_name: '邀请好友：双方各得50 USDT', activity_type: '常规活动', activity_icon: 'https://picsum.photos/32/32?random=63', start_time: '2026-06-15 00:00:00', end_time: '2026-06-30 23:59:59', link: '/activity/referral-june', subscribe_enabled: false, activity_tags: ['热门', '新上线'] },
    ],
    control: { ...defaultControl },
    created_at: '2026-05-20 11:00:00',
    updated_at: '2026-05-20 11:00:00',
  },
];

// ==================== 卡券中心 ====================

export const couponCenterConfigs: CouponCenterConfig[] = [
  {
    id: 'coupon-001',
    resource_position: '卡券中心',
    remark: '6月卡券配置',
    status: 'active',
    channels: ['A', 'B', 'C', 'D'],
    coupon_list: [
      { coupon_order: 1, coupon_name: '手续费抵扣券', coupon_value: '9折', use_condition: '单笔交易≥100 USDT', validity_period: ['2026-06-01', '2026-06-30'], remaining_count: 500, claim_link: '/coupon/claim/1', coupon_status: '可领取' },
      { coupon_order: 2, coupon_name: '充值返现券', coupon_value: '10 USDT', use_condition: '单笔充值≥50 USDT', validity_period: ['2026-06-01', '2026-06-15'], remaining_count: 200, claim_link: '/coupon/claim/2', coupon_status: '可领取' },
      { coupon_order: 3, coupon_name: '合约体验券', coupon_value: '50 USDT', use_condition: '仅合约交易可用', validity_period: ['2026-05-01', '2026-05-31'], remaining_count: 0, claim_link: '/coupon/claim/3', coupon_status: '已过期' },
    ],
    control: { ...defaultControl },
    created_at: '2026-05-19 10:00:00',
    updated_at: '2026-05-19 10:00:00',
  },
];

// ==================== 行情区资源位 ====================

export const marketBannerConfigs: BannerConfig[] = [
  {
    id: 'market-001',
    resource_position: '行情区资源位',
    priority: 330,
    remark: '新币上线推广',
    banner_image: 'https://picsum.photos/750/200?random=70',
    link: '/market/new-coin',
    start_time: '2026-05-22 00:00:00',
    end_time: '2026-06-05 23:59:59',
    channels: ['A', 'B', 'C', 'D'],
    status: 'active',
    control: { ...defaultControl },
    created_at: '2026-05-21 10:00:00',
    updated_at: '2026-05-21 10:00:00',
  },
];

// ==================== 交易对推荐位 ====================

export const tradingPairRecConfigs: BannerConfig[] = [
  {
    id: 'tradepair-001',
    resource_position: '交易对推荐位',
    priority: 331,
    remark: 'BTC交易对推荐',
    banner_image: 'https://picsum.photos/750/200?random=71',
    link: '/trade/BTC-USDT',
    start_time: '2026-05-20 00:00:00',
    end_time: '2026-06-20 23:59:59',
    channels: ['A', 'B', 'C', 'D'],
    status: 'active',
    control: { ...defaultControl },
    created_at: '2026-05-19 14:00:00',
    updated_at: '2026-05-19 14:00:00',
  },
];

// ==================== 搜索栏 ====================

export const searchBarConfigs: SearchBarConfig[] = [
  {
    id: 'search-001',
    resource_position: '搜索栏',
    hot_keywords: ['BTC', 'ETH', 'SOL', 'PEPE', 'DOGE', '跟单', '网格交易', 'Launchpad'],
    placeholder_text: '搜索币种 / 交易对',
    channels: ['A', 'B', 'C', 'D'],
    status: 'active',
    created_at: '2026-05-01 00:00:00',
    updated_at: '2026-05-20 10:00:00',
  },
];

// ==================== PUSH推送 ====================

export const pushConfigs: PushConfig[] = [
  {
    id: 'push-001',
    push_name: 'BTC突破10万U提醒',
    push_type: 'trade_alert',
    push_title: 'BTC 突破 $100,000！',
    push_body: 'BTC 刚刚突破 $100,000 大关，近24小时涨幅 8.5%，点击查看详情',
    push_icon: 'https://picsum.photos/48/48?random=80',
    deeplink: '/trade/BTC-USDT',
    push_channel: ['APP推送', '站内信'],
    start_time: '2026-05-20 00:00:00',
    end_time: '2026-06-20 23:59:59',
    status: 'completed',
    push_priority: 'high',
    activity_id: 'btc-100k',
    control: { ...defaultControl, frequency_control: '每日', frequency_cap: 1, time_window: ['09:00', '21:00'] },
    daily_cap: 3,
    weekly_cap: 10,
    monthly_cap: 30,
    type_cap: [{ push_type: 'trade_alert', type_daily_cap: 2 }],
    channel_cap: [{ channel: 'APP推送', channel_daily_cap: 3 }],
    priority_override: true,
    trigger_type: 'event',
    event_id: 'btc_price_100k',
    batch_delivery: true,
    batch_ratio: 10,
    created_at: '2026-05-20 14:00:00',
    updated_at: '2026-05-20 14:30:00',
  },
  {
    id: 'push-002',
    push_name: '沉默用户召回6月',
    push_type: 'recall',
    push_title: '{username}，你的专属奖励等你领取',
    push_body: '你已经 15 天没有登录了！回来完成任意交易即可领取 20 USDT 回归奖励',
    push_icon: 'https://picsum.photos/48/48?random=81',
    deeplink: '/activity/recall',
    push_channel: ['APP推送', '站内信'],
    start_time: '2026-06-01 00:00:00',
    end_time: '2026-06-15 23:59:59',
    status: 'pending',
    push_priority: 'low',
    control: { ...defaultControl, frequency_control: '每周', frequency_cap: 1, time_window: ['10:00', '20:00'], dnd_time_range: ['22:00', '08:00'] },
    daily_cap: 3,
    weekly_cap: 10,
    monthly_cap: 30,
    type_cap: [{ push_type: 'recall', type_daily_cap: 1 }],
    channel_cap: [{ channel: 'APP推送', channel_daily_cap: 3 }],
    priority_override: false,
    trigger_type: 'crowd',
    batch_delivery: true,
    batch_ratio: 10,
    created_at: '2026-05-21 10:00:00',
    updated_at: '2026-05-21 10:00:00',
  },
  {
    id: 'push-003',
    push_name: 'Meme币狂欢周活动推送',
    push_type: 'activity',
    push_title: 'Meme币狂欢周火热进行中！',
    push_body: '交易指定Meme币享手续费5折优惠，瓜分10,000 USDT奖池！',
    deeplink: '/activity/meme-week',
    push_channel: ['APP推送', '站内信', '短信'],
    start_time: '2026-05-22 10:00:00',
    end_time: '2026-05-29 23:59:59',
    status: 'sending',
    push_priority: 'medium',
    control: { ...defaultControl, frequency_control: '每日', frequency_cap: 1, time_window: ['09:00', '21:00'] },
    daily_cap: 3,
    weekly_cap: 10,
    monthly_cap: 30,
    type_cap: [],
    channel_cap: [],
    priority_override: false,
    trigger_type: 'scheduled',
    scheduled_time: '2026-05-22 10:00:00',
    batch_delivery: true,
    batch_ratio: 20,
    created_at: '2026-05-21 18:00:00',
    updated_at: '2026-05-22 10:00:00',
  },
];

// ==================== 导航菜单 ====================

export const navMenuItems: NavMenuItem[] = [
  { id: 'nav-01', name: '交易', code: 'trade', link: '/trade', is_new: false, sort_order: 1, parent_menu: '顶部导航栏', status: 'active' },
  { id: 'nav-02', name: '合约', code: 'futures', link: '/futures', is_new: false, sort_order: 2, parent_menu: '顶部导航栏', status: 'active' },
  { id: 'nav-03', name: '工具', code: 'tools', link: '/tools', is_new: false, sort_order: 3, parent_menu: '顶部导航栏', status: 'active' },
  { id: 'nav-04', name: '金融', code: 'finance', link: '/finance', is_new: false, sort_order: 4, parent_menu: '顶部导航栏', status: 'active' },
  { id: 'nav-05', name: '活动', code: 'activity', link: '/activity', is_new: false, sort_order: 5, parent_menu: '顶部导航栏', status: 'active' },
  { id: 'nav-06', name: 'AI交易套件', code: 'ai_trading', link: '/ai-trading', is_new: true, sort_order: 1, parent_menu: '"更多"下拉菜单', status: 'active' },
  { id: 'nav-07', name: '邀请返佣', code: 'referral', link: '/referral', is_new: true, sort_order: 1, parent_menu: '"更多"下拉左列', status: 'active' },
  { id: 'nav-08', name: 'XT合伙人', code: 'partner', link: '/partner', is_new: false, sort_order: 2, parent_menu: '"更多"下拉左列', status: 'active' },
  { id: 'nav-09', name: '经纪人', code: 'broker', link: '/broker', is_new: true, sort_order: 3, parent_menu: '"更多"下拉左列', status: 'active' },
  { id: 'nav-10', name: 'XT智能链', code: 'smart_chain', link: '/smart-chain', is_new: false, sort_order: 4, parent_menu: '"更多"下拉左列', status: 'active' },
  { id: 'nav-11', name: '实验室', code: 'lab', link: '/lab', is_new: false, sort_order: 5, parent_menu: '"更多"下拉左列', status: 'active' },
  { id: 'nav-12', name: '公告', code: 'announce', link: '/announce', is_new: false, sort_order: 1, parent_menu: '"更多"下拉右列', status: 'active' },
  { id: 'nav-13', name: 'XT博客', code: 'blog', link: '/blog', is_new: false, sort_order: 2, parent_menu: '"更多"下拉右列', status: 'active' },
  { id: 'nav-14', name: '学院', code: 'academy', link: '/academy', is_new: false, sort_order: 3, parent_menu: '"更多"下拉右列', status: 'active' },
  { id: 'nav-15', name: '上币', code: 'listing', link: '/listing', is_new: false, sort_order: 4, parent_menu: '"更多"下拉右列', status: 'active' },
  { id: 'nav-16', name: 'AI交易套件', code: 'nav_ai', link: '/ai-trading', is_new: true, sort_order: 5, parent_menu: '"更多"下拉右列', status: 'active' },
];

// ==================== 人群包 ====================

export const crowdPackages: CrowdPackage[] = [
  // 用户生命周期
  { id: 'crowd-01', crowd_name: '新注册用户（0-3天）', crowd_code: 'new_user_3d', crowd_category: 'lifecycle', filter_rules: '注册时间 ≤ 3天', typical_scenario: '新人引导弹窗、新人专享任务', estimated_users: 12500, linked_positions: 3, status: 'active', logic_type: 'AND', created_at: '2026-04-01', updated_at: '2026-04-01' },
  { id: 'crowd-02', crowd_name: '新注册用户（4-7天）', crowd_code: 'new_user_7d', crowd_category: 'lifecycle', filter_rules: '注册时间 4-7天', typical_scenario: '首充/首交任务提醒', estimated_users: 10800, linked_positions: 2, status: 'active', logic_type: 'AND', created_at: '2026-04-01', updated_at: '2026-04-01' },
  { id: 'crowd-03', crowd_name: '新注册用户（8-30天）', crowd_code: 'new_user_30d', crowd_category: 'lifecycle', filter_rules: '注册时间 8-30天', typical_scenario: '成长任务、交易引导', estimated_users: 28500, linked_positions: 2, status: 'active', logic_type: 'AND', created_at: '2026-04-01', updated_at: '2026-04-01' },
  { id: 'crowd-04', crowd_name: '未完成KYC用户', crowd_code: 'kyc_incomplete', crowd_category: 'lifecycle', filter_rules: 'KYC状态=未完成 AND 注册≥1天', typical_scenario: 'KYC完成引导弹窗、PUSH提醒', estimated_users: 15200, linked_positions: 1, status: 'active', logic_type: 'AND', created_at: '2026-04-01', updated_at: '2026-04-01' },
  { id: 'crowd-05', crowd_name: '活跃交易用户', crowd_code: 'active_trader', crowd_category: 'lifecycle', filter_rules: '最近7天登录≥5天 AND 交易笔数≥3', typical_scenario: '新功能推广、活动推送', estimated_users: 45000, linked_positions: 5, status: 'active', logic_type: 'AND', created_at: '2026-04-01', updated_at: '2026-04-01' },
  { id: 'crowd-06', crowd_name: '沉默用户（7-14天未登录）', crowd_code: 'silent_7d', crowd_category: 'lifecycle', filter_rules: '最近登录≥7天前 AND ≤14天前', typical_scenario: '站内回流弹窗', estimated_users: 32000, linked_positions: 1, status: 'active', logic_type: 'AND', created_at: '2026-04-01', updated_at: '2026-04-01' },
  { id: 'crowd-07', crowd_name: '沉默用户（15-30天未登录）', crowd_code: 'silent_15d', crowd_category: 'lifecycle', filter_rules: '最近登录≥15天前 AND ≤30天前', typical_scenario: 'PUSH召回、专属任务', estimated_users: 18000, linked_positions: 2, status: 'active', logic_type: 'AND', created_at: '2026-04-01', updated_at: '2026-04-01' },
  { id: 'crowd-08', crowd_name: '流失用户（30天+未登录）', crowd_code: 'churned_30d', crowd_category: 'lifecycle', filter_rules: '最近登录≥30天前', typical_scenario: '大额召回奖励PUSH', estimated_users: 25000, linked_positions: 1, status: 'active', logic_type: 'AND', created_at: '2026-04-01', updated_at: '2026-04-01' },
  // 交易行为
  { id: 'crowd-09', crowd_name: '合约高频交易用户', crowd_code: 'futures_high_freq', crowd_category: 'trading', filter_rules: '合约交易笔数≥20笔/周 AND 合约交易额≥10,000 USDT/周', typical_scenario: '合约新功能推广、Trading Bot推荐', estimated_users: 8500, linked_positions: 3, status: 'active', logic_type: 'AND', created_at: '2026-04-01', updated_at: '2026-04-01' },
  { id: 'crowd-10', crowd_name: '合约跟单用户', crowd_code: 'copy_trading_user', crowd_category: 'trading', filter_rules: '有跟单历史（跟单≥1笔）', typical_scenario: '跟单优化功能、优质交易员推荐', estimated_users: 12000, linked_positions: 2, status: 'active', logic_type: 'AND', created_at: '2026-04-01', updated_at: '2026-04-01' },
  { id: 'crowd-11', crowd_name: '现货高频交易用户', crowd_code: 'spot_high_freq', crowd_category: 'trading', filter_rules: '现货交易笔数≥30笔/周 AND 现货交易额≥5,000 USDT/周', typical_scenario: '现货新币推荐、VIP升级引导', estimated_users: 15000, linked_positions: 2, status: 'active', logic_type: 'AND', created_at: '2026-04-01', updated_at: '2026-04-01' },
  { id: 'crowd-12', crowd_name: '大额单笔交易用户', crowd_code: 'big_trade_user', crowd_category: 'trading', filter_rules: '单笔交易额≥50,000 USDT（近30天）', typical_scenario: 'VIP专属任务、大客户运营', estimated_users: 3500, linked_positions: 2, status: 'active', logic_type: 'AND', created_at: '2026-04-01', updated_at: '2026-04-01' },
  // 渠道来源
  { id: 'crowd-13', crowd_name: '邀请注册用户（直邀）', crowd_code: 'referral_direct', crowd_category: 'channel_source', filter_rules: '注册来源=邀请链接 AND 层级=1', typical_scenario: '裂变任务、邀请返佣提醒', estimated_users: 22000, linked_positions: 1, status: 'active', logic_type: 'AND', created_at: '2026-04-01', updated_at: '2026-04-01' },
  { id: 'crowd-14', crowd_name: '社交媒体用户', crowd_code: 'social_media', crowd_category: 'channel_source', filter_rules: '注册来源=Twitter/Telegram/YouTube/Discord', typical_scenario: '社群活动推广、KOL联名活动', estimated_users: 35000, linked_positions: 1, status: 'active', logic_type: 'AND', created_at: '2026-04-01', updated_at: '2026-04-01' },
  // 区域市场
  { id: 'crowd-15', crowd_name: '俄罗斯/CIS用户', crowd_code: 'region_russia_cis', crowd_category: 'region', filter_rules: 'IP/手机归属地=俄罗斯/乌克兰/哈萨克斯坦等', typical_scenario: '合约活动弹窗（俄语）、Telegram社群引导', estimated_users: 18000, linked_positions: 2, status: 'active', logic_type: 'AND', created_at: '2026-04-01', updated_at: '2026-04-01' },
  { id: 'crowd-16', crowd_name: '土耳其用户', crowd_code: 'region_turkey', crowd_category: 'region', filter_rules: 'IP/手机归属地=土耳其', typical_scenario: 'P2P入金引导弹窗、里拉活动', estimated_users: 12000, linked_positions: 1, status: 'active', logic_type: 'AND', created_at: '2026-04-01', updated_at: '2026-04-01' },
  { id: 'crowd-17', crowd_name: '东南亚用户', crowd_code: 'region_sea', crowd_category: 'region', filter_rules: 'IP/手机归属地=印尼/越南/菲律宾/泰国', typical_scenario: '新币上线推广、邀请裂变活动', estimated_users: 28000, linked_positions: 3, status: 'active', logic_type: 'AND', created_at: '2026-04-01', updated_at: '2026-04-01' },
  { id: 'crowd-18', crowd_name: '韩国用户', crowd_code: 'region_korea', crowd_category: 'region', filter_rules: 'IP/手机归属地=韩国', typical_scenario: '高频交易工具推广、深度行情功能', estimated_users: 9500, linked_positions: 1, status: 'active', logic_type: 'AND', created_at: '2026-04-01', updated_at: '2026-04-01' },
  // 资产等级
  { id: 'crowd-19', crowd_name: '零资产用户', crowd_code: 'zero_balance', crowd_category: 'asset', filter_rules: '账户总资产=0 AND 注册≥1天', typical_scenario: '首充任务推送、入金引导', estimated_users: 20000, linked_positions: 2, status: 'active', logic_type: 'AND', created_at: '2026-04-01', updated_at: '2026-04-01' },
  { id: 'crowd-20', crowd_name: '高额资产用户（10,000-100,000 USDT）', crowd_code: 'high_balance', crowd_category: 'asset', filter_rules: '总资产 10,000-100,000 USDT', typical_scenario: 'VIP灵活储蓄、专属任务', estimated_users: 5800, linked_positions: 2, status: 'active', logic_type: 'AND', created_at: '2026-04-01', updated_at: '2026-04-01' },
  { id: 'crowd-21', crowd_name: '超高净值用户（≥100,000 USDT）', crowd_code: 'whale', crowd_category: 'asset', filter_rules: '总资产 ≥ 100,000 USDT', typical_scenario: '1对1客户经理、专属活动邀请', estimated_users: 1200, linked_positions: 3, status: 'active', logic_type: 'AND', created_at: '2026-04-01', updated_at: '2026-04-01' },
  // 活跃度
  { id: 'crowd-22', crowd_name: '日活高频用户（DAU Power）', crowd_code: 'dau_power', crowd_category: 'activity', filter_rules: '最近7天登录≥6天 AND 平均每日交易≥3笔', typical_scenario: '新功能内测邀请、产品反馈收集', estimated_users: 6200, linked_positions: 2, status: 'active', logic_type: 'AND', created_at: '2026-04-01', updated_at: '2026-04-01' },
  { id: 'crowd-23', crowd_name: 'PUSH高响应用户', crowd_code: 'push_responder', crowd_category: 'activity', filter_rules: '近30天PUSH打开率≥30%', typical_scenario: '重要活动优先通过PUSH触达', estimated_users: 18000, linked_positions: 1, status: 'active', logic_type: 'AND', created_at: '2026-04-01', updated_at: '2026-04-01' },
  { id: 'crowd-24', crowd_name: '仅浏览未交易用户', crowd_code: 'browse_only', crowd_category: 'activity', filter_rules: '最近30天登录≥5天 AND 交易笔数=0', typical_scenario: '交易教学、零门槛体验活动', estimated_users: 14500, linked_positions: 2, status: 'active', logic_type: 'AND', created_at: '2026-04-01', updated_at: '2026-04-01' },
];

// ==================== 素材包 ====================

export const materialPackages: MaterialPackage[] = [
  {
    id: 'mat-001', name: 'BTC突破10万U弹窗素材', type: 'popup', resource_position_code: 'popup_operation', resource_position_name: '弹窗运营位',
    images: [
      { url: 'https://picsum.photos/750/1334?random=1', lang: 'zh-CN', desc: '弹窗背景图-中文版' },
      { url: 'https://picsum.photos/750/1334?random=90', lang: 'en', desc: '弹窗背景图-英文版' },
    ],
    texts: [
      { field: '弹窗标题', value: 'BTC 突破 $100,000！', lang: 'zh-CN' },
      { field: '弹窗标题', value: 'BTC Breaks $100,000!', lang: 'en' },
      { field: '按钮文案', value: '去参与', lang: 'zh-CN' },
      { field: '按钮文案', value: 'Join Now', lang: 'en' },
    ],
    links: [{ url: '/activity/btc-100k', lang: 'zh-CN' }, { url: '/en/activity/btc-100k', lang: 'en' }],
    status: 'active', created_at: '2026-05-18 10:00:00', updated_at: '2026-05-18 10:00:00',
  },
  {
    id: 'mat-002', name: 'ETH ETF头图素材', type: 'banner', resource_position_code: 'top_banner', resource_position_name: '顶部运营头图',
    images: [
      { url: 'https://picsum.photos/750/360?random=10', lang: 'zh-CN', desc: 'ETH ETF Banner-中文' },
      { url: 'https://picsum.photos/750/360?random=91', lang: 'en', desc: 'ETH ETF Banner-English' },
    ],
    texts: [],
    links: [{ url: '/activity/eth-etf', lang: 'zh-CN' }],
    status: 'active', created_at: '2026-05-19 09:00:00', updated_at: '2026-05-19 09:00:00',
  },
  {
    id: 'mat-003', name: '5月四宫图素材', type: 'grid', resource_position_code: 'bottom_grid', resource_position_name: '底部运营四宫图',
    images: [
      { url: 'https://picsum.photos/120/120?random=11', lang: 'zh-CN', desc: '邀请有礼图标' },
      { url: 'https://picsum.photos/120/120?random=12', lang: 'zh-CN', desc: '交易大赛图标' },
      { url: 'https://picsum.photos/120/120?random=13', lang: 'zh-CN', desc: '新手任务图标' },
      { url: 'https://picsum.photos/120/120?random=14', lang: 'zh-CN', desc: '理财专区图标' },
    ],
    texts: [
      { field: '宫格名称', value: '邀请有礼', lang: 'zh-CN' },
      { field: '宫格名称', value: '交易大赛', lang: 'zh-CN' },
      { field: '宫格名称', value: '新手任务', lang: 'zh-CN' },
      { field: '宫格名称', value: '理财专区', lang: 'zh-CN' },
    ],
    links: [{ url: '/activity/referral', lang: 'zh-CN' }, { url: '/activity/trading-contest', lang: 'zh-CN' }],
    status: 'active', created_at: '2026-04-28 11:00:00', updated_at: '2026-04-28 11:00:00',
  },
  {
    id: 'mat-004', name: 'Meme币活动推送素材', type: 'push', resource_position_code: 'push', resource_position_name: 'PUSH推送',
    images: [
      { url: 'https://picsum.photos/48/48?random=92', lang: 'zh-CN', desc: '推送小图标' },
    ],
    texts: [
      { field: '推送标题', value: 'Meme币狂欢周火热进行中！', lang: 'zh-CN' },
      { field: '推送内容', value: '交易指定Meme币享手续费5折优惠，瓜分10,000 USDT奖池！', lang: 'zh-CN' },
    ],
    links: [{ url: '/activity/meme-week', lang: 'zh-CN' }],
    status: 'active', created_at: '2026-05-21 18:00:00', updated_at: '2026-05-21 18:00:00',
  },
  {
    id: 'mat-005', name: '新人引导弹窗素材', type: 'popup', resource_position_code: 'new_user_guide_popup', resource_position_name: '新用户引导弹窗',
    images: [
      { url: 'https://picsum.photos/750/1334?random=40', lang: 'zh-CN', desc: '新人引导背景图' },
    ],
    texts: [
      { field: '弹窗标题', value: '欢迎来到 XT', lang: 'zh-CN' },
      { field: '引导文案', value: '完成新手任务，领取最高 8,888 USDT 新人奖励！', lang: 'zh-CN' },
      { field: '按钮文案', value: '开始探索', lang: 'zh-CN' },
    ],
    links: [{ url: '/newbie', lang: 'zh-CN' }],
    status: 'active', created_at: '2026-04-15 10:00:00', updated_at: '2026-04-15 10:00:00',
  },
];

// ==================== 渠道 ====================

export const channels: Channel[] = [
  { id: 'A', name: 'A 渠道', description: '主渠道-官方App', coverage_ratio: 45, linked_positions: 28, status: 'active' },
  { id: 'B', name: 'B 渠道', description: 'Google Play 渠道', coverage_ratio: 25, linked_positions: 22, status: 'active' },
  { id: 'C', name: 'C 渠道', description: 'App Store 渠道', coverage_ratio: 20, linked_positions: 20, status: 'active' },
  { id: 'D', name: 'D 渠道', description: '第三方合作渠道', coverage_ratio: 10, linked_positions: 12, status: 'active' },
];

// ==================== 排期 ====================

export const schedules: Schedule[] = [
  {
    id: 'sch-001', schedule_name: 'BTC交易大赛排期', bound_positions: ['popup-001', 'banner-001'], bound_position_names: ['弹窗运营位', '顶部运营头图'],
    schedule_mode: 'fixed', schedule_start: '2026-05-20 00:00:00', schedule_end: '2026-06-20 23:59:59',
    repeat_rule: '', auto_online_time: '2026-05-20 00:00:00', auto_offline_time: '2026-06-20 23:59:59',
    conflict_check: true, color: '#1890ff', status: 'active', created_at: '2026-05-18 10:00:00',
  },
  {
    id: 'sch-002', schedule_name: 'Meme币活动排期', bound_positions: ['marquee-002'], bound_position_names: ['首页跑马灯'],
    schedule_mode: 'fixed', schedule_start: '2026-05-22 00:00:00', schedule_end: '2026-05-29 23:59:59',
    repeat_rule: '', conflict_check: true, color: '#ff6b6b', status: 'active', created_at: '2026-05-21 14:00:00',
  },
  {
    id: 'sch-003', schedule_name: '每日跑马灯轮播', bound_positions: ['marquee-001'], bound_position_names: ['首页跑马灯'],
    schedule_mode: 'recurring', schedule_start: '2026-05-15 00:00:00', schedule_end: '2026-06-15 23:59:59',
    repeat_rule: '每天', repeat_time_range: ['09:00', '22:00'], conflict_check: true, color: '#52c41a', status: 'active', created_at: '2026-05-14 10:00:00',
  },
  {
    id: 'sch-004', schedule_name: '6月交易挑战排期', bound_positions: ['challenge-001'], bound_position_names: ['限时挑战'],
    schedule_mode: 'fixed', schedule_start: '2026-06-01 00:00:00', schedule_end: '2026-06-30 23:59:59',
    repeat_rule: '', auto_online_time: '2026-06-01 00:00:00', auto_offline_time: '2026-06-30 23:59:59',
    conflict_check: true, color: '#722ed1', status: 'draft', created_at: '2026-05-20 15:00:00',
  },
  {
    id: 'sch-005', schedule_name: '沉默召回排期', bound_positions: ['push-002'], bound_position_names: ['PUSH推送'],
    schedule_mode: 'recurring', schedule_start: '2026-06-01 00:00:00', schedule_end: '2026-06-15 23:59:59',
    repeat_rule: '每周一至周五', repeat_time_range: ['10:00', '20:00'], conflict_check: true, color: '#fa8c16', status: 'draft', created_at: '2026-05-21 10:00:00',
  },
];

// ==================== 监控配置 ====================

export const monitorConfigs: MonitorConfig[] = [
  {
    id: 'mon-001', monitor_name: '弹窗运营位监控', bound_positions: ['弹窗运营位'],
    metrics: ['曝光量', '点击量', '点击率(CTR)', '转化率(CVR)'],
    refresh_interval: '每5分钟', alert_enabled: true,
    alert_rules: [
      { metric: '点击率(CTR)', condition: '低于', threshold: 2, unit: '百分比(%)', duration: 30 },
      { metric: '曝光量', condition: '环比下降', threshold: 50, unit: '百分比(%)', duration: 60 },
    ],
    alert_channel: ['企业微信', '邮件'], alert_receivers: ['运营小明', '运营小红'],
  },
  {
    id: 'mon-002', monitor_name: 'PUSH推送全局监控', bound_positions: ['PUSH推送'],
    metrics: ['推送发送量', '送达率', '推送打开率', '推送转化率', '推送退订率'],
    refresh_interval: '实时', alert_enabled: true,
    alert_rules: [
      { metric: '送达率', condition: '低于', threshold: 85, unit: '百分比(%)', duration: 15 },
      { metric: '推送打开率', condition: '低于', threshold: 5, unit: '百分比(%)', duration: 30 },
      { metric: '推送退订率', condition: '高于', threshold: 3, unit: '百分比(%)', duration: 60 },
    ],
    alert_channel: ['企业微信', '短信'], alert_receivers: ['推送运营', '技术负责人'],
  },
  {
    id: 'mon-003', monitor_name: '首页资源位监控', bound_positions: ['顶部运营头图', '弹窗运营位', '首页跑马灯', '底部运营四宫图'],
    metrics: ['曝光量', '点击量', '点击率(CTR)', '去重曝光人数', '去重点击人数'],
    refresh_interval: '每小时', alert_enabled: false, alert_rules: [],
    alert_channel: [], alert_receivers: [],
  },
];

// ==================== 监控指标数据 ====================

export const metricData: MetricData[] = [
  { metric_name: '曝光量', metric_code: 'impressions', value: 2850000, change: 12.5, trend: [220, 235, 240, 255, 260, 280, 285], unit: '万次' },
  { metric_name: '点击量', metric_code: 'clicks', value: 342000, change: 8.3, trend: [28, 30, 31, 32, 33, 34, 34.2], unit: '万次' },
  { metric_name: '点击率(CTR)', metric_code: 'ctr', value: 12.0, change: -2.1, trend: [13.5, 13.2, 12.8, 12.5, 12.3, 12.1, 12.0], unit: '%' },
  { metric_name: '转化率(CVR)', metric_code: 'cvr', value: 5.8, change: 1.5, trend: [4.5, 4.8, 5.0, 5.2, 5.5, 5.6, 5.8], unit: '%' },
  { metric_name: '推送发送量', metric_code: 'push_sent', value: 485000, change: 15.2, trend: [35, 40, 42, 45, 47, 48, 48.5], unit: '万条' },
  { metric_name: '送达率', metric_code: 'delivery_rate', value: 92.5, change: 0.8, trend: [91.0, 91.5, 91.8, 92.0, 92.2, 92.3, 92.5], unit: '%' },
  { metric_name: '推送打开率', metric_code: 'open_rate', value: 8.2, change: -0.5, trend: [9.0, 8.8, 8.6, 8.5, 8.4, 8.3, 8.2], unit: '%' },
  { metric_name: '推送转化率', metric_code: 'push_cvr', value: 3.5, change: 0.3, trend: [2.8, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5], unit: '%' },
];

// ==================== 告警历史 ====================

export const alertHistories: AlertHistory[] = [
  { id: 'alert-001', monitor_name: '弹窗运营位监控', metric: '点击率(CTR)', condition: '低于', threshold: 2, actual_value: 1.8, level: '中', channel: '企业微信', status: '已处理', created_at: '2026-05-22 14:30:00' },
  { id: 'alert-002', monitor_name: 'PUSH推送全局监控', metric: '送达率', condition: '低于', threshold: 85, actual_value: 82.3, level: '高', channel: '企业微信+短信', status: '处理中', created_at: '2026-05-22 16:00:00' },
  { id: 'alert-003', monitor_name: '弹窗运营位监控', metric: '曝光量', condition: '环比下降', threshold: 50, actual_value: 45, level: '高', channel: '企业微信+邮件', status: '已处理', created_at: '2026-05-20 10:15:00' },
  { id: 'alert-004', monitor_name: 'PUSH推送全局监控', metric: '推送退订率', condition: '高于', threshold: 3, actual_value: 4.2, level: '高', channel: '企业微信+短信', status: '处理中', created_at: '2026-05-23 09:00:00' },
];
