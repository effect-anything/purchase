# Purchase SDK 产品级端到端测试与推进文档

这份文档是 `@effect-x/purchase` 后续端到端测试、场景覆盖和产品级可靠性建设的正式来源。新增测试、调整测试架构、扩展供应商、扩展数据库或平台支持时，都应该先更新这里，再落到代码。

## 产品目标

`@effect-x/purchase` 的目标不是做一个薄的 Stripe/Paddle wrapper，而是成为 TypeScript 生态里的开源商业化运行时。

我们希望开发者安装这个 package 后，可以快速给自己的产品接入：

- 订阅制 SaaS。
- 一次性买断。
- 预付积分或额度。
- 功能权益控制。
- 客户账单状态查询。
- 第三方支付供应商 webhook。
- 自己数据库里的商业状态维护。

目标用户不应该需要先理解每个供应商的底层差异，例如 Paddle transaction、Stripe checkout session、subscription item、price/product 映射、webhook 乱序和重复投递等。SDK 应该把这些复杂度收敛为稳定的业务模型：

```txt
catalog -> checkout -> provider payment -> webhook -> database -> snapshot -> entitlements
```

一句话定位：

```txt
面向 TypeScript 应用的开源支付商业化运行时：
统一订阅、买断、积分、权益和第三方支付回调，并把状态维护在用户自己的数据库中。
```

## 参考范式

Better Auth 这类 TypeScript 生态开源库值得参考。它们的共同点不是功能堆叠，而是：

- 解决高频、真实、长期存在的问题。
- TypeScript 原生。
- 框架无关，但提供常见框架集成。
- 插件或 adapter 边界清晰。
- 数据归用户自己的数据库。
- 文档以场景驱动，而不是只列 API。
- 测试、示例和迁移路径足够可信。

`@effect-x/purchase` 应该对标这种开发者体验，但领域是 billing/commercial runtime：

```txt
Better Auth 解决 auth。
Purchase SDK 解决 billing、subscriptions、credits、entitlements。
```

这要求我们的测试体系本身成为信任资产。支付系统是关键路径，用户需要相信：

- webhook 重复投递不会重复发放权益。
- webhook 延迟或乱序不会造成错误状态。
- 数据库状态可恢复、可重放、可查询。
- 供应商 API 或前端 checkout 变化能被真实 E2E 尽早发现。
- 不同数据库和部署平台有明确支持边界。

## 当前 SDK 能力

当前 SDK 已经具备以下核心结构：

- `PurchaseSDK`：应用侧绑定 catalog 后得到的业务运行时。
- `PurchaseProvider`：在运行时边界选择 Stripe、Paddle 等供应商 layer。
- Catalog DSL：描述产品、套餐、offer 和 benefits。
- Checkout workflow：通过稳定 `offerId` 创建 provider checkout。
- Webhook workflow：接收 provider webhook、归一化事件、写入商业状态。
- Customer snapshot：查询客户当前商业状态。
- Entitlements：根据订阅、购买或额度计算应用权益。
- Credits：查询、发放、消费额度。
- Purchases/refund：一次性购买和退款工作流。
- Subscription lifecycle：取消、恢复、暂停、套餐变更和 preview。
- Portal：创建供应商账单门户 session。
- Storage adapter：通过 SDK-owned tables 或 override 嵌入应用数据库。
- Provider adapter：当前重点覆盖 Paddle 和 Stripe。

当前 public API 的核心形态：

```ts
const checkout =
  yield *
  Pay.checkout.start({
    customerId,
    offerId: "app:pro_monthly"
  })

const snapshot = yield * Pay.customer.getSnapshot({ customerId })
const entitlements = yield * Pay.customer.getEntitlements({ customerId })
const wallet = yield * Pay.credits.getWallet({ customerId, creditKey: "ai_tokens" })
```

测试文档和后续场景应围绕这些 public API 验证，而不是围绕 internal 函数验证。

## 测试分层

当前仓库已经存在多层测试：

