import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type Topup = {
  readonly amount: number
  readonly balance_transaction: string | Models.BalanceTransaction | null
  readonly created: number
  readonly currency: string
  readonly description: string | null
  readonly expected_availability_date: number | null
  readonly failure_code: string | null
  readonly failure_message: string | null
  readonly id: string
  readonly livemode: boolean
  readonly metadata: Readonly<Record<string, string>>
  readonly object: "topup"
  readonly source: Models.Source | null
  readonly statement_descriptor: string | null
  readonly status: "canceled" | "failed" | "pending" | "reversed" | "succeeded"
  readonly transfer_group: string | null
}

export const Topup = Schema.Struct({
  amount: Schema.Number,
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
  expected_availability_date: Schema.NullOr(Schema.Number),
  failure_code: Schema.NullOr(Schema.String),
  failure_message: Schema.NullOr(Schema.String),
  id: Schema.String,
  livemode: Schema.Boolean,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  object: Schema.Literal("topup"),
  source: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Source, any, any> => Models.Source as Schema.Schema<Models.Source, any, any>
    )
  ),
  statement_descriptor: Schema.NullOr(Schema.String),
  status: Schema.Literal("canceled", "failed", "pending", "reversed", "succeeded"),
  transfer_group: Schema.NullOr(Schema.String)
})
