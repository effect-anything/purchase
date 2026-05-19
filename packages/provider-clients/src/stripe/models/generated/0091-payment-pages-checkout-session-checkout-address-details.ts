import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionCheckoutAddressDetails = Schema.Struct({
  address: Schema.suspend((): typeof Models.Address => Models.Address),
  name: Schema.String,
})
export type PaymentPagesCheckoutSessionCheckoutAddressDetails = typeof PaymentPagesCheckoutSessionCheckoutAddressDetails.Type
