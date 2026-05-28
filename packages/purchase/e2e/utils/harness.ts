/** @effect-diagnostics preferSchemaOverJson:off */
import { PaymentHarness } from "@effect-x/purchase/harness"
import * as SqlClient from "@effect/sql/SqlClient"
import * as Data from "effect/Data"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Schedule from "effect/Schedule"

import { TestConfig } from "../http-api/config.ts"

export class PublicPaddleScenarioError extends Data.TaggedError("PublicPaddleScenarioError")<{
  readonly message: string
  readonly cause?: unknown
}> {}

export interface PublicAuthSession {
  readonly email: string
  readonly password: string
  readonly cookie: string
}

export interface CustomerAccount {
  readonly session: PublicAuthSession
  readonly account: AccountOverview
}

interface SignUpInput {
  readonly email?: string | undefined
  readonly password?: string | undefined
  readonly name?: string | undefined
}

export interface CheckoutStartResult {
  readonly offerId: string
  readonly intentId: string
  readonly sessionId: string
  readonly mode: "bootstrap-redirect" | "inline-sdk" | "redirect"
  readonly url: string | null
}

export interface CheckoutAttemptResult {
  readonly session: PublicAuthSession
  readonly checkout: CheckoutStartResult
  readonly account: AccountOverview
}

interface SubscriptionPurchaseInput {
  readonly session: PublicAuthSession
  readonly offerId: string
  readonly email?: string | undefined
}

export interface SubscriptionPurchaseResult {
  readonly session: PublicAuthSession
  readonly checkout: CheckoutStartResult
  readonly transaction: {
    readonly id: string
    readonly status: string
  }
  readonly account: AccountOverview
  readonly durable: DurableCommercialState
}

export interface AccountOverview {
  readonly user?: {
    readonly id?: string
    readonly email?: string
    readonly name?: string
  }
  readonly snapshot?: {
    readonly activeOfferIds?: ReadonlyArray<string>
    readonly subscriptions?: ReadonlyArray<{
      readonly id?: string
      readonly status?: string
      readonly offerId?: string
    }>
    readonly purchases?: ReadonlyArray<{
      readonly id?: string
      readonly status?: string
      readonly offerId?: string
    }>
    readonly wallets?: ReadonlyArray<{
      readonly id?: string
      readonly productId?: string
      readonly available?: number
      readonly acquired?: number
      readonly consumed?: number
      readonly refunded?: number
    }>
  }
  readonly entitlements?: {
    readonly benefits?: ReadonlyArray<{
      readonly key?: string
      readonly type?: string
      readonly enabled?: boolean
      readonly limit?: number
    }>
  }
  readonly activity?: {
    readonly checkoutIntents?: ReadonlyArray<{
      readonly id: string
      readonly offerId: string
      readonly status: string
      readonly updatedAt: string
    }>
    readonly events?: ReadonlyArray<{
      readonly id: string
      readonly provider: string
      readonly kind: string
      readonly offerId: string | null
      readonly occurredAt: string
    }>
    readonly creditLedger?: ReadonlyArray<{
      readonly id: string
      readonly productId: string
      readonly amount: number
      readonly direction: string
      readonly reason: string | null
      readonly createdAt: string
    }>
  }
}

export interface CatalogOverview {
  readonly provider: "paddle" | "stripe"
  readonly environment: string
  readonly catalog: {
    readonly products?: ReadonlyArray<{
      readonly id?: string
      readonly name?: string
      readonly offerIds?: ReadonlyArray<string>
    }>
    readonly offers?: ReadonlyArray<{
      readonly id?: string
      readonly productId?: string
      readonly type?: string
      readonly benefits?: ReadonlyArray<{
        readonly key?: string
        readonly type?: string
        readonly limit?: number
        readonly amount?: number
      }>
    }>
  }
}

export interface CreditWalletOverview {
  readonly available: number
  readonly acquired: number
  readonly consumed: number
}

