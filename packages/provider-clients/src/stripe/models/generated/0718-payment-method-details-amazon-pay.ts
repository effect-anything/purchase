import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsAmazonPay = Schema.Struct({
  funding: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.AmazonPayUnderlyingPaymentMethodFundingDetails, any, any> =>
        Models.AmazonPayUnderlyingPaymentMethodFundingDetails as Schema.Schema<
          Models.AmazonPayUnderlyingPaymentMethodFundingDetails,
          any,
          any
        >
    )
  ),
  transaction_id: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsAmazonPay = typeof PaymentMethodDetailsAmazonPay.Type
