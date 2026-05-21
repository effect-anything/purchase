import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionIncludes = Schema.Struct({
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
  revised_at: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.Timestamp> => Models.Timestamp)),
  address: Schema.optional(Schema.suspend((): Schema.Schema<Models.Address> => Models.Address)),
  adjustments: Schema.optional(Schema.Array(Schema.suspend((): Schema.Schema<Models.Adjustment> => Models.Adjustment))),
  adjustments_totals: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.TransactionAdjustmentsTotalsInclude> => Models.TransactionAdjustmentsTotalsInclude
    )
  ),
  business: Schema.optional(Schema.suspend((): Schema.Schema<Models.Business> => Models.Business)),
  customer: Schema.optional(Schema.suspend((): Schema.Schema<Models.Customer> => Models.Customer)),
  discount: Schema.optional(Schema.suspend((): Schema.Schema<Models.Discount> => Models.Discount)),
  available_payment_methods: Schema.optional(
    Schema.Array(Schema.suspend((): Schema.Schema<Models.PaymentMethodType> => Models.PaymentMethodType))
  )
})
export type TransactionIncludes = typeof TransactionIncludes.Type
