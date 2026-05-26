# Provider Contract Test Instructions

This directory is for provider boundary tests that do not call live third-party services.

The purpose is to lock adapter contracts, webhook normalization, signature handling, fixture replay, unsupported capability behavior, and provider-specific anti-corruption logic.

## Scope

- Use recorded provider fixtures, generated fixtures, replay harnesses, provider simulators, and fake provider clients.
- Do not call real Stripe or Paddle APIs from this directory.
- Do not open real hosted checkout pages.
- Do not configure real provider dashboards or webhook endpoints.

## Method

- Keep provider-specific details at the boundary.
- Normalize provider payloads into SDK commercial facts before asserting app-facing behavior.
- Assert both accepted and rejected paths for signatures, unsupported operations, malformed payloads, duplicate delivery, and replay.
- When using fixtures, make clear which provider event family and SDK contract the fixture protects.

## Required Assertions

- Provider payload or capability maps to the expected normalized event, error, or workflow conflict.
- Replay and duplicate handling are idempotent.
- Provider-specific IDs remain refs and do not become public commercial IDs.

## Boundary With E2E

These tests prove that known provider payloads and capability branches are handled correctly.

They do not prove that the current provider sandbox, hosted checkout UI, webhook dashboard configuration, or live provider polling still works. That belongs in `packages/purchase/e2e`.
