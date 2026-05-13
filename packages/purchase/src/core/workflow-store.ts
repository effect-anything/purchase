import type { Utc } from "effect/DateTime"

import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"

import type { ServicesReturns } from "../internal/types.ts"
import type { PaymentProviderTag } from "../provider.ts"

import {
  PayStorageAdapter,
  type PayStorageCheckoutIntentRecord,
  type PayStorageCreditLedgerRecord,
  type PayStorageProviderRefRecord
} from "../db.ts"
import {
  CommercialCustomerNotFound,
  CommercialCustomerProfile,
  type CommercialEvent as CommercialEventType,
  type CommercialCustomerProfile as CommercialCustomerProfileType
} from "./commercial-schema.ts"

/**
 * Write-side store for workflow state and provider references.
 */
export class CommercialWorkflowStore extends Context.Tag("@pay/core/CommercialWorkflowStore")<
  CommercialWorkflowStore,
  {
    /**
     * Get a customer profile by customer id.
     */
    readonly getCustomerProfile: (input: {
      readonly customerId: string
    }) => Effect.Effect<Option.Option<CommercialCustomerProfile>>
    /**
     * Find a customer profile by provider customer reference.
     */
    readonly findCustomerByProviderRef: (input: {
      readonly provider: PaymentProviderTag
      readonly providerCustomerId: string
    }) => Effect.Effect<Option.Option<CommercialCustomerProfile>>
    /**
     * Attach a provider customer id to a local customer.
     */
    readonly attachProviderCustomer: (input: {
      readonly customerId: string
      readonly provider: PaymentProviderTag
      readonly providerCustomerId: string
    }) => Effect.Effect<CommercialCustomerProfile, CommercialCustomerNotFound>
    /**
     * Find a checkout intent by provider session id.
     */
    readonly findCheckoutIntentByProviderSession: (input: {
      readonly providerCheckoutSessionId: string
    }) => Effect.Effect<Option.Option<PayStorageCheckoutIntentRecord>>
    /**
     * Find a checkout intent by intent id.
     */
    readonly findCheckoutIntentById: (input: {
      readonly intentId: string
    }) => Effect.Effect<Option.Option<PayStorageCheckoutIntentRecord>>
    /**
     * Persist a checkout intent for later reconciliation.
     */
    readonly persistCheckoutIntent: (input: {
      readonly intentId: string
      readonly customerId: string
      readonly offerId: string
      readonly provider: PaymentProviderTag
      readonly providerCheckoutSessionId: string
      readonly checkoutUrl?: string | undefined
      readonly metadata: Readonly<Record<string, unknown>>
    }) => Effect.Effect<void>
    /**
     * Update the status of a persisted checkout intent.
     */
    readonly markCheckoutIntentStatus: (input: {
      readonly providerCheckoutSessionId: string
      readonly status: string
    }) => Effect.Effect<void>
    /**
     * Persist a webhook receipt and detect duplicates.
     */
    readonly persistWebhookReceipt: (input: {
      readonly provider: PaymentProviderTag
      readonly providerEventId: string
      readonly type: string
      readonly payload: Readonly<Record<string, unknown>>
    }) => Effect.Effect<{ readonly duplicate: boolean }>
    /**
     * Mark a webhook as processed.
     */
    readonly markWebhookProcessed: (input: {
      readonly provider: PaymentProviderTag
      readonly providerEventId: string
    }) => Effect.Effect<void>
    /**
     * Mark a webhook as failed.
     */
    readonly markWebhookFailed: (input: {
      readonly provider: PaymentProviderTag
      readonly providerEventId: string
      readonly error: string
    }) => Effect.Effect<void>
    /**
     * Persist normalized commercial events.
     */
    readonly persistCommercialEvents: (input: {
      readonly events: ReadonlyArray<CommercialEventType>
    }) => Effect.Effect<void>
    /**
     * Find a stored provider reference.
     */
    readonly findProviderRef: (input: {
      readonly provider: PaymentProviderTag
      readonly providerId: string
      readonly kind?: string | undefined
    }) => Effect.Effect<Option.Option<PayStorageProviderRefRecord>>
    /**
     * Upsert a provider reference mapping.
     */
    readonly upsertProviderRef: (input: CommercialProviderRefInput) => Effect.Effect<void>
    /**
     * Upsert a subscription projection row.
     */
    readonly upsertSubscriptionProjection: (input: CommercialSubscriptionProjectionInput) => Effect.Effect<void>
    /**
     * Upsert an invoice projection row.
     */
    readonly upsertInvoiceProjection: (input: CommercialInvoiceProjectionInput) => Effect.Effect<void>
    /**
     * Record a credit ledger mutation.
     */
    readonly recordCreditLedger: (
      input: CommercialCreditLedgerInput
    ) => Effect.Effect<{ readonly duplicate: boolean; readonly row: PayStorageCreditLedgerRecord }>
    /**
     * List credit ledger rows for a customer.
     */
    readonly listCreditLedger: (input: {
      readonly customerId: string
      readonly productId?: string | undefined
    }) => Effect.Effect<ReadonlyArray<PayStorageCreditLedgerRecord>>
    /**
     * Replace persisted entitlements for a customer.
     */
    readonly replaceEntitlements: (input: {
      readonly customerId: string
      readonly entitlements: ReadonlyArray<CommercialEntitlementProjectionInput>
    }) => Effect.Effect<void>
  }
