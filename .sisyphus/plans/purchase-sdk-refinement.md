# Purchase SDK Refinement

## TL;DR

> **Summary**: Tighten the existing `@effect-x/purchase` package for open-source adoption by cleaning the public API/DX, aligning the example app with the intended onboarding path, and strengthening tests around the consumer-facing contract.
> **Deliverables**:
>
> - Cleaner stable public API and import guidance for `packages/purchase`
> - Runnable, credible example integration path in `examples/nextjs`
> - Expanded verification for public API, catalog sync, checkout, webhooks, and DB-backed flows
>   **Effort**: Large
>   **Parallel**: YES - 3 waves
>   **Critical Path**: 1 → 2 → 4 → 8

## Context

### Original Request

Refine the existing `purchase` payment package so it is easier to adopt as an open-source SDK for small teams running multiple projects and payment models. The package already supports DSL-defined products, provider sync, APIs, webhook handling, and sqlite/postgres compatibility, but the external shape and some details need tightening.

### Interview Summary

- Priority is **public API / DX**.
- Scope is **refinement only**, not a domain-model or provider-architecture redesign.
- This round must emphasize **API/DX + example + tests**.
- The goal is open-source adoption: external users should be able to integrate payment flows with minimal friction.
- Testing should build on the **existing Vitest-based stack**, not introduce new infrastructure.

### Metis Review (gaps addressed)

- Defaulted the stable contract to **root import first**, with subpaths remaining public only where intentionally documented and tested.
- Defaulted the onboarding target to the existing **Next.js example + sandbox/test-mode flow**, not a new app architecture.
- Defaulted compatibility policy to **preserve existing public names unless removal is already unused and covered by tests**.
- Added explicit guardrails for webhook replay/dedupe, sqlite/postgres parity, and catalog sync safety semantics.

## Work Objectives

### Core Objective

Make `@effect-x/purchase` feel stable, understandable, and easy to adopt without changing its fundamental architecture.

### Deliverables

- A clearly defined and tested stable consumer-facing package surface.
- Example project wiring that demonstrates the recommended integration path.
- Stronger public-contract and workflow verification for checkout, webhook handling, and sync behavior.
- Updated package documentation/guidance that matches actual supported usage.

### Definition of Done (verifiable conditions with commands)

- `pnpm --filter @effect-x/purchase test public-api.test.ts`
- `pnpm --filter @effect-x/purchase test catalog-sync.test.ts`
- `pnpm --filter @effect-x/purchase test e2e/checkout-workflow.test.ts`
- `pnpm --filter @effect-x/purchase test e2e/webhook-workflow.test.ts`
- `pnpm check`
- `pnpm lint-fix`

### Must Have

- Root package import remains the primary documented entrypoint.
- Example wiring demonstrates the preferred consumer setup path.
- Tests lock the intended public API and critical billing flows.
- No regression in webhook replay/dedupe or sync safety semantics.

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)

- No redesign of provider abstractions, storage architecture, or DSL domain model.
- No new example app architecture or test framework.
- No undocumented breaking public API removals.
- No weakening of sqlite/postgres compatibility expectations.

## Verification Strategy

> ZERO HUMAN INTERVENTION - all verification is agent-executed.

- Test decision: tests-after + existing Vitest workspace (`vitest.shared.ts`, `packages/purchase/vitest.config.ts`)
- QA policy: Every task has agent-executed scenarios
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy

### Parallel Execution Waves

> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: public contract definition, example-path inventory, sync/webhook guardrail inventory
Wave 2: public API cleanup, example onboarding cleanup, verification hardening
Wave 3: DB parity polish, final docs/tests alignment

### Dependency Matrix (full, all tasks)

- 1 blocks 2, 4, 8
- 2 blocks 8
- 3 blocks 4, 7
- 4 blocks 8
- 5 blocks 6, 8
- 6 blocks 8
- 7 blocks 8
- 8 blocks Final Verification Wave

### Agent Dispatch Summary (wave → task count → categories)

- Wave 1 → 3 tasks → `unspecified-high`, `deep`
- Wave 2 → 3 tasks → `quick`, `unspecified-high`
- Wave 3 → 2 tasks → `unspecified-high`, `writing`

## TODOs

> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Define the stable consumer contract for `@effect-x/purchase`

  **What to do**: Audit the actual consumer-facing export surface and convert it into an explicit contract for this release. Treat `packages/purchase/src/public.ts` as the primary stable entrypoint and decide, file-by-file, which subpath imports remain intentionally public versus merely technically exported by `package.json`. Update implementation, package metadata, and tests so the supported import story is unambiguous and matches the open-source onboarding narrative.
  **Must NOT do**: Do not redesign the runtime architecture, provider contracts, or DSL model. Do not silently remove exports that existing tests, example code, or README usage depends on without replacing them with a documented compatibility path.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: touches public contract, exports, docs alignment, and requires cautious compatibility judgment.
  - Skills: [`effect-v4-best-practices`] - why needed: maintain coherent public typing and Effect-first SDK surface while refining exports.
  - Omitted: [`frontend-design`] - why not needed: no UI work.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [2, 4, 8] | Blocked By: []

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `packages/purchase/src/public.ts:1` - current root public surface.
  - Pattern: `packages/purchase/package.json:34` - current root and wildcard subpath export map.
  - Pattern: `packages/purchase/test/public-api.test.ts:1` - current public contract test shape.
  - Pattern: `packages/purchase/README.md:39` - package-level quick-start and consumer framing.
  - Pattern: `examples/nextjs/purchase.ts:1` - example currently imports subpaths for provider/runtime wiring.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Supported import paths are explicitly represented in code/package metadata and no longer rely on ambiguous wildcard behavior alone.
  - [ ] `packages/purchase/test/public-api.test.ts` (or successor) verifies the intended stable root surface and any allowed subpaths.
  - [ ] README examples use only supported public imports.
  - [ ] `pnpm --filter @effect-x/purchase test public-api.test.ts` exits `0`.

  **QA Scenarios** (MANDATORY - task incomplete without these):

  ```
  Scenario: Root consumer import contract stays valid
    Tool: Bash
    Steps: Run `pnpm --filter @effect-x/purchase test public-api.test.ts`
    Expected: Test passes and confirms the intended root API members remain available.
    Evidence: .sisyphus/evidence/task-1-stable-consumer-contract.txt

  Scenario: Unsupported or narrowed import path is caught by contract tests
    Tool: Bash
    Steps: Run the same focused public API test suite after contract cleanup; ensure assertions cover subpath support or exclusion explicitly.
    Expected: Test output demonstrates a binary pass/fail contract rather than undocumented import ambiguity.
    Evidence: .sisyphus/evidence/task-1-stable-consumer-contract-error.txt
  ```

  **Commit**: YES | Message: `refactor(purchase): define stable public contract` | Files: `packages/purchase/src/public.ts`, `packages/purchase/package.json`, `packages/purchase/test/public-api.test.ts`, `packages/purchase/README.md`

- [x] 2. Clean up consumer-facing API/DX around runtime wiring and naming

  **What to do**: Refine the public API surface so common consumer flows are easier to discover and compose. Focus on confusing names, overly internal-looking entrypoints, and friction between root imports and subpath imports for SDK setup, provider wiring, and common schemas/types. Preserve behavior while improving clarity of the externally visible shape.
  **Must NOT do**: Do not broaden provider capability claims, add new payment features, or change workflow semantics. Do not break the example app or existing supported imports without simultaneously updating them and covering with tests.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: requires careful source cleanup across SDK, docs, exports, and tests.
  - Skills: [`effect-v4-best-practices`] - why needed: preserve strong type inference and Effect service ergonomics while renaming/reorganizing public symbols.
  - Omitted: [`eventlog-local-first`] - why not needed: unrelated domain.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [8] | Blocked By: [1]

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `packages/purchase/src/sdk.ts:44` - public checkout/workflow request types and comments.
  - Pattern: `packages/purchase/src/provider/client.ts:1` - externally relevant provider client contract complexity.
  - Pattern: `packages/purchase/src/dsl.ts:12` - current consumer DSL vocabulary.
  - Pattern: `packages/purchase/README.md:47` - current quick-start API story.
  - Test: `packages/purchase/test/public-api.test.ts:5` - visible symbols already locked in tests.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Common SDK setup/imports are easier to understand from exported names and docs without requiring internal file discovery.
  - [ ] Public type inference for DSL/products/runtime remains intact under tests/typecheck.
  - [ ] Example and README both use the updated, recommended API shape.
  - [ ] `pnpm check` exits `0` after the cleanup.

  **QA Scenarios** (MANDATORY - task incomplete without these):

  ```
  Scenario: Type-safe SDK setup still compiles
    Tool: Bash
    Steps: Run `pnpm check`
    Expected: Typecheck passes with no regressions in public type inference or imports.
    Evidence: .sisyphus/evidence/task-2-api-dx-typecheck.txt

  Scenario: Public API rename/reorg does not break example wiring silently
    Tool: Bash
    Steps: Run focused tests covering public API plus any example-related typechecked paths required by the repo.
    Expected: Either tests pass or a failure clearly identifies any remaining consumer-facing mismatch.
    Evidence: .sisyphus/evidence/task-2-api-dx-typecheck-error.txt
  ```

  **Commit**: YES | Message: `refactor(purchase): improve sdk api ergonomics` | Files: `packages/purchase/src/sdk.ts`, `packages/purchase/src/public.ts`, `packages/purchase/src/provider*.ts`, `packages/purchase/src/dsl.ts`, `packages/purchase/README.md`, `packages/purchase/test/public-api.test.ts`

