import { initDB } from './db';
import db from './db';
import { v4 as uuid } from 'uuid';

initDB();

console.log('🌱 Seeding database...');

// Clear existing data
db.exec(`
  DELETE FROM analytics_events;
  DELETE FROM rule_chain;
  DELETE FROM schedules;
  DELETE FROM position_configs;
  DELETE FROM materials;
  DELETE FROM material_categories;
  DELETE FROM crowd_packs;
  DELETE FROM resource_positions;
`);

const now = new Date().toISOString();

// ─── Seed: 16 Resource Positions ───
const positions = [
  { code: 'popup_operation', name: '弹窗运营位', category: 'popup', priority_base: 353, description: '首页弹窗运营位，用于活动推广、功能引导' },
  { code: 'popup_new_user', name: '新用户引导弹窗', category: 'popup', priority_base: 352, description: '新用户首次打开APP引导弹窗' },
  { code: 'banner_top', name: '顶部运营头图', category: 'banner', priority_base: 351, description: '首页顶部Banner轮播图' },
  { code: 'banner_market', name: '行情区资源位', category: 'banner', priority_base: 350, description: '行情页Banner资源位' },
  { code: 'banner_trade_pair', name: '交易对推荐位', category: 'banner', priority_base: 330, description: '交易页交易对推荐' },
  { code: 'banner_launchpool', name: 'Launchpool Banner', category: 'banner', priority_base: 331, description: 'Launchpool活动入口Banner' },
  { code: 'icon_grid_bottom', name: '底部运营四宫图', category: 'icon_grid', priority_base: 350, description: '首页底部四宫格运营入口' },
  { code: 'icon_grid_welfare', name: '福利中心入口', category: 'icon_grid', priority_base: 340, description: '福利中心固定入口' },
  { code: 'marquee_home', name: '首页跑马灯', category: 'marquee', priority_base: 340, description: '首页顶部文字滚动通知' },
  { code: 'task_new_user', name: '新人专享任务', category: 'task', priority_base: 363, description: '新人专属任务入口' },
  { code: 'task_growth', name: '成长任务', category: 'task', priority_base: 362, description: '用户成长体系任务' },
  { code: 'task_exclusive', name: '专属任务', category: 'task', priority_base: 361, description: 'VIP专属任务' },
  { code: 'task_limited', name: '限时挑战', category: 'task', priority_base: 360, description: '限时活动挑战任务' },
  { code: 'task_first_deposit', name: '首充任务', category: 'task', priority_base: 359, description: '首次充值引导任务' },
  { code: 'task_first_trade', name: '首次交易任务', category: 'task', priority_base: 358, description: '首次交易引导任务' },
  { code: 'info_calendar', name: '活动日历', category: 'info', priority_base: 340, description: '活动日历聚合页入口' },
  { code: 'info_coupon', name: '卡券中心', category: 'info', priority_base: 340, description: '卡券中心入口' },
  { code: 'widget_ai_trending', name: 'AI Trending Widget', category: 'widget', priority_base: 335, description: 'AI驱动的热门币种推荐组件' },
];

const positionIds: Record<string, string> = {};
const insertPos = db.prepare(
  'INSERT INTO resource_positions (id, code, name, category, priority_base, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
);
for (const p of positions) {
  const id = uuid();
  positionIds[p.code] = id;
  insertPos.run(id, p.code, p.name, p.category, p.priority_base, p.description, 'online', now);
}
console.log(`  ✅ ${positions.length} resource positions`);

