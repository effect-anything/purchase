/**
 * Stable public package surface for application consumers.
 *
 * Prefer the root package import for application SDK wiring, catalog DSL,
 * provider selection, provider layers, public schemas, and storage override
 * types. `PurchaseSDK`/`PurchaseProvider` are the explicit runtime wiring names
 * exported from the root entrypoint; `BaseSDK`/`PayProvider` remain as
 * compatibility aliases.
 * Narrow subpaths remain available only where they are documented in README
 * and covered by `test/public-api.test.ts`.
 */
export * from "./db.ts"
export * from "./dsl.ts"
export * from "./errors.ts"
export * from "./provider.ts"
export * from "./schema.ts"
export * from "./sdk.ts"
