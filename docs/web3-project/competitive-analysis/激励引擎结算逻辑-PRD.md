# 激励引擎结算逻辑 — 需求文档

> 版本: v1.0 | 日期: 2026-05-27 | 状态: 待评审

---

## 1. 概述

### 1.1 范围

本文档定义激励引擎的**结算层**逻辑，覆盖奖励从计算、触发、发放到回收的完整生命周期。不覆盖前端交互和推送文案。

### 1.2 核心约束

- **幂等性**: 同一事件重复投递不产生重复奖励
- **一致性**: 区域配置变更不影响已结算奖励
- **可审计**: 每笔奖励的发放/回收链路完整可追溯

---

## 2. 核心实体

### 2.1 奖励类型

```
┌──────────────────┬──────────┬──────────┬──────────────┬──────────────────────┐
│      类型        │  形态    │ 可提现   │   过期时间   │       适用范围       │
├──────────────────┼──────────┼──────────┼──────────────┼──────────────────────┤
│ EXPERIENCE_TOKEN │ 体验金   │ 否(本金) │ 领取后 7-30天│ 交易/合约/理财       │
│ CASH_REBATE      │ USDT     │ 是       │ 无           │ 全局                 │
│ TRADING_VOUCHER  │ 交易券   │ 否       │ 发放后 14天  │ 抵扣手续费/抵扣亏损  │
│ FEE_DISCOUNT     │ 费率折扣 │ —        │ 按权益周期   │ 现货/合约手续费      │
│ APR_BOOST        │ 加息券   │ 否(收益) │ 7-14天       │ 理财/赚币            │
└──────────────────┴──────────┴──────────┴──────────────┴──────────────────────┘
```

### 2.2 奖励生命周期状态机

```
                    ┌──────────┐
                    │  null    │  (不存在)
                    └────┬─────┘
                         │ 触发条件满足, 创建奖励记录
                         ▼
                    ┌──────────┐
                    │ PENDING  │  (待发放, 等待结算)
                    └────┬─────┘
                         │ 结算成功
                         ▼
                    ┌──────────┐
               ┌───→│  LOCKED  │  (已发放, 但锁定期内不可用)
               │    └────┬─────┘
               │         │ 锁定期满 或 无锁定期
               │         ▼
               │    ┌──────────────┐
               │    │  AVAILABLE   │  (可用)
               │    └──┬───┬───┬───┘
               │       │   │   │
               │   使用 │   │   │ 过期
               │       │   │   │
               │       ▼   │   ▼
               │  ┌────────┐│┌─────────┐
               │  │  USED  │││EXPIRED  │
               │  └────────┘│└─────────┘
               │            │
               │            │ 违规/风控触发回收
               │            ▼
               │       ┌──────────┐
               └───────│ REVOKED  │  (已回收)
                       └──────────┘
```

**状态转换规则:**

| 从 | 到 | 条件 | 说明 |
|---|---|---|---|
| (不存在) | PENDING | 用户完成对应行为 | 创建奖励记录 |
| PENDING | LOCKED | 结算批处理执行成功 | 发放到账户 |
| PENDING | (删除) | 用户未在有效窗口内完成行为 | 窗口过期, 不发奖励 |
| LOCKED | AVAILABLE | 锁定期倒计时结束 | Cron 扫描触发 |
| LOCKED | REVOKED | 锁定期内用户触发回收条件 | 见 5.1 |
| AVAILABLE | USED | 用户使用奖励(交易/提现) | |
| AVAILABLE | EXPIRED | 超过有效期未使用 | Cron 扫描触发 |
| AVAILABLE | REVOKED | 事后发现违规(风控异步判定) | 见 5.1 |
| USED | REVOKED | 已使用奖励对应的交易被判定为对敲 | 仅对敲场景, 通常不可逆 |

---

## 3. 结算触发规则

### 3.1 触发分类

#### 3.1.1 事件驱动触发 (实时)

消费外部事件队列, 逐条处理。

| 触发事件 | 事件来源 | 对应奖励 | 结算延迟 |
|----------|---------|---------|---------|
| `kyc.passed` | KYC 系统 | KYC 体验金 | ≤ 5 分钟 |
| `deposit.confirmed` | 充值系统 (≥ 1 个区块确认) | 首充现金返现 | ≤ 5 分钟 |
| `trade.executed` | 撮合引擎 | 首笔交易券 | ≤ 5 分钟 |
| `trade.executed` | 撮合引擎 | 累计交易量里程碑 | ≤ 5 分钟 |
| `contract.first_open` | 合约系统 | 合约体验金 | ≤ 5 分钟 |
| `earn.first_subscribe` | 理财系统 | 理财体验金 | ≤ 5 分钟 |

