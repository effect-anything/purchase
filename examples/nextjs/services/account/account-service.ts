import { CustomerId } from "@effect-x/purchase/schema"
import { Context, Effect, Layer } from "effect"

import { BASE_PUBLIC_URL } from "../../config.ts"
import { Pay } from "../../purchase.ts"

export class AccountService extends Context.Tag("AccountService")<
  AccountService,
  {
    readonly checkout: (input: any) => Effect.Effect<any, any, any>
  }
>() {
  static Default = Layer.effect(
    AccountService,
    Effect.gen(function* () {
      const sdk = yield* Pay
      const publicUrl = yield* BASE_PUBLIC_URL

      const checkout = Effect.fn(function* (input: any) {
        const checkout = yield* sdk.checkout.start({
          customerId: CustomerId.make(input.user.id),
          offerId: input.offerId as never,
          successUrl: `${publicUrl}/account?checkout=success&offer=${encodeURIComponent(input.offerId)}`,
          cancelUrl: `${publicUrl}/account?checkout=cancelled&offer=${encodeURIComponent(input.offerId)}`,
          metadata: {
            source: "nextjs-app",
            workspaceSlug: input.user.workspaceSlug,
            authUserId: input.user.id
          }
        })
        return checkout
      })

      return {
        checkout
      }
    })
  )
}
