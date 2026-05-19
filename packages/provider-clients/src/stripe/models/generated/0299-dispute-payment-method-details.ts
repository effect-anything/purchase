import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const DisputePaymentMethodDetails = Schema.Struct({
  amazon_pay: Schema.optional(Schema.suspend((): typeof Models.DisputePaymentMethodDetailsAmazonPay => Models.DisputePaymentMethodDetailsAmazonPay)),
  card: Schema.optional(Schema.suspend((): typeof Models.DisputePaymentMethodDetailsCard => Models.DisputePaymentMethodDetailsCard)),
  klarna: Schema.optional(Schema.suspend((): typeof Models.DisputePaymentMethodDetailsKlarna => Models.DisputePaymentMethodDetailsKlarna)),
  paypal: Schema.optional(Schema.suspend((): typeof Models.DisputePaymentMethodDetailsPaypal => Models.DisputePaymentMethodDetailsPaypal)),
  type: Schema.Literal("amazon_pay", "card", "klarna", "paypal"),
})
export type DisputePaymentMethodDetails = typeof DisputePaymentMethodDetails.Type