#### 3.1.2 定时扫描触发 (批处理)

| 扫描任务 | Cron | 处理内容 |
|----------|------|---------|
| `expire-locked-rewards` | 每 10 分钟 | 锁定期满的 LOCKED 奖励 → AVAILABLE |
| `expire-available-rewards` | 每 10 分钟 | 超过有效期的 AVAILABLE 奖励 → EXPIRED |
| `expire-pending-rewards` | 每 10 分钟 | PENDING 超过 30 分钟(异常) → 告警 + 人工处理 |
| `scan-milestone-progress` | 每小时 | 检查累计交易量是否跨过中途里程碑 |
| `scan-window-expiry` | 每天 00:05 UTC | 注册满 14 天未完成 L0-L2 的用户 → 标记不可再领 |
| `scan-clawback-triggers` | 每天 02:00 UTC | 扫描锁定期内触发提现风控的用户 → 标记回收 |

#### 3.1.3 管理后台触发 (人工)

- 客服手动补发
- 风控手动回收
- 批量修正 (如区域配置错误后的补偿)

### 3.2 事件去重

每条外部事件携带 `event_id` (事件源生成, UUID v7)。结算引擎以 `event_id` 做幂等键:

```
流程:
  1. 收到事件
  2. SELECT 1 FROM settlement_idempotency WHERE event_id = $event_id
  3. 如果存在 → 跳过, ACK 事件
  4. 如果不存在 → 处理 + INSERT INTO settlement_idempotency (event_id, created_at)
```

幂等表保留 90 天, 超过 90 天的事件不可能重放, 可清理。

### 3.3 事件顺序保证

- 事件队列保证同一 `user_id` 的事件**顺序投递** (Kafka partition key = user_id)
- 结算引擎按事件顺序处理, 避免「首充奖励未发, 首笔交易奖励却先发了」

---

## 4. 奖励计算规则

### 4.1 区域档位匹配

```
输入: user_id
算法:
  1. 取用户的 KYC 国籍 → country_code
  2. 取用户注册时的 IP → ip_country
  3. 如果 country_code ≠ ip_country → 取两者中档位较低的 (防套利)
  4. 查 region_config 表: SELECT tier FROM region_config WHERE country = $resolved_country AND effective_from <= NOW() ORDER BY effective_from DESC LIMIT 1
  5. 如果未匹配 → fallback 到 B 档 (基准)
  6. 档位在用户注册时快照, reward_calculation 全程使用该快照值
     (用户注册后即使该市场升档/降档, 已注册用户不受影响)
```

### 4.2 阶梯奖励计算

以下为 B 档 (基准) 配置, 其他档位通过 `tier_multiplier` 乘数计算。

#### L0 — KYC 完成

```
触发条件:    kyc.passed 且 kyc.status = 'approved'
前置条件:    无 (新用户注册即可)
奖励:        10 USDT EXPERIENCE_TOKEN
锁定期:      无 (直接 AVAILABLE)
有效期:      领取后 7 天
区域限制:    D 档不发 KYC 奖励
结算逻辑:
  - 收到 kyc.passed 事件
  - 检查是否为首次通过 (排除重新审核场景: kyc.attempt_count = 1)
  - 创建奖励记录, 状态直接 AVAILABLE
  - 发放到用户资金账户, 标记为体验金子账户
```

#### L1 — 首充 ≥ $threshold

