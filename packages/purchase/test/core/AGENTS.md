# Core Unit Test Instructions

This directory is for fast unit-level tests of stable SDK internals.

The purpose is to lock pure domain rules, schemas, catalog normalization, projection calculations, state-store mapping, and small workflow boundaries without involving real providers or browser flows.

## Scope

- Keep tests deterministic and local.
- Prefer pure inputs and explicit expected outputs.
- Use minimal database setup only when the unit under test is a store or projection boundary.
- Do not depend on real provider credentials, network access, Playwright, webhook tunnels, or real time.

## Method

- Test the smallest meaningful domain unit first.
- Assert commercial language: `customerId`, `productId`, `offerId`, `agreementId`, `snapshot`, `entitlements`, and `wallet`.
- Avoid asserting raw provider payload details unless the core schema itself is the subject.
- Prefer explicit rows and fixtures over hidden setup helpers when that makes the invariant clearer.

## Restrictions

- Do not move live provider behavior into `test/core`.
- Do not add broad scenario orchestration here.
- Do not use provider simulators for pure core behavior unless the test is explicitly about provider-neutral normalization.
- Do not weaken assertions to make a local state mismatch pass; update the domain rule or move the test to the right layer.

## Expected Value

A failing core test should answer: which business rule, schema shape, projection rule, idempotency rule, or storage mapping broke?
