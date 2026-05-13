import type * as Brand from "effect/Brand"

import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"

import type { ServicesReturns } from "../internal/types.ts"
import type { CustomerId } from "./common-schema.ts"
import type { RefreshCustomerSnapshotInput } from "./workflow-schema.ts"

import { PayStorageAdapter, type PayStorageSubscriptionRecord } from "../db.ts"
import { CommercialCatalogService } from "./catalog-service.ts"
import {
  type CommercialBenefit,
  type CommercialCatalog,
  CreditBalanceBenefit,
  CreditsWalletState,
  CustomerCommercialSnapshot,
  CustomerEntitlementSnapshot,
  FeatureFlagBenefit,
  LicenseGrantBenefit,
  PurchaseGrantState,
  QuotaLimitBenefit,
  SubscriptionAgreementState,
  type CommercialCatalogIssue
} from "./commercial-schema.ts"

/**
 * Projection service for customer-facing commercial snapshots.
 */
export class CommercialProjectionService extends Context.Tag("@pay/core/CommercialProjectionService")<
  CommercialProjectionService,
  {
    /**
     * Rebuild the customer commercial snapshot from stored state.
     */
    readonly refreshCustomerSnapshot: (
      input: RefreshCustomerSnapshotInput
    ) => Effect.Effect<CustomerCommercialSnapshot, CommercialCatalogIssue>
    /**
     * Compute effective customer entitlements from a snapshot.
     */
    readonly computeCustomerEntitlements: (input: {
      readonly customerSnapshot: CustomerCommercialSnapshot
    }) => Effect.Effect<CustomerEntitlementSnapshot, CommercialCatalogIssue>
    /**
     * Get a subscription agreement by agreement id.
     */
    readonly getSubscriptionAgreement: (input: {
      readonly agreementId: string
    }) => Effect.Effect<Option.Option<SubscriptionAgreementState>>
    /**
     * List subscription agreements for a customer.
     */
    readonly listSubscriptions: (input: {
      readonly customerId: string
    }) => Effect.Effect<ReadonlyArray<SubscriptionAgreementState>>
    /**
     * List purchase grants for a customer.
     */
    readonly listPurchases: (input: { readonly customerId: string }) => Effect.Effect<ReadonlyArray<PurchaseGrantState>>
    /**
     * List credit wallets for a customer.
     */
    readonly listWallets: (input: { readonly customerId: string }) => Effect.Effect<ReadonlyArray<CreditsWalletState>>
  }
>() {}
export declare namespace CommercialProjectionService {
  export type Methods = Context.Tag.Service<CommercialProjectionService>
  export type Returns<key extends keyof Methods, R = never> = ServicesReturns<Methods[key], R>
}