```
触发条件:    deposit.confirmed
前置条件:    L0 已结算 (KYC 通过), 注册 ≤ 14 天
奖励:        30 USDT CASH_REBATE
锁定期:      7 天
有效期:      无
阈值:        $100 (B档) / $50 (A档) / $100 (C档) / $100 (D档-无现金)

特殊情况处理:
  a) 多笔充值累加到 $threshold:
     - 收到 deposit.confirmed, 检查累计充值额 >= $threshold
     - 取达到阈值的那一笔事件触发结算
  b) 首充金额超过 $threshold:
     - 仍只发一次, 不按比例追加
  c) 用户已领取 L1, 后续再充值:
     - 不触发

结算逻辑:
  1. 计算累计充值总额: SUM(amount) FROM deposits WHERE user_id = $uid AND status = 'confirmed'
  2. 如果 cumulative >= threshold 且 L1 未发放:
     - 创建 CASH_REBATE 奖励, 状态 LOCKED
     - lock_until = NOW() + 7 days
     - 发放到用户主账户, 标记冻结 7 天
  3. 如果充值金额 < threshold:
     - 不发放 (等待后续充值累加)
  4. 如果注册超过 14 天:
     - 不发放, 记录 skipped 日志

锁定期内部分提现规则:
  - 用户充值 $100 → 奖励 $30 冻结中
  - 用户提现 $50 → 提现后净充值 = $50, 仍 >= $100? 否
  - 判断逻辑: net_deposit = total_deposits - total_withdrawals (自注册起)
  - 当 net_deposit < threshold 时, L1 奖励标记 REVOKED, 从冻结中收回
  - 注意: 仅计算已确认的提现, 不包括待处理
```

#### L2 — 首笔交易 ≥ $100

```
触发条件:    trade.executed
前置条件:    L1 已结算 (首充奖励已发放)
奖励:        20 USDT TRADING_VOUCHER
有效期:      发放后 14 天
券类型:      用户可选「抵扣手续费」或「抵扣亏损」(默认前者)
             在发放后首次使用时弹出选择, 未选择前默认手续费抵扣

结算逻辑:
  1. 收到 trade.executed, 检查该笔交易的 base_asset_value_usd >= $100
  2. 检查是否为首笔交易 (COUNT trades WHERE user_id = $uid = 0, 排除对敲)
  3. 创建 TRADING_VOUCHER 奖励, 直接 AVAILABLE
  4. 券面值 20 USDT, 单次最多抵扣交易金额的 50%

抵扣规则:
  - 模式「抵扣手续费」: 从手续费中扣除, 每次最多抵扣手续费的 100%
  - 模式「抵扣亏损」: 平仓亏损时, 从亏损金额中扣除, 每次最多抵扣亏损的 50%
  - 券余额递减: remaining = 20 - SUM(已抵扣), 剩余 0 时标记 USED
  - 券不可拆分转让
```

#### L3 — 累计交易量 ≥ $5,000

```
触发条件:    trade.executed
前置条件:    L2 已结算
奖励:        50 USDT CASH_REBATE
锁定期:      无
有效期:      无
中途里程碑:  $2,500 (仅推送进度, 不给奖励)

计算口径:
  - 交易量 = 现货交易量 + 合约交易量 (名义价值)
  - 排除自成交
  - 排除零手续费交易对
  - 仅计算 taker 成交量 (maker 不算)

结算逻辑:
  1. 收到 trade.executed
  2. 查询累计交易量: SUM(volume_usd) FROM trades WHERE user_id = $uid AND is_self_trade = false AND fee_rate > 0 AND side = 'taker'
  3. 如果累计 >= $5,000 且 L3 未发放:
     - 创建 CASH_REBATE 奖励, 直接 AVAILABLE
  4. 如果累计 >= $2,500 且 L3 未发放 且 中途里程碑通知未发送:
     - 发送进度推送事件 (不涉及结算)
     - 标记 mid_milestone_notified = true

区域差异:
  - A 档: 累计阈值降至 $2,500, 奖励降至 $40
  - C 档: 累计阈值升至 $10,000, 奖励降至 $30
```

#### L4 — 首笔合约 或 首笔理财 ≥ $100

```
触发条件:    contract.first_open 或 earn.first_subscribe
前置条件:    无硬性前置 (即使 L0-L3 未完成也可触发, 但窗口期内最优)
奖励:        40 USDT EXPERIENCE_TOKEN (合约专属 或 理财专属)
锁定期:      无
有效期:      30 天

触发条件细化:
  - 合约: 首次开仓且保证金 >= $100
  - 理财: 首次申购且申购金额 >= $100 (活期/定期均可)

结算逻辑:
  1. 收到 contract.first_open 或 earn.first_subscribe
  2. 检查为用户在该产品线的首次行为
  3. 创建 EXPERIENCE_TOKEN, 直接 AVAILABLE
  4. 体验金标记 product_type = 'contract' | 'earn'
  5. 合约体验金: 仅可用于合约交易保证金, 盈利可提, 本金不可提
     理财体验金: 仅在申购时作为本金加入, 到期后本金回收, 收益归用户

同用户可同时领取合约体验金和理财体验金 (各 40 USDT)
```

