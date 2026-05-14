/** @effect-diagnostics preferSchemaOverJson:off */
import { HttpApiBuilder, HttpServerRequest, HttpLayerRouter, HttpServerResponse } from "@effect/platform"
import * as SqlClient from "@effect/sql/SqlClient"
import { Effect, Layer } from "effect"

import { syncCatalog } from "../../src/sync/config-service.ts"
import { aiCredits, CommercialPay } from "../commercial-catalog.ts"
import {
  AuthenticationRequired,
  CreditsConflict,
  MissingOfferId,
  ProviderNotConfigured,
  WebhookProcessingFailed
} from "./domain.ts"
import { AppApi } from "./http.ts"
import { SessionStore } from "./session.ts"
import { TunnelRuntime } from "./tunnel.ts"

const provider = "paddle" as const
const environment = "sandbox"

const nowIso = () => new Date().toISOString()

const describeCause = (cause: unknown) => {
  if (cause instanceof Error) {
    return cause.message
  }
  return String(cause)
}

const requireUser = Effect.gen(function* () {
  const request = yield* HttpServerRequest.HttpServerRequest
  const sessions = yield* SessionStore
  const sessionId = request.cookies[sessions.cookieName]

  if (!sessionId) {
    return yield* new AuthenticationRequired({ message: "Authentication required" })
  }

  const session = yield* sessions.get(sessionId)
  if (!session) {
    return yield* new AuthenticationRequired({ message: "Authentication required" })
  }

  return session.user
})

const writeCustomer = (input: { readonly id: string; readonly email: string; readonly name: string }) =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient
    const now = nowIso()

    yield* sql.unsafe(
      `INSERT INTO paykit_customer (id, email, name, metadata, provider, created_at, updated_at)
       VALUES (?, ?, ?, '{}', '{}', ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         email = excluded.email,
         name = excluded.name,
         updated_at = excluded.updated_at`,
      [input.id, input.email, input.name, now, now]
    ).withoutTransform
  })

const AuthRoutes = HttpLayerRouter.add("POST", "/api/auth/sign-up/email", (request) =>
  Effect.gen(function* () {
    const payload = (yield* request.json) as {
      readonly email?: unknown
      readonly password?: unknown
      readonly name?: unknown
    }
    const email = typeof payload.email === "string" ? payload.email : `e2e-${Date.now()}@example.com`
    const name = typeof payload.name === "string" ? payload.name : "Purchase SDK E2E User"
    const user = {
      id: `customer_${crypto.randomUUID()}`,
      email,
      name,
      workspaceSlug: email.split("@")[0] ?? "workspace",
      creditsUsed: 0
    }

    yield* writeCustomer(user)

    const sessions = yield* SessionStore
    const sessionId = yield* sessions.create(user)
    const response = yield* HttpServerResponse.json({ user })

    return yield* HttpServerResponse.setCookie(response, sessions.cookieName, sessionId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax"
    })
  })
)

const CatalogHttpLive = HttpApiBuilder.group(AppApi, "catalog", (handlers) =>
  handlers.handle("get", () =>
    Effect.gen(function* () {
      const purchase = yield* CommercialPay
      const catalog = yield* purchase.catalog.getCatalog().pipe(Effect.orDie)
      return {
        environment,
        provider,
        catalog
      }
    })
  )
)

