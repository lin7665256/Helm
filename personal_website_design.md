---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 80707539975040_0/project_7649409754246365480-files/personal_website_design.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 80707539975040#1781442784045
    ReservedCode2: ""
---
# Helm — 项目方向文档

> 版本：v3.0  
> 日期：2026-06-14  
> 状态：方案已优化，准备进入实施  
> 文档结构：**方向层**（核心共识）+ **参考实现层**（技术细节）+ **治理层**（安全/运维/风险）  
> 变更日志：v2.0→v3.0 整合可行性评估与竞品市场分析，新增技术选型、安全设计、里程碑规划、风险缓解

---

# 方向层（核心共识）

## 一、项目定位

**Helm** — 模块化个人网站 + Agent 管理中枢。从 Agent Dashboard 起步，随着需求明确逐步添加模块。不是单一工具，是**数字身份容器**。

**核心思路：先跑起来，再慢慢长。随时推翻自己。**

### 差异化定位（基于竞品分析）

| 维度 | Helm 的独特价值 | 市场现状 |
|------|----------------|---------|
| **定位** | 个人数字身份容器 + Agent 管理中枢 | 个人网站模板（Next.js Portfolio）或企业 Agent 监控 SaaS（LangSmith），无交叉产品 |
| **Agent Dashboard** | 个人视角，轻量级，自托管 | 市面 Agent 监控全部面向团队/企业，无个人轻量方案 |
| **模块化** | 按需生长，每模块独立上线 | 博客系统（Ghost/Hugo）和作品集模板均为整体方案，不支持模块化扩展 |
| **数据主权** | 完全自托管，数据不离开自己服务器 | SaaS 方案（LangSmith $39/月）数据在云端 |

**核心竞争策略：不做又一个博客系统，坚守"Agent 管理中枢 + 数字身份容器"的独特定位。**

### 已定约束

- 独立于 tuoxiaoxi.com，有自己的域名（待购）
- 暗色主题为默认，支持亮色切换
- 模块化架构，每个模块可独立开发和上线
- 域名待定，预留子域名能力
- 响应式设计，必须适配移动端

---

## 二、模块规划

### Phase 1 — Agent Dashboard（当前阶段）

第一个模块，Helm 的核心面板。

**MVP 范围（最小可用集，优先交付）：**

| 编号 | 功能 | 说明 | MVP |
|------|------|------|:---:|
| F1 | Agent 状态卡片网格 | 状态灯+当前任务+待办数+下次触发+最后活跃 | ✅ |
| F2 | 统一待办看板 | 所有 Agent 待办汇总，按优先级排序 | ✅ |
| F5 | 活动时间线 | 全局活动 Feed | ✅ |
| F6 | 心跳异常检测 | 超时标红+顶部异常通知 | ✅ |
| F3 | 产出物索引 | 文件/报告链接，按 Agent+时间检索 | 🔮 第二批 |
| F4 | 日程时间轴 | 各 Agent 定时触发计划 | 🔮 第二批 |

**MVP 选择理由：** F1+F2+F5+F6 构成最小闭环——能看到 Agent 状态、待办、活动和异常，足以验证核心价值。F3 和 F4 在 MVP 验证通过后追加。

**Agent 上报机制：** Agent 通过 HTTP POST 上报状态、任务、活动。Dashboard 被动接收。

**前端实时性策略：** 采用客户端轮询（30 秒间隔），MVP 阶段不引入 WebSocket/SSE，保持架构简单。未来如有更高实时性需求可升级为 SSE。

### Phase 2 — 个人主页（Phase 1 稳定运行 2 周后启动）

网站门面。关于我、项目经历、技能栈。让 Helm 不只是工具，也有身份展示。

**触发条件：** Phase 1 上线并稳定运行 ≥ 2 周，无 P0/P1 Bug。

### Phase 3+ — 按需添加

