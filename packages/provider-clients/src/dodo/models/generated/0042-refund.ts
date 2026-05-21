import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Refund = Schema.Struct({
  business_id: Schema.String,
  created_at: Schema.String,
  customer: Schema.suspend((): Schema.Schema<Models.Customer> => Models.Customer),
  is_partial: Schema.Boolean,
  metadata: Schema.suspend((): Schema.Schema<Models.Metadata> => Models.Metadata),
  payment_id: Schema.String,
  refund_id: Schema.String,
  status: Schema.suspend((): Schema.Schema<Models.RefundStatus> => Models.RefundStatus),
  amount: Schema.optional(Schema.NullOr(Schema.Number)),
  currency: Schema.optional(Schema.NullOr(Schema.String)),
  reason: Schema.optional(Schema.NullOr(Schema.String))
})
export type Refund = typeof Refund.Type
