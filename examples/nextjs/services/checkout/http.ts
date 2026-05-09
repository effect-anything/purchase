import { HttpApiBuilder, HttpServerRequest } from "@effect/platform"
import { Effect } from "effect"

import { AuthenticationRequired, MissingOfferId, ProviderNotConfigured } from "../../errors.ts"
import { AppApi } from "../api/http-api.ts"
import { AuthService } from "../auth/auth-service.ts"
import { sessionUser } from "../auth/auth-session.ts"
import { purchaseEnvironment, purchaseProvider } from "../purchase-domain.ts"
import { CheckoutService } from "./checkout-service.ts"

export const CheckoutHttpLive = HttpApiBuilder.group(AppApi, "checkout", (handlers) =>
  handlers.handle("start", ({ payload }) =>
    Effect.gen(function* () {
      const offerId = payload.offerId.trim()
      if (!offerId) {
        return yield* Effect.fail(new MissingOfferId({ message: "Missing offerId" }))
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
