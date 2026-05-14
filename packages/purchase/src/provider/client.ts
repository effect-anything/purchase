import type * as HttpClientError from "@effect/platform/HttpClientError"
import type * as Effect from "effect/Effect"
import type * as Option from "effect/Option"
import type * as Stream from "effect/Stream"

import * as Context from "effect/Context"

import type { CommercialOfferId } from "../core/commercial-schema.ts"
import type { BillingPortalFlow, CustomerEmail, CustomerId, SubscriptionMutationMode } from "../core/common-schema.ts"
import type {
  CheckoutNotSupported,
  CustomerAlreadyExists,
  CustomerNotFound,
  InvoiceNotFound,
  PriceNotFound,
  ProductNotFound,
  ProviderOperationNotSupported,
  SubscriptionNotFound,
  TransactionNotFound,
  WebhookUnmarshalError
} from "../errors.ts"
import type { ServicesReturns } from "../internal/types.ts"
import type {
  BillingPortalSession,
  CheckoutSession,
  Customer,
  CustomerProviderId,
  Price,
  Product,
  ProductId,
  RefundResult,
  Subscription,
  SubscriptionChangePreview,
  SubscriptionChargePreview,
  SubscriptionChargeResult,
  SubscriptionId,
  Transaction,
  TransactionId,
  TransactionPreviewResult
} from "./schema.ts"
import type { PaymentProviderTag } from "./types.ts"

/**
 * Pause a subscription using billing-collection mode.
 */
export interface PauseBillingCollectionSubscriptionParams {
  readonly subscriptionId: SubscriptionId
  readonly mode: Extract<SubscriptionMutationMode, "billing_collection">
  readonly effectiveFrom?: "immediately" | undefined
  readonly resumeAt?: string | undefined
  readonly invoiceBehavior?: "void" | "keep_as_draft" | "mark_uncollectible" | undefined
}

/**
 * Pause a subscription using lifecycle mode.
 */
export interface PauseLifecycleSubscriptionParams {
  readonly subscriptionId: SubscriptionId
  readonly mode: Extract<SubscriptionMutationMode, "lifecycle">
  readonly effectiveFrom?: "immediately" | "next_billing_period" | undefined
  readonly resumeAt?: string | undefined
  readonly resumePolicy?: "start_new_billing_period" | "continue_existing_billing_period" | undefined
}

export type PauseSubscriptionParams = PauseBillingCollectionSubscriptionParams | PauseLifecycleSubscriptionParams

/**
 * Resume a subscription using billing-collection mode.
 */
export interface ResumeBillingCollectionSubscriptionParams {
  readonly subscriptionId: SubscriptionId
  readonly mode: Extract<SubscriptionMutationMode, "billing_collection">
  readonly effectiveFrom?: "immediately" | undefined
}

/**
 * Resume a subscription using lifecycle mode.
 */
export interface ResumeLifecycleSubscriptionParams {
  readonly subscriptionId: SubscriptionId
  readonly mode: Extract<SubscriptionMutationMode, "lifecycle">
  readonly effectiveFrom: "immediately" | string
  readonly resumePolicy?: "start_new_billing_period" | "continue_existing_billing_period" | undefined
  readonly billingCycleAnchor?: "now" | "unchanged" | undefined
  readonly prorationBehavior?: "always_invoice" | "create_prorations" | "none" | undefined
  readonly prorationDate?: string | undefined
}

export type ResumeSubscriptionParams = ResumeBillingCollectionSubscriptionParams | ResumeLifecycleSubscriptionParams

export type ChangeSubscriptionProrationMode = "immediate" | "next_billing_period" | "none"

/**
 * Change a subscription to another provider offer.
 */
export interface ChangeSubscriptionParams {
  readonly subscriptionId: SubscriptionId
  readonly providerOfferId: string
  readonly quantity?: number | undefined
  readonly prorationMode?: ChangeSubscriptionProrationMode | undefined
}

/**
 * Preview a subscription change before applying it.
 */
export interface PreviewSubscriptionChangeParams extends ChangeSubscriptionParams {}

/**
 * Create a provider product.
 */
export interface CreateProductParams {
  readonly name: string
  readonly description?: string | undefined
  readonly metadata?: Record<string, unknown> | null | undefined
  readonly active?: boolean | undefined
}

/**
 * Update a provider product.
 */
