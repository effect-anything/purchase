import type * as Context from "effect/Context"

import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Redacted from "effect/Redacted"

import { ProviderOperationNotSupported } from "../../src/errors.ts"
import { Paddle } from "../../src/paddle.ts"
import { PaddleClient, PaddleClientLayer, PaddleConfigFromRecord } from "../../src/paddle/internal/paddle-client.ts"
import { Stripe } from "../../src/stripe.ts"
import { StripeClient, StripeClientLayer, StripeConfigFromRecord } from "../../src/stripe/internal/stripe-client.ts"
import {
  paddleAnnualPriceFixture,
  paddleCustomerFixture,
  paddleNextTransactionFixture,
  paddleOneTimePriceFixture,
  paddlePriceFixture,
  paddleProductFixture,
  paddleSubscriptionFixture,
  paddleTransactionFixture,
  paddleWebhookSecret
} from "../provider/fixtures/paddle.ts"
import {
  stripeAnnualPriceFixture,
  stripeCheckoutSessionFixture,
  stripeCustomerFixture,
  stripeInvoiceFixture,
  stripeOneTimePriceFixture,
  stripePriceFixture,
  stripeProductFixture,
  stripeSubscriptionFixture,
  stripeWebhookSecret
} from "../provider/fixtures/stripe.ts"

const resolveStripeFixtureProductId = (price: { product: string | { id: string } }) =>
  typeof price.product === "string" ? price.product : price.product.id

const fixtureCreatedAtIso = "2025-01-01T00:00:00.000Z"
const stripeCreatedProductId = "prod_created_fixture_123"
const stripeCreatedPriceId = "price_created_fixture_123"
const paddleCreatedProductId = "pro_created_fixture_123"
const paddleCreatedPriceId = "pri_created_fixture_123"

const makeStripeProductFixture = ({
  id,
  name,
  description,
  active,
  metadata
}: {
  id: string
  name: string
  description?: string | undefined
  active?: boolean | undefined
  metadata?: Record<string, string> | undefined
}) =>
  ({
    ...stripeProductFixture,
    id,
    name,
    description: description ?? null,
    active: active ?? true,
    metadata: metadata ?? {}
  }) as unknown as typeof stripeProductFixture

const makeStripePriceFixture = ({
  id,
  product,
  nickname,
  unitAmount,
  interval,
  frequency,
  active,
  metadata
}: {
  id: string
  product: string | typeof stripeProductFixture
  nickname?: string | undefined
  unitAmount: number
  interval?: "day" | "week" | "month" | "year" | undefined
  frequency?: number | undefined
  active?: boolean | undefined
  metadata?: Record<string, string> | undefined
}) =>
  ({
    ...stripePriceFixture,
    id,
    product,
    nickname: nickname ?? null,
    unit_amount: unitAmount,
    unit_amount_decimal: unitAmount.toString(),
    recurring:
      interval && frequency
        ? {
            interval,
            interval_count: frequency,
            meter: null,
            trial_period_days: null,
            usage_type: "licensed"
          }
        : null,
    type: interval ? "recurring" : "one_time",
    active: active ?? true,
    metadata: metadata ?? {}
  }) as unknown as typeof stripePriceFixture

const makePaddleProductFixture = ({
  id,
  name,
  description,
  active,
  metadata
}: {
  id: string
  name: string
  description?: string | undefined
  active?: boolean | undefined
  metadata?: Record<string, unknown> | undefined
}) =>
  ({
    ...paddleProductFixture,
    id,
    name,
    description: description ?? "",
    status: active === false ? "archived" : "active",
    custom_data: metadata ?? {}
  }) as typeof paddleProductFixture

const makePaddlePriceFixture = ({
  id,
  productId,
  name,
  unitAmount,
  currencyCode,
  billingCycle,
  trialPeriod,
  active,
  metadata
}: {
  id: string
  productId: string
  name?: string | undefined
  unitAmount: string
  currencyCode: string
  billingCycle?:
    | {
        interval: "day" | "week" | "month" | "year"
        frequency: number
      }
    | null
    | undefined
  trialPeriod?:
    | {
        interval: "day" | "week" | "month" | "year"
        frequency: number
      }
    | null
    | undefined
  active?: boolean | undefined
  metadata?: Record<string, unknown> | undefined
}) =>
  ({
    ...paddlePriceFixture,
    id,
    product_id: productId,
    name: name ?? "",
    description: name ?? "",
    billing_cycle: billingCycle ?? null,
    trial_period: trialPeriod ?? null,
    unit_price: {
      amount: unitAmount,
      currency_code: currencyCode
    },
    status: active === false ? "archived" : "active",
    custom_data: metadata ?? {}
  }) as typeof paddlePriceFixture

