import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingTransaction = Schema.Struct({
  amount: Schema.Number,
  amount_details: Schema.NullOr(Schema.suspend((): typeof Models.IssuingTransactionAmountDetails => Models.IssuingTransactionAmountDetails)),
  authorization: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.IssuingAuthorization => Models.IssuingAuthorization))),
  balance_transaction: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.BalanceTransaction => Models.BalanceTransaction))),
  card: Schema.Union(Schema.String, Schema.suspend((): typeof Models.IssuingCard => Models.IssuingCard)),
  cardholder: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.IssuingCardholder => Models.IssuingCardholder))),
  created: Schema.Number,
  currency: Schema.String,
  dispute: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.IssuingDispute => Models.IssuingDispute))),
  id: Schema.String,
  livemode: Schema.Boolean,
  merchant_amount: Schema.Number,
  merchant_currency: Schema.String,
  merchant_data: Schema.suspend((): typeof Models.IssuingAuthorizationMerchantData => Models.IssuingAuthorizationMerchantData),
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  network_data: Schema.NullOr(Schema.suspend((): typeof Models.IssuingTransactionNetworkData => Models.IssuingTransactionNetworkData)),
  object: Schema.Literal("issuing.transaction"),
  purchase_details: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.IssuingTransactionPurchaseDetails => Models.IssuingTransactionPurchaseDetails))),
  token: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.IssuingToken => Models.IssuingToken)))),
  treasury: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.IssuingTransactionTreasury => Models.IssuingTransactionTreasury))),
  type: Schema.Literal("capture", "refund"),
  wallet: Schema.NullOr(Schema.Literal("apple_pay", "google_pay", "samsung_pay")),
})
export type IssuingTransaction = typeof IssuingTransaction.Type
