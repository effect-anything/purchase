import * as Schema from "effect/Schema"

import { PaymentEnvironmentTag, PaymentProviderTag } from "../provider/types.ts"
import { BillingPortalFlow } from "./common-schema.ts"

/**
 * Start and end timestamps for a preview billing period.
 */
export const PreviewBillingPeriod = Schema.Struct({
  startsAt: Schema.Date,
  endsAt: Schema.Date
})

/**
 * Item included in a subscription change preview.
 */
export const SubscriptionChangePreviewItem = Schema.Struct({
  priceId: Schema.String,
  productId: Schema.String,
  quantity: Schema.Number
})

/**
 * Charge line item returned by a subscription change preview.
 */
export const SubscriptionChangePreviewChargeLineItem = Schema.Struct({
  priceId: Schema.String,
  productId: Schema.String,
  quantity: Schema.Number,
  amount: Schema.String,
  currencyCode: Schema.String,
  description: Schema.String,
  billingPeriod: Schema.optionalWith(PreviewBillingPeriod, { exact: true, nullable: true })
})

/**
 * Charge summary returned by a subscription change preview.
 */
export const SubscriptionChangePreviewCharge = Schema.Struct({
  subtotal: Schema.String,
  tax: Schema.String,
  total: Schema.String,
  currencyCode: Schema.String,
  billingPeriod: Schema.optionalWith(PreviewBillingPeriod, { exact: true, nullable: true }),
  lineItems: Schema.Array(SubscriptionChangePreviewChargeLineItem)
})

/**
 * Provider-normalized preview of a subscription change.
 */
export class SubscriptionChangePreview extends Schema.Class<SubscriptionChangePreview>(
  "@pay/core/SubscriptionChangePreview"
)({
  subscriptionId: Schema.String,
  currencyCode: Schema.String,
  items: Schema.Array(SubscriptionChangePreviewItem),
  immediateCharge: Schema.optionalWith(SubscriptionChangePreviewCharge, { exact: true, nullable: true }),
  nextCharge: Schema.optionalWith(SubscriptionChangePreviewCharge, { exact: true, nullable: true }),
  recurringCharge: Schema.optionalWith(SubscriptionChangePreviewCharge, { exact: true, nullable: true })
}) {
  static decode = Schema.decode(SubscriptionChangePreview)
}

/**
 * Hosted billing portal session returned by a provider.
 */
export class BillingPortalSession extends Schema.Class<BillingPortalSession>("@pay/core/BillingPortalSession")({
  id: Schema.String,
  flow: BillingPortalFlow,
  provider: PaymentProviderTag,
  environment: PaymentEnvironmentTag,
  providerCustomerId: Schema.String,
  providerSubscriptionId: Schema.optionalWith(Schema.String, { exact: true, nullable: true }),
  url: Schema.String,
  createdAt: Schema.Date
}) {
  static decode = Schema.decode(BillingPortalSession)
}
