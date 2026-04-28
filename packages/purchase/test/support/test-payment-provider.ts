import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Stream from "effect/Stream"

import type {
  BillingPortalSession,
  CheckoutSession,
  Customer,
  Price,
  Product,
  RefundResult,
  Subscription,
  SubscriptionChangePreview
} from "../../src/internal/provider-schema.ts"
import type {
  ChangeSubscriptionParams,
  CreatePriceParams,
  CreateProductParams,
  PaymentClient,
  PaymentWebhookNormalization,
  PauseSubscriptionParams,
  PreviewSubscriptionChangeParams,
  RefundTransactionParams,
  ResumeSubscriptionParams
} from "../../src/provider/client.ts"
import type { PaymentProviderTag } from "../../src/provider/type.ts"

import { ProviderOperationNotSupported, WebhookUnmarshalError } from "../../src/errors.ts"
import { makePaymentClient } from "../../src/provider/client.ts"
import { PaymentImpl } from "../../src/provider/impl.ts"

export const TEST_PROVIDER_CUSTOMER_ID = "cus_test_123"
export const TEST_CHECKOUT_SESSION_ID = "cs_test_123"
export const TEST_CHECKOUT_URL = "https://checkout.test/session/cs_test_123"
export const TEST_CREATED_PRODUCT_ID = "prod_test_created"
export const TEST_CREATED_PRICE_ID = "price_test_created"
export const TEST_SUBSCRIPTION_ID = "sub_test_123"
export const TEST_BILLING_PORTAL_SESSION_ID = "bps_test_123"
export const TEST_BILLING_PORTAL_URL = "https://billing.test/session/bps_test_123"
export const TEST_REFUND_ID = "re_test_123"

export interface TestPaymentCalls {
  readonly products: {
    readonly create: Array<CreateProductParams>
    readonly archive: Array<Parameters<PaymentClient["products"]["archive"]>[0]>
  }
  readonly prices: {
    readonly create: Array<CreatePriceParams>
    readonly archive: Array<Parameters<PaymentClient["prices"]["archive"]>[0]>
  }
  readonly customers: {
    readonly find: Array<Parameters<PaymentClient["customers"]["find"]>[0]>
    readonly create: Array<Parameters<PaymentClient["customers"]["create"]>[0]>
  }
  readonly checkout: {
    readonly prepare: Array<Parameters<PaymentClient["checkout"]["prepare"]>[0]>
  }
  readonly subscriptions: {
    readonly cancel: Array<Parameters<PaymentClient["subscriptions"]["cancel"]>[0]>
    readonly change: Array<ChangeSubscriptionParams>
    readonly pause: Array<PauseSubscriptionParams>
    readonly resume: Array<ResumeSubscriptionParams>
    readonly previewChange: Array<PreviewSubscriptionChangeParams>
  }
  readonly refunds: {
    readonly create: Array<RefundTransactionParams>
  }
  readonly billingPortal: {
    readonly createSession: Array<Parameters<PaymentClient["billingPortal"]["createSession"]>[0]>
  }
}