- `test/core/*`：catalog、workflow、projection、state-store、schema 等核心模型测试。
- `test/provider/*`：provider adapter、webhook fixture、webhook replay 等边界测试。
- `test/scenario/*`：本地模拟 provider 的业务工作流测试。
- `test/internal/*`：HTTP retry、Cloudflare D1 client 等内部基础设施测试。
- `e2e/scenario/*`：真实 provider / 真实 HTTP app / 真实浏览器 / 真实 webhook 的端到端测试。

后续我们将测试分成三类目标：

1. **核心正确性测试**：快速、稳定、可并发，覆盖状态机、幂等、投影和权益计算。
2. **Provider contract 测试**：验证供应商 API、webhook payload、fixture 和 adapter 兼容性。
3. **真实 Provider E2E**：使用真实 sandbox、真实浏览器、真实 webhook 和真实数据库 schema，验证用户应用集成闭环。

真实 Provider E2E 不追求覆盖所有排列组合，而是覆盖最关键的产品承诺和高风险链路。

## 端到端测试目标

端到端测试不是测试 SDK 的内部函数，而是模拟一个真实用户安装并集成这个 SDK 后，能否完成完整支付业务闭环。

端到端测试必须验证：

- 用户应用只通过 SDK public API 接入支付能力。
- 用户应用通过 HTTP API 和浏览器完成真实业务流程。
- SDK 能调用真实第三方支付供应商的 sandbox/test mode。
- 第三方供应商 webhook 能经公网入口回到本地测试应用。
- SDK 能校验 webhook、归一化事件、写入数据库并刷新业务投影。
- 用户应用能从 SDK 查询订阅、订单、额度、权益等业务状态。

端到端测试不应该依赖：

- 直接调用 SDK internal 模块。
- 直接写 SDK 数据表来伪造完成状态。
- 跳过 provider webhook。
- 用 mock provider 替代真实 provider sandbox。
- 测试专用的非 public API。

## 当前真实 E2E 流程

当前 Paddle subscription 场景的完整流程如下：

1. Vitest 启动 provider e2e project。
2. 全局 setup 获取 `paddle:sandbox` 锁，避免多个进程同时修改 Paddle webhook。
3. 全局 setup 启动 webhook broker。
4. 全局 setup 给 broker 启动公网 tunnel。
5. 全局 setup 将 Paddle webhook URL 更新为 broker 的公网地址。
6. 每个测试启动一个本地 HTTP 应用，端口随机。
7. 本地 HTTP 应用使用真实 SDK public API 初始化支付能力。
8. 测试应用向 broker 注册 `runId -> local webhook URL`。
9. 测试通过 HTTP API 注册用户、创建 checkout。
10. SDK 调用真实 Paddle sandbox API 创建 transaction。
11. Playwright 打开真实 Paddle checkout 页面并完成 sandbox 支付。
12. Paddle 将真实 webhook 发送到 broker。
13. Broker 从 webhook payload 的 `custom_data.purchaseE2eRunId` 读取 `runId`。
14. Broker 将原始 webhook body 和签名 header 转发到对应测试应用。
15. 测试应用使用 SDK webhook handler 校验签名、处理事件、写入数据库。
16. 测试通过 HTTP API 查询 account snapshot 和 entitlements。
17. 测试断言订阅、权益、额度或订单状态符合预期。

这个流程验证的是：

```txt
安装 SDK -> 启动用户应用 -> 创建 checkout -> 真实支付 -> 真实 webhook -> 数据库投影 -> 应用查询状态
```

## 基础设施边界

### Global Setup

`e2e/setup/provider-e2e.ts` 负责 provider 级别的全局准备工作。

它只应该做共享外部资源相关的事情：

- 获取 provider 锁。
- 启动 webhook broker。
- 启动 broker 的公网 tunnel。
- 更新 provider webhook 配置。
- 向测试 worker 注入 broker 地址。

它不应该创建具体业务用户，也不应该执行具体支付场景。

### Provider Lock

