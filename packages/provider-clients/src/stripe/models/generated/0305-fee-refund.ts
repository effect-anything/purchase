import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const FeeRefund = Schema.Struct({
  amount: Schema.Number,
  balance_transaction: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.BalanceTransaction => Models.BalanceTransaction))),
  created: Schema.Number,
  currency: Schema.String,
  fee: Schema.Union(Schema.String, Schema.suspend((): typeof Models.ApplicationFee => Models.ApplicationFee)),
  id: Schema.String,
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  object: Schema.Literal("fee_refund"),
})
export type FeeRefund = typeof FeeRefund.Type
