# Coverage Matrix

这份矩阵用于回答三个问题：

1. 项目主流程里每一步现在由哪一层测试负责。
2. 哪些地方已经有覆盖，哪些地方只是 `todo` 规格。
3. 后续实现测试时，应该优先补哪类不变量。

更完整的阶段性推进见：

- `test/scenario/HARDENING-ROADMAP.md`

## 面向的复用场景

这套矩阵要服务的不是单一产品，而是“多个产品复用一套商业系统”的场景。

因此覆盖矩阵必须长期支持这些组合：

- 同一套 SDK 被多个产品复用。
- 同一组织的产品使用不同商业模式。
- 不同产品挂不同 provider。
- 不同产品跑在不同数据库和 runtime 上。

从测试角度看，这意味着：

1. 测试不能把 provider event 当成业务语言中心。
2. 测试不能默认只有一种数据库和一种运行时。
3. 测试必须优先验证复用抽象是否稳定：
   - `customerId`
   - `productId`
   - `offerId`
   - `agreementId`
   - `snapshot`
   - `entitlements`
   - `wallet`

## 主流程

```txt
catalog
-> checkout target
-> provider customer
-> checkout intent
-> provider event
-> webhook receipt
-> commercial event
-> subscription / invoice / credit ledger projection
-> customer snapshot
-> entitlements / wallet
```

## 覆盖责任

| 流程节点                      | 主要源码                                                         | 当前主要测试层                                                      | 说明                                                                         |
| ----------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| catalog normalization         | `src/dsl.ts`, `src/core/catalog-service.ts`                      | `test/core/*`, `test/scenario/catalog/*`                            | 校验商业 id、offer/product 解析、provider target 解析                        |
| checkout target resolution    | `src/core/catalog-service.ts`, `src/core/workflow-service.ts`    | `test/scenario/checkout/*`                                          | 校验 `offerId -> providerOfferId` 解析与失败路径                             |
| provider customer ensure      | `src/core/workflow-service.ts`, `src/core/workflow-store.ts`     | `test/scenario/checkout/*`, `test/scenario/customer/*`              | 校验 customer lookup/create/ref attach                                       |
| checkout intent persistence   | `src/core/workflow-service.ts`, `src/core/workflow-store.ts`     | `test/scenario/checkout/*`                                          | 校验 intent 元数据、provider session id、pending status                      |
| webhook receipt idempotency   | `src/core/workflow-store.ts`, `src/core/workflow-service.ts`     | `test/scenario/webhook/*`, `test/provider/*`                        | 校验 duplicate / replay 不重复落状态                                         |
| customer/offer recovery       | `src/core/workflow-service.ts`                                   | `test/scenario/sync/*`, `test/scenario/customer/*`                  | 校验 metadata、checkout intent、provider refs、subscription/invoice fallback |
| subscription projection       | `src/core/workflow-service.ts`, `src/core/projection-service.ts` | `test/scenario/subscription/*`                                      | 校验 agreement state 与 active access                                        |
| invoice / purchase projection | `src/core/workflow-service.ts`, `src/core/projection-service.ts` | `test/scenario/refund/*`, `test/scenario/credit/*`                  | 校验 invoice status、purchase grant、refund rollback                         |
| credit ledger / wallet        | `src/core/workflow-store.ts`, `src/core/projection-service.ts`   | `test/scenario/credit/*`                                            | 校验 grant / consume / refund / insufficient balance                         |
| customer snapshot             | `src/core/projection-service.ts`, `src/sdk.ts`                   | `test/scenario/customer/*`, `e2e/scenario/customer/*`               | 校验应用真正读到的业务状态                                                   |
| entitlements                  | `src/core/projection-service.ts`, `src/sdk.ts`                   | `test/scenario/subscription/*`, `test/scenario/customer/*`, `e2e/*` | 校验 feature/quota/license/credit balance                                    |

## 每个场景的最小断言集合

后续任何新场景，至少要同时包含下面三类断言：

