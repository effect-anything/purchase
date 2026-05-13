/** @effect-diagnostics preferSchemaOverJson:off */
// import { BASE_PUBLIC_URL } from "@/config"
import { PaymentHarness } from "@effect-x/purchase/test"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"

export class PublicPaddleScenarioError extends Data.TaggedError("PublicPaddleScenarioError")<{
  readonly message: string
  readonly cause?: unknown
}> {}

interface PublicAuthSession {
  readonly email: string
  readonly password: string
  readonly cookie: string
}

interface SignUpInput {
  readonly email?: string | undefined
  readonly password?: string | undefined
  readonly name?: string | undefined
}

interface CheckoutStartResult {
  readonly offerId: string
  readonly intentId: string
  readonly sessionId: string
  readonly url: string | null
}

interface SubscriptionPurchaseInput {
  readonly session: PublicAuthSession
  readonly offerId: string
  readonly email?: string | undefined
}

interface AccountOverview {
  readonly snapshot?: {
    readonly activeOfferIds?: ReadonlyArray<string>
    readonly subscriptions?: ReadonlyArray<{
      readonly id?: string
      readonly status?: string
      readonly offerId?: string
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
  }
}

const withNgrokHeaders = (baseUrl: string, headers: HeadersInit = {}) => ({
  ...headers,
  "ngrok-skip-browser-warning": "true",
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
  })

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
  const baseURL = yield* BASE_PUBLIC_URL
  const email = input?.email ?? `e2e-${Date.now()}@example.com`
  const password = input?.password ?? "password123456"
  const name = input?.name ?? "Purchase SDK E2E User"

  return yield* fetchText(`${baseURL}/api/auth/sign-up/email`, {
    method: "POST",
    headers: withNgrokHeaders(baseURL, { "content-type": "application/json" }),
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

export const getAccount = Effect.fn(function* (session: PublicAuthSession) {
  const baseURL = yield* BASE_PUBLIC_URL

  return yield* fetchJson<AccountOverview>(`${baseURL}/api/me/account`, {
    headers: withNgrokHeaders(baseURL, { cookie: session.cookie })
  }).pipe(Effect.map(({ json }) => json))
})

export const checkout = Effect.fn(function* (input: { readonly session: PublicAuthSession; readonly offerId: string }) {
  const baseURL = yield* BASE_PUBLIC_URL

  return yield* fetchJson<{ readonly checkout: CheckoutStartResult }>(`${baseURL}/api/checkout/start`, {
    method: "POST",
    headers: withNgrokHeaders(baseURL, { "content-type": "application/json", cookie: input.session.cookie }),
    body: JSON.stringify({ offerId: input.offerId })
  }).pipe(Effect.map(({ json }) => json.checkout))
})

export const purchaseSubscription = Effect.fn(function* (input: SubscriptionPurchaseInput) {
  const paymentHarness = yield* PaymentHarness

  const checkoutResult = yield* checkout({ session: input.session, offerId: input.offerId })
  const payment = yield* paymentHarness.payCheckout({
    checkout: {
      provider: "paddle",
      sessionId: checkoutResult.sessionId,
      url: checkoutResult.url ?? undefined
    },
    mode: "subscription",
    customer: {
      email: input.session.email,
      name: "Purchase SDK E2E User"
    }
  })
  const accountOverview = yield* getAccount(input.session)

  return { session: input.session, checkout, transaction: payment.transaction, account: accountOverview } as const
})