| 方向 | 可能形态 | 优先级判断 |
|------|---------|-----------|
| 博客/内容 | 技术文章、日报自动发布 | 中——有内容产出后自然需要 |
| 项目展示 | 各项目落地页 | 中——项目多了再聚合 |
| 开源模板化 | 将 Helm 开源为可复用模板 | 中——社区反馈驱动 |
| Agent Dashboard SaaS 化 | 多租户版本，作为独立产品 | 低——验证需求后再定 |
| 投资看板 | 持仓/收益可视化 | 低——数据敏感，想清楚再说 |
| 工具箱 | 小工具集合 | 低——零散需求汇总 |

---

## 三、技术选型（基于市场生态分析确定）

### 确定技术栈

| 层级 | 技术 | 选型理由 |
|------|------|---------|
| **框架** | Next.js (App Router) | 生态最大（~800 万 npm 周下载）、内置 API Routes 无需额外后端框架、Vercel/自托管均可、SSR/SSG 灵活选择 |
| **UI** | Tailwind CSS + shadcn/ui | 37% 开发者采用率、暗色主题原生支持、组件代码所有权模式（非 npm 依赖）、与视觉规格完美匹配 |
| **语言** | TypeScript | 类型安全、IDE 支持好、个人项目规模下学习成本可控 |
| **ORM** | Prisma | SQLite 支持好、迁移 Postgres 只需改连接字符串、类型自动生成、Schema 可读性强 |
| **数据库** | SQLite（起步）→ Postgres（扩展） | 零运维起步、个人项目数据量足够、Prisma 保障迁移平滑 |
| **部署** | Vercel 免费层（起步）/ Docker 自托管 | 零成本起步、支持自定义域名、CI/CD 自动化 |
| **域名 DNS** | Cloudflare | 免费、全球 CDN、安全防护 |

### 备选方案说明

| 备选 | 评估结论 |
|------|---------|
| Astro | 更适合内容站点（Phase 2+），Phase 1 Dashboard 交互性需求更适合 Next.js |
| Nuxt 3 | Vue 生态成熟但社区规模小于 React，组件库选择少于 shadcn/ui |
| Hugo/Jekyll | 纯静态方案，无法支持 Agent 上报和实时状态等动态功能 |
| Ghost CMS | 重内容发布轻交互，不适合 Dashboard 场景 |

---

## 四、架构原则

1. **模块独立**：每个模块是独立子应用，有自己的路由和数据
2. **统一外壳**：共享顶部导航、侧边栏、主题、认证
3. **数据层统一**：所有模块读写同一个数据库
4. **渐进部署**：一个模块一个模块上线，不需要全部做完才发布
5. **暗色主题默认**：全局统一，支持亮色切换，视觉规格见参考层
6. **响应式设计**：所有页面必须适配桌面端（≥1024px）和移动端（≥375px）
7. **API 版本化**：所有 API 端点以 `/api/v1/` 为前缀，预留版本迭代空间

---

## 五、认证与安全设计

### 双轨认证方案

| 端 | 认证方式 | 说明 |
|----|---------|------|
| **Agent 上报端** | API Key（Header: `X-API-Key`） | 每个 Agent 独立 API Key，支持轮换和吊销 |
| **Dashboard 访问端** | 简单密码登录（session-based） | Phase 1 个人使用，无需复杂 OAuth；Phase 2 可扩展 |

### 安全措施

| 措施 | 说明 |
|------|------|
| **HTTPS 强制** | 全站 HTTPS，Cloudflare 自动处理 SSL |
| **上报数据校验** | POST /api/v1/report 请求体必须通过 JSON Schema 验证 |
| **频率限制** | Agent 上报接口限制 60 次/分钟（per API Key），Dashboard 接口限制 120 次/分钟 |
| **API Key 安全** | 使用 SHA-256 哈希存储，不以明文保存 |
| **错误信息脱敏** | API 错误响应不暴露内部堆栈和数据库信息 |

