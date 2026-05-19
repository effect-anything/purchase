import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentIntentNextActionKonbini = Schema.Struct({
  expires_at: Schema.Number,
  hosted_voucher_url: Schema.NullOr(Schema.String),
  stores: Schema.suspend((): typeof Models.PaymentIntentNextActionKonbiniStores => Models.PaymentIntentNextActionKonbiniStores),
})
export type PaymentIntentNextActionKonbini = typeof PaymentIntentNextActionKonbini.Type
