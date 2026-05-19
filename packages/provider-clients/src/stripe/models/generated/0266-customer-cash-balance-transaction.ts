import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerCashBalanceTransaction = Schema.Struct({
  adjusted_for_overdraft: Schema.optional(Schema.suspend((): typeof Models.CustomerBalanceResourceCashBalanceTransactionResourceAdjustedForOverdraft => Models.CustomerBalanceResourceCashBalanceTransactionResourceAdjustedForOverdraft)),
  applied_to_payment: Schema.optional(Schema.suspend((): typeof Models.CustomerBalanceResourceCashBalanceTransactionResourceAppliedToPaymentTransaction => Models.CustomerBalanceResourceCashBalanceTransactionResourceAppliedToPaymentTransaction)),
  created: Schema.Number,
  currency: Schema.String,
  customer: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Customer => Models.Customer)),
  customer_account: Schema.NullOr(Schema.String),
  ending_balance: Schema.Number,
  funded: Schema.optional(Schema.suspend((): typeof Models.CustomerBalanceResourceCashBalanceTransactionResourceFundedTransaction => Models.CustomerBalanceResourceCashBalanceTransactionResourceFundedTransaction)),
  id: Schema.String,
  livemode: Schema.Boolean,
  net_amount: Schema.Number,
  object: Schema.Literal("customer_cash_balance_transaction"),
  refunded_from_payment: Schema.optional(Schema.suspend((): typeof Models.CustomerBalanceResourceCashBalanceTransactionResourceRefundedFromPaymentTransaction => Models.CustomerBalanceResourceCashBalanceTransactionResourceRefundedFromPaymentTransaction)),
  transferred_to_balance: Schema.optional(Schema.suspend((): typeof Models.CustomerBalanceResourceCashBalanceTransactionResourceTransferredToBalance => Models.CustomerBalanceResourceCashBalanceTransactionResourceTransferredToBalance)),
  type: Schema.Literal("adjusted_for_overdraft", "applied_to_payment", "funded", "funding_reversed", "refunded_from_payment", "return_canceled", "return_initiated", "transferred_to_balance", "unapplied_from_payment"),
  unapplied_from_payment: Schema.optional(Schema.suspend((): typeof Models.CustomerBalanceResourceCashBalanceTransactionResourceUnappliedFromPaymentTransaction => Models.CustomerBalanceResourceCashBalanceTransactionResourceUnappliedFromPaymentTransaction)),
})
export type CustomerCashBalanceTransaction = typeof CustomerCashBalanceTransaction.Type
