import type * as SqlClient from "@effect/sql/SqlClient"

import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"

import type {
  CommercialCatalogIssue,
  CustomerCommercialSnapshot,
  CustomerEntitlementSnapshot,
  PurchaseGrantState,
  SubscriptionAgreementState
} from "./core/commercial-schema.ts"
import type { CustomerId } from "./core/identity-schema.ts"
import type {
  CancelSubscriptionInput,
  ChangeSubscriptionInput,
  CreatePortalSessionInput,
  CreditConsumeInput,
  CreditGrantInput,
  CreditWalletResult,
  PauseSubscriptionInput,
  PreviewSubscriptionChangeInput,
  ReceiveWebhookInput,
  ReceiveWebhookResult,
  RefundPurchaseInput,
  ReplayWebhookInput,
  ResumeSubscriptionInput,
  RefreshCustomerSnapshotInput,
  WorkflowReceipt
} from "./core/workflow-schema.ts"
import type { InferOfferId, InferProductId, ProductsModule, PurchasePlansModule } from "./dsl.ts"
import type { PaymentProviderTag } from "./provider.ts"
import type { BillingPortalSession, SubscriptionChangePreview } from "./schema.ts"

import { buildCommercialCatalog, CatalogState } from "./core/catalog-builder.ts"
import { CommercialCatalogService, CommercialCatalogServiceLayer } from "./sync/catalog-service.ts
import { CommercialProjectionService, CommercialProjectionServiceLayer } from "./core/projection-service.ts"
import { CommercialWorkflowService, CommercialWorkflowServiceLayer } from "./core/workflow-service.ts"
import { CommercialWorkflowStore, CommercialWorkflowStoreLayer } from "./core/workflow-store.ts"
import { PayStorageAdapter, type PayStorageCheckoutIntentRecord, type PayStorageOverrides } from "./db.ts"
import { PaymentClient } from "./provider/client.ts"

/**
 * Public checkout entrypoint for the commercial runtime.
 * Callers should provide the stable commercial `offerId`, not a DSL `planId`.
 */
export interface PayCheckoutRequest<TProducts extends ReadonlyArray<unknown>> {
  /**
   * App-owned customer starting the commercial checkout.
   */
  readonly customerId: CustomerId
  /**
   * Stable commercial offer selected by the caller.
   */
  readonly offerId: InferOfferId<TProducts>
  /**
   * Redirect target after a successful checkout.
   */
  readonly successUrl?: string | undefined
  /**
   * Redirect target when the customer cancels checkout.
   */
  readonly cancelUrl?: string | undefined
  /**
   * Provider-hosted checkout page URL. Paddle uses this as the transaction
   * checkout payment link base and requires it to be an approved website.
   */
  readonly checkoutUrl?: string | undefined
  /**
   * Caller metadata persisted on the checkout intent and passed to the provider.
   */
  readonly metadata?: Readonly<Record<string, string>> | undefined
}

export type PurchaseCheckoutRequest<TProducts extends ReadonlyArray<unknown>> = PayCheckoutRequest<TProducts>

/**
 * Commercial checkout result returned by the default SDK.
 * The result keeps commercial ids (`offerId`, `productId`) and never echoes DSL-only ids.
 */
export interface PayCheckoutResult<TProducts extends ReadonlyArray<unknown>> {
  readonly provider: PaymentProviderTag
  /**
   * Customer that owns the checkout intent.
   */
  readonly customerId: CustomerId
  /**
   * Product family sold by the checkout target.
   */
  readonly productId: InferProductId<TProducts>
  /**
   * Stable commercial offer sold by the checkout target.
   */
  readonly offerId: InferOfferId<TProducts>
  readonly session: {
    /**
     * Durable provider checkout identifier.
     */
    readonly id: string
    /**
     * Hosted checkout URL when the provider exposes one.
     */
    readonly url?: string | undefined
  }
  readonly intentId: string
  /**
   * Correlation metadata written alongside the workflow intent.
   */
  readonly metadata: Readonly<Record<string, string>>
}

export type PurchaseCheckoutResult<TProducts extends ReadonlyArray<unknown>> = PayCheckoutResult<TProducts>

