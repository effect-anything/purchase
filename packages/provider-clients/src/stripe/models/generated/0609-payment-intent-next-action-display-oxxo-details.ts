import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentIntentNextActionDisplayOxxoDetails = Schema.Struct({
  expires_after: Schema.NullOr(Schema.Number),
  hosted_voucher_url: Schema.NullOr(Schema.String),
  number: Schema.NullOr(Schema.String),
})
export type PaymentIntentNextActionDisplayOxxoDetails = typeof PaymentIntentNextActionDisplayOxxoDetails.Type
