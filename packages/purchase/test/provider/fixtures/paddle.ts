import * as Schema from "effect/Schema"
import { createHmac } from "node:crypto"

import {
  PaddleCustomer,
  PaddlePrice,
  PaddleProduct,
  PaddleSubscription,
  PaddleTransaction
} from "../../../src/paddle/internal/paddle-schema.ts"
import { loadGeneratedWebhookFixture } from "../support/generated-fixture.ts"
import { paddlePrimaryWebhookEvent } from "../support/provider-events.ts"

const decodeProduct = Schema.decodeSync(PaddleProduct)
const decodePrice = Schema.decodeSync(PaddlePrice)
const decodeCustomer = Schema.decodeSync(PaddleCustomer)
const decodeSubscription = Schema.decodeSync(PaddleSubscription)
const decodeTransaction = Schema.decodeSync(PaddleTransaction)
const encodeTransaction = Schema.encodeSync(PaddleTransaction)

const now = new Date("2025-01-01T00:00:00.000Z")
const next = new Date("2025-02-01T00:00:00.000Z")
const after = new Date("2025-03-01T00:00:00.000Z")
const nowIso = now.toISOString()
const nextIso = next.toISOString()
const afterIso = after.toISOString()
const generatedWebhookFixture = loadGeneratedWebhookFixture("paddle", paddlePrimaryWebhookEvent)

export const paddleWebhookSecret = generatedWebhookFixture?.webhookSecret ?? "pdl_ntfset_fixture_secret"

const defaultPaddleWebhookEvent = {
  event_id: "ntf_fixture_123",
  event_type: paddlePrimaryWebhookEvent,
  occurred_at: now.toISOString(),
  notification_id: "ntf_fixture_delivery_123",
  data: {
    id: "txn_fixture_123",
    status: "paid",
    customer_id: "ctm_fixture_123",
    invoice_id: "inv_fixture_123"
  }
} as const

export const paddleWebhookPayload = generatedWebhookFixture?.payload ?? JSON.stringify(defaultPaddleWebhookEvent)
export const paddleWebhookEvent = JSON.parse(paddleWebhookPayload)

export const makePaddleWebhookSignature = (payload: string, secret: string, timestamp: number) => {
  const digest = createHmac("sha256", secret).update(`${timestamp}:${payload}`).digest("hex")
  return `ts=${timestamp};h1=${digest}`
}

export const paddleWebhookSignature = makePaddleWebhookSignature(
  paddleWebhookPayload,
  paddleWebhookSecret,
  Math.floor(Date.now() / 1000)
)

const paddleProductEncoded = {
  id: "pro_fixture_pro",
  name: "Pro",
  tax_category: "saas",
  type: "standard",
  description: "Pro plan with monthly billing",
  image_url: null,
  custom_data: {
    projectId: "proj_fixture"
  },
  status: "active",
  import_meta: {},
  created_at: nowIso,
  updated_at: nowIso
} as const

export const paddleProductFixture = decodeProduct(paddleProductEncoded)

const paddlePriceEncoded = {
  id: "pri_fixture_pro_monthly",
  product_id: paddleProductFixture.id,
  type: "standard",
  description: "Monthly price",
  name: "Pro Monthly",
  billing_cycle: {
    interval: "month",
    frequency: 1
  },
  trial_period: {
    interval: "day",
    frequency: 7
  },
  tax_mode: "account_setting",
  unit_price: {
    amount: "1500",
    currency_code: "USD"
  },
  unit_price_overrides: [],
  custom_data: {
    projectId: "proj_fixture"
  },
  status: "active",
  quantity: {
    minimum: 1,
    maximum: 1
  },
  import_meta: {},
  created_at: nowIso,
  updated_at: nowIso
} as const

export const paddlePriceFixture = decodePrice(paddlePriceEncoded)

const paddleAnnualPriceEncoded = {
  ...paddlePriceEncoded,
  id: "pri_fixture_pro_annual",
  name: "Pro Annual",
  description: "Annual price",
  billing_cycle: {
    interval: "year",
    frequency: 1
  },
  trial_period: {
    interval: "day",
    frequency: 14
  },
  unit_price: {
    amount: "15000",
    currency_code: "USD"
  }
} as const

export const paddleAnnualPriceFixture = decodePrice(paddleAnnualPriceEncoded)

const paddleOneTimePriceEncoded = {
  ...paddlePriceEncoded,
  id: "pri_fixture_setup",
  name: "Setup Fee",
  description: "One-time setup fee",
  billing_cycle: null,
  trial_period: null,
  unit_price: {
    amount: "5000",
    currency_code: "USD"
  }
} as const

export const paddleOneTimePriceFixture = decodePrice(paddleOneTimePriceEncoded)