export interface BasePaySdkOptions<TPlans extends ReadonlyArray<unknown>, TProducts extends ReadonlyArray<unknown>> {
  /**
   * DSL plan declarations used only as catalog source input.
   */
  readonly plans: TPlans
  /**
   * DSL product declarations used to build the commercial catalog.
   */
  readonly products: TProducts
  /**
   * Optional storage model overrides for embedding the runtime into an app schema.
   */
  readonly storageOverrides?: PayStorageOverrides | undefined
}

export type PurchaseSDKOptions<
  TPlans extends ReadonlyArray<unknown>,
  TProducts extends ReadonlyArray<unknown>
> = BasePaySdkOptions<TPlans, TProducts>

export type PayCatalogRuntime = typeof CommercialCatalogService.Service

export interface BasePaySdkContract<_TPlans extends ReadonlyArray<unknown>, TProducts extends ReadonlyArray<unknown>> {
  /**
   * Configured provider client used by the SDK runtime. Exposed for provider-level
   * test harnesses and advanced integrations that need direct provider inspection.
   */
  readonly provider: PaymentClient.Methods
  /**
   * Read-only commercial catalog access for application runtime code.
   * Infrastructure mutations such as catalog sync live in `@effect-x/purchase/config`.
   */
  readonly catalog: PayCatalogRuntime
  readonly checkout: {
    readonly start: (input: PayCheckoutRequest<TProducts>) => Effect.Effect<PayCheckoutResult<TProducts>, unknown>
    readonly getIntent: (input: {
      readonly intentId: string
    }) => Effect.Effect<Option.Option<PayStorageCheckoutIntentRecord>, unknown>
  }
  readonly customer: {
    readonly getSnapshot: (input: {
      readonly customerId: CustomerId
    }) => Effect.Effect<CustomerCommercialSnapshot, unknown>
    readonly refreshSnapshot: (
      input: RefreshCustomerSnapshotInput
    ) => Effect.Effect<CustomerCommercialSnapshot, CommercialCatalogIssue>
    readonly getEntitlements: (input: {
      readonly customerId: CustomerId
    }) => Effect.Effect<CustomerEntitlementSnapshot, unknown>
    readonly computeEntitlements: (input: {
      readonly customerSnapshot: CustomerCommercialSnapshot
    }) => Effect.Effect<CustomerEntitlementSnapshot, CommercialCatalogIssue>
  }
  readonly subscriptions: {
    readonly getCurrent: (input: {
      readonly customerId: CustomerId
    }) => Effect.Effect<Option.Option<SubscriptionAgreementState>, unknown>
    readonly cancel: (input: CancelSubscriptionInput) => Effect.Effect<WorkflowReceipt, unknown>
    readonly change: (input: ChangeSubscriptionInput) => Effect.Effect<WorkflowReceipt, unknown>
    readonly pause: (input: PauseSubscriptionInput) => Effect.Effect<WorkflowReceipt, unknown>
    readonly resume: (input: ResumeSubscriptionInput) => Effect.Effect<WorkflowReceipt, unknown>
    readonly previewChange: (input: PreviewSubscriptionChangeInput) => Effect.Effect<SubscriptionChangePreview, unknown>
  }
  readonly purchases: {
    readonly refund: (input: RefundPurchaseInput) => Effect.Effect<WorkflowReceipt, unknown>
    readonly getGrant: (input: {
      readonly customerId: CustomerId
      readonly agreementId: string
    }) => Effect.Effect<Option.Option<PurchaseGrantState>, unknown>
  }
  readonly credits: {
    readonly getWallet: (input: {
      readonly customerId: CustomerId
      readonly creditKey: string
    }) => Effect.Effect<CreditWalletResult, unknown>
    readonly consume: (input: CreditConsumeInput) => Effect.Effect<CreditWalletResult, unknown>
    readonly grant: (input: CreditGrantInput) => Effect.Effect<CreditWalletResult, unknown>
  }
  readonly webhooks: {
    readonly handle: (input: ReceiveWebhookInput) => Effect.Effect<ReceiveWebhookResult, unknown>
    readonly replay: (input: ReplayWebhookInput) => Effect.Effect<ReceiveWebhookResult, unknown>
  }
  readonly portal: {
    readonly createSession: (input: CreatePortalSessionInput) => Effect.Effect<BillingPortalSession, unknown>
  }
}