### 4.3 奖励叠加规则

| 场景 | 规则 |
|------|------|
| 同一阶梯多次满足条件 | 仅首次发放, 不重复 |
| 注册后 14 天内完成 L0-L2 | 全部应发 |
| 注册后超过 14 天 | L0 不受影响; L1/L2 窗口关闭, 不可再触发 |
| L3/L4 不受 14 天窗口限制 | 可在 L0-L2 过期后独立触发 |
| 用户跳级 (如首充 $100 + 首笔交易一次性≥$5,000) | 按 L0→L1→L2→L3 顺序级联创建, 保证依赖关系, 但不要求用户等待 |

---

## 5. 回收 (Clawback) 规则

### 5.1 回收触发条件

| 触发条件 | 回收范围 | 检测方式 |
|----------|---------|---------|
| 锁定期内净充值低于阈值 (L1) | L1 奖励 + 其后的 L2 (如已发) | `scan-clawback-triggers` Cron |
| KYC 被驳回 / 标记为虚假 | 全部已发奖励 | KYC 系统回调 `kyc.rejected.fraud` |
| 对敲交易判定 | 涉及该交易量对应的 L3 奖励 | 风控系统回调 `risk.wash_trade` |
| 关联多账号 | 除主账号外的所有奖励 | 风控系统回调 `risk.linked_accounts` |
| 退款/chargeback 导致净充值为负 | L1 奖励 | 支付系统回调 `payment.chargeback` |

### 5.2 回收执行

```
流程:
  1. 收到回收触发事件
  2. 查询用户所有非 REVOKED/USED/EXPIRED 状态的奖励
  3. 按 reverse_chronological 排序 (先回收最新的)
  4. 逐笔执行回收:

     状态 A) AVAILABLE — 直接标记 REVOKED, 扣回余额
     状态 B) LOCKED — 直接标记 REVOKED, 解冻并扣回
     状态 C) USED — 不回收 (默认为已完成), 除非风控级别 = 'fraud'

  5. 资金扣除:
     a) CASH_REBATE: 从用户主账户扣回等额 USDT, 余额不足扣到负数 (挂负债)
     b) EXPERIENCE_TOKEN / TRADING_VOUCHER: 标记 REVOKED, 未使用部分作废
     c) FEE_DISCOUNT: 取消权益, 已减免手续费不追溯

  6. 写入 clawback_log
```

### 5.3 部分回收 (L1 场景)

```
场景: 用户充值 $100 → 领 L1($30) → 提现 $20 → 净充值 = $80 < $100

回收逻辑:
  1. scan-clawback-triggers 检测到 net_deposit < threshold
  2. 标记 L1 为 REVOKED (因为 L1 的触发条件已不满足)
  3. 连锁效应: L2 的发放前提是 L1 已结算, 但 L2 已发放后不因 L1 回收而自动回收
     (L2 是独立行为奖励, 首笔交易已经完成了)
  4. 但如果 L1 被回收时 L2 尚未发放, L2 也不再发放 (前置条件不满足)
```

### 5.4 回收冷静期

- 回收后用户有 72h 提交申诉
- 申诉期间奖励保持 REVOKED, 余额不恢复
- 申诉通过 → 恢复原状态, 补发余额
- 申诉驳回 → 永久 REVOKED

---

## 6. 数据模型

### 6.1 核心表结构

