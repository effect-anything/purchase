import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsAmazonPay = Schema.Struct({
  funding: Schema.optional(Schema.suspend((): typeof Models.AmazonPayUnderlyingPaymentMethodFundingDetails => Models.AmazonPayUnderlyingPaymentMethodFundingDetails)),
  transaction_id: Schema.NullOr(Schema.String),
})
export type PaymentMethodDetailsAmazonPay = typeof PaymentMethodDetailsAmazonPay.Type
