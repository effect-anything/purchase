import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentNextActionKonbini = Schema.Struct({
  expires_at: Schema.Number,
  hosted_voucher_url: Schema.NullOr(Schema.String),
  stores: Schema.suspend(
    (): Schema.Schema<Models.PaymentIntentNextActionKonbiniStores, any, any> =>
      Models.PaymentIntentNextActionKonbiniStores as Schema.Schema<
        Models.PaymentIntentNextActionKonbiniStores,
        any,
        any
      >
  )
})
export type PaymentIntentNextActionKonbini = typeof PaymentIntentNextActionKonbini.Type
