import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsPaypal = Schema.Struct({
  country: Schema.NullOr(Schema.String),
  payer_email: Schema.NullOr(Schema.String),
  payer_id: Schema.NullOr(Schema.String),
  payer_name: Schema.NullOr(Schema.String),
  seller_protection: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaypalSellerProtection, any, any> =>
        Models.PaypalSellerProtection as Schema.Schema<Models.PaypalSellerProtection, any, any>
    )
  ),
  transaction_id: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsPaypal = typeof PaymentMethodDetailsPaypal.Type
