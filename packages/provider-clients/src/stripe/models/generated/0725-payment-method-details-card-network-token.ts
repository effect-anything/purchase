import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsCardNetworkToken = Schema.Struct({
  used: Schema.Boolean,
})
export type PaymentMethodDetailsCardNetworkToken = typeof PaymentMethodDetailsCardNetworkToken.Type
