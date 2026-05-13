import * as Schema from "effect/Schema"

/**
 * App-owned customer identifier. This is safe for public API contracts and
 * should not be confused with provider-native customer ids.
 */
export const CustomerId = Schema.NonEmptyString.pipe(
  Schema.brand("CustomerId"),
  Schema.annotations({
    description: "Application customer unique identifier"
  })
)
export type CustomerId = typeof CustomerId.Type

export const CustomerEmail = Schema.String.pipe(
  Schema.compose(Schema.Lowercase),
  Schema.brand("CustomerEmail"),
  Schema.annotations({
    description: "Customer email address"
  })
)
export type CustomerEmail = typeof CustomerEmail.Type

export const BillingPortalFlow = Schema.Literal(
  "general",
  "payment_method_update",
  "subscription_cancel",
  "subscription_update"
)
export type BillingPortalFlow = typeof BillingPortalFlow.Type

export const SubscriptionMutationMode = Schema.Literal("billing_collection", "lifecycle")
export type SubscriptionMutationMode = typeof SubscriptionMutationMode.Type

export const SubscriptionCancelTiming = Schema.Literal("immediately", "period_end")
export type SubscriptionCancelTiming = typeof SubscriptionCancelTiming.Type

export const SubscriptionChangeProrationMode = Schema.Literal("provider_default", "immediate", "none", "period_end")
export type SubscriptionChangeProrationMode = typeof SubscriptionChangeProrationMode.Type

export const SubscriptionPreviewProrationMode = Schema.Literal("immediate", "none", "period_end")
export type SubscriptionPreviewProrationMode = typeof SubscriptionPreviewProrationMode.Type