export const CommercialProjectionServiceLayer = Layer.effect(
  CommercialProjectionService,
  Effect.gen(function* () {
    const catalogService = yield* CommercialCatalogService
    const storage = yield* PayStorageAdapter

    const catalogState = yield* CommercialCatalogService

    const resolveOfferIdForSubscription = (subscription: PayStorageSubscriptionRecord) =>
      storage.product.findFirst({ where: [["internalId", subscription.productInternalId]] }).pipe(
        Effect.map(
          Option.match({
            onNone: () => subscription.productInternalId,
            onSome: (product) => product.id
          })
        ),
        Effect.orDie
      )

    const resolveProductIdForOffer = (offerId: string) =>
      catalogState.getOffer({ offerId }).pipe(
        Effect.map(
          Option.match({
            onNone: () => offerId,
            onSome: (offer) => offer.productId
          })
        ),
        Effect.orDie
      )

    const mapSubscriptionRows = (rows: ReadonlyArray<PayStorageSubscriptionRecord>) =>
      Effect.forEach(rows, (row) =>
        resolveOfferIdForSubscription(row).pipe(
          Effect.flatMap((offerId) =>
            resolveProductIdForOffer(offerId).pipe(
              Effect.map((productId) =>
                mapSubscriptionAgreement({
                  row,
                  offerId,
                  productId
                })
              )
            )
          )
        )
      )

    const listSubscriptions = ({ customerId }: { readonly customerId: string }) =>
      storage.subscription
        .findMany({
          where: [["customerId", customerId]],
          orderBy: ["updatedAt", "desc"]
        })
        .pipe(Effect.flatMap(mapSubscriptionRows), Effect.orDie)

    const getSubscriptionAgreement = ({ agreementId }: { readonly agreementId: string }) =>
      storage.subscription.findFirst({ where: [["id", agreementId]] }).pipe(
        Effect.flatMap(
          Option.match({
            onNone: () => Effect.succeed(Option.none<SubscriptionAgreementState>()),
            onSome: (row) => mapSubscriptionRows([row]).pipe(Effect.map((rows) => Option.fromNullable(rows[0])))
          })
        ),
        Effect.orDie
      )

    const listPurchases = ({ customerId }: { readonly customerId: string }) =>
      Effect.gen(function* () {
        const invoiceRows = yield* storage.invoice.findMany({
          where: [["customerId", customerId]],
          orderBy: ["createdAt", "desc"]
        })
        const checkoutIntentRows = yield* storage.checkoutIntent.findMany({
          where: [["customerId", customerId]],
          orderBy: ["createdAt", "desc"]
        })
        const webhookRows = yield* storage.webhookEvent.findMany({
          where: [["status", "processed"]],
          orderBy: ["receivedAt", "desc"]
        })

        const invoiceGrants = yield* Effect.forEach(invoiceRows, (row) =>
          Effect.gen(function* () {
            if (row.subscriptionId) {
              return Option.none<PurchaseGrantState>()
            }

            const offerId = readProviderOfferId(row.providerData)
            if (!offerId) {
              return Option.none<PurchaseGrantState>()
            }

            const offer = yield* catalogState.getOffer({ offerId })
            if (Option.isNone(offer) || offer.value.type !== "one_time") {
              return Option.none<PurchaseGrantState>()
            }

            const productId = yield* resolveProductIdForOffer(offerId)

            return Option.some(
              PurchaseGrantState.make({
                id: row.id as never,
                customerId: customerId as never,
                productId: productId as never,
                offerId: offerId as never,
                status: row.status === "refunded" ? "refunded" : "active",
                grantedAt: toDate(row.createdAt) ?? new Date(),
                ...(row.status === "refunded" ? { revokedAt: toDate(row.updatedAt) } : {})
              })
            )
          })
        )

        const checkoutGrants = yield* Effect.forEach(checkoutIntentRows, (row) =>
          Effect.gen(function* () {
            const metadata = toRecord(row.metadata)
            const intentCustomerId =
              (row.customerId.length > 0 ? row.customerId : undefined) ??
              readString(metadata, ["customerId", "payCustomerId"])
            const offerId =
              (row.offerId.length > 0 ? row.offerId : undefined) ?? readString(metadata, ["offerId", "payOfferId"])

            if (intentCustomerId !== customerId || !offerId) {
              return Option.none<PurchaseGrantState>()
            }

            const offer = yield* catalogState.getOffer({ offerId })
            if (Option.isNone(offer) || offer.value.type !== "one_time") {
              return Option.none<PurchaseGrantState>()
            }

            const matchingWebhook = webhookRows.find((webhookRow) => {
              const payload = toRecord(webhookRow.payload)
              const payloadCustomerId =
                readString(payload, ["payCustomerId", "customerId"]) ??
                readString(toRecord(payload.data), ["payCustomerId", "customerId"]) ??
                readString(toRecord(toRecord(payload.data).object), ["payCustomerId", "customerId"]) ??
                readString(toRecord(toRecord(toRecord(payload.data).object).metadata), ["payCustomerId", "customerId"])
              const payloadOfferId =
                readString(payload, ["payOfferId", "offerId"]) ??
                readString(toRecord(payload.data), ["payOfferId", "offerId"]) ??
                readString(toRecord(toRecord(payload.data).object), ["payOfferId", "offerId"]) ??
                readString(toRecord(toRecord(toRecord(payload.data).object).metadata), ["payOfferId", "offerId"])
              const eventType = String(webhookRow.type ?? "")

              return (
                payloadCustomerId === customerId &&
                payloadOfferId === offerId &&
                (eventType.includes("checkout") || eventType.includes("transaction") || eventType.includes("invoice"))
              )
            })

            if (!matchingWebhook) {
              return Option.none<PurchaseGrantState>()
            }

            const productId = yield* resolveProductIdForOffer(offerId)

            return Option.some(
              PurchaseGrantState.make({
                id: row.id as never,
                customerId: customerId as never,
                productId: productId as never,
                offerId: offerId as never,
                status: "active",
                grantedAt: toDate(row.createdAt) ?? new Date()
              })
            )
          })
        )

        const combined = [...invoiceGrants, ...checkoutGrants]
        const byOffer = new Map<string, PurchaseGrantState>()

        for (const grant of combined) {
          if (Option.isNone(grant)) {
            continue
          }

          const current = byOffer.get(grant.value.offerId)
          if (!current || current.grantedAt < grant.value.grantedAt) {
            byOffer.set(grant.value.offerId, grant.value)
          }
        }

        return Array.from(byOffer.values())
      }).pipe(Effect.orDie)

    const listWallets = ({ customerId }: { readonly customerId: string }) =>
      Effect.gen(function* () {
        const ledgerRows = yield* storage.creditLedger.findMany({
          where: [["customerId", customerId]],
          orderBy: ["createdAt", "asc"]
        })

        if (ledgerRows.length > 0) {
          const grouped = new Map<
            string,
            {
              available: number
              acquired: number
              consumed: number
              refunded: number
              updatedAt: Date
            }
          >()

          for (const row of ledgerRows) {
            const current = grouped.get(row.productId) ?? {
              available: 0,
              acquired: 0,
              consumed: 0,
              refunded: 0,
              updatedAt: toDate(row.createdAt) ?? new Date()
            }
            const amount = typeof row.amount === "number" ? row.amount : Number(row.amount)
            const direction = String(row.direction)
            const updatedAt = toDate(row.createdAt) ?? new Date()
            const next = {
              ...current,
              updatedAt: current.updatedAt > updatedAt ? current.updatedAt : updatedAt
            }

            if (direction === "grant" || direction === "adjustment") {
              next.acquired += amount
              next.available += amount
            } else if (direction === "consume") {
              next.consumed += amount
              next.available -= amount
            } else if (direction === "refund") {
              next.refunded += amount
              next.available -= amount
            }

            grouped.set(row.productId, next)
          }

          return Array.from(grouped.entries()).map(([productId, summary]) =>
            CreditsWalletState.make({
              id: `${customerId}:${productId}` as never,
              customerId: customerId as never,
              productId: productId as never,
              available: Math.max(summary.available, 0),
              acquired: summary.acquired,
              consumed: summary.consumed,
              refunded: summary.refunded,
              policy: "sdk_managed",
              updatedAt: summary.updatedAt
            })
          )
        }

        const rows = yield* storage.entitlement.findMany({
          where: [["customerId", customerId]],
          orderBy: ["updatedAt", "desc"]
        })

        const grouped = new Map<
          string,
          {
            available: number
            acquired: number
            consumed: number
            updatedAt: Date
          }
        >()

        for (const row of rows) {
          if (row.balance === null || row.balance === undefined) {
            continue
          }

          const featureId = row.featureId
          const productId = featureId
          const balance = typeof row.balance === "number" ? row.balance : Number(row.balance ?? 0)
          const limit = typeof row.limit === "number" ? row.limit : Number(row.limit ?? balance)
          const updatedAt = toDate(row.updatedAt) ?? new Date()
          const current = grouped.get(productId) ?? {
            available: 0,
            acquired: 0,
            consumed: 0,
            updatedAt
          }

          grouped.set(productId, {
            available: current.available + balance,
            acquired: current.acquired + Math.max(limit, balance),
            consumed: current.consumed + Math.max(limit - balance, 0),
            updatedAt: current.updatedAt > updatedAt ? current.updatedAt : updatedAt
          })
        }

        return Array.from(grouped.entries()).map(([productId, summary]) =>
          CreditsWalletState.make({
            id: `${customerId}:${productId}` as never,
            customerId: customerId as never,
            productId: productId as never,
            available: summary.available,
            acquired: summary.acquired,
            consumed: summary.consumed,
            refunded: 0,
            policy: "sdk_managed",
            updatedAt: summary.updatedAt
          })
        )
      }).pipe(Effect.orDie)

    const refreshCustomerSnapshot: CommercialProjectionService.Methods["refreshCustomerSnapshot"] = Effect.fn(
      "CommercialProjectionService.refreshCustomerSnapshot"
    )(function* (input) {
      const catalog = yield* catalogService.getCatalog()
      const [subscriptions, purchases, wallets] = yield* Effect.all([
        listSubscriptions({ customerId: input.customerId }),
        listPurchases({ customerId: input.customerId }),
        listWallets({ customerId: input.customerId })
      ])

      return buildCustomerCommercialSnapshot({
        catalog,
        customerId: input.customerId,
        subscriptions,
        purchases,
        wallets
      })
    })

    const computeCustomerEntitlements: CommercialProjectionService.Methods["computeCustomerEntitlements"] = Effect.fn(
      "CommercialProjectionService.computeCustomerEntitlements"
    )(function* ({ customerSnapshot }) {
      const catalog = yield* catalogService.getCatalog()

      return buildCustomerEntitlementSnapshot({
        catalog,
        snapshot: customerSnapshot
      })
    })

    return CommercialProjectionService.of({
      refreshCustomerSnapshot,
      computeCustomerEntitlements,
      getSubscriptionAgreement,
      listPurchases,
      listSubscriptions,
      listWallets
    })
  })
)

