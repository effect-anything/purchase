import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionIncludes = Schema.Struct({
  id: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionId, any, any> =>
      Models.SubscriptionId as Schema.Schema<Models.SubscriptionId, any, any>
  ),
  status: Schema.suspend(
    (): Schema.Schema<Models.StatusSubscription, any, any> =>
      Models.StatusSubscription as Schema.Schema<Models.StatusSubscription, any, any>
  ),
  customer_id: Schema.suspend(
    (): Schema.Schema<Models.CustomerId, any, any> => Models.CustomerId as Schema.Schema<Models.CustomerId, any, any>
  ),
  address_id: Schema.suspend(
    (): Schema.Schema<Models.AddressId, any, any> => Models.AddressId as Schema.Schema<Models.AddressId, any, any>
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
  created_at: Schema.suspend(
    (): Schema.Schema<Models.CreatedAt, any, any> => Models.CreatedAt as Schema.Schema<Models.CreatedAt, any, any>
  ),
  updated_at: Schema.suspend(
    (): Schema.Schema<Models.UpdatedAt, any, any> => Models.UpdatedAt as Schema.Schema<Models.UpdatedAt, any, any>
  ),
  started_at: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Timestamp, any, any> => Models.Timestamp as Schema.Schema<Models.Timestamp, any, any>
    )
  ),
  first_billed_at: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Timestamp, any, any> => Models.Timestamp as Schema.Schema<Models.Timestamp, any, any>
    )
  ),
  next_billed_at: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Timestamp, any, any> => Models.Timestamp as Schema.Schema<Models.Timestamp, any, any>
    )
  ),
  paused_at: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Timestamp, any, any> => Models.Timestamp as Schema.Schema<Models.Timestamp, any, any>
    )
  ),
  canceled_at: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Timestamp, any, any> => Models.Timestamp as Schema.Schema<Models.Timestamp, any, any>
    )
  ),
  discount: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.DiscountSubscription, any, any> =>
        Models.DiscountSubscription as Schema.Schema<Models.DiscountSubscription, any, any>
    )
  ),
  collection_mode: Schema.suspend(
    (): Schema.Schema<Models.CollectionMode, any, any> =>
      Models.CollectionMode as Schema.Schema<Models.CollectionMode, any, any>
  ),
  billing_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.BillingDetails, any, any> =>
        Models.BillingDetails as Schema.Schema<Models.BillingDetails, any, any>
    )
  ),
  current_billing_period: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.TimePeriod, any, any> => Models.TimePeriod as Schema.Schema<Models.TimePeriod, any, any>
    )
  ),
  billing_cycle: Schema.suspend(
    (): Schema.Schema<Models.Duration, any, any> => Models.Duration as Schema.Schema<Models.Duration, any, any>
  ),
  scheduled_change: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionScheduledChange, any, any> =>
        Models.SubscriptionScheduledChange as Schema.Schema<Models.SubscriptionScheduledChange, any, any>
    )
  ),
  management_urls: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionManagementUrls, any, any> =>
      Models.SubscriptionManagementUrls as Schema.Schema<Models.SubscriptionManagementUrls, any, any>
  ),
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.ItemSubscription, any, any> =>
        Models.ItemSubscription as Schema.Schema<Models.ItemSubscription, any, any>
    )
  ),
  custom_data: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.CustomData, any, any> => Models.CustomData as Schema.Schema<Models.CustomData, any, any>
    )
  ),
  import_meta: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ImportMetaSubscription, any, any> =>
        Models.ImportMetaSubscription as Schema.Schema<Models.ImportMetaSubscription, any, any>
    )
  ),
  next_transaction: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.SubscriptionNextTransaction, any, any> =>
          Models.SubscriptionNextTransaction as Schema.Schema<Models.SubscriptionNextTransaction, any, any>
      )
    )
  ),
  recurring_transaction_details: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.TransactionPreviewDetails, any, any> =>
        Models.TransactionPreviewDetails as Schema.Schema<Models.TransactionPreviewDetails, any, any>
    )
  )
})
export type SubscriptionIncludes = typeof SubscriptionIncludes.Type
