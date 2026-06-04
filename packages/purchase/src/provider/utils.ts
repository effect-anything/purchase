import type * as ConfigError from "effect/ConfigError"
import type * as Layer from "effect/Layer"

import type { PaymentProvider, PaymentProviderTag } from "../provider.ts"

import { Paddle } from "../paddle.ts"
import { Stripe } from "../stripe.ts"

export const makeProviderLayer = (
  provider: PaymentProviderTag
): Layer.Layer<PaymentProvider, ConfigError.ConfigError> => {
  if (provider === "stripe") {
    return Stripe.layer
  }

  return Paddle.layer
}
