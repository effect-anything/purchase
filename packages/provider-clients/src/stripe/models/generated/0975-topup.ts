import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Topup = Schema.Struct({
  amount: Schema.Number,
  balance_transaction: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.BalanceTransaction => Models.BalanceTransaction))),
  created: Schema.Number,
  currency: Schema.String,
  description: Schema.NullOr(Schema.String),
  expected_availability_date: Schema.NullOr(Schema.Number),
  failure_code: Schema.NullOr(Schema.String),
  failure_message: Schema.NullOr(Schema.String),
  id: Schema.String,
  livemode: Schema.Boolean,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  object: Schema.Literal("topup"),
  source: Schema.NullOr(Schema.suspend((): typeof Models.Source => Models.Source)),
  statement_descriptor: Schema.NullOr(Schema.String),
  status: Schema.Literal("canceled", "failed", "pending", "reversed", "succeeded"),
  transfer_group: Schema.NullOr(Schema.String),
})
export type Topup = typeof Topup.Type