export const paddleCustomerFixture = decodeCustomer({
  id: "ctm_fixture_123",
  status: "active",
  custom_data: {
    projectId: "proj_fixture",
    userId: "user_fixture_123"
  },
  name: "Jane Doe",
  email: "jane@example.com",
  marketing_consent: false,
  locale: "en",
  created_at: nowIso,
  updated_at: nowIso,
  import_meta: {}
})

export const paddleSubscriptionFixture = decodeSubscription({
  id: "sub_fixture_123",
  status: "active",
  customer_id: paddleCustomerFixture.id,
  address_id: "add_fixture_123",
  business_id: null,
  currency_code: "USD",
  created_at: nowIso,
  updated_at: nowIso,
  started_at: nowIso,
  first_billed_at: nowIso,
  next_billed_at: nextIso,
  paused_at: null,
  canceled_at: null,
  collection_mode: "automatic",
  billing_details: null,
  current_billing_period: {
    starts_at: nowIso,
    ends_at: nextIso
  },
  billing_cycle: {
    interval: "month",
    frequency: 1
  },
  scheduled_change: null,
  items: [
    {
      status: "active",
      quantity: 1,
      recurring: true,
      price: paddlePriceEncoded,
      product: paddleProductEncoded
    }
  ],
  next_transaction: null,
  custom_data: {
    projectId: "proj_fixture",
    userId: "user_fixture_123"
  },
  management_urls: {
    update_payment_method: "https://vendor.example/update-payment",
    cancel: "https://vendor.example/cancel"
  },
  discount: null,
  import_meta: {}
})

export const paddleTransactionFixture = decodeTransaction({
  id: "txn_fixture_123",
  status: "paid",
  customer_id: paddleCustomerFixture.id,
  address_id: paddleSubscriptionFixture.address_id,
  business_id: null,
  custom_data: {
    projectId: "proj_fixture",
    userId: "user_fixture_123"
  },
  origin: "subscription_charge",
  collection_mode: "automatic",
  subscription_id: paddleSubscriptionFixture.id,
  invoice_id: "inv_fixture_123",
  invoice_number: "INV-123",
  billing_details: null,
  billing_period: {
    starts_at: nowIso,
    ends_at: nextIso
  },
  currency_code: "USD",
  discount_id: null,
  created_at: nowIso,
  updated_at: nowIso,
  billed_at: nowIso,
  revised_at: null,
  items: [
    {
      quantity: 1,
      price: paddlePriceEncoded,
      proration: null
    }
  ],
  details: {
    tax_rates_used: [],
    totals: {
      subtotal: "1500",
      tax: "0",
      discount: "0",
      total: "1500",
      grand_total: "1500",
      fee: "0",
      credit: "0",
      credit_to_balance: "0",
      balance: "0",
      earnings: "1500",
      currency_code: "USD"
    },
    adjusted_totals: {
      subtotal: "1500",
      tax: "0",
      total: "1500",
      grand_total: "1500",
      fee: "0",
      earnings: "1500",
      currency_code: "USD"
    },
    payout_totals: {
      subtotal: "1500",
      tax: "0",
      discount: "0",
      total: "1500",
      credit: "0",
      credit_to_balance: "0",
      balance: "0"
    },
    adjusted_payout_totals: {
      subtotal: "1500",
      tax: "0",
      total: "1500",
      fee: "0",
      chargeback_fee: {
        amount: "0",
        original: null
      },
      earnings: "1500",
      currency_code: "USD"
    },
    line_items: [
      {
        id: "item_fixture_123",
        price_id: paddlePriceFixture.id,
        quantity: 1,
        totals: {
          subtotal: "1500",
          discount: "0",
          tax: "0",
          total: "1500"
        },
        product: paddleProductEncoded,
        tax_rate: "0",
        unit_totals: {
          subtotal: "1500",
          discount: "0",
          tax: "0",
          total: "1500"
        }
      }
    ]
  },
  payments: [
    {
      id: "pay_fixture_123",
      amount: "1500",
      status: "captured",
      error: undefined,
      details: {
        type: "card",
        card: {
          type: "visa",
          last4: "4242",
          expiryMonth: 1,
          expiryYear: 2030,
          cardholderName: "Jane Doe"
        }
      },
      created_at: nowIso,
      captured_at: nowIso
    }
  ],
  checkout: {
    url: "https://sandbox-checkout.paddle.com/txn_fixture_123"
  }
})

const paddleTransactionEncoded = encodeTransaction(paddleTransactionFixture)

export const paddleNextTransactionFixture = decodeTransaction({
  ...paddleTransactionEncoded,
  id: "txn_fixture_next_123",
  status: "ready",
  created_at: afterIso,
  updated_at: afterIso,
  billed_at: null
})
