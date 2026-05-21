import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionCollectedInformation = Schema.Struct({
  business_name: Schema.NullOr(Schema.String),
  individual_name: Schema.NullOr(Schema.String),
  shipping_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionCheckoutAddressDetails, any, any> =>
        Models.PaymentPagesCheckoutSessionCheckoutAddressDetails as Schema.Schema<
          Models.PaymentPagesCheckoutSessionCheckoutAddressDetails,
          any,
          any
        >
    )
  )
})
export type PaymentPagesCheckoutSessionCollectedInformation =
  typeof PaymentPagesCheckoutSessionCollectedInformation.Type