const hasSubscriptionAccess = (status: SubscriptionAgreementState["status"]) =>
  status === "trialing" || status === "active" || status === "grace" || status === "paused"

const hasPurchaseAccess = (status: PurchaseGrantState["status"]) =>
  status === "trialing" || status === "active" || status === "grace"

const offerMap = (catalog: CommercialCatalog) =>
  new Map(catalog.products.flatMap((product) => product.offers.map((offer) => [offer.id, offer] as const)))

const defaultSubscriptionOfferIds = (catalog: CommercialCatalog) => {
  const groups = new Map<string, string>()

  for (const product of catalog.products) {
    if (product.type !== "subscription") {
      continue
    }

    for (const offer of product.offers) {
      if (!offer.isDefault) {
        continue
      }

      groups.set(`${product.id}:${offer.group}`, offer.id)
    }
  }

  return groups
}

const activeSubscriptionGroups = (input: {
  readonly catalog: CommercialCatalog
  readonly subscriptions: ReadonlyArray<SubscriptionAgreementState>
}) => {
  const offers = offerMap(input.catalog)
  const groups = new Set<string>()

  for (const subscription of input.subscriptions) {
    if (!hasSubscriptionAccess(subscription.status)) {
      continue
    }

    const offer = offers.get(subscription.offerId)
    if (!offer) {
      continue
    }

    groups.add(`${offer.productId}:${offer.group}`)
  }

  return groups
}

