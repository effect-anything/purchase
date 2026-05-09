import type { Utc } from "effect/DateTime"

import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"

import type { NormalizedOffer, NormalizedPurchasePlan, ProductsModule, PurchasePlansModule } from "../dsl.ts"
import type { ServicesReturns } from "../internal/types.ts"
import type { PaymentProviderTag } from "../provider/type.ts"

import { PayStorageAdapter, type PayStorageProductRecord } from "../db.ts"
import { normalizeCatalog, normalizeSchema } from "../dsl.ts"
import { PaymentImpl } from "../provider/impl.ts"
import { CatalogState } from "./catalog-builder.ts"
import {
  CommercialCatalogIssue,
  CommercialCheckoutTarget,
  CommercialOfferNotFound,
  type CommercialCatalog,
  type CommercialOffer,
  type CommercialProduct
} from "./commercial-schema.ts"
import { CommercialWorkflowConflict } from "./workflow-schema.ts"

const offerMap = (catalog: CommercialCatalog) =>
  new Map(catalog.products.flatMap((product) => product.offers.map((offer) => [offer.id, offer] as const)))

const findOffer = (catalog: CommercialCatalog, offerId: string) =>
  Option.fromNullable(offerMap(catalog).get(offerId as never))

const findProduct = (catalog: CommercialCatalog, productId: string) =>
  Option.fromNullable(catalog.products.find((product) => product.id === productId))

const offerGroupKey = (offer: CommercialOffer) => `${offer.productId}:${offer.group}`

const toRecord = (value: unknown): Record<string, string> => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, string>
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, string>) : {}
    } catch {
      return {}
    }
  }

  return {}
}

const providerProductKey = (providerTag: PaymentProviderTag) => `${providerTag}:product`
const providerOfferOwnershipKey = (providerTag: PaymentProviderTag) => `${providerTag}:ownership:offer`
const providerProductOwnershipKey = (providerTag: PaymentProviderTag) => `${providerTag}:ownership:product`
const providerArchivedAtKey = (providerTag: PaymentProviderTag) => `${providerTag}:archivedAt`

type CommercialCatalogProviderOwnership = "sdk" | "external" | "unknown"
type CommercialCatalogSyncChangeReason =
  | "missing"
  | "removed_offer"
  | "changed_price"
  | "changed_billing_interval"
  | "changed_product_metadata"

export interface CommercialCatalogSyncPlanProductCreate {
  readonly productId: string
  readonly provider: PaymentProviderTag
  readonly providerProductId: string
  readonly ownership: CommercialCatalogProviderOwnership
}

export interface CommercialCatalogSyncPlanPriceCreate {
  readonly offerId: string
  readonly productId: string
  readonly provider: PaymentProviderTag
  readonly providerProductId: string
  readonly providerOfferId: string
  readonly reason: "missing" | "changed_price" | "changed_billing_interval"
  readonly ownership: CommercialCatalogProviderOwnership
}

export interface CommercialCatalogSyncPlanLocalRow {
  readonly offerId: string
  readonly productId: string
  readonly provider: PaymentProviderTag
  readonly providerProductId?: string | undefined
  readonly providerOfferId?: string | undefined
  readonly reason: CommercialCatalogSyncChangeReason
}

export interface CommercialCatalogSyncPlanProviderRef {
  readonly ownerType: "product" | "offer"
  readonly ownerId: string
  readonly provider: PaymentProviderTag
  readonly providerId: string
  readonly kind: "product" | "offer"
}

export interface CommercialCatalogSyncPlanStaleRow {
  readonly offerId: string
  readonly productId?: string | undefined
  readonly reason: Exclude<CommercialCatalogSyncChangeReason, "missing">
}

export interface CommercialCatalogSyncPlanArchiveCandidate {
  readonly ownerType: "product" | "offer"
  readonly ownerId: string
  readonly provider: PaymentProviderTag
  readonly providerId: string
  readonly kind: "product" | "offer"
  readonly safeToArchive: boolean
  readonly ownership: CommercialCatalogProviderOwnership
  readonly reason: "removed_offer" | "changed_price" | "changed_billing_interval"
  /**
   * Provider objects are archived only when this is `provider_archive_if_supported` and `dryRun` is false.
   * External or unknown ownership is never destructively archived; stale local rows receive an archive marker instead.
   */
  readonly action: "provider_archive_if_supported" | "local_archive_marker" | "skip_external_or_unknown"
}

