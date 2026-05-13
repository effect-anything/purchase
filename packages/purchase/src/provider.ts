import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Schema from "effect/Schema"

import type { PaymentClient } from "./provider/client.ts"

import { PaymentProviderTag } from "./provider/type.ts"

export const PurchaseProviderConfig = Config.string("PROVIDER").pipe(
  Config.withDefault("paddle"),
  Config.map((value) => Schema.decodeUnknownSync(PaymentProviderTag)(value))
)

export const PayProviderConfig = PurchaseProviderConfig

export const PurchaseProvider = {
  config: PurchaseProviderConfig,
  fromTags: (input: {
    readonly paddle: Layer.Layer<PaymentClient, unknown, unknown>
    readonly stripe: Layer.Layer<PaymentClient, unknown, unknown>
  }) =>
    Layer.unwrapEffect(
      Effect.gen(function* () {
        const provider = yield* PurchaseProviderConfig.pipe(Effect.orDie)

        return provider === "paddle" ? input.paddle : input.stripe
      })
    ),
  FromTags: (input: {
    readonly paddle: Layer.Layer<PaymentClient, unknown, unknown>
    readonly stripe: Layer.Layer<PaymentClient, unknown, unknown>
  }) => PurchaseProvider.fromTags(input)
} as const

export const PayProvider = PurchaseProvider

export { PaymentEnvironmentTag, PaymentProviderTag } from "./provider/type.ts"
export type { PaymentClient } from "./provider/client.ts"

