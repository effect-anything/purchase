import {
  Cookies,
  Headers,
  HttpApiClient,
  HttpBody,
  HttpClient,
  HttpClientResponse,
  HttpClientRequest,
  HttpLayerRouter
} from "@effect/platform"
import { env } from "cloudflare:workers"
import { Effect, Layer, Ref, Stream } from "effect"

import { Live } from "../context.ts"
import { CloudflareBindings } from "../lib/cloudflare/bindings.ts"
import { CloudflareExecutionContext } from "../lib/cloudflare/execution-context.ts"
import { AllRoutes } from "../router.ts"
import { AppApi } from "../services/api/http-api.ts"

const demoSchemaSql = `
CREATE TABLE IF NOT EXISTS paykit_customer (
  id TEXT PRIMARY KEY,
  email TEXT,
  name TEXT,
  metadata TEXT,
  provider TEXT NOT NULL DEFAULT '{}',
  deleted_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS paykit_checkout_intent (
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
);

CREATE TABLE IF NOT EXISTS paykit_commercial_event (
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
);

CREATE TABLE IF NOT EXISTS paykit_credit_ledger (
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
);

CREATE TABLE IF NOT EXISTS paykit_product (
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
);

CREATE TABLE IF NOT EXISTS paykit_provider_ref (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  owner_type TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS paykit_subscription (
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
);

CREATE TABLE IF NOT EXISTS paykit_invoice (
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
);

CREATE TABLE IF NOT EXISTS paykit_entitlement (
  id TEXT PRIMARY KEY,
  subscription_id TEXT,
  customer_id TEXT NOT NULL,
  feature_id TEXT NOT NULL,
  "limit" INTEGER,
  balance INTEGER,
  next_reset_at DATETIME,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS paykit_feature (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS paykit_metadata (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL,
  type TEXT NOT NULL,
  data TEXT NOT NULL DEFAULT '{}',
  provider_checkout_session_id TEXT,
  expires_at DATETIME,
  created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS paykit_webhook_event (
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
);
`

const authSchemaSql = `
CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  workspace_slug TEXT NOT NULL DEFAULT 'starter-workspace',
  credits_used INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY,
  expires_at DATETIME NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  id_token TEXT,
  access_token_expires_at DATETIME,
  refresh_token_expires_at DATETIME,
  scope TEXT,
  password TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`

const testExecutionContext = {
  waitUntil: (_promise: Promise<any>) => {},
  passThroughOnException: () => {}
} as const

const workerEnv = env as typeof env & { DB: D1Database }

const HttpApiLive = AllRoutes.pipe(
  Layer.provideMerge(Live),
  Layer.provideMerge(CloudflareBindings.fromEnv(env)),
  Layer.provideMerge(CloudflareExecutionContext.fromContext(testExecutionContext, env))
)

let migrationsApplied = false
let runtimesInitialized = false

const ensureTestSchema = Effect.sync(async () => {
  if (migrationsApplied) {
    return
  }

  for (const statement of `${demoSchemaSql}\n${authSchemaSql}`
    .split(";")
    .map((value) => value.trim())
    .filter(Boolean)) {
    await workerEnv.DB.prepare(`${statement};`).run()
  }
  migrationsApplied = true
}).pipe(Effect.flatMap((promise) => Effect.promise(() => promise)))

export class ApiClient extends Effect.Service<ApiClient>()("ApiClient", {
  effect: HttpApiClient.make(AppApi)
}) {}

export class TestHttpClient extends Effect.Service<TestHttpClient>()("TestHttpClient", {
  effect: HttpClient.HttpClient
}) {}

const requestBody = (body: HttpBody.HttpBody): Effect.Effect<BodyInit | undefined> => {
  switch (body._tag) {
    case "Empty":
      return Effect.succeed(undefined)
    case "Raw":
      return Effect.succeed(body.body as BodyInit)
    case "Uint8Array":
      return Effect.succeed(body.body as any)
    case "FormData":
      return Effect.succeed(body.formData)
    case "Stream":
      return (body.stream as Stream.Stream<Uint8Array<ArrayBufferLike>, never, never>).pipe(
        Stream.runCollect,
        Effect.map((chunks) => new Blob(chunks as any))
      )
  }
}

const makeRequest = (request: HttpClientRequest.HttpClientRequest) =>
  Effect.map(requestBody(request.body), (body) => {
    const headers = new globalThis.Headers(Object.entries(request.headers))

    if (request.body.contentType && !Headers.has(request.headers, "content-type")) {
      headers.set("content-type", request.body.contentType)
    }

    if (request.body.contentLength && !Headers.has(request.headers, "content-length")) {
      headers.set("content-length", String(request.body.contentLength))
    }

    return new Request(new URL(request.url, "http://effect.test"), {
      body: body ?? null,
      headers,
      method: request.method
    })
  })

const InMemoryHttpClient = Layer.unwrapScoped(
  Effect.gen(function* () {
    const handler = HttpLayerRouter.toWebHandler(HttpApiLive as any)

    yield* Effect.addFinalizer(() => Effect.promise(() => handler.dispose()))

    const ref = yield* Ref.make(Cookies.empty)

    return Layer.succeed(
      HttpClient.HttpClient,
      HttpClient.make((request) =>
        Effect.gen(function* () {
          const webRequest = yield* makeRequest(request)
          const response = yield* Effect.promise(() => handler.handler(webRequest))

          return HttpClientResponse.fromWeb(request, response)
        })
      ).pipe(
        HttpClient.mapRequest((request) => request.pipe(HttpClientRequest.prependUrl("http://effect.test"))),
        HttpClient.withCookiesRef(ref)
      )
    )
  })
)

export const HttpApiTesting = Layer.mergeAll(ApiClient.Default, TestHttpClient.Default).pipe(
  Layer.tap(() => ensureTestSchema),
  Layer.provide(InMemoryHttpClient),
  Layer.orDie
)

const convertSetCookieToCookie = (headers: globalThis.Headers): string | null => {
  const values = headers.get("set-cookie")
  if (!values) {
    return null
  }

  return values
    .split(/,(?=\s*[^;=]+=[^;]+)/)
    .map((value) => value.split(";")[0]?.trim())
    .filter((value): value is string => Boolean(value))
    .join("; ")
}

export const signUpTestUser = (input?: {
  readonly email?: string
  readonly password?: string
  readonly name?: string
}) =>
  Effect.gen(function* () {
    const client = yield* TestHttpClient
    const response = yield* client.post("/api/auth/sign-up/email", {
      body: HttpBody.unsafeJson({
        email: input?.email ?? `demo-${crypto.randomUUID()}@example.com`,
        password: input?.password ?? "password123456",
        name: input?.name ?? "Demo User",
        callbackURL: "/workspace"
      }),
      headers: {
        "content-type": "application/json"
      }
    })

    if (response.status >= 400) {
      return yield* Effect.fail(new Error(`sign-up failed with status ${response.status}`))
    }

    const cookie = convertSetCookieToCookie(new globalThis.Headers(response.headers))
    if (!cookie) {
      return yield* Effect.fail(new Error("missing auth cookie after sign-up"))
    }

    return cookie
  })

export const ensureServerRuntime = Effect.sync(async () => {
  if (runtimesInitialized) {
    return
  }

  const { make } = await import("../runtime.ts")
  make()
  runtimesInitialized = true
}).pipe(Effect.flatMap((promise) => Effect.promise(() => promise)))