const deriveActiveOfferIds = (input: {
  readonly catalog: CommercialCatalog
  readonly subscriptions: ReadonlyArray<SubscriptionAgreementState>
  readonly purchases: ReadonlyArray<PurchaseGrantState>
}) => {
  const ids = new Set<string>()

  for (const subscription of input.subscriptions) {
    if (hasSubscriptionAccess(subscription.status)) {
      ids.add(subscription.offerId)
    }
  }

  for (const purchase of input.purchases) {
    if (hasPurchaseAccess(purchase.status)) {
      ids.add(purchase.offerId)
    }
  }

  const coveredSubscriptionGroups = activeSubscriptionGroups({
    catalog: input.catalog,
    subscriptions: input.subscriptions
  })

  for (const [groupKey, offerId] of defaultSubscriptionOfferIds(input.catalog)) {
    if (!coveredSubscriptionGroups.has(groupKey)) {
      ids.add(offerId)
    }
  }

  return Array.from(ids) as unknown as ReadonlyArray<string & Brand.Brand<"CommercialOfferId">>
}

const walletBenefitUnit = (input: { readonly catalog: CommercialCatalog; readonly productId: string }) => {
  for (const product of input.catalog.products) {
    for (const offer of product.offers) {
      for (const benefit of offer.benefits) {
        if (benefit.type === "credit_balance" && benefit.key === input.productId) {
          return benefit.unit
        }
      }
    }
  }

  const product = input.catalog.products.find((item) => item.id === input.productId)
  if (!product) {
    return input.productId
  }

  for (const offer of product.offers) {
    for (const benefit of offer.benefits) {
      if (benefit.type === "credit_balance") {
        return benefit.unit
      }
    }
  }

  return input.productId
}

const aggregateCatalogBenefits = (benefits: ReadonlyArray<CommercialBenefit>) => {
  const featureFlags = new Map<string, typeof FeatureFlagBenefit.Type>()
  const licenseGrants = new Map<string, typeof LicenseGrantBenefit.Type>()
  const quotaLimits = new Map<string, typeof QuotaLimitBenefit.Type>()

  for (const benefit of benefits) {
    switch (benefit.type) {
      case "feature_flag": {
        const existing = featureFlags.get(benefit.key)
        featureFlags.set(
          benefit.key,
          FeatureFlagBenefit.make({
            ...benefit,
            enabled: existing ? existing.enabled || benefit.enabled : benefit.enabled
          })
        )
        break
      }
      case "quota_limit": {
        const existing = quotaLimits.get(benefit.key)
        if (!existing || benefit.limit > existing.limit) {
          quotaLimits.set(benefit.key, QuotaLimitBenefit.make(benefit))
        }
        break
      }
      case "license_grant": {
        licenseGrants.set(`${benefit.key}:${benefit.scope}`, LicenseGrantBenefit.make(benefit))
        break
      }
      case "credit_balance":
        break
    }
  }

  return [
    ...featureFlags.values(),
    ...quotaLimits.values(),
    ...licenseGrants.values()
  ] satisfies ReadonlyArray<CommercialBenefit>
}