- [x] 3. Lock down catalog sync safety and destructive-behavior expectations

  **What to do**: Audit the current catalog sync semantics and make sure the intended safe/dry-run/destructive behavior is explicit in implementation-facing docs/tests. Strengthen tests so users integrating the SDK can trust what happens when local DSL state differs from provider state, especially around ownership and archive/removal behavior.
  **Must NOT do**: Do not redesign sync ownership strategy or invent a new catalog model. Do not broaden scope into provider-specific product management beyond the already supported flow.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: contract-critical behavioral clarification with storage/provider ramifications.
  - Skills: [`effect-v4-best-practices`] - why needed: preserve service behavior and typed result contracts while clarifying semantics.
  - Omitted: [`frontend-design`] - why not needed: backend/test work only.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: [4, 7] | Blocked By: []

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `packages/purchase/src/core/catalog-service.ts:54` - provider ownership/archive keys and sync semantics.
  - Test: `packages/purchase/test/catalog-sync.test.ts:10` - current dry-run and write-path expectations.
  - Pattern: `packages/purchase/src/dsl.ts:42` - plan/provider mapping input feeding sync behavior.
  - Doc: `packages/purchase/README.md:31` - claims about DSL/runtime/features that need to match sync semantics.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Dry-run behavior, local row writes, provider ref writes, and destructive/archival expectations are explicitly covered by tests.
  - [ ] Contract wording in docs/comments matches the implemented sync behavior.
  - [ ] `pnpm --filter @effect-x/purchase test catalog-sync.test.ts` exits `0`.

  **QA Scenarios** (MANDATORY - task incomplete without these):

  ```
  Scenario: Safe dry-run path remains non-destructive
    Tool: Bash
    Steps: Run `pnpm --filter @effect-x/purchase test catalog-sync.test.ts`
    Expected: Tests prove dry-run does not write local rows or provider refs while still producing a sync plan.
    Evidence: .sisyphus/evidence/task-3-catalog-sync-safety.txt

  Scenario: Destructive/archive edge case stays explicit and tested
    Tool: Bash
    Steps: Run the same focused catalog sync suite and verify edge-case assertions exist for ownership/archive/removal semantics.
    Expected: The suite passes and demonstrates explicit treatment of destructive or archival paths.
    Evidence: .sisyphus/evidence/task-3-catalog-sync-safety-error.txt
  ```

  **Commit**: YES | Message: `test(purchase): clarify catalog sync safety` | Files: `packages/purchase/src/core/catalog-service.ts`, `packages/purchase/test/catalog-sync.test.ts`, `packages/purchase/README.md`