`e2e/infra/provider-lock.ts` 用来保护共享 provider sandbox。

Paddle sandbox webhook 配置是外部共享状态。如果两个测试进程同时更新 webhook URL，会导致 webhook 发送到错误的测试进程。因此真实 provider e2e 必须持有锁。

当前锁粒度：

```txt
paddle:sandbox
```

后续新增供应商时应使用类似粒度：

```txt
stripe:test
paddle:sandbox
```

CI 中还应该配合 workflow concurrency，避免多个 CI job 同时操作同一个 provider sandbox。

### Webhook Broker

`e2e/infra/webhook-broker.ts` 是 provider webhook 的全局入口。

Broker 的职责：

- 接收 provider 发送的真实 webhook。
- 保留原始 body 和签名 header。
- 从 provider payload 中提取 `purchaseE2eRunId`。
- 根据 `runId` 查找注册的本地测试应用。
- 将 webhook 转发到该测试应用。

Broker 默认应该按 `runId` 路由，不应该广播给所有测试应用。广播只适合调试，不适合作为默认行为。

后续 broker 需要继续增强：

- 记录转发日志。
- 暂存短时间内找不到 target 的 webhook。
- 对 target 转发失败做 retry。
- 暴露 diagnostics endpoint。
- 支持 Stripe、Paddle 以外的供应商。

### 用户应用 Harness

`e2e/http-api/*` 模拟真实用户应用。

它应该表现为一个用户安装 SDK 后搭建出来的最小应用：

- 有 HTTP server。
- 有登录或 session。
- 有用户、账户、checkout、webhook 等 API。
- 使用真实 SDK public API。
- 使用真实数据库 schema。
- 不直接调用 SDK internal 模块。

测试只能通过 HTTP API 或浏览器驱动这个应用。

### Provider Driver

`src/harness/provider-drivers/*` 负责 provider-specific 浏览器操作和 provider polling。

例如 Paddle driver 负责：

- 打开 checkout 页面。
- 处理 ngrok warning 页面。
- 填写 Paddle sandbox 卡片信息。
- 提交支付。
- 等待 provider transaction/subscription 状态。

场景测试不应该知道 Paddle checkout iframe 的细节。

## 场景测试规范

每个端到端测试文件应该回答三个问题：

1. 这个测试覆盖哪个用户业务场景？
2. 这个测试验证 SDK 对外承诺的哪些能力？
3. 这个测试成功后，用户应用能依赖哪些状态？

推荐结构：

```ts
describe("subscription e2e", () => {
  it.live("用户购买订阅后获得订阅权益", () =>
    Effect.gen(function* () {
      const session = yield* Harness.signUp()
      yield* Harness.registerWebhookTarget()

      const result = yield* Harness.purchaseSubscription({
        session,
        offerId: "notes:notes_pro_monthly"
      })

      // 断言 checkout、provider transaction、本地 account snapshot、entitlements
    }).pipe(Effect.provide(Live))
  )
})
```

场景测试应该保持业务语义清晰，不应该内联 provider/browser/webhook 的底层细节。

## 覆盖矩阵

### 已有覆盖

| 能力                              | 覆盖位置                                         | 级别              | 状态   |
| --------------------------------- | ------------------------------------------------ | ----------------- | ------ |
| Catalog builder / schema          | `test/core/*`                                    | core              | 已覆盖 |
| Workflow store / state store      | `test/core/*`                                    | core              | 已覆盖 |
| Projection / entitlements         | `test/core/*`, `test/scenario/*`                 | core/scenario     | 已覆盖 |
| Provider webhook fixture          | `test/provider/*`                                | provider contract | 已覆盖 |
| Webhook replay                    | `test/provider/webhook-replay.test.ts`           | provider contract | 已覆盖 |
| Checkout workflow                 | `test/scenario/checkout/*`                       | local scenario    | 已覆盖 |
| Credit workflow                   | `test/scenario/credit/*`                         | local scenario    | 已覆盖 |
| Refund workflow                   | `test/scenario/refund/*`                         | local scenario    | 已覆盖 |
| Subscription projection           | `test/scenario/subscription/*`                   | local scenario    | 已覆盖 |
| Paddle real subscription checkout | `e2e/scenario/subscription/subscription.test.ts` | real provider e2e | 已覆盖 |