export interface CommercialCatalogSyncPlan {
  readonly productsToCreate: ReadonlyArray<CommercialCatalogSyncPlanProductCreate>
  readonly pricesToCreate: ReadonlyArray<CommercialCatalogSyncPlanPriceCreate>
  readonly localRowsToInsert: ReadonlyArray<CommercialCatalogSyncPlanLocalRow>
  readonly localRowsToUpdate: ReadonlyArray<CommercialCatalogSyncPlanLocalRow>
  readonly providerRefsToInsert: ReadonlyArray<CommercialCatalogSyncPlanProviderRef>
  readonly providerRefsToUpdate: ReadonlyArray<CommercialCatalogSyncPlanProviderRef>
  readonly staleRows: ReadonlyArray<CommercialCatalogSyncPlanStaleRow>
  readonly archiveCandidates: ReadonlyArray<CommercialCatalogSyncPlanArchiveCandidate>
}

export interface CommercialCatalogSyncInput {
  /**
   * Builds the same sync plan without creating provider objects, writing provider refs,
   * inserting or updating local rows, or archiving provider objects.
   */
  readonly dryRun?: boolean | undefined
}

export interface CommercialCatalogSyncResult {
  readonly provider: PaymentProviderTag
  readonly offers: number
  readonly features: number
  readonly dryRun: boolean
  readonly plan: CommercialCatalogSyncPlan
}