---

## 六、数据治理

### 数据保留策略

| 数据类型 | 保留周期 | 清理方式 |
|---------|---------|---------|
| activities（活动日志） | 最近 90 天 | 定时任务自动清理 |
| tasks（已完成） | 最近 180 天 | 定时任务自动清理 |
| tasks（未完成） | 永久保留 | 手动管理 |
| agent_status | 永久保留（仅最新状态） | 上报时覆盖更新 |
| artifacts | 永久保留 | 手动管理 |

### 数据备份

- SQLite 阶段：每日自动 dump 到本地 + 云存储（如 Cloudflare R2 或 S3）
- Postgres 阶段：启用 WAL 归档 + 每日 pg_dump

---

## 七、可观测性

| 项目 | 方案 | 说明 |
|------|------|------|
| **健康检查** | `GET /api/v1/health` | 返回数据库连接状态、服务运行时间 |
| **服务端日志** | 结构化 JSON 日志（pino/winston） | 记录 API 请求、错误、Agent 上报 |
| **Agent 心跳超时** | 可配置阈值（默认 5 分钟） | 超时后自动标记为 offline + Dashboard 顶部通知 |
| **错误告警** | 控制台 + 可选邮件/飞书通知 | Phase 1 先做控制台，后续扩展通知渠道 |

---

## 八、开发路径与里程碑

### Phase 1 — Agent Dashboard

```
M1: 数据层 + API（第 1 周）
  ├── 数据库 Schema + Prisma 迁移
  ├── POST /api/v1/report（Agent 上报 + Schema 校验）
  ├── GET /api/v1/dashboard（聚合数据）
  ├── GET /api/v1/agents/:id（Agent 详情）
  ├── GET /api/v1/activities（活动日志，分页）
  ├── API Key 认证中间件
  ├── GET /api/v1/health（健康检查）
  └── Done：curl 测试所有 API 端点正常返回

M2: Dashboard UI（第 2-3 周）
  ├── 项目脚手架（Next.js + Tailwind + shadcn/ui）
  ├── 外壳层（顶部导航 + 侧边栏 + 暗色主题）
  ├── F1: Agent 状态卡片网格（含状态灯动画）
  ├── F2: 统一待办看板（按优先级分组/排序）
  ├── F5: 活动时间线（全局 Feed + 分页加载）
  ├── F6: 心跳异常检测（超时标红 + 顶部通知条）
  ├── 响应式适配（桌面/移动端）
  ├── 空状态和加载状态设计
  └── Done：Dashboard 页面可访问，展示 API 返回数据

M3: 对接 + 部署上线（第 4 周）
  ├── 前后端联调
  ├── 至少 1 个真实 Agent 对接上报
  ├── Vercel 部署 + 自定义域名配置
  ├── SSL 证书配置
  ├── 数据保留策略定时任务
  └── Done：Dashboard 公网可访问，Agent 可正常上报并在 Dashboard 展示
```

### Phase 1 验收标准

- [ ] Dashboard 公网 URL 可访问
- [ ] 至少 1 个 Agent 完成注册并能正常上报
- [ ] Agent 状态变更在 30 秒内反映到 Dashboard
- [ ] Agent 心跳超时后 Dashboard 显示异常通知
- [ ] 移动端可正常浏览 Dashboard
- [ ] HTTPS 正常工作

### Phase 2 — 个人主页

- **触发条件**：Phase 1 稳定运行 ≥ 2 周，无 P0/P1 Bug
- **产出**：网站有门面（关于我、项目经历、技能栈），Dashboard 变成子模块
- **技术考虑**：评估引入 Astro 岛屿架构的可行性（静态部分用 Astro，Dashboard 保持 React 交互性）

### Phase 3+ — 按需添加

- 每个模块独立开发，挂到导航上即可
- 优先级在 Phase 2 完成后重新评估

---

## 九、风险登记与缓解