export interface DurableCommercialState {
  readonly checkoutIntents: ReadonlyArray<{
    readonly id: string
    readonly customerId: string
    readonly offerId: string
    readonly provider: string
    readonly providerCheckoutSessionId: string
    readonly status: string
    readonly updatedAt: string
  }>
  readonly webhookReceipts: ReadonlyArray<{
    readonly id: string
    readonly providerId: string
    readonly providerEventId: string
    readonly type: string
    readonly status: string
    readonly receivedAt: string
    readonly processedAt: string | null
  }>
  readonly commercialEvents: ReadonlyArray<{
    readonly id: string
    readonly provider: string
    readonly providerEventId: string
    readonly kind: string
    readonly customerId: string | null
    readonly offerId: string | null
    readonly agreementId: string | null
    readonly occurredAt: string
  }>
  readonly subscriptions: ReadonlyArray<{
    readonly id: string
    readonly customerId: string
    readonly productInternalId: string
    readonly providerId: string | null
    readonly status: string
    readonly cancelAtPeriodEnd: number
    readonly currentPeriodEndAt: string | null
    readonly updatedAt: string
  }>
  readonly invoices: ReadonlyArray<{
    readonly id: string
    readonly customerId: string
    readonly subscriptionId: string | null
    readonly type: string
    readonly status: string
    readonly amount: number
    readonly currency: string
    readonly providerId: string
    readonly updatedAt: string
  }>
  readonly entitlements: ReadonlyArray<{
    readonly id: string
    readonly subscriptionId: string | null
    readonly customerId: string
    readonly featureId: string
    readonly limit: number | null
    readonly balance: number | null
    readonly updatedAt: string
  }>
  readonly providerRefs: ReadonlyArray<{
    readonly id: string
    readonly provider: string
    readonly ownerType: string
    readonly ownerId: string
    readonly providerId: string
    readonly kind: string
    readonly updatedAt: string
  }>
  readonly creditLedger: ReadonlyArray<{
    readonly id: string
    readonly customerId: string
    readonly productId: string
    readonly offerId: string | null
    readonly amount: number
    readonly direction: string
    readonly idempotencyKey: string
    readonly reason: string | null
    readonly createdAt: string
  }>
}

interface WebhookTargetRegistration {
  readonly ok: boolean
  readonly provider: "paddle" | "stripe"
  readonly runId: string
  readonly localBaseURL: string
  readonly publicBaseURL: string
  readonly brokerWebhookUrl: string
  readonly targetUrl: string
  readonly webhookSecret?: string | undefined
}

const withHeaders = (baseUrl: string, headers: HeadersInit = {}) => ({
  ...headers,
  origin: baseUrl
})

const parseCookie = (headers: Headers) =>
  (headers.get("set-cookie") ?? "")
    .split(/,(?=\s*[^;=]+=)/)
    .map((value) => value.split(";")[0]?.trim())
    .filter((value): value is string => Boolean(value))
    .join("; ")

const fetchText = (input: RequestInfo | URL, init?: RequestInit) =>
  Effect.tryPromise({
    try: () => fetch(input, init).then(async (response) => ({ response, text: await response.text() })),
    catch: (cause) => new PublicPaddleScenarioError({ message: "HTTP request failed", cause })
  }).pipe(Effect.retry(Schedule.exponential(Duration.millis(500)).pipe(Schedule.compose(Schedule.recurs(4)))))

const fetchJson = <A = unknown>(input: RequestInfo | URL, init?: RequestInit) =>
  fetchText(input, init).pipe(
    Effect.flatMap(({ response, text }) => {
      const json = text ? (JSON.parse(text) as A) : ({} as A)
      return response.ok
        ? Effect.succeed({ response, json })
        : Effect.fail(new PublicPaddleScenarioError({ message: `HTTP ${response.status}: ${text}` }))
    }),
    Effect.mapError((cause) =>
      cause instanceof PublicPaddleScenarioError
        ? cause
        : new PublicPaddleScenarioError({ message: "Failed to parse JSON response", cause })
    )
  )

export const signUp = Effect.fn(function* (input?: SignUpInput | undefined) {
  const { baseURL } = yield* TestConfig
  const email = input?.email ?? `e2e-${Date.now()}@example.com`
  const password = input?.password ?? "password123456"
  const name = input?.name ?? "Purchase SDK E2E User"

  return yield* fetchText(`${baseURL}/api/auth/sign-up/email`, {
    method: "POST",
    headers: withHeaders(baseURL, { "content-type": "application/json" }),
    body: JSON.stringify({
      email,
      password,
      name,
      callbackURL: "/account"
    }),
    redirect: "manual"
  }).pipe(
    Effect.flatMap(({ response, text }) => {
      if (!response.ok) {
        return Effect.fail(
          new PublicPaddleScenarioError({ message: `Sign-up failed with ${response.status}: ${text}` })
        )
      }
      const cookie = parseCookie(response.headers)
      if (!cookie) {
        return Effect.fail(new PublicPaddleScenarioError({ message: "Sign-up did not return an auth cookie" }))
      }
      return Effect.succeed({ email, password, cookie } satisfies PublicAuthSession)
    })
  )
})

export const createCustomerAccount = signUp

export const getAccount = Effect.fn(function* (session: PublicAuthSession) {
  const { baseURL } = yield* TestConfig

  return yield* fetchJson<AccountOverview>(`${baseURL}/api/me/account`, {
    headers: withHeaders(baseURL, { cookie: session.cookie })
  }).pipe(Effect.map(({ json }) => json))
})

export const viewAccount = getAccount