// ─── Seed: Crowd Packs ───
const crowdPacks = [
  { name: '全量用户', description: '平台所有注册用户', rules: '[]', logic: 'AND', status: 'active', user_count: 500000 },
  { name: 'VIP用户(SVIP+LV5)', description: 'SVIP及以上等级用户', rules: JSON.stringify([
    { dimension: 'member_level', operator: 'gte', value: '5' },
  ]), logic: 'AND', status: 'active', user_count: 25000 },
  { name: '新注册用户(7天内)', description: '7天内新注册用户', rules: JSON.stringify([
    { dimension: 'register_days', operator: 'lte', value: '7' },
  ]), logic: 'AND', status: 'active', user_count: 35000 },
  { name: '高价值交易用户', description: '月交易额>$100k活跃用户', rules: JSON.stringify([
    { dimension: 'consume_amount', operator: 'gte', value: '100000' },
    { dimension: 'login_active', operator: 'eq', value: 'true' },
  ]), logic: 'AND', status: 'active', user_count: 15000 },
  { name: '沉默用户(7-30天未活跃)', description: '7-30天未活跃的沉默用户', rules: JSON.stringify([
    { dimension: 'user_type', operator: 'eq', value: 'silent_user' },
  ]), logic: 'AND', status: 'active', user_count: 80000 },
  { name: 'iOS设备用户', description: 'iOS平台用户', rules: JSON.stringify([
    { dimension: 'custom_tags', operator: 'contains', value: 'ios' },
  ]), logic: 'AND', status: 'active', user_count: 200000 },
  { name: 'Android设备用户', description: 'Android平台用户', rules: JSON.stringify([
    { dimension: 'custom_tags', operator: 'contains', value: 'android' },
  ]), logic: 'AND', status: 'active', user_count: 300000 },
  { name: '合约交易用户', description: '有合约交易行为的用户', rules: JSON.stringify([
    { dimension: 'custom_tags', operator: 'contains', value: 'futures_trader' },
  ]), logic: 'AND', status: 'active', user_count: 45000 },
];

const crowdPackIds: Record<string, string> = {};
const insertCrowd = db.prepare(
  'INSERT INTO crowd_packs (id, name, description, rules, logic, status, user_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
);
for (const cp of crowdPacks) {
  const id = uuid();
  crowdPackIds[cp.name] = id;
  insertCrowd.run(id, cp.name, cp.description, cp.rules, cp.logic, cp.status, cp.user_count, now, now);
}
console.log(`  ✅ ${crowdPacks.length} crowd packs`);

// ─── Seed: Material Categories ───
const categories = [
  { name: 'Banner素材', description: '顶部Banner/头图类素材', sort_order: 1 },
  { name: '弹窗素材', description: '弹窗运营位素材', sort_order: 2 },
  { name: '四宫图/图标', description: '底部四宫格及功能图标素材', sort_order: 3 },
  { name: '跑马灯/文字', description: '跑马灯及文字滚动类素材', sort_order: 4 },
  { name: '任务素材', description: '任务体系相关素材', sort_order: 5 },
];

const categoryIds: Record<string, string> = {};
for (const cat of categories) {
  const id = uuid();
  categoryIds[cat.name] = id;
  db.prepare('INSERT INTO material_categories (id, name, description, sort_order) VALUES (?, ?, ?, ?)')
    .run(id, cat.name, cat.description, cat.sort_order);
}
console.log(`  ✅ ${categories.length} material categories`);

