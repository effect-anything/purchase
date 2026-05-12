// @ts-nocheck
import { HttpApiBuilder, HttpServerRequest } from "@effect/platform"
import { Effect } from "effect"

import { AppApi } from "../api/http-api.ts"
import { AuthService } from "../auth/auth-service.ts"
import { sessionUser } from "../auth/auth-session.ts"
import { purchaseEnvironment, purchaseProvider } from "../purchase-domain.ts"
import { AccountService } from "./account-service.ts"
import { AuthenticationRequired } from "./domain.ts"

export const AccountHttpApiLive = HttpApiBuilder.group(AppApi, "account", (handlers) =>
  handlers.handle("get", () =>
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest
      const auth = yield* AuthService
      const session = yield* auth
        .getSession({ headers: new Headers(request.headers) })
        .pipe(
          Effect.flatMap((value) =>
            value
              ? Effect.succeed(value)
              : Effect.fail(new AuthenticationRequired({ message: "Authentication required." }))
          )
        )
      const user = sessionUser(session)
      const account = yield* AccountService
      const overview = yield* account.loadOverview(user).pipe(Effect.orDie)

      return {
        environment: purchaseEnvironment,
        provider: purchaseProvider,
        ...overview
      }
    })
  )
)

export const AuthHttpLive = HttpApiBuilder.group(AppApi, "auth", (handlers) =>
  handlers.handle("get", () =>
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest
      const auth = yield* AuthService
      const session = yield* auth.getSession({ headers: new Headers(request.headers) }).pipe(Effect.orDie)

      return {
        session: session
          ? {
              user: sessionUser(session)
            }
          : null
      }
    })
  )
)

export const CatalogHttpLive = HttpApiBuilder.group(AppApi, "catalog", (handlers) =>
  handlers.handle("get", () =>
    Effect.gen(function* () {
      const catalog = yield* CatalogService

      return {
        environment: purchaseEnvironment,
        provider: purchaseProvider,
        catalog: yield* catalog.loadCatalog().pipe(Effect.orDie)
      }
    })
  )
)

export const CheckoutHttpLive = HttpApiBuilder.group(AppApi, "checkout", (handlers) =>
  handlers.handle("start", ({ payload }) =>
    Effect.gen(function* () {
      const offerId = payload.offerId.trim()
      if (!offerId) {
        return yield* new MissingOfferId({ message: "Missing offerId" })
      }

      const request = yield* HttpServerRequest.HttpServerRequest
      const auth = yield* AuthService
      const session = yield* auth
        .getSession({ headers: new Headers(request.headers) })
        .pipe(
          Effect.flatMap((value) =>
            value
              ? Effect.succeed(value)
              : Effect.fail(new AuthenticationRequired({ message: "Authentication required for checkout." }))
          )
        )
      const checkoutService = yield* CheckoutService
      const checkout = yield* checkoutService.start({ user: sessionUser(session), offerId })

      return {
        environment: purchaseEnvironment,
        provider: purchaseProvider,
        checkout
      }
    })
  )
)

export const CreditsHttpLive = HttpApiBuilder.group(AppApi, "credits", (handlers) =>
  handlers.handle("consume", ({ payload }) =>
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest
      const auth = yield* AuthService
      const session = yield* auth
        .getSession({ headers: new Headers(request.headers) })
        .pipe(
          Effect.flatMap((value) =>
            value
              ? Effect.succeed(value)
              : Effect.fail(new AuthenticationRequired({ message: "Authentication required." }))
          )
        )

      const amount = typeof payload.amount === "number" ? Math.max(1, Math.floor(payload.amount)) : 25
      const reason =
        typeof payload.reason === "string" && payload.reason.length > 0 ? payload.reason : "AI note summarization"
      const credits = yield* CreditsService
      const wallet = yield* credits.consume({ user: sessionUser(session), amount, reason }).pipe(
        Effect.catchAll((error) =>
          error && typeof error === "object" && "_tag" in error && error._tag === "CommercialWorkflowConflict"
            ? Effect.fail(
                new CreditsConflict({
                  workflow: (error as CommercialWorkflowConflict).workflow,
                  message: (error as CommercialWorkflowConflict).message
                })
              )
            : Effect.die(error)
        )
      )

      return { wallet }
    })
  )
)