const makeStripePreviewInvoice = ({
  id,
  price,
  quantity
}: {
  id: string
  price: typeof stripePriceFixture
  quantity: number
}) =>
  ({
    ...stripeInvoiceFixture,
    id,
    billing_reason: "upcoming",
    currency: price.currency,
    subtotal: (price.unit_amount ?? 0) * quantity,
    total: (price.unit_amount ?? 0) * quantity,
    total_taxes: [],
    period_start: stripeSubscriptionFixture.items.data[0]!.current_period_start,
    period_end: stripeSubscriptionFixture.items.data[0]!.current_period_end,
    lines: {
      data: [
        {
          ...stripeInvoiceFixture.lines.data[0]!,
          amount: (price.unit_amount ?? 0) * quantity,
          currency: price.currency,
          description: price.nickname ?? "",
          quantity,
          period: {
            start: stripeSubscriptionFixture.items.data[0]!.current_period_start,
            end: stripeSubscriptionFixture.items.data[0]!.current_period_end
          },
          pricing: {
            type: "price_details",
            price_details: {
              price,
              product: resolveStripeFixtureProductId(price)
            },
            unit_amount_decimal: price.unit_amount_decimal
          }
        }
      ]
    }
  }) as unknown as typeof stripeInvoiceFixture

const makePaddlePreviewDetails = ({ price, quantity }: { price: typeof paddlePriceFixture; quantity: number }) => {
  const total = ((Number(price.unit_price.amount) || 0) * quantity).toString()
  return {
    tax_rates_used: [],
    totals: {
      subtotal: total,
      tax: "0",
      discount: "0",
      total,
      grand_total: total,
      fee: null,
      credit: "0",
      credit_to_balance: "0",
      balance: "0",
      earnings: null,
      currency_code: price.unit_price.currency_code
    },
    line_items: [
      {
        id: `preview_item_${price.id}`,
        price_id: price.id,
        quantity,
        totals: {
          subtotal: total,
          discount: "0",
          tax: "0",
          total
        },
        product: paddleProductFixture,
        tax_rate: "0",
        unit_totals: {
          subtotal: price.unit_price.amount,
          discount: "0",
          tax: "0",
          total: price.unit_price.amount
        }
      }
    ]
  }
}

export const makeStripeProvider = Effect.gen(function* () {
  return yield* Stripe.make.pipe(
    Effect.provide(
      StripeClientLayer.pipe(
        Layer.provide(
          StripeConfigFromRecord({
            apiKey: Redacted.make("sk_test_fixture"),
            webhookSecret: Redacted.make(stripeWebhookSecret),
            environment: "sandbox"
          })
        )
      )
    )
  )
})