export const makeTestPaymentLayer = (options?: {
  readonly provider?: PaymentProviderTag | undefined
  readonly unsupported?: Partial<Record<string, true>> | undefined
  readonly normalizedWebhook?: PaymentWebhookNormalization | undefined
  readonly normalizeWebhook?: ((event: unknown) => Effect.Effect<PaymentWebhookNormalization, never, never>) | undefined
}) => {
  const provider = options?.provider ?? "stripe"
  const unsupported = options?.unsupported ?? {}
  const calls: TestPaymentCalls = {
    products: { create: [], archive: [] },
    prices: { create: [], archive: [] },
    customers: { find: [], create: [] },
    checkout: { prepare: [] },
    subscriptions: { cancel: [], change: [], pause: [], resume: [], previewChange: [] },
    refunds: { create: [] },
    billingPortal: { createSession: [] }
  }

  const unsupportedFailure = (operation: string) =>
    new ProviderOperationNotSupported({
      provider,
      operation,
      message: `${provider} does not support ${operation} in the test provider`
    })

  const failIfUnsupported = (operation: string): Effect.Effect<void, ProviderOperationNotSupported> =>
    unsupported[operation] ? Effect.fail(unsupportedFailure(operation)) : Effect.void

  const makeProduct = (id = TEST_CREATED_PRODUCT_ID): Product =>
    ({
      id,
      name: "Created Product",
      description: "",
      active: true,
      metadata: {},
      prices: []
    }) as unknown as Product

  const makePrice = (input: CreatePriceParams): Price =>
    ({
      id: TEST_CREATED_PRICE_ID,
      name: input.name ?? "",
      productId: input.productId,
      unitPrice: input.unitPrice,
      unitPriceOverride: [],
      billingCycle: input.billingCycle,
      trialPeriod: input.trialPeriod,
      active: input.active ?? true,
      quantity: input.quantity ?? { minimum: 1, maximum: 1 },
      metadata: input.metadata ?? {},
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      updatedAt: new Date("2025-01-01T00:00:00.000Z")
    }) as unknown as Price

  const makeCustomer = (): Customer =>
    ({
      id: TEST_PROVIDER_CUSTOMER_ID,
      email: "jane@example.com",
      name: "Jane Doe",
      metadata: {}
    }) as unknown as Customer

  const makeSubscription = (params?: { readonly providerOfferId?: string | undefined }): Subscription =>
    ({
      id: TEST_SUBSCRIPTION_ID,
      status: "active",
      product: { id: TEST_CREATED_PRODUCT_ID, name: "SaaS", description: "" },
      price: {
        id: params?.providerOfferId ?? TEST_CREATED_PRICE_ID,
        name: "Pro Monthly",
        unitPrice: { amount: "2000", currencyCode: "usd" }
      },
      addressId: "addr_test_123",
      currencyCode: "usd",
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      updatedAt: new Date("2025-01-01T00:00:00.000Z"),
      managementUrls: {},
      items: [],
      metadata: {}
    }) as unknown as Subscription

  const makePreview = (params: PreviewSubscriptionChangeParams): SubscriptionChangePreview =>
    ({
      subscriptionId: params.subscriptionId,
      currencyCode: "usd",
      items: [
        {
          priceId: params.providerOfferId,
          productId: TEST_CREATED_PRODUCT_ID,
          quantity: params.quantity ?? 1
        }
      ],
      nextCharge: {
        subtotal: "2000",
        tax: "0",
        total: "2000",
        currencyCode: "usd",
        lineItems: [
          {
            priceId: params.providerOfferId,
            productId: TEST_CREATED_PRODUCT_ID,
            quantity: params.quantity ?? 1,
            amount: "2000",
            currencyCode: "usd",
            description: "Pro Monthly"
          }
        ]
      },
      recurringCharge: {
        subtotal: "2000",
        tax: "0",
        total: "2000",
        currencyCode: "usd",
        lineItems: []
      }
    }) as unknown as SubscriptionChangePreview

  const client: PaymentClient = makePaymentClient(provider, {
    _tag: provider,
    webhooksUnmarshal: ({ payload }) =>
      Effect.try({
        try: () => JSON.parse(payload) as unknown,
        catch: (cause) => new WebhookUnmarshalError({ error: "Invalid JSON webhook payload", cause })
      }),
    webhooksNormalize: (event) => {
      if (options?.normalizeWebhook) {
        return options.normalizeWebhook(event)
      }

      const resource: Readonly<Record<string, unknown>> =
        event && typeof event === "object" && !Array.isArray(event) ? (event as Record<string, unknown>) : {}
      const normalized: PaymentWebhookNormalization = options?.normalizedWebhook ?? {
        providerEventId: String((event as { readonly id?: unknown }).id ?? "evt_test_transaction_paid"),
        eventType: String((event as { readonly type?: unknown }).type ?? "transaction.paid"),
        kind: "transaction_updated",
        occurredAt: new Date("2025-01-01T00:00:00.000Z"),
        resource,
        metadata: {
          payCustomerId: "customer_123",
          payOfferId: "lifetime_product:lifetime"
        },
        providerCustomerId: TEST_PROVIDER_CUSTOMER_ID,
        providerTransactionId: "txn_test_123",
        providerOfferId: TEST_CREATED_PRICE_ID,
        status: "paid",
        amount: 19900,
        currency: "usd"
      }

      return Effect.succeed(normalized)
    },
    prices: {
      list: () => Effect.succeed([]),
      get: () => Effect.succeed(Option.none()),
      create: (params) =>
        failIfUnsupported("prices.create").pipe(
          Effect.tap(() => Effect.sync(() => calls.prices.create.push(params))),
          Effect.as(makePrice(params))
        ),
      update: () => Effect.fail(unsupportedFailure("prices.update")),
      archive: (params) =>
        failIfUnsupported("prices.archive").pipe(
          Effect.tap(() => Effect.sync(() => calls.prices.archive.push(params))),
          Effect.as(
            makePrice({
              productId: TEST_CREATED_PRODUCT_ID as never,
              name: "Archived Price",
              unitPrice: { amount: "0", currencyCode: "usd" },
              active: false
            })
          )
        )
    },
    products: {
      stream: () => Stream.empty,
      list: () => Effect.succeed([]),
      get: () => Effect.succeed(Option.none()),
      create: (params) =>
        failIfUnsupported("products.create").pipe(
          Effect.tap(() => Effect.sync(() => calls.products.create.push(params))),
          Effect.as(makeProduct())
        ),
      update: () => Effect.fail(unsupportedFailure("products.update")),
      archive: (params) =>
        failIfUnsupported("products.archive").pipe(
          Effect.tap(() => Effect.sync(() => calls.products.archive.push(params))),
          Effect.as(makeProduct(params.productId))
        )
    },
    customers: {
      find: (params) =>
        Effect.sync(() => {
          calls.customers.find.push(params)
          return Option.none<Customer>()
        }),
      get: () => Effect.succeed(Option.some(makeCustomer())),
      create: (params) =>
        Effect.sync(() => {
          calls.customers.create.push(params)
          return makeCustomer()
        }),
      update: () => Effect.succeed(makeCustomer())
    },
    subscriptions: {
      stream: () => Stream.empty,
      list: () => Effect.succeed([]),
      get: () => Effect.succeed(Option.some(makeSubscription())),
      latest: () => Effect.succeed(Option.some(makeSubscription())),
      cancel: (params) =>
        failIfUnsupported("subscriptions.cancel").pipe(
          Effect.tap(() => Effect.sync(() => calls.subscriptions.cancel.push(params))),
          Effect.asVoid
        ) as never,
      change: (params) =>
        failIfUnsupported("subscriptions.change").pipe(
          Effect.tap(() => Effect.sync(() => calls.subscriptions.change.push(params))),
          Effect.as(makeSubscription(params))
        ) as never,
      previewChange: (params) =>
        failIfUnsupported("subscriptions.previewChange").pipe(
          Effect.tap(() => Effect.sync(() => calls.subscriptions.previewChange.push(params))),
          Effect.as(makePreview(params))
        ) as never,
      charge: () => Effect.fail(unsupportedFailure("subscriptions.charge")) as never,
      previewCharge: () => Effect.fail(unsupportedFailure("subscriptions.previewCharge")) as never,
      pause: (params) =>
        failIfUnsupported(`subscriptions.pause.${params.mode}`).pipe(
          Effect.tap(() => Effect.sync(() => calls.subscriptions.pause.push(params))),
          Effect.asVoid
        ),
      resume: (params) =>
        failIfUnsupported(`subscriptions.resume.${params.mode}`).pipe(
          Effect.tap(() => Effect.sync(() => calls.subscriptions.resume.push(params))),
          Effect.asVoid
        )
    },
    transactions: {
      stream: () => Stream.empty,
      list: () => Effect.succeed([]),
      get: () => Effect.succeed(Option.none()),
      latest: () => Effect.succeed(Option.none()),
      generateInvoicePDF: () => Effect.succeed("https://invoice.test/pdf"),
      preview: () => Effect.fail(unsupportedFailure("transactions.preview")) as never,
      create: () => Effect.fail(unsupportedFailure("transactions.create")) as never
    },
    refunds: {
      create: (params) =>
        Effect.sync(() => calls.refunds.create.push(params)).pipe(
          Effect.zipRight(failIfUnsupported("refunds.create")),
          Effect.as({
            id: TEST_REFUND_ID,
            transactionId: params.transactionId,
            amount: params.amount ?? "1000",
            currencyCode: "usd",
            status: "succeeded",
            providerStatus: "succeeded",
            createdAt: new Date("2025-01-01T00:00:00.000Z"),
            updatedAt: new Date("2025-01-01T00:00:00.000Z")
          } as unknown as RefundResult)
        ) as never,
      get: () => Effect.succeed(Option.none()),
      list: () => Effect.succeed([])
    },
    checkout: {
      prepare: (params) =>
        Effect.sync(() => calls.checkout.prepare.push(params)).pipe(
          Effect.zipRight(failIfUnsupported("checkout.prepare")),
          Effect.as({
            mode: "subscription",
            provider,
            environment: "sandbox",
            offerId: params.offerId,
            providerCustomerId: params.providerCustomerId,
            providerSubscriptionId: TEST_SUBSCRIPTION_ID,
            token: TEST_CHECKOUT_SESSION_ID,
            url: TEST_CHECKOUT_URL,
            metadata: params.metadata
          } as unknown as CheckoutSession)
        )
    },
    billingPortal: {
      createSession: (params) =>
        Effect.sync(() => calls.billingPortal.createSession.push(params)).pipe(
          Effect.zipRight(failIfUnsupported("billingPortal.createSession")),
          Effect.as({
            id: TEST_BILLING_PORTAL_SESSION_ID,
            flow: params.flow ?? "general",
            provider,
            environment: "sandbox",
            providerCustomerId: params.providerCustomerId,
            providerSubscriptionId: params.providerSubscriptionId,
            url: TEST_BILLING_PORTAL_URL,
            createdAt: new Date("2025-01-01T00:00:00.000Z")
          } as unknown as BillingPortalSession)
        )
    }
  })

  return {
    calls,
    layer: Layer.succeed(
      PaymentImpl,
      PaymentImpl.of({
        _tag: provider,
        make: Effect.succeed(client)
      })
    )
  } as const
}
