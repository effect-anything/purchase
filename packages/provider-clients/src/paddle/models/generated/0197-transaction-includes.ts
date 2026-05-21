import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionIncludes = Schema.Struct({
  id: Schema.suspend(
    (): Schema.Schema<Models.TransactionId, any, any> =>
      Models.TransactionId as Schema.Schema<Models.TransactionId, any, any>
  ),
  status: Schema.suspend(
    (): Schema.Schema<Models.TransactionStatus, any, any> =>
      Models.TransactionStatus as Schema.Schema<Models.TransactionStatus, any, any>
  ),
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
  custom_data: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.CustomData, any, any> => Models.CustomData as Schema.Schema<Models.CustomData, any, any>
    )
  ),
  currency_code: Schema.suspend(
    (): Schema.Schema<Models.CurrencyCode, any, any> =>
      Models.CurrencyCode as Schema.Schema<Models.CurrencyCode, any, any>
  ),
  origin: Schema.suspend(
    (): Schema.Schema<Models.TransactionOrigin, any, any> =>
      Models.TransactionOrigin as Schema.Schema<Models.TransactionOrigin, any, any>
  ),
  subscription_id: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionId, any, any> =>
        Models.SubscriptionId as Schema.Schema<Models.SubscriptionId, any, any>
    )
  ),
  invoice_id: Schema.NullOr(Schema.String),
  invoice_number: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.DocumentNumber, any, any> =>
        Models.DocumentNumber as Schema.Schema<Models.DocumentNumber, any, any>
    )
  ),
  collection_mode: Schema.suspend(
    (): Schema.Schema<Models.CollectionMode, any, any> =>
      Models.CollectionMode as Schema.Schema<Models.CollectionMode, any, any>
  ),
  discount_id: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.DiscountId, any, any> => Models.DiscountId as Schema.Schema<Models.DiscountId, any, any>
    )
  ),
  billing_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.BillingDetails, any, any> =>
        Models.BillingDetails as Schema.Schema<Models.BillingDetails, any, any>
    )
  ),
  billing_period: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.TimePeriod, any, any> => Models.TimePeriod as Schema.Schema<Models.TimePeriod, any, any>
    )
  ),
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.TransactionItem, any, any> =>
        Models.TransactionItem as Schema.Schema<Models.TransactionItem, any, any>
    )
  ),
  details: Schema.suspend(
    (): Schema.Schema<Models.TransactionDetails, any, any> =>
      Models.TransactionDetails as Schema.Schema<Models.TransactionDetails, any, any>
  ),
  payments: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.TransactionPaymentAttempt, any, any> =>
        Models.TransactionPaymentAttempt as Schema.Schema<Models.TransactionPaymentAttempt, any, any>
    )
  ),
  checkout: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.TransactionCheckout, any, any> =>
        Models.TransactionCheckout as Schema.Schema<Models.TransactionCheckout, any, any>
    )
  ),
  created_at: Schema.suspend(
    (): Schema.Schema<Models.CreatedAt, any, any> => Models.CreatedAt as Schema.Schema<Models.CreatedAt, any, any>
  ),
  updated_at: Schema.suspend(
    (): Schema.Schema<Models.UpdatedAt, any, any> => Models.UpdatedAt as Schema.Schema<Models.UpdatedAt, any, any>
  ),
  billed_at: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Timestamp, any, any> => Models.Timestamp as Schema.Schema<Models.Timestamp, any, any>
    )
  ),
  revised_at: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Timestamp, any, any> => Models.Timestamp as Schema.Schema<Models.Timestamp, any, any>
    )
  ),
  address: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.Address, any, any> => Models.Address as Schema.Schema<Models.Address, any, any>
    )
  ),
  adjustments: Schema.optional(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.Adjustment, any, any> =>
          Models.Adjustment as Schema.Schema<Models.Adjustment, any, any>
      )
    )
  ),
  adjustments_totals: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.TransactionAdjustmentsTotalsInclude, any, any> =>
        Models.TransactionAdjustmentsTotalsInclude as Schema.Schema<
          Models.TransactionAdjustmentsTotalsInclude,
          any,
          any
        >
    )
  ),
  business: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.Business, any, any> => Models.Business as Schema.Schema<Models.Business, any, any>
    )
  ),
  customer: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.Customer, any, any> => Models.Customer as Schema.Schema<Models.Customer, any, any>
    )
  ),
  discount: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.Discount, any, any> => Models.Discount as Schema.Schema<Models.Discount, any, any>
    )
  ),
  available_payment_methods: Schema.optional(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.PaymentMethodType, any, any> =>
          Models.PaymentMethodType as Schema.Schema<Models.PaymentMethodType, any, any>
      )
    )
  )
})
export type TransactionIncludes = typeof TransactionIncludes.Type
