import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentIntentNextActionBoleto = Schema.Struct({
  expires_at: Schema.NullOr(Schema.Number),
  hosted_voucher_url: Schema.NullOr(Schema.String),
  number: Schema.NullOr(Schema.String),
  pdf: Schema.NullOr(Schema.String),
})
export type PaymentIntentNextActionBoleto = typeof PaymentIntentNextActionBoleto.Type
