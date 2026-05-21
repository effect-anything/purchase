import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type CustomerCashBalanceTransaction = {
  readonly adjusted_for_overdraft?: Models.CustomerBalanceResourceCashBalanceTransactionResourceAdjustedForOverdraft
  readonly applied_to_payment?: Models.CustomerBalanceResourceCashBalanceTransactionResourceAppliedToPaymentTransaction
  readonly created: number
  readonly currency: string
  readonly customer: string | Models.Customer
  readonly customer_account: string | null
  readonly ending_balance: number
  readonly funded?: Models.CustomerBalanceResourceCashBalanceTransactionResourceFundedTransaction
  readonly id: string
  readonly livemode: boolean
  readonly net_amount: number
  readonly object: "customer_cash_balance_transaction"
  readonly refunded_from_payment?: Models.CustomerBalanceResourceCashBalanceTransactionResourceRefundedFromPaymentTransaction
  readonly transferred_to_balance?: Models.CustomerBalanceResourceCashBalanceTransactionResourceTransferredToBalance
  readonly type:
    | "adjusted_for_overdraft"
    | "applied_to_payment"
    | "funded"
    | "funding_reversed"
    | "refunded_from_payment"
    | "return_canceled"
    | "return_initiated"
    | "transferred_to_balance"
    | "unapplied_from_payment"
  readonly unapplied_from_payment?: Models.CustomerBalanceResourceCashBalanceTransactionResourceUnappliedFromPaymentTransaction
}

export const CustomerCashBalanceTransaction = Schema.Struct({
  adjusted_for_overdraft: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CustomerBalanceResourceCashBalanceTransactionResourceAdjustedForOverdraft, any, any> =>
        Models.CustomerBalanceResourceCashBalanceTransactionResourceAdjustedForOverdraft as Schema.Schema<
          Models.CustomerBalanceResourceCashBalanceTransactionResourceAdjustedForOverdraft,
          any,
          any
        >
    )
  ),
  applied_to_payment: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<
        Models.CustomerBalanceResourceCashBalanceTransactionResourceAppliedToPaymentTransaction,
        any,
        any
      > =>
        Models.CustomerBalanceResourceCashBalanceTransactionResourceAppliedToPaymentTransaction as Schema.Schema<
          Models.CustomerBalanceResourceCashBalanceTransactionResourceAppliedToPaymentTransaction,
          any,
          any
        >
    )
  ),
  created: Schema.Number,
  currency: Schema.String,
  customer: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.Customer, any, any> => Models.Customer as Schema.Schema<Models.Customer, any, any>
    )
  ),
  customer_account: Schema.NullOr(Schema.String),
  ending_balance: Schema.Number,
  funded: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CustomerBalanceResourceCashBalanceTransactionResourceFundedTransaction, any, any> =>
        Models.CustomerBalanceResourceCashBalanceTransactionResourceFundedTransaction as Schema.Schema<
          Models.CustomerBalanceResourceCashBalanceTransactionResourceFundedTransaction,
          any,
          any
        >
    )
  ),
  id: Schema.String,
  livemode: Schema.Boolean,
  net_amount: Schema.Number,
  object: Schema.Literal("customer_cash_balance_transaction"),
  refunded_from_payment: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<
        Models.CustomerBalanceResourceCashBalanceTransactionResourceRefundedFromPaymentTransaction,
        any,
        any
      > =>
        Models.CustomerBalanceResourceCashBalanceTransactionResourceRefundedFromPaymentTransaction as Schema.Schema<
          Models.CustomerBalanceResourceCashBalanceTransactionResourceRefundedFromPaymentTransaction,
          any,
          any
        >
    )
  ),
  transferred_to_balance: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CustomerBalanceResourceCashBalanceTransactionResourceTransferredToBalance, any, any> =>
        Models.CustomerBalanceResourceCashBalanceTransactionResourceTransferredToBalance as Schema.Schema<
          Models.CustomerBalanceResourceCashBalanceTransactionResourceTransferredToBalance,
          any,
          any
        >
    )
  ),
  type: Schema.Literal(
    "adjusted_for_overdraft",
    "applied_to_payment",
    "funded",
    "funding_reversed",
    "refunded_from_payment",
    "return_canceled",
    "return_initiated",
    "transferred_to_balance",
    "unapplied_from_payment"
  ),
  unapplied_from_payment: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<
        Models.CustomerBalanceResourceCashBalanceTransactionResourceUnappliedFromPaymentTransaction,
        any,
        any
      > =>
        Models.CustomerBalanceResourceCashBalanceTransactionResourceUnappliedFromPaymentTransaction as Schema.Schema<
          Models.CustomerBalanceResourceCashBalanceTransactionResourceUnappliedFromPaymentTransaction,
          any,
          any
        >
    )
  )
})
