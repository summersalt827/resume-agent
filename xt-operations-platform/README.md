# ExchangeAlpha 数字化运营后台 — 人·货·场动态配置平台

基于 ExchangeAlpha APP 流量资源资产化与规则化管理体系，结合 ExchangeDelta/ExchangeEpsilon 竞品分析，构建的数字化运营后台。

## 核心能力

| 模块 | 说明 |
|------|------|
| **人 (人群包)** | 8大维度人群圈选，AND/OR逻辑组合，50万+用户覆盖 |
| **货 (素材库)** | 多语言素材管理，图片/文字/链接/视频，CDN降级兜底 |
| **场 (资源位)** | 18个资源位资产目录，6大分类，优先级体系(330-363) |
| **配置引擎** | 10层规则校验链，人货场动态绑定 |
| **运营控制** | 灰度发布、AB测试、频次控制、地域定向、设备定向 |
| **数据监控** | 曝光→点击→转化全链路，告警规则 |

## 快速启动

### 1. 初始化
```bash
cd backend && npm install && npx tsx src/seed.ts
cd frontend && npm install
```

### 2. 启动
```bash
# 终端1: 启动后端
cd backend && npm run dev

# 终端2: 启动前端
cd frontend && npm run dev
```

或一键启动:
```bash
chmod +x start.sh && ./start.sh
```

### 3. 访问
- 前端: http://localhost:5173
- 后端API: http://localhost:3001
- 健康检查: http://localhost:3001/api/health

## 技术栈

- **前端**: React 18 + TypeScript + Ant Design 5 + Vite
- **后端**: Node.js + Express + TypeScript
- **数据库**: SQLite (better-sqlite3)

## 项目结构

```
├── backend/
│   └── src/
│       ├── index.ts              # Express 入口
│       ├── db.ts                 # 数据库初始化
│       ├── seed.ts               # 种子数据
│       ├── routes/
│       │   ├── crowdPacks.ts     # 人群包 API
│       │   ├── materials.ts      # 素材库 API
│       │   ├── resourcePositions.ts  # 资源位 API
│       │   ├── configs.ts        # 核心：人货场绑定配置 API
│       │   ├── rules.ts          # 规则引擎 API
│       │   ├── analytics.ts      # 数据监控 API
│       │   └── delivery.ts       # 客户端下发 API
│       └── services/
│           ├── ruleEngine.ts     # 10层校验规则引擎
│           ├── crowdMatcher.ts   # 人群匹配逻辑
│           ├── scheduler.ts      # 排期管理
│           └── analyticsService.ts # 数据统计
└── frontend/
    └── src/
        ├── pages/
        │   ├── Dashboard.tsx      # 运营概览
        │   ├── CrowdPacks/        # 人群包管理
        │   ├── Materials/         # 素材库管理
        │   ├── ResourcePositions/ # 资源位目录
        │   ├── Configs/           # 人货场配置 (核心)
        │   ├── Rules.tsx          # 规则引擎
        │   ├── Analytics.tsx      # 数据监控
        │   └── Delivery.tsx       # 下发调试
        └── components/            # 可复用组件
```
