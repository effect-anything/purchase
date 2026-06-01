import { SqlClient } from "@effect/sql"
import { Data, Duration, Effect, Schedule } from "effect"

import { PaymentHarness } from "../../src/harness.ts"
import { TestConfig } from "../http-api/config.ts"

export class E2EHarnessError extends Data.TaggedError("E2EHarnessError")<{
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
    catch: (cause) => new E2EHarnessError({ message: "HTTP request failed", cause })
  }).pipe(Effect.retry(Schedule.exponential(Duration.millis(500)).pipe(Schedule.compose(Schedule.recurs(4)))))

const fetchJson = <A = unknown>(input: RequestInfo | URL, init?: RequestInit) =>
  fetchText(input, init).pipe(
    Effect.flatMap(({ response, text }) => {
      const json = text ? (JSON.parse(text) as A) : ({} as A)
      return response.ok
        ? Effect.succeed({ response, json })
        : Effect.fail(new E2EHarnessError({ message: `HTTP ${response.status}: ${text}` }))
    }),
    Effect.mapError((cause) =>
      cause._tag === "E2EHarnessError"
        ? cause
        : new E2EHarnessError({ message: "Failed to parse JSON response", cause })
    )
  )

export const createCustomerAccount = Effect.fn(function* (input?: SignUpInput | undefined) {
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
        return Effect.fail(new E2EHarnessError({ message: `Sign-up failed with ${response.status}: ${text}` }))
      }
      const cookie = parseCookie(response.headers)
      if (!cookie) {
        return Effect.fail(new E2EHarnessError({ message: "Sign-up did not return an auth cookie" }))
      }
      return Effect.succeed({ email, password, cookie } satisfies PublicAuthSession)
    })
  )
})

export const getAccount = Effect.fn(function* (session: PublicAuthSession) {
  const { baseURL } = yield* TestConfig

  return yield* fetchJson<AccountOverview>(`${baseURL}/api/me/account`, {
    headers: withHeaders(baseURL, { cookie: session.cookie })
  }).pipe(Effect.map(({ json }) => json))
})

export const openFreshCustomerAccount = Effect.fn(function* (input?: SignUpInput | undefined) {
  const session = yield* createCustomerAccount(input)
  const account = yield* getAccount(session)

  return { session, account } satisfies CustomerAccount
})

export const getCatalog = Effect.fn(function* () {
  const { baseURL } = yield* TestConfig

  return yield* fetchJson<CatalogOverview>(`${baseURL}/api/catalog`).pipe(Effect.map(({ json }) => json))
})

export const waitForAccount = Effect.fn(function* (input: {
  readonly session: PublicAuthSession
  readonly until: (account: AccountOverview) => boolean
  readonly timeoutMessage: string
}) {
  let latest: AccountOverview | undefined

  return yield* getAccount(input.session).pipe(
    Effect.tap((account) => Effect.sync(() => (latest = account))),
    Effect.flatMap((account) => {
      if (input.until(account)) {
        return Effect.succeed(account)
      }

      return Effect.fail(
        new E2EHarnessError({
          message: `${input.timeoutMessage}. Latest account snapshot: ${JSON.stringify(summarizeAccount(account))}`
        })
      )
    }),
    Effect.retry(Schedule.spaced(Duration.seconds(1)).pipe(Schedule.compose(Schedule.recurs(60)))),
    Effect.mapError(
      (cause) =>
        new E2EHarnessError({
          message: `${input.timeoutMessage}. Latest account snapshot: ${JSON.stringify(summarizeAccount(latest))}`,
          cause
        })
    )
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
  const { baseURL, runId } = yield* TestConfig

  return yield* fetchJson<{ readonly checkout: CheckoutStartResult }>(`${baseURL}/api/checkout/start`, {
    method: "POST",
    headers: withHeaders(baseURL, { "content-type": "application/json", cookie: input.session.cookie }),
    body: JSON.stringify({ offerId: input.offerId, runId })
  }).pipe(Effect.map(({ json }) => json.checkout))
})

export const startSubscriptionSignupCheckout = Effect.fn(function* (input: { readonly offerId: string }) {
  const session = yield* createCustomerAccount()
  const checkoutResult = yield* checkout({
    session,
    offerId: input.offerId
  })

  const account = yield* getAccount(session)

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
    return yield* Effect.dieMessage(
      `purchaseSubscription requires a checkout URL but provider returned mode="${checkoutResult.mode}" without one`
    )
  }

  const payment = yield* paymentHarness.payCheckout({
    checkout: {
      provider: paymentHarness.provider,
      sessionId: checkoutResult.sessionId,
      url: checkoutResult.url
    },
    mode: "subscription",
    customer: {
      email: input.session.email,
      name: input.session.email
    }
  })

  const durable = yield* waitForDurableSubscription({
    session: input.session,
    offerId: input.offerId
  })

  const accountOverview = yield* waitForActiveSubscription({
    session: input.session,
    offerId: input.offerId
  })

  return {
    session: input.session,
    checkout: checkoutResult,
    transaction: payment.transaction,
    account: accountOverview,
    durable
  } satisfies SubscriptionPurchaseResult
})

