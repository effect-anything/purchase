import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"

import type { ServicesReturns } from "../internal/types.ts"
import type { PaymentProviderTag } from "../provider/types.ts"

import { CatalogState } from "../core/catalog-builder.ts"
import {
  CommercialCheckoutTarget,
  CommercialOfferNotFound,
  type CommercialCatalog,
  type CommercialCatalogIssue,
  type CommercialOffer,
  type CommercialProduct
} from "../core/commercial-schema.ts"
import { PayStorageAdapter } from "../db.ts"

/**
 * Read-side service for resolved commercial catalog data.
 */
export class CommercialCatalogService extends Context.Tag("@pay/core/CommercialCatalogService")<
  CommercialCatalogService,
  {
    /**
     * Load the full commercial catalog snapshot.
     */
    readonly getCatalog: () => Effect.Effect<CommercialCatalog, CommercialCatalogIssue>
    /**
     * Get a product by commercial product id.
     */
    readonly getProduct: (input: {
      readonly productId: string
    }) => Effect.Effect<Option.Option<CommercialProduct>, CommercialCatalogIssue>
    /**
     * Get an offer by commercial offer id.
     */
    readonly getOffer: (input: {
      readonly offerId: string
    }) => Effect.Effect<Option.Option<CommercialOffer>, CommercialCatalogIssue>
    /**
     * List offers belonging to a commercial product.
     */
    readonly listOffersByProduct: (input: {
      readonly productId: string
    }) => Effect.Effect<ReadonlyArray<CommercialOffer>, CommercialCatalogIssue>
    /**
     * Resolve the default offer for a product and optional group.
     */
    readonly resolveDefaultOffer: (input: {
      readonly productId: string
      readonly group?: string | undefined
    }) => Effect.Effect<Option.Option<CommercialOffer>, CommercialCatalogIssue>
    /**
     * List valid subscription change targets for the current offer.
     */
    readonly listSubscriptionChangeTargets: (input: {
      readonly currentOfferId: string
    }) => Effect.Effect<ReadonlyArray<CommercialOffer>, CommercialOfferNotFound | CommercialCatalogIssue>
    /**
     * Resolve checkout data for an offer and provider.
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

export const CommercialCatalogServiceLayer = Layer.effect(
  CommercialCatalogService,
  Effect.gen(function* () {
    const storage = yield* PayStorageAdapter
    const catalogState = yield* CatalogState

    const getCatalog = () => Effect.succeed(catalogState.catalog)

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
          (offer) => offer.id !== currentOffer.id && offer.type === "subscription" && offerGroupKey(offer) === groupKey
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

    return CommercialCatalogService.of({
      getCatalog,
      getProduct,
      getOffer,
      listOffersByProduct,
      resolveDefaultOffer,
      listSubscriptionChangeTargets,
      resolveCheckoutTarget
    })
  })
)

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
