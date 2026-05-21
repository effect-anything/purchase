import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type FeeRefund = {
  readonly amount: number
  readonly balance_transaction: string | Models.BalanceTransaction | null
  readonly created: number
  readonly currency: string
  readonly fee: string | Models.ApplicationFee
  readonly id: string
  readonly metadata: Readonly<Record<string, string>> | null
  readonly object: "fee_refund"
}

export const FeeRefund = Schema.Struct({
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
  fee: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.ApplicationFee, any, any> =>
        Models.ApplicationFee as Schema.Schema<Models.ApplicationFee, any, any>
    )
  ),
  id: Schema.String,
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  object: Schema.Literal("fee_refund")
})
