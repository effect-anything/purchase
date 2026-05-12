import type * as Effect from "effect/Effect"
import type * as Option from "effect/Option"
import type * as Stream from "effect/Stream"

import * as Context from "effect/Context"

import type { CommercialOfferId } from "../core/commercial-schema.ts"
import type { BillingPortalFlow, SubscriptionMutationMode } from "../core/common-schema.ts"
import type { CustomerEmail, CustomerId } from "../core/identity-schema.ts"
import type {
  CustomerAlreadyExists,
  CustomerNotFound,
  InvoiceNotFound,
  ProductNotFound,
  ProviderOperationNotSupported,
  PriceNotFound,
  SubscriptionNotFound,
  TransactionNotFound,
  WebhookUnmarshalError
} from "../errors.ts"
import type {
  BillingPortalSession,
  CheckoutSession,
  Customer,
  CustomerProviderId,
  Price,
  Product,
  ProductId,
  Subscription,
  SubscriptionChangePreview,
  SubscriptionChargePreview,
  SubscriptionChargeResult,
  SubscriptionId,
  Transaction,
  TransactionPreviewResult,
  TransactionId,
  RefundResult
} from "../internal/provider-schema.ts"
import type { ServicesReturns } from "../internal/types.ts"
import type { PaymentProviderTag } from "./type.ts"

export interface PauseBillingCollectionSubscriptionParams {
  readonly subscriptionId: SubscriptionId
  readonly mode: Extract<SubscriptionMutationMode, "billing_collection">
  readonly effectiveFrom?: "immediately" | undefined
  readonly resumeAt?: string | undefined
  readonly invoiceBehavior?: "void" | "keep_as_draft" | "mark_uncollectible" | undefined
}

export interface PauseLifecycleSubscriptionParams {
  readonly subscriptionId: SubscriptionId
  readonly mode: Extract<SubscriptionMutationMode, "lifecycle">
  readonly effectiveFrom?: "immediately" | "next_billing_period" | undefined
  readonly resumeAt?: string | undefined
  readonly resumePolicy?: "start_new_billing_period" | "continue_existing_billing_period" | undefined
}

export type PauseSubscriptionParams = PauseBillingCollectionSubscriptionParams | PauseLifecycleSubscriptionParams

export interface ResumeBillingCollectionSubscriptionParams {
  readonly subscriptionId: SubscriptionId
  readonly mode: Extract<SubscriptionMutationMode, "billing_collection">
  readonly effectiveFrom?: "immediately" | undefined
}

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

export interface ChangeSubscriptionParams {
  readonly subscriptionId: SubscriptionId
  readonly providerOfferId: string
  readonly quantity?: number | undefined
  readonly prorationMode?: ChangeSubscriptionProrationMode | undefined
}

export interface PreviewSubscriptionChangeParams extends ChangeSubscriptionParams {}

export interface CreateProductParams {
  readonly name: string
  readonly description?: string | undefined
  readonly metadata?: Record<string, unknown> | null | undefined
  readonly active?: boolean | undefined
}

export interface UpdateProductParams {
  readonly productId: ProductId
  readonly name?: string | undefined
  readonly description?: string | undefined
  readonly metadata?: Record<string, unknown> | null | undefined
  readonly active?: boolean | undefined
}

export interface ArchiveProductParams {
  readonly productId: ProductId
}

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

export interface UpdatePriceParams {
  readonly priceId: string
  readonly name?: string | undefined
  readonly metadata?: Record<string, unknown> | null | undefined
}

export interface ArchivePriceParams {
  readonly priceId: string
}

export interface ChargeSubscriptionParams {
  readonly subscriptionId: SubscriptionId
  readonly providerOfferId: string
  readonly quantity?: number | undefined
  readonly effectiveFrom?: "immediately" | "next_billing_period" | undefined
}

export interface PreviewTransactionItemParams {
  readonly providerOfferId: string
  readonly quantity?: number | undefined
  readonly includeInTotals?: boolean | undefined
}

export interface PreviewTransactionParams {
  readonly providerCustomerId?: CustomerProviderId | undefined
  readonly currencyCode?: string | undefined
  readonly items: ReadonlyArray<PreviewTransactionItemParams>
}

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

export interface RefundTransactionParams {
  readonly transactionId: TransactionId
  readonly amount?: string | undefined
}

export interface GetRefundParams {
  readonly refundId: string
}