export const openFreshCustomerAccount = Effect.fn(function* (input?: SignUpInput | undefined) {
  const session = yield* createCustomerAccount(input)
  const account = yield* viewAccount(session)

  return { session, account } satisfies CustomerAccount
})

export const getCatalog = Effect.fn(function* () {
  const { baseURL } = yield* TestConfig

  return yield* fetchJson<CatalogOverview>(`${baseURL}/api/catalog`).pipe(Effect.map(({ json }) => json))
})

export const viewCatalog = getCatalog

export const waitForAccount = Effect.fn(function* (input: {
  readonly session: PublicAuthSession
  readonly until: (account: AccountOverview) => boolean
  readonly timeoutMessage: string
}) {
  return yield* getAccount(input.session).pipe(
    Effect.flatMap((account) =>
      input.until(account)
        ? Effect.succeed(account)
        : Effect.fail(new PublicPaddleScenarioError({ message: input.timeoutMessage }))
    ),
    Effect.retry(Schedule.exponential(Duration.seconds(1)).pipe(Schedule.compose(Schedule.recurs(45))))
  )
})

export const waitForActiveSubscription = Effect.fn(function* (input: {
  readonly session: PublicAuthSession
  readonly offerId: string
}) {
  return yield* waitForAccount({
    session: input.session,
    timeoutMessage: `Account did not expose an active subscription for offer "${input.offerId}"`,
    until: (account) =>
      Boolean(
        account.snapshot?.activeOfferIds?.includes(input.offerId) &&
        account.snapshot.subscriptions?.some(
          (subscription) => subscription.offerId === input.offerId && subscription.status === "active"
        )
      )
  })
})

export const checkout = Effect.fn(function* (input: { readonly session: PublicAuthSession; readonly offerId: string }) {
  const { baseURL } = yield* TestConfig
  const runId = yield* currentRunId

  return yield* fetchJson<{ readonly checkout: CheckoutStartResult }>(`${baseURL}/api/checkout/start`, {
    method: "POST",
    headers: withHeaders(baseURL, { "content-type": "application/json", cookie: input.session.cookie }),
    body: JSON.stringify({ offerId: input.offerId, runId })
  }).pipe(Effect.map(({ json }) => json.checkout))
})

export const startSubscriptionCheckout = checkout
export const startOneTimePurchaseCheckout = checkout
export const startCreditPackCheckout = checkout

export const startSubscriptionSignupCheckout = Effect.fn(function* (input: { readonly offerId: string }) {
  const session = yield* createCustomerAccount()

  yield* Effect.logTrace("session", session)

  const checkoutResult = yield* startSubscriptionCheckout({
    session,
    offerId: input.offerId
  })

  yield* Effect.logTrace("checkout", checkoutResult)

  const account = yield* viewAccount(session)

  return {
    session,
    checkout: checkoutResult,
    account
  } satisfies CheckoutAttemptResult
})

export const tryStartCheckout = Effect.fn(function* (input: {
  readonly session: PublicAuthSession
  readonly offerId: string
}) {
  return yield* Effect.either(checkout(input))
})

export const purchaseSubscription = Effect.fn(function* (input: SubscriptionPurchaseInput) {
  const paymentHarness = yield* PaymentHarness

  const checkoutResult = yield* checkout({ session: input.session, offerId: input.offerId })

  if (!checkoutResult.url) {
    return yield* Effect.die(
      new Error(
        `purchaseSubscription requires a checkout URL but provider returned mode="${checkoutResult.mode}" without one`
      )
    )
  }

  const payment = yield* paymentHarness.payCheckout({
    checkout: {
      provider: "paddle",
      sessionId: checkoutResult.sessionId,
      url: checkoutResult.url
    },
    checkoutUrl: checkoutResult.url,
    mode: "subscription",
    customer: {
      email: input.session.email,
      name: "Purchase SDK E2E User"
    }
  })
  const accountOverview = yield* waitForActiveSubscription({
    session: input.session,
    offerId: input.offerId
  })
  const durable = yield* getDurableState(input.session)

  return {
    session: input.session,
    checkout: checkoutResult,
    transaction: payment.transaction,
    account: accountOverview,
    durable
  } satisfies SubscriptionPurchaseResult
})

export const buySubscription = purchaseSubscription

export const consumeCredits = Effect.fn(function* (input: {
  readonly session: PublicAuthSession
  readonly amount: number
  readonly reason?: string | undefined
}) {
  const { baseURL } = yield* TestConfig

  return yield* fetchJson<{ readonly wallet: CreditWalletOverview }>(`${baseURL}/api/me/credits/consume`, {
    method: "POST",
    headers: withHeaders(baseURL, { "content-type": "application/json", cookie: input.session.cookie }),
    body: JSON.stringify({
      amount: input.amount,
      reason: input.reason
    })
  }).pipe(Effect.map(({ json }) => json.wallet))
})

