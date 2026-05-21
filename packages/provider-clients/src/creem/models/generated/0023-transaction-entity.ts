import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionEntity = Schema.Struct({
  id: Schema.String,
  mode: Schema.suspend((): Schema.Schema<Models.EnvironmentMode> => Models.EnvironmentMode),
  object: Schema.String,
  amount: Schema.Number,
  amount_paid: Schema.optional(Schema.NullOr(Schema.Number)),
  discount_amount: Schema.optional(Schema.NullOr(Schema.Number)),
  currency: Schema.String,
  type: Schema.suspend((): Schema.Schema<Models.TransactionType> => Models.TransactionType),
  tax_country: Schema.optional(Schema.NullOr(Schema.String)),
  tax_amount: Schema.optional(Schema.NullOr(Schema.Number)),
  status: Schema.suspend((): Schema.Schema<Models.TransactionStatus> => Models.TransactionStatus),
  refunded_amount: Schema.optional(Schema.NullOr(Schema.Number)),
  order: Schema.optional(Schema.NullOr(Schema.String)),
  subscription: Schema.optional(Schema.NullOr(Schema.String)),
  customer: Schema.optional(Schema.NullOr(Schema.String)),
  description: Schema.optional(Schema.String),
  period_start: Schema.optional(Schema.Number),
  period_end: Schema.optional(Schema.Number),
  created_at: Schema.Number
})
export type TransactionEntity = typeof TransactionEntity.Type
