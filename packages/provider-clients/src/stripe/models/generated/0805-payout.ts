import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type Payout = {
  readonly amount: number
  readonly application_fee: string | Models.ApplicationFee | null
  readonly application_fee_amount: number | null
  readonly arrival_date: number
  readonly automatic: boolean
  readonly balance_transaction: string | Models.BalanceTransaction | null
  readonly created: number
  readonly currency: string
  readonly description: string | null
  readonly destination: string | Models.ExternalAccount | Models.DeletedExternalAccount | null
  readonly failure_balance_transaction: string | Models.BalanceTransaction | null
  readonly failure_code: string | null
  readonly failure_message: string | null
  readonly id: string
  readonly livemode: boolean
  readonly metadata: Readonly<Record<string, string>> | null
  readonly method: string
  readonly object: "payout"
  readonly original_payout: string | Models.Payout | null
  readonly payout_method: string | null
  readonly reconciliation_status: "completed" | "in_progress" | "not_applicable"
  readonly reversed_by: string | Models.Payout | null
  readonly source_type: string
  readonly statement_descriptor: string | null
  readonly status: string
  readonly trace_id: Models.PayoutsTraceId | null
  readonly type: "bank_account" | "card"
}

export const Payout = Schema.Struct({
  amount: Schema.Number,
  application_fee: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.ApplicationFee, any, any> =>
          Models.ApplicationFee as Schema.Schema<Models.ApplicationFee, any, any>
      )
    )
  ),
  application_fee_amount: Schema.NullOr(Schema.Number),
  arrival_date: Schema.Number,
  automatic: Schema.Boolean,
  balance_transaction: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.BalanceTransaction, any, any> =>
          Models.BalanceTransaction as Schema.Schema<Models.BalanceTransaction, any, any>
      )
    )
  ),
  created: Schema.Number,
  currency: Schema.String,
  description: Schema.NullOr(Schema.String),
  destination: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.ExternalAccount, any, any> =>
          Models.ExternalAccount as Schema.Schema<Models.ExternalAccount, any, any>
      ),
      Schema.suspend(
        (): Schema.Schema<Models.DeletedExternalAccount, any, any> =>
          Models.DeletedExternalAccount as Schema.Schema<Models.DeletedExternalAccount, any, any>
      )
    )
  ),
  failure_balance_transaction: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.BalanceTransaction, any, any> =>
          Models.BalanceTransaction as Schema.Schema<Models.BalanceTransaction, any, any>
      )
    )
  ),
  failure_code: Schema.NullOr(Schema.String),
  failure_message: Schema.NullOr(Schema.String),
  id: Schema.String,
  livemode: Schema.Boolean,
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  method: Schema.String,
  object: Schema.Literal("payout"),
  original_payout: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Payout, any, any> => Models.Payout as Schema.Schema<Models.Payout, any, any>
      )
    )
  ),
  payout_method: Schema.NullOr(Schema.String),
  reconciliation_status: Schema.Literal("completed", "in_progress", "not_applicable"),
  reversed_by: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Payout, any, any> => Models.Payout as Schema.Schema<Models.Payout, any, any>
      )
    )
  ),
  source_type: Schema.String,
  statement_descriptor: Schema.NullOr(Schema.String),
  status: Schema.String,
  trace_id: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PayoutsTraceId, any, any> =>
        Models.PayoutsTraceId as Schema.Schema<Models.PayoutsTraceId, any, any>
    )
  ),
  type: Schema.Literal("bank_account", "card")
})
