export interface ProviderWebhookEvent {
  readonly eventType: string
  readonly captureEvent?: string | undefined
  readonly captureStrategy?: "default" | "stripe-subscription-resumed" | "paddle-subscription-resumed" | undefined
  readonly captureSimulationType?: string | undefined
}

export const stripePrimaryWebhookEvent = "checkout.session.completed"

export const stripeWebhookEvents: ReadonlyArray<ProviderWebhookEvent> = [
  { eventType: "checkout.session.completed" },
  { eventType: "customer.updated" },
  { eventType: "customer.subscription.created" },
  { eventType: "customer.subscription.paused" },
  { eventType: "customer.subscription.resumed", captureStrategy: "stripe-subscription-resumed" },
  { eventType: "customer.subscription.updated" },
  { eventType: "customer.subscription.deleted" },
  { eventType: "invoice.paid" },
  { eventType: "invoice.payment_failed" },
  { eventType: "charge.refunded" },
  { eventType: "refund.updated" },
  { eventType: "payment_intent.created" }
] as const

export const paddlePrimaryWebhookEvent = "transaction.paid"

export const paddleWebhookEvents: ReadonlyArray<ProviderWebhookEvent> = [
  { eventType: "customer.created" },
  { eventType: "customer.updated" },
  { eventType: "subscription.created" },
  { eventType: "subscription.paused" },
  {
    eventType: "subscription.resumed",
    captureStrategy: "paddle-subscription-resumed",
    captureSimulationType: "subscription_resume"
  },
  {
    eventType: "subscription.updated",
    captureStrategy: "paddle-subscription-resumed",
    captureSimulationType: "subscription_resume"
  },
  { eventType: "subscription.canceled" },
  {
    eventType: "transaction.created",
    captureStrategy: "paddle-subscription-resumed",
    captureSimulationType: "subscription_resume"
  },
  {
    eventType: "transaction.billed",
    captureStrategy: "paddle-subscription-resumed",
    captureSimulationType: "subscription_resume"
  },
  {
    eventType: "transaction.paid",
    captureStrategy: "paddle-subscription-resumed",
    captureSimulationType: "subscription_resume"
  },
  {
    eventType: "transaction.completed",
    captureStrategy: "paddle-subscription-resumed",
    captureSimulationType: "subscription_resume"
  },
  { eventType: "transaction.payment_failed" },
  { eventType: "adjustment.created" },
  { eventType: "adjustment.updated" }
] as const
