/** @effect-diagnostics preferSchemaOverJson:off */
import { HttpApiBuilder, HttpServerRequest, HttpLayerRouter, HttpServerResponse } from "@effect/platform"
import { SqlClient } from "@effect/sql"
import { Effect, Layer } from "effect"

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

const environment = "sandbox"

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
    const now = new Date().toISOString()

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

const AuthHttpLive = HttpApiBuilder.group(AppApi, "auth", (handlers) =>
  handlers.handleRaw("signUpEmail", ({ request }) =>
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
    }).pipe(Effect.orDie)
  )
)

const CatalogHttpLive = HttpApiBuilder.group(AppApi, "catalog", (handlers) =>
  handlers.handle("get", () =>
    Effect.gen(function* () {
      const purchase = yield* CommercialPay
      const catalog = yield* purchase.catalog.getCatalog().pipe(Effect.orDie)

      return {
        environment,
        provider: purchase.provider._tag,
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

      const [snapshot, entitlements, checkoutIntents, events, creditLedger] = yield* Effect.all([
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
          .withoutTransform.pipe(Effect.orDie),
        sql
          .unsafe<{
            readonly id: string
            readonly productId: string
            readonly amount: number
            readonly direction: string
            readonly reason: string | null
            readonly createdAt: string
          }>(
            `SELECT id,
                    product_id AS productId,
                    amount,
                    direction,
                    reason,
                    created_at AS createdAt
               FROM paykit_credit_ledger
              WHERE customer_id = ?
              ORDER BY created_at DESC`,
            [user.id]
          )
          .withoutTransform.pipe(Effect.orDie)
      ])

      return {
        environment,
        provider: purchase.provider._tag,
        user,
        snapshot: {
          activeOfferIds: snapshot.activeOfferIds.map(String),
          subscriptions: snapshot.subscriptions.map((subscription) => ({
            id: subscription.id,
            status: subscription.status,
            offerId: subscription.offerId
          })),
          purchases: snapshot.purchases.map((purchase) => ({
            id: purchase.id,
            status: purchase.status,
            offerId: purchase.offerId
          })),
          wallets: snapshot.wallets.map((wallet) => ({
            id: wallet.id,
            productId: wallet.productId,
            available: wallet.available,
            acquired: wallet.acquired,
            consumed: wallet.consumed,
            refunded: wallet.refunded
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
          })),
          creditLedger: creditLedger.map((entry) => ({
            id: entry.id,
            productId: entry.productId,
            amount: entry.amount,
            direction: entry.direction,
            reason: entry.reason,
            createdAt: new Date(entry.createdAt).toISOString()
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
      const purchase = yield* CommercialPay

      const checkout = yield* purchase.checkout
        .start({
          customerId: user.id as never,
          offerId: payload.offerId as never,
          successUrl: "/account?checkout=success",
          cancelUrl: "/account?checkout=cancel",
          metadata: {
            ...(payload.runId ? { purchaseE2eRunId: payload.runId } : {}),
            workspaceSlug: user.workspaceSlug
          }
        })
        .pipe(
          Effect.mapError((cause) => {
            const tag =
              typeof cause === "object" && cause !== null ? (cause as { readonly _tag?: string })._tag : undefined
            return tag === "CommercialOfferNotFound"
              ? new MissingOfferId({ message: `Unknown offerId: ${payload.offerId}` })
              : new ProviderNotConfigured({ message: `Checkout provider failed`, cause })
          })
        )

      return {
        environment,
        provider: purchase.provider._tag,
        checkout: {
          offerId: checkout.offerId,
          intentId: checkout.intentId,
          sessionId: checkout.session.id,
          mode: checkout.session.mode,
          url: checkout.session.mode === "inline-sdk" ? null : checkout.session.url
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
                message: `Credit consume failed`,
                cause
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

const WebhookHttpLive = HttpApiBuilder.group(AppApi, "webhooks", (handlers) =>
  handlers.handleRaw("handle", ({ path, request }) =>
    Effect.gen(function* () {
      const body = yield* request.text.pipe(
        Effect.mapError(
          (cause) =>
            new WebhookProcessingFailed({
              message: `Webhook body read failed`,
              cause
            })
        )
      )
      const purchase = yield* CommercialPay
      const result = yield* purchase.webhooks
        .handle({
          provider: path.provider,
          body,
          headers: request.headers
        })
        .pipe(
          Effect.mapError(
            (cause) =>
              new WebhookProcessingFailed({
                message: `Webhook processing failed`,
                cause
              })
          )
        )

      return { accepted: result.accepted }
    })
  )
)

const PublicApiRoutes = HttpLayerRouter.addHttpApi(AppApi, { openapiPath: "/api/docs/openapi.json" }).pipe(
  Layer.provide(
    Layer.mergeAll(
      AccountHttpApiLive,
      AuthHttpLive,
      CatalogHttpLive,
      CheckoutHttpLive,
      CreditsHttpLive,
      WebhookHttpLive
    )
  )
)

export const HttpRouterLive = HttpLayerRouter.serve(PublicApiRoutes).pipe(Layer.provideMerge(SessionStore.Live))