export interface ListRefundParams {
  readonly transactionId?: TransactionId | undefined
  readonly after?: string | undefined
  readonly perPage?: number | undefined
}

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

interface PaymentClientShape {
  readonly _tag: PaymentProviderTag

  readonly onDialect: <A, B>(options: {
    readonly stripe: (client: Omit<StripeImpl, "onDialect" | "onDialectOrElse"> & { _tag: "stripe" }) => A
    readonly paddle: (client: Omit<PaddleImpl, "onDialect" | "onDialectOrElse"> & { _tag: "paddle" }) => B
  }) => A | B

  readonly onDialectOrElse: <A, B = never, C = never>(options: {
    readonly orElse: (client: PaymentClientShape) => A
    readonly stripe?: (client: Omit<StripeImpl, "onDialect" | "onDialectOrElse"> & { _tag: "stripe" }) => B
    readonly paddle?: (client: Omit<PaddleImpl, "onDialect" | "onDialectOrElse"> & { _tag: "paddle" }) => C
  }) => A | B | C

  readonly webhooksUnmarshal: ({
    payload,
    signature
  }: {
    payload: string
    signature: string
  }) => Effect.Effect<any, WebhookUnmarshalError, never>

  readonly webhooksNormalize: (event: unknown) => Effect.Effect<PaymentWebhookNormalization, never, never>

  readonly prices: {
    list: (params: {
      productId?: ProductId | undefined
      after?: string | undefined
      perPage?: number | undefined
    }) => Effect.Effect<ReadonlyArray<Price>, never, never>
    get: ({ priceId }: { priceId: string }) => Effect.Effect<Option.Option<Price>, never, never>
    create: (
      params: CreatePriceParams
    ) => Effect.Effect<Price, ProductNotFound | ProviderOperationNotSupported | unknown, never>
    update: (
      params: UpdatePriceParams
    ) => Effect.Effect<Price, PriceNotFound | ProviderOperationNotSupported | unknown, never>
    archive: (
      params: ArchivePriceParams
    ) => Effect.Effect<Price, PriceNotFound | ProviderOperationNotSupported | unknown, never>
  }

  readonly products: {
    stream: (
      params?:
        | {
            status?: Array<string> | undefined
            after?: string | undefined
            perPage?: number | undefined
            orderBy?: string | undefined
          }
        | undefined
    ) => Stream.Stream<Product>
    list: (params: {
      after?: string | undefined
      perPage?: number | undefined
    }) => Effect.Effect<ReadonlyArray<Product>, never, never>
    get: ({ productId }: { productId: ProductId }) => Effect.Effect<Option.Option<Product>, never, never>
    create: (params: CreateProductParams) => Effect.Effect<Product, ProviderOperationNotSupported | unknown, never>
    update: (
      params: UpdateProductParams
    ) => Effect.Effect<Product, ProductNotFound | ProviderOperationNotSupported | unknown, never>
    archive: (
      params: ArchiveProductParams
    ) => Effect.Effect<Product, ProductNotFound | ProviderOperationNotSupported | unknown, never>
  }

  readonly customers: {
    find: (params: {
      customerProviderId?: CustomerProviderId | undefined
      email?: CustomerEmail | undefined
    }) => Effect.Effect<Option.Option<Customer>, never, never>
    get: (params: { customerProviderId: CustomerProviderId }) => Effect.Effect<Option.Option<Customer>, never, never>
    create: (params: {
      userId: string
      email: CustomerEmail
      name?: string | undefined
      locale?: string | undefined
    }) => Effect.Effect<Customer, CustomerAlreadyExists, never>
    update: (params: {
      customerProviderId: CustomerProviderId
      email?: CustomerEmail | undefined
      name?: string | undefined
      locale?: string | undefined
    }) => Effect.Effect<Customer, CustomerNotFound, never>
  }

