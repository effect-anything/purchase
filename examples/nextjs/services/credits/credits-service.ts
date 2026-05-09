import { CommercialWorkflowConflict, CustomerId, type CreditWalletResult } from "@effect-x/purchase/schema"
import { Context, Effect, Layer } from "effect"

import type { AuthenticatedUser } from "../authenticated-user.ts"
import type { CreditWallet } from "./credits-domain.ts"

import { Pay } from "../../purchase.ts"
import { CustomerSyncService } from "../customer-sync-service.ts"

export class CreditsService extends Context.Tag("CreditsService")<
  CreditsService,
  {
    readonly consume: (input: {
      readonly user: AuthenticatedUser
      readonly amount: number
      readonly reason: string
    }) => Effect.Effect<CreditWallet, CommercialWorkflowConflict>
  }
>() {
  static Default = Layer.effect(
    CreditsService,
    Effect.gen(function* () {
      const sdk = yield* Pay
      const customerSync = yield* CustomerSyncService

      const consume = (input: {
        readonly user: AuthenticatedUser
        readonly amount: number
        readonly reason: string
      }): Effect.Effect<CreditWallet, CommercialWorkflowConflict> =>
        customerSync.ensureCustomer(input.user).pipe(
          Effect.orDie,
          Effect.zipRight(
            sdk.credits
              .consume({
                customerId: CustomerId.make(input.user.id),
                creditKey: "ai_credits",
                amount: input.amount,
                idempotencyKey: `${input.user.id}:${Date.now()}:${input.amount}`,
                reason: input.reason
              })
              .pipe(
                Effect.catchAll((error) =>
                  error && typeof error === "object" && "_tag" in error && error._tag === "CommercialWorkflowConflict"
                    ? Effect.fail(error as CommercialWorkflowConflict)
                    : Effect.die(error)
                )
              )
          ),
          Effect.map((wallet) => {
            const result = wallet as CreditWalletResult
            return {
              available: result.available,
              acquired: result.acquired,
              consumed: result.consumed
            } satisfies CreditWallet
          })
        )

      return { consume } as const
    })
  )
}
