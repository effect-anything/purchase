import type { Utc } from "effect/DateTime"

import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"

import type { BillingPortalSession, CheckoutSession, SubscriptionChangePreview } from "../internal/provider-schema.ts"
import type { ServicesReturns } from "../internal/types.ts"
import type { PaymentClient, PaymentWebhookNormalization } from "../provider/client.ts"
import type { PaymentProviderTag } from "../provider/type.ts"

import { PayStorageAdapter } from "../db.ts"
import { PaymentImpl } from "../provider/impl.ts"
import { CommercialCatalogService } from "./catalog-service.ts"
import {
  CommercialAgreementNotFound,
  type CommercialCatalogIssue,
  CommercialCustomerNotFound,
  CommercialEvent,
  type CommercialOfferNotFound,
  type PurchaseGrantState,
  type CommercialOffer,
  type SubscriptionAgreementState
} from "./commercial-schema.ts"
import { CommercialProjectionService } from "./projection-service.ts"
import {
  explainUnsupportedPause,
  explainUnsupportedPortalFlow,
  explainUnsupportedResume,
  resolvePauseMode,
  resolveResumeMode
} from "./provider-capability.ts"
import {
  type CancelSubscriptionInput,
  type ChangeSubscriptionInput,
  CommercialReconciliationTrigger,
  CommercialWebhookRejected,
  CommercialWorkflowConflict,
  type CreatePortalSessionInput,
  type CreditConsumeInput,
  type CreditGrantInput,
  CreditWalletResult,
  type PauseSubscriptionInput,
  type PreviewSubscriptionChangeInput,
  type ReceiveWebhookInput,
  ReceiveWebhookResult,
  type RefundPurchaseInput,
  type ReplayWebhookInput,
  type ResumeSubscriptionInput,
  type StartCheckoutInput,
  StartCheckoutResult,
  WorkflowReceipt
} from "./workflow-schema.ts"
import { CommercialWorkflowStore } from "./workflow-store.ts"

export class CommercialWorkflowService extends Context.Tag("@pay/core/CommercialWorkflowService")<
  CommercialWorkflowService,
  {
    readonly startCheckout: (
      input: StartCheckoutInput
    ) => Effect.Effect<
      StartCheckoutResult,
      CommercialCustomerNotFound | CommercialOfferNotFound | CommercialCatalogIssue | CommercialWorkflowConflict
    >
    readonly cancelSubscription: (
      input: CancelSubscriptionInput
    ) => Effect.Effect<WorkflowReceipt, CommercialAgreementNotFound | CommercialWorkflowConflict>
    readonly changeSubscription: (
      input: ChangeSubscriptionInput
    ) => Effect.Effect<
      WorkflowReceipt,
      CommercialAgreementNotFound | CommercialOfferNotFound | CommercialWorkflowConflict
    >
    readonly pauseSubscription: (
      input: PauseSubscriptionInput
    ) => Effect.Effect<WorkflowReceipt, CommercialAgreementNotFound | CommercialWorkflowConflict>
    readonly resumeSubscription: (
      input: ResumeSubscriptionInput
    ) => Effect.Effect<WorkflowReceipt, CommercialAgreementNotFound | CommercialWorkflowConflict>
    readonly previewSubscriptionChange: (
      input: PreviewSubscriptionChangeInput
    ) => Effect.Effect<SubscriptionChangePreview, CommercialAgreementNotFound | CommercialWorkflowConflict>
    readonly refundPurchase: (
      input: RefundPurchaseInput
    ) => Effect.Effect<WorkflowReceipt, CommercialAgreementNotFound | CommercialWorkflowConflict>
    readonly getPurchaseGrant: (input: {
      readonly customerId: string
      readonly agreementId: string
    }) => Effect.Effect<Option.Option<PurchaseGrantState>>
    readonly getCreditWallet: (input: {
      readonly customerId: string
      readonly creditKey: string
    }) => Effect.Effect<CreditWalletResult>
    readonly grantCredits: (
      input: CreditGrantInput
    ) => Effect.Effect<CreditWalletResult, CommercialWorkflowConflict | CommercialCatalogIssue>
    readonly consumeCredits: (
      input: CreditConsumeInput
    ) => Effect.Effect<CreditWalletResult, CommercialWorkflowConflict | CommercialCatalogIssue>
    readonly createPortalSession: (
      input: CreatePortalSessionInput
    ) => Effect.Effect<BillingPortalSession, CommercialCustomerNotFound | CommercialWorkflowConflict>
    readonly receiveWebhook: (
      input: ReceiveWebhookInput
    ) => Effect.Effect<ReceiveWebhookResult, CommercialWebhookRejected | CommercialWorkflowConflict>
    readonly replayWebhook: (
      input: ReplayWebhookInput
    ) => Effect.Effect<ReceiveWebhookResult, CommercialWebhookRejected | CommercialWorkflowConflict>
  }
>() {}
export declare namespace CommercialWorkflowService {
  export type Methods = Context.Tag.Service<CommercialWorkflowService>
  export type Returns<key extends keyof Methods, R = never> = ServicesReturns<Methods[key], R>
}

const asRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {}
    } catch {
      return {}
    }
  }

  return {}
}

const readString = (record: Record<string, unknown>, keys: ReadonlyArray<string>): string | undefined => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "string" && value.length > 0) {
      return value
    }
  }

  return undefined
}

const asStringRecord = (record: Record<string, unknown>): Record<string, string> =>
  Object.fromEntries(Object.entries(record).filter((entry): entry is [string, string] => typeof entry[1] === "string"))

const buildTrigger = (input: { readonly event: typeof CommercialEvent.Type }) => {
  switch (input.event.kind) {
    case "checkout_completed":
    case "subscription_updated":
    case "transaction_updated":
    case "refund_updated":
    case "customer_updated":
      return CommercialReconciliationTrigger.make({
        reason: input.event.kind,
        ...(input.event.customerId ? { customerId: input.event.customerId } : {}),
        ...(input.event.offerId ? { offerId: input.event.offerId } : {}),
        sourceEventId: input.event.id
      })
    case "webhook_unhandled":
      return undefined
  }
}

const resolveCheckoutSessionId = (session: CheckoutSession): string | undefined =>
  session.token ?? session.providerTransactionId ?? session.providerSubscriptionId

const mapInvoiceStatus = (eventType: string, payloadStatus: string | undefined) => {
  if (eventType.includes("refund") || eventType.includes("adjustment.")) {
    return "refunded"
  }

  if (eventType.includes("payment_failed")) {
    return "failed"
  }

  if (eventType.includes("paid") || eventType.includes("completed")) {
    return "paid"
  }

  if (eventType.includes("created")) {
    return "created"
  }

  return payloadStatus ?? "pending"
}

