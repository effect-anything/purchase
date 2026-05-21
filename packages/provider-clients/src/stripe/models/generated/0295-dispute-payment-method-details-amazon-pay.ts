import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DisputePaymentMethodDetailsAmazonPay = Schema.Struct({
  dispute_type: Schema.NullOr(Schema.Literal("chargeback", "claim"))
})
export type DisputePaymentMethodDetailsAmazonPay = typeof DisputePaymentMethodDetailsAmazonPay.Type
