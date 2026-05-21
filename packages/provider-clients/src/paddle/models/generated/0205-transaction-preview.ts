import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPreview = Schema.Struct({
  customer_id: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.CustomerId, any, any> => Models.CustomerId as Schema.Schema<Models.CustomerId, any, any>
    )
  ),
  address_id: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.AddressId, any, any> => Models.AddressId as Schema.Schema<Models.AddressId, any, any>
    )
  ),
  business_id: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.BusinessId, any, any> => Models.BusinessId as Schema.Schema<Models.BusinessId, any, any>
    )
  ),
  currency_code: Schema.suspend(
    (): Schema.Schema<Models.CurrencyCode, any, any> =>
      Models.CurrencyCode as Schema.Schema<Models.CurrencyCode, any, any>
  ),
  discount_id: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.DiscountId, any, any> => Models.DiscountId as Schema.Schema<Models.DiscountId, any, any>
    )
  ),
  customer_ip_address: Schema.NullOr(Schema.String),
  address: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.AddressPreview, any, any> =>
        Models.AddressPreview as Schema.Schema<Models.AddressPreview, any, any>
    )
  ),
  ignore_trials: Schema.Boolean,
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.TransactionPreviewItem, any, any> =>
        Models.TransactionPreviewItem as Schema.Schema<Models.TransactionPreviewItem, any, any>
    )
  ),
  details: Schema.suspend(
    (): Schema.Schema<Models.TransactionPreviewDetails, any, any> =>
      Models.TransactionPreviewDetails as Schema.Schema<Models.TransactionPreviewDetails, any, any>
  ),
  available_payment_methods: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodType, any, any> =>
        Models.PaymentMethodType as Schema.Schema<Models.PaymentMethodType, any, any>
    )
  )
})
export type TransactionPreview = typeof TransactionPreview.Type