### 必测场景

#### 订阅购买

目标：验证用户购买订阅后，本地应用获得 active subscription 和对应权益。

需要验证：

- SDK 能创建真实 provider checkout。
- 浏览器能完成真实 sandbox 支付。
- Provider webhook 能回到测试应用。
- 本地 checkout intent 进入完成态。
- customer snapshot 包含 active subscription。
- entitlements 包含订阅权益。

当前覆盖：

- `e2e/scenario/subscription/subscription.test.ts`

#### 一次性购买

目标：验证用户购买一次性商品后，本地应用记录 purchase grant 或对应权益。

需要验证：

- checkout 创建和 provider transaction 完成。
- webhook 被处理。
- 本地订单或 grant 状态完成。
- 对应一次性权益可查询。

状态：待实现。

#### 预付额度购买

目标：验证用户购买 credits 后，额度钱包入账。

需要验证：

- credits offer 能创建 checkout。
- provider payment 完成后 webhook 入账。
- wallet acquired / available 增加。
- 后续 consume 能扣减 available 并记录 ledger。

状态：待实现。

#### 额度消费

目标：验证应用通过 SDK 消费额度时，钱包和 ledger 状态正确。

需要验证：

- available 充足时消费成功。
- available 不足时返回业务错误。
- 幂等 key 不重复扣减。
- account API 能看到最新钱包状态。

状态：待实现。

#### 订阅取消

目标：验证用户取消订阅后，本地状态和权益按 provider 生命周期变化。

需要验证：

- SDK 能调用 provider cancel API。
- webhook 或 provider polling 后本地 subscription 状态更新。
- 取消后权益是否保留到周期结束，符合产品规则。

状态：待实现。

#### 订阅恢复

目标：验证用户恢复已取消但仍在周期内的订阅。

需要验证：

- SDK 能调用 provider resume API。
- 本地 subscription 状态恢复。
- entitlements 仍然有效。

状态：待实现。

#### 套餐变更

目标：验证用户 upgrade/downgrade 后，本地订阅和权益切换正确。

需要验证：

- preview 结果可用。
- provider subscription item 变更成功。
- webhook 更新本地 offerId。
- entitlements 从旧权益切换到新权益。

状态：待实现。

#### 退款

目标：验证 provider refund 后，本地订单、grant、credits 或权益状态符合规则。

需要验证：

- SDK 能发起 refund 或处理 provider refund webhook。
- 本地商业事件记录 refund。
- 相关权益、额度或订单状态被修正。

状态：待实现。

#### Billing Portal

目标：验证用户能通过 SDK 创建 provider portal session，并完成供应商侧账户管理流程。

需要验证：

- portal session 创建成功。
- provider 返回可访问 URL。
- 用户在 portal 中的操作能通过 webhook 回写本地状态。

状态：待实现。

## 数据库与部署平台路线

支付 SDK 的核心价值之一是替用户维护商业数据。因此数据库和部署平台不是附属能力，而是产品能力。

### 数据库目标

必须支持：

- SQLite：本地开发、轻量应用、测试。
- PostgreSQL：主流 SaaS 生产环境。
- MySQL：传统生产环境和部分云数据库。

后续可扩展：

- Cloudflare D1。
- LibSQL / Turso。
- Neon / serverless Postgres。
- PlanetScale / serverless MySQL。

数据库测试要求：

- 使用真实 schema。
- 验证 migration 或初始化流程。
- 验证幂等写入。
- 验证重复 webhook 不重复发放权益或额度。
- 验证乱序 webhook 不产生错误最终状态。

### 部署平台目标

必须支持：

- Node.js。
- Cloudflare Workers。

后续可扩展：