const summarizeAccount = (account: AccountOverview | undefined) => ({
  user: account?.user,
  activeOfferIds: account?.snapshot?.activeOfferIds ?? [],
  subscriptions: account?.snapshot?.subscriptions ?? [],
  purchases: account?.snapshot?.purchases ?? [],
  wallets: account?.snapshot?.wallets ?? [],
  benefits: account?.entitlements?.benefits ?? [],
  checkoutIntents: account?.activity?.checkoutIntents ?? [],
  events: account?.activity?.events ?? []
})

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
  const customerId = yield* getCustomerId(session)

  return yield* getDurableStateForCustomer(customerId)
})

export const waitForDurableSubscription = Effect.fn(function* (input: {
  readonly session: PublicAuthSession
  readonly offerId: string
}) {
  const customerId = yield* getCustomerId(input.session)
  let latest: DurableCommercialState | undefined

  return yield* getDurableStateForCustomer(customerId).pipe(
    Effect.tap((durable) => Effect.sync(() => (latest = durable))),
    Effect.flatMap((durable) =>
      hasDurableActiveSubscription(durable, input.offerId)
        ? Effect.succeed(durable)
        : Effect.fail(
            new E2EHarnessError({
              message: `Durable state did not expose an active subscription for offer "${input.offerId}". Latest durable state: ${JSON.stringify(summarizeDurable(latest))}`
            })
          )
    ),
    Effect.retry(Schedule.spaced(Duration.seconds(1)).pipe(Schedule.compose(Schedule.recurs(60)))),
    Effect.mapError(
      (cause) =>
        new E2EHarnessError({
          message: `Durable state did not expose an active subscription for offer "${input.offerId}". Latest durable state: ${JSON.stringify(summarizeDurable(latest))}`,
          cause
        })
    )
  )
})

const getCustomerId = Effect.fn(function* (session: PublicAuthSession) {
  const account = yield* getAccount(session)
  const customerId = account.user?.id

  if (!customerId) {
    return yield* new E2EHarnessError({ message: "Account response did not include user id" })
  }

  return customerId
})

const getDurableStateForCustomer = Effect.fn(function* (customerId: string) {
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

const hasDurableActiveSubscription = (durable: DurableCommercialState, offerId: string) =>
  durable.checkoutIntents.some((intent) => intent.offerId === offerId && intent.status === "accepted") &&
  durable.commercialEvents.some((event) => event.offerId === offerId && event.kind === "transaction_updated") &&
  durable.commercialEvents.some((event) => event.offerId === offerId && event.kind === "subscription_updated") &&
  durable.subscriptions.some((subscription) => subscription.status === "active") &&
  durable.invoices.some((invoice) => invoice.status === "paid")

const summarizeDurable = (durable: DurableCommercialState | undefined) => ({
  checkoutIntents: durable?.checkoutIntents ?? [],
  events: durable?.commercialEvents ?? [],
  subscriptions: durable?.subscriptions ?? [],
  invoices: durable?.invoices ?? [],
  entitlements: durable?.entitlements ?? []
})