- [x] 4. Align the Next.js example with the recommended SDK onboarding path

  **What to do**: Make `examples/nextjs` a canonical demonstration of how an external adopter should wire the SDK. Reduce ambiguity in provider/runtime setup, ensure the example uses only the intended public API shape, and make the example reflect the supported sandbox/test-mode story.
  **Must NOT do**: Do not redesign the example application architecture, add unrelated product features, or make the example rely on undocumented internal imports.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: spans example runtime wiring, docs alignment, and consumer DX.
  - Skills: [`effect-v4-best-practices`] - why needed: keep Effect layer composition readable and consistent for adopters.
  - Omitted: [`frontend-design`] - why not needed: visual UI polish is not the target.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [8] | Blocked By: [1, 3]

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `examples/nextjs/purchase.ts:1` - current example runtime/provider wiring.
  - Pattern: `examples/nextjs/services/purchase-domain.ts:1` - example provider/environment selection.
  - Pattern: `packages/purchase/README.md:39` - package quick-start narrative that should match the example.
  - Pattern: `packages/purchase/src/public.ts:1` - preferred stable root entrypoint.
  - Test: `packages/purchase/test/public-api.test.ts:5` - supported import expectations.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Example runtime wiring uses only the intended documented public surface.
  - [ ] Example clearly communicates sandbox/test-mode provider setup and does not require reading internal source to understand the flow.
  - [ ] Example-related code passes repo typecheck and any relevant targeted tests.
  - [ ] README/package docs point to the example as the recommended onboarding path where appropriate.

  **QA Scenarios** (MANDATORY - task incomplete without these):

  ```
  Scenario: Example integration path compiles under repo checks
    Tool: Bash
    Steps: Run `pnpm check`
    Expected: Example wiring compiles with the refined public API and provider setup.
    Evidence: .sisyphus/evidence/task-4-example-onboarding.txt

  Scenario: Example no longer depends on undocumented imports
    Tool: Bash
    Steps: Run focused public API tests and inspect failures if any from example-related imports during typecheck/test execution.
    Expected: No failure indicates the example relies on hidden/internal package entrypoints.
    Evidence: .sisyphus/evidence/task-4-example-onboarding-error.txt
  ```

  **Commit**: YES | Message: `docs(example): align nextjs purchase onboarding` | Files: `examples/nextjs/purchase.ts`, `examples/nextjs/services/purchase-domain.ts`, `packages/purchase/README.md`

- [x] 5. Harden checkout workflow coverage around the public SDK path

  **What to do**: Strengthen the checkout-facing tests so they validate the consumer-facing SDK path, not just internal service behavior. Ensure the supported checkout start flow, metadata persistence, provider refs, and customer-facing redirects remain protected while API/DX cleanup lands.
  **Must NOT do**: Do not add new billing features or broaden checkout semantics. Do not turn this task into a provider-live expansion.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: focused test and narrow implementation adjustments around one workflow path.
  - Skills: [`effect-v4-best-practices`] - why needed: preserve typed workflow requests/results under test.
  - Omitted: [`frontend-design`] - why not needed: no UI work.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [6, 8] | Blocked By: []

  **References** (executor has NO interview context - be exhaustive):
  - Test: `packages/purchase/e2e/checkout-workflow.test.ts:23` - current checkout workflow coverage.
  - Pattern: `packages/purchase/src/sdk.ts:44` - checkout request contract and docs.
  - Support: `packages/purchase/test/support/test-catalog.ts` - test catalog/product wiring.
  - Support: `packages/purchase/test/support/test-payment-provider.ts` - checkout/provider test harness.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Checkout tests cover the intended consumer-facing request/response path after API cleanup.
  - [ ] Metadata, provider session IDs, customer IDs, and persisted intent rows remain explicitly asserted.
  - [ ] `pnpm --filter @effect-x/purchase test e2e/checkout-workflow.test.ts` exits `0`.

  **QA Scenarios** (MANDATORY - task incomplete without these):

  ```
  Scenario: Happy-path checkout remains intact
    Tool: Bash
    Steps: Run `pnpm --filter @effect-x/purchase test e2e/checkout-workflow.test.ts`
    Expected: Test passes and verifies checkout intent persistence, provider refs, redirect URLs, and metadata.
    Evidence: .sisyphus/evidence/task-5-checkout-contract.txt

  Scenario: Checkout contract regression is caught immediately
    Tool: Bash
    Steps: Re-run the focused checkout suite after public API cleanup.
    Expected: Any mismatch in request shape or persisted fields fails the suite clearly; final state is passing.
    Evidence: .sisyphus/evidence/task-5-checkout-contract-error.txt
  ```

  **Commit**: YES | Message: `test(purchase): harden checkout contract` | Files: `packages/purchase/e2e/checkout-workflow.test.ts`, `packages/purchase/src/sdk.ts`, `packages/purchase/test/support/test-payment-provider.ts`