export interface UpdateProductParams {
  readonly productId: ProductId
  readonly name?: string | undefined
  readonly description?: string | undefined
  readonly metadata?: Record<string, unknown> | null | undefined
  readonly active?: boolean | undefined
}

/**
 * Archive a provider product.
 */
export interface ArchiveProductParams {
  readonly productId: ProductId
}

/**
 * Create a provider price.
 */
export interface CreatePriceParams {
  readonly productId: ProductId
  readonly name?: string | undefined
  readonly unitPrice: {
    readonly amount: string
    readonly currencyCode: string
  }
  readonly billingCycle?:
    | {
        readonly interval: "day" | "week" | "month" | "year"
        readonly frequency: number
      }
    | undefined
  readonly trialPeriod?:
    | {
        readonly interval: "day" | "week" | "month" | "year"
        readonly frequency: number
      }
    | undefined
  readonly quantity?:
    | {
        readonly minimum: number
        readonly maximum: number
      }
    | undefined
  readonly metadata?: Record<string, unknown> | null | undefined
  readonly active?: boolean | undefined
}

/**
 * Update a provider price.
 */
export interface UpdatePriceParams {
  readonly priceId: string
  readonly name?: string | undefined
  readonly metadata?: Record<string, unknown> | null | undefined
}

/**
 * Archive a provider price.
 */
export interface ArchivePriceParams {
  readonly priceId: string
}

/**
 * Charge an existing subscription.
 */
export interface ChargeSubscriptionParams {
  readonly subscriptionId: SubscriptionId
  readonly providerOfferId: string
  readonly quantity?: number | undefined
  readonly effectiveFrom?: "immediately" | "next_billing_period" | undefined
}

/**
 * Preview item input for a transaction estimate.
 */
export interface PreviewTransactionItemParams {
  readonly providerOfferId: string
  readonly quantity?: number | undefined
  readonly includeInTotals?: boolean | undefined
}

/**
 * Preview a provider transaction before creation.
 */
export interface PreviewTransactionParams {
  readonly providerCustomerId?: CustomerProviderId | undefined
  readonly currencyCode?: string | undefined
  readonly items: ReadonlyArray<PreviewTransactionItemParams>
}

/**
 * Create a provider transaction.
 */
export interface CreateTransactionParams {
  readonly providerCustomerId: CustomerProviderId
  readonly providerOfferId: string
  readonly quantity?: number | undefined
  readonly collectionMode?: "automatic" | "manual" | undefined
  readonly dueInDays?: number | undefined
  readonly enableCheckout?: boolean | undefined
  readonly purchaseOrderNumber?: string | undefined
  readonly additionalInformation?: string | undefined
  readonly checkoutUrl?: string | undefined
}

/**
 * Refund a provider transaction.
 */
export interface RefundTransactionParams {
  readonly transactionId: TransactionId
  readonly amount?: string | undefined
}

/**
 * Get a refund by provider id.
 */
export interface GetRefundParams {
  readonly refundId: string
}

/**
 * List provider refunds.
 */
export interface ListRefundParams {
  readonly transactionId?: TransactionId | undefined
  readonly after?: string | undefined
  readonly perPage?: number | undefined
}

/**
 * Create a billing portal session.
 */
export interface CreateBillingPortalSessionParams {
  readonly providerCustomerId: CustomerProviderId
  readonly providerSubscriptionId?: SubscriptionId | undefined
  readonly flow?: BillingPortalFlow | undefined
  readonly returnUrl?: string | undefined
}

export type PaymentWebhookKind =
  | "checkout_completed"
  | "subscription_updated"
  | "transaction_updated"
  | "refund_updated"
  | "customer_updated"
  | "webhook_unhandled"

/**
 * Normalized webhook payload consumed by the purchase runtime.
 */
export interface PaymentWebhookNormalization {
  readonly providerEventId: string
  readonly eventType: string
  readonly kind: PaymentWebhookKind
  readonly occurredAt?: Date | undefined
  readonly resource: Readonly<Record<string, unknown>>
  readonly metadata: Readonly<Record<string, unknown>>
  readonly checkoutSessionId?: string | undefined
  readonly providerCustomerId?: string | undefined
  readonly providerSubscriptionId?: string | undefined
  readonly providerInvoiceId?: string | undefined
  readonly providerTransactionId?: string | undefined
  readonly providerOfferId?: string | undefined
  readonly quantity?: number | undefined
  readonly status?: string | undefined
  readonly canceled?: boolean | undefined
  readonly cancelAtPeriodEnd?: boolean | undefined
  readonly startedAt?: Date | undefined
  readonly trialEndsAt?: Date | undefined
  readonly currentPeriodStartAt?: Date | undefined
  readonly currentPeriodEndAt?: Date | undefined
  readonly canceledAt?: Date | undefined
  readonly endedAt?: Date | undefined
  readonly amount?: number | undefined
  readonly currency?: string | undefined
  readonly description?: string | undefined
  readonly hostedUrl?: string | undefined
  readonly periodStartAt?: Date | undefined
  readonly periodEndAt?: Date | undefined
}

