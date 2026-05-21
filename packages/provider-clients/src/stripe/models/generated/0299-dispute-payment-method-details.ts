import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DisputePaymentMethodDetails = Schema.Struct({
  amazon_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DisputePaymentMethodDetailsAmazonPay, any, any> =>
        Models.DisputePaymentMethodDetailsAmazonPay as Schema.Schema<
          Models.DisputePaymentMethodDetailsAmazonPay,
          any,
          any
        >
    )
  ),
  card: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DisputePaymentMethodDetailsCard, any, any> =>
        Models.DisputePaymentMethodDetailsCard as Schema.Schema<Models.DisputePaymentMethodDetailsCard, any, any>
    )
  ),
  klarna: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DisputePaymentMethodDetailsKlarna, any, any> =>
        Models.DisputePaymentMethodDetailsKlarna as Schema.Schema<Models.DisputePaymentMethodDetailsKlarna, any, any>
    )
  ),
  paypal: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DisputePaymentMethodDetailsPaypal, any, any> =>
        Models.DisputePaymentMethodDetailsPaypal as Schema.Schema<Models.DisputePaymentMethodDetailsPaypal, any, any>
    )
  ),
  type: Schema.Literal("amazon_pay", "card", "klarna", "paypal")
})
export type DisputePaymentMethodDetails = typeof DisputePaymentMethodDetails.Type
