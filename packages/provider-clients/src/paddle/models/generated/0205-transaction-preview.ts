import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPreview = Schema.Struct({
  customer_id: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.CustomerId> => Models.CustomerId)),
  address_id: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.AddressId> => Models.AddressId)),
  business_id: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.BusinessId> => Models.BusinessId)),
  currency_code: Schema.suspend((): Schema.Schema<Models.CurrencyCode> => Models.CurrencyCode),
  discount_id: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.DiscountId> => Models.DiscountId)),
  customer_ip_address: Schema.NullOr(Schema.String),
  address: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.AddressPreview> => Models.AddressPreview)),
  ignore_trials: Schema.Boolean,
  items: Schema.Array(
    Schema.suspend((): Schema.Schema<Models.TransactionPreviewItem> => Models.TransactionPreviewItem)
  ),
  details: Schema.suspend((): Schema.Schema<Models.TransactionPreviewDetails> => Models.TransactionPreviewDetails),
  available_payment_methods: Schema.Array(
    Schema.suspend((): Schema.Schema<Models.PaymentMethodType> => Models.PaymentMethodType)
  )
})
export type TransactionPreview = typeof TransactionPreview.Type
