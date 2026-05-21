import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionCheckoutAddressDetails = Schema.Struct({
  address: Schema.suspend(
    (): Schema.Schema<Models.Address, any, any> => Models.Address as Schema.Schema<Models.Address, any, any>
  ),
  name: Schema.String
})
export type PaymentPagesCheckoutSessionCheckoutAddressDetails =
  typeof PaymentPagesCheckoutSessionCheckoutAddressDetails.Type