- Bun。
- Deno。
- Vercel Edge / Netlify Edge，前提是 provider SDK、crypto、DB adapter 能满足运行时约束。

平台测试要求：

- 核心逻辑尽量 Web API-first。
- Node-only 能力放在 adapter 或 infra 层。
- Workers 环境使用 fetch、Web Crypto、D1/HTTP DB adapter。

## 并发策略

真实 provider e2e 默认不追求无约束并发。

当前策略：

- provider e2e 启用 `fileParallelism: false`。
- provider setup 使用 provider lock。
- 每个测试应用使用随机端口。
- 多个测试应用通过 broker 的 `runId` 路由隔离 webhook。

这个策略保证：

- provider webhook 只更新一次。
- 多个测试文件不会重复抢占 provider webhook。
- 后续可以逐步放开同一进程内的场景并发。

禁止：

- 在 provider e2e 中随意使用 `it.concurrent`。
- 每个测试直接更新 provider webhook URL。
- 多个 CI job 共用同一个 provider sandbox 且没有 concurrency group。

## 新增测试流程

新增一个 provider e2e 场景时，按以下步骤：

1. 在 `e2e/scenario/<workflow>/` 下创建测试文件。
2. 使用现有 `Live` layer 或提取后的场景 runtime。
3. 启动用户 session。
4. 调用 `registerWebhookTarget()`。
5. 通过用户应用 HTTP API 执行业务动作。
6. 如果需要支付，调用 payment harness 完成真实 checkout。
7. 等待 provider/webhook/account 状态稳定。
8. 断言 provider transaction、本地 snapshot、entitlements 或 wallet。
9. 失败时输出 runId、transaction id、account snapshot 和 webhook 信息。

新增场景前，应先在本文档的“必测场景”里明确：

- 场景目标。
- 需要验证的能力。
- 成功后的业务状态。

## 文档与示例路线

要达到热门开源库级别，文档必须以用户场景为中心。

需要补齐的文档：

- 5 分钟 Quick Start。
- SaaS 订阅接入指南。
- AI credits 接入指南。
- 一次性买断接入指南。
- Webhook endpoint 接入指南。
- Entitlements 查询指南。
- Provider 配置指南：Stripe、Paddle。
- 数据库指南：SQLite、Postgres、MySQL。
- 平台指南：Node.js、Cloudflare Workers。
- 故障排查：webhook、provider config、checkout、数据库状态。

需要补齐的示例：

- `examples/nextjs`
- `examples/hono`
- `examples/remix`

每个示例都应该能展示：

```txt
catalog -> SDK setup -> checkout endpoint -> webhook endpoint -> account endpoint -> frontend usage
```

## 产品级完成标准

一个支付场景只有同时满足以下条件，才算产品级端到端覆盖：

- 使用真实 SDK public API。
- 通过真实 HTTP 应用触发。
- 通过真实 provider sandbox 完成外部交互。
- 通过真实 webhook 回写本地。
- 使用真实数据库 schema 写入和读取状态。
- 断言用户应用最终可依赖的业务状态。
- 失败时有足够诊断信息定位 provider、broker、app、数据库任一环节。

这套标准的目标是保证开源用户安装 `@effect-x/purchase` 后，能够依赖 SDK 完成支付接入、数据维护和业务查询，而不需要理解每个第三方支付供应商的内部差异。

## 近期推进顺序

近期不追求一次性覆盖所有能力，而是按产品价值排序：

1. 稳定当前 Paddle subscription E2E。
2. 提取通用 scenario runtime，减少测试文件重复 wiring。
3. 增强 broker diagnostics 和转发 retry。
4. 实现一次性购买真实 E2E。
5. 实现 credits 购买和消费真实 E2E。
6. 增加 subscription cancel/resume/change E2E。
7. 增加 refund E2E。
8. 增加 Stripe provider E2E。
9. 增加 Postgres 数据库矩阵。
10. 增加 Cloudflare Workers 平台验证。

这份文档应随着每个阶段更新，作为项目产品级测试建设的进度来源。
