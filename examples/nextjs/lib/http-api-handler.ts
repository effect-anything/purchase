import { HttpApiBuilder } from "@effect/platform"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

import {
  consumeUserCredits,
  listUserAccountRows,
  loadCommercialCatalog,
  loadUserCommerce,
  processWebhook,
  startUserCheckout
} from "./app-runtime.ts"
import { getSession, sessionUser } from "./auth-session.ts"
import { auth } from "./auth.ts"
import { AuthenticationRequired, MissingOfferId, ProviderNotConfigured } from "./http-api-errors.ts"
import { AppApi } from "./http-api.ts"
import { getActiveProvider, getPurchaseEnvironment, isActiveProviderConfigured } from "./purchase-runtime.ts"

const HttpApiLive = Layer.mergeAll(
  HttpApiBuilder.api(AppApi),
  HttpApiBuilder.group(AppApi, "catalog", (handlers) =>
    handlers.handle("get", () =>
      Effect.gen(function* () {
        const catalog = yield* loadCommercialCatalog()
        return {
          environment: getPurchaseEnvironment(),
          provider: getActiveProvider(),
          catalog
        }
      })
    )
  ),
  HttpApiBuilder.group(AppApi, "account", (handlers) =>
    handlers.handle("get", () =>
      Effect.gen(function* () {
        const session = yield* Effect.tryPromise(() => getSession()).pipe(
          Effect.flatMap((value) =>
            value
              ? Effect.succeed(value)
              : Effect.fail(new AuthenticationRequired({ message: "Authentication required." }))
          )
        )
        const user = sessionUser(session)
        const [commerce, rows] = yield* Effect.all([loadUserCommerce(user), listUserAccountRows(user)])

        return {
          environment: getPurchaseEnvironment(),
          provider: getActiveProvider(),
          customer: {
            id: user.id,
            email: user.email,
            name: user.name,
            workspaceSlug: user.workspaceSlug
          },
          snapshot: commerce.snapshot,
          entitlements: commerce.entitlements,
          activity: {
            checkoutIntents: rows.intents.map((intent) => ({
              id: intent.id,
              offerId: intent.offer_id,
              status: intent.status,
              updatedAt: intent.updated_at
            })),
            events: rows.events.map((event) => ({
              id: event.id,
              provider: event.provider,
              kind: event.kind,
              offerId: event.offer_id,
              occurredAt: event.occurred_at
            })),
            creditLedger: rows.ledger.map((entry) => ({
              id: entry.id,
              productId: entry.product_id,
              amount: entry.amount,
              direction: entry.direction,
              reason: entry.reason,
              createdAt: entry.created_at
            }))
          }
        }
      })
    )
  ),
  HttpApiBuilder.group(AppApi, "checkout", (handlers) =>
    handlers.handle("start", ({ payload }) =>
      Effect.gen(function* () {
        if (!isActiveProviderConfigured()) {
          return yield* Effect.fail(
            new ProviderNotConfigured({
              message: `Active provider "${getActiveProvider()}" is not configured for runtime environment "${getPurchaseEnvironment()}". Update the purchase runtime config or provider credentials.`
            })
          )
        }

        const offerId = payload.offerId.trim()
        if (!offerId) {
          return yield* Effect.fail(new MissingOfferId({ message: "Missing offerId" }))
        }

        const session = yield* Effect.tryPromise(() => getSession()).pipe(
          Effect.flatMap((value) =>
            value
              ? Effect.succeed(value)
              : Effect.fail(new AuthenticationRequired({ message: "Authentication required for checkout." }))
          )
        )

        const checkout = yield* startUserCheckout({ user: sessionUser(session), offerId })

        return {
          environment: getPurchaseEnvironment(),
          provider: getActiveProvider(),
          checkout: {
            offerId,
            intentId: checkout.intentId,
            sessionId: checkout.session.id,
            url: checkout.session.url ?? null
          }
        }
      })
    )
  ),
  HttpApiBuilder.group(AppApi, "credits", (handlers) =>
    handlers.handle("consume", ({ payload }) =>
      Effect.gen(function* () {
        const session = yield* Effect.tryPromise(() => getSession()).pipe(
          Effect.flatMap((value) =>
            value
              ? Effect.succeed(value)
              : Effect.fail(new AuthenticationRequired({ message: "Authentication required." }))
          )
        )

        const amount = typeof payload.amount === "number" ? Math.max(1, Math.floor(payload.amount)) : 25
        const reason =
          typeof payload.reason === "string" && payload.reason.length > 0 ? payload.reason : "AI note summarization"
        const wallet = yield* consumeUserCredits({ user: sessionUser(session), amount, reason })

        return {
          wallet
        }
      })
    )
  )
)

const HttpHandler = HttpApiBuilder.toWebHandler(HttpApiLive)

export const handleNextApiRequest = async (request: Request) => {
  const url = new URL(request.url)

  if (url.pathname.startsWith("/api/auth/")) {
    return auth.handler(request)
  }

  if (url.pathname === "/api/webhooks/stripe" || url.pathname === "/api/webhooks/paddle") {
    const provider = url.pathname.endsWith("stripe") ? "stripe" : "paddle"
    const signature = request.headers.get(provider === "stripe" ? "stripe-signature" : "paddle-signature") ?? ""
    const body = await request.text()
    try {
      const webhook = await processWebhook({ provider, body, signature })
      return Response.json({ webhook })
    } catch (error) {
      return Response.json(
        {
          ok: false,
          error: {
            code: "webhook_processing_failed",
            message: error instanceof Error ? error.message : String(error)
          }
        },
        { status: 400 }
      )
    }
  }

  return HttpHandler.handler(request)
}