const mapSubscriptionProjectionStatus = (event: PaymentWebhookNormalization) => {
  if (event.eventType === "checkout.session.completed" || event.eventType === "checkout.completed") {
    return event.status === "trialing" ? "trialing" : "active"
  }

  if (event.eventType.includes("deleted") || event.eventType.includes("canceled")) {
    return "canceled"
  }

  if (event.eventType.includes("paused")) {
    return "paused"
  }

  return event.status ?? "pending"
}

const resolveCustomerProfileUpdate = (normalizedEvent: PaymentWebhookNormalization) => {
  const resource = normalizedEvent.resource
  const email = readString(resource, ["email", "customer_email", "customerEmail"])
  const name = readString(resource, ["name", "customer_name", "customerName"])
  const metadata = asStringRecord(asRecord(resource.metadata ?? resource.custom_data ?? resource.customData))

  return {
    ...(email ? { email } : {}),
    ...(name ? { name } : {}),
    ...(Object.keys(metadata).length > 0 ? { metadata } : {})
  }
}

const ensureProviderCustomer = (input: {
  readonly payment: PaymentClient
  readonly provider: PaymentProviderTag
  readonly customerId: string
  readonly workflowStore: CommercialWorkflowStore.Methods
}) =>
  Effect.gen(function* () {
    const customer = yield* input.workflowStore.getCustomerProfile({ customerId: input.customerId }).pipe(
      Effect.flatMap(
        Option.match({
          onNone: () => Effect.fail(new CommercialCustomerNotFound({ customerId: input.customerId as never })),
          onSome: Effect.succeed
        })
      )
    )

    const existing = customer.provider[input.provider]
    if (typeof existing === "string" && existing.length > 0) {
      return existing
    }

    if (!customer.email) {
      return yield* new CommercialWorkflowConflict({
        workflow: "checkout.start",
        message: `Customer "${input.customerId}" has no email for provider lookup`
      })
    }

    const customerEmail = customer.email
    const located = yield* input.payment.customers.find({ email: customerEmail as never })
    const providerCustomer = yield* Option.match(located, {
      onNone: () =>
        input.payment.customers.create({
          userId: input.customerId,
          email: customerEmail as never,
          ...(customer.name ? { name: customer.name } : {})
        }),
      onSome: Effect.succeed
    })

    yield* input.workflowStore.attachProviderCustomer({
      customerId: input.customerId,
      provider: input.provider,
      providerCustomerId: providerCustomer.id
    })

    return providerCustomer.id
  })

const normalizeCommercialEvents = (input: {
  readonly provider: PaymentProviderTag
  readonly rawEvent: unknown
  readonly normalizedEvent: PaymentWebhookNormalization
  readonly customerId?: string | undefined
  readonly offerId?: string | undefined
}) =>
  Effect.succeed([
    CommercialEvent.make({
      id: `${input.provider}:${input.normalizedEvent.providerEventId}` as never,
      providerEventId: input.normalizedEvent.providerEventId as never,
      provider: input.provider,
      kind: input.normalizedEvent.kind,
      occurredAt: input.normalizedEvent.occurredAt ?? new Date(),
      ...(input.customerId ? { customerId: input.customerId as never } : {}),
      ...(input.offerId ? { offerId: input.offerId as never } : {}),
      payload: asRecord(input.rawEvent)
    })
  ] as const)