type ProviderClientError = HttpClientError.HttpClientError

/**
 * Shared payment client surface implemented by each provider adapter.
 */
interface PaymentClientShape {
  readonly _tag: PaymentProviderTag

  /**
   * Run provider-specific logic by provider tag.
   */
  readonly onDialect: <A, B>(options: {
    readonly stripe: (client: Omit<StripeImpl, "onDialect" | "onDialectOrElse"> & { _tag: "stripe" }) => A
    readonly paddle: (client: Omit<PaddleImpl, "onDialect" | "onDialectOrElse"> & { _tag: "paddle" }) => B
  }) => A | B

  /**
   * Run provider-specific logic with a fallback branch.
   */
  readonly onDialectOrElse: <A, B = never, C = never>(options: {
    readonly orElse: (client: PaymentClientShape) => A
    readonly stripe?: (client: Omit<StripeImpl, "onDialect" | "onDialectOrElse"> & { _tag: "stripe" }) => B
    readonly paddle?: (client: Omit<PaddleImpl, "onDialect" | "onDialectOrElse"> & { _tag: "paddle" }) => C
  }) => A | B | C

  /**
   * Verify and decode a webhook payload.
   */
  readonly webhooksUnmarshal: ({
    payload,
    signature
  }: {
    payload: string
    signature: string
  }) => Effect.Effect<any, WebhookUnmarshalError>

  /**
   * Normalize a provider webhook event.
   */
  readonly webhooksNormalize: (event: unknown) => Effect.Effect<PaymentWebhookNormalization>

  readonly prices: {
    /**
     * List provider prices.
     */
    readonly list: (params: {
      productId?: ProductId | undefined
      after?: string | undefined
      perPage?: number | undefined
    }) => Effect.Effect<ReadonlyArray<Price>, ProviderClientError>
    /**
     * Get a provider price by id.
     */
    readonly get: ({ priceId }: { priceId: string }) => Effect.Effect<Option.Option<Price>, ProviderClientError>
    /**
     * Create a provider price.
     */
    readonly create: (
      params: CreatePriceParams
    ) => Effect.Effect<Price, ProviderClientError | ProductNotFound | ProviderOperationNotSupported>
    /**
     * Update a provider price.
     */
    readonly update: (
      params: UpdatePriceParams
    ) => Effect.Effect<Price, ProviderClientError | PriceNotFound | ProviderOperationNotSupported>
    /**
     * Archive a provider price.
     */
    readonly archive: (
      params: ArchivePriceParams
    ) => Effect.Effect<Price, ProviderClientError | PriceNotFound | ProviderOperationNotSupported>
  }

  readonly products: {
    /**
     * Stream provider products.
     */
    readonly stream: (
      params?:
        | {
            status?: Array<string> | undefined
            after?: string | undefined
            perPage?: number | undefined
            orderBy?: string | undefined
          }
        | undefined
    ) => Stream.Stream<Product, ProviderClientError>
    /**
     * List provider products.
     */
    readonly list: (params: {
      after?: string | undefined
      perPage?: number | undefined
    }) => Effect.Effect<ReadonlyArray<Product>, ProviderClientError>
    /**
     * Get a provider product by id.
     */
    readonly get: ({
      productId
    }: {
      productId: ProductId
    }) => Effect.Effect<Option.Option<Product>, ProviderClientError>
    /**
     * Create a provider product.
     */
    readonly create: (
      params: CreateProductParams
    ) => Effect.Effect<Product, ProviderClientError | ProviderOperationNotSupported>
    /**
     * Update a provider product.
     */
    readonly update: (
      params: UpdateProductParams
    ) => Effect.Effect<Product, ProviderClientError | ProductNotFound | ProviderOperationNotSupported>
    /**
     * Archive a provider product.
     */
    readonly archive: (
      params: ArchiveProductParams
    ) => Effect.Effect<Product, ProviderClientError | ProductNotFound | ProviderOperationNotSupported>
  }

