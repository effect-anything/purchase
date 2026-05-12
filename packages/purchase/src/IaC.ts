import type { Utc } from "effect/DateTime"

import * as Chunk from "effect/Chunk"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Stream from "effect/Stream"

import type { CommercialCatalogSyncInput } from "./core/catalog-service.ts"
import type { NormalizedOffer, NormalizedPurchasePlan, ProductsModule, PurchasePlansModule } from "./dsl.ts"
import type { ServicesReturns } from "./internal/types.ts"
import type { PaymentProviderTag } from "./provider/type.ts"

import { CatalogState } from "./core/catalog-builder.ts"
import {
  CommercialCatalogIssue,
  CommercialCheckoutTarget,
  CommercialOfferNotFound,
  type CommercialCatalog,
  type CommercialOffer,
  type CommercialProduct
} from "./core/commercial-schema.ts"
import { CommercialWorkflowConflict } from "./core/workflow-schema.ts"
import { PayStorageAdapter, type PayStorageProductRecord } from "./db.ts"
import { normalizeCatalog, normalizeSchema } from "./dsl.ts"
import { PaymentClient } from "./provider/client.ts"

// const paddleRequest = <A = unknown>(
//   path: string,
//   init: RequestInit = {},
//   attempt = 0
// ): Effect.Effect<A, PublicPaddleScenarioError> =>
//   fetchJson<{ readonly data?: A }>(`${paddleBaseUrl(config.paddleEnvironment)}${path}`, {
//     ...init,
//     headers: {
//       accept: "application/json",
//       authorization: `Bearer ${Redacted.value(config.paddleApiToken)}`,
//       ...(init.body ? { "content-type": "application/json" } : {}),
//       ...init.headers
//     }
//   }).pipe(
//     Effect.map(({ json }) => json.data as A),
//     Effect.catchAll((error) =>
//       attempt < 5 && /HTTP (429|5\d\d)/.test(error.message)
//         ? sleep(Math.min(2 ** attempt * 300, 5_000)).pipe(Effect.zipRight(paddleRequest(path, init, attempt + 1)))
//         : Effect.fail(error)
//     )
//   ) as Effect.Effect<A, PublicPaddleScenarioError>

// const ensureProviderReady = () =>
//   Effect.gen(function* () {
//     const destinationUrl = `${config.appBaseUrl}${config.webhookPath}`
//     const destinations = yield* paddleRequest<ReadonlyArray<{ readonly id: string; readonly destination: string }>>(
//       "/notification-settings?per_page=100"
//     )
//     const existing = destinations.find((destination) => destination.destination === destinationUrl)

//     if (existing) {
//       yield* paddleRequest(`/notification-settings/${existing.id}`, {
//         method: "PATCH",
//         body: JSON.stringify({ active: true, destination: destinationUrl })
//       })
//       return
//     }

//     yield* paddleRequest("/notification-settings", {
//       method: "POST",
//       body: JSON.stringify({
//         active: true,
//         destination: destinationUrl,
//         type: "url",
//         subscribed_events: [
//           "customer.created",
//           "customer.updated",
//           "transaction.created",
//           "transaction.ready",
//           "transaction.paid",
//           "transaction.updated",
//           "transaction.completed",
//           "transaction.payment_failed",
//           "subscription.created",
//           "subscription.activated",
//           "subscription.updated",
//           "subscription.canceled",
//           "subscription.paused",
//           "subscription.resumed"
//         ]
//       })
//     })
//   })

