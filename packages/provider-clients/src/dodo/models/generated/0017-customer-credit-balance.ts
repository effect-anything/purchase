import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerCreditBalance = Schema.Struct({
  id: Schema.String,
  balance: Schema.String,
  created_at: Schema.String,
  credit_entitlement_id: Schema.String,
  customer_id: Schema.String,
  overage: Schema.String,
  updated_at: Schema.String,
  last_transaction_at: Schema.optional(Schema.NullOr(Schema.String))
})
export type CustomerCreditBalance = typeof CustomerCreditBalance.Type
