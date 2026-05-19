import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Payout = Schema.Struct({
  amount: Schema.Number,
  application_fee: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.ApplicationFee => Models.ApplicationFee))),
  application_fee_amount: Schema.NullOr(Schema.Number),
  arrival_date: Schema.Number,
  automatic: Schema.Boolean,
  balance_transaction: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.BalanceTransaction => Models.BalanceTransaction))),
  created: Schema.Number,
  currency: Schema.String,
  description: Schema.NullOr(Schema.String),
  destination: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.ExternalAccount => Models.ExternalAccount), Schema.suspend((): typeof Models.DeletedExternalAccount => Models.DeletedExternalAccount))),
  failure_balance_transaction: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.BalanceTransaction => Models.BalanceTransaction))),
  failure_code: Schema.NullOr(Schema.String),
  failure_message: Schema.NullOr(Schema.String),
  id: Schema.String,
  livemode: Schema.Boolean,
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  method: Schema.String,
  object: Schema.Literal("payout"),
  original_payout: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Payout => Models.Payout))),
  payout_method: Schema.NullOr(Schema.String),
  reconciliation_status: Schema.Literal("completed", "in_progress", "not_applicable"),
  reversed_by: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Payout => Models.Payout))),
  source_type: Schema.String,
  statement_descriptor: Schema.NullOr(Schema.String),
  status: Schema.String,
  trace_id: Schema.NullOr(Schema.suspend((): typeof Models.PayoutsTraceId => Models.PayoutsTraceId)),
  type: Schema.Literal("bank_account", "card"),
})
export type Payout = typeof Payout.Type