const makeSyncPlan = (): {
  productsToCreate: Array<CommercialCatalogSyncPlanProductCreate>
  pricesToCreate: Array<CommercialCatalogSyncPlanPriceCreate>
  localRowsToInsert: Array<CommercialCatalogSyncPlanLocalRow>
  localRowsToUpdate: Array<CommercialCatalogSyncPlanLocalRow>
  providerRefsToInsert: Array<CommercialCatalogSyncPlanProviderRef>
  providerRefsToUpdate: Array<CommercialCatalogSyncPlanProviderRef>
  staleRows: Array<CommercialCatalogSyncPlanStaleRow>
  archiveCandidates: Array<CommercialCatalogSyncPlanArchiveCandidate>
} => ({
  productsToCreate: [],
  pricesToCreate: [],
  localRowsToInsert: [],
  localRowsToUpdate: [],
  providerRefsToInsert: [],
  providerRefsToUpdate: [],
  staleRows: [],
  archiveCandidates: []
})

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`
  }

  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`)
      .join(",")}}`
  }

  return JSON.stringify(value)
}

const computeSyncHash = (input: {
  readonly normalizedOffer: NormalizedOffer
  readonly normalizedPlan: NormalizedPurchasePlan
  readonly offer: CommercialOffer
  readonly product: CommercialProduct
}) =>
  stableStringify({
    normalizedOffer: {
      id: input.normalizedOffer.id,
      isDefault: input.normalizedOffer.isDefault,
      metadata: input.normalizedOffer.metadata,
      mode: input.normalizedOffer.mode,
      name: input.normalizedOffer.name,
      planId: input.normalizedOffer.planId,
      priceAmount: input.normalizedOffer.priceAmount,
      priceInterval: input.normalizedOffer.priceInterval,
      productId: input.normalizedOffer.productId,
      productProvider: input.normalizedOffer.productProvider,
      provider: input.normalizedOffer.provider
    },
    normalizedPlan: {
      group: input.normalizedPlan.group,
      id: input.normalizedPlan.id,
      includes: input.normalizedPlan.includes.map((include) => ({
        config: include.config,
        id: include.id,
        limit: include.limit,
        resetInterval: include.resetInterval,
        type: include.type
      })),
      isDefault: input.normalizedPlan.isDefault,
      metadata: input.normalizedPlan.metadata,
      name: input.normalizedPlan.name,
      priceAmount: input.normalizedPlan.priceAmount,
      priceInterval: input.normalizedPlan.priceInterval,
      provider: input.normalizedPlan.provider
    },
    offer: {
      group: input.offer.group,
      isDefault: input.offer.isDefault,
      metadata: input.offer.metadata,
      name: input.offer.name
    },
    product: {
      description: input.product.description ?? null,
      metadata: input.product.metadata,
      name: input.product.name
    }
  })

const providerRefKey = (input: { readonly ownerType: string; readonly ownerId: string; readonly kind: string }) =>
  `${input.ownerType}:${input.ownerId}:${input.kind}`

const offerProductIdFromStorageId = (offerId: string) => {
  const separator = offerId.indexOf(":")
  return separator === -1 ? undefined : offerId.slice(0, separator)
}

const recordOwnership = (record: Record<string, string>, key: string): CommercialCatalogProviderOwnership => {
  const value = record[key]
  return value === "sdk" || value === "external" ? value : "unknown"
}

const hasSameRecord = (left: Record<string, string>, right: Record<string, string>) =>
  stableStringify(left) === stableStringify(right)

export class CommercialCatalogService extends Context.Tag("@pay/core/CommercialCatalogService")<
  CommercialCatalogService,
  {
    /**
     *
     */
    readonly getCatalog: () => Effect.Effect<CommercialCatalog, CommercialCatalogIssue>
    /**
     *
     */
    readonly getProduct: (input: {
      readonly productId: string
    }) => Effect.Effect<Option.Option<CommercialProduct>, CommercialCatalogIssue>
    /**
     *
     */
    readonly getOffer: (input: {
      readonly offerId: string
    }) => Effect.Effect<Option.Option<CommercialOffer>, CommercialCatalogIssue>
    readonly sync: (
      input?: CommercialCatalogSyncInput | undefined
    ) => Effect.Effect<CommercialCatalogSyncResult, unknown>
    /**
     *
     */
    readonly listOffersByProduct: (input: {
      readonly productId: string
    }) => Effect.Effect<ReadonlyArray<CommercialOffer>, CommercialCatalogIssue>
    /**
     *
     */
    readonly resolveDefaultOffer: (input: {
      readonly productId: string
      readonly group?: string | undefined
    }) => Effect.Effect<Option.Option<CommercialOffer>, CommercialCatalogIssue>
    /**
     *
     */
    readonly listSubscriptionChangeTargets: (input: {
      readonly currentOfferId: string
    }) => Effect.Effect<ReadonlyArray<CommercialOffer>, CommercialOfferNotFound | CommercialCatalogIssue>
    /**
     *
     */
    readonly resolveCheckoutTarget: (input: {
      readonly offerId: string
      readonly provider: PaymentProviderTag
    }) => Effect.Effect<CommercialCheckoutTarget, CommercialOfferNotFound | CommercialCatalogIssue>
  }
>() {}
export declare namespace CommercialCatalogService {
  export type Methods = Context.Tag.Service<CommercialCatalogService>
  export type Returns<key extends keyof Methods, R = never> = ServicesReturns<Methods[key], R>
}

export const CommercialCatalogServiceLayer = (input: {
  readonly plans: PurchasePlansModule | undefined
  readonly products: ProductsModule | undefined
}) =>
  Layer.effect(
    CommercialCatalogService,
    Effect.gen(function* () {
      const storage = yield* PayStorageAdapter
      const catalogState = yield* CatalogState
      const paymentImpl = yield* PaymentImpl
      const payment = yield* paymentImpl.make
      const activeProvider = paymentImpl._tag

      const getCatalog = () => Effect.succeed(catalogState.catalog)

      const getNormalizedCatalog = () =>
        Effect.try({
          try: () => normalizeCatalog(input.products),
          catch: (cause) => new CommercialCatalogIssue({ message: `Failed to normalize products: ${String(cause)}` })
        })
      const getNormalizedPlans = () =>
        Effect.try({
          try: () => normalizeSchema(input.plans, input.products),
          catch: (cause) => new CommercialCatalogIssue({ message: `Failed to normalize plans: ${String(cause)}` })
        })

      const getProduct = Effect.fn("CommercialCatalogService.getProduct")(function* ({
        productId
      }: {
        readonly productId: string
      }) {
        const catalog = catalogState.catalog
        return findProduct(catalog, productId)
      })

      const getOffer = Effect.fn("CommercialCatalogService.getOffer")(function* ({
        offerId
      }: {
        readonly offerId: string
      }) {
        const catalog = catalogState.catalog
        return findOffer(catalog, offerId)
      })

      const requireOffer = Effect.fn("CommercialCatalogService.requireOffer")(function* ({
        offerId
      }: {
        readonly offerId: string
      }) {
        const offer = yield* getOffer({ offerId })

        return yield* Option.match(offer, {
          onNone: () => Effect.fail(new CommercialOfferNotFound({ offerId: offerId as never })),
          onSome: Effect.succeed
        })
      })

      const listOffersByProduct = Effect.fn("CommercialCatalogService.listOffersByProduct")(function* ({
        productId
      }: {
        readonly productId: string
      }) {
        const product = yield* getProduct({ productId })

        return Option.match(product, {
          onNone: () => [] as const,
          onSome: (resolvedProduct) => resolvedProduct.offers
        })
      })

      const resolveDefaultOffer = Effect.fn("CommercialCatalogService.resolveDefaultOffer")(function* ({
        productId,
        group
      }: {
        readonly productId: string
        readonly group?: string | undefined
      }) {
        const offers = yield* listOffersByProduct({ productId })

        return Option.fromNullable(
          offers.find((offer) => offer.isDefault && (group === undefined || offer.group === group))
        )
      })

      const listSubscriptionChangeTargets = Effect.fn("CommercialCatalogService.listSubscriptionChangeTargets")(
        function* ({ currentOfferId }: { readonly currentOfferId: string }) {
          const currentOffer = yield* requireOffer({ offerId: currentOfferId })

          if (currentOffer.type !== "subscription") {
            return [] as const
          }

          const offers = yield* listOffersByProduct({ productId: currentOffer.productId })
          const groupKey = offerGroupKey(currentOffer)

          return offers.filter(
            (offer) =>
              offer.id !== currentOffer.id && offer.type === "subscription" && offerGroupKey(offer) === groupKey
          )
        }
      )

      const resolveCheckoutTarget = Effect.fn("CommercialCatalogService.resolveCheckoutTarget")(function* ({
        offerId,
        provider: providerTag
      }: {
        readonly offerId: string
        readonly provider: PaymentProviderTag
      }) {
        const offer = yield* requireOffer({ offerId })
        const product = yield* getProduct({ productId: offer.productId }).pipe(Effect.map(Option.getOrUndefined))
        const persistedOffer = yield* storage.product
          .findFirst({
            where: [
              ["id", offer.id],
              ["version", 1]
            ]
          })
          .pipe(Effect.orDie)
        const persistedProvider: Record<string, string> = Option.match(persistedOffer, {
          onNone: () => ({}),
          onSome: (row) => toRecord(row.provider)
        })

        return CommercialCheckoutTarget.make({
          provider: providerTag,
          productId: offer.productId,
          offerId: offer.id,
          productType: offer.type,
          ...(offer.billingInterval ? { billingInterval: offer.billingInterval } : {}),
          ...((persistedProvider[providerProductKey(providerTag)] ?? product?.provider[providerTag])
            ? {
                providerProductId: (persistedProvider[providerProductKey(providerTag)] ??
                  product?.provider[providerTag]) as never
              }
            : {}),
          ...((persistedProvider[providerTag] ?? offer.provider[providerTag])
            ? { providerOfferId: (persistedProvider[providerTag] ?? offer.provider[providerTag]) as never }
            : {})
        })
      })

      const sync = Effect.fn("CommercialCatalogService.sync")(function* (
        syncInput?: CommercialCatalogSyncInput | undefined
      ) {
        const commercialCatalog = catalogState.catalog
        const normalizedCatalog = yield* getNormalizedCatalog()
        const normalizedPlans = yield* getNormalizedPlans()
        const productMap = new Map(commercialCatalog.products.map((product) => [product.id, product] as const))
        const normalizedOfferMap = normalizedCatalog.offerMap
        const dryRun = syncInput?.dryRun === true
        const plan = makeSyncPlan()
        const desiredOfferIds = new Set(normalizedCatalog.offers.map((offer) => offer.id))
        const desiredProductIds = new Set(normalizedCatalog.products.map((product) => product.id))
        const existingRows = yield* storage.product.findMany({ where: [["version", 1]] }).pipe(Effect.orDie)
        const existingRowByOfferId = new Map(existingRows.map((row) => [row.id, row] as const))
        const existingProviderRefs = yield* storage.providerRef
          .findMany({ where: [["provider", activeProvider]] })
          .pipe(Effect.orDie)
        const providerRefsByKey = new Map(existingProviderRefs.map((ref) => [providerRefKey(ref), ref] as const))
        const plannedProviderRefKeys = new Set<string>()
        const resolvedProductIds = new Map<
          string,
          {
            readonly providerId: string
            readonly ownership: CommercialCatalogProviderOwnership
          }
        >()

        const upsertProviderRef = Effect.fnUntraced(function* (refInput: CommercialCatalogSyncPlanProviderRef) {
          const refKey = providerRefKey(refInput)
          const existing = providerRefsByKey.get(refKey)
          if (existing) {
            if (existing.providerId !== refInput.providerId) {
              if (plannedProviderRefKeys.has(refKey)) {
                return
              }
              plannedProviderRefKeys.add(refKey)
              plan.providerRefsToUpdate.push(refInput)
              if (!dryRun) {
                const updated = yield* storage.providerRef
                  .updateFirst({
                    where: [["id", existing.id]],
                    set: {
                      providerId: refInput.providerId,
                      updatedAt: toStorageUtc(new Date())
                    }
                  })
                  .pipe(Effect.orDie)
                if (Option.isSome(updated)) {
                  providerRefsByKey.set(refKey, updated.value)
                }
              }
            }
            return
          }
          if (plannedProviderRefKeys.has(refKey)) {
            return
          }
          plannedProviderRefKeys.add(refKey)
          plan.providerRefsToInsert.push(refInput)
          if (dryRun) {
            return
          }
          const now = toStorageUtc(new Date())
          const inserted = yield* storage.providerRef
            .insert({
              values: {
                id: `${activeProvider}:${refInput.kind}:${refInput.ownerType}:${refInput.ownerId}`,
                provider: activeProvider,
                ownerType: refInput.ownerType,
                ownerId: refInput.ownerId,
                providerId: refInput.providerId,
                kind: refInput.kind,
                createdAt: now,
                updatedAt: now
              }
            })
            .pipe(Effect.orDie)
          providerRefsByKey.set(refKey, inserted)
        })

        const providerRowForProduct = (productId: string) =>
          existingRows.find((row) => offerProductIdFromStorageId(row.id) === productId)

        const resolveProviderProduct = Effect.fnUntraced(function* (product: CommercialProduct) {
          const existingResolution = resolvedProductIds.get(product.id)
          if (existingResolution) {
            return existingResolution
          }
          const externalProviderProductId = product.provider[activeProvider]
          if (externalProviderProductId) {
            const resolved = {
              providerId: externalProviderProductId,
              ownership: "external" as const
            }
            resolvedProductIds.set(product.id, resolved)
            return resolved
          }
          const existingRef = providerRefsByKey.get(
            providerRefKey({ ownerType: "product", ownerId: product.id, kind: "product" })
          )
          const rowProvider = toRecord(providerRowForProduct(product.id)?.provider)
          const existingProviderProductId = existingRef?.providerId ?? rowProvider[providerProductKey(activeProvider)]
          if (existingProviderProductId) {
            const resolved = {
              providerId: existingProviderProductId,
              ownership: recordOwnership(rowProvider, providerProductOwnershipKey(activeProvider))
            }
            resolvedProductIds.set(product.id, resolved)
            return resolved
          }
          const providerProductId = dryRun
            ? `dry_run:${activeProvider}:product:${product.id}`
            : yield* payment.products
                .create({
                  name: product.name,
                  description: product.description ?? undefined,
                  metadata: {
                    commercialProductId: product.id,
                    workflow: "catalog.sync"
                  }
                })
                .pipe(
                  Effect.map((createdProduct) => createdProduct.id),
                  Effect.mapError(
                    (cause) =>
                      new CommercialWorkflowConflict({
                        workflow: "catalog.sync",
                        message: `Failed to create provider product for "${product.id}": ${String(cause)}`
                      })
                  )
                )
          const resolved = {
            providerId: providerProductId,
            ownership: "sdk" as const
          }
          resolvedProductIds.set(product.id, resolved)
          plan.productsToCreate.push({
            productId: product.id,
            provider: activeProvider,
            providerProductId,
            ownership: resolved.ownership
          })
          return resolved
        })

        const addArchiveCandidate = (candidate: CommercialCatalogSyncPlanArchiveCandidate) => {
          plan.archiveCandidates.push(candidate)
        }

        const archiveProviderObject = (candidate: CommercialCatalogSyncPlanArchiveCandidate) => {
          if (dryRun || !candidate.safeToArchive) {
            return Effect.void
          }

          if (candidate.ownerType === "offer") {
            return payment.prices.archive({ priceId: candidate.providerId }).pipe(Effect.catchAll(() => Effect.void))
          }

          return payment.products
            .archive({ productId: candidate.providerId as never })
            .pipe(Effect.catchAll(() => Effect.void))
        }

        const upsertOfferProjection = (
          offer: CommercialOffer,
          product: CommercialProduct,
          normalizedOffer: NormalizedOffer,
          normalizedPlan: NormalizedPurchasePlan
        ) =>
          Effect.gen(function* () {
            const existing = Option.fromNullable(existingRowByOfferId.get(offer.id))
            const currentProvider: Record<string, string> = Option.match(existing, {
              onNone: () => ({}),
              onSome: (row) => toRecord(row.provider)
            })
            const providerProduct = yield* resolveProviderProduct(product)
            const externalProviderOfferId = offer.provider[activeProvider]
            const currentProviderOfferId = currentProvider[activeProvider]
            const existingRow = Option.getOrUndefined(existing)
            const existingPriceAmount =
              typeof existingRow?.priceAmount === "number" ? existingRow.priceAmount : undefined
            const existingPriceInterval = existingRow?.priceInterval ?? undefined
            const priceChanged = Option.isSome(existing) && existingPriceAmount !== offer.priceAmount
            const billingIntervalChanged = Option.isSome(existing) && existingPriceInterval !== offer.billingInterval
            const previousProviderOfferOwnership = recordOwnership(
              currentProvider,
              providerOfferOwnershipKey(activeProvider)
            )
            const shouldCreateProviderPrice =
              !externalProviderOfferId &&
              (!currentProviderOfferId ||
                priceChanged ||
                billingIntervalChanged ||
                previousProviderOfferOwnership === "external")
            const providerOfferOwnership: CommercialCatalogProviderOwnership = externalProviderOfferId
              ? "external"
              : shouldCreateProviderPrice
                ? "sdk"
                : recordOwnership(currentProvider, providerOfferOwnershipKey(activeProvider))
            const providerOfferId = externalProviderOfferId
              ? externalProviderOfferId
              : shouldCreateProviderPrice
                ? dryRun
                  ? `dry_run:${activeProvider}:offer:${offer.id}`
                  : yield* payment.prices
                      .create({
                        productId: providerProduct.providerId as never,
                        name: offer.name,
                        unitPrice: {
                          amount: displayAmountToMinorUnit(offer.priceAmount ?? 0, offer.currency ?? "USD"),
                          currencyCode: (offer.currency ?? "USD").toUpperCase()
                        },
                        ...(offer.billingInterval && offer.billingInterval !== "one_time"
                          ? {
                              billingCycle: {
                                interval: offer.billingInterval,
                                frequency: 1
                              }
                            }
                          : {}),
                        metadata: {
                          commercialProductId: product.id,
                          commercialOfferId: offer.id
                        }
                      })
                      .pipe(
                        Effect.map((createdPrice) => createdPrice.id),
                        Effect.mapError(
                          (cause) =>
                            new CommercialWorkflowConflict({
                              workflow: "catalog.sync",
                              message: `Failed to create provider price for "${offer.id}": ${String(cause)}`
                            })
                        )
                      )
                : currentProviderOfferId

            if (!providerOfferId) {
              return yield* Effect.fail(
                new CommercialCatalogIssue({ message: `Missing provider offer id for "${offer.id}"` })
              )
            }

            if (shouldCreateProviderPrice) {
              plan.pricesToCreate.push({
                offerId: offer.id,
                productId: product.id,
                provider: activeProvider,
                providerProductId: providerProduct.providerId,
                providerOfferId,
                reason: priceChanged
                  ? "changed_price"
                  : billingIntervalChanged
                    ? "changed_billing_interval"
                    : "missing",
                ownership: "sdk"
              })
            }

            if ((priceChanged || billingIntervalChanged) && currentProviderOfferId) {
              const safeToArchive = previousProviderOfferOwnership === "sdk"
              const archiveCandidate: CommercialCatalogSyncPlanArchiveCandidate = {
                ownerType: "offer",
                ownerId: offer.id,
                provider: activeProvider,
                providerId: currentProviderOfferId,
                kind: "offer",
                safeToArchive,
                ownership: previousProviderOfferOwnership,
                reason: priceChanged ? "changed_price" : "changed_billing_interval",
                action: safeToArchive ? "provider_archive_if_supported" : "skip_external_or_unknown"
              }
              addArchiveCandidate(archiveCandidate)
              yield* archiveProviderObject(archiveCandidate)
            }

            const nextProvider = {
              ...currentProvider,
              [providerProductKey(activeProvider)]: providerProduct.providerId,
              [activeProvider]: providerOfferId,
              [providerProductOwnershipKey(activeProvider)]: providerProduct.ownership,
              [providerOfferOwnershipKey(activeProvider)]: providerOfferOwnership
            }
            delete nextProvider[providerArchivedAtKey(activeProvider)]

            const offerHash = computeSyncHash({ normalizedOffer, normalizedPlan, offer, product })
            const internalId = Option.match(existing, {
              onNone: () => crypto.randomUUID(),
              onSome: (row) => row.internalId
            })
            const now = toStorageUtc(new Date())
            const productValues = {
              name: offer.name,
              group: offer.group,
              isDefault: offer.isDefault,
              priceAmount: offer.priceAmount,
              priceInterval: offer.billingInterval,
              hash: offerHash,
              provider: nextProvider,
              updatedAt: now
            } as const
            const rowPlan: CommercialCatalogSyncPlanLocalRow = {
              offerId: offer.id,
              productId: product.id,
              provider: activeProvider,
              providerProductId: providerProduct.providerId,
              providerOfferId,
              reason: Option.isNone(existing)
                ? "missing"
                : priceChanged
                  ? "changed_price"
                  : billingIntervalChanged
                    ? "changed_billing_interval"
                    : "changed_product_metadata"
            }
            const shouldWriteRow =
              Option.isNone(existing) ||
              existing.value.hash !== offerHash ||
              !hasSameRecord(toRecord(existing.value.provider), nextProvider)

            if (Option.isNone(existing)) {
              plan.localRowsToInsert.push(rowPlan)
            } else if (shouldWriteRow) {
              plan.localRowsToUpdate.push(rowPlan)
              plan.staleRows.push({
                offerId: offer.id,
                productId: product.id,
                reason: rowPlan.reason === "missing" ? "changed_product_metadata" : rowPlan.reason
              })
            }

            if (!dryRun && shouldWriteRow) {
              if (Option.isSome(existing)) {
                yield* storage.product
                  .updateFirst({
                    where: [["internalId", internalId]],
                    set: productValues
                  })
                  .pipe(Effect.orDie)
              } else {
                yield* storage.product
                  .insert({
                    values: {
                      internalId,
                      id: offer.id,
                      version: 1,
                      ...productValues,
                      createdAt: now
                    }
                  })
                  .pipe(Effect.orDie)
              }
            }

            yield* upsertProviderRef({
              ownerType: "product",
              ownerId: product.id,
              provider: activeProvider,
              providerId: providerProduct.providerId,
              kind: "product"
            })
            yield* upsertProviderRef({
              ownerType: "offer",
              ownerId: offer.id,
              provider: activeProvider,
              providerId: providerOfferId,
              kind: "offer"
            })
          })

        const archiveStaleRow = (row: PayStorageProductRecord) =>
          Effect.gen(function* () {
            const currentProvider = toRecord(row.provider)
            const productId = offerProductIdFromStorageId(row.id)
            const providerOfferId = currentProvider[activeProvider]
            const providerProductId = currentProvider[providerProductKey(activeProvider)]
            const offerOwnership = recordOwnership(currentProvider, providerOfferOwnershipKey(activeProvider))
            const productOwnership = recordOwnership(currentProvider, providerProductOwnershipKey(activeProvider))
            plan.staleRows.push({
              offerId: row.id,
              ...(productId ? { productId } : {}),
              reason: "removed_offer"
            })
            plan.localRowsToUpdate.push({
              offerId: row.id,
              productId: productId ?? "",
              provider: activeProvider,
              ...(providerProductId ? { providerProductId } : {}),
              ...(providerOfferId ? { providerOfferId } : {}),
              reason: "removed_offer"
            })

            if (providerOfferId) {
              const safeToArchive = offerOwnership === "sdk"
              const archiveCandidate: CommercialCatalogSyncPlanArchiveCandidate = {
                ownerType: "offer",
                ownerId: row.id,
                provider: activeProvider,
                providerId: providerOfferId,
                kind: "offer",
                safeToArchive,
                ownership: offerOwnership,
                reason: "removed_offer",
                action: safeToArchive ? "provider_archive_if_supported" : "skip_external_or_unknown"
              }
              addArchiveCandidate(archiveCandidate)
              yield* archiveProviderObject(archiveCandidate)
            }

            if (productId && providerProductId && !desiredProductIds.has(productId)) {
              const safeToArchive = productOwnership === "sdk"
              const archiveCandidate: CommercialCatalogSyncPlanArchiveCandidate = {
                ownerType: "product",
                ownerId: productId,
                provider: activeProvider,
                providerId: providerProductId,
                kind: "product",
                safeToArchive,
                ownership: productOwnership,
                reason: "removed_offer",
                action: safeToArchive ? "provider_archive_if_supported" : "skip_external_or_unknown"
              }
              addArchiveCandidate(archiveCandidate)
              yield* archiveProviderObject(archiveCandidate)
            }

            if (dryRun) {
              return
            }

            const now = new Date()
            const nextProvider = {
              ...currentProvider,
              [providerArchivedAtKey(activeProvider)]: now.toISOString()
            }
            yield* storage.product
              .updateFirst({
                where: [["internalId", row.internalId]],
                set: {
                  isDefault: false,
                  hash: `archived:${row.hash ?? row.id}`,
                  provider: nextProvider,
                  updatedAt: toStorageUtc(now)
                }
              })
              .pipe(Effect.orDie)
          })

        const isArchivedForActiveProvider = (row: PayStorageProductRecord) =>
          Boolean(toRecord(row.provider)[providerArchivedAtKey(activeProvider)])

        yield* Effect.forEach(
          commercialCatalog.products,
          (product) =>
            Effect.gen(function* () {
              const resolvedProduct = productMap.get(product.id)

              if (!resolvedProduct) {
                return yield* Effect.fail(
                  new CommercialCatalogIssue({ message: `Missing commercial product for "${product.id}"` })
                )
              }

              yield* Effect.forEach(
                product.offers,
                (offer) =>
                  Effect.gen(function* () {
                    const normalizedOffer = normalizedOfferMap.get(offer.id)

                    if (!normalizedOffer) {
                      return yield* Effect.fail(
                        new CommercialCatalogIssue({ message: `Missing normalized offer for "${offer.id}"` })
                      )
                    }

                    const normalizedPlan = normalizedPlans.planMap.get(offer.sourcePlanId)

                    if (!normalizedPlan) {
                      return yield* Effect.fail(
                        new CommercialCatalogIssue({ message: `Missing normalized plan for offer "${offer.id}"` })
                      )
                    }

                    yield* upsertOfferProjection(offer, resolvedProduct, normalizedOffer, normalizedPlan)
                  }),
                { concurrency: 1, discard: true }
              )
            }),
          { concurrency: 1, discard: true }
        )

        yield* Effect.forEach(
          existingRows.filter((row) => !desiredOfferIds.has(row.id) && !isArchivedForActiveProvider(row)),
          archiveStaleRow,
          { concurrency: 1, discard: true }
        )

        return {
          provider: activeProvider,
          offers: normalizedCatalog.offers.length,
          features: normalizedPlans.features.length,
          dryRun,
          plan
        } as const
      })

      return CommercialCatalogService.of({
        getCatalog,
        getProduct,
        getOffer,
        sync,
        listOffersByProduct,
        resolveDefaultOffer,
        listSubscriptionChangeTargets,
        resolveCheckoutTarget
      })
    })
  )

const toStorageUtc = (value: Date): Utc => value as unknown as Utc

const zeroDecimalCurrencies = new Set([
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF"
])

const displayAmountToMinorUnit = (amount: number, currency: string) => {
  const exponent = zeroDecimalCurrencies.has(currency.toUpperCase()) ? 0 : 2
  return String(Math.round(amount * 10 ** exponent))
}
