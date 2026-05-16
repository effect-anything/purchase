# Payment System Hardening Roadmap

这份路线图不是泛泛而谈的“最佳实践”列表，而是结合当前 `@effect-x/purchase` 实现、测试资产和已知缺口，给出的分阶段推进方案。

目标是把系统逐步推进到以下状态：

```txt
外部事实可追踪
-> 本地 durable state 可验证
-> snapshot / entitlements / wallet 可重建
-> duplicate / out-of-order / failure / restart 后仍可收敛
-> provider / local / app-visible 三方状态尽量一致
```

## 为什么这条路线适合当前目标用户

当前系统面向的不是大型企业账务平台，而是需要“低维护成本商业基础设施”的用户：

- 中小团队
- 独立开发者
- 工作室
- 同时维护多个产品的组织

这些用户最在意的不是 provider feature 覆盖表有多长，而是：

1. 多个产品能否复用同一套商业模型。
2. 产品换 provider / 数据库 / runtime 时，业务代码是否还能复用。
3. 发生 webhook 丢失、重复、乱序、退款、迁移时，系统能否自解释、自恢复。
4. 出问题时是否能快速知道是 provider、数据库、还是 projection 出了偏差。

所以这份路线图优先强调：

- 单一商业真相
- 可重建 projection
- 三向校验
- reconciliation

而不是优先强调继续扩更多支付能力。

## 设计原则

后续所有架构和测试推进，都优先围绕下面几条原则：

1. 单一商业真相。
2. append-only facts 优先于直接覆盖状态。
3. projection 必须可重建。
4. webhook 只是事实输入，不是假定永远成功的同步流程。
5. 每个场景测试都必须做：
   - provider client 校验
   - `SqlClient` durable fact 校验
   - public read model 校验

## 架构审查结论

### 当前已经比较对的方向

1. public API 站在商业主键一侧，而不是 provider 一侧。
2. `catalog / workflow / store / projection` 分层适合多产品复用。
3. provider abstraction 的方向正确，适合作为 anti-corruption layer。
4. 支持多数据库、多 runtime 的意图已经体现在整体设计上。

### 当前最需要继续收敛的地方

1. 恢复模型还不够完整。
2. credits / refund / purchase 的真相模型还不够统一。
3. 部分 identity 仍然和 provider id 耦合较深。
4. 多数据库 / 多 runtime 的支持边界还需要更明确的测试矩阵。

这意味着路线图的重点应该继续放在“把抽象做实”，而不是“把功能列表做长”。

## P0: 先把最危险的不一致锁住

P0 的目标不是“功能变多”，而是先让当前最危险的错位被测试和架构约束锁住。

### P0-1. Failed Midway Recovery 明确化

问题：

- 当前 webhook failed 后，duplicate delivery 会短路。
- `replayWebhook` 是只读，不会修复状态。
- “恢复”现在更多是文档预期，不是实现事实。

要做：

- 定义 failed receipt 的恢复策略。
- 明确 duplicate / replay / reconciliation job 各自职责。
- 先把现状和目标都写成测试。

落点：

- `test/scenario/sync/reconciliation-workflow.test.ts`
- `e2e/scenario/sync/provider-reconciliation.test.ts`
- `src/core/workflow-service.ts`

完成标准：

- 有一个本地 scenario 能稳定复现 “receipt 已落库但 projection 未完成”。
- 有一个明确入口能把状态恢复到与 clean success-path 一致。

### P0-2. Credit Refund 双重扣减风险锁定

问题：

- command path refund 和 webhook path refund 可能各写一笔 ledger。
- 两者幂等域不同，存在双扣风险。

要做：

- 先用测试锁住当前风险。
- 然后定义 credit refund 的唯一商业事实与单一记账来源。

落点：

- `test/scenario/credit/credit-workflow.test.ts`
- `test/scenario/refund/purchase-refund-workflow.test.ts`
- `e2e/scenario/refund/refund-reconciliation.test.ts`
- `src/core/workflow-service.ts`

完成标准：

- refund command + refund webhook 组合场景有明确回归测试。
- wallet.available 不会因为双路径处理而重复下降。

### P0-3. Metadata Fallback Recovery 锁住

问题：

- 当前关联恢复依赖多条 fallback 路径，但没有完整测试矩阵。

要做：

- 分别覆盖：
  - metadata 主路径
  - checkout intent fallback
  - provider customer ref fallback
  - subscription/invoice fallback
  - 无法恢复时的 rejected/unhandled

落点：

- `test/scenario/customer/customer-account-workflow.test.ts`
- `test/scenario/sync/reconciliation-workflow.test.ts`
- `test/scenario/webhook/webhook-workflow.test.ts`

完成标准：

- customer 和 offer 的恢复路径分别都有断言。
- 错绑 / cross-customer leakage 有明确回归。

### P0-4. Subscription Command / Projection 分层固定

问题：

- lifecycle command 和 webhook projection 在测试表达上容易混在一起。

要做：

- 保持命令侧和投影侧分层。
- 明确“command API 不伪造最终状态”的约束。

落点：

- `test/scenario/subscription/subscription-command-workflow.test.ts`
- `test/scenario/subscription/subscription-webhook-projection.test.ts`

