import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type BalanceTransactionSource =
  | Models.ApplicationFee
  | Models.Charge
  | Models.ConnectCollectionTransfer
  | Models.CustomerCashBalanceTransaction
  | Models.Dispute
  | Models.FeeRefund
  | Models.IssuingAuthorization
  | Models.IssuingDispute
  | Models.IssuingTransaction
  | Models.Payout
  | Models.Refund
  | Models.ReserveTransaction
  | Models.TaxDeductedAtSource
  | Models.Topup
  | Models.Transfer
  | Models.TransferReversal

export const BalanceTransactionSource = Schema.Union(
  Schema.suspend(
    (): Schema.Schema<Models.ApplicationFee, any, any> =>
      Models.ApplicationFee as Schema.Schema<Models.ApplicationFee, any, any>
  ),
  Schema.suspend((): Schema.Schema<Models.Charge, any, any> => Models.Charge as Schema.Schema<Models.Charge, any, any>),
  Schema.suspend(
    (): Schema.Schema<Models.ConnectCollectionTransfer, any, any> =>
      Models.ConnectCollectionTransfer as Schema.Schema<Models.ConnectCollectionTransfer, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.CustomerCashBalanceTransaction, any, any> =>
      Models.CustomerCashBalanceTransaction as Schema.Schema<Models.CustomerCashBalanceTransaction, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.Dispute, any, any> => Models.Dispute as Schema.Schema<Models.Dispute, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.FeeRefund, any, any> => Models.FeeRefund as Schema.Schema<Models.FeeRefund, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.IssuingAuthorization, any, any> =>
      Models.IssuingAuthorization as Schema.Schema<Models.IssuingAuthorization, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.IssuingDispute, any, any> =>
      Models.IssuingDispute as Schema.Schema<Models.IssuingDispute, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.IssuingTransaction, any, any> =>
      Models.IssuingTransaction as Schema.Schema<Models.IssuingTransaction, any, any>
  ),
  Schema.suspend((): Schema.Schema<Models.Payout, any, any> => Models.Payout as Schema.Schema<Models.Payout, any, any>),
  Schema.suspend((): Schema.Schema<Models.Refund, any, any> => Models.Refund as Schema.Schema<Models.Refund, any, any>),
  Schema.suspend(
    (): Schema.Schema<Models.ReserveTransaction, any, any> =>
      Models.ReserveTransaction as Schema.Schema<Models.ReserveTransaction, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.TaxDeductedAtSource, any, any> =>
      Models.TaxDeductedAtSource as Schema.Schema<Models.TaxDeductedAtSource, any, any>
  ),
  Schema.suspend((): Schema.Schema<Models.Topup, any, any> => Models.Topup as Schema.Schema<Models.Topup, any, any>),
  Schema.suspend(
    (): Schema.Schema<Models.Transfer, any, any> => Models.Transfer as Schema.Schema<Models.Transfer, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.TransferReversal, any, any> =>
      Models.TransferReversal as Schema.Schema<Models.TransferReversal, any, any>
  )
)
