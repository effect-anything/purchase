# Non-E2E Test Instructions

This directory contains non-e2e tests for `@effect-x/purchase`.

`scenario` under this tree is only a directory naming convention. It still belongs to the non-e2e test layer.

The purpose of these tests is to make payment semantics fast, deterministic, and diagnosable before a scenario is promoted to real third-party e2e.

## Scope

- Use this tree for unit tests, provider contract tests, fixture replay tests, and local SDK scenario tests.
- Do not require real Stripe or Paddle credentials here.
- Do not open hosted checkout pages, browser payment flows, Cloudflare tunnels, or real provider webhooks here.
- Real third-party integration belongs in `packages/purchase/e2e`.

## Allowed Test Doubles

- Fake `PaymentProvider` implementations are allowed when the test is validating SDK workflow semantics.
- Provider simulators are allowed when validating local provider contract assumptions.
- Recorded fixtures and replay are allowed only when the test states which provider payload contract is being locked.
- Database harnesses such as the SQLite pay harness are allowed for durable-state assertions.

## Required Assertions

Prefer business invariants over implementation details.

When a test covers a workflow rather than a small pure function, include the relevant assertion layers:

- Provider-facing fact: fake provider call, fixture payload, replay result, or provider capability branch.
- Durable local fact: `SqlClient` rows such as checkout intent, webhook receipt, commercial event, subscription, invoice, credit ledger, provider ref, or entitlement.
- Public read model: SDK output such as customer snapshot, entitlements, wallet, receipt, or workflow conflict.

## Boundary With E2E

Do not make these tests prove that real hosted checkout, real provider dashboard configuration, public webhook routing, or live provider polling works. Those are e2e responsibilities.

These tests should prove that once a provider fact enters the SDK boundary, the SDK handles it correctly, idempotently, and with clear business semantics.

## Commands

- Run focused tests with `pnpm test <test_file.ts>`.
- Run type checking with `pnpm check`.
- Run formatting after edits with `pnpm lint-fix`.
