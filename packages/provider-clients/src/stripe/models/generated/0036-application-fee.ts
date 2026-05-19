import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ApplicationFee = Schema.Struct({
  account: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Account => Models.Account)),
  amount: Schema.Number,
  amount_refunded: Schema.Number,
  application: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Application => Models.Application)),
  balance_transaction: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.BalanceTransaction => Models.BalanceTransaction))),
  charge: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Charge => Models.Charge)),
  created: Schema.Number,
  currency: Schema.String,
  fee_source: Schema.NullOr(Schema.suspend((): typeof Models.PlatformEarningFeeSource => Models.PlatformEarningFeeSource)),
  id: Schema.String,
  livemode: Schema.Boolean,
  object: Schema.Literal("application_fee"),
  originating_transaction: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Charge => Models.Charge))),
  refunded: Schema.Boolean,
  refunds: Schema.Struct({
  data: Schema.Array(Schema.suspend((): typeof Models.FeeRefund => Models.FeeRefund)),
  has_more: Schema.Boolean,
  object: Schema.Literal("list"),
  url: Schema.String,
}),
})
export type ApplicationFee = typeof ApplicationFee.Type
