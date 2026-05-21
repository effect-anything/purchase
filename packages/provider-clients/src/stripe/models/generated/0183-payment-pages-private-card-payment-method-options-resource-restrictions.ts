import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentPagesPrivateCardPaymentMethodOptionsResourceRestrictions = Schema.Struct({
  brands_blocked: Schema.optional(
    Schema.Array(Schema.Literal("american_express", "discover_global_network", "mastercard", "visa"))
  )
})
export type PaymentPagesPrivateCardPaymentMethodOptionsResourceRestrictions =
  typeof PaymentPagesPrivateCardPaymentMethodOptionsResourceRestrictions.Type