>() {}
export declare namespace CommercialWorkflowStore {
  export type Methods = Context.Tag.Service<CommercialWorkflowStore>
  export type Returns<key extends keyof Methods, R = never> = ServicesReturns<Methods[key], R>
}

export const CommercialWorkflowStoreLayer = Layer.effect(
  CommercialWorkflowStore,
  Effect.gen(function* () {
    const storage = yield* PayStorageAdapter

    const getCustomerProfile = ({ customerId }: { readonly customerId: string }) =>
      storage.customer.findFirst({ where: [["id", customerId]] }).pipe(
        Effect.map((row) => Option.map(row, mapCustomer)),
        Effect.orDie
      )

    const findCustomerByProviderRef = ({
      provider,
      providerCustomerId
    }: {
      readonly provider: PaymentProviderTag
      readonly providerCustomerId: string
    }) =>
      storage.providerRef
        .findFirst({
          where: [
            ["provider", provider],
            ["providerId", providerCustomerId],
            ["kind", "customer"]
          ]
        })
        .pipe(
          Effect.flatMap((ref) =>
            Option.match(ref, {
              onNone: () =>
                storage.customer
                  .findMany({})
                  .pipe(
                    Effect.map((rows) =>
                      Option.fromNullable(
                        rows.map(mapCustomer).find((row) => row.provider[provider] === providerCustomerId)
                      )
                    )
                  ),
              onSome: (row) => getCustomerProfile({ customerId: row.ownerId })
            })
          ),
          Effect.orDie
        )

    const attachProviderCustomer = ({
      customerId,
      provider,
      providerCustomerId
    }: {
      readonly customerId: string
      readonly provider: PaymentProviderTag
      readonly providerCustomerId: string
    }) =>
      Effect.gen(function* () {
        const existing = yield* getCustomerProfile({ customerId }).pipe(
          Effect.flatMap(
            Option.match({
              onNone: () => Effect.fail(new CommercialCustomerNotFound({ customerId: customerId as never })),
              onSome: Effect.succeed
            })
          )
        )

        const nextProvider = {
          ...existing.provider,
          [provider]: providerCustomerId
        }

        const updated = yield* storage.customer
          .updateFirst({
            where: [["id", customerId]],
            set: {
              provider: nextProvider,
              updatedAt: toStorageUtc(new Date())
            }
          })
          .pipe(Effect.map(Option.getOrThrow), Effect.orDie)

        yield* upsertProviderRef({
          provider,
          ownerType: "customer",
          ownerId: customerId,
          providerId: providerCustomerId,
          kind: "customer"
        })

        return mapCustomer(updated)
      })

    const findCheckoutIntentByProviderSession = ({
      providerCheckoutSessionId
    }: {
      readonly providerCheckoutSessionId: string
    }) =>
      storage.checkoutIntent
        .findFirst({ where: [["providerCheckoutSessionId", providerCheckoutSessionId]] })
        .pipe(Effect.orDie)

    const findCheckoutIntentById = ({ intentId }: { readonly intentId: string }) =>
      storage.checkoutIntent.findFirst({ where: [["id", intentId]] }).pipe(Effect.orDie)

    const persistCheckoutIntent = (input: {
      readonly intentId: string
      readonly customerId: string
      readonly offerId: string
      readonly provider: PaymentProviderTag
      readonly providerCheckoutSessionId: string
      readonly checkoutUrl?: string | undefined
      readonly metadata: Readonly<Record<string, unknown>>
    }) =>
      storage.checkoutIntent
        .insert({
          values: {
            id: input.intentId,
            customerId: input.customerId,
            offerId: input.offerId,
            provider: input.provider,
            providerCheckoutSessionId: input.providerCheckoutSessionId,
            checkoutUrl: input.checkoutUrl,
            status: "pending",
            metadata: input.metadata,
            createdAt: toStorageUtc(new Date()),
            updatedAt: toStorageUtc(new Date())
          }
        })
        .pipe(Effect.asVoid, Effect.orDie)

    const markCheckoutIntentStatus = ({
      providerCheckoutSessionId,
      status
    }: {
      readonly providerCheckoutSessionId: string
      readonly status: string
    }) =>
      storage.checkoutIntent
        .updateFirst({
          where: [["providerCheckoutSessionId", providerCheckoutSessionId]],
          set: {
            status,
            updatedAt: toStorageUtc(new Date())
          }
        })
        .pipe(Effect.asVoid, Effect.orDie)

    const persistWebhookReceipt = (input: {
      readonly provider: PaymentProviderTag
      readonly providerEventId: string
      readonly type: string
      readonly payload: Readonly<Record<string, unknown>>
    }) =>
      storage.webhookEvent
        .findFirst({
          where: [
            ["providerId", input.provider],
            ["providerEventId", input.providerEventId]
          ]
        })
        .pipe(
          Effect.flatMap(
            Option.match({
              onNone: (): Effect.Effect<{ readonly duplicate: boolean }> =>
                storage.webhookEvent
                  .insert({
                    values: {
                      id: `${input.provider}:${input.providerEventId}`,
                      providerId: input.provider,
                      providerEventId: input.providerEventId,
                      type: input.type,
                      payload: input.payload,
                      status: "received",
                      receivedAt: new Date()
                    }
                  })
                  .pipe(Effect.as({ duplicate: false as const }), Effect.orDie),
              onSome: (): Effect.Effect<{ readonly duplicate: boolean }> => Effect.succeed({ duplicate: true as const })
            })
          ),
          Effect.orDie
        )

    const markWebhookProcessed = ({
      provider,
      providerEventId
    }: {
      readonly provider: PaymentProviderTag
      readonly providerEventId: string
    }) =>
      storage.webhookEvent
        .updateFirst({
          where: [
            ["providerId", provider],
            ["providerEventId", providerEventId]
          ],
          set: {
            status: "processed",
            error: undefined,
            processedAt: new Date()
          }
        })
        .pipe(Effect.asVoid, Effect.orDie)

    const markWebhookFailed = ({
      provider,
      providerEventId,
      error
    }: {
      readonly provider: PaymentProviderTag
      readonly providerEventId: string
      readonly error: string
    }) =>
      storage.webhookEvent
        .updateFirst({
          where: [
            ["providerId", provider],
            ["providerEventId", providerEventId]
          ],
          set: {
            status: "failed",
            error,
            processedAt: new Date()
          }
        })
        .pipe(Effect.asVoid, Effect.orDie)

    const persistCommercialEvents = ({ events }: { readonly events: ReadonlyArray<CommercialEventType> }) =>
      Effect.forEach(
        events,
        (event) =>
          Effect.gen(function* () {
            const existing = yield* storage.commercialEvent.findFirst({ where: [["id", event.id]] }).pipe(Effect.orDie)

            if (Option.isSome(existing)) {
              return
            }

            yield* storage.commercialEvent
              .insert({
                values: {
                  id: event.id,
                  provider: event.provider,
                  providerEventId: event.providerEventId,
                  kind: event.kind,
                  customerId: event.customerId,
                  offerId: event.offerId,
                  agreementId: event.agreementId,
                  payload: event.payload,
                  occurredAt: event.occurredAt,
                  createdAt: toStorageUtc(new Date())
                }
              })
              .pipe(Effect.orDie)
          }),
        { concurrency: 1, discard: true }
      )

    const findProviderRef = ({
      provider,
      providerId,
      kind
    }: {
      readonly provider: PaymentProviderTag
      readonly providerId: string
      readonly kind?: string | undefined
    }) =>
      storage.providerRef
        .findFirst({
          where: [["provider", provider], ["providerId", providerId], ...(kind ? ([["kind", kind]] as const) : [])]
        })
        .pipe(Effect.orDie)

    const upsertProviderRef = (input: CommercialProviderRefInput) =>
      Effect.gen(function* () {
        const now = new Date()
        const existing = yield* storage.providerRef
          .findFirst({
            where: [
              ["provider", input.provider],
              ["ownerType", input.ownerType],
              ["ownerId", input.ownerId],
              ["kind", input.kind]
            ]
          })
          .pipe(Effect.orDie)
        const set = {
          provider: input.provider,
          ownerType: input.ownerType,
          ownerId: input.ownerId,
          providerId: input.providerId,
          kind: input.kind,
          updatedAt: toStorageUtc(now)
        }

        if (Option.isSome(existing)) {
          yield* storage.providerRef.updateFirst({ where: [["id", existing.value.id]], set }).pipe(Effect.orDie)
          return
        }

        yield* storage.providerRef
          .insert({
            values: {
              id: `${input.provider}:${input.kind}:${input.ownerType}:${input.ownerId}`,
              ...set,
              createdAt: toStorageUtc(now)
            }
          })
          .pipe(Effect.orDie)
      })

    const upsertSubscriptionProjection = (input: CommercialSubscriptionProjectionInput) =>
      Effect.gen(function* () {
        const now = new Date()
        const existing = yield* storage.subscription.findFirst({ where: [["id", input.id]] }).pipe(Effect.orDie)
        const set = {
          customerId: input.customerId,
          productInternalId: input.productInternalId,
          providerId: input.providerId,
          providerData: input.providerData ?? {},
          status: input.status,
          canceled: input.canceled ?? input.status === "canceled",
          cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
          startedAt: input.startedAt,
          trialEndsAt: input.trialEndsAt,
          currentPeriodStartAt: input.currentPeriodStartAt,
          currentPeriodEndAt: input.currentPeriodEndAt,
          canceledAt: input.canceledAt,
          endedAt: input.endedAt,
          scheduledProductId: input.scheduledProductId,
          quantity: input.quantity ?? 1,
          updatedAt: toStorageUtc(now)
        }

        if (Option.isSome(existing)) {
          yield* storage.subscription
            .updateFirst({
              where: [["id", input.id]],
              set
            })
            .pipe(Effect.orDie)
          return
        }

        yield* storage.subscription
          .insert({
            values: {
              id: input.id,
              ...set,
              createdAt: toStorageUtc(now)
            }
          })
          .pipe(Effect.orDie)

        if (input.providerId) {
          yield* upsertProviderRef({
            provider: input.provider,
            ownerType: "subscription",
            ownerId: input.id,
            providerId: input.providerId,
            kind: "subscription"
          })
        }
      })

    const upsertInvoiceProjection = (input: CommercialInvoiceProjectionInput) =>
      Effect.gen(function* () {
        const now = new Date()
        const existing = yield* storage.invoice.findFirst({ where: [["id", input.id]] }).pipe(Effect.orDie)
        const set = {
          customerId: input.customerId,
          subscriptionId: input.subscriptionId,
          type: input.type,
          status: input.status,
          amount: input.amount,
          currency: input.currency,
          description: input.description,
          hostedUrl: input.hostedUrl,
          providerId: input.providerId,
          providerData: input.providerData,
          periodStartAt: input.periodStartAt,
          periodEndAt: input.periodEndAt,
          updatedAt: toStorageUtc(now)
        }

        if (Option.isSome(existing)) {
          yield* storage.invoice
            .updateFirst({
              where: [["id", input.id]],
              set
            })
            .pipe(Effect.orDie)
          return
        }

        yield* storage.invoice
          .insert({
            values: {
              id: input.id,
              ...set,
              createdAt: toStorageUtc(now)
            }
          })
          .pipe(Effect.orDie)
      })

    const recordCreditLedger = (input: CommercialCreditLedgerInput) =>
      Effect.gen(function* () {
        const existing = yield* storage.creditLedger
          .findFirst({ where: [["idempotencyKey", input.idempotencyKey]] })
          .pipe(Effect.orDie)

        if (Option.isSome(existing)) {
          return { duplicate: true as const, row: existing.value }
        }

        const row = yield* storage.creditLedger
          .insert({
            values: {
              id: input.id,
              customerId: input.customerId,
              productId: input.productId,
              offerId: input.offerId,
              amount: input.amount,
              direction: input.direction,
              idempotencyKey: input.idempotencyKey,
              sourceEventId: input.sourceEventId,
              reason: input.reason,
              createdAt: toStorageUtc(new Date())
            }
          })
          .pipe(Effect.orDie)

        return { duplicate: false as const, row }
      })

    const listCreditLedger = ({
      customerId,
      productId
    }: {
      readonly customerId: string
      readonly productId?: string | undefined
    }) =>
      storage.creditLedger
        .findMany({
          where: [["customerId", customerId], ...(productId ? ([["productId", productId]] as const) : [])],
          orderBy: ["createdAt", "asc"]
        })
        .pipe(Effect.orDie)

    const replaceEntitlements = ({
      customerId,
      entitlements
    }: {
      readonly customerId: string
      readonly entitlements: ReadonlyArray<CommercialEntitlementProjectionInput>
    }) =>
      Effect.gen(function* () {
        yield* storage.entitlement.deleteMany({ where: [["customerId", customerId]] }).pipe(Effect.orDie)

        const now = new Date()

        yield* Effect.forEach(
          entitlements,
          (entitlement) =>
            Effect.gen(function* () {
              const feature = yield* storage.feature
                .findFirst({ where: [["id", entitlement.featureId]] })
                .pipe(Effect.orDie)

              if (Option.isNone(feature)) {
                yield* storage.feature
                  .insert({
                    values: {
                      id: entitlement.featureId,
                      type: entitlement.balance === undefined ? "projection" : "credit_balance",
                      createdAt: toStorageUtc(now),
                      updatedAt: toStorageUtc(now)
                    }
                  })
                  .pipe(Effect.orDie)
              }

              yield* storage.entitlement
                .insert({
                  values: {
                    id: entitlement.id,
                    subscriptionId: entitlement.subscriptionId,
                    customerId,
                    featureId: entitlement.featureId,
                    limit: entitlement.limit,
                    balance: entitlement.balance,
                    nextResetAt: undefined,
                    createdAt: toStorageUtc(now),
                    updatedAt: toStorageUtc(now)
                  }
                })
                .pipe(Effect.orDie)
            }),
          { concurrency: 1, discard: true }
        )
      })

    return CommercialWorkflowStore.of({
      getCustomerProfile,
      findCustomerByProviderRef,
      attachProviderCustomer,
      findCheckoutIntentByProviderSession,
      findCheckoutIntentById,
      persistCheckoutIntent,
      markCheckoutIntentStatus,
      persistWebhookReceipt,
      markWebhookProcessed,
      markWebhookFailed,
      persistCommercialEvents,
      findProviderRef,
      upsertProviderRef,
      upsertSubscriptionProjection,
      upsertInvoiceProjection,
      recordCreditLedger,
      listCreditLedger,
      replaceEntitlements
    })
  })
)

