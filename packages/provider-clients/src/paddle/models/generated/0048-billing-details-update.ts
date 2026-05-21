import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BillingDetailsUpdate = Schema.Struct({
  enable_checkout: Schema.optional(Schema.Boolean),
  purchase_order_number: Schema.optional(Schema.String),
  additional_information: Schema.optional(Schema.NullOr(Schema.String)),
  payment_terms: Schema.optional(Schema.suspend((): Schema.Schema<Models.Duration> => Models.Duration))
})
export type BillingDetailsUpdate = typeof BillingDetailsUpdate.Type
