# Draft: Purchase SDK Refinement

## Requirements (confirmed)

- "purchase 是我们的支付 package"
- 封装多个第三方支付供应商，输出统一 SDK
- 目标用户是小型工作室或小团队，可能同时维护多个项目
- 需要支持多种销售/商业模式：订阅制、买断、积分包、按 token 计费等
- 用户通过 DSL 定义商品，由系统同步到第三方支付供应商
- SDK 需要提供 API 去操作支付流程
- 自动处理 webhook 与背后的复杂业务逻辑
- 数据库需要兼容 sqlite 与 postgres
- 当前主体已基本完成，但仍有一些细节不太对，需要系统化梳理和修正计划
- 当前最高优先级：对外 API / DX 不顺手
- 需要有示例项目，且示例项目本身应可跑通关键支付接入路径
- 需要有测试用例，保证示例和核心能力可验证
- 作为开源项目推广，核心诉求是让外部用户能够方便地对接支付系统
- 本轮范围：只修现有实现细节，重点收好 API / DX + example + tests，并让 SDK 对外形态更干净
- 测试策略：基于现有测试体系补测试

## Technical Decisions

- 暂定将本次工作按架构级规划处理，先确认现有 package 边界、DSL 设计、provider 适配层、webhook 流程与数据库抽象
- 暂时将“示例项目 + public API + 测试可验证性”视为本轮核心交付面
- 不做整体系重构；优先通过 public API 收口、示例项目打磨、现有测试体系补强来改善开源接入体验

## Research Findings

- 待补充：仓库结构、purchase package 入口、测试基础设施、现有 provider 模式
- 测试基础设施已存在：仓库使用 Vitest workspace/shared 配置，purchase package 有独立 vitest 配置
- purchase 已有 unit / integration / e2e / provider-live / webhook / catalog-sync / subscription / credit workflow 测试模式
- 当前具备将“示例项目可运行 + SDK API 可验证 + provider/webhook 场景回归”纳入计划的基础
- Oracle 规划护栏：需明确 public API 稳定边界、避免 provider 能力被过度抽象、明确 catalog sync 的 destructive policy、保持 sqlite/postgres 行为一致、把 webhook 去重/重放/对账视为关键验证面

## Open Questions

- 待补充：现有 package 结构、入口与示例项目/公共 API 对应关系（来自代码库扫描）

## Scope Boundaries

- INCLUDE: purchase package 的架构梳理、现状调研、public API/DX、示例项目、测试验证、细化修正计划
- EXCLUDE: 支付领域模型的大重构、未经确认的跨仓库业务重构、非 purchase 相关 package 改动、从零重建测试基础设施
