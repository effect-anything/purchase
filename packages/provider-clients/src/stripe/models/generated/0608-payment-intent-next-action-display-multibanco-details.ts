import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentNextActionDisplayMultibancoDetails = Schema.Struct({
  entity: Schema.NullOr(Schema.String),
  expires_at: Schema.NullOr(Schema.Number),
  hosted_voucher_url: Schema.NullOr(Schema.String),
  reference: Schema.NullOr(Schema.String)
})
export type PaymentIntentNextActionDisplayMultibancoDetails =
  typeof PaymentIntentNextActionDisplayMultibancoDetails.Type
