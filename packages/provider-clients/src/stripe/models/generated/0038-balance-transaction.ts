import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BalanceTransaction = Schema.Struct({
  amount: Schema.Number,
  available_on: Schema.Number,
  balance_type: Schema.Literal("issuing", "payments", "refund_and_dispute_prefunding", "risk_reserved"),
  created: Schema.Number,
  currency: Schema.String,
  description: Schema.NullOr(Schema.String),
  exchange_rate: Schema.NullOr(Schema.Number),
  fee: Schema.Number,
  fee_details: Schema.Array(Schema.suspend((): typeof Models.Fee => Models.Fee)),
  id: Schema.String,
  net: Schema.Number,
  object: Schema.Literal("balance_transaction"),
  reporting_category: Schema.String,
  source: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.BalanceTransactionSource => Models.BalanceTransactionSource))),
  status: Schema.String,
  type: Schema.Literal("adjustment", "advance", "advance_funding", "anticipation_repayment", "application_fee", "application_fee_refund", "charge", "climate_order_purchase", "climate_order_refund", "connect_collection_transfer", "contribution", "fee_credit_funding", "inbound_transfer", "inbound_transfer_reversal", "issuing_authorization_hold", "issuing_authorization_release", "issuing_dispute", "issuing_transaction", "obligation_outbound", "obligation_reversal_inbound", "payment", "payment_failure_refund", "payment_network_reserve_hold", "payment_network_reserve_release", "payment_refund", "payment_reversal", "payment_unreconciled", "payout", "payout_cancel", "payout_failure", "payout_minimum_balance_hold", "payout_minimum_balance_release", "refund", "refund_failure", "reserve_hold", "reserve_release", "reserve_transaction", "reserved_funds", "stripe_balance_payment_debit", "stripe_balance_payment_debit_reversal", "stripe_fee", "stripe_fx_fee", "tax_fee", "topup", "topup_reversal", "transfer", "transfer_cancel", "transfer_failure", "transfer_refund"),
})
export type BalanceTransaction = typeof BalanceTransaction.Type
