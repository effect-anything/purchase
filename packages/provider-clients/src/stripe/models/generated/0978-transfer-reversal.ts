import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type TransferReversal = {
  readonly amount: number
  readonly balance_transaction: string | Models.BalanceTransaction | null
  readonly created: number
  readonly currency: string
  readonly destination_payment_refund: string | Models.Refund | null
  readonly id: string
  readonly metadata: Readonly<Record<string, string>> | null
  readonly object: "transfer_reversal"
  readonly source_refund: string | Models.Refund | null
  readonly transfer: string | Models.Transfer
}

export const TransferReversal = Schema.Struct({
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
  destination_payment_refund: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Refund, any, any> => Models.Refund as Schema.Schema<Models.Refund, any, any>
      )
    )
  ),
  id: Schema.String,
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  object: Schema.Literal("transfer_reversal"),
  source_refund: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Refund, any, any> => Models.Refund as Schema.Schema<Models.Refund, any, any>
      )
    )
  ),
  transfer: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.Transfer, any, any> => Models.Transfer as Schema.Schema<Models.Transfer, any, any>
    )
  )
})
