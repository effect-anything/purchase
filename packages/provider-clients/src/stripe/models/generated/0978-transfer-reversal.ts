import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransferReversal = Schema.Struct({
  amount: Schema.Number,
  balance_transaction: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.BalanceTransaction => Models.BalanceTransaction))),
  created: Schema.Number,
  currency: Schema.String,
  destination_payment_refund: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Refund => Models.Refund))),
  id: Schema.String,
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  object: Schema.Literal("transfer_reversal"),
  source_refund: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Refund => Models.Refund))),
  transfer: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Transfer => Models.Transfer)),
})
export type TransferReversal = typeof TransferReversal.Type
