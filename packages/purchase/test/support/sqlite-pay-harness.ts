import * as SQLite from "@effect/sql-sqlite-node"
import * as SqlClient from "@effect/sql/SqlClient"
import * as Effect from "effect/Effect"
import * as String from "effect/String"

export const SqlitePayHarnessLive = SQLite.SqliteClient.layer({
  filename: ":memory:",
  disableWAL: true,
  transformQueryNames: String.camelToSnake,
  transformResultNames: String.snakeToCamel
})

export const payTableDdl = [
  `CREATE TABLE IF NOT EXISTS paykit_customer (
    id TEXT PRIMARY KEY,
    email TEXT,
    name TEXT,
    metadata TEXT,
    provider TEXT NOT NULL DEFAULT '{}',
    deleted_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS paykit_checkout_intent (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    offer_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_checkout_session_id TEXT NOT NULL,
    checkout_url TEXT,
    status TEXT NOT NULL,
    metadata TEXT NOT NULL DEFAULT '{}',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS paykit_commercial_event (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    provider_event_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    customer_id TEXT,
    offer_id TEXT,
    agreement_id TEXT,
    payload TEXT NOT NULL DEFAULT '{}',
    occurred_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS paykit_credit_ledger (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    offer_id TEXT,
    amount INTEGER NOT NULL,
    direction TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    source_event_id TEXT,
    reason TEXT,
    created_at DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS paykit_product (
    internal_id TEXT PRIMARY KEY,
    id TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    "group" TEXT NOT NULL DEFAULT '',
    is_default INTEGER NOT NULL DEFAULT 0,
    price_amount INTEGER,
    price_interval TEXT,
    hash TEXT,
    provider TEXT NOT NULL DEFAULT '{}',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS paykit_provider_ref (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    owner_type TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS paykit_subscription (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    product_internal_id TEXT NOT NULL,
    provider_id TEXT,
    provider_data TEXT,
    status TEXT NOT NULL,
    canceled INTEGER NOT NULL DEFAULT 0,
    cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
    started_at DATETIME,
    trial_ends_at DATETIME,
    current_period_start_at DATETIME,
    current_period_end_at DATETIME,
    canceled_at DATETIME,
    ended_at DATETIME,
    scheduled_product_id TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS paykit_invoice (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    subscription_id TEXT,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL,
    description TEXT,
    hosted_url TEXT,
    provider_id TEXT NOT NULL,
    provider_data TEXT NOT NULL DEFAULT '{}',
    period_start_at DATETIME,
    period_end_at DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS paykit_entitlement (
    id TEXT PRIMARY KEY,
    subscription_id TEXT,
    customer_id TEXT NOT NULL,
    feature_id TEXT NOT NULL,
    "limit" INTEGER,
    balance INTEGER,
    next_reset_at DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS paykit_feature (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS paykit_metadata (
    id TEXT PRIMARY KEY,
    provider_id TEXT NOT NULL,
    type TEXT NOT NULL,
    data TEXT NOT NULL DEFAULT '{}',
    provider_checkout_session_id TEXT,
    expires_at DATETIME,
    created_at DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS paykit_webhook_event (
    id TEXT PRIMARY KEY,
    provider_id TEXT NOT NULL,
    provider_event_id TEXT NOT NULL,
    type TEXT NOT NULL,
    payload TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL,
    error TEXT,
    trace_id TEXT,
    received_at DATETIME NOT NULL,
    processed_at DATETIME
  )`
] as const

export const payTables = [
  "paykit_checkout_intent",
  "paykit_commercial_event",
  "paykit_credit_ledger",
  "paykit_customer",
  "paykit_entitlement",
  "paykit_feature",
  "paykit_invoice",
  "paykit_metadata",
  "paykit_product",
  "paykit_provider_ref",
  "paykit_subscription",
  "paykit_webhook_event"
] as const

export const setupPayTables = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient

  yield* Effect.forEach(payTableDdl, (statement) => sql.unsafe(statement).withoutTransform, {
    concurrency: 1,
    discard: true
  })
  yield* Effect.forEach([...payTables].reverse(), (table) => sql.unsafe(`DELETE FROM ${table}`).withoutTransform, {
    concurrency: 1,
    discard: true
  })
})

export const insertTestCustomer = (input: {
  readonly id?: string | undefined
  readonly email?: string | undefined
  readonly name?: string | undefined
}) =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient
    const now = new Date("2025-01-01T00:00:00.000Z").toISOString()

    yield* sql.unsafe(
      `INSERT INTO paykit_customer (id, email, name, metadata, provider, created_at, updated_at)
         VALUES (?, ?, ?, '{}', '{}', ?, ?)`,
      [input.id ?? "customer_123", input.email ?? "jane@example.com", input.name ?? "Jane Doe", now, now]
    ).withoutTransform
  })

export const queryAll = <A = Record<string, unknown>>(statement: string, params: ReadonlyArray<unknown> = []) =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient
    const rows = yield* sql.unsafe(statement, [...params]).withoutTransform
    return rows as ReadonlyArray<A>
  })

export const queryOne = <A = Record<string, unknown>>(statement: string, params: ReadonlyArray<unknown> = []) =>
  queryAll<A>(statement, params).pipe(Effect.map((rows) => rows[0]))

export const countRows = (table: (typeof payTables)[number]) =>
  queryOne<{ readonly count: number }>(`SELECT COUNT(*) AS count FROM ${table}`).pipe(
    Effect.map((row) => Number(row?.count ?? 0))
  )

export const countCoreRows = Effect.forEach(payTables, (table) =>
  countRows(table).pipe(Effect.map((count) => [table, count] as const))
).pipe(Effect.map((entries) => Object.fromEntries(entries) as Record<(typeof payTables)[number], number>))

export const parseJsonColumn = (value: unknown): Record<string, unknown> => {
  if (typeof value !== "string") {
    return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
  }

  return JSON.parse(value) as Record<string, unknown>
}
