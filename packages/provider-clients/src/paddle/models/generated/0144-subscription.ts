import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Subscription = Schema.Struct({
  id: Schema.suspend((): Schema.Schema<Models.SubscriptionId> => Models.SubscriptionId),
  status: Schema.suspend((): Schema.Schema<Models.StatusSubscription> => Models.StatusSubscription),
  customer_id: Schema.suspend((): Schema.Schema<Models.CustomerId> => Models.CustomerId),
  address_id: Schema.suspend((): Schema.Schema<Models.AddressId> => Models.AddressId),
  business_id: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.BusinessId> => Models.BusinessId)),
  currency_code: Schema.suspend((): Schema.Schema<Models.CurrencyCode> => Models.CurrencyCode),
  created_at: Schema.suspend((): Schema.Schema<Models.CreatedAt> => Models.CreatedAt),
  updated_at: Schema.suspend((): Schema.Schema<Models.UpdatedAt> => Models.UpdatedAt),
  started_at: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.Timestamp> => Models.Timestamp)),
  first_billed_at: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.Timestamp> => Models.Timestamp)),
  next_billed_at: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.Timestamp> => Models.Timestamp)),
  paused_at: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.Timestamp> => Models.Timestamp)),
  canceled_at: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.Timestamp> => Models.Timestamp)),
  discount: Schema.NullOr(
    Schema.suspend((): Schema.Schema<Models.DiscountSubscription> => Models.DiscountSubscription)
  ),
  collection_mode: Schema.suspend((): Schema.Schema<Models.CollectionMode> => Models.CollectionMode),
  billing_details: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.BillingDetails> => Models.BillingDetails)),
  current_billing_period: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.TimePeriod> => Models.TimePeriod)),
  billing_cycle: Schema.suspend((): Schema.Schema<Models.Duration> => Models.Duration),
  scheduled_change: Schema.NullOr(
    Schema.suspend((): Schema.Schema<Models.SubscriptionScheduledChange> => Models.SubscriptionScheduledChange)
  ),
  management_urls: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionManagementUrls> => Models.SubscriptionManagementUrls
  ),
  items: Schema.Array(Schema.suspend((): Schema.Schema<Models.ItemSubscription> => Models.ItemSubscription)),
  custom_data: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.CustomData> => Models.CustomData)),
  import_meta: Schema.NullOr(
    Schema.suspend((): Schema.Schema<Models.ImportMetaSubscription> => Models.ImportMetaSubscription)
  )
})
export type Subscription = typeof Subscription.Type
