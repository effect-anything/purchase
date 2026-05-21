import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type Transfer = {
  readonly amount: number
  readonly amount_reversed: number
  readonly balance_transaction: string | Models.BalanceTransaction | null
  readonly created: number
  readonly currency: string
  readonly description: string | null
  readonly destination: string | Models.Account | null
  readonly destination_payment?: string | Models.Charge
  readonly id: string
  readonly livemode: boolean
  readonly metadata: Readonly<Record<string, string>>
  readonly object: "transfer"
  readonly reversals: {
    readonly data: ReadonlyArray<Models.TransferReversal>
    readonly has_more: boolean
    readonly object: "list"
    readonly url: string
  }
  readonly reversed: boolean
  readonly source_transaction: string | Models.Charge | null
  readonly source_type?: string
  readonly transfer_group: string | null
}

export const Transfer = Schema.Struct({
  amount: Schema.Number,
  amount_reversed: Schema.Number,
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
        (): Schema.Schema<Models.Account, any, any> => Models.Account as Schema.Schema<Models.Account, any, any>
      )
    )
  ),
  destination_payment: Schema.optional(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Charge, any, any> => Models.Charge as Schema.Schema<Models.Charge, any, any>
      )
    )
  ),
  id: Schema.String,
  livemode: Schema.Boolean,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  object: Schema.Literal("transfer"),
  reversals: Schema.Struct({
    data: Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.TransferReversal, any, any> =>
          Models.TransferReversal as Schema.Schema<Models.TransferReversal, any, any>
      )
    ),
    has_more: Schema.Boolean,
    object: Schema.Literal("list"),
    url: Schema.String
  }),
  reversed: Schema.Boolean,
  source_transaction: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Charge, any, any> => Models.Charge as Schema.Schema<Models.Charge, any, any>
      )
    )
  ),
  source_type: Schema.optional(Schema.String),
  transfer_group: Schema.NullOr(Schema.String)
})
