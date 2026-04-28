import { Stripe } from "stripe"

import { loadGeneratedWebhookFixture } from "../support/generated-fixture.ts"
import { stripePrimaryWebhookEvent } from "../support/provider-events.ts"

const stripe = new Stripe("sk_test_fixture")
const generatedWebhookFixture = loadGeneratedWebhookFixture("stripe", stripePrimaryWebhookEvent)

const createdAt = 1_718_000_000
const periodStart = 1_718_000_000
const periodEnd = 1_720_592_000

export const stripeWebhookSecret = generatedWebhookFixture?.webhookSecret ?? "whsec_fixture_secret"

const defaultStripeWebhookEvent = {
  id: "evt_fixture_checkout_completed",
  object: "event",
  api_version: "2025-03-31",
  created: createdAt,
  data: {
    object: {
      id: "cs_test_fixture",
      object: "checkout.session",
      customer: "cus_fixture_123",
      mode: "subscription",
      status: "complete",
      subscription: "sub_fixture_123",
      invoice: "in_fixture_123",
      payment_status: "paid",
      url: "https://checkout.stripe.com/c/pay/cs_test_fixture"
    }
  },
  livemode: false,
  pending_webhooks: 1,
  request: {
    id: "req_fixture_123",
    idempotency_key: null
  },
  type: stripePrimaryWebhookEvent
} as const

export const stripeWebhookPayload = generatedWebhookFixture?.payload ?? JSON.stringify(defaultStripeWebhookEvent)
export const stripeWebhookEvent = JSON.parse(stripeWebhookPayload)

export const stripeWebhookSignature = stripe.webhooks.generateTestHeaderString({
  payload: stripeWebhookPayload,
  secret: stripeWebhookSecret,
  timestamp: Math.floor(Date.now() / 1000)
} as any)

export const stripeProductFixture = {
  id: "prod_fixture_pro",
  object: "product",
  active: true,
  created: createdAt,
  default_price: "price_fixture_pro_monthly",
  description: "Pro plan with monthly billing",
  images: [],
  livemode: false,
  marketing_features: [],
  metadata: {
    projectId: "proj_fixture"
  },
  name: "Pro",
  package_dimensions: null,
  shippable: null,
  type: "service",
  updated: createdAt,
  url: null
} as unknown as Stripe.Product

export const stripePriceFixture = {
  id: "price_fixture_pro_monthly",
  object: "price",
  active: true,
  billing_scheme: "per_unit",
  created: createdAt,
  currency: "usd",
  custom_unit_amount: null,
  livemode: false,
  lookup_key: "pro_monthly",
  metadata: {
    projectId: "proj_fixture"
  },
  nickname: "Pro Monthly",
  product: stripeProductFixture,
  recurring: {
    interval: "month",
    interval_count: 1,
    meter: null,
    trial_period_days: 7,
    usage_type: "licensed"
  },
  tax_behavior: "exclusive",
  tiers_mode: null,
  transform_quantity: null,
  type: "recurring",
  unit_amount: 1500,
  unit_amount_decimal: "1500"
} as unknown as Stripe.Price

export const stripeAnnualPriceFixture = {
  ...stripePriceFixture,
  id: "price_fixture_pro_annual",
  lookup_key: "pro_annual",
  nickname: "Pro Annual",
  recurring: {
    interval: "year",
    interval_count: 1,
    meter: null,
    trial_period_days: 14,
    usage_type: "licensed"
  },
  unit_amount: 15000,
  unit_amount_decimal: "15000"
} as unknown as Stripe.Price

export const stripeOneTimePriceFixture = {
  ...stripePriceFixture,
  id: "price_fixture_setup",
  nickname: "Setup Fee",
  recurring: null,
  type: "one_time",
  unit_amount: 5000,
  unit_amount_decimal: "5000"
} as unknown as Stripe.Price

export const stripeCustomerFixture = {
  id: "cus_fixture_123",
  object: "customer",
  balance: 0,
  created: createdAt,
  currency: "usd",
  default_source: null,
  description: null,
  email: "jane@example.com",
  invoice_settings: {
    custom_fields: null,
    default_payment_method: null,
    footer: null,
    rendering_options: null
  },
  livemode: false,
  metadata: {
    userId: "user_fixture_123"
  },
  name: "Jane Doe",
  shipping: null
} as unknown as Stripe.Customer

export const stripeSubscriptionFixture = {
  id: "sub_fixture_123",
  object: "subscription",
  cancel_at_period_end: false,
  canceled_at: null,
  created: createdAt,
  currency: "usd",
  customer: stripeCustomerFixture.id,
  description: "Pro subscription",
  items: {
    data: [
      {
        id: "si_fixture_123",
        object: "subscription_item",
        current_period_end: periodEnd,
        current_period_start: periodStart,
        price: stripePriceFixture,
        quantity: 1
      }
    ]
  },
  latest_invoice: "in_fixture_123",
  metadata: {
    projectId: "proj_fixture"
  },
  start_date: createdAt,
  status: "active",
  trial_end: null
} as unknown as Stripe.Subscription

export const stripeInvoiceFixture = {
  id: "in_fixture_123",
  object: "invoice",
  billing_reason: "subscription_cycle",
  collection_method: "charge_automatically",
  created: createdAt,
  currency: "usd",
  description: "Pro monthly invoice",
  discounts: [],
  due_date: null,
  hosted_invoice_url: null,
  invoice_pdf: "https://pay.stripe.com/invoice/acct_fixture/in_fixture_123/pdf",
  number: "INV-STRIPE-123",
  lines: {
    data: [
      {
        id: "il_fixture_123",
        object: "line_item",
        amount: 1500,
        currency: "usd",
        description: "Pro Monthly",
        pricing: {
          type: "price_details",
          price_details: {
            price: stripePriceFixture.id,
            product: stripeProductFixture.id
          },
          unit_amount_decimal: "1500"
        },
        quantity: 1
      }
    ]
  },
  period_end: periodEnd,
  period_start: periodStart,
  status: "paid",
  status_transitions: {
    finalized_at: createdAt,
    marked_uncollectible_at: null,
    paid_at: createdAt,
    voided_at: null
  }
} as unknown as Stripe.Invoice

export const stripeCheckoutSessionFixture = {
  id: "cs_fixture_123",
  object: "checkout.session",
  cancel_url: "https://example.com/pay/cancel",
  client_reference_id: stripeCustomerFixture.id,
  customer: stripeCustomerFixture.id,
  customer_creation: null,
  customer_details: null,
  customer_email: stripeCustomerFixture.email,
  expires_at: periodEnd,
  invoice: stripeInvoiceFixture.id,
  livemode: false,
  metadata: {
    projectId: "proj_fixture",
    offerId: "offer_fixture"
  },
  mode: "subscription",
  payment_status: "paid",
  status: "open",
  subscription: stripeSubscriptionFixture.id,
  success_url: "https://example.com/pay/success?session_id={CHECKOUT_SESSION_ID}",
  ui_mode: "hosted_page",
  url: "https://checkout.stripe.com/c/pay/cs_fixture_123"
} as unknown as Stripe.Checkout.Session
