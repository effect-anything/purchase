# Scenario Test Notes

这份说明不是实现文档，而是 `test/scenario/*` 和 `e2e/scenario/*` 后续落测试时的约束。

目标不是证明“某个 provider API 调通了”，而是证明 SDK 能把外部支付事实收敛成应用可依赖的商业状态。

配套推进路线见：

- `test/scenario/COVERAGE-MATRIX.md`
- `test/scenario/HARDENING-ROADMAP.md`

## 目标用户与产品边界

当前这套系统的目标用户，不是大型支付团队，而是：

- 中小团队
- 独立开发者
- 工作室
- 同时维护多个产品的组织

这类用户通常会遇到这些组合问题：

- 不同产品的商业模式不同：
  - 订阅制
  - 一次性买断
  - 积分制 / 额度制
- 不同产品接入的 provider 不同：
  - Stripe
  - Paddle
  - 后续更多 provider
- 不同产品使用的数据库不同：
  - SQLite
  - PostgreSQL
  - MySQL
  - D1 / LibSQL 等 serverless 变体
- 不同产品部署到不同 runtime：
  - Node.js
  - Cloudflare Workers

因此系统最重要的目标不是“把某个 provider API 包起来”，而是：

1. 给多个产品复用统一商业模型。
2. 隔离不同 provider 的差异。
3. 让本地商业状态可追踪、可修复、可重建。
4. 让数据库和 runtime 变化时，业务语义尽量不变。

这也意味着后续架构审查和测试审查，必须优先判断：

- 哪些抽象是真正可复用的。
- 哪些地方仍然绑定在单一 provider 或单一 runtime 上。
- 哪些测试已经在证明“跨产品可复用”，哪些还只是单路径 happy case。

## 项目主链路

结合当前源码，项目主链路可以抽象为：

```txt
catalog
-> resolve checkout target
-> ensure provider customer
-> create checkout session
-> persist checkout intent
-> receive webhook
-> persist webhook receipt + commercial event + projection rows
-> refresh customer snapshot
-> compute entitlements
```

对应核心实现位置：

- public contract: `src/sdk.ts`
- write workflow: `src/core/workflow-service.ts`
- write persistence: `src/core/workflow-store.ts`
- read projection: `src/core/projection-service.ts`
- catalog lookup: `src/core/catalog-service.ts`

## 测试中心

场景测试的中心不应该是 provider event 名称，而应该是不变量。

## 三向校验

后续每一个场景测试，默认都应该从三个视角校验同一件商业事实：

1. `SqlClient` / 底层表：
   验证本地 durable facts 是否真的写对，例如：
   - `paykit_checkout_intent`
   - `paykit_webhook_event`
   - `paykit_commercial_event`
   - `paykit_subscription`
   - `paykit_invoice`
   - `paykit_credit_ledger`
   - `paykit_provider_ref`
   - `paykit_entitlement`

2. `PaymentClient` / provider 视角：
   验证第三方平台上的真实状态或 provider call 语义是否一致。
   本地 scenario 至少要验证 provider call 输入、provider id、capability 路径。
   真实 e2e 则要尽量调用 provider client 的 `get/list/latest` 能力确认第三方状态。

3. SDK public read model：
   最终再验证：
   - `customer.getSnapshot`
   - `customer.getEntitlements`
   - `credits.getWallet`

这三个视角缺一不可。

如果只看数据库，可能漏掉 provider 侧真实状态已经漂移。
如果只看 provider，可能漏掉本地 projection 没收敛。
如果只看 snapshot / entitlements，可能漏掉 durable facts 已经写坏但暂时还能读出来。

对目标用户来说，这三向校验尤其重要，因为他们通常没有单独的支付运维团队。
系统必须尽量自己暴露“不一致在哪一层”，而不是把定位成本转嫁给使用者。

### 1. Commercial Id Stability

应用侧始终围绕这些 id 编程：

- `customerId`
- `productId`
- `offerId`
- `agreementId`

provider id 只应该作为 ref 存在，不能污染 public API 语义。

后续测试要反复断言：

- checkout 输入用 `offerId`
- snapshot / entitlement 输出仍然是商业 id
- provider 映射缺失或漂移时，恢复的是 ref，不是替换商业主键

### 2. Idempotency

当前源码明确把以下内容设计成幂等边界：

- webhook receipt
- commercial event
- checkout intent
- credit ledger
- refund mutation

后续测试不要只验证“第一次成功”，还要验证：

- 第二次不会重复 grant
- 第二次不会重复记账
- 第二次不会重复生成 agreement
- replay 不会改坏最终状态

### 3. Reconciliation