| 风险 | 等级 | 影响 | 缓解策略 |
|------|:----:|------|---------|
| 开发周期过长导致动力不足 | 🔴 高 | 项目搁浅 | 严格控制 MVP 范围（F1+F2+F5+F6），4 周内上线 |
| API Key 安全漏洞 | 🟡 中 | 未授权访问 | SHA-256 哈希存储 + 频率限制 + HTTPS 强制 |
| 活动数据无限增长 | 🟡 中 | 查询变慢 | 90 天自动清理策略（已写入数据治理章节） |
| 模块边界模糊导致耦合 | 🟡 中 | 维护困难 | 每模块独立路由 + 独立数据目录，通过外壳层共享 UI |
| Agent 上报异常（格式错误/重复/中断） | 🟡 中 | 数据不一致 | JSON Schema 校验 + 幂等设计（相同 task_id 做 upsert） |
| 个人项目维护倦怠 | 🟡 中 | 功能停滞 | 考虑开源引入社区力量；CI/CD 自动化减少手动维护 |
| 技术栈过度设计 | 🟡 中 | 复杂度爆炸 | Phase 1 单体应用，不上微前端/monorepo/K8s |
| Agent 生态变化快，协议需调整 | 🟢 低 | API 不兼容 | API 版本化（/api/v1/），预留 v2 空间 |

---

## 十、成本预估

### 开发成本

| 阶段 | 预估时间 | 人力 |
|------|:-------:|:----:|
| Phase 1 MVP | 3-4 周 | 1 人 + AI 辅助 |
| Phase 2 个人主页 | 1-2 周 | 1 人 + AI 辅助 |

### 运行成本（月均）

| 项目 | Vercel 免费层方案 | VPS 自托管方案 |
|------|:----------------:|:-------------:|
| 服务器 | ¥0 | ~¥30-50 |
| 域名 | ~¥8 | ~¥8 |
| SSL | ¥0（Cloudflare） | ¥0（Let's Encrypt） |
| DNS | ¥0（Cloudflare） | ¥0（Cloudflare） |
| **月均总计** | **~¥8** | **~¥40-60** |

**推荐方案**：Phase 1 使用 Vercel 免费层起步（月均 ¥8），验证价值后再决定是否迁移自托管。

---

---

# 参考实现层（技术细节）

> 以下为具体技术实现参考，开发时可根据实际情况调整，只要满足方向层约束即可。

## 技术架构

```
Next.js 单体应用，模块化内聚
│
├── 外壳层 (app/layout.tsx)
│   ├── 顶部导航（模块切换，响应式折叠）
│   ├── 侧边栏（各模块自定义内容）
│   ├── 主题系统（暗色/亮色，基于 next-themes）
│   └── 认证（Dashboard: session | Agent: API Key）
│
├── 模块：Agent Dashboard (app/dashboard/)
│   ├── 状态卡片网格 (F1)
│   ├── 统一待办看板 (F2)
│   ├── 活动时间线 (F5)
│   └── 心跳异常检测 (F6)
│
├── API 层 (app/api/v1/)
│   ├── report/route.ts     → Agent 上报（POST）
│   ├── dashboard/route.ts  → Dashboard 数据（GET）
│   ├── agents/[id]/route.ts → Agent 详情（GET）
│   ├── activities/route.ts → 活动日志（GET）
│   └── health/route.ts     → 健康检查（GET）
│
├── 模块：个人主页（未来）(app/page.tsx)
│
├── 数据层
│   ├── Prisma Schema (prisma/schema.prisma)
│   ├── SQLite 起步 → Postgres 迁移
│   └── 数据保留定时任务 (cron job)
│
└── 基础设施
    ├── 认证中间件 (middleware.ts)
    ├── 频率限制 (upstash/ratelimit 或自实现)
    └── JSON Schema 校验 (zod)
```

## 子域名规划

