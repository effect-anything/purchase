import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AmazonPayUnderlyingPaymentMethodFundingDetails = Schema.Struct({
  card: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodDetailsPassthroughCard => Models.PaymentMethodDetailsPassthroughCard)),
  type: Schema.NullOr(Schema.Literal("card")),
})
export type AmazonPayUnderlyingPaymentMethodFundingDetails = typeof AmazonPayUnderlyingPaymentMethodFundingDetails.Type
