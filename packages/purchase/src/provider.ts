import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Schema from "effect/Schema"

import type { PaymentImpl } from "./provider/impl.ts"

import { PaymentProviderTag } from "./provider/type.ts"

export const PayProviderConfig = Config.string("PROVIDER").pipe(
  Config.withDefault("paddle"),
  Config.map((value) => Schema.decodeUnknownSync(PaymentProviderTag)(value))
)

export const PayProvider = {
  config: PayProviderConfig,
  FromTags: (input: {
    readonly paddle: Layer.Layer<PaymentImpl, unknown, unknown>
    readonly stripe: Layer.Layer<PaymentImpl, unknown, unknown>
  }) =>
    Layer.unwrapEffect(
      Effect.gen(function* () {
        const provider = yield* PayProviderConfig.pipe(Effect.orDie)

        return provider === "paddle" ? input.paddle : input.stripe
      })
    )
} as const

export { PaymentEnvironmentTag, PaymentProviderTag } from "./provider/type.ts"
export { Paddle } from "./paddle/paddle.ts"
export { Stripe } from "./stripe/stripe.ts"