  readonly subscriptions: {
    stream: (params: {
      customerProviderId?: CustomerProviderId | undefined
      after?: string | undefined
      perPage?: number | undefined
      status?: Array<string> | undefined
      orderBy?: string | undefined
    }) => Stream.Stream<Subscription>
    list: (params: {
      customerProviderId: CustomerProviderId
      after?: string | undefined
      perPage?: number | undefined
      orderBy?: string | undefined
    }) => Effect.Effect<ReadonlyArray<Subscription>, never, never>
    get: (params: {
      customerProviderId: CustomerProviderId
      subscriptionId: SubscriptionId
    }) => Effect.Effect<Option.Option<Subscription>, never, never>
    latest: (params: {
      customerProviderId: CustomerProviderId
    }) => Effect.Effect<Option.Option<Subscription>, never, never>
    change: (
      params: ChangeSubscriptionParams
    ) => Effect.Effect<Subscription, PriceNotFound | SubscriptionNotFound, never>
    previewChange: (
      params: PreviewSubscriptionChangeParams
    ) => Effect.Effect<SubscriptionChangePreview, PriceNotFound | SubscriptionNotFound, never>
    charge: (
      params: ChargeSubscriptionParams
    ) => Effect.Effect<
      SubscriptionChargeResult,
      PriceNotFound | ProviderOperationNotSupported | SubscriptionNotFound,
      never
    >
    previewCharge: (
      params: ChargeSubscriptionParams
    ) => Effect.Effect<
      SubscriptionChargePreview,
      PriceNotFound | ProviderOperationNotSupported | SubscriptionNotFound,
      never
    >
    cancel: (params: {
      subscriptionId: SubscriptionId
      effectiveFrom?: "immediately" | "next_billing_period" | undefined
    }) => Effect.Effect<void, never, never>
    pause: (
      params: PauseSubscriptionParams
    ) => Effect.Effect<void, ProviderOperationNotSupported | SubscriptionNotFound, never>
    resume: (
      params: ResumeSubscriptionParams
    ) => Effect.Effect<void, ProviderOperationNotSupported | SubscriptionNotFound, never>
  }

  readonly transactions: {
    stream: (params: {
      customerProviderId?: CustomerProviderId | undefined
      after?: string | undefined
      perPage?: number | undefined
      status?: Array<string> | undefined
      orderBy?: string | undefined
    }) => Stream.Stream<Transaction>
    list: (params: {
      customerProviderId: CustomerProviderId
      after?: string | undefined
      perPage?: number | undefined
    }) => Effect.Effect<ReadonlyArray<Transaction>, never, never>
    get: (params: {
      customerProviderId?: CustomerProviderId
      transactionId: TransactionId
    }) => Effect.Effect<Option.Option<Transaction>, never, never>
    latest: (params: {
      customerProviderId: CustomerProviderId
    }) => Effect.Effect<Option.Option<Transaction>, never, never>
    generateInvoicePDF: (params: { transactionId: TransactionId }) => Effect.Effect<string, InvoiceNotFound, never>
    preview: (
      params: PreviewTransactionParams
    ) => Effect.Effect<TransactionPreviewResult, PriceNotFound | CustomerNotFound, never>
    create: (params: CreateTransactionParams) => Effect.Effect<Transaction, CustomerNotFound | PriceNotFound, never>
  }

  readonly refunds: {
    create: (params: RefundTransactionParams) => Effect.Effect<RefundResult, TransactionNotFound, never>
    get: (params: GetRefundParams) => Effect.Effect<Option.Option<RefundResult>, never, never>
    list: (params: ListRefundParams) => Effect.Effect<ReadonlyArray<RefundResult>, never, never>
  }

  readonly checkout: {
    prepare: (params: {
      projectId: string
      offerId: CommercialOfferId
      providerOfferId: string
      customerId: CustomerId
      providerCustomerId: CustomerProviderId
      successUrl?: string | undefined
      cancelUrl?: string | undefined
      checkoutUrl?: string | undefined
      metadata?: Record<string, string> | undefined
    }) => Effect.Effect<CheckoutSession, any, never>
  }

  readonly billingPortal: {
    createSession: (
      params: CreateBillingPortalSessionParams
    ) => Effect.Effect<
      BillingPortalSession,
      CustomerNotFound | ProviderOperationNotSupported | SubscriptionNotFound,
      never
    >
  }
}

export class PaymentClient extends Context.Tag("PaymentClient")<PaymentClient, PaymentClientShape>() {}

export declare namespace PaymentClient {
  export type Methods = Context.Tag.Service<PaymentClient>
  export type Returns<key extends keyof Methods, R = never> = ServicesReturns<Methods[key], R>
}

export interface PaddleImpl extends PaymentClientShape {
  // Test. Provider-specific methods
  readonly paddleHi: Effect.Effect<string, never, never>
}

export interface StripeImpl extends PaymentClientShape {
  // Test. Provider-specific methods
  readonly stripeHi: Effect.Effect<string, never, never>
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
