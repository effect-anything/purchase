import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Transaction = Schema.Struct({
  id: Schema.suspend((): Schema.Schema<Models.TransactionId> => Models.TransactionId),
  status: Schema.suspend((): Schema.Schema<Models.TransactionStatus> => Models.TransactionStatus),
  customer_id: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.CustomerId> => Models.CustomerId)),
  address_id: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.AddressId> => Models.AddressId)),
  business_id: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.BusinessId> => Models.BusinessId)),
  custom_data: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.CustomData> => Models.CustomData)),
  currency_code: Schema.suspend((): Schema.Schema<Models.CurrencyCode> => Models.CurrencyCode),
  origin: Schema.suspend((): Schema.Schema<Models.TransactionOrigin> => Models.TransactionOrigin),
  subscription_id: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.SubscriptionId> => Models.SubscriptionId)),
  invoice_id: Schema.NullOr(Schema.String),
  invoice_number: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.DocumentNumber> => Models.DocumentNumber)),
  collection_mode: Schema.suspend((): Schema.Schema<Models.CollectionMode> => Models.CollectionMode),
  discount_id: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.DiscountId> => Models.DiscountId)),
  billing_details: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.BillingDetails> => Models.BillingDetails)),
  billing_period: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.TimePeriod> => Models.TimePeriod)),
  items: Schema.Array(Schema.suspend((): Schema.Schema<Models.TransactionItem> => Models.TransactionItem)),
  details: Schema.suspend((): Schema.Schema<Models.TransactionDetails> => Models.TransactionDetails),
  payments: Schema.Array(
    Schema.suspend((): Schema.Schema<Models.TransactionPaymentAttempt> => Models.TransactionPaymentAttempt)
  ),
  checkout: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.TransactionCheckout> => Models.TransactionCheckout)),
  created_at: Schema.suspend((): Schema.Schema<Models.CreatedAt> => Models.CreatedAt),
  updated_at: Schema.suspend((): Schema.Schema<Models.UpdatedAt> => Models.UpdatedAt),
  billed_at: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.Timestamp> => Models.Timestamp)),
  revised_at: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.Timestamp> => Models.Timestamp))
})
export type Transaction = typeof Transaction.Type