const AccountHttpApiLive = HttpApiBuilder.group(AppApi, "account", (handlers) =>
  handlers.handle("get", () =>
    Effect.gen(function* () {
      const user = yield* requireUser
      const purchase = yield* CommercialPay
      const sql = yield* SqlClient.SqlClient

      const [snapshot, entitlements, checkoutIntents, events] = yield* Effect.all([
        purchase.customer.getSnapshot({ customerId: user.id as never }).pipe(Effect.orDie),
        purchase.customer.getEntitlements({ customerId: user.id as never }).pipe(Effect.orDie),
        sql
          .unsafe<{
            readonly id: string
            readonly offerId: string
            readonly status: string
            readonly updatedAt: string
          }>(
            `SELECT id, offer_id AS offerId, status, updated_at AS updatedAt
           FROM paykit_checkout_intent
           WHERE customer_id = ?
          ORDER BY updated_at DESC`,
            [user.id]
          )
          .withoutTransform.pipe(Effect.orDie),
        sql
          .unsafe<{
            readonly id: string
            readonly provider: string
            readonly kind: string
            readonly offerId: string | null
            readonly occurredAt: string
          }>(
            `SELECT id, provider, kind, offer_id AS offerId, occurred_at AS occurredAt
           FROM paykit_commercial_event
           WHERE customer_id = ?
          ORDER BY occurred_at DESC`,
            [user.id]
          )
          .withoutTransform.pipe(Effect.orDie)
      ])

      return {
        environment,
        provider,
        user,
        snapshot: {
          activeOfferIds: snapshot.activeOfferIds.map(String),
          subscriptions: snapshot.subscriptions.map((subscription) => ({
            id: subscription.id,
            status: subscription.status,
            offerId: subscription.offerId
          }))
        },
        entitlements: {
          benefits: entitlements.benefits.map((benefit) => ({
            key: benefit.key,
            type: benefit.type,
            ...(benefit.type === "feature_flag" ? { enabled: true } : {}),
            ...(benefit.type === "quota_limit" ? { limit: benefit.limit } : {})
          }))
        },
        activity: {
          checkoutIntents: checkoutIntents.map((intent) => ({
            id: intent.id,
            offerId: intent.offerId,
            status: intent.status,
            updatedAt: new Date(intent.updatedAt).toISOString()
          })),
          events: events.map((event) => ({
            id: event.id,
            provider: event.provider,
            kind: event.kind,
            offerId: event.offerId,
            occurredAt: new Date(event.occurredAt).toISOString()
          }))
        }
      }
    })
  )
)

const CheckoutHttpLive = HttpApiBuilder.group(AppApi, "checkout", (handlers) =>
  handlers.handle("start", ({ payload }) =>
    Effect.gen(function* () {
      const user = yield* requireUser
      if (!payload.offerId) {
        return yield* new MissingOfferId({ message: "Missing offerId" })
      }

      yield* syncCatalog().pipe(
        Effect.mapError(
          (cause) =>
            new ProviderNotConfigured({
              message: `Catalog sync failed: ${String(cause)}`
            })
        )
      )

      const purchase = yield* CommercialPay
      const tunnel = yield* TunnelRuntime
      const checkout = yield* purchase.checkout
        .start({
          customerId: user.id as never,
          offerId: payload.offerId as never,
          successUrl: "/account?checkout=success",
          cancelUrl: "/account?checkout=cancel",
          ...(tunnel.checkoutURL ? { checkoutUrl: tunnel.checkoutURL } : {}),
          metadata: {
            workspaceSlug: user.workspaceSlug
          }
        })
        .pipe(
          Effect.mapError((cause) => {
            const tag =
              typeof cause === "object" && cause !== null ? (cause as { readonly _tag?: string })._tag : undefined
            return tag === "CommercialOfferNotFound"
              ? new MissingOfferId({ message: `Unknown offerId: ${payload.offerId}` })
              : new ProviderNotConfigured({ message: `Checkout provider failed: ${describeCause(cause)}` })
          })
        )

      return {
        environment,
        provider,
        checkout: {
          offerId: checkout.offerId,
          intentId: checkout.intentId,
          sessionId: checkout.session.id,
          url: checkout.session.url ?? null
        }
      }
    })
  )
)

