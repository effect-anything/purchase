import type * as Option from "effect/Option"

import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

import type { CreditsWalletState, PurchaseGrantState, SubscriptionAgreementState } from "./commercial-schema.ts"

import { CommercialProjectionService } from "./projection-service.ts"

export class CommercialStateStore extends Context.Tag("@pay/core/CommercialStateStore")<
  CommercialStateStore,
  {
    readonly getSubscriptionAgreement: (input: {
      readonly agreementId: string
    }) => Effect.Effect<Option.Option<SubscriptionAgreementState>>
    readonly listSubscriptions: (input: {
      readonly customerId: string
    }) => Effect.Effect<ReadonlyArray<SubscriptionAgreementState>>
    readonly listPurchases: (input: { readonly customerId: string }) => Effect.Effect<ReadonlyArray<PurchaseGrantState>>
    readonly listWallets: (input: { readonly customerId: string }) => Effect.Effect<ReadonlyArray<CreditsWalletState>>
  }
>() {}

export const CommercialStateStoreLayer = Layer.effect(
  CommercialStateStore,
  Effect.gen(function* () {
    const projection = yield* CommercialProjectionService

    return CommercialStateStore.of({
      getSubscriptionAgreement: projection.getSubscriptionAgreement,
      listSubscriptions: projection.listSubscriptions,
      listPurchases: projection.listPurchases,
      listWallets: projection.listWallets
    })
  })
)