| 子域名 | 模块 | 说明 |
|--------|------|------|
| `xxx.com` | 个人主页 | 首页（Phase 2） |
| `xxx.com/dashboard` | Agent Dashboard | Phase 1 起步模块 |
| `dash.xxx.com`（可选） | Agent Dashboard | 未来如需独立子域 |

## API 详细设计

### 端点列表

```
POST   /api/v1/report        → Agent 上报（API Key 认证）
GET    /api/v1/dashboard     → Dashboard 聚合数据
GET    /api/v1/agents/:id    → Agent 详情
GET    /api/v1/activities    → 活动日志（分页: ?page=1&limit=50）
GET    /api/v1/artifacts     → 产出物索引（分页 + 筛选）
GET    /api/v1/health        → 健康检查（公开，无认证）
```

### POST /api/v1/report 请求体

```json
{
  "agent_id": "sesame",
  "status": "busy",
  "current_task": "调研中",
  "tasks": [
    { "id": "t1", "title": "日报生成", "status": "in_progress", "priority": "high" }
  ],
  "activity": {
    "type": "task_start",
    "description": "开始调研可行性",
    "artifact_path": null
  },
  "next_trigger": "2026-06-11T08:00:00+08:00",
  "heartbeat": true
}
```

### API 错误响应规范

```json
{
  "error": {
    "code": "INVALID_API_KEY",
    "message": "API Key 无效或已过期",
    "status": 401
  }
}
```

**标准错误码：**

| HTTP Status | Code | 场景 |
|:-----------:|------|------|
| 400 | VALIDATION_ERROR | 请求体 Schema 校验失败 |
| 401 | INVALID_API_KEY | API Key 无效/过期 |
| 404 | AGENT_NOT_FOUND | Agent ID 不存在 |
| 409 | DUPLICATE_TASK | 相同 task_id 已存在（幂等处理提示） |
| 429 | RATE_LIMITED | 请求频率超限 |
| 500 | INTERNAL_ERROR | 服务端内部错误（不暴露详情） |

### 幂等性设计

- **task 上报**：相同 `agent_id` + `task.id` 执行 upsert（存在则更新，不存在则插入）
- **activity 上报**：通过 `agent_id` + `event_type` + `description` + 时间窗口（5 秒内）去重
- **agent_status 上报**：直接覆盖更新（同一 agent 仅保留最新状态）

## 数据模型

**agents**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | Agent 标识 |
| name | TEXT | 显示名 |
| api_key_hash | TEXT | API Key 的 SHA-256 哈希（不存明文） |
| created_at | INTEGER | 注册时间戳 |

**agent_status**

| 字段 | 类型 | 说明 |
|------|------|------|
| agent_id | TEXT PK | FK → agents.id |
| status | TEXT | online/busy/error/offline |
| current_task | TEXT | 当前任务描述 |
| task_count | INTEGER | 待办数量 |
| next_trigger | TEXT | 下次触发时间（ISO 8601） |
| last_heartbeat | INTEGER | 最后心跳时间戳 |
| last_activity | TEXT | 最近活动描述 |
| updated_at | INTEGER | 更新时间 |

**tasks**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | 任务ID（agent_id 范围内唯一） |
| agent_id | TEXT FK | → agents.id |
| title | TEXT | 标题 |
| status | TEXT | pending/in_progress/done |
| priority | TEXT | high/medium/low |
| created_at | INTEGER | 创建时间 |
| completed_at | INTEGER | 完成时间（可为空） |

**activities**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增 |
| agent_id | TEXT FK | → agents.id |
| event_type | TEXT | task_start/task_done/error/heartbeat |
| description | TEXT | 事件描述 |
| artifact_path | TEXT | 产出物路径（可为空） |
| created_at | INTEGER | 时间戳 |

**artifacts**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增 |
| agent_id | TEXT FK | → agents.id |
| title | TEXT | 文件名 |
| file_path | TEXT | 路径 |
| file_type | TEXT | markdown/html/pdf |
| description | TEXT | 描述 |
| created_at | INTEGER | 时间戳 |

