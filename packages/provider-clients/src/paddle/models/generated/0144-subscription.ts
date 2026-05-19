import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Subscription = Schema.Struct({
  id: Schema.suspend(() => Models.SubscriptionId),
  status: Schema.suspend(() => Models.StatusSubscription),
  customer_id: Schema.suspend(() => Models.CustomerId),
  address_id: Schema.suspend(() => Models.AddressId),
  business_id: Schema.NullOr(Schema.suspend(() => Models.BusinessId)),
  currency_code: Schema.suspend(() => Models.CurrencyCode),
  created_at: Schema.suspend(() => Models.CreatedAt),
  updated_at: Schema.suspend(() => Models.UpdatedAt),
  started_at: Schema.NullOr(Schema.suspend(() => Models.Timestamp)),
  first_billed_at: Schema.NullOr(Schema.suspend(() => Models.Timestamp)),
  next_billed_at: Schema.NullOr(Schema.suspend(() => Models.Timestamp)),
  paused_at: Schema.NullOr(Schema.suspend(() => Models.Timestamp)),
  canceled_at: Schema.NullOr(Schema.suspend(() => Models.Timestamp)),
  discount: Schema.NullOr(Schema.suspend(() => Models.DiscountSubscription)),
  collection_mode: Schema.suspend(() => Models.CollectionMode),
  billing_details: Schema.NullOr(Schema.suspend(() => Models.BillingDetails)),
  current_billing_period: Schema.NullOr(Schema.suspend(() => Models.TimePeriod)),
  billing_cycle: Schema.suspend(() => Models.Duration),
  scheduled_change: Schema.NullOr(Schema.suspend(() => Models.SubscriptionScheduledChange)),
  management_urls: Schema.suspend(() => Models.SubscriptionManagementUrls),
  items: Schema.Array(Schema.suspend(() => Models.ItemSubscription)),
  custom_data: Schema.NullOr(Schema.suspend(() => Models.CustomData)),
  import_meta: Schema.NullOr(Schema.suspend(() => Models.ImportMetaSubscription)),
})
export type Subscription = typeof Subscription.Type