`workflow-service.ts` 在 webhook 处理中并不是只依赖 metadata。

它会按多种路径恢复关联关系，例如：

- `payCustomerId` / `payOfferId`
- checkout intent
- provider customer ref
- provider subscription id
- provider invoice id

这意味着后续必须有一组场景专门验证：

- 有 metadata 时的主路径
- metadata 缺失时的 fallback 路径
- fallback 也缺失时的拒绝或 unhandled 语义

### 4. Projection-First State

应用最终读到的是：

- `customer.getSnapshot`
- `customer.getEntitlements`
- `credits.getWallet`

这些都来自投影，而不是 provider 直接返回值。

后续测试要优先断言：

- snapshot 是否正确
- entitlements 是否正确
- wallet 是否正确

而不是把重点放在 provider payload 的细节。

### 5. Policy, Not Just Plumbing

源码里已经包含明确的业务策略：

- 订阅默认 offer 会影响 `activeOfferIds`
- purchase grant 会从 invoice + processed webhook 共同推导
- wallet 优先从 ledger 重建
- credit refund 会影响 wallet available
- subscription access / purchase access 有不同的状态判定

所以测试必须覆盖策略，而不仅是链路打通。

## 当前架构判断

结合现有源码，这套架构方向总体是合理的，尤其适合多产品复用：

1. public API 以商业主键为中心，而不是 provider id 为中心。
2. `catalog / workflow / store / projection` 分层清晰。
3. provider adapter 已经在承担 anti-corruption layer 的角色。
4. snapshot / entitlements / wallet 已经被当成最终产品输出，而不是 provider payload 的转发。

但也要明确当前仍然存在的收敛风险：

1. 恢复模型还没有完全闭环。
2. credits / refund 有双路径记账风险。
3. one-time purchase grant 的真相还不够单一。
4. 多数据库 / 多 runtime 的产品承诺，当前更多是架构意图，不是完整测试矩阵事实。

所以这个阶段更重要的不是继续扩功能，而是继续审查：

- 单一商业真相是否足够明确。
- projection 是否真的可重建。
- 多 provider / 多数据库 / 多 runtime 的支持边界是否被清楚表达。

## 推荐写法

### Local Scenario

本地场景测试优先写成：

```ts
describe("subscription change workflow", () => {
  // Validate business invariant, not provider-specific implementation detail.
  it.effect("switches entitlements only after reconciliation completes", () => {
    // arrange:
    // - seed customer
    // - sync catalog
    // - seed current agreement or webhook receipt
    // act:
    // - call sdk workflow
    // - optionally replay webhook
    // assert:
    // - SqlClient rows
    // - provider client state
    // - snapshot
    // - entitlements
  })
})
```

### E2E Scenario

真实 e2e 优先写成：

```ts
describe("subscription acquisition", () => {
  // Validate product promise through public app APIs.
  it.live("shows active subscription only after webhook round-trip", () => {
    // arrange:
    // - sign up session
    // - register webhook target
    // act:
    // - call app checkout API
    // - finish provider sandbox payment
    // assert:
    // - SqlClient rows in the app-owned database
    // - provider client state on the real sandbox account
    // - account snapshot
    // - entitlements
    // - optional diagnostics
  })
})
```

## 断言顺序

建议每个场景都按同样顺序写断言，避免漏掉某一层：

1. 先断言 provider 侧输入或状态。
2. 再断言 `SqlClient` 读到的本地 durable facts。
3. 最后断言 SDK public read model。

这样失败时也更容易定位：

- provider 不对：外部状态问题
- DB 不对：workflow/store/projection 问题
- snapshot 不对：projection/policy 问题

## 近期最值得优先实现的场景

如果后续只优先做少量测试，建议按这几个顺序：

1. subscription acquisition after webhook projection
2. duplicate webhook idempotency
3. checkout metadata missing but reconciliation succeeds via fallback refs
4. credits purchase -> wallet grant -> consume -> insufficient balance
5. refund -> entitlement or wallet rollback
6. lifecycle change -> snapshot and entitlements switch

这些场景在实现时，都要明确带上：

- `SqlClient` 查询断言
- `PaymentClient` provider 断言
- public read model 断言

## 避免的误区

- 不要把场景测试写成 provider SDK 单元测试。
- 不要只断言数据库表变化，不断言 snapshot / entitlements。
- 不要只断言最终成功路径，不覆盖 duplicate / replay / out-of-order。
- 不要让文件名退化成 `sync.test.ts` 这种没有业务语义的名字。
- 不要把实现细节硬编码到测试标题里，标题应该表达业务承诺。
