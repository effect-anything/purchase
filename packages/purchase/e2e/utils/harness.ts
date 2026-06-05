import { Cookies, FetchHttpClient, HttpApiClient, HttpClient, HttpClientRequest } from "@effect/platform"
import { SqlClient } from "@effect/sql"
import { Context, Data, Duration, Effect, flow, Layer, Option, pipe, Schedule } from "effect"

import { PaymentHarness, type PaymentHarnessCleanupOptions, type PaymentTestBrowserOptions } from "../../src/harness.ts"
import { TestConfig } from "../http-api/config.ts"
import { AppApi } from "../http-api/http.ts"

export class E2EHarnessError extends Data.TaggedError("E2EHarnessError")<{
  readonly message: string
  readonly cause?: unknown
}> {}

export interface HarnessOptions {
  readonly browser?: PaymentTestBrowserOptions | undefined
  readonly cleanup?: PaymentHarnessCleanupOptions | false | undefined
}

export class Harness extends Context.Tag("@E2E/Harness")<
  Harness,
  {
    readonly createCustomerAccount: (input?: SignUpInput | undefined) => Effect.Effect<PublicAuthSession>

    readonly getAccount: (session: PublicAuthSession) => Effect.Effect<AccountOverview>

    readonly openFreshCustomerAccount: (input?: SignUpInput | undefined) => Effect.Effect<CustomerAccount>

    readonly getCatalog: () => Effect.Effect<CatalogOverview, unknown>

    readonly waitForAccount: (input: {
      readonly session: PublicAuthSession
      readonly until: (account: AccountOverview) => boolean
      readonly timeoutMessage: string
    }) => Effect.Effect<AccountOverview, unknown>

    readonly waitForActiveSubscription: (input: {
      readonly session: PublicAuthSession
      readonly offerId: string
    }) => Effect.Effect<AccountOverview, unknown>

    readonly checkout: (input: {
      readonly session: PublicAuthSession
      readonly offerId: string
    }) => Effect.Effect<CheckoutStartResult, unknown>

    readonly startSubscriptionSignupCheckout: (input: {
      readonly offerId: string
    }) => Effect.Effect<CheckoutAttemptResult, unknown>

    readonly purchaseSubscription: (
      input: SubscriptionPurchaseInput
    ) => Effect.Effect<SubscriptionPurchaseResult, unknown>

    readonly consumeCredits: (input: {
      readonly session: PublicAuthSession
      readonly amount: number
      readonly reason?: string | undefined
    }) => Effect.Effect<CreditWalletOverview, unknown>

    readonly getDurableState: (session: PublicAuthSession) => Effect.Effect<DurableCommercialState, unknown>

    readonly waitForDurableSubscription: (input: {
      readonly session: PublicAuthSession
      readonly offerId: string
    }) => Effect.Effect<DurableCommercialState, unknown>
  } & Context.Tag.Service<PaymentHarness>