const mapCustomer = (row: {
  readonly id: string
  readonly email: unknown
  readonly name: unknown
  readonly provider: unknown
  readonly createdAt: unknown
  readonly updatedAt: unknown
}): CommercialCustomerProfileType =>
  CommercialCustomerProfile.make({
    id: row.id as never,
    ...(typeof row.email === "string" && row.email.length > 0 ? { email: row.email } : {}),
    ...(typeof row.name === "string" && row.name.length > 0 ? { name: row.name } : {}),
    provider: toRecord(row.provider) as Record<string, string>,
    createdAt: toDate(row.createdAt),
    updatedAt: toDate(row.updatedAt)
  })

/**
 * Projection input for entitlement persistence.
 */
export interface CommercialEntitlementProjectionInput {
  readonly id: string
  readonly featureId: string
  readonly subscriptionId?: string | undefined
  readonly limit?: number | undefined
  readonly balance?: number | undefined
}

/**
 * Projection input for invoice persistence.
 */
export interface CommercialInvoiceProjectionInput {
  readonly id: string
  readonly customerId: string
  readonly subscriptionId?: string | undefined
  readonly type: string
  readonly status: string
  readonly amount: number
  readonly currency: string
  readonly description?: string | undefined
  readonly hostedUrl?: string | undefined
  readonly providerId: string
  readonly providerData: Readonly<Record<string, unknown>>
  readonly periodStartAt?: Date | undefined
  readonly periodEndAt?: Date | undefined
}

