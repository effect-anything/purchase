import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const OrderEntity = Schema.Struct({
  id: Schema.String,
  mode: Schema.suspend((): Schema.Schema<Models.EnvironmentMode> => Models.EnvironmentMode),
  object: Schema.String,
  customer: Schema.optional(Schema.NullOr(Schema.String)),
  product: Schema.String,
  transaction: Schema.optional(Schema.NullOr(Schema.String)),
  discount: Schema.optional(Schema.NullOr(Schema.String)),
  amount: Schema.Number,
  sub_total: Schema.optional(Schema.Number),
  tax_amount: Schema.optional(Schema.Number),
  discount_amount: Schema.optional(Schema.Number),
  amount_due: Schema.optional(Schema.Number),
  amount_paid: Schema.optional(Schema.Number),
  currency: Schema.String,
  fx_amount: Schema.optional(Schema.NullOr(Schema.Number)),
  fx_currency: Schema.optional(Schema.NullOr(Schema.String)),
  fx_rate: Schema.optional(Schema.NullOr(Schema.Number)),
  status: Schema.suspend((): Schema.Schema<Models.OrderStatus> => Models.OrderStatus),
  type: Schema.suspend((): Schema.Schema<Models.OrderType> => Models.OrderType),
  affiliate: Schema.optional(Schema.NullOr(Schema.String)),
  created_at: Schema.String,
  updated_at: Schema.String
})
export type OrderEntity = typeof OrderEntity.Type
