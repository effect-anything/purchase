import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"

import { AuthenticationRequired, MissingOfferId } from "../../errors.ts"
import { AppApi } from "../api/http-api.ts"

export const CheckoutHttpLive = HttpApiBuilder.group(AppApi, "checkout", (handlers) =>
  handlers.handle("start", ({ payload }) =>
    Effect.gen(function* () {
      const offerId = payload.offerId.trim()
      if (!offerId) {
        return yield* Effect.fail(new MissingOfferId({ message: "Missing offerId" }))
      }

      // const session = yield* Effect.tryPromise(() => getSession()).pipe(
      //   Effect.flatMap((value) =>
      //     value
      //       ? Effect.succeed(value)
      //       : Effect.fail(new AuthenticationRequired({ message: "Authentication required for checkout." }))
      //   )
      // )

      // const checkout = yield* startUserCheckout({ user: sessionUser(session), offerId })

      return {
        // environment: getPurchaseEnvironment(),
        // provider: getActiveProvider(),
        // checkout: {
        //   offerId,
        //   intentId: checkout.intentId,
        //   sessionId: checkout.session.id,
        //   url: checkout.session.url ?? null
        // }
      } as any
    })
  )
)
