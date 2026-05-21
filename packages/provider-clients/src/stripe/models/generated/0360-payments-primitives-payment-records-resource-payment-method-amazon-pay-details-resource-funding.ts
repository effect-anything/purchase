import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentsPrimitivesPaymentRecordsResourcePaymentMethodAmazonPayDetailsResourceFunding = Schema.Struct({
  card: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodAmazonPayDetailsResourceFundingResourceFundingCard,
        any,
        any
      > =>
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodAmazonPayDetailsResourceFundingResourceFundingCard as Schema.Schema<
          Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodAmazonPayDetailsResourceFundingResourceFundingCard,
          any,
          any
        >
    )
  ),
  type: Schema.NullOr(Schema.Literal("card"))
})
export type PaymentsPrimitivesPaymentRecordsResourcePaymentMethodAmazonPayDetailsResourceFunding =
  typeof PaymentsPrimitivesPaymentRecordsResourcePaymentMethodAmazonPayDetailsResourceFunding.Type