- [x] 6. Harden webhook handling coverage for replay, dedupe, and reconciliation

  **What to do**: Expand or refine webhook workflow tests so replay, duplicate delivery, normalized event persistence, and reconciliation triggers remain contract-critical and explicit. This task protects the most failure-prone operational path while the external SDK shape is being cleaned up.
  **Must NOT do**: Do not add new webhook event categories beyond current provider/runtime support. Do not weaken existing receipt or projection assertions.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: critical correctness path with storage, projection, and provider-normalization implications.
  - Skills: [`effect-v4-best-practices`] - why needed: maintain typed event-flow boundaries and Effect workflow behavior.
  - Omitted: [`eventlog-local-first`] - why not needed: separate eventing domain.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: [8] | Blocked By: [5]

  **References** (executor has NO interview context - be exhaustive):
  - Test: `packages/purchase/e2e/webhook-workflow.test.ts:53` - end-to-end webhook workflow assertions.
  - Test: `packages/purchase/test/provider/webhook-replay.test.ts:1` - replay-specific coverage.
  - Test: `packages/purchase/test/provider-webhook-fixtures.test.ts:1` - provider normalization fixtures.
  - Pattern: `packages/purchase/src/core/workflow-service.ts` - webhook handling implementation path.
  - Oracle guardrail: replay/dedupe/reconciliation are contract-critical for this release.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Duplicate delivery and replay semantics are explicitly tested and pass.
  - [ ] Webhook handling continues to persist receipts, normalized events, projections, and entitlement triggers where expected.
  - [ ] `pnpm --filter @effect-x/purchase test e2e/webhook-workflow.test.ts` exits `0`.

  **QA Scenarios** (MANDATORY - task incomplete without these):

  ```
  Scenario: Happy-path webhook ingestion remains intact
    Tool: Bash
    Steps: Run `pnpm --filter @effect-x/purchase test e2e/webhook-workflow.test.ts`
    Expected: Suite passes and confirms accepted webhook, persisted receipt, normalized events, projections, and reconciliation triggers.
    Evidence: .sisyphus/evidence/task-6-webhook-contract.txt

  Scenario: Replay/duplicate protection remains enforced
    Tool: Bash
    Steps: Run `pnpm --filter @effect-x/purchase test test/provider/webhook-replay.test.ts`
    Expected: Replay-specific suite passes and demonstrates duplicate/replayed event handling is stable.
    Evidence: .sisyphus/evidence/task-6-webhook-contract-error.txt
  ```

  **Commit**: YES | Message: `test(purchase): protect webhook replay semantics` | Files: `packages/purchase/e2e/webhook-workflow.test.ts`, `packages/purchase/test/provider/webhook-replay.test.ts`, `packages/purchase/test/provider-webhook-fixtures.test.ts`, `packages/purchase/src/core/workflow-service.ts`

- [x] 7. Verify sqlite/postgres-facing storage compatibility remains intact during cleanup

  **What to do**: Audit the storage-facing public types and tests touched by the API/DX cleanup to ensure sqlite/postgres compatibility promises are not accidentally weakened. If coverage is incomplete, add targeted tests or type-level assertions around storage adapter bindings and DB-backed workflow assumptions.
  **Must NOT do**: Do not redesign the DB abstraction or introduce a migration framework. Do not add a new database backend.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: public storage contract verification with type/runtime implications.
  - Skills: [`effect-v4-best-practices`] - why needed: maintain strong typed storage adapter contracts.
  - Omitted: [`frontend-design`] - why not needed: backend/type-level verification only.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: [8] | Blocked By: [3]

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `packages/purchase/src/db.ts:13` - storage model/binding public contract.
  - Pattern: `packages/purchase/src/tables.ts` - storage tables backing the runtime.
  - Test: `packages/purchase/test/cloudflare-d1-http-client.test.ts:1` - existing DB-adjacent coverage.
  - Support: `packages/purchase/test/support/sqlite-pay-harness.ts` - current sqlite verification harness.
  - Package deps: `packages/purchase/package.json:68` - current pg/sqlite-related dependency footprint.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Public storage adapter types still compile cleanly after API cleanup.
  - [ ] Existing DB-backed tests continue to pass; any added coverage explicitly protects compatibility-sensitive contracts.
  - [ ] `pnpm check` exits `0` and no storage-contract regressions remain.

  **QA Scenarios** (MANDATORY - task incomplete without these):

  ```
  Scenario: Storage adapter contract still compiles across supported DB integrations
    Tool: Bash
    Steps: Run `pnpm check`
    Expected: Typecheck passes with no regressions in storage model bindings or DB-facing APIs.
    Evidence: .sisyphus/evidence/task-7-db-parity.txt

  Scenario: Existing DB-backed harness behavior remains stable
    Tool: Bash
    Steps: Run targeted purchase tests that use the sqlite harness, including `pnpm --filter @effect-x/purchase test e2e/checkout-workflow.test.ts`
    Expected: DB-backed workflow tests pass and show no compatibility drift introduced by the cleanup.
    Evidence: .sisyphus/evidence/task-7-db-parity-error.txt
  ```

  **Commit**: YES | Message: `test(purchase): preserve storage adapter compatibility` | Files: `packages/purchase/src/db.ts`, `packages/purchase/test/cloudflare-d1-http-client.test.ts`, `packages/purchase/test/support/sqlite-pay-harness.ts`, any added compatibility-focused test files

