import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BillingDetails = Schema.Struct({
  enable_checkout: Schema.Boolean,
  purchase_order_number: Schema.String,
  additional_information: Schema.NullOr(Schema.String),
  payment_terms: Schema.suspend((): Schema.Schema<Models.Duration> => Models.Duration)
})
export type BillingDetails = typeof BillingDetails.Type
