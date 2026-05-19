import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Transfer = Schema.Struct({
  amount: Schema.Number,
  amount_reversed: Schema.Number,
  balance_transaction: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.BalanceTransaction => Models.BalanceTransaction))),
  created: Schema.Number,
  currency: Schema.String,
  description: Schema.NullOr(Schema.String),
  destination: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Account => Models.Account))),
  destination_payment: Schema.optional(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Charge => Models.Charge))),
  id: Schema.String,
  livemode: Schema.Boolean,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  object: Schema.Literal("transfer"),
  reversals: Schema.Struct({
  data: Schema.Array(Schema.suspend((): typeof Models.TransferReversal => Models.TransferReversal)),
  has_more: Schema.Boolean,
  object: Schema.Literal("list"),
  url: Schema.String,
}),
  reversed: Schema.Boolean,
  source_transaction: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Charge => Models.Charge))),
  source_type: Schema.optional(Schema.String),
  transfer_group: Schema.NullOr(Schema.String),
})
export type Transfer = typeof Transfer.Type