```sql
-- 奖励记录主表
CREATE TABLE reward_records (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL,
  tier              VARCHAR(8) NOT NULL,        -- L0, L1, L2, L3, L4
  reward_type       VARCHAR(32) NOT NULL,       -- EXPERIENCE_TOKEN, CASH_REBATE, TRADING_VOUCHER
  amount            DECIMAL(20,8) NOT NULL,     -- 发放金额 (USDT)
  remaining_amount  DECIMAL(20,8) NOT NULL,     -- 剩余可用金额
  currency          VARCHAR(8) DEFAULT 'USDT',
  status            VARCHAR(16) NOT NULL,       -- PENDING, LOCKED, AVAILABLE, USED, EXPIRED, REVOKED
  lock_until        TIMESTAMP,                  -- LOCKED → AVAILABLE 的时间
  expire_at         TIMESTAMP,                  -- 过期时间
  region_tier       VARCHAR(4),                 -- 发放时的区域档位快照 (A/B/C/D)
  region_country    VARCHAR(4),                 -- 发放时的 KYC 国籍
  trigger_event_id  UUID,                       -- 触发事件的 event_id (幂等)
  product_type      VARCHAR(16),                -- 合约/理财专属体验金的限定产品
  metadata          JSONB,                      -- 扩展字段
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reward_user_status ON reward_records(user_id, status);
CREATE INDEX idx_reward_trigger_event ON reward_records(trigger_event_id);
CREATE INDEX idx_reward_lock_expire ON reward_records(status, lock_until) WHERE status = 'LOCKED';
CREATE INDEX idx_reward_expire ON reward_records(status, expire_at) WHERE status IN ('AVAILABLE', 'LOCKED');

-- 幂等表
CREATE TABLE settlement_idempotency (
  event_id    UUID PRIMARY KEY,
  reward_id   UUID,                             -- 产生的 reward ID (可选)
  created_at  TIMESTAMP DEFAULT NOW()
);
-- 自动清理: TTL 90 天

-- 用户进度快照
CREATE TABLE user_activation_progress (
  user_id              UUID PRIMARY KEY,
  region_tier_snapshot VARCHAR(4),              -- 注册时锁定的区域档位
  registered_at        TIMESTAMP,
  kyc_passed_at        TIMESTAMP,
  first_deposit_at     TIMESTAMP,
  cumulative_deposit   DECIMAL(20,8) DEFAULT 0, -- 累计充值
  net_deposit          DECIMAL(20,8) DEFAULT 0, -- 净充值 (= deposit - withdrawal)
  first_trade_at       TIMESTAMP,
  cumulative_volume    DECIMAL(20,8) DEFAULT 0, -- 累计交易量
  mid_milestone_notified BOOLEAN DEFAULT false, -- $2,500 进度通知
  first_contract_at    TIMESTAMP,
  first_earn_at        TIMESTAMP,
  l0_reward_id         UUID,                    -- 各阶梯 reward_id
  l1_reward_id         UUID,
  l2_reward_id         UUID,
  l3_reward_id         UUID,
  l4_contract_reward_id UUID,
  l4_earn_reward_id    UUID,
  window_expired       BOOLEAN DEFAULT false,   -- 14 天窗口是否已关闭
  updated_at           TIMESTAMP DEFAULT NOW()
);

-- 区域档位配置
CREATE TABLE region_tier_config (
  id             SERIAL PRIMARY KEY,
  country_code   VARCHAR(4) NOT NULL,
  tier           VARCHAR(1) NOT NULL,           -- A, B, C, D
  effective_from TIMESTAMP NOT NULL,
  created_by     VARCHAR(64),
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_region_country_effective ON region_tier_config(country_code, effective_from DESC);

-- 回收日志
CREATE TABLE clawback_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id   UUID NOT NULL,
  trigger     VARCHAR(32) NOT NULL,             -- NET_DEPOSIT_BELOW_THRESHOLD, KYC_FRAUD, WASH_TRADE, etc.
  amount      DECIMAL(20,8) NOT NULL,           -- 回收金额
  reason      TEXT,
  status      VARCHAR(16) DEFAULT 'PENDING',    -- PENDING, EXECUTED, APPEALED, REVERSED
  created_at  TIMESTAMP DEFAULT NOW()
);
```

### 6.2 资金子账户模型

体验金和交易券在资金系统中以**子账户**形式隔离:

```
用户总资产:
  ├─ 主账户 (可用余额)
  │   ├─ 用户充值: 100 USDT
  │   ├─ L1 现金返现: 30 USDT (lock_until 内冻结)
  │   └─ L3 现金返现: 50 USDT (可用)
  │
  ├─ 体验金子账户 (不可提现)
  │   ├─ L0 KYC 体验金: 10 USDT (7天有效)
  │   └─ L4 合约体验金: 40 USDT (30天有效, 仅合约)
  │
  └─ 交易券子账户 (不可提现)
      └─ L2 交易券: 20 USDT (14天有效)
```

消费优先级 (用户下单时):
1. 先消耗交易券 (如有, 按剩余有效期升序)
2. 再消耗体验金 (如有, 按剩余有效期升序)
3. 最后消耗主账户余额

