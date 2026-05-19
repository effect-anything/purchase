import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionPreview = Schema.Struct({
  customer_id: Schema.NullOr(Schema.suspend(() => Models.CustomerId)),
  address_id: Schema.NullOr(Schema.suspend(() => Models.AddressId)),
  business_id: Schema.NullOr(Schema.suspend(() => Models.BusinessId)),
  currency_code: Schema.suspend(() => Models.CurrencyCode),
  discount_id: Schema.NullOr(Schema.suspend(() => Models.DiscountId)),
  customer_ip_address: Schema.NullOr(Schema.String),
  address: Schema.NullOr(Schema.suspend(() => Models.AddressPreview)),
  ignore_trials: Schema.Boolean,
  items: Schema.Array(Schema.suspend(() => Models.TransactionPreviewItem)),
  details: Schema.suspend(() => Models.TransactionPreviewDetails),
  available_payment_methods: Schema.Array(Schema.suspend(() => Models.PaymentMethodType)),
})
export type TransactionPreview = typeof TransactionPreview.Type