  readonly customers: {
    /**
     * Find a customer by provider id or email.
     */
    readonly find: (params: {
      customerProviderId?: CustomerProviderId | undefined
      email?: CustomerEmail | undefined
    }) => Effect.Effect<Option.Option<Customer>, ProviderClientError>
    /**
     * Get a customer by provider id.
     */
    readonly get: (params: {
      customerProviderId: CustomerProviderId
    }) => Effect.Effect<Option.Option<Customer>, ProviderClientError>
    /**
     * Create a provider customer.
     */
    readonly create: (params: {
      userId: string
      email: CustomerEmail
      name?: string | undefined
      locale?: string | undefined
    }) => Effect.Effect<Customer, ProviderClientError | CustomerAlreadyExists>
    /**
     * Update a provider customer.
     */
    readonly update: (params: {
      customerProviderId: CustomerProviderId
      email?: CustomerEmail | undefined
      name?: string | undefined
      locale?: string | undefined
    }) => Effect.Effect<Customer, ProviderClientError | CustomerNotFound>
  }

  readonly subscriptions: {
    /**
     * Stream provider subscriptions.
     */
    readonly stream: (params: {
      customerProviderId?: CustomerProviderId | undefined
      after?: string | undefined
      perPage?: number | undefined
      status?: Array<string> | undefined
      orderBy?: string | undefined
    }) => Stream.Stream<Subscription, ProviderClientError>
    /**
     * List provider subscriptions.
     */
    readonly list: (params: {
      customerProviderId: CustomerProviderId
      after?: string | undefined
      perPage?: number | undefined
      orderBy?: string | undefined
    }) => Effect.Effect<ReadonlyArray<Subscription>, ProviderClientError>
    /**
     * Get a provider subscription by id.
     */
    readonly get: (params: {
      customerProviderId: CustomerProviderId
      subscriptionId: SubscriptionId
    }) => Effect.Effect<Option.Option<Subscription>, ProviderClientError>
    /**
     * Get the latest provider subscription for a customer.
     */
    readonly latest: (params: {
      customerProviderId: CustomerProviderId
    }) => Effect.Effect<Option.Option<Subscription>, ProviderClientError>
    /**
     * Change a subscription offer.
     */
    readonly change: (
      params: ChangeSubscriptionParams
    ) => Effect.Effect<Subscription, ProviderClientError | PriceNotFound | SubscriptionNotFound>
    /**
     * Preview a subscription change.
     */
    readonly previewChange: (
      params: PreviewSubscriptionChangeParams
    ) => Effect.Effect<SubscriptionChangePreview, ProviderClientError | PriceNotFound | SubscriptionNotFound>
    /**
     * Charge a subscription immediately or next cycle.
     */
    readonly charge: (
      params: ChargeSubscriptionParams
    ) => Effect.Effect<
      SubscriptionChargeResult,
      ProviderClientError | PriceNotFound | ProviderOperationNotSupported | SubscriptionNotFound,
      never
    >
    /**
     * Preview a subscription charge.
     */
    readonly previewCharge: (
      params: ChargeSubscriptionParams
    ) => Effect.Effect<
      SubscriptionChargePreview,
      ProviderClientError | PriceNotFound | ProviderOperationNotSupported | SubscriptionNotFound,
      never
    >
    /**
     * Cancel a subscription.
     */
    readonly cancel: (params: {
      subscriptionId: SubscriptionId
      effectiveFrom?: "immediately" | "next_billing_period" | undefined
    }) => Effect.Effect<void, ProviderClientError>
    /**
     * Pause a subscription.
     */
    readonly pause: (
      params: PauseSubscriptionParams
    ) => Effect.Effect<void, ProviderClientError | ProviderOperationNotSupported | SubscriptionNotFound>
    /**
     * Resume a subscription.
     */
    readonly resume: (
      params: ResumeSubscriptionParams
    ) => Effect.Effect<void, ProviderClientError | ProviderOperationNotSupported | SubscriptionNotFound>
  }