export type PurchaseSDKContract<
  _TPlans extends ReadonlyArray<unknown>,
  TProducts extends ReadonlyArray<unknown>
> = BasePaySdkContract<_TPlans, TProducts>

export class BasePay extends Context.Tag("BasePay")<
  BasePay,
  BasePaySdkContract<ReadonlyArray<unknown>, ReadonlyArray<unknown>>
>() {}

export function BaseSDK<Self, Shape, TPlans extends ReadonlyArray<unknown>, TProducts extends ReadonlyArray<unknown>>({
  plans,
  products,
  storageOverrides
}: BasePaySdkOptions<TPlans, TProducts>) {
  type Service = Shape & BasePaySdkContract<TPlans, TProducts>

  const baseTag = BasePay as unknown as Context.TagClass<BasePay, "BasePay", BasePaySdkContract<TPlans, TProducts>>

  const tag = baseTag as unknown as Context.TagClass<Self, "", Service> & {
    readonly plans: TPlans
    readonly products: TProducts
    readonly layer: <T extends Context.Tag<Self, Service>>(
      T: T
    ) => Layer.Layer<Self, never, PaymentClient | SqlClient.SqlClient>
    readonly make: <T extends Context.Tag<Self, Service>, E, R>(
      T: T,
      f: Effect.Effect<Shape, E, R | BasePay>
    ) => Layer.Layer<Self, E, Exclude<R, BasePay> | PaymentClient | SqlClient.SqlClient>
  }

  const catalogStateLive = Layer.effect(
    CatalogState,
    buildCommercialCatalog({
      plans: plans as PurchasePlansModule,
      products: products as ProductsModule
    }).pipe(Effect.map((catalog) => ({ catalog })))
  )

  const catalogServiceLive = CommercialCatalogServiceLayer.pipe(Layer.provide(catalogStateLive))

  const commercialProjectionLive = CommercialProjectionServiceLayer.pipe(Layer.provide(catalogServiceLive))
  const commercialWorkflowStoreLive = CommercialWorkflowStoreLayer

  const commercialWorkflowLive = CommercialWorkflowServiceLayer.pipe(
    Layer.provide(catalogServiceLive),
    Layer.provide(commercialWorkflowStoreLive),
    Layer.provide(commercialProjectionLive)
  )

  const storageLayer = Layer.mergeAll(
    catalogServiceLive,
    commercialProjectionLive,
    commercialWorkflowStoreLive,
    commercialWorkflowLive
  ).pipe(Layer.provideMerge(PayStorageAdapter.make(storageOverrides)))

  const make = Layer.effect(
    baseTag,
    Effect.gen(function* () {
      const commerce = yield* Effect.all({
        catalog: CommercialCatalogService,
        projection: CommercialProjectionService,
        workflow: CommercialWorkflowService,
        workflowStore: CommercialWorkflowStore
      })
      const provider = yield* PaymentClient

      const getCommerceSnapshot = ({ customerId }: { readonly customerId: string }) =>
        commerce.projection.refreshCustomerSnapshot({
          customerId: customerId as never,
          reason: "manual"
        })

      const getEntitlements = ({ customerId }: { readonly customerId: string }) =>
        Effect.gen(function* () {
          const customerSnapshot = yield* getCommerceSnapshot({ customerId })
          return yield* commerce.projection.computeCustomerEntitlements({ customerSnapshot })
        })

      const getCurrentSubscription = ({ customerId }: { readonly customerId: string }) =>
        getCommerceSnapshot({ customerId }).pipe(
          Effect.map((snapshot) =>
            Option.fromNullable(
              snapshot.subscriptions.find((subscription) => isCurrentCommercialSubscriptionStatus(subscription.status))
            )
          )
        )

      const state: BasePaySdkContract<TPlans, TProducts> = {
        provider,
        catalog: {
          getCatalog: commerce.catalog.getCatalog,
          getProduct: commerce.catalog.getProduct,
          getOffer: commerce.catalog.getOffer,
          listOffersByProduct: commerce.catalog.listOffersByProduct,
          resolveDefaultOffer: commerce.catalog.resolveDefaultOffer,
          listSubscriptionChangeTargets: commerce.catalog.listSubscriptionChangeTargets,
          resolveCheckoutTarget: commerce.catalog.resolveCheckoutTarget
        },
        checkout: {
          start: (input) =>
            Effect.gen(function* () {
              const metadata = buildCheckoutMetadata(input)
              const result = yield* commerce.workflow.startCheckout({
                customerId: input.customerId as never,
                offerId: input.offerId as never,
                successUrl: input.successUrl,
                cancelUrl: input.cancelUrl,
                checkoutUrl: input.checkoutUrl,
                metadata
              })

              return {
                provider: result.provider,
                customerId: input.customerId,
                productId: result.target.productId as unknown as InferProductId<TProducts>,
                offerId: result.target.offerId as unknown as InferOfferId<TProducts>,
                session: {
                  id: result.checkoutSessionId,
                  ...(result.checkoutUrl ? { url: result.checkoutUrl } : {})
                },
                intentId: result.intentId,
                metadata
              } satisfies PayCheckoutResult<TProducts>
            }),
          getIntent: (input) => commerce.workflowStore.findCheckoutIntentById(input)
        },
        customer: {
          getSnapshot: getCommerceSnapshot,
          refreshSnapshot: (input) => commerce.projection.refreshCustomerSnapshot(input),
          getEntitlements,
          computeEntitlements: (input) => commerce.projection.computeCustomerEntitlements(input)
        },
        subscriptions: {
          getCurrent: getCurrentSubscription,
          cancel: (input) => commerce.workflow.cancelSubscription(input),
          change: (input) => commerce.workflow.changeSubscription(input),
          pause: (input) => commerce.workflow.pauseSubscription(input),
          resume: (input) => commerce.workflow.resumeSubscription(input),
          previewChange: (input) => commerce.workflow.previewSubscriptionChange(input)
        },
        purchases: {
          refund: (input) => commerce.workflow.refundPurchase(input),
          getGrant: (input) => commerce.workflow.getPurchaseGrant(input)
        },
        credits: {
          getWallet: (input) => commerce.workflow.getCreditWallet(input),
          consume: (input) => commerce.workflow.consumeCredits(input),
          grant: (input) => commerce.workflow.grantCredits(input)
        },
        webhooks: {
          handle: (input) => commerce.workflow.receiveWebhook(input),
          replay: (input) => commerce.workflow.replayWebhook(input)
        },
        portal: {
          createSession: (input) => commerce.workflow.createPortalSession(input)
        }
      }

      return state
    })
  )

  const layer = <T extends Context.Tag<Self, Service>>(serviceTag: T) =>
    Layer.unwrapEffect(
      Effect.gen(function* () {
        const base = yield* baseTag

        return Layer.succeed(serviceTag, { ...base } as Service)
      })
    ).pipe(Layer.provide(make), Layer.provide(storageLayer))

  const make_ = <T extends Context.Tag<Self, Service>, E, R>(
    serviceTag: T,
    makeCustom: Effect.Effect<Shape, E, R | BasePay>
  ) =>
    Layer.unwrapEffect(
      Effect.gen(function* () {
        const base = yield* baseTag
        const custom = yield* makeCustom

        return Layer.succeed(serviceTag, { ...base, ...custom } as Service)
      })
    ).pipe(Layer.provide(make), Layer.provide(storageLayer))

  void Object.assign(tag, {
    plans,
    products,
    layer,
    make: make_
  })

  return tag
}

export { BaseSDK as PurchaseSDK }
export { PayProvider, PayProviderConfig, PurchaseProvider, PurchaseProviderConfig } from "./provider.ts"

const isCurrentCommercialSubscriptionStatus = (status: SubscriptionAgreementState["status"]) =>
  status === "trialing" || status === "active" || status === "grace" || status === "paused"

const buildCheckoutMetadata = <TProducts extends ReadonlyArray<unknown>>(input: PayCheckoutRequest<TProducts>) => ({
  ...input.metadata,
  payCustomerId: input.customerId,
  payOfferId: input.offerId,
  ...(input.successUrl ? { paySuccessUrl: input.successUrl } : {}),
  ...(input.cancelUrl ? { payCancelUrl: input.cancelUrl } : {})
})