>() {
  static make = (options?: HarnessOptions | undefined) =>
    Layer.effect(
      Harness,
      Effect.gen(function* () {
        const apiClient = yield* AppApiClient
        const paymentHarness = yield* PaymentHarness
        const sql = yield* SqlClient.SqlClient
        const { runId } = yield* TestConfig

        const createCustomerAccount = Effect.fn("Harness.createCustomerAccount")(function* (
          input?: SignUpInput | undefined
        ) {
          const email = input?.email ?? `e2e-${Date.now()}@example.com`
          const password = input?.password ?? "password123456"
          const name = input?.name ?? "Purchase SDK E2E User"

          yield* Effect.annotateCurrentSpan({ email, runId })

          const [{ user }, response] = yield* apiClient.auth.signUpEmail({
            payload: {
              email,
              password,
              name
            },
            withResponse: true
          })

          const cookie = Cookies.toCookieHeader(response.cookies)

          return { id: user.id, email: user.name, name: user.name, password, cookie }
        }, Effect.orDie)

        const getAccount = Effect.fn("Harness.getAccount")(function* (session: PublicAuthSession) {
          yield* Effect.annotateCurrentSpan({ customerId: session.id, runId })

          return yield* apiClient.account
            .get()
            .pipe(
              Effect.provideService(FetchHttpClient.RequestInit, { headers: new Headers({ cookie: session.cookie }) })
            )
        }, Effect.orDie)

        const openFreshCustomerAccount = Effect.fn("Harness.openFreshCustomerAccount")(function* (
          input?: SignUpInput | undefined
        ) {
          const session = yield* createCustomerAccount(input)
          const account = yield* getAccount(session)

          return { session, account } satisfies CustomerAccount
        })

        const getCatalog = Effect.fn("Harness.getCatalog")(function* () {
          return yield* apiClient.catalog.get()
        })

        const waitForAccount = Effect.fn("Harness.waitForAccount")(function* (input: {
          readonly session: PublicAuthSession
          readonly until: (account: AccountOverview) => boolean
          readonly timeoutMessage: string
        }) {
          yield* Effect.annotateCurrentSpan({ customerId: input.session.id, runId })

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
            Effect.mapError(
              (cause) =>
                new E2EHarnessError({
                  message: `${input.timeoutMessage}. Latest account snapshot: ${JSON.stringify(summarizeAccount(latest))}`,
                  cause
                })
            )
          )
        })

        const waitForActiveSubscription = Effect.fn("Harness.waitForActiveSubscription")(function* (input: {
          readonly session: PublicAuthSession
          readonly offerId: string
        }) {
          yield* Effect.annotateCurrentSpan({ offerId: input.offerId, runId })

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

        const checkout = Effect.fn("Harness.checkout")(function* (input: {
          readonly session: PublicAuthSession
          readonly offerId: string
        }) {
          yield* Effect.annotateCurrentSpan({ offerId: input.offerId, runId })

          return yield* apiClient.checkout.start({ payload: { offerId: input.offerId, runId } }).pipe(
            Effect.provideService(FetchHttpClient.RequestInit, {
              headers: new Headers({ cookie: input.session.cookie })
            }),
            Effect.map((_) => _.checkout)
          )
        })

        const startSubscriptionSignupCheckout = Effect.fn("Harness.startSubscriptionSignupCheckout")(function* (input: {
          readonly offerId: string
        }) {
          yield* Effect.annotateCurrentSpan({ offerId: input.offerId, runId })

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

        const consumeCredits = Effect.fn("Harness.consumeCredits")(function* (input: {
          readonly session: PublicAuthSession
          readonly amount: number
          readonly reason?: string | undefined
        }) {
          yield* Effect.annotateCurrentSpan({ amount: input.amount, reason: input.reason, runId })

          return yield* apiClient.credits.consume({ payload: { amount: input.amount, reason: input.reason } }).pipe(
            Effect.provideService(FetchHttpClient.RequestInit, {
              headers: new Headers({ cookie: input.session.cookie })
            }),
            Effect.map((_) => _.wallet)
          )
        })

        const getCustomerId = Effect.fn("Harness.getCustomerId")(function* (session: PublicAuthSession) {
          const account = yield* getAccount(session)
          const customerId = account.user?.id

          if (!customerId) {
            return yield* new E2EHarnessError({ message: "Account response did not include user id" })
          }

          return customerId
        })

        const getDurableState = Effect.fn("Harness.getDurableState")(function* (session: PublicAuthSession) {
          const customerId = yield* getCustomerId(session)

          return yield* getDurableStateForCustomer(sql, customerId)
        })

        const waitForDurableSubscription = Effect.fn("Harness.waitForDurableSubscription")(function* (input: {
          readonly session: PublicAuthSession
          readonly offerId: string
        }) {
          yield* Effect.annotateCurrentSpan({ offerId: input.offerId, runId })

          const customerId = yield* getCustomerId(input.session)
          let latest: DurableCommercialState | undefined

          return yield* getDurableStateForCustomer(sql, customerId).pipe(
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
            Effect.mapError(
              (cause) =>
                new E2EHarnessError({
                  message: `Durable state did not expose an active subscription for offer "${input.offerId}". Latest durable state: ${JSON.stringify(summarizeDurable(latest))}`,
                  cause
                })
            )
          )
        })

        const purchaseSubscription = Effect.fn("Harness.purchaseSubscription")(function* (
          input: SubscriptionPurchaseInput
        ) {
          yield* Effect.annotateCurrentSpan({ offerId: input.offerId, customerEmail: input.session.email, runId })

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
              name: input.session.name
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

        return {
          ...paymentHarness,
          createCustomerAccount,
          getAccount,
          openFreshCustomerAccount,
          getCatalog,
          waitForAccount,
          waitForActiveSubscription,
          checkout,
          startSubscriptionSignupCheckout,
          purchaseSubscription,
          consumeCredits,
          getDurableState,
          waitForDurableSubscription
        }
      })
    ).pipe(
      Layer.provide(
        Layer.mergeAll(
          AppApiClient.Default,
          PaymentHarness.make({ browser: options?.browser, cleanup: options?.cleanup })
        )
      )
    )
}

const AppApiClient_ = HttpApiClient.make(AppApi, {
  transformClient: flow(
    HttpClient.mapRequestInputEffect(
      Effect.fn("E2E.prepareRequest")(function* (request) {
        const baseURL = yield* Effect.serviceOption(TestConfig).pipe(
          Effect.flatMap(Option.map((_) => _.baseURL)),
          Effect.orDie
        )
        const requestInit = yield* Effect.serviceOption(FetchHttpClient.RequestInit)

        const requestHeaders = Option.flatMap(requestInit, (_) => Option.fromNullable(_.headers)).pipe(
          Option.getOrElse(() => new Headers())
        )

        return pipe(request, HttpClientRequest.prependUrl(baseURL), HttpClientRequest.setHeaders(requestHeaders))
      })
    ),
    HttpClient.retryTransient({
      mode: "response-only",
      schedule: Schedule.exponential(Duration.millis(500))
    })
  )
})

class AppApiClient extends Context.Tag("@E2E/AppApiClient")<
  AppApiClient,
  Effect.Effect.Success<typeof AppApiClient_>
>() {
  static Default = Layer.effect(AppApiClient, AppApiClient_).pipe(Layer.provide(FetchHttpClient.layer))
}

export interface PublicAuthSession {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly password: string
  readonly cookie: string
}

export type AccountOverview = Effect.Effect.Success<ReturnType<typeof AppApiClient.Service.account.get<false>>>

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

const getDurableStateForCustomer = Effect.fn("Harness.getDurableStateForCustomer")(function* (
  sql: SqlClient.SqlClient,
  customerId: string
) {
  yield* Effect.annotateCurrentSpan({ customerId })

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
      `SELECT
          id,
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
      `SELECT
         id,
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