const fakeStripeClient = {
  config: {
    apiKey: Redacted.make("sk_test_fixture"),
    webhookSecret: Redacted.make(stripeWebhookSecret),
    environment: "sandbox"
  },
  products: {
    list: ({ after }: { after?: string | undefined } = {}) =>
      Effect.succeed(after ? ([] as const) : ([stripeProductFixture] as const)),
    get: ({ productId }: { productId: string }) =>
      Effect.succeed(
        productId === stripeCreatedProductId
          ? Option.some(
              makeStripeProductFixture({
                id: stripeCreatedProductId,
                name: "Created Product",
                description: "Created description",
                metadata: {
                  projectId: "proj_created"
                }
              })
            )
          : Option.some(stripeProductFixture)
      ),
    create: ({
      name,
      description,
      metadata,
      active
    }: {
      name: string
      description?: string | undefined
      metadata?: Record<string, unknown> | null | undefined
      active?: boolean | undefined
    }) =>
      Effect.succeed(
        makeStripeProductFixture({
          id: stripeCreatedProductId,
          name,
          description,
          active,
          metadata: metadata
            ? Object.fromEntries(Object.entries(metadata).map(([key, value]) => [key, String(value)]))
            : {}
        })
      ),
    update: ({
      productId,
      name,
      description,
      metadata,
      active
    }: {
      productId: string
      name?: string | undefined
      description?: string | undefined
      metadata?: Record<string, unknown> | null | undefined
      active?: boolean | undefined
    }) =>
      Effect.succeed(
        makeStripeProductFixture({
          id: productId,
          name: name ?? stripeProductFixture.name,
          description: description ?? stripeProductFixture.description ?? undefined,
          active,
          metadata: metadata
            ? Object.fromEntries(Object.entries(metadata).map(([key, value]) => [key, String(value)]))
            : stripeProductFixture.metadata
        })
      )
  },
  prices: {
    list: ({ productId }: { productId?: string | undefined } = {}) =>
      Effect.succeed(
        productId === stripeCreatedProductId
          ? ([
              makeStripePriceFixture({
                id: stripeCreatedPriceId,
                product: stripeCreatedProductId,
                nickname: "Created Monthly",
                unitAmount: 2500,
                interval: "month",
                frequency: 1,
                metadata: {
                  projectId: "proj_created"
                }
              })
            ] as const)
          : ([stripePriceFixture, stripeAnnualPriceFixture] as const)
      ),
    listAll: ({ productId }: { productId?: string | undefined } = {}) =>
      Effect.succeed(
        productId === stripeCreatedProductId
          ? ([
              makeStripePriceFixture({
                id: stripeCreatedPriceId,
                product: stripeCreatedProductId,
                nickname: "Created Monthly",
                unitAmount: 2500,
                interval: "month",
                frequency: 1,
                metadata: {
                  projectId: "proj_created"
                }
              })
            ] as const)
          : ([stripePriceFixture, stripeAnnualPriceFixture] as const)
      ),
    get: ({ priceId }: { priceId: string }) =>
      Effect.succeed(
        priceId === stripePriceFixture.id
          ? Option.some(stripePriceFixture)
          : priceId === stripeAnnualPriceFixture.id
            ? Option.some(stripeAnnualPriceFixture)
            : priceId === stripeOneTimePriceFixture.id
              ? Option.some(stripeOneTimePriceFixture)
              : priceId === stripeCreatedPriceId
                ? Option.some(
                    makeStripePriceFixture({
                      id: stripeCreatedPriceId,
                      product: stripeCreatedProductId,
                      nickname: "Created Monthly",
                      unitAmount: 2500,
                      interval: "month",
                      frequency: 1,
                      metadata: {
                        projectId: "proj_created"
                      }
                    })
                  )
                : Option.none()
      ),
    create: ({
      productId,
      name,
      unitPrice,
      billingCycle,
      metadata,
      active
    }: {
      productId: string
      name?: string | undefined
      unitPrice: {
        amount: string
        currencyCode: string
      }
      billingCycle?:
        | {
            interval: "day" | "week" | "month" | "year"
            frequency: number
          }
        | undefined
      metadata?: Record<string, unknown> | null | undefined
      active?: boolean | undefined
    }) =>
      Effect.succeed(
        makeStripePriceFixture({
          id: stripeCreatedPriceId,
          product: productId,
          nickname: name,
          unitAmount: Number(unitPrice.amount),
          interval: billingCycle?.interval,
          frequency: billingCycle?.frequency,
          active,
          metadata: metadata
            ? Object.fromEntries(Object.entries(metadata).map(([key, value]) => [key, String(value)]))
            : {}
        })
      ),
    update: ({
      priceId,
      name,
      metadata,
      active
    }: {
      priceId: string
      name?: string | undefined
      metadata?: Record<string, unknown> | null | undefined
      active?: boolean | undefined
    }) =>
      Effect.succeed(
        makeStripePriceFixture({
          id: priceId,
          product: stripeCreatedProductId,
          nickname: name ?? stripePriceFixture.nickname ?? undefined,
          unitAmount: 2500,
          interval: "month",
          frequency: 1,
          active,
          metadata: metadata
            ? Object.fromEntries(Object.entries(metadata).map(([key, value]) => [key, String(value)]))
            : {}
        })
      )
  },
  customers: {
    find: () => Effect.succeed([stripeCustomerFixture] as const),
    get: () => Effect.succeed(Option.some(stripeCustomerFixture)),
    create: () => Effect.succeed(stripeCustomerFixture),
    update: () => Effect.succeed(stripeCustomerFixture)
  },
  subscriptions: {
    list: ({ after }: { after?: string | undefined } = {}) =>
      Effect.succeed(after ? ([] as const) : ([stripeSubscriptionFixture] as const)),
    get: () => Effect.succeed(Option.some(stripeSubscriptionFixture)),
    cancel: () => Effect.void,
    pause: ({ mode }: { mode: "billing_collection" | "lifecycle" }) =>
      mode === "billing_collection"
        ? Effect.void
        : Effect.fail(
            new ProviderOperationNotSupported({
              provider: "stripe",
              operation: "subscriptions.pause",
              message: "Lifecycle pause is not supported by Stripe fixtures"
            })
          ),
    resume: ({ mode }: { mode: "billing_collection" | "lifecycle" }) =>
      mode === "billing_collection"
        ? Effect.void
        : Effect.fail(
            new ProviderOperationNotSupported({
              provider: "stripe",
              operation: "subscriptions.resume",
              message: "Lifecycle resume is not supported by Stripe fixtures"
            })
          ),
    previewChange: ({
      subscriptionId: _subscriptionId,
      priceId,
      quantity
    }: {
      subscriptionId: string
      priceId: string
      quantity?: number | undefined
      prorationMode?: "immediate" | "next_billing_period" | "none" | undefined
    }) => {
      const price = priceId === stripeAnnualPriceFixture.id ? stripeAnnualPriceFixture : stripePriceFixture
      const nextQuantity = quantity ?? stripeSubscriptionFixture.items.data[0]!.quantity ?? 1

      return Effect.succeed({
        subscription: stripeSubscriptionFixture,
        nextInvoice: makeStripePreviewInvoice({
          id: "upcoming_in_fixture_next",
          price,
          quantity: nextQuantity
        }),
        recurringInvoice: makeStripePreviewInvoice({
          id: "upcoming_in_fixture_recurring",
          price,
          quantity: nextQuantity
        }),
        price
      })
    },
    previewCharge: ({
      subscriptionId: _subscriptionId,
      priceId,
      quantity
    }: {
      subscriptionId: string
      priceId: string
      quantity?: number | undefined
      effectiveFrom?: "immediately" | "next_billing_period" | undefined
    }) =>
      Effect.succeed({
        subscription: stripeSubscriptionFixture,
        nextInvoice: makeStripePreviewInvoice({
          id: "upcoming_in_fixture_charge",
          price: priceId === stripeOneTimePriceFixture.id ? stripeOneTimePriceFixture : stripePriceFixture,
          quantity: quantity ?? 1
        }),
        price: priceId === stripeOneTimePriceFixture.id ? stripeOneTimePriceFixture : stripePriceFixture
      }),
    change: ({ priceId, quantity }: { priceId: string; quantity?: number | undefined }) =>
      Effect.succeed({
        ...stripeSubscriptionFixture,
        items: {
          data: [
            {
              ...stripeSubscriptionFixture.items.data[0]!,
              price: priceId === stripeAnnualPriceFixture.id ? stripeAnnualPriceFixture : stripePriceFixture,
              quantity: quantity ?? stripeSubscriptionFixture.items.data[0]!.quantity
            }
          ]
        }
      }),
    charge: ({
      priceId,
      quantity,
      effectiveFrom
    }: {
      subscriptionId: string
      priceId: string
      quantity?: number | undefined
      effectiveFrom?: "immediately" | "next_billing_period" | undefined
    }) =>
      Effect.succeed({
        subscription: stripeSubscriptionFixture,
        invoice:
          effectiveFrom === "next_billing_period"
            ? null
            : makeStripePreviewInvoice({
                id: "in_charge_fixture_123",
                price: priceId === stripeOneTimePriceFixture.id ? stripeOneTimePriceFixture : stripePriceFixture,
                quantity: quantity ?? 1
              }),
        price: priceId === stripeOneTimePriceFixture.id ? stripeOneTimePriceFixture : stripePriceFixture
      })
  },
  transactions: {
    list: ({ after }: { after?: string | undefined } = {}) =>
      Effect.succeed(after ? ([] as const) : ([stripeInvoiceFixture] as const)),
    get: () => Effect.succeed(Option.some(stripeInvoiceFixture)),
    generateInvoicePDF: () => Effect.succeed(stripeInvoiceFixture.invoice_pdf!),
    preview: ({
      items
    }: {
      customerId?: string | undefined
      currencyCode?: string | undefined
      items: ReadonlyArray<{
        priceId: string
        quantity?: number | undefined
        includeInTotals?: boolean | undefined
      }>
    }) => {
      const includedItem = items.find((item) => item.includeInTotals ?? true)
      const price =
        includedItem?.priceId === stripeOneTimePriceFixture.id ? stripeOneTimePriceFixture : stripePriceFixture
      const quantity = includedItem?.quantity ?? 1

      return Effect.succeed(
        makeStripePreviewInvoice({
          id: "upcoming_in_fixture_txn_preview",
          price,
          quantity
        })
      )
    },
    create: ({
      priceId,
      quantity,
      collectionMode,
      dueInDays
    }: {
      customerId: string
      priceId: string
      quantity?: number | undefined
      collectionMode?: "automatic" | "manual" | undefined
      dueInDays?: number | undefined
    }) =>
      Effect.succeed({
        ...makeStripePreviewInvoice({
          id: "in_created_fixture_123",
          price: priceId === stripeOneTimePriceFixture.id ? stripeOneTimePriceFixture : stripePriceFixture,
          quantity: quantity ?? 1
        }),
        created: 1_735_689_600,
        collection_method: collectionMode === "manual" ? "send_invoice" : "charge_automatically",
        hosted_invoice_url:
          collectionMode === "manual"
            ? "https://pay.stripe.com/invoice/acct_fixture/in_created_fixture_123/hosted"
            : null,
        number: collectionMode === "manual" ? "INV-STRIPE-CREATED-123" : "INV-STRIPE-123",
        status: collectionMode === "manual" ? "open" : "paid",
        status_transitions:
          collectionMode === "manual"
            ? {
                finalized_at: 1_735_689_600,
                marked_uncollectible_at: null,
                paid_at: null,
                voided_at: null
              }
            : stripeInvoiceFixture.status_transitions,
        due_date: collectionMode === "manual" ? 1_735_689_600 + (dueInDays ?? 30) * 24 * 60 * 60 : null
      }),
    refund: ({ transactionId, amount }: { transactionId: string; amount?: string | undefined }) =>
      Effect.succeed({
        id: "re_fixture_123",
        transactionId,
        amount: amount ?? "1500",
        currencyCode: "USD",
        status: "succeeded",
        providerStatus: "succeeded",
        createdAt: fixtureCreatedAtIso,
        updatedAt: fixtureCreatedAtIso
      })
  },
  refunds: {
    get: ({ refundId }: { refundId: string }) =>
      Effect.succeed(
        refundId === "re_fixture_123"
          ? Option.some({
              id: "re_fixture_123",
              transactionId: stripeInvoiceFixture.id,
              amount: "500",
              currencyCode: "USD",
              status: "succeeded",
              providerStatus: "succeeded",
              createdAt: fixtureCreatedAtIso,
              updatedAt: fixtureCreatedAtIso
            })
          : Option.none()
      ),
    list: () =>
      Effect.succeed([
        {
          id: "re_fixture_123",
          transactionId: stripeInvoiceFixture.id,
          amount: "500",
          currencyCode: "USD",
          status: "succeeded",
          providerStatus: "succeeded",
          createdAt: fixtureCreatedAtIso,
          updatedAt: fixtureCreatedAtIso
        }
      ] as const)
  },
  checkout: {
    createSession: ({ mode }: { mode: "payment" | "subscription" }) =>
      Effect.succeed({
        ...stripeCheckoutSessionFixture,
        mode,
        subscription: mode === "subscription" ? stripeSubscriptionFixture.id : null,
        invoice: stripeInvoiceFixture.id
      })
  },
  billingPortal: {
    createSession: ({
      customerId
    }: {
      customerId: string
      returnUrl?: string | undefined
      flow?: "general" | "payment_method_update" | "subscription_cancel" | "subscription_update" | undefined
      subscriptionId?: string | undefined
    }) =>
      Effect.succeed({
        id: "bps_fixture_123",
        customer: customerId,
        created: 1_735_689_600,
        url: "https://billing.stripe.com/p/session/test_fixture"
      })
  },
  webhooksUnmarshal: (payload: string) => Effect.succeed(JSON.parse(payload))
} as unknown as Context.Tag.Service<typeof StripeClient>

