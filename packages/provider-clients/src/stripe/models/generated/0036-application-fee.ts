import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type ApplicationFee = {
  readonly account: string | Models.Account
  readonly amount: number
  readonly amount_refunded: number
  readonly application: string | Models.Application
  readonly balance_transaction: string | Models.BalanceTransaction | null
  readonly charge: string | Models.Charge
  readonly created: number
  readonly currency: string
  readonly fee_source: Models.PlatformEarningFeeSource | null
  readonly id: string
  readonly livemode: boolean
  readonly object: "application_fee"
  readonly originating_transaction: string | Models.Charge | null
  readonly refunded: boolean
  readonly refunds: {
    readonly data: ReadonlyArray<Models.FeeRefund>
    readonly has_more: boolean
    readonly object: "list"
    readonly url: string
  }
}

export const ApplicationFee = Schema.Struct({
  account: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.Account, any, any> => Models.Account as Schema.Schema<Models.Account, any, any>
    )
  ),
  amount: Schema.Number,
  amount_refunded: Schema.Number,
  application: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.Application, any, any> =>
        Models.Application as Schema.Schema<Models.Application, any, any>
    )
  ),
  balance_transaction: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.BalanceTransaction, any, any> =>
          Models.BalanceTransaction as Schema.Schema<Models.BalanceTransaction, any, any>
      )
    )
  ),
  charge: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.Charge, any, any> => Models.Charge as Schema.Schema<Models.Charge, any, any>
    )
  ),
  created: Schema.Number,
  currency: Schema.String,
  fee_source: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PlatformEarningFeeSource, any, any> =>
        Models.PlatformEarningFeeSource as Schema.Schema<Models.PlatformEarningFeeSource, any, any>
    )
  ),
  id: Schema.String,
  livemode: Schema.Boolean,
  object: Schema.Literal("application_fee"),
  originating_transaction: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Charge, any, any> => Models.Charge as Schema.Schema<Models.Charge, any, any>
      )
    )
  ),
  refunded: Schema.Boolean,
  refunds: Schema.Struct({
    data: Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.FeeRefund, any, any> => Models.FeeRefund as Schema.Schema<Models.FeeRefund, any, any>
      )
    ),
    has_more: Schema.Boolean,
    object: Schema.Literal("list"),
    url: Schema.String
  })
})