export const CommercialWorkflowServiceLayer = Layer.effect(
  CommercialWorkflowService,
  Effect.gen(function* () {
    const paymentImpl = yield* PaymentImpl
    const payment = yield* paymentImpl.make
    const catalogService = yield* CommercialCatalogService
    const workflowStore = yield* CommercialWorkflowStore
    const projectionService = yield* CommercialProjectionService
    const storage = yield* PayStorageAdapter
    const provider = paymentImpl._tag

    const resolveOfferByProviderOfferId = Effect.fn("resolveOfferByProviderOfferId")(function* (
      providerOfferId: string
    ) {
      return yield* workflowStore.findProviderRef({ provider, providerId: providerOfferId, kind: "offer" }).pipe(
        Effect.flatMap(
          Option.match({
            onNone: () =>
              storage.product.findMany({}).pipe(
                Effect.map((rows) =>
                  rows.find((row) => {
                    const providerMap = asRecord(row.provider)
                    return providerMap[provider] === providerOfferId
                  })
                ),
                Effect.map(Option.fromNullable),
                Effect.orDie
              ),
            onSome: (ref) => storage.product.findFirst({ where: [["id", ref.ownerId]] }).pipe(Effect.orDie)
          })
        )
      )
    })

    const resolveOfferId = Effect.fn("resolveOfferId")(function* (input: {
      readonly metadata: Record<string, unknown>
      readonly normalizedEvent: PaymentWebhookNormalization
    }) {
      const directOfferId = readString(input.metadata, ["payOfferId", "offerId"])
      if (directOfferId) {
        return directOfferId
      }
      const checkoutSessionId = input.normalizedEvent.checkoutSessionId
      if (checkoutSessionId) {
        const checkoutIntent = yield* workflowStore.findCheckoutIntentByProviderSession({
          providerCheckoutSessionId: checkoutSessionId
        })
        if (Option.isSome(checkoutIntent)) {
          return checkoutIntent.value.offerId
        }
      }
      const providerOfferId = input.normalizedEvent.providerOfferId
      if (!providerOfferId) {
        return undefined
      }
      const product = yield* resolveOfferByProviderOfferId(providerOfferId)
      return Option.match(product, {
        onNone: () => undefined,
        onSome: (row) => row.id
      })
    })

    const resolveCustomerId = Effect.fn("resolveCustomerId")(function* (input: {
      readonly metadata: Record<string, unknown>
      readonly normalizedEvent: PaymentWebhookNormalization
    }) {
      const directCustomerId = readString(input.metadata, ["payCustomerId", "customerId"])
      if (directCustomerId) {
        return directCustomerId
      }
      const providerCustomerId = input.normalizedEvent.providerCustomerId
      if (providerCustomerId) {
        const customer = yield* workflowStore.findCustomerByProviderRef({
          provider,
          providerCustomerId
        })
        if (Option.isSome(customer)) {
          return customer.value.id
        }
      }
      const checkoutSessionId = input.normalizedEvent.checkoutSessionId
      if (checkoutSessionId) {
        const checkoutIntent = yield* workflowStore.findCheckoutIntentByProviderSession({
          providerCheckoutSessionId: checkoutSessionId
        })
        if (Option.isSome(checkoutIntent)) {
          return checkoutIntent.value.customerId
        }
      }
      const providerSubscriptionId = input.normalizedEvent.providerSubscriptionId
      if (providerSubscriptionId) {
        const subscription = yield* storage.subscription
          .findFirst({
            where: [["providerId", providerSubscriptionId]]
          })
          .pipe(Effect.orDie)
        if (Option.isSome(subscription)) {
          return subscription.value.customerId
        }
      }
      const providerInvoiceId = input.normalizedEvent.providerInvoiceId
      if (providerInvoiceId) {
        const invoice = yield* storage.invoice
          .findFirst({ where: [["providerId", providerInvoiceId]] })
          .pipe(Effect.orDie)
        if (Option.isSome(invoice)) {
          return invoice.value.customerId
        }
      }
      return undefined
    })

    const resolveSubscriptionProduct = (offerId: string) =>
      storage.product
        .findFirst({
          where: [
            ["id", offerId],
            ["version", 1]
          ]
        })
        .pipe(Effect.orDie)

    const upsertSubscriptionProjectionFromWebhook = Effect.fn("upsertSubscriptionProjectionFromWebhook")(
      function* (input: {
        readonly normalizedEvent: PaymentWebhookNormalization
        readonly customerId: string
        readonly offerId: string
      }) {
        const providerSubscriptionId = input.normalizedEvent.providerSubscriptionId
        if (!providerSubscriptionId) {
          return
        }
        const product = yield* resolveSubscriptionProduct(input.offerId)
        if (Option.isNone(product)) {
          return
        }
        yield* workflowStore.upsertSubscriptionProjection({
          provider,
          id: providerSubscriptionId,
          customerId: input.customerId,
          productInternalId: product.value.internalId,
          providerId: providerSubscriptionId,
          providerData: {
            ...input.normalizedEvent.resource,
            offerId: input.offerId
          },
          status: mapSubscriptionProjectionStatus(input.normalizedEvent),
          canceled: input.normalizedEvent.canceled ?? false,
          cancelAtPeriodEnd: input.normalizedEvent.cancelAtPeriodEnd ?? false,
          startedAt: input.normalizedEvent.startedAt,
          trialEndsAt: input.normalizedEvent.trialEndsAt,
          currentPeriodStartAt: input.normalizedEvent.currentPeriodStartAt,
          currentPeriodEndAt: input.normalizedEvent.currentPeriodEndAt,
          canceledAt: input.normalizedEvent.canceledAt,
          endedAt: input.normalizedEvent.endedAt,
          quantity: input.normalizedEvent.quantity
        })
      }
    )

    const upsertInvoiceProjectionFromWebhook = Effect.fn("upsertInvoiceProjectionFromWebhook")(function* (input: {
      readonly normalizedEvent: PaymentWebhookNormalization
      readonly customerId: string
      readonly offerId?: string | undefined
    }) {
      const providerId = input.normalizedEvent.providerInvoiceId ?? input.normalizedEvent.providerTransactionId
      if (!providerId) {
        return
      }
      const providerSubscriptionId = input.normalizedEvent.providerSubscriptionId
      const localSubscription = providerSubscriptionId
        ? yield* storage.subscription.findFirst({ where: [["providerId", providerSubscriptionId]] }).pipe(Effect.orDie)
        : Option.none<{
            readonly id: string
          }>()
      const offer = input.offerId
        ? yield* catalogService.getOffer({ offerId: input.offerId }).pipe(Effect.orDie)
        : Option.none()
      yield* workflowStore.upsertInvoiceProjection({
        id: providerId,
        customerId: input.customerId,
        subscriptionId: Option.match(localSubscription, {
          onNone: () => undefined,
          onSome: (subscription) => subscription.id
        }),
        type:
          Option.isSome(offer) && offer.value.type === "credits"
            ? "credits"
            : Option.isSome(offer) && offer.value.type === "one_time"
              ? "one_time"
              : providerSubscriptionId
                ? "subscription"
                : "one_time",
        status: mapInvoiceStatus(input.normalizedEvent.eventType, input.normalizedEvent.status),
        amount: input.normalizedEvent.amount ?? 0,
        currency: input.normalizedEvent.currency ?? "USD",
        description: input.normalizedEvent.description,
        hostedUrl: input.normalizedEvent.hostedUrl,
        providerId,
        providerData: {
          ...input.normalizedEvent.resource,
          ...(input.offerId ? { offerId: input.offerId } : {}),
          ...(providerSubscriptionId ? { providerSubscriptionId } : {})
        },
        periodStartAt: input.normalizedEvent.periodStartAt,
        periodEndAt: input.normalizedEvent.periodEndAt
      })
    })

    const updateCustomerProjectionFromWebhook = Effect.fn("updateCustomerProjectionFromWebhook")(function* (input: {
      readonly normalizedEvent: PaymentWebhookNormalization
      readonly customerId: string
    }) {
      const profileUpdate = resolveCustomerProfileUpdate(input.normalizedEvent)
      yield* storage.customer
        .updateFirst({
          where: [["id", input.customerId]],
          set: {
            ...profileUpdate,
            updatedAt: toStorageUtc(new Date())
          }
        })
        .pipe(Effect.asVoid, Effect.orDie)
    })

    const recordCreditsGrantFromWebhook = Effect.fn("recordCreditsGrantFromWebhook")(function* (input: {
      readonly eventId?: string | undefined
      readonly providerEventId: string
      readonly customerId: string
      readonly offerId: string
      readonly offer: CommercialOffer
    }) {
      const creditBenefits = input.offer.benefits.filter((benefit) => benefit.type === "credit_balance")
      yield* Effect.forEach(
        creditBenefits,
        (creditBenefit) =>
          workflowStore.recordCreditLedger({
            id: `${provider}:${input.providerEventId}:credits:${creditBenefit.key}`,
            customerId: input.customerId,
            productId: creditBenefit.key,
            offerId: input.offerId,
            amount: creditBenefit.amount,
            direction: "grant",
            idempotencyKey: `${provider}:${input.providerEventId}:credits:${creditBenefit.key}`,
            sourceEventId: input.eventId,
            reason:
              input.offer.type === "subscription" ? "provider_subscription_invoice_paid" : "provider_transaction_paid"
          }),
        { concurrency: 1, discard: true }
      )
    })

    const recordCreditsRefundFromWebhook = Effect.fn("recordCreditsRefundFromWebhook")(function* (input: {
      readonly eventId?: string | undefined
      readonly providerEventId: string
      readonly customerId: string
      readonly offerId: string
      readonly offer: CommercialOffer
    }) {
      const creditBenefits = input.offer.benefits.filter((benefit) => benefit.type === "credit_balance")
      yield* Effect.forEach(
        creditBenefits,
        (creditBenefit) =>
          workflowStore.recordCreditLedger({
            id: `${provider}:${input.providerEventId}:credits-refund:${creditBenefit.key}`,
            customerId: input.customerId,
            productId: creditBenefit.key,
            offerId: input.offerId,
            amount: creditBenefit.amount,
            direction: "refund",
            idempotencyKey: `${provider}:${input.providerEventId}:credits-refund:${creditBenefit.key}`,
            sourceEventId: input.eventId,
            reason: "provider_refund_updated"
          }),
        { concurrency: 1, discard: true }
      )
    })

    const persistEntitlements = Effect.fn("persistEntitlements")(function* (input: { readonly customerId: string }) {
      const customerSnapshot = yield* projectionService.refreshCustomerSnapshot({
        customerId: input.customerId as never,
        reason: "manual"
      })
      const entitlementSnapshot = yield* projectionService.computeCustomerEntitlements({ customerSnapshot })
      yield* workflowStore.replaceEntitlements({
        customerId: input.customerId,
        entitlements: entitlementSnapshot.benefits.map((benefit) => ({
          id: `${input.customerId}:${benefit.id}`,
          featureId: benefit.key,
          limit:
            benefit.type === "quota_limit" ? benefit.limit : benefit.type === "credit_balance" ? benefit.amount : 1,
          balance: benefit.type === "credit_balance" ? benefit.amount : undefined
        }))
      })
    })

    const getCreditWalletSnapshot = Effect.fn("getCreditWalletSnapshot")(function* (input: {
      readonly customerId: string
      readonly creditKey: string
    }) {
      const wallets = yield* projectionService.listWallets({ customerId: input.customerId })
      const wallet = wallets.find((item) => item.productId === input.creditKey)
      if (wallet) {
        return CreditWalletResult.make({
          customerId: wallet.customerId,
          creditKey: wallet.productId,
          available: wallet.available,
          acquired: wallet.acquired,
          consumed: wallet.consumed,
          refunded: wallet.refunded,
          updatedAt: wallet.updatedAt
        })
      }
      return CreditWalletResult.make({
        customerId: input.customerId as never,
        creditKey: input.creditKey,
        available: 0,
        acquired: 0,
        consumed: 0,
        refunded: 0,
        updatedAt: new Date()
      })
    })

    const requireSubscriptionAgreement = Effect.fn("requireSubscriptionAgreement")(function* (input: {
      readonly customerId: string
      readonly agreementId: string
      readonly workflow:
        | "subscription.cancel"
        | "subscription.change"
        | "subscription.pause"
        | "subscription.resume"
        | "subscription.preview_change"
    }): Effect.fn.Return<SubscriptionAgreementState, CommercialAgreementNotFound | CommercialWorkflowConflict> {
      const agreement = yield* projectionService.getSubscriptionAgreement({ agreementId: input.agreementId })
      if (Option.isNone(agreement)) {
        return yield* new CommercialAgreementNotFound({ agreementId: input.agreementId as never })
      }
      if (agreement.value.customerId !== input.customerId) {
        return yield* new CommercialWorkflowConflict({
          workflow: input.workflow,
          message: `Agreement "${input.agreementId}" does not belong to customer "${input.customerId}"`
        })
      }
      return agreement.value
    })

    const requirePortalAgreement = Effect.fn("requirePortalAgreement")(function* (input: {
      readonly customerId: string
      readonly agreementId: string
    }) {
      const agreement = yield* projectionService.getSubscriptionAgreement({ agreementId: input.agreementId })
      if (Option.isNone(agreement)) {
        return yield* new CommercialWorkflowConflict({
          workflow: "portal.create_session",
          message: `Agreement "${input.agreementId}" was not found`
        })
      }
      if (agreement.value.customerId !== input.customerId) {
        return yield* new CommercialWorkflowConflict({
          workflow: "portal.create_session",
          message: `Agreement "${input.agreementId}" does not belong to customer "${input.customerId}"`
        })
      }
      return agreement.value
    })

    const startCheckout: CommercialWorkflowService.Methods["startCheckout"] = Effect.fn(
      "CommercialWorkflowService.startCheckout"
    )(function* (input): CommercialWorkflowService.Returns<"startCheckout"> {
      const target = yield* catalogService.resolveCheckoutTarget({
        offerId: input.offerId,
        provider
      })

      if (!target.providerOfferId) {
        return yield* new CommercialWorkflowConflict({
          workflow: "checkout.start",
          message: `Offer "${input.offerId}" is missing a ${provider} provider mapping`
        })
      }

      const providerCustomerId = yield* ensureProviderCustomer({
        payment,
        provider,
        customerId: input.customerId,
        workflowStore
      }).pipe(
        Effect.mapError((cause) =>
          cause._tag === "CommercialCustomerNotFound" || cause._tag === "CommercialWorkflowConflict"
            ? cause
            : new CommercialWorkflowConflict({
                workflow: "checkout.start",
                message: `Failed to ensure provider customer for "${input.customerId}": ${String(cause)}`
              })
        )
      )
      const session = yield* payment.checkout
        .prepare({
          projectId: target.productId,
          offerId: target.offerId,
          providerOfferId: target.providerOfferId,
          customerId: input.customerId as never,
          providerCustomerId: providerCustomerId as never,
          successUrl: input.successUrl,
          cancelUrl: input.cancelUrl,
          metadata: input.metadata
        })
        .pipe(
          Effect.mapError(
            (cause) =>
              new CommercialWorkflowConflict({
                workflow: "checkout.start",
                message: `checkout.start provider call failed for "${input.offerId}": ${String(cause)}`
              })
          )
        )
      const intentId = crypto.randomUUID()
      const checkoutSessionId = resolveCheckoutSessionId(session)

      if (!checkoutSessionId) {
        return yield* new CommercialWorkflowConflict({
          workflow: "checkout.start",
          message: `Provider ${provider} did not return a durable checkout session identifier`
        })
      }

      yield* workflowStore.persistCheckoutIntent({
        intentId,
        customerId: input.customerId,
        offerId: input.offerId,
        provider,
        providerCheckoutSessionId: checkoutSessionId,
        ...(session.url ? { checkoutUrl: session.url } : {}),
        metadata: {
          ...input.metadata,
          payCustomerId: input.customerId,
          payOfferId: input.offerId
        }
      })

      yield* Effect.all(
        [
          workflowStore.upsertProviderRef({
            provider,
            ownerType: "customer",
            ownerId: input.customerId,
            providerId: providerCustomerId,
            kind: "customer"
          }),
          target.providerOfferId
            ? workflowStore.upsertProviderRef({
                provider,
                ownerType: "offer",
                ownerId: target.offerId,
                providerId: target.providerOfferId,
                kind: "offer"
              })
            : Effect.void,
          target.providerProductId
            ? workflowStore.upsertProviderRef({
                provider,
                ownerType: "product",
                ownerId: target.productId,
                providerId: target.providerProductId,
                kind: "product"
              })
            : Effect.void
        ],
        { concurrency: 1, discard: true }
      )

      return StartCheckoutResult.make({
        intentId: intentId as never,
        provider,
        target,
        checkoutSessionId: checkoutSessionId as never,
        ...(session.url ? { checkoutUrl: session.url } : {})
      })
    })

    const cancelSubscription: CommercialWorkflowService.Methods["cancelSubscription"] = Effect.fn(
      "CommercialWorkflowService.cancelSubscription"
    )(function* (input) {
      const agreement = yield* requireSubscriptionAgreement({
        customerId: input.customerId,
        agreementId: input.agreementId,
        workflow: "subscription.cancel"
      })

      if (!agreement.providerSubscriptionId) {
        return yield* new CommercialWorkflowConflict({
          workflow: "subscription.cancel",
          message: `Agreement "${input.agreementId}" has no provider subscription id`
        })
      }

      yield* payment.subscriptions.cancel({
        subscriptionId: agreement.providerSubscriptionId as never,
        effectiveFrom: input.effectiveAt === "period_end" ? "next_billing_period" : "immediately"
      })

      return WorkflowReceipt.make({
        workflow: "subscription.cancel",
        stages: ["validate_input", "load_context", "call_provider", "persist_fact"],
        events: [],
        reconciliationTriggers: [
          CommercialReconciliationTrigger.make({
            reason: "subscription_updated",
            customerId: input.customerId
          })
        ]
      })
    })

    const changeSubscription: CommercialWorkflowService.Methods["changeSubscription"] = Effect.fn(
      "CommercialWorkflowService.changeSubscription"
    )(function* (input) {
      const agreement = yield* requireSubscriptionAgreement({
        customerId: input.customerId,
        agreementId: input.agreementId,
        workflow: "subscription.change"
      })
      const targets = yield* catalogService
        .listSubscriptionChangeTargets({ currentOfferId: agreement.offerId })
        .pipe(Effect.orDie)
      const targetAllowed = targets.find((item) => item.id === input.targetOfferId)

      if (!targetAllowed) {
        return yield* new CommercialWorkflowConflict({
          workflow: "subscription.change",
          message: `Offer "${input.targetOfferId}" is not a valid change target for "${agreement.offerId}"`
        })
      }

      if (!agreement.providerSubscriptionId) {
        return yield* new CommercialWorkflowConflict({
          workflow: "subscription.change",
          message: `Agreement "${input.agreementId}" has no provider subscription id`
        })
      }

      const target = yield* catalogService
        .resolveCheckoutTarget({ offerId: input.targetOfferId, provider })
        .pipe(Effect.orDie)
      if (!target.providerOfferId) {
        return yield* new CommercialWorkflowConflict({
          workflow: "subscription.change",
          message: `Offer "${input.targetOfferId}" has no provider mapping for ${provider}`
        })
      }

      yield* payment.subscriptions
        .change({
          subscriptionId: agreement.providerSubscriptionId as never,
          providerOfferId: target.providerOfferId,
          ...(input.prorationMode === "provider_default"
            ? {}
            : {
                prorationMode:
                  input.prorationMode === "period_end" ? "next_billing_period" : (input.prorationMode ?? undefined)
              })
        })
        .pipe(
          Effect.mapError(
            (cause) =>
              new CommercialWorkflowConflict({
                workflow: "subscription.change",
                message: `Provider failed to change subscription "${input.agreementId}": ${String(cause)}`
              })
          )
        )

      return WorkflowReceipt.make({
        workflow: "subscription.change",
        stages: ["validate_input", "load_context", "call_provider", "persist_fact"],
        events: [],
        reconciliationTriggers: [
          CommercialReconciliationTrigger.make({
            reason: "subscription_updated",
            customerId: input.customerId,
            offerId: input.targetOfferId
          })
        ]
      })
    })

    const previewSubscriptionChange: CommercialWorkflowService.Methods["previewSubscriptionChange"] = Effect.fn(
      "CommercialWorkflowService.previewSubscriptionChange"
    )(function* (input) {
      const agreement = yield* requireSubscriptionAgreement({
        customerId: input.customerId,
        agreementId: input.agreementId,
        workflow: "subscription.preview_change"
      })

      if (!agreement.providerSubscriptionId) {
        return yield* new CommercialWorkflowConflict({
          workflow: "subscription.preview_change",
          message: `Agreement "${input.agreementId}" has no provider subscription id`
        })
      }

      const target = yield* catalogService
        .resolveCheckoutTarget({ offerId: input.targetOfferId, provider })
        .pipe(Effect.orDie)
      if (!target.providerOfferId) {
        return yield* new CommercialWorkflowConflict({
          workflow: "subscription.preview_change",
          message: `Offer "${input.targetOfferId}" has no provider mapping for ${provider}`
        })
      }

      return yield* payment.subscriptions
        .previewChange({
          subscriptionId: agreement.providerSubscriptionId as never,
          providerOfferId: target.providerOfferId,
          ...(input.prorationMode === "period_end"
            ? { prorationMode: "next_billing_period" as const }
            : input.prorationMode
              ? { prorationMode: input.prorationMode }
              : {})
        })
        .pipe(
          Effect.mapError(
            (cause) =>
              new CommercialWorkflowConflict({
                workflow: "subscription.preview_change",
                message: `Provider failed to preview subscription "${input.agreementId}": ${String(cause)}`
              })
          )
        )
    })

    const pauseSubscription: CommercialWorkflowService.Methods["pauseSubscription"] = Effect.fn(
      "CommercialWorkflowService.pauseSubscription"
    )(function* (input) {
      const mode = resolvePauseMode({ provider, request: input })
      const unsupportedReason = explainUnsupportedPause({ provider, request: input })
      if (unsupportedReason) {
        return yield* new CommercialWorkflowConflict({
          workflow: "subscription.pause",
          message: unsupportedReason
        })
      }

      const agreement = yield* requireSubscriptionAgreement({
        customerId: input.customerId,
        agreementId: input.agreementId,
        workflow: "subscription.pause"
      })

      if (!agreement.providerSubscriptionId) {
        return yield* new CommercialWorkflowConflict({
          workflow: "subscription.pause",
          message: `Agreement "${input.agreementId}" has no provider subscription id`
        })
      }

      yield* payment.subscriptions
        .pause({
          subscriptionId: agreement.providerSubscriptionId as never,
          mode,
          effectiveFrom:
            input.effectiveAt === "period_end"
              ? "next_billing_period"
              : input.effectiveAt === "immediately" || mode === "billing_collection"
                ? "immediately"
                : undefined,
          resumeAt: input.resumeAt
        } as never)
        .pipe(
          Effect.mapError(
            (cause) =>
              new CommercialWorkflowConflict({
                workflow: "subscription.pause",
                message: `Provider failed to pause subscription "${input.agreementId}": ${String(cause)}`
              })
          )
        )

      return WorkflowReceipt.make({
        workflow: "subscription.pause",
        stages: ["validate_input", "load_context", "call_provider", "persist_fact"],
        events: [],
        reconciliationTriggers: [
          CommercialReconciliationTrigger.make({
            reason: "subscription_updated",
            customerId: input.customerId,
            agreementId: input.agreementId,
            offerId: agreement.offerId
          })
        ]
      })
    })

    const resumeSubscription: CommercialWorkflowService.Methods["resumeSubscription"] = Effect.fn(
      "CommercialWorkflowService.resumeSubscription"
    )(function* (input) {
      const mode = resolveResumeMode({ provider, request: input })
      const unsupportedReason = explainUnsupportedResume({ provider, request: input })
      if (unsupportedReason) {
        return yield* new CommercialWorkflowConflict({
          workflow: "subscription.resume",
          message: unsupportedReason
        })
      }

      const agreement = yield* requireSubscriptionAgreement({
        customerId: input.customerId,
        agreementId: input.agreementId,
        workflow: "subscription.resume"
      })

      if (!agreement.providerSubscriptionId) {
        return yield* new CommercialWorkflowConflict({
          workflow: "subscription.resume",
          message: `Agreement "${input.agreementId}" has no provider subscription id`
        })
      }

      yield* payment.subscriptions
        .resume({
          subscriptionId: agreement.providerSubscriptionId as never,
          mode,
          effectiveFrom: input.effectiveAt ?? "immediately"
        } as never)
        .pipe(
          Effect.mapError(
            (cause) =>
              new CommercialWorkflowConflict({
                workflow: "subscription.resume",
                message: `Provider failed to resume subscription "${input.agreementId}": ${String(cause)}`
              })
          )
        )

      return WorkflowReceipt.make({
        workflow: "subscription.resume",
        stages: ["validate_input", "load_context", "call_provider", "persist_fact"],
        events: [],
        reconciliationTriggers: [
          CommercialReconciliationTrigger.make({
            reason: "subscription_updated",
            customerId: input.customerId,
            agreementId: input.agreementId,
            offerId: agreement.offerId
          })
        ]
      })
    })

    const refundPurchase: (typeof CommercialWorkflowService.Service)["refundPurchase"] = Effect.fn(
      "CommercialWorkflowService.refundPurchase"
    )(function* (input) {
      const purchase = yield* storage.invoice
        .findFirst({
          where: [
            ["id", input.agreementId],
            ["customerId", input.customerId]
          ]
        })
        .pipe(
          Effect.orDie,
          Effect.flatMap(
            Option.match({
              onNone: () => Effect.fail(new CommercialAgreementNotFound({ agreementId: input.agreementId })),
              onSome: Effect.succeed
            })
          )
        )

      if (purchase.type !== "one_time") {
        return yield* new CommercialWorkflowConflict({
          workflow: "purchase.refund",
          message: `Agreement "${input.agreementId}" is not a refundable one-time purchase`
        })
      }

      if (purchase.status === "refunded") {
        return yield* new CommercialWorkflowConflict({
          workflow: "purchase.refund",
          message: `Agreement "${input.agreementId}" is already refunded`
        })
      }

      if (!purchase.providerId) {
        return yield* new CommercialWorkflowConflict({
          workflow: "purchase.refund",
          message: `Agreement "${input.agreementId}" has no provider transaction id`
        })
      }

      const refund = yield* payment.refunds
        .create({
          transactionId: purchase.providerId as never,
          ...(input.amount !== undefined ? { amount: String(input.amount) } : {})
        })
        .pipe(
          Effect.mapError(
            (cause) =>
              new CommercialWorkflowConflict({
                workflow: "purchase.refund",
                message: `purchase.refund provider call failed for "${input.agreementId}": ${String(cause)}`
              })
          )
        )

      yield* storage.invoice
        .updateFirst({
          where: [["id", purchase.id]],
          set: {
            status: refund.status === "succeeded" ? "refunded" : purchase.status,
            providerData: {
              ...asRecord(purchase.providerData),
              latestRefund: {
                id: refund.id,
                status: refund.status,
                providerStatus: refund.providerStatus,
                amount: refund.amount,
                currencyCode: refund.currencyCode,
                createdAt: refund.createdAt.toISOString(),
                updatedAt: refund.updatedAt.toISOString(),
                ...(input.reason ? { reason: input.reason } : {})
              }
            },
            updatedAt: toStorageUtc(new Date())
          }
        })
        .pipe(Effect.orDie)

      const offerId = readString(asRecord(purchase.providerData), ["offerId"])
      const offer = offerId ? yield* catalogService.getOffer({ offerId }).pipe(Effect.orDie) : Option.none()
      if (offerId && Option.isSome(offer)) {
        const creditBenefits = offer.value.benefits.filter((benefit) => benefit.type === "credit_balance")
        yield* Effect.forEach(
          creditBenefits,
          (creditBenefit) =>
            workflowStore.recordCreditLedger({
              id: `${refund.id}:refund:${creditBenefit.key}`,
              customerId: input.customerId,
              productId: creditBenefit.key,
              offerId,
              amount: creditBenefit.amount,
              direction: "refund",
              idempotencyKey: `refund:${refund.id}:${creditBenefit.key}`,
              reason: input.reason
            }),
          { concurrency: 1, discard: true }
        )
      }

      yield* persistEntitlements({ customerId: input.customerId }).pipe(Effect.orDie)

      return WorkflowReceipt.make({
        workflow: "purchase.refund",
        stages: [
          "validate_input",
          "load_context",
          "call_provider",
          "persist_fact",
          "refresh_projection",
          "recompute_entitlements"
        ],
        events: [],
        reconciliationTriggers: [
          CommercialReconciliationTrigger.make({
            reason: "refund_updated",
            customerId: input.customerId,
            agreementId: input.agreementId,
            offerId: offerId as never
          })
        ]
      })
    })

    const getPurchaseGrant: (typeof CommercialWorkflowService.Service)["getPurchaseGrant"] = ({
      customerId,
      agreementId
    }) =>
      projectionService
        .listPurchases({ customerId })
        .pipe(Effect.map((purchases) => Option.fromNullable(purchases.find((purchase) => purchase.id === agreementId))))

    const getCreditWallet: (typeof CommercialWorkflowService.Service)["getCreditWallet"] = getCreditWalletSnapshot

    const grantCredits: (typeof CommercialWorkflowService.Service)["grantCredits"] = Effect.fn(
      "CommercialWorkflowService.grantCredits"
    )(function* (input) {
      if (input.amount <= 0) {
        return yield* new CommercialWorkflowConflict({
          workflow: "credits.grant",
          message: "Credit grant amount must be positive"
        })
      }

      yield* workflowStore.recordCreditLedger({
        id: crypto.randomUUID(),
        customerId: input.customerId,
        productId: input.creditKey,
        offerId: input.offerId,
        amount: input.amount,
        direction: "grant",
        idempotencyKey: input.idempotencyKey,
        sourceEventId: input.sourceEventId,
        reason: input.reason
      })
      yield* persistEntitlements({ customerId: input.customerId }).pipe(Effect.orDie)

      return yield* getCreditWalletSnapshot({ customerId: input.customerId, creditKey: input.creditKey })
    })

    const consumeCredits: CommercialWorkflowService.Methods["consumeCredits"] = Effect.fn(
      "CommercialWorkflowService.consumeCredits"
    )(function* (input): CommercialWorkflowService.Returns<"consumeCredits"> {
      if (input.amount <= 0) {
        return yield* new CommercialWorkflowConflict({
          workflow: "credits.consume",
          message: "Credit consume amount must be positive"
        })
      }

      const before = yield* getCreditWalletSnapshot({ customerId: input.customerId, creditKey: input.creditKey })
      if (before.available < input.amount) {
        return yield* new CommercialWorkflowConflict({
          workflow: "credits.consume",
          message: `Insufficient credits for "${input.creditKey}": requested ${input.amount}, available ${before.available}`
        })
      }

      yield* workflowStore.recordCreditLedger({
        id: crypto.randomUUID(),
        customerId: input.customerId,
        productId: input.creditKey,
        amount: input.amount,
        direction: "consume",
        idempotencyKey: input.idempotencyKey,
        reason: input.reason
      })
      yield* persistEntitlements({ customerId: input.customerId }).pipe(Effect.orDie)

      return yield* getCreditWalletSnapshot({ customerId: input.customerId, creditKey: input.creditKey })
    })

    const createPortalSession: CommercialWorkflowService.Methods["createPortalSession"] = Effect.fn(
      "CommercialWorkflowService.createPortalSession"
    )(function* (input): CommercialWorkflowService.Returns<"createPortalSession"> {
      const providerCustomerId = yield* ensureProviderCustomer({
        payment,
        provider,
        customerId: input.customerId,
        workflowStore
      }).pipe(
        Effect.mapError((cause) =>
          cause._tag === "CommercialCustomerNotFound" || cause._tag === "CommercialWorkflowConflict"
            ? cause
            : new CommercialWorkflowConflict({
                workflow: "portal.create_session",
                message: `Failed to ensure provider customer for "${input.customerId}": ${String(cause)}`
              })
        )
      )
      const agreement = input.agreementId
        ? yield* requirePortalAgreement({
            customerId: input.customerId,
            agreementId: input.agreementId
          }).pipe(Effect.map(Option.some))
        : Option.none()

      const agreementValue = Option.getOrUndefined(agreement)
      const unsupportedReason = explainUnsupportedPortalFlow({
        provider,
        request: input,
        hasProviderSubscriptionId: Boolean(agreementValue?.providerSubscriptionId)
      })

      if (unsupportedReason) {
        return yield* new CommercialWorkflowConflict({
          workflow: "portal.create_session",
          message: unsupportedReason
        })
      }

      return yield* payment.billingPortal
        .createSession({
          providerCustomerId: providerCustomerId as never,
          providerSubscriptionId: agreementValue?.providerSubscriptionId as never,
          flow: input.flow,
          returnUrl: input.returnUrl
        })
        .pipe(
          Effect.mapError(
            (cause) =>
              new CommercialWorkflowConflict({
                workflow: "portal.create_session",
                message: `portal.create_session provider call failed for "${input.customerId}": ${String(cause)}`
              })
          )
        )
    })

    const receiveWebhook: CommercialWorkflowService.Methods["receiveWebhook"] = Effect.fn(
      "CommercialWorkflowService.receiveWebhook"
    )(function* (input): CommercialWorkflowService.Returns<"receiveWebhook"> {
      if (input.provider !== provider) {
        return yield* new CommercialWebhookRejected({
          provider: input.provider,
          message: `Webhook provider "${input.provider}" does not match active pay provider "${provider}"`
        })
      }

      const rawEvent = yield* payment
        .webhooksUnmarshal({
          payload: input.body,
          signature: input.signature
        })
        .pipe(
          Effect.mapError((error) => new CommercialWebhookRejected({ provider: input.provider, message: error.error }))
        )

      const normalizedEvent = yield* payment.webhooksNormalize(rawEvent)
      const providerEventId = normalizedEvent.providerEventId
      const eventType = normalizedEvent.eventType

      const persisted = yield* workflowStore.persistWebhookReceipt({
        provider: input.provider,
        providerEventId,
        type: eventType,
        payload: asRecord(rawEvent)
      })

      if (persisted.duplicate) {
        return ReceiveWebhookResult.make({
          workflow: "webhook.receive",
          eventId: `${input.provider}:${providerEventId}` as never,
          providerEventId: providerEventId as never,
          accepted: false,
          normalizedEvents: [],
          reconciliationTriggers: []
        })
      }

      const customerId = yield* resolveCustomerId({
        metadata: normalizedEvent.metadata,
        normalizedEvent
      })
      const offerId = yield* resolveOfferId({
        metadata: normalizedEvent.metadata,
        normalizedEvent
      })

      const events = yield* normalizeCommercialEvents({
        provider: input.provider,
        rawEvent,
        normalizedEvent,
        customerId,
        offerId
      })
      const reconciliationTriggers = events.map((event) => buildTrigger({ event })).filter((item) => item !== undefined)

      const refreshCustomers = Array.from(
        new Set(
          [...reconciliationTriggers.map((trigger) => trigger.customerId), customerId].filter(
            (value) => value !== undefined
          )
        )
      )

      const process = Effect.gen(function* () {
        yield* workflowStore.persistCommercialEvents({ events })

        if (normalizedEvent.checkoutSessionId && normalizedEvent.kind === "checkout_completed") {
          yield* workflowStore.markCheckoutIntentStatus({
            providerCheckoutSessionId: normalizedEvent.checkoutSessionId,
            status: "accepted"
          })
        }

        if (customerId && normalizedEvent.providerCustomerId) {
          yield* workflowStore
            .attachProviderCustomer({
              customerId,
              provider: input.provider,
              providerCustomerId: normalizedEvent.providerCustomerId
            })
            .pipe(Effect.catchTag("CommercialCustomerNotFound", () => Effect.void))
        }

        if (customerId && normalizedEvent.kind === "customer_updated") {
          yield* updateCustomerProjectionFromWebhook({
            normalizedEvent,
            customerId
          })
        }

        if (customerId && offerId && normalizedEvent.kind === "checkout_completed") {
          const offer = yield* catalogService.getOffer({ offerId }).pipe(Effect.orDie)
          if (Option.isSome(offer) && offer.value.type === "subscription" && normalizedEvent.providerSubscriptionId) {
            yield* upsertSubscriptionProjectionFromWebhook({
              normalizedEvent,
              customerId,
              offerId
            })
          }
        }

        if (customerId && offerId && normalizedEvent.kind === "subscription_updated") {
          yield* upsertSubscriptionProjectionFromWebhook({
            normalizedEvent,
            customerId,
            offerId
          })

          if (normalizedEvent.providerSubscriptionId) {
            yield* workflowStore.upsertProviderRef({
              provider: input.provider,
              ownerType: "subscription",
              ownerId: normalizedEvent.providerSubscriptionId,
              providerId: normalizedEvent.providerSubscriptionId,
              kind: "subscription"
            })
          }
        }

        if (
          customerId &&
          (normalizedEvent.kind === "transaction_updated" || normalizedEvent.kind === "refund_updated")
        ) {
          yield* upsertInvoiceProjectionFromWebhook({
            normalizedEvent,
            customerId,
            offerId
          })

          const offer = offerId ? yield* catalogService.getOffer({ offerId }).pipe(Effect.orDie) : Option.none()
          const providerId = normalizedEvent.providerInvoiceId ?? normalizedEvent.providerTransactionId
          if (providerId) {
            yield* workflowStore.upsertProviderRef({
              provider: input.provider,
              ownerType: "invoice",
              ownerId: providerId,
              providerId,
              kind: normalizedEvent.kind === "refund_updated" ? "refund" : "invoice"
            })
          }

          if (
            customerId &&
            offerId &&
            Option.isSome(offer) &&
            offer.value.benefits.some((benefit) => benefit.type === "credit_balance") &&
            normalizedEvent.kind === "transaction_updated" &&
            mapInvoiceStatus(normalizedEvent.eventType, normalizedEvent.status) === "paid"
          ) {
            yield* recordCreditsGrantFromWebhook({
              eventId: events[0]?.id,
              providerEventId,
              customerId,
              offerId,
              offer: offer.value
            })
          }

          if (
            customerId &&
            offerId &&
            Option.isSome(offer) &&
            offer.value.benefits.some((benefit) => benefit.type === "credit_balance") &&
            normalizedEvent.kind === "refund_updated"
          ) {
            yield* recordCreditsRefundFromWebhook({
              eventId: events[0]?.id,
              providerEventId,
              customerId,
              offerId,
              offer: offer.value
            })
          }
        }

        yield* Effect.forEach(
          refreshCustomers,
          (refreshCustomerId) => persistEntitlements({ customerId: refreshCustomerId }),
          {
            concurrency: 1,
            discard: true
          }
        )
      })

      yield* process.pipe(
        Effect.matchCauseEffect({
          onSuccess: () =>
            workflowStore.markWebhookProcessed({
              provider: input.provider,
              providerEventId
            }),
          onFailure: (error) =>
            workflowStore
              .markWebhookFailed({
                provider: input.provider,
                providerEventId,
                error: String(error)
              })
              .pipe(
                Effect.flatMap(() =>
                  Effect.fail(
                    new CommercialWorkflowConflict({
                      workflow: "webhook.receive",
                      message: `Webhook processing failed for ${providerEventId}`
                    })
                  )
                )
              )
        })
      )

      return ReceiveWebhookResult.make({
        workflow: "webhook.receive",
        eventId: events[0]?.id ?? (`${input.provider}:${providerEventId}` as never),
        providerEventId: providerEventId as never,
        accepted: true,
        normalizedEvents: [...events],
        reconciliationTriggers
      })
    })

    const replayWebhook: CommercialWorkflowService.Methods["replayWebhook"] = Effect.fn(
      "CommercialWorkflowService.replayWebhook"
    )(function* (input): CommercialWorkflowService.Returns<"replayWebhook"> {
      const receipt = yield* storage.webhookEvent
        .findFirst({
          where: [
            ["providerId", input.provider],
            ["providerEventId", input.providerEventId]
          ]
        })
        .pipe(Effect.orDie)

      if (Option.isNone(receipt)) {
        return yield* new CommercialWebhookRejected({
          provider: input.provider,
          message: `Webhook "${input.providerEventId}" was not found`
        })
      }

      const event = yield* storage.commercialEvent
        .findFirst({
          where: [["providerEventId", input.providerEventId]]
        })
        .pipe(Effect.orDie)

      const normalizedEvents = Option.match(event, {
        onNone: () => [] as const,
        onSome: (row) => [
          CommercialEvent.make({
            id: row.id as never,
            provider: row.provider as never,
            providerEventId: row.providerEventId as never,
            kind: row.kind as never,
            occurredAt: row.occurredAt instanceof Date ? row.occurredAt : new Date(row.occurredAt as never),
            ...(row.customerId ? { customerId: row.customerId as never } : {}),
            ...(row.offerId ? { offerId: row.offerId as never } : {}),
            ...(row.agreementId ? { agreementId: row.agreementId as never } : {}),
            payload: asRecord(row.payload)
          })
        ]
      })

      return ReceiveWebhookResult.make({
        workflow: "webhook.receive",
        eventId: normalizedEvents[0]?.id ?? (`${input.provider}:${input.providerEventId}` as never),
        providerEventId: input.providerEventId,
        accepted: false,
        normalizedEvents,
        reconciliationTriggers: normalizedEvents
          .map((normalizedEvent) => buildTrigger({ event: normalizedEvent }))
          .filter((item) => item !== undefined)
      })
    })

    return CommercialWorkflowService.of({
      startCheckout,
      cancelSubscription,
      changeSubscription,
      pauseSubscription,
      resumeSubscription,
      previewSubscriptionChange,
      refundPurchase,
      getPurchaseGrant,
      getCreditWallet,
      grantCredits,
      consumeCredits,
      createPortalSession,
      receiveWebhook,
      replayWebhook
    })
  })
)

const toStorageUtc = (value: Date): Utc => value as unknown as Utc