  readonly transactions: {
    /**
     * Stream provider transactions.
     */
    readonly stream: (params: {
      customerProviderId?: CustomerProviderId | undefined
      after?: string | undefined
      perPage?: number | undefined
      status?: Array<string> | undefined
      orderBy?: string | undefined
    }) => Stream.Stream<Transaction, ProviderClientError>
    /**
     * List provider transactions.
     */
    readonly list: (params: {
      customerProviderId: CustomerProviderId
      after?: string | undefined
      perPage?: number | undefined
    }) => Effect.Effect<ReadonlyArray<Transaction>, ProviderClientError>
    /**
     * Get a provider transaction by id.
     */
    readonly get: (params: {
      customerProviderId?: CustomerProviderId
      transactionId: TransactionId
    }) => Effect.Effect<Option.Option<Transaction>, ProviderClientError>
    /**
     * Get the latest provider transaction for a customer.
     */
    readonly latest: (params: {
      customerProviderId: CustomerProviderId
    }) => Effect.Effect<Option.Option<Transaction>, ProviderClientError>
    /**
     * Generate an invoice PDF url or payload.
     */
    readonly generateInvoicePDF: (params: {
      transactionId: TransactionId
    }) => Effect.Effect<string, ProviderClientError | InvoiceNotFound>
    /**
     * Preview a transaction before creation.
     */
    readonly preview: (
      params: PreviewTransactionParams
    ) => Effect.Effect<TransactionPreviewResult, ProviderClientError | PriceNotFound | CustomerNotFound>
    /**
     * Create a provider transaction.
     */
    readonly create: (
      params: CreateTransactionParams
    ) => Effect.Effect<Transaction, ProviderClientError | CustomerNotFound | PriceNotFound>
  }

  readonly refunds: {
    /**
     * Create a refund for a transaction.
     */
    readonly create: (
      params: RefundTransactionParams
    ) => Effect.Effect<RefundResult, ProviderClientError | TransactionNotFound>
    /**
     * Get a refund by id.
     */
    readonly get: (params: GetRefundParams) => Effect.Effect<Option.Option<RefundResult>, ProviderClientError>
    /**
     * List provider refunds.
     */
    readonly list: (params: ListRefundParams) => Effect.Effect<ReadonlyArray<RefundResult>, ProviderClientError>
  }

  readonly checkout: {
    /**
     * Prepare a hosted checkout session.
     */
    readonly prepare: (params: {
      projectId: string
      offerId: CommercialOfferId
      providerOfferId: string
      customerId: CustomerId
      providerCustomerId: CustomerProviderId
      successUrl?: string | undefined
      cancelUrl?: string | undefined
      checkoutUrl?: string | undefined
      metadata?: Record<string, string> | undefined
    }) => Effect.Effect<CheckoutSession, ProviderClientError | CheckoutNotSupported | CustomerNotFound | PriceNotFound>
  }

  readonly billingPortal: {
    /**
     * Create a billing portal session.
     */
    readonly createSession: (
      params: CreateBillingPortalSessionParams
    ) => Effect.Effect<
      BillingPortalSession,
      ProviderClientError | CustomerNotFound | ProviderOperationNotSupported | SubscriptionNotFound
    >
  }
}

/**
 * Runtime payment client service.
 */
export class PaymentClient extends Context.Tag("PaymentClient")<PaymentClient, PaymentClientShape>() {}

export declare namespace PaymentClient {
  export type Methods = Context.Tag.Service<PaymentClient>
  export type Returns<key extends keyof Methods, R = never> = ServicesReturns<Methods[key], R>
}

/**
 * Paddle-specific payment client implementation.
 */
export interface PaddleImpl extends PaymentClientShape {
  // Test. Provider-specific methods
  readonly paddleHi: Effect.Effect<string>
}

/**
 * Stripe-specific payment client implementation.
 */
export interface StripeImpl extends PaymentClientShape {
  // Test. Provider-specific methods
  readonly stripeHi: Effect.Effect<string>
}

type ProviderMethods<T extends PaymentClientShape> = Omit<T, "onDialect" | "onDialectOrElse">

export const makePaymentClient = <T extends PaymentClientShape>(
  tag: PaymentProviderTag,
  methods: ProviderMethods<T>
): T => {
  const onDialect: PaymentClient.Methods["onDialect"] = (options) => {
    return options[tag](methods as never)
  }

  const onDialectOrElse: PaymentClient.Methods["onDialectOrElse"] = (options) => {
    return options[tag] !== undefined ? options[tag](methods as never) : options.orElse(methods as never)
  }

  return {
    ...methods,
    onDialect,
    onDialectOrElse
  } as unknown as T
}
