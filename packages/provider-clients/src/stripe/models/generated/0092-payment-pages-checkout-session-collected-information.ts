import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionCollectedInformation = Schema.Struct({
  business_name: Schema.NullOr(Schema.String),
  individual_name: Schema.NullOr(Schema.String),
  shipping_details: Schema.NullOr(Schema.suspend((): typeof Models.PaymentPagesCheckoutSessionCheckoutAddressDetails => Models.PaymentPagesCheckoutSessionCheckoutAddressDetails)),
})
export type PaymentPagesCheckoutSessionCollectedInformation = typeof PaymentPagesCheckoutSessionCollectedInformation.Type
