import { CustomerId } from "@effect-x/purchase/schema"
import { Context, Effect, Layer, Option } from "effect"

import type { AuthenticatedUser } from "../authenticated-user.ts"
import type { CheckoutStartResult } from "./checkout-domain.ts"

import { BASE_PUBLIC_URL, PADDLE_CHECKOUT_URL } from "../../config.ts"
import { ProviderNotConfigured } from "../../errors.ts"
import { CustomerSyncService } from "../customer-sync-service.ts"
import { PurchaseService } from "../purchase/purchase-service"

export class CheckoutService extends Context.Tag("CheckoutService")<
  CheckoutService,
  {
    readonly start: (input: {
      readonly user: AuthenticatedUser
      readonly offerId: string
    }) => Effect.Effect<CheckoutStartResult, ProviderNotConfigured>
  }
>() {
  static Default = Layer.effect(
    CheckoutService,
    Effect.gen(function* () {
      const purchase = yield* PurchaseService
      const publicUrl = yield* BASE_PUBLIC_URL
      const paddleCheckoutUrl = yield* PADDLE_CHECKOUT_URL
      const customerSync = yield* CustomerSyncService

      const start = (input: {
        readonly user: AuthenticatedUser
        readonly offerId: string
      }): Effect.Effect<CheckoutStartResult, ProviderNotConfigured> =>
        customerSync.ensureCustomer(input.user).pipe(
          Effect.zipRight(
            purchase.checkout.start({
              customerId: CustomerId.make(input.user.id),
              offerId: input.offerId as never,
              successUrl: `${publicUrl}/account?checkout=success&offer=${encodeURIComponent(input.offerId)}`,
              cancelUrl: `${publicUrl}/account?checkout=cancelled&offer=${encodeURIComponent(input.offerId)}`,
              checkoutUrl: Option.getOrElse(paddleCheckoutUrl, () => publicUrl),
              metadata: {
                source: "nextjs-app",
                workspaceSlug: input.user.workspaceSlug,
                authUserId: input.user.id
              }
            })
          ),
          Effect.map(
            (checkout) =>
              ({
                offerId: input.offerId,
                intentId: checkout.intentId,
                sessionId: checkout.session.id,
                url: checkout.session.url ?? null
              }) satisfies CheckoutStartResult
          ),
          Effect.mapError(
            (error) =>
              new ProviderNotConfigured({
                message: error instanceof Error ? error.message : "Payment provider is not configured for checkout."
              })
          )
        )

      return { start } as const
    })
  )
}