export const makeStripeFixtureProvider = Effect.gen(function* () {
  return yield* Stripe.make.pipe(Effect.provideService(StripeClient, fakeStripeClient))
})

export const makePaddleProvider = Effect.gen(function* () {
  return yield* Paddle.make.pipe(
    Effect.provide(
      PaddleClientLayer.pipe(
        Layer.provide(
          PaddleConfigFromRecord({
            apiToken: Redacted.make("pdl_fixture_token"),
            webhookToken: Redacted.make(paddleWebhookSecret),
            environment: "sandbox"
          })
        )
      )
    )
  )
})

const fakePaddleClient = {
  config: {
    apiToken: Redacted.make("pdl_fixture_token"),
    webhookToken: Redacted.make(paddleWebhookSecret),
    environment: "sandbox"
  },
  prices: {
    list: ({ productId }: { productId?: ReadonlyArray<string> | undefined } = {}) =>
      Effect.succeed(
        productId?.includes(paddleCreatedProductId)
          ? [
              makePaddlePriceFixture({
                id: paddleCreatedPriceId,
                productId: paddleCreatedProductId,
                name: "Created Monthly",
                unitAmount: "2500",
                currencyCode: "USD",
                billingCycle: {
                  interval: "month",
                  frequency: 1
                },
                metadata: {
                  projectId: "proj_created"
                }
              })
            ]
          : productId?.includes(paddleProductFixture.id)
            ? [paddlePriceFixture, paddleAnnualPriceFixture]
            : [paddlePriceFixture, paddleAnnualPriceFixture]
      ),
    get: ({ priceId }: { priceId: string }) =>
      Effect.succeed(
        priceId === paddlePriceFixture.id
          ? Option.some(paddlePriceFixture)
          : priceId === paddleAnnualPriceFixture.id
            ? Option.some(paddleAnnualPriceFixture)
            : priceId === paddleOneTimePriceFixture.id
              ? Option.some(paddleOneTimePriceFixture)
              : priceId === paddleCreatedPriceId
                ? Option.some(
                    makePaddlePriceFixture({
                      id: paddleCreatedPriceId,
                      productId: paddleCreatedProductId,
                      name: "Created Monthly",
                      unitAmount: "2500",
                      currencyCode: "USD",
                      billingCycle: {
                        interval: "month",
                        frequency: 1
                      },
                      metadata: {
                        projectId: "proj_created"
                      }
                    })
                  )
                : Option.none()
      ),
    create: ({
      productId,
      name,
      unitPrice,
      billingCycle,
      trialPeriod,
      metadata,
      active
    }: {
      productId: string
      name?: string | undefined
      unitPrice: {
        amount: string
        currencyCode: string
      }
      billingCycle?:
        | {
            interval: "day" | "week" | "month" | "year"
            frequency: number
          }
        | undefined
      trialPeriod?:
        | {
            interval: "day" | "week" | "month" | "year"
            frequency: number
          }
        | undefined
      metadata?: Record<string, unknown> | null | undefined
      active?: boolean | undefined
    }) =>
      Effect.succeed(
        makePaddlePriceFixture({
          id: paddleCreatedPriceId,
          productId,
          name,
          unitAmount: unitPrice.amount,
          currencyCode: unitPrice.currencyCode,
          billingCycle,
          trialPeriod,
          active,
          metadata: metadata ?? undefined
        })
      ),
    update: ({
      priceId,
      name,
      metadata,
      active
    }: {
      priceId: string
      name?: string | undefined
      metadata?: Record<string, unknown> | null | undefined
      active?: boolean | undefined
    }) =>
      Effect.succeed(
        makePaddlePriceFixture({
          id: priceId,
          productId: paddleCreatedProductId,
          name: name ?? "Created Monthly",
          unitAmount: "2500",
          currencyCode: "USD",
          billingCycle: {
            interval: "month",
            frequency: 1
          },
          active,
          metadata: metadata ?? undefined
        })
      )
  },
  products: {
    list: ({ after }: { after?: string | undefined } = {}) =>
      Effect.succeed(after ? ([] as const) : ([paddleProductFixture] as const)),
    get: ({ productId }: { productId: string }) =>
      Effect.succeed(
        productId === paddleCreatedProductId
          ? Option.some(
              makePaddleProductFixture({
                id: paddleCreatedProductId,
                name: "Created Product",
                description: "Created description",
                metadata: {
                  projectId: "proj_created"
                }
              })
            )
          : Option.some(paddleProductFixture)
      ),
    create: ({
      name,
      description,
      metadata,
      active
    }: {
      name: string
      description?: string | undefined
      metadata?: Record<string, unknown> | null | undefined
      active?: boolean | undefined
    }) =>
      Effect.succeed(
        makePaddleProductFixture({
          id: paddleCreatedProductId,
          name,
          description,
          active,
          metadata: metadata ?? undefined
        })
      ),
    update: ({
      productId,
      name,
      description,
      metadata,
      active
    }: {
      productId: string
      name?: string | undefined
      description?: string | undefined
      metadata?: Record<string, unknown> | null | undefined
      active?: boolean | undefined
    }) =>
      Effect.succeed(
        makePaddleProductFixture({
          id: productId,
          name: name ?? paddleProductFixture.name,
          description: description ?? paddleProductFixture.description,
          active,
          metadata: metadata ?? undefined
        })
      )
  },
  customers: {
    list: () => Effect.succeed([paddleCustomerFixture] as const),
    find: () => Effect.succeed([paddleCustomerFixture] as const),
    get: () => Effect.succeed(Option.some(paddleCustomerFixture)),
    create: () => Effect.succeed(paddleCustomerFixture),
    update: () => Effect.succeed(paddleCustomerFixture),
    createPortalSession: ({
      customerId
    }: {
      customerId: string
      subscriptionIds?: ReadonlyArray<string> | undefined
    }) =>
      Effect.succeed({
        id: "cpls_fixture_123",
        customer_id: customerId,
        created_at: new Date(fixtureCreatedAtIso),
        urls: {
          general: {
            overview: "https://customer-portal.paddle.com/general_fixture"
          },
          subscriptions: [
            {
              id: paddleSubscriptionFixture.id,
              cancel_subscription: "https://customer-portal.paddle.com/cancel_fixture",
              update_subscription_payment_method: "https://customer-portal.paddle.com/update-payment_fixture"
            }
          ]
        }
      })
  },
  subscriptions: {
    list: ({ after }: { after?: string | undefined } = {}) =>
      Effect.succeed(after ? ([] as const) : ([paddleSubscriptionFixture] as const)),
    get: () => Effect.succeed(Option.some(paddleSubscriptionFixture)),
    cancel: () => Effect.void,
    pause: ({ mode }: { mode: "billing_collection" | "lifecycle" }) =>
      mode === "lifecycle"
        ? Effect.void
        : Effect.fail(
            new ProviderOperationNotSupported({
              provider: "paddle",
              operation: "subscriptions.pause",
              message: "Billing collection pause is not supported by Paddle fixtures"
            })
          ),
    resume: ({ mode }: { mode: "billing_collection" | "lifecycle" }) =>
      mode === "lifecycle"
        ? Effect.void
        : Effect.fail(
            new ProviderOperationNotSupported({
              provider: "paddle",
              operation: "subscriptions.resume",
              message: "Billing collection resume is not supported by Paddle fixtures"
            })
          ),
    previewChange: ({
      subscriptionId,
      priceId,
      quantity,
      prorationMode
    }: {
      subscriptionId: string
      priceId: string
      quantity?: number | undefined
      prorationMode?: "immediate" | "next_billing_period" | "none" | undefined
    }) => {
      const price = priceId === paddleAnnualPriceFixture.id ? paddleAnnualPriceFixture : paddlePriceFixture
      const nextQuantity = quantity ?? paddleSubscriptionFixture.items[0]!.quantity
      const details = makePaddlePreviewDetails({
        price,
        quantity: nextQuantity
      })

      return Effect.succeed({
        id: subscriptionId,
        currency_code: price.unit_price.currency_code,
        current_billing_period: paddleSubscriptionFixture.current_billing_period,
        items: [
          {
            ...paddleSubscriptionFixture.items[0]!,
            price,
            quantity: nextQuantity
          }
        ],
        immediate_transaction:
          prorationMode === "immediate"
            ? {
                billing_period: paddleSubscriptionFixture.current_billing_period!,
                details,
                adjustments: []
              }
            : null,
        next_transaction:
          prorationMode === "immediate"
            ? {
                billing_period: paddleSubscriptionFixture.current_billing_period!,
                details,
                adjustments: []
              }
            : {
                billing_period: paddleSubscriptionFixture.current_billing_period!,
                details,
                adjustments: []
              },
        recurring_transaction_details: details
      })
    },
    previewCharge: ({
      subscriptionId,
      priceId,
      quantity,
      effectiveFrom
    }: {
      subscriptionId: string
      priceId: string
      quantity?: number | undefined
      effectiveFrom?: "immediately" | "next_billing_period" | undefined
    }) => {
      const price = priceId === paddleOneTimePriceFixture.id ? paddleOneTimePriceFixture : paddlePriceFixture
      const details = makePaddlePreviewDetails({
        price,
        quantity: quantity ?? 1
      })

      return Effect.succeed({
        id: subscriptionId,
        currency_code: price.unit_price.currency_code,
        items: paddleSubscriptionFixture.items,
        immediate_transaction:
          (effectiveFrom ?? "immediately") === "immediately"
            ? {
                billing_period: paddleSubscriptionFixture.current_billing_period!,
                details,
                adjustments: []
              }
            : null,
        next_transaction: {
          billing_period: paddleSubscriptionFixture.current_billing_period!,
          details,
          adjustments: []
        },
        recurring_transaction_details: makePaddlePreviewDetails({
          price: paddlePriceFixture,
          quantity: paddleSubscriptionFixture.items[0]!.quantity
        })
      })
    },
    change: ({ priceId, quantity }: { priceId: string; quantity?: number | undefined }) =>
      Effect.succeed(
        priceId === paddleAnnualPriceFixture.id
          ? {
              ...paddleSubscriptionFixture,
              billing_cycle: paddleAnnualPriceFixture.billing_cycle,
              items: [
                {
                  ...paddleSubscriptionFixture.items[0]!,
                  price: paddleAnnualPriceFixture,
                  quantity: quantity ?? paddleSubscriptionFixture.items[0]!.quantity
                }
              ]
            }
          : {
              ...paddleSubscriptionFixture,
              billing_cycle: paddlePriceFixture.billing_cycle,
              items: [
                {
                  ...paddleSubscriptionFixture.items[0]!,
                  price: paddlePriceFixture,
                  quantity: quantity ?? paddleSubscriptionFixture.items[0]!.quantity
                }
              ]
            }
      ),
    charge: ({
      effectiveFrom
    }: {
      subscriptionId: string
      priceId: string
      quantity?: number | undefined
      effectiveFrom?: "immediately" | "next_billing_period" | undefined
    }) =>
      Effect.succeed({
        subscription: paddleSubscriptionFixture,
        price: paddleOneTimePriceFixture,
        effectiveFrom: effectiveFrom ?? "immediately"
      })
  },
  transactions: {
    list: ({
      after,
      subscriptionId
    }: {
      after?: string | undefined
      subscriptionId?: string | undefined
      orderBy?: string | undefined
      perPage?: number | undefined
    } = {}) =>
      Effect.succeed(
        after
          ? ([] as const)
          : subscriptionId
            ? ([paddleTransactionFixture] as const)
            : ([paddleTransactionFixture, paddleNextTransactionFixture] as const)
      ),
    get: () => Effect.succeed(Option.some(paddleTransactionFixture)),
    generateInvoicePDF: () => Effect.succeed("https://sandbox-vendors.paddle.com/invoices/inv_fixture_123.pdf"),
    preview: ({
      items,
      currencyCode
    }: {
      customerId?: string | undefined
      currencyCode?: string | undefined
      items: ReadonlyArray<{
        priceId: string
        quantity?: number | undefined
        includeInTotals?: boolean | undefined
      }>
    }) => {
      const includedItem = items.find((item) => item.includeInTotals ?? true)
      const price =
        includedItem?.priceId === paddleOneTimePriceFixture.id ? paddleOneTimePriceFixture : paddlePriceFixture
      const quantity = includedItem?.quantity ?? 1

      return Effect.succeed({
        customer_id: paddleCustomerFixture.id,
        address_id: paddleSubscriptionFixture.address_id,
        business_id: null,
        currency_code: currencyCode ?? price.unit_price.currency_code,
        items: items.map((item) => ({
          price: item.priceId === paddleOneTimePriceFixture.id ? paddleOneTimePriceFixture : paddlePriceFixture,
          quantity: item.quantity ?? 1,
          proration: null,
          include_in_totals: item.includeInTotals ?? true
        })),
        details: makePaddlePreviewDetails({
          price,
          quantity
        }),
        available_payment_methods: ["card", "paypal"]
      })
    },
    create: ({
      priceId,
      quantity,
      collectionMode,
      enableCheckout,
      dueInDays,
      purchaseOrderNumber,
      additionalInformation
    }: {
      customerId: string
      priceId: string
      quantity?: number | undefined
      collectionMode?: "automatic" | "manual" | undefined
      dueInDays?: number | undefined
      enableCheckout?: boolean | undefined
      purchaseOrderNumber?: string | undefined
      additionalInformation?: string | undefined
      customData?: Record<string, unknown> | undefined
    }) =>
      Effect.succeed({
        ...paddleTransactionFixture,
        collection_mode: collectionMode ?? "automatic",
        billing_details:
          collectionMode === "manual"
            ? {
                payment_terms: {
                  interval: "day",
                  frequency: dueInDays ?? 30
                },
                enable_checkout: enableCheckout ?? false,
                purchase_order_number: purchaseOrderNumber ?? "",
                additional_information: additionalInformation ?? null
              }
            : null,
        checkout:
          collectionMode === "manual"
            ? enableCheckout
              ? {
                  url: "https://sandbox-checkout.paddle.com/manual_txn_fixture_123"
                }
              : {
                  url: null
                }
            : paddleTransactionFixture.checkout,
        items: [
          {
            ...paddleTransactionFixture.items[0]!,
            quantity: quantity ?? 1,
            price: priceId === paddleOneTimePriceFixture.id ? paddleOneTimePriceFixture : paddlePriceFixture
          }
        ],
        details: {
          ...paddleTransactionFixture.details,
          line_items: [
            {
              ...paddleTransactionFixture.details.line_items[0]!,
              price_id: priceId === paddleOneTimePriceFixture.id ? paddleOneTimePriceFixture.id : paddlePriceFixture.id,
              quantity: quantity ?? 1
            }
          ]
        }
      }),
    refund: ({ transactionId, amount }: { transactionId: string; amount?: string | undefined }) =>
      Effect.succeed({
        id: "adj_fixture_123",
        transactionId,
        amount: amount ?? "1500",
        currencyCode: "USD",
        status: "pending",
        providerStatus: "pending_approval",
        createdAt: fixtureCreatedAtIso,
        updatedAt: fixtureCreatedAtIso
      })
  },
  refunds: {
    get: ({ refundId }: { refundId: string }) =>
      Effect.succeed(
        refundId === "adj_fixture_123"
          ? Option.some({
              id: "adj_fixture_123",
              transactionId: paddleTransactionFixture.id,
              amount: "500",
              currencyCode: "USD",
              status: "pending",
              providerStatus: "pending_approval",
              createdAt: fixtureCreatedAtIso,
              updatedAt: fixtureCreatedAtIso
            })
          : Option.none()
      ),
    list: () =>
      Effect.succeed([
        {
          id: "adj_fixture_123",
          transactionId: paddleTransactionFixture.id,
          amount: "500",
          currencyCode: "USD",
          status: "pending",
          providerStatus: "pending_approval",
          createdAt: fixtureCreatedAtIso,
          updatedAt: fixtureCreatedAtIso
        }
      ] as const)
  },
  billingPortal: {
    createSession: ({ customerId }: { customerId: string; subscriptionId?: string | undefined }) =>
      Effect.succeed({
        id: "cpls_fixture_123",
        customer_id: customerId,
        created_at: new Date(fixtureCreatedAtIso),
        urls: {
          general: {
            overview: "https://customer-portal.paddle.com/general_fixture"
          },
          subscriptions: [
            {
              id: paddleSubscriptionFixture.id,
              cancel_subscription: "https://customer-portal.paddle.com/cancel_fixture",
              update_subscription_payment_method: "https://customer-portal.paddle.com/update-payment_fixture"
            }
          ]
        }
      })
  },
  webhooksUnmarshal: (payload: string) => Effect.succeed(JSON.parse(payload))
} as unknown as Context.Tag.Service<typeof PaddleClient>

export const makePaddleFixtureProvider = Effect.gen(function* () {
  return yield* Paddle.make.pipe(Effect.provideService(PaddleClient, fakePaddleClient))
})
