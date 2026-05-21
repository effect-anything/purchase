import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Payment = Schema.Struct({
  payment_id: Schema.String,
  status: Schema.String,
  customer: Schema.optional(Schema.suspend((): Schema.Schema<Models.Customer> => Models.Customer)),
  total_amount: Schema.optional(Schema.Number),
  currency: Schema.optional(Schema.String),
  created_at: Schema.optional(Schema.String)
})
export type Payment = typeof Payment.Type