const CreditsHttpLive = HttpApiBuilder.group(AppApi, "credits", (handlers) =>
  handlers.handle("consume", ({ payload }) =>
    Effect.gen(function* () {
      const user = yield* requireUser
      const purchase = yield* CommercialPay
      const wallet = yield* purchase.credits
        .consume({
          customerId: user.id as never,
          creditKey: aiCredits.id,
          amount: payload.amount ?? 1,
          idempotencyKey: crypto.randomUUID(),
          reason: payload.reason
        })
        .pipe(
          Effect.mapError(
            (cause) =>
              new CreditsConflict({
                workflow: "credits.consume",
                message: `Credit consume failed: ${describeCause(cause)}`
              })
          )
        )

      return {
        wallet: {
          available: wallet.available,
          acquired: wallet.acquired,
          consumed: wallet.consumed
        }
      }
    })
  )
)

const WebhookRoute = HttpLayerRouter.add("POST", "/api/webhooks/paddle", (request) =>
  Effect.gen(function* () {
    const signature = request.headers["paddle-signature"]
    if (!signature) {
      return yield* HttpServerResponse.json(
        { error: "Missing paddle-signature header" },
        {
          status: 400
        }
      )
    }

    const body = yield* request.text
    const purchase = yield* CommercialPay
    const result = yield* purchase.webhooks
      .handle({
        provider,
        body,
        signature
      })
      .pipe(
        Effect.mapError(
          (cause) =>
            new WebhookProcessingFailed({
              message: `Webhook processing failed: ${describeCause(cause)}`
            })
        )
      )

    return yield* HttpServerResponse.json({ accepted: result.accepted })
  }).pipe(
    Effect.catchTag("WebhookProcessingFailed", (error) =>
      HttpServerResponse.json(
        { error: error.message },
        {
          status: 400
        }
      )
    )
  )
)

const CheckoutPageRoute = HttpLayerRouter.add("GET", "/checkout", () =>
  Effect.gen(function* () {
    const token = process.env.PADDLE_CLIENT_TOKEN ?? process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
    const environment = process.env.PADDLE_ENVIRONMENT ?? "sandbox"

    if (!token) {
      return yield* HttpServerResponse.html("<!doctype html><p>Missing PADDLE_CLIENT_TOKEN.</p>").pipe(
        Effect.map(HttpServerResponse.setStatus(500))
      )
    }

    return HttpServerResponse.html(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Purchase SDK Paddle Checkout</title>
    <script src="https://cdn.paddle.com/paddle/v2/paddle.js"></script>
  </head>
  <body>
    <main id="checkout">Loading checkout...</main>
    <script>
      const params = new URLSearchParams(window.location.search);
      const transactionId = params.get("_ptxn") || params.get("transaction_id") || params.get("txn");
      const email = params.get("email");
      const country = params.get("country") || "US";
      const postal = params.get("postal") || "10001";
      Paddle.Environment.set(${JSON.stringify(environment)});
      Paddle.Initialize({ token: ${JSON.stringify(token)} });
      if (transactionId) {
        Paddle.Checkout.open({
          transactionId,
          settings: {
            displayMode: "overlay",
            variant: "one-page"
          },
          customer: {
            email,
            address: {
              countryCode: country,
              postalCode: postal
            }
          },
          address: {
            countryCode: country,
            postalCode: postal
          }
        });
      } else {
        document.getElementById("checkout").textContent = "Missing Paddle transaction id.";
      }
    </script>
  </body>
</html>`)
  })
)

const ApiLayers = Layer.mergeAll(AccountHttpApiLive, CatalogHttpLive, CheckoutHttpLive, CreditsHttpLive)

const PublicApiRoutes = HttpLayerRouter.addHttpApi(AppApi, { openapiPath: "/api/docs/openapi.json" }).pipe(
  Layer.provide(ApiLayers)
)

const AllRoutes = Layer.mergeAll(PublicApiRoutes, AuthRoutes, WebhookRoute, CheckoutPageRoute)

export const HttpRouterLive = HttpLayerRouter.serve(AllRoutes)
