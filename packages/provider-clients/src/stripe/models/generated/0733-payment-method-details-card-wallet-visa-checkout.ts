import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsCardWalletVisaCheckout = Schema.Struct({
  billing_address: Schema.NullOr(Schema.suspend((): typeof Models.Address => Models.Address)),
  email: Schema.NullOr(Schema.String),
  name: Schema.NullOr(Schema.String),
  shipping_address: Schema.NullOr(Schema.suspend((): typeof Models.Address => Models.Address)),
})
export type PaymentMethodDetailsCardWalletVisaCheckout = typeof PaymentMethodDetailsCardWalletVisaCheckout.Type