// ─── Seed: Materials ───
const materials = [
  { name: '跟单交易推广Banner', type: 'image', category: 'Banner素材', tags: ['跟单', '交易', '推广'],
    content: JSON.stringify({ zh: { title: '一键跟单，轻松盈利', subtitle: '专业交易员带你飞' }, en: { title: 'Copy Trading Made Easy', subtitle: 'Follow pro traders' }, 'zh-TW': { title: '一鍵跟單，輕鬆盈利', subtitle: '專業交易員帶你飛' }, ja: { title: 'コピートレードで簡単利益', subtitle: 'プロトレーダーが導きます' }, ko: { title: '카피 트레이딩으로 쉽게 수익', subtitle: '프로 트레이더가 안내합니다' } }),
    file_url: 'https://placehold.co/750x300/FF6B35/white?text=Copy+Trading', fallback_url: 'https://placehold.co/750x300/EEE/white?text=Promo', file_size: 245760, dimensions: '750x300' },
  { name: '新用户引导弹窗', type: 'image', category: '弹窗素材', tags: ['新用户', '引导', 'onboarding'],
    content: JSON.stringify({ zh: { title: '欢迎来到XT', subtitle: '新人专属福利等你领' }, en: { title: 'Welcome to XT', subtitle: 'Claim your new user rewards' }, 'zh-TW': { title: '歡迎來到XT', subtitle: '新人專屬福利等你領' }, ja: { title: 'XTへようこそ', subtitle: '新規ユーザー特典を獲得' }, ko: { title: 'XT에 오신 것을 환영합니다', subtitle: '신규 회원 혜택을 받으세요' } }),
    file_url: 'https://placehold.co/600x800/4F46E5/white?text=New+User', fallback_url: 'https://placehold.co/600x800/EEE/white?text=Welcome', file_size: 512000, dimensions: '600x800' },
  { name: '灵活储蓄产品推广', type: 'image', category: 'Banner素材', tags: ['理财', 'Earn', '储蓄'],
    content: JSON.stringify({ zh: { title: '灵活储蓄，随存随取', subtitle: '年化收益高达15%' }, en: { title: 'Flexible Savings', subtitle: 'Up to 15% APR' } }),
    file_url: 'https://placehold.co/750x300/059669/white?text=Earn', fallback_url: 'https://placehold.co/750x300/EEE/white?text=Earn', file_size: 189440, dimensions: '750x300' },
  { name: 'Launchpool活动Banner', type: 'image', category: 'Banner素材', tags: ['Launchpool', '新币', '活动'],
    content: JSON.stringify({ zh: { title: '新币Launchpool上线', subtitle: '质押XT解锁新币奖励' }, en: { title: 'New Launchpool', subtitle: 'Stake XT to earn new tokens' } }),
    file_url: 'https://placehold.co/750x300/DC2626/white?text=Launchpool', fallback_url: 'https://placehold.co/750x300/EEE/white?text=Event', file_size: 201728, dimensions: '750x300' },
  { name: 'AI交易报告头图', type: 'image', category: 'Banner素材', tags: ['AI', '交易报告', '行情'],
    content: JSON.stringify({ zh: { title: 'AI智能交易报告', subtitle: '每日行情分析，助你决策' }, en: { title: 'AI Trading Report', subtitle: 'Daily market insights' } }),
    file_url: 'https://placehold.co/750x300/7C3AED/white?text=AI+Report', fallback_url: 'https://placehold.co/750x300/EEE/white?text=AI', file_size: 178432, dimensions: '750x300' },
  { name: '新春交易大赛弹窗', type: 'image', category: '弹窗素材', tags: ['春节', '活动', '交易大赛'],
    content: JSON.stringify({ zh: { title: '新春交易大赛', subtitle: '百万奖池等你来瓜分' }, en: { title: 'Spring Trading Competition', subtitle: 'Million prize pool' } }),
    file_url: 'https://placehold.co/600x800/DC2626/white?text=Spring+Event', fallback_url: 'https://placehold.co/600x800/EEE/white?text=Event', file_size: 409600, dimensions: '600x800' },
  { name: '安全通知跑马灯', type: 'text', category: '跑马灯/文字', tags: ['安全', '通知', '跑马灯'],
    content: JSON.stringify({ zh: { text: '⚠️ 请注意识别官方渠道，谨防钓鱼诈骗。XT官方不会以任何形式索要您的密码或私钥。' }, en: { text: '⚠️ Beware of phishing scams. XT will never ask for your password or private key.' } }),
    file_url: '', fallback_url: '', file_size: 0, dimensions: '' },
  { name: '福利中心四宫图', type: 'image', category: '四宫图/图标', tags: ['福利', '签到', '奖励'],
    content: JSON.stringify({ zh: { title: '福利中心', subtitle: '每日签到领奖励' }, en: { title: 'Rewards Hub', subtitle: 'Daily check-in rewards' } }),
    file_url: 'https://placehold.co/400x400/F59E0B/white?text=Rewards', fallback_url: 'https://placehold.co/400x400/EEE/white?text=Rewards', file_size: 98304, dimensions: '400x400' },
  { name: '合约交易大赛Banner', type: 'image', category: 'Banner素材', tags: ['合约', '交易大赛', '竞赛'],
    content: JSON.stringify({ zh: { title: '合约交易大赛', subtitle: '百万USDT奖池' }, en: { title: 'Futures Trading Competition', subtitle: '1M USDT Prize Pool' } }),
    file_url: 'https://placehold.co/750x300/F59E0B/white?text=Futures+Comp', fallback_url: 'https://placehold.co/750x300/EEE/white?text=Competition', file_size: 234560, dimensions: '750x300' },
  { name: 'VIP专属权益弹窗', type: 'image', category: '弹窗素材', tags: ['VIP', '专属', '权益'],
    content: JSON.stringify({ zh: { title: 'VIP专属权益升级', subtitle: '更高返佣、更低费率' }, en: { title: 'VIP Benefits Upgrade', subtitle: 'Higher rebates, lower fees' } }),
    file_url: 'https://placehold.co/600x800/7C3AED/white?text=VIP+Benefits', fallback_url: 'https://placehold.co/600x800/EEE/white?text=VIP', file_size: 389120, dimensions: '600x800' },
  { name: '每日签到图标', type: 'image', category: '四宫图/图标', tags: ['签到', '每日', '图标'],
    content: JSON.stringify({ zh: { title: '每日签到', subtitle: '连续签到赢大奖' }, en: { title: 'Daily Check-in', subtitle: 'Win big rewards' } }),
    file_url: 'https://placehold.co/400x400/52C41A/white?text=Check-in', fallback_url: 'https://placehold.co/400x400/EEE/white?text=Check-in', file_size: 65536, dimensions: '400x400' },
  { name: '新币上线公告', type: 'text', category: '跑马灯/文字', tags: ['新币', '上线', '公告'],
    content: JSON.stringify({ zh: { text: '🎉 新币上线通知：PEPE/USDT 现已开放交易，快去交易吧！' }, en: { text: '🎉 New listing: PEPE/USDT is now available for trading!' } }),
    file_url: '', fallback_url: '', file_size: 0, dimensions: '' },
  { name: 'KYC认证引导图', type: 'image', category: '任务素材', tags: ['KYC', '认证', '引导'],
    content: JSON.stringify({ zh: { title: '完成KYC认证', subtitle: '解锁更多交易权限' }, en: { title: 'Complete KYC', subtitle: 'Unlock more trading features' } }),
    file_url: 'https://placehold.co/750x300/1890FF/white?text=KYC', fallback_url: 'https://placehold.co/750x300/EEE/white?text=KYC', file_size: 156672, dimensions: '750x300' },
  { name: '首充奖励Banner', type: 'image', category: '任务素材', tags: ['首充', '奖励', '引导'],
    content: JSON.stringify({ zh: { title: '首次充值即送', subtitle: '最高返现100 USDT' }, en: { title: 'First Deposit Bonus', subtitle: 'Up to 100 USDT cashback' } }),
    file_url: 'https://placehold.co/750x300/FF4D4F/white?text=First+Deposit', fallback_url: 'https://placehold.co/750x300/EEE/white?text=Deposit', file_size: 212992, dimensions: '750x300' },
];