---

## 7. 异常场景处理

### 7.1 事件丢失

```
场景: trade.executed 丢失导致用户交易量达标但 L3 未触发

补偿:
  - 定时扫描任务 scan-milestone-progress (每小时) 对比 trade 表和 user_activation_progress
  - 发现累计交易量 >= $5,000 但 l3_reward_id IS NULL → 补创建奖励
  - 补偿奖励的 metadata.reason = 'backfill'
```

### 7.2 并发充值

```
场景: 用户同时发起两笔充值 (USDT-TRX 和 USDT-ERC20), 几乎同时到账

处理:
  - 事件队列保证 user_id 分区有序, 两笔充值顺序到达
  - 第一笔处理: cumulative = $60, < $100, 不触发
  - 第二笔处理: cumulative = $110, >= $100, 触发 L1
  - 奖励只发一次 (幂等键 = 第二笔的 event_id)
```

### 7.3 区域档位变更

```
场景: 马来西亚从 B 档升级到 A 档

规则:
  - effective_from 之前的用户 → 继续按 B 档 (快照机制)
  - effective_from 之后的新注册用户 → 按 A 档
  - user_activation_progress.region_tier_snapshot 在注册时写入, 终身不变
```

### 7.4 KYC 重新审核

```
场景: 用户 KYC 通过 → 领 L0 → 后来 KYC 信息更新需重新审核

规则:
  - kyc.passed 事件的 attempt_count > 1 → 不触发 L0 (仅首次)
  - 如果 KYC 驳回期间奖励已过期 → 不补发
  - 如果 KYC 被标记为虚假 → 触发 5.1 回收流程
```

### 7.5 系统故障期间堆积的事件

```
场景: 结算引擎宕机 2 小时, 事件在 Kafka 堆积

恢复:
  - 重启后从上次 commit offset 继续消费
  - 幂等表保证即使部分事件已被处理, 不会重复发放
  - 事件延迟的 2 小时内用户可能已自行操作, 但不影响结算正确性
```

---

## 8. 接口定义

### 8.1 消费的事件

| Topic | 事件类型 | 关键字段 |
|-------|---------|---------|
| `user.kyc` | `kyc.passed` | user_id, status, attempt_count, event_id |
| `user.kyc` | `kyc.rejected.fraud` | user_id, reason, event_id |
| `payment.deposit` | `deposit.confirmed` | user_id, amount, currency, tx_hash, confirmations, event_id |
| `payment.withdrawal` | `withdrawal.confirmed` | user_id, amount, currency, event_id |
| `payment.chargeback` | `payment.chargeback` | user_id, amount, original_tx_hash, event_id |
| `trade.spot` | `trade.executed` | user_id, base_asset_value_usd, is_self_trade, fee_rate, side, event_id |
| `trade.contract` | `contract.first_open` | user_id, margin_usd, event_id |
| `trade.earn` | `earn.first_subscribe` | user_id, amount_usd, event_id |
| `risk.alert` | `risk.wash_trade` | user_id, trade_ids[], event_id |
| `risk.alert` | `risk.linked_accounts` | primary_user_id, linked_user_ids[], event_id |

### 8.2 产出的事件

| Topic | 事件类型 | 消费方 |
|-------|---------|--------|
| `incentive.reward` | `reward.created` | 推送引擎、用户通知 |
| `incentive.reward` | `reward.status_changed` | 推送引擎、数据分析 |
| `incentive.reward` | `reward.revoked` | 推送引擎、风控系统 |
| `incentive.progress` | `milestone.reached` | 推送引擎 |

---

## 9. 非功能需求

| 维度 | 要求 |
|------|------|
| 结算延迟 (事件驱动) | P99 ≤ 30 秒 (从事件到达起算) |
| 结算延迟 (批处理) | 全量扫描 ≤ 5 分钟 |
| 幂等性 | exactly-once |
| 资金精度 | 小数点后 8 位, 向下取整 |
| 审计追溯 | 每笔奖励可查到触发事件的 event_id |
| 配置变更生效 | 区域档位: history 快照, 新注册即时生效; 金额参数: 需走发版 |
| 可观测性 | 实时大盘: 各阶梯发放量、回收量、沉淀量; 异常告警: 发放量突降 >30% |