完成标准：

- command tests 只验证 provider call + receipt + no premature local final state
- projection tests 专注 webhook -> local agreement -> snapshot -> entitlements

## P1: 让系统更像成熟的商业运行时

### P1-1. Reconciliation Job / Drift Repair

目标：

- 不把一致性完全寄托在实时 webhook 成功上。

要做：

- 增加 provider -> local 对账入口。
- 支持 repair provider refs、subscription/invoice drift、missing projection。

落点：

- 新增 reconciliation service / job
- `test/scenario/sync/*`
- `e2e/scenario/sync/*`

完成标准：

- 可以定期从 provider 拉取状态并修复本地。
- repair 结果可通过 `SqlClient` 和 snapshot 双重验证。

### P1-2. 状态机显式化

目标：

- 把 subscription / purchase / wallet 的状态迁移规则从散落代码里提炼出来。

要做：

- 形成显式 lifecycle transition table。
- 对非法迁移直接 fail 或记录 rejected fact。

落点：

- `src/core/commercial-schema.ts`
- `src/core/workflow-service.ts`
- `test/core/*`

完成标准：

- 状态迁移规则独立可测。
- out-of-order / duplicate 下仍能决定合法最终态。

### P1-3. Purchase Grant 单一真相

目标：

- one-time purchase 不再同时依赖 invoice 和“匹配 processed webhook”的模糊推断。

要做：

- 明确 purchase grant 的 canonical fact。
- 决定是否允许同一 offer 多次 one-time 购买。

落点：

- `src/core/projection-service.ts`
- `test/scenario/credit/credit-workflow.test.ts`
- `test/scenario/refund/purchase-refund-workflow.test.ts`

完成标准：

- grant 不会因为 unrelated processed webhook 被误推断。
- 多次购买语义有明确定义和回归测试。

### P1-4. Wallet Canonical Model

目标：

- 钱包始终以 ledger 为真相。

要做：

- 明确 fallback 到 entitlement balance 是兼容路径还是正式路径。
- 尽量减少双来源。

落点：

- `src/core/projection-service.ts`
- `test/scenario/credit/*`

完成标准：

- wallet source priority 和切换条件有明确测试。
- balance 计算公式固定：
  `available = max(grants + adjustments - consumes - refunds, 0)`

### P1-5. 数据库 / Runtime 支持边界清晰化

目标：

- 把“理论支持”推进成“测试矩阵支持”。

要做：

- 明确 SQLite / Postgres / MySQL 的正式覆盖边界。
- 明确 Node / Cloudflare Workers 的正式覆盖边界。
- 把 provider / db / runtime 组合映射成测试层级，而不是只写在文档里。

落点：

- `e2e/README.md`
- `test/scenario/COVERAGE-MATRIX.md`
- 对应的 runtime/database test plan

完成标准：

- 用户能清楚知道哪些组合已验证。
- 后续新增 provider 或 runtime 时，测试矩阵不会失控。

## P2: 向金融级稳定性再推进一步

### P2-1. Inbox / Outbox

目标：

- 把“接收事实”和“后续副作用”彻底隔离。

适用场景：

- webhook ingestion
- internal reconciliation actions
- downstream app event emission

### P2-2. Deterministic Replay

目标：

- 给定同一组输入事实，不管 replay 几次、顺序如何，最终 projection 一致。

要做：

- property-based / permutation-based tests
- deterministic processor boundary

### P2-3. Shadow Reconciliation

目标：

- 新 projection / 新规则先 shadow 计算，对比正式结果，再切换。

### P2-4. Dead-letter + Operator Tooling

目标：

- failed webhook 不只是 error log，而是可检查、可重试、可修复的对象。

## 测试路线

### 本地 Scenario

优先验证：

- provider call / provider state
- `SqlClient` durable facts
- SDK public read models

先实现这些：

1. `failed-midway recovery`
2. `credit refund no double-deduct`
3. `metadata fallback recovery`
4. `out-of-order convergence`
5. `default offer / activeOfferIds policy`

### Provider Contract

补全：

- Stripe subscription created/paused/resumed
- duplicate / out-of-order payload behavior
- capability mismatch and unsupported operations

### E2E

优先实现：

1. subscription acquisition after webhook projection
2. duplicate delivery no-op
3. provider/local/app state three-way consistency
4. credit purchase -> wallet grant -> consume
5. refund reconciliation
6. restart + reconciliation recovery

## 验证模板

后续每个测试尽量遵守这个结构：

```ts
// 1. arrange
// - customer / catalog / seed facts
// - provider harness setup

// 2. act
// - public SDK API or app HTTP API
// - optional webhook / replay / reconciliation

// 3. assert provider
// - PaymentClient get/list/latest or captured provider calls

// 4. assert database
// - SqlClient direct rows

// 5. assert public state
// - snapshot / entitlements / wallet
```

## 不要做的事

- 不要把更多精力花在“测试文件能跑起来的技巧”而忽略业务不变量。
- 不要把 provider event 名称当作测试标题中心。
- 不要接受只断言一张表的场景测试。
- 不要接受只看 snapshot 不看 durable facts 的高风险测试。
- 不要让 refund / credits / purchase 三套事实模型长期并存且无单一真相说明。