const walletBenefits = (input: {
  readonly catalog: CommercialCatalog
  readonly snapshot: CustomerCommercialSnapshot
}) =>
  input.snapshot.wallets
    .filter((wallet) => wallet.available > 0)
    .map((wallet) =>
      CreditBalanceBenefit.make({
        id: `wallet:${wallet.id}` as never,
        type: "credit_balance",
        key: wallet.productId,
        unit: walletBenefitUnit({ catalog: input.catalog, productId: wallet.productId }),
        amount: wallet.available
      })
    )

export const buildCustomerCommercialSnapshot = (input: {
  readonly catalog: CommercialCatalog
  readonly customerId: typeof CustomerId.Type
  readonly subscriptions: ReadonlyArray<SubscriptionAgreementState>
  readonly purchases: ReadonlyArray<PurchaseGrantState>
  readonly wallets: ReadonlyArray<CreditsWalletState>
  readonly now?: Date | undefined
}): CustomerCommercialSnapshot =>
  CustomerCommercialSnapshot.make({
    customerId: input.customerId,
    subscriptions: [...input.subscriptions],
    purchases: [...input.purchases],
    wallets: [...input.wallets],
    activeOfferIds: deriveActiveOfferIds({
      catalog: input.catalog,
      subscriptions: input.subscriptions,
      purchases: input.purchases
    }),
    updatedAt: input.now ?? new Date()
  })

export const buildCustomerEntitlementSnapshot = (input: {
  readonly catalog: CommercialCatalog
  readonly snapshot: CustomerCommercialSnapshot
  readonly now?: Date | undefined
}): CustomerEntitlementSnapshot => {
  const offers = offerMap(input.catalog)
  const catalogBenefits = input.snapshot.activeOfferIds.flatMap((offerId) => {
    const offer = offers.get(offerId)
    if (!offer) {
      return []
    }

    return offer.benefits.filter((benefit) => benefit.type !== "credit_balance")
  })

  return CustomerEntitlementSnapshot.make({
    customerId: input.snapshot.customerId,
    benefits: [...aggregateCatalogBenefits(catalogBenefits), ...walletBenefits(input)],
    updatedAt: input.now ?? new Date()
  })
}

const toDate = (value: unknown): Date | undefined => {
  if (value instanceof Date) {
    return value
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  }

  return undefined
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

const readString = (record: Record<string, unknown>, keys: ReadonlyArray<string>): string | undefined => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "string" && value.length > 0) {
      return value
    }
  }

  return undefined
}

const mapAgreementStatus = (value: string): SubscriptionAgreementState["status"] => {
  switch (value) {
    case "trialing":
      return "trialing"
    case "active":
      return "active"
    case "past_due":
      return "grace"
    case "paused":
      return "paused"
    case "canceled":
      return "canceled"
    default:
      return "pending"
  }
}

const readProviderOfferId = (providerData: unknown): string | undefined =>
  readString(toRecord(providerData), ["offerId", "payOfferId"])

const mapSubscriptionAgreement = (input: {
  readonly row: PayStorageSubscriptionRecord
  readonly offerId: string
  readonly productId: string
}) => {
  const startedAt = toDate(input.row.startedAt)
  const currentPeriodStartAt = toDate(input.row.currentPeriodStartAt)
  const currentPeriodEndAt = toDate(input.row.currentPeriodEndAt)
  const trialEndsAt = toDate(input.row.trialEndsAt)

  return SubscriptionAgreementState.make({
    id: input.row.id as never,
    customerId: input.row.customerId as never,
    productId: input.productId as never,
    offerId: input.offerId as never,
    ...(input.row.providerId ? { providerSubscriptionId: input.row.providerId as never } : {}),
    status: mapAgreementStatus(input.row.status),
    ...(startedAt ? { activeFrom: startedAt } : {}),
    ...(currentPeriodStartAt ? { currentPeriodStartedAt: currentPeriodStartAt } : {}),
    ...(currentPeriodEndAt ? { currentPeriodEndsAt: currentPeriodEndAt } : {}),
    cancelAtPeriodEnd: Boolean(input.row.cancelAtPeriodEnd),
    ...(input.row.scheduledProductId ? { scheduledOfferId: input.row.scheduledProductId as never } : {}),
    ...(trialEndsAt ? { trialEndsAt } : {})
  })
}