const materialIds: Record<string, string> = {};
const insertMat = db.prepare(
  'INSERT INTO materials (id, name, type, category_id, tags, content, file_url, fallback_url, file_size, dimensions, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
);
for (const m of materials) {
  const id = uuid();
  materialIds[m.name] = id;
  insertMat.run(id, m.name, m.type, categoryIds[m.category] || null, JSON.stringify(m.tags || []),
    m.content, m.file_url, m.fallback_url, m.file_size, m.dimensions,
    'online', now, now);
}
console.log(`  ✅ ${materials.length} materials`);

// ─── Seed: Position Configs (人货场绑定) ───
const configDefs = [
  { pos: 'popup_operation', crowd: '全量用户', material: '新春交易大赛弹窗', priority: 353, device: 'all', gray: 100, status: 'online' },
  { pos: 'popup_operation', crowd: 'VIP用户(SVIP+LV5)', material: 'VIP专属权益弹窗', priority: 355, device: 'all', gray: 30, status: 'online' },
  { pos: 'popup_new_user', crowd: '新注册用户(7天内)', material: '新用户引导弹窗', priority: 352, device: 'all', gray: 100, status: 'online' },
  { pos: 'banner_top', crowd: '全量用户', material: 'Launchpool活动Banner', priority: 351, device: 'all', gray: 100, status: 'online' },
  { pos: 'banner_top', crowd: '高价值交易用户', material: 'AI交易报告头图', priority: 360, device: 'all', gray: 50, status: 'online' },
  { pos: 'banner_market', crowd: '合约交易用户', material: '跟单交易推广Banner', priority: 350, device: 'all', gray: 100, status: 'online' },
  { pos: 'icon_grid_bottom', crowd: '全量用户', material: '福利中心四宫图', priority: 350, device: 'all', gray: 100, status: 'online' },
  { pos: 'marquee_home', crowd: '全量用户', material: '安全通知跑马灯', priority: 340, device: 'all', gray: 100, status: 'online' },
  { pos: 'banner_top', crowd: '全量用户', material: '合约交易大赛Banner', priority: 349, device: 'all', gray: 100, status: 'draft' },
  { pos: 'task_new_user', crowd: '新注册用户(7天内)', material: '新用户引导弹窗', priority: 363, device: 'all', gray: 100, status: 'online' },
  { pos: 'task_new_user', crowd: '新注册用户(7天内)', material: '首充奖励Banner', priority: 362, device: 'all', gray: 100, status: 'online' },
  { pos: 'task_first_deposit', crowd: '全量用户', material: '首充奖励Banner', priority: 359, device: 'all', gray: 100, status: 'online' },
  { pos: 'task_first_trade', crowd: '全量用户', material: 'KYC认证引导图', priority: 358, device: 'all', gray: 100, status: 'online' },
  { pos: 'marquee_home', crowd: '全量用户', material: '新币上线公告', priority: 339, device: 'all', gray: 100, status: 'online' },
  { pos: 'icon_grid_bottom', crowd: '全量用户', material: '每日签到图标', priority: 349, device: 'all', gray: 100, status: 'online' },
];

