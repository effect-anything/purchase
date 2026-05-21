import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsCardWalletVisaCheckout = Schema.Struct({
  billing_address: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Address, any, any> => Models.Address as Schema.Schema<Models.Address, any, any>
    )
  ),
  email: Schema.NullOr(Schema.String),
  name: Schema.NullOr(Schema.String),
  shipping_address: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Address, any, any> => Models.Address as Schema.Schema<Models.Address, any, any>
    )
  )
})
export type PaymentMethodDetailsCardWalletVisaCheckout = typeof PaymentMethodDetailsCardWalletVisaCheckout.Type