| 断言层          | 必查内容                                                                                | 目的                                 |
| --------------- | --------------------------------------------------------------------------------------- | ------------------------------------ |
| provider client | provider customer / checkout / subscription / invoice / refund / transaction            | 防止第三方真实状态与本地状态分叉     |
| SqlClient       | intent / receipt / event / subscription / invoice / ledger / entitlement / provider_ref | 防止 workflow 或 projection 落库错误 |
| public SDK      | snapshot / entitlements / wallet                                                        | 防止应用真正读到的业务状态错误       |

如果某个测试只覆盖其中一层，这个测试就不是完整场景测试，而是局部测试。

## 当前已经相对扎实的部分

- checkout start 的本地 workflow
- webhook receipt duplicate 处理
- subscription projection 基础路径
- credits grant / consume 基础路径
- refund 基础路径
- portal create session 基础路径

这些都已经在现有 `test/scenario/*` 中有实现，不是只有占位。

## 当前架构上已经比较合理的部分

- 商业主键优先于 provider 主键。
- provider 已被隔离在 adapter/client 层。
- workflow 与 projection 分层已经成形。
- 订阅、买断、积分三类商业模型已经开始收敛到同一套 snapshot / entitlement 语言。

这些点说明系统已经具备“多产品复用”的基础。

## 当前更像规格而非实现的部分

- customer account workflow
- reconciliation workflow
- subscription command workflow
- subscription webhook projection workflow
- subscription acquisition e2e
- subscription lifecycle e2e
- checkout lifecycle e2e
- credit wallet lifecycle e2e
- refund reconciliation e2e
- provider reconciliation e2e
- webhook delivery e2e

这些地方目前更重要的是把业务承诺说清楚，而不是马上追求能完整跑通。

## 当前最需要继续审查的结构问题

从“给中小团队/工作室复用”这个目标来看，后续最需要盯住的是：

1. 恢复能力到底是架构现实，还是文档愿景。
2. 多 provider 复用时，agreement / purchase / refund / wallet 的真相是否统一。
3. 多数据库和多 runtime 支持，到底哪些已验证，哪些只是预期支持。
4. 产品策略是否从 provider 差异中彻底解耦。

## 优先补的缺口

### A. 关联恢复缺口

当前最值得优先补的不是新的 provider event 类型，而是 webhook 关联恢复。

优先场景：

- metadata 缺失，但 checkout intent 可恢复
- metadata 缺失，但 provider customer ref 可恢复
- metadata 缺失，但 subscription/invoice ref 可恢复
- 无法恢复时保持 rejected 或 unhandled 语义

### B. 投影收敛缺口

当前需要更明确地锁住最终应用状态。

优先场景：

- 同时存在 subscription + purchase + wallet 的 snapshot 组合
- default subscription offer 对 `activeOfferIds` 的影响
- duplicate / replay / out-of-order 后 snapshot 不变

### C. Credits / Refund 组合缺口

当前 credits 和 refund 分开测得还行，但组合语义还不够清楚。

优先场景：

- credits purchase -> wallet grant -> consume -> refund
- partial refund 对 invoice / grant / wallet 的影响
- 重复 refund webhook 不会重复扣 wallet

### D. Lifecycle 业务策略缺口

当前 lifecycle 相关测试表达还不够“产品化”。

优先场景：

- cancel requested 与 access removed 分离
- resume 后 snapshot 回到 active
- change plan 后 entitlements 切换
- preview 与最终 change 的业务含义一致

## 实施要求

后续补这些缺口时，统一遵守下面这个模板：

1. 用 `PaymentClient` 验证 provider 侧事实或 provider 调用。
2. 用 `SqlClient` 验证本地 durable facts。
3. 用 SDK public API 验证最终业务读模型。

不再接受只验证单表或只验证 provider payload 的“半场景测试”。

## 标题建议

后续测试标题优先表达业务承诺，不要优先表达 provider 事件名。

更好：

- `only grants subscription entitlements after webhook projection completes`
- `replays duplicate provider delivery without duplicating credits`
- `keeps cancellation access until confirmed period end`

更差：

- `handles invoice.paid`
- `processes checkout.session.completed`
- `sync works`
