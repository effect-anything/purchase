import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BillingDetailsCreate = Schema.Struct({
  enable_checkout: Schema.optional(Schema.Boolean),
  purchase_order_number: Schema.optional(Schema.String),
  additional_information: Schema.optional(Schema.NullOr(Schema.String)),
  payment_terms: Schema.suspend((): Schema.Schema<Models.Duration> => Models.Duration)
})
export type BillingDetailsCreate = typeof BillingDetailsCreate.Type