export const tryConsumeCredits = Effect.fn(function* (input: {
  readonly session: PublicAuthSession
  readonly amount: number
  readonly reason?: string | undefined
}) {
  return yield* Effect.either(consumeCredits(input))
})

export const getDurableState = Effect.fn(function* (session: PublicAuthSession) {
  const account = yield* getAccount(session)
  const customerId = account.user?.id
  if (!customerId) {
    return yield* Effect.fail(new PublicPaddleScenarioError({ message: "Account response did not include user id" }))
  }

  const sql = yield* SqlClient.SqlClient
  const [
    checkoutIntents,
    webhookReceipts,
    commercialEvents,
    subscriptions,
    invoices,
    entitlements,
    providerRefs,
    creditLedger
  ] = yield* Effect.all([
    sql.unsafe<DurableCommercialState["checkoutIntents"][number]>(
      `SELECT id,
                customer_id AS customerId,
                offer_id AS offerId,
                provider,
                provider_checkout_session_id AS providerCheckoutSessionId,
                status,
                updated_at AS updatedAt
           FROM paykit_checkout_intent
          WHERE customer_id = ?
          ORDER BY updated_at DESC`,
      [customerId]
    ).withoutTransform,
    sql.unsafe<DurableCommercialState["webhookReceipts"][number]>(
      `SELECT id,
                provider_id AS providerId,
                provider_event_id AS providerEventId,
                type,
                status,
                received_at AS receivedAt,
                processed_at AS processedAt
           FROM paykit_webhook_event
          ORDER BY received_at DESC`
    ).withoutTransform,
    sql.unsafe<DurableCommercialState["commercialEvents"][number]>(
      `SELECT id,
                provider,
                provider_event_id AS providerEventId,
                kind,
                customer_id AS customerId,
                offer_id AS offerId,
                agreement_id AS agreementId,
                occurred_at AS occurredAt
           FROM paykit_commercial_event
          WHERE customer_id = ?
          ORDER BY occurred_at DESC`,
      [customerId]
    ).withoutTransform,
    sql.unsafe<DurableCommercialState["subscriptions"][number]>(
      `SELECT id,
                customer_id AS customerId,
                product_internal_id AS productInternalId,
                provider_id AS providerId,
                status,
                cancel_at_period_end AS cancelAtPeriodEnd,
                current_period_end_at AS currentPeriodEndAt,
                updated_at AS updatedAt
           FROM paykit_subscription
          WHERE customer_id = ?
          ORDER BY updated_at DESC`,
      [customerId]
    ).withoutTransform,
    sql.unsafe<DurableCommercialState["invoices"][number]>(
      `SELECT id,
                customer_id AS customerId,
                subscription_id AS subscriptionId,
                type,
                status,
                amount,
                currency,
                provider_id AS providerId,
                updated_at AS updatedAt
           FROM paykit_invoice
          WHERE customer_id = ?
          ORDER BY updated_at DESC`,
      [customerId]
    ).withoutTransform,
    sql.unsafe<DurableCommercialState["entitlements"][number]>(
      `SELECT id,
                subscription_id AS subscriptionId,
                customer_id AS customerId,
                feature_id AS featureId,
                "limit",
                balance,
                updated_at AS updatedAt
           FROM paykit_entitlement
          WHERE customer_id = ?
          ORDER BY updated_at DESC`,
      [customerId]
    ).withoutTransform,
    sql.unsafe<DurableCommercialState["providerRefs"][number]>(
      `SELECT id,
                provider,
                owner_type AS ownerType,
                owner_id AS ownerId,
                provider_id AS providerId,
                kind,
                updated_at AS updatedAt
           FROM paykit_provider_ref
          ORDER BY updated_at DESC`
    ).withoutTransform,
    sql.unsafe<DurableCommercialState["creditLedger"][number]>(
      `SELECT id,
                customer_id AS customerId,
                product_id AS productId,
                offer_id AS offerId,
                amount,
                direction,
                idempotency_key AS idempotencyKey,
                reason,
                created_at AS createdAt
           FROM paykit_credit_ledger
          WHERE customer_id = ?
          ORDER BY created_at DESC`,
      [customerId]
    ).withoutTransform
  ])

  return {
    checkoutIntents,
    webhookReceipts,
    commercialEvents,
    subscriptions,
    invoices,
    entitlements,
    providerRefs,
    creditLedger
  } satisfies DurableCommercialState
})

const currentRunId = Effect.gen(function* () {
  const config = yield* TestConfig
  if (config.runId) {
    return config.runId
  }
  return `run_${crypto.randomUUID()}`
})