- [x] 8. Finalize documentation and verification alignment for open-source adoption

  **What to do**: Perform the final pass that aligns README/package docs, example references, public API wording, and test commands with the refined implementation. Ensure the repository tells one coherent story: what to import, how to define products, how to wire a provider, how to run the example path, and which tests prove correctness.
  **Must NOT do**: Do not add marketing-only content disconnected from actual behavior. Do not document unsupported imports, providers, or flows.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: documentation and consumer guidance need precision more than large code movement.
  - Skills: [] - why needed: none; repository-local references are sufficient.
  - Omitted: [`frontend-design`] - why not needed: no visual work.

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: [Final Verification Wave] | Blocked By: [1, 2, 4, 5, 6, 7]

  **References** (executor has NO interview context - be exhaustive):
  - Doc: `packages/purchase/README.md:1` - package-level consumer documentation.
  - Pattern: `examples/nextjs/purchase.ts:1` - recommended runtime setup example.
  - Test: `packages/purchase/test/public-api.test.ts:1` - supported import contract.
  - Test: `packages/purchase/test/catalog-sync.test.ts:1` - sync behavior assertions.
  - Test: `packages/purchase/e2e/checkout-workflow.test.ts:1` - checkout verification anchor.
  - Test: `packages/purchase/e2e/webhook-workflow.test.ts:1` - webhook verification anchor.

  **Acceptance Criteria** (agent-executable only):
  - [ ] README, example, and public API tests all describe the same supported onboarding path.
  - [ ] All verification commands listed in the docs/plan are runnable in the repository.
  - [ ] `pnpm lint-fix` completes successfully.
  - [ ] `pnpm check` exits `0`.

  **QA Scenarios** (MANDATORY - task incomplete without these):

  ```
  Scenario: Final documented verification path is executable
    Tool: Bash
    Steps: Run `pnpm lint-fix && pnpm check`
    Expected: Lint/typecheck pass with docs/example/public API aligned to implementation.
    Evidence: .sisyphus/evidence/task-8-docs-alignment.txt

  Scenario: Final focused workflow suites still pass after docs/API/example cleanup
    Tool: Bash
    Steps: Run `pnpm --filter @effect-x/purchase test public-api.test.ts && pnpm --filter @effect-x/purchase test catalog-sync.test.ts && pnpm --filter @effect-x/purchase test e2e/checkout-workflow.test.ts && pnpm --filter @effect-x/purchase test e2e/webhook-workflow.test.ts`
    Expected: All focused suites pass; any lingering mismatch between docs, API, or behavior is caught before review wave.
    Evidence: .sisyphus/evidence/task-8-docs-alignment-error.txt
  ```

  **Commit**: YES | Message: `docs(purchase): align onboarding and verification` | Files: `packages/purchase/README.md`, `examples/nextjs/**`, `packages/purchase/test/public-api.test.ts`, plan-relevant docs/comments touched during refinement

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.

- [x] F1. Plan Compliance Audit — oracle
- [x] F2. Code Quality Review — unspecified-high
- [x] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [x] F4. Scope Fidelity Check — deep

## Commit Strategy

- Prefer 3-5 focused commits aligned to wave boundaries.
- Preserve backwards compatibility where possible; if a public rename is required, include alias coverage and migration note in the same commit.
- Suggested commit sequence:
  - `refactor(purchase): tighten public sdk surface`
  - `docs(example): align nextjs purchase onboarding`
  - `test(purchase): harden public contract and workflow coverage`

## Success Criteria

- A new consumer can identify the recommended import path and runtime setup without reading internal source files.
- The example app demonstrates the intended SDK setup path and matches documented usage.
- Public API tests clearly distinguish supported root imports from optional subpaths.
- Checkout, webhook, and catalog sync behavior are protected by executable tests.
- The package remains compatible with current storage abstractions and passes repo-level checks.
