import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AmazonPayUnderlyingPaymentMethodFundingDetails = Schema.Struct({
  card: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPassthroughCard, any, any> =>
        Models.PaymentMethodDetailsPassthroughCard as Schema.Schema<
          Models.PaymentMethodDetailsPassthroughCard,
          any,
          any
        >
    )
  ),
  type: Schema.NullOr(Schema.Literal("card"))
})
export type AmazonPayUnderlyingPaymentMethodFundingDetails = typeof AmazonPayUnderlyingPaymentMethodFundingDetails.Type
