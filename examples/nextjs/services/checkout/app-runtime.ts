import { Effect } from "effect"

import type { AuthenticatedUser } from "../authenticated-user.ts"

import * as Next from "../../lib/nextjs/server-effect.ts"
import { CheckoutService } from "./checkout-service.ts"

export const startUserCheckout = Next.serverFunction(
  (input: { readonly user: AuthenticatedUser; readonly offerId: string }) =>
    Effect.gen(function* () {
      const checkout = yield* CheckoutService
      return yield* checkout.start(input)
    })
)