const insertConfig = db.prepare(`
  INSERT INTO position_configs (
    id, resource_position_id, crowd_pack_id, material_id, priority,
    start_time, end_time, channels, device_type, gray_ratio, ab_group,
    freq_limit_type, freq_limit_count, regions, region_type, status, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertRule = db.prepare(
  'INSERT INTO rule_chain (id, config_id, step_order, rule_type, enabled, params) VALUES (?, ?, ?, ?, ?, ?)'
);

const ruleChain = [
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

for (const c of configDefs) {
  const configId = uuid();
  insertConfig.run(
    configId, positionIds[c.pos],
    crowdPackIds[c.crowd] || null,
    materialIds[c.material],
    c.priority, '', '', '[]', c.device, c.gray, '',
    'none', 0, '[]', 'whitelist', c.status, now, now
  );

  // Create rule chain for each config
  for (const step of ruleChain) {
    insertRule.run(uuid(), configId, step.step, step.rule, 1, '{}');
  }
}
console.log(`  ✅ ${configDefs.length} position configs (人货场 binding)`);

// ─── Seed: Sample analytics events ───
const eventTypes = ['exposure', 'click', 'conversion'];
const insertEvent = db.prepare(
  'INSERT INTO analytics_events (id, config_id, position_id, event_type, user_id, device_info) VALUES (?, ?, ?, ?, ?, ?)'
);

// Get first config for events
const allConfigs = db.prepare('SELECT id, resource_position_id FROM position_configs').all() as any[];

const insertEventsBatch = db.transaction(() => {
  for (const config of allConfigs) {
    const eventCount = Math.floor(Math.random() * 200) + 50;
    for (let i = 0; i < eventCount; i++) {
      const eventType = eventTypes[Math.floor(Math.random() * 3)];
      const daysAgo = Math.floor(Math.random() * 7);
      const eventTime = new Date(Date.now() - daysAgo * 86400000 - Math.random() * 86400000).toISOString();
      insertEvent.run(
        uuid(), config.id, config.resource_position_id, eventType,
        `user-${Math.floor(Math.random() * 10000)}`,
        JSON.stringify({ os: Math.random() > 0.5 ? 'ios' : 'android', version: '4.2.0' })
      );
    }
  }
});

insertEventsBatch();
console.log(`  ✅ Sample analytics events generated`);

console.log('\n🎉 Seed complete! Run `npm run dev` to start the server.\n');
process.exit(0);