### 索引设计

```sql
-- 高频查询优化
CREATE INDEX idx_activities_agent ON activities(agent_id, created_at DESC);
CREATE INDEX idx_activities_type ON activities(event_type, created_at DESC);
CREATE INDEX idx_tasks_agent_status ON tasks(agent_id, status);
CREATE INDEX idx_tasks_priority ON tasks(priority, status);
CREATE INDEX idx_artifacts_agent ON artifacts(agent_id, created_at DESC);
```

## 视觉规格

| 项目 | 值 |
|------|-----|
| 底色 | #0f1117 |
| 卡片底色 | #1a1d27 |
| 主文字色 | #e4e7eb |
| 次文字色 | #9ca3af |
| 在线绿 | #22c55e |
| 繁忙黄 | #f59e0b |
| 异常红 | #ef4444 |
| 强调蓝 | #3b82f6 |
| 卡片圆角 | 8px |
| 卡片阴影 | 0 2px 8px rgba(0,0,0,0.3) |
| 字体 | 系统字体栈，中文优先 PingFang SC |

### 响应式断点

| 断点 | 宽度 | 布局策略 |
|------|:----:|---------|
| 桌面端 | ≥ 1024px | 卡片网格 3-4 列，侧边栏常驻 |
| 平板端 | 768-1023px | 卡片网格 2 列，侧边栏可折叠 |
| 移动端 | < 768px | 卡片网格 1 列，侧边栏抽屉式 |

### 空状态与加载状态

| 场景 | 展示方式 |
|------|---------|
| 无 Agent 注册 | 引导页："注册你的第一个 Agent" + API 文档链接 |
| Agent 全部离线 | 卡片灰显 + 顶部提示 "所有 Agent 离线" |
| 活动日志为空 | 空状态插图 + "等待 Agent 活动..." |
| 数据加载中 | 骨架屏（Skeleton）占位 |

---

# 治理层（安全/运维/演进）

## 安全清单

- [x] API Key SHA-256 哈希存储
- [x] HTTPS 全站强制
- [x] 请求体 JSON Schema 校验（zod）
- [x] 频率限制（Agent 60/min，Dashboard 120/min）
- [x] 错误响应脱敏
- [ ] API Key 轮换机制（Phase 1 后期追加）
- [ ] 暴力破解防护（连续失败锁定）（Phase 1 后期追加）

## 运维清单

- [x] 健康检查端点 `/api/v1/health`
- [x] 结构化日志
- [x] 数据保留定时清理
- [ ] 数据库每日自动备份（部署时配置）
- [ ] Uptime 监控（Uptime Kuma 或 UptimeRobot 免费版）

## 演进路线

```
当前 ──→ Phase 1 MVP（4 周）──→ 稳定期（2 周）──→ Phase 2 个人主页 ──→ Phase 3+
         │                        │                    │
         ├── F1 状态卡片            ├── 评估开源          ├── 评估 Astro 岛屿架构
         ├── F2 待办看板            ├── 收集反馈          ├── 博客/内容模块
         ├── F5 活动时间线          ├── 考虑 SaaS 化      ├── 项目展示
         └── F6 心跳检测            └── 安全加固          └── 更多模块...
```

---

> v3.0 更新说明：基于可行性评估和竞品市场扫描分析优化。主要变更：① 明确差异化定位（Agent 管理中枢 vs 博客系统）；② 确定技术栈（Next.js + Tailwind + shadcn/ui + Prisma）；③ 新增安全设计（双轨认证、频率限制、数据校验）；④ 新增数据治理策略（保留周期、备份）；⑤ 细化 MVP 范围和里程碑（4 周交付）；⑥ 新增风险登记和缓解策略；⑦ 新增响应式设计和空状态规范；⑧ 新增 API 错误码和幂等性设计。
