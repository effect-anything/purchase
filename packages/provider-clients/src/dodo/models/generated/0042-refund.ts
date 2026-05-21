import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Refund = Schema.Struct({
  business_id: Schema.String,
  created_at: Schema.String,
  customer: Schema.suspend(
    (): Schema.Schema<Models.Customer, any, any> => Models.Customer as Schema.Schema<Models.Customer, any, any>
  ),
  is_partial: Schema.Boolean,
  metadata: Schema.suspend(
    (): Schema.Schema<Models.Metadata, any, any> => Models.Metadata as Schema.Schema<Models.Metadata, any, any>
  ),
  payment_id: Schema.String,
  refund_id: Schema.String,
  status: Schema.suspend(
    (): Schema.Schema<Models.RefundStatus, any, any> =>
      Models.RefundStatus as Schema.Schema<Models.RefundStatus, any, any>
  ),
  amount: Schema.optional(Schema.NullOr(Schema.Number)),
  currency: Schema.optional(Schema.NullOr(Schema.String)),
  reason: Schema.optional(Schema.NullOr(Schema.String))
})
export type Refund = typeof Refund.Type