export class IaC extends Context.Tag("IaC")<IaC, {}>() {
  static Default = Layer.effect(
    IaC,
    Effect.gen(function* () {
      const storage = yield* PayStorageAdapter
      const catalogState = yield* CatalogState
      const provider = yield* PaymentClient
      const activeProvider = provider._tag

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

      const getCatalog = () => Effect.succeed(catalogState.catalog)

      const input: any = {}

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
        const localProviderProductRefs = new Set(
          existingProviderRefs
            .filter((ref) => ref.ownerType === "product" && ref.kind === "product")
            .map((ref) => ref.providerId)
        )
        const localProviderOfferRefs = new Set(
          existingProviderRefs
            .filter((ref) => ref.ownerType === "offer" && ref.kind === "offer")
            .map((ref) => ref.providerId)
        )
        for (const row of existingRows) {
          const provider = toRecord(row.provider)
          const providerProductId = provider[providerProductKey(activeProvider)]
          const providerOfferId = provider[activeProvider]
          if (providerProductId) {
            localProviderProductRefs.add(providerProductId)
          }
          if (providerOfferId) {
            localProviderOfferRefs.add(providerOfferId)
          }
        }
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
                  if (refInput.kind === "product") {
                    localProviderProductRefs.add(refInput.providerId)
                  } else {
                    localProviderOfferRefs.add(refInput.providerId)
                  }
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
          if (refInput.kind === "product") {
            localProviderProductRefs.add(refInput.providerId)
          } else {
            localProviderOfferRefs.add(refInput.providerId)
          }
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
            : yield* provider.products
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
          if (
            plan.archiveCandidates.some(
              (existing) => existing.kind === candidate.kind && existing.providerId === candidate.providerId
            )
          ) {
            return
          }

          plan.archiveCandidates.push(candidate)
        }

        const archiveProviderObject = (candidate: CommercialCatalogSyncPlanArchiveCandidate) => {
          if (dryRun || !candidate.safeToArchive) {
            return Effect.void
          }

          if (candidate.ownerType === "offer") {
            return provider.prices.archive({ priceId: candidate.providerId }).pipe(Effect.catchAll(() => Effect.void))
          }

          return provider.products
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
                  : yield* provider.prices
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
                          commercialOfferId: offer.id,
                          workflow: "catalog.sync"
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
              return yield* new CommercialCatalogIssue({ message: `Missing provider offer id for "${offer.id}"` })
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
            localProviderProductRefs.add(providerProduct.providerId)
            localProviderOfferRefs.add(providerOfferId)
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

        const archiveProviderOrphans = Effect.fnUntraced(function* () {
          const providerProducts = yield* provider.products.stream({ status: ["active"], perPage: 100 }).pipe(
            Stream.runCollect,
            Effect.map(Chunk.toReadonlyArray),
            Effect.catchAll(() => Effect.succeed([] as const))
          )
          const sdkProductIds = new Set(
            providerProducts
              .filter((product) => metadataString(product.metadata, "workflow") === "catalog.sync")
              .map((product) => product.id)
          )

          yield* Effect.forEach(
            providerProducts,
            (providerProduct) =>
              Effect.gen(function* () {
                const metadata = providerProduct.metadata ?? {}
                const ownerId = metadataString(metadata, "commercialProductId")
                const sdkOwned = metadataString(metadata, "workflow") === "catalog.sync" && Boolean(ownerId)

                yield* Effect.forEach(
                  providerProduct.prices,
                  (providerPrice) =>
                    Effect.gen(function* () {
                      const priceMetadata = providerPrice.metadata ?? {}
                      const priceOwnerId = metadataString(priceMetadata, "commercialOfferId")
                      const priceProductOwnerId = metadataString(priceMetadata, "commercialProductId") ?? ownerId
                      const priceSdkOwned =
                        Boolean(priceOwnerId) &&
                        (metadataString(priceMetadata, "workflow") === "catalog.sync" ||
                          sdkProductIds.has(providerPrice.productId))

                      if (!providerPrice.active || !priceSdkOwned || localProviderOfferRefs.has(providerPrice.id)) {
                        return
                      }

                      const archiveCandidate: CommercialCatalogSyncPlanArchiveCandidate = {
                        ownerType: "offer",
                        ownerId: priceOwnerId ?? providerPrice.id,
                        provider: activeProvider,
                        providerId: providerPrice.id,
                        kind: "offer",
                        safeToArchive: true,
                        ownership: "sdk",
                        reason: "provider_orphan",
                        action: "provider_archive_if_supported"
                      }
                      addArchiveCandidate(archiveCandidate)
                      yield* archiveProviderObject(archiveCandidate)
                    }),
                  { concurrency: 1, discard: true }
                )

                if (!providerProduct.active || !sdkOwned || localProviderProductRefs.has(providerProduct.id)) {
                  return
                }

                const archiveCandidate: CommercialCatalogSyncPlanArchiveCandidate = {
                  ownerType: "product",
                  ownerId: ownerId ?? providerProduct.id,
                  provider: activeProvider,
                  providerId: providerProduct.id,
                  kind: "product",
                  safeToArchive: true,
                  ownership: "sdk",
                  reason: "provider_orphan",
                  action: "provider_archive_if_supported"
                }
                addArchiveCandidate(archiveCandidate)
                yield* archiveProviderObject(archiveCandidate)
              }),
            { concurrency: 1, discard: true }
          )
        })

        yield* Effect.forEach(
          commercialCatalog.products,
          (product) =>
            Effect.gen(function* () {
              const resolvedProduct = productMap.get(product.id)

              if (!resolvedProduct) {
                return yield* new CommercialCatalogIssue({ message: `Missing commercial product for "${product.id}"` })
              }

              yield* Effect.forEach(
                product.offers,
                (offer) =>
                  Effect.gen(function* () {
                    const normalizedOffer = normalizedOfferMap.get(offer.id)

                    if (!normalizedOffer) {
                      return yield* new CommercialCatalogIssue({
                        message: `Missing normalized offer for "${offer.id}"`
                      })
                    }

                    const normalizedPlan = normalizedPlans.planMap.get(offer.sourcePlanId)

                    if (!normalizedPlan) {
                      return yield* new CommercialCatalogIssue({
                        message: `Missing normalized plan for offer "${offer.id}"`
                      })
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

        yield* archiveProviderOrphans()

        return {
          provider: activeProvider,
          offers: normalizedCatalog.offers.length,
          features: normalizedPlans.features.length,
          dryRun,
          plan
        } as const
      })

      return {
        sync
      }
    })
  )
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
  readonly reason: "removed_offer" | "changed_price" | "changed_billing_interval" | "provider_orphan"
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

export interface CommercialCatalogSyncPlanArchiveCandidate {
  readonly ownerType: "product" | "offer"
  readonly ownerId: string
  readonly provider: PaymentProviderTag
  readonly providerId: string
  readonly kind: "product" | "offer"
  readonly safeToArchive: boolean
  readonly ownership: CommercialCatalogProviderOwnership
  readonly reason: "removed_offer" | "changed_price" | "changed_billing_interval" | "provider_orphan"
  /**
   * Provider objects are archived only when this is `provider_archive_if_supported` and `dryRun` is false.
   * External or unknown ownership is never destructively archived; stale local rows receive an archive marker instead.
   */
  readonly action: "provider_archive_if_supported" | "local_archive_marker" | "skip_external_or_unknown"
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

const hasSameRecord = (left: Record<string, string>, right: Record<string, string>) =>
  stableStringify(left) === stableStringify(right)

const metadataString = (metadata: Record<string, unknown> | null | undefined, key: string) => {
  const value = metadata?.[key]
  return typeof value === "string" ? value : undefined
}

const toStorageUtc = (value: Date): Utc => value as unknown as Utc

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
