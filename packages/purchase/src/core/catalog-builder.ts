import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import {
  normalizeCatalog,
  normalizeSchema,
  type NormalizedOffer,
  type NormalizedProduct,
  type NormalizedPurchasePlan,
  type NormalizedPurchasePlanFeature,
  type ProductsModule,
  type PurchasePlansModule
} from "../dsl.ts"
import {
  CommercialCatalog,
  CommercialCatalogIssue,
  CommercialOffer,
  CommercialProduct,
  CreditBalanceBenefit,
  FeatureFlagBenefit,
  QuotaLimitBenefit,
  type CommercialBenefit
} from "./commercial-schema.ts"

const mapBillingInterval = (input: NormalizedOffer): "month" | "year" | "one_time" | undefined => {
  if (input.mode === "subscription") {
    return input.priceInterval ?? undefined
  }

  if (input.mode === "one_time" || input.mode === "credits") {
    return "one_time"
  }

  return undefined
}

const mapFeatureToBenefit = (input: {
  readonly feature: NormalizedPurchasePlanFeature
  readonly offer: NormalizedOffer
}): CommercialBenefit => {
  const benefitId = `${input.offer.id}:${input.feature.id}`

  if (input.feature.type === "feature_flag") {
    return FeatureFlagBenefit.make({
      id: benefitId as never,
      type: "feature_flag",
      key: input.feature.id as never,
      enabled: true
    })
  }

  if (input.feature.type === "credit_unit") {
    return CreditBalanceBenefit.make({
      id: benefitId as never,
      type: "credit_balance",
      key: input.feature.id as never,
      unit: (input.feature.unit ?? input.feature.id) as never,
      amount: input.feature.amount ?? 0,
      ...(input.feature.expiresInDays === null ? {} : { expiresInDays: input.feature.expiresInDays })
    })
  }

  return QuotaLimitBenefit.make({
    id: benefitId as never,
    type: "quota_limit",
    key: input.feature.id as never,
    limit: input.feature.limit ?? 0,
    resetInterval: input.feature.resetInterval ?? "never"
  })
}

const mapOffer = (input: { readonly offer: NormalizedOffer; readonly plan: NormalizedPurchasePlan }) =>
  CommercialOffer.make({
    id: input.offer.id as never,
    productId: input.offer.productId as never,
    sourcePlanId: input.plan.id as never,
    group: input.plan.group as never,
    name: input.offer.name,
    type: input.offer.mode,
    ...(mapBillingInterval(input.offer) ? { billingInterval: mapBillingInterval(input.offer) } : {}),
    ...(input.offer.priceAmount === null ? {} : { priceAmount: input.offer.priceAmount }),
    ...(input.offer.priceAmount === null ? {} : { currency: "usd" as never }),
    isDefault: input.offer.isDefault,
    provider: input.offer.provider,
    benefits: input.plan.includes.map((feature) => mapFeatureToBenefit({ feature, offer: input.offer })),
    metadata: input.offer.metadata
  })

const mapProduct = (input: {
  readonly product: NormalizedProduct
  readonly offers: ReadonlyArray<typeof CommercialOffer.Type>
}) =>
  CommercialProduct.make({
    id: input.product.id as never,
    type: input.product.mode,
    name: input.product.name,
    ...(input.product.description === null ? {} : { description: input.product.description }),
    provider: input.product.provider,
    offers: input.offers,
    metadata: input.product.metadata
  })

export const buildCommercialCatalog = Effect.fn("buildCommercialCatalog")(
  function* (input: {
    readonly plans: PurchasePlansModule | undefined
    readonly products: ProductsModule | undefined
  }) {
    const normalizedPlans = yield* Effect.try({
      try: () => normalizeSchema(input.plans, input.products),
      catch: (cause) => new CommercialCatalogIssue({ message: `Failed to normalize plans: ${String(cause)}` })
    })
    const normalizedCatalog = yield* Effect.try({
      try: () => normalizeCatalog(input.products),
      catch: (cause) => new CommercialCatalogIssue({ message: `Failed to normalize products: ${String(cause)}` })
    })
    const products = yield* Effect.forEach(normalizedCatalog.products, (product) =>
      Effect.gen(function* () {
        const offers = yield* Effect.forEach(product.offerIds, (offerId) =>
          Effect.gen(function* () {
            const offer = normalizedCatalog.offerMap.get(offerId)
            const plan = offer ? normalizedPlans.planMap.get(offer.planId) : undefined
            if (!offer || !plan) {
              return yield* new CommercialCatalogIssue({ message: `Missing normalized offer or plan for "${offerId}"` })
            }
            return mapOffer({ offer, plan })
          })
        )
        return mapProduct({ product, offers })
      })
    )
    return yield* decodeCommercialCatalog({ products }).pipe(
      Effect.mapError(
        (cause) => new CommercialCatalogIssue({ message: `Invalid commercial catalog: ${String(cause)}` })
      )
    )
  },
  Effect.catchTag("CommercialCatalogIssue", Effect.fail)
)

export const decodeCommercialCatalog = Schema.decodeUnknown(CommercialCatalog)

export class CatalogState extends Context.Tag("@xstack/pay/core/CatalogState")<
  CatalogState,
  {
    catalog: CommercialCatalog
  }
>() {}