/**
 * Projection input for subscription persistence.
 */
export interface CommercialSubscriptionProjectionInput {
  readonly provider: PaymentProviderTag
  readonly id: string
  readonly customerId: string
  readonly productInternalId: string
  readonly providerId?: string | undefined
  readonly providerData?: Readonly<Record<string, unknown>> | undefined
  readonly status: string
  readonly canceled?: boolean | undefined
  readonly cancelAtPeriodEnd?: boolean | undefined
  readonly startedAt?: Date | undefined
  readonly trialEndsAt?: Date | undefined
  readonly currentPeriodStartAt?: Date | undefined
  readonly currentPeriodEndAt?: Date | undefined
  readonly canceledAt?: Date | undefined
  readonly endedAt?: Date | undefined
  readonly scheduledProductId?: string | undefined
  readonly quantity?: number | undefined
}

/**
 * Provider reference mapping persisted for reconciliation.
 */
export interface CommercialProviderRefInput {
  readonly provider: PaymentProviderTag
  readonly ownerType: "customer" | "product" | "offer" | "subscription" | "invoice"
  readonly ownerId: string
  readonly providerId: string
  readonly kind: string
}

/**
 * Ledger input for credit balance updates.
 */
export interface CommercialCreditLedgerInput {
  readonly id: string
  readonly customerId: string
  readonly productId: string
  readonly offerId?: string | undefined
  readonly amount: number
  readonly direction: "grant" | "consume" | "refund" | "adjustment"
  readonly idempotencyKey: string
  readonly sourceEventId?: string | undefined
  readonly reason?: string | undefined
}

const toRecord = (value: unknown): Record<string, unknown> => {
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

const toDate = (value: unknown): Date => new Date(value as string | number | Date)

const toStorageUtc = (value: Date): Utc => value as unknown as Utc
