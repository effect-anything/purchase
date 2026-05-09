import * as Hash from "effect/Hash"
import * as Schema from "effect/Schema"

const ProductSymbol = Symbol.for("@pay:product")

const ENTITY_ID_PATTERN = /^[a-z0-9_-]+$/

const purchaseFeatureSymbol = Symbol.for("@pay:kit-feature")
const purchaseFeatureIncludeSymbol = Symbol.for("@pay:kit-feature-include")
const purchasePlanSymbol = Symbol.for("@pay:kit-plan")

export const ProductMode = Schema.Literal("one_time", "subscription", "credits")
export type ProductMode = typeof ProductMode.Type

const FeatureDefinitionInput = Schema.Struct({
  id: Schema.String,
  type: Schema.Literal("feature_flag", "quota", "credit_unit"),
  unit: Schema.optional(Schema.String)
})

const BillingInterval = Schema.Literal("month", "year", "one_time")

const PlanPriceInput = Schema.Struct({
  amount: Schema.Number,
  interval: BillingInterval
})

/** Provider ids declared in the DSL are treated as externally owned during catalog sync. */
const ProviderMappingInput = Schema.Record({ key: Schema.String, value: Schema.String })

const QuotaFeatureConfigInput = Schema.Struct({
  limit: Schema.Number,
  reset: Schema.optional(Schema.Literal("day", "week", "month", "year", "never"))
})

const CreditUnitConfigInput = Schema.Struct({
  amount: Schema.Number,
  expiresInDays: Schema.optional(Schema.Number),
  reset: Schema.optional(Schema.Literal("day", "week", "month", "year", "never")),
  unit: Schema.optional(Schema.String)
})

const PlanInput = Schema.Struct({
  default: Schema.optional(Schema.Boolean),
  group: Schema.optional(Schema.String),
  id: Schema.String,
  includes: Schema.optional(Schema.Array(Schema.Unknown)),
  name: Schema.optional(Schema.String),
  price: Schema.optional(PlanPriceInput),
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  provider: Schema.optional(ProviderMappingInput)
})

export type PurchaseFeatureType = typeof FeatureDefinitionInput.Type.type
export type PurchasePriceInterval = typeof BillingInterval.Type
export type PurchasePlanPrice = typeof PlanPriceInput.Type
export type PurchaseBenefitResetInterval = NonNullable<typeof QuotaFeatureConfigInput.Type.reset>
export type PurchaseQuotaFeatureConfig = typeof QuotaFeatureConfigInput.Type
export type PurchaseCreditUnitConfig = typeof CreditUnitConfigInput.Type

export interface PurchaseFeatureDefinition<
  TId extends string = string,
  TType extends PurchaseFeatureType = PurchaseFeatureType
> {
  readonly id: TId
  readonly type: TType
  readonly unit?: string | undefined
}

type FeatureFlagDefinition<TId extends string = string> = PurchaseFeatureDefinition<TId, "feature_flag">
type QuotaFeatureDefinition<TId extends string = string> = PurchaseFeatureDefinition<TId, "quota">
type CreditUnitDefinition<TId extends string = string> = PurchaseFeatureDefinition<TId, "credit_unit">

type FeatureFlagInclude<TFeature extends FeatureFlagDefinition = FeatureFlagDefinition> = Readonly<{
  config: undefined
  feature: TFeature
}>

type QuotaFeatureInclude<TFeature extends QuotaFeatureDefinition = QuotaFeatureDefinition> = Readonly<{
  config: PurchaseQuotaFeatureConfig
  feature: TFeature
}>

type CreditUnitInclude<TFeature extends CreditUnitDefinition = CreditUnitDefinition> = Readonly<{
  config: PurchaseCreditUnitConfig
  feature: TFeature
}>

export type PurchaseFeatureInclude =
  | FeatureFlagInclude<FeatureFlagDefinition>
  | QuotaFeatureInclude<QuotaFeatureDefinition>
  | CreditUnitInclude<CreditUnitDefinition>

type FeatureFlagCallable<TFeature extends FeatureFlagDefinition> = (() => FeatureFlagInclude<TFeature>) &
  Readonly<TFeature>

type QuotaFeatureCallable<TFeature extends QuotaFeatureDefinition> = ((
  config: PurchaseQuotaFeatureConfig
) => QuotaFeatureInclude<TFeature>) &
  Readonly<TFeature>

type CreditUnitCallable<TFeature extends CreditUnitDefinition> = ((
  config: PurchaseCreditUnitConfig
) => CreditUnitInclude<TFeature>) &
  Readonly<TFeature>

export type PurchaseFeature<TFeature extends PurchaseFeatureDefinition = PurchaseFeatureDefinition> =
  TFeature extends FeatureFlagDefinition
    ? FeatureFlagCallable<TFeature>
    : TFeature extends QuotaFeatureDefinition
      ? QuotaFeatureCallable<TFeature>
      : TFeature extends CreditUnitDefinition
        ? CreditUnitCallable<TFeature>
        : never

export interface PurchasePlanConfig<TId extends string = string> {
  readonly default?: boolean
  readonly group?: string
  readonly id: TId
  readonly includes?: ReadonlyArray<PurchaseFeatureInclude>
  readonly metadata?: Record<string, unknown>
  readonly name?: string
  readonly price?: PurchasePlanPrice
  readonly provider?: Record<string, string>
}

export type PurchasePlan<TConfig extends PurchasePlanConfig = PurchasePlanConfig> = Readonly<
  Omit<TConfig, "includes"> & {
    includes: TConfig["includes"] extends ReadonlyArray<PurchaseFeatureInclude>
      ? TConfig["includes"]
      : ReadonlyArray<PurchaseFeatureInclude>
  }
>

export interface NormalizedPurchasePlanFeature {
  readonly amount: number | null
  readonly config: Record<string, unknown> | null
  readonly expiresInDays: number | null
  readonly id: string
  readonly limit: number | null
  readonly resetInterval: PurchaseBenefitResetInterval | null
  readonly type: PurchaseFeatureType
  readonly unit: string | null
}

export interface NormalizedPurchasePlan {
  readonly group: string
  readonly hash: string
  readonly id: string
  readonly includes: ReadonlyArray<NormalizedPurchasePlanFeature>
  readonly isDefault: boolean
  readonly metadata: Record<string, unknown>
  readonly name: string
  readonly priceAmount: number | null
  readonly priceInterval: PurchasePriceInterval | null
  readonly provider: Record<string, string>
}

export interface NormalizedPurchaseFeature {
  readonly id: string
  readonly type: PurchaseFeatureType
}

export interface NormalizedPurchaseSchema {
  readonly features: ReadonlyArray<NormalizedPurchaseFeature>
  readonly planMap: ReadonlyMap<string, NormalizedPurchasePlan>
  readonly plans: ReadonlyArray<NormalizedPurchasePlan>
  readonly products: ReadonlyArray<unknown>
}

export type PurchasePlansModule = ReadonlyArray<PurchasePlan>

export type PlanIdFromPlans<TPlans> =
  TPlans extends ReadonlyArray<infer TItem>
    ? TItem extends PurchasePlan<PurchasePlanConfig<infer TId>>
      ? TId
      : never
    : never

type ExtractFeatureIds<TPlan> = TPlan extends {
  includes: ReadonlyArray<infer TInclude>
}
  ? TInclude extends { feature: { id: infer TId extends string } }
    ? TId
    : never
  : never

export type FeatureIdFromPlans<TPlans> = TPlans extends ReadonlyArray<infer TItem> ? ExtractFeatureIds<TItem> : never

const defineHiddenBrand = (target: object, symbol: symbol) => {
  Object.defineProperty(target, symbol, {
    configurable: false,
    enumerable: false,
    value: true,
    writable: false
  })
}

const assertEntityId = (entityType: "product" | "feature" | "plan", id: string) => {
  if (id.length === 0 || id.length > 64 || !ENTITY_ID_PATTERN.test(id)) {
    throw new Error(
      `Invalid ${entityType} "${id}": id must be 1-64 lowercase alphanumeric characters, dashes, or underscores`
    )
  }
}

const assertPlanPrice = (planId: string, price: PurchasePlanPrice | undefined) => {
  if (!price) return

  if (price.amount <= 0 || price.amount > 999_999.99) {
    throw new Error(`Invalid plan "${planId}": price amount must be between 0 and 999999.99`)
  }
}

const deriveNameFromId = (id: string) =>
  id
    .split(/[-_]/u)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ")

export const isPurchaseFeature = (value: unknown): value is PurchaseFeature =>
  typeof value === "function" && (value as unknown as Record<PropertyKey, unknown>)[purchaseFeatureSymbol] === true

export const isPurchaseFeatureInclude = (value: unknown): value is PurchaseFeatureInclude =>
  value !== null &&
  typeof value === "object" &&
  (value as Record<PropertyKey, unknown>)[purchaseFeatureIncludeSymbol] === true

export const isPurchasePlan = (value: unknown): value is PurchasePlan =>
  value !== null && typeof value === "object" && (value as Record<PropertyKey, unknown>)[purchasePlanSymbol] === true

const defineFeatureProperties = (target: object, definition: PurchaseFeatureDefinition) => {
  Object.defineProperties(target, {
    id: {
      configurable: false,
      enumerable: true,
      value: definition.id,
      writable: false
    },
    type: {
      configurable: false,
      enumerable: true,
      value: definition.type,
      writable: false
    },
    ...(definition.unit
      ? {
          unit: {
            configurable: false,
            enumerable: true,
            value: definition.unit,
            writable: false
          }
        }
      : {})
  })
  defineHiddenBrand(target, purchaseFeatureSymbol)
}

export function featureFlag<const TId extends string>(definition: {
  id: TId
}): PurchaseFeature<FeatureFlagDefinition<TId>> {
  const parsed = Schema.decodeUnknownSync(FeatureDefinitionInput)({
    ...definition,
    type: "feature_flag"
  })
  assertEntityId("feature", parsed.id)

  const featureDefinition = Object.freeze({
    id: parsed.id,
    type: "feature_flag"
  }) as FeatureFlagDefinition<TId>

  const featureFactory = (() => {
    const include = {
      config: undefined,
      feature: featureDefinition
    } as FeatureFlagInclude<FeatureFlagDefinition<TId>>
    defineHiddenBrand(include, purchaseFeatureIncludeSymbol)
    return Object.freeze(include)
  }) as PurchaseFeature<FeatureFlagDefinition<TId>>

  defineFeatureProperties(featureFactory, featureDefinition)

  return featureFactory
}

export function quotaFeature<const TId extends string>(definition: {
  id: TId
}): PurchaseFeature<QuotaFeatureDefinition<TId>> {
  const parsed = Schema.decodeUnknownSync(FeatureDefinitionInput)({
    ...definition,
    type: "quota"
  })
  assertEntityId("feature", parsed.id)

  const featureDefinition = Object.freeze({
    id: parsed.id,
    type: "quota"
  }) as QuotaFeatureDefinition<TId>

  const featureFactory = ((config: PurchaseQuotaFeatureConfig) => {
    const parsedConfig = Schema.decodeUnknownSync(QuotaFeatureConfigInput)(config)
    if (parsedConfig.limit <= 0 || !Number.isInteger(parsedConfig.limit)) {
      throw new Error(`Quota feature "${featureDefinition.id}" limit must be a positive integer`)
    }

    const include = {
      config: parsedConfig,
      feature: featureDefinition
    } as QuotaFeatureInclude<QuotaFeatureDefinition<TId>>
    defineHiddenBrand(include, purchaseFeatureIncludeSymbol)
    return Object.freeze(include)
  }) as PurchaseFeature<QuotaFeatureDefinition<TId>>

  defineFeatureProperties(featureFactory, featureDefinition)

  return featureFactory
}

export function creditUnit<const TId extends string>(definition: {
  id: TId
  unit?: string | undefined
}): PurchaseFeature<CreditUnitDefinition<TId>> {
  const parsed = Schema.decodeUnknownSync(FeatureDefinitionInput)({
    ...definition,
    type: "credit_unit"
  })
  assertEntityId("feature", parsed.id)

  const featureDefinition = Object.freeze({
    id: parsed.id,
    type: "credit_unit",
    ...(parsed.unit ? { unit: parsed.unit } : {})
  }) as CreditUnitDefinition<TId>

  const featureFactory = ((config: PurchaseCreditUnitConfig) => {
    const parsedConfig = Schema.decodeUnknownSync(CreditUnitConfigInput)(config)
    if (parsedConfig.amount <= 0 || !Number.isInteger(parsedConfig.amount)) {
      throw new Error(`Credit unit "${featureDefinition.id}" amount must be a positive integer`)
    }

    if (parsedConfig.expiresInDays !== undefined) {
      if (parsedConfig.expiresInDays <= 0 || !Number.isInteger(parsedConfig.expiresInDays)) {
        throw new Error(`Credit unit "${featureDefinition.id}" expiresInDays must be a positive integer`)
      }
    }

    const include = {
      config: parsedConfig,
      feature: featureDefinition
    } as CreditUnitInclude<CreditUnitDefinition<TId>>
    defineHiddenBrand(include, purchaseFeatureIncludeSymbol)
    return Object.freeze(include)
  }) as PurchaseFeature<CreditUnitDefinition<TId>>

  defineFeatureProperties(featureFactory, featureDefinition)

  return featureFactory
}

export function plan<const TConfig extends PurchasePlanConfig>(config: TConfig): PurchasePlan<TConfig> {
  const parsed = Schema.decodeUnknownSync(PlanInput)(config)
  assertEntityId("plan", parsed.id)
  assertPlanPrice(parsed.id, parsed.price)

  const includes = parsed.includes ?? []
  const invalidInclude = includes.find((include) => !isPurchaseFeatureInclude(include))
  if (invalidInclude) {
    throw new Error(
      `Invalid plan "${parsed.id}": includes must contain values returned by featureFlag(...), quotaFeature(...), or creditUnit(...)`
    )
  }

  if (parsed.default && !parsed.group) {
    throw new Error(`Invalid plan "${parsed.id}": default plans must define a group`)
  }

  const builtPlan = {
    ...parsed,
    includes: includes as ReadonlyArray<PurchaseFeatureInclude>
  } as PurchasePlan<TConfig>
  defineHiddenBrand(builtPlan, purchasePlanSymbol)

  return Object.freeze(builtPlan)
}

export const computePlanHash = (normalizedPlan: Omit<NormalizedPurchasePlan, "hash">) => {
  const payload = JSON.stringify({
    group: normalizedPlan.group,
    isDefault: normalizedPlan.isDefault,
    priceAmount: normalizedPlan.priceAmount,
    priceInterval: normalizedPlan.priceInterval,
    provider: normalizedPlan.provider,
    features: normalizedPlan.includes.map((include) => ({
      amount: include.amount,
      expiresInDays: include.expiresInDays,
      id: include.id,
      limit: include.limit,
      resetInterval: include.resetInterval,
      type: include.type,
      unit: include.unit,
      config: include.config
    }))
  })

  const hash = Hash.hash(payload)

  return hash.toString()
}

export function normalizeSchema(
  plans: PurchasePlansModule | undefined,
  products: ReadonlyArray<unknown> = []
): NormalizedPurchaseSchema {
  if (!plans) {
    return {
      features: [],
      planMap: new Map(),
      plans: [],
      products
    }
  }

  const exportedPlans = plans.map((planValue, index) => {
    if (!isPurchasePlan(planValue)) {
      throw new Error(`Invalid plan at index ${index}. Expected values returned by plan(...).`)
    }
    return planValue
  })

  const features = new Map<string, NormalizedPurchaseFeature>()
  const defaultPlansByGroup = new Map<string, string>()
  const planMap = new Map<string, NormalizedPurchasePlan>()

  for (const sourcePlan of exportedPlans) {
    if (planMap.has(sourcePlan.id)) {
      throw new Error(`Duplicate plan id "${sourcePlan.id}"`)
    }

    const group = sourcePlan.group ?? "default"
    if (sourcePlan.default) {
      const existingDefault = defaultPlansByGroup.get(group)
      if (existingDefault) {
        throw new Error(`Duplicate default plan for group "${group}": "${existingDefault}" and "${sourcePlan.id}"`)
      }
      defaultPlansByGroup.set(group, sourcePlan.id)
    }

    const includes = sourcePlan.includes.map((include) => {
      const quotaConfig = include.feature.type === "quota" ? (include.config as PurchaseQuotaFeatureConfig) : undefined
      const creditConfig =
        include.feature.type === "credit_unit" ? (include.config as PurchaseCreditUnitConfig) : undefined

      features.set(include.feature.id, {
        id: include.feature.id,
        type: include.feature.type
      })

      return {
        amount: creditConfig?.amount ?? null,
        config: include.config ? { ...include.config } : null,
        expiresInDays: creditConfig?.expiresInDays ?? null,
        id: include.feature.id,
        limit: quotaConfig?.limit ?? null,
        resetInterval: quotaConfig?.reset ?? creditConfig?.reset ?? null,
        type: include.feature.type,
        unit: creditConfig?.unit ?? include.feature.unit ?? null
      } satisfies NormalizedPurchasePlanFeature
    })

    const normalizedWithoutHash = {
      group,
      id: sourcePlan.id,
      includes,
      isDefault: sourcePlan.default === true,
      metadata: sourcePlan.metadata ? { ...sourcePlan.metadata } : {},
      name: sourcePlan.name ?? deriveNameFromId(sourcePlan.id),
      priceAmount: sourcePlan.price?.amount ?? null,
      priceInterval: sourcePlan.price?.interval ?? null,
      provider: sourcePlan.provider ? { ...sourcePlan.provider } : {}
    } satisfies Omit<NormalizedPurchasePlan, "hash">

    planMap.set(sourcePlan.id, {
      ...normalizedWithoutHash,
      hash: computePlanHash(normalizedWithoutHash)
    })
  }

  return {
    products,
    features: Array.from(features.values()),
    planMap,
    plans: Array.from(planMap.values())
  }
}

const ProductInput = Schema.Struct({
  id: Schema.String,
  mode: ProductMode,
  name: Schema.optional(Schema.String),
  description: Schema.optional(Schema.String),
  plans: Schema.Array(Schema.Unknown),
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  provider: Schema.optional(ProviderMappingInput)
})

export interface ProductConfig<TId extends string = string> {
  readonly description?: string
  readonly id: TId
  readonly metadata?: Record<string, unknown>
  readonly mode: ProductMode
  readonly name?: string
  readonly plans: PurchasePlansModule
  readonly provider?: Record<string, string>
}

export type Product<TConfig extends ProductConfig = ProductConfig> = Readonly<TConfig>

export interface NormalizedProductPlan {
  readonly id: string
}

export interface NormalizedProduct {
  readonly description: string | null
  readonly hash: string
  readonly id: string
  readonly metadata: Record<string, unknown>
  readonly mode: ProductMode
  readonly name: string
  readonly offerIds: ReadonlyArray<string>
  readonly planIds: ReadonlyArray<string>
  readonly provider: Record<string, string>
}

export interface NormalizedOffer {
  readonly description: string | null
  readonly hash: string
  readonly id: string
  readonly isDefault: boolean
  readonly metadata: Record<string, unknown>
  readonly mode: ProductMode
  readonly name: string
  readonly planId: string
  readonly priceAmount: number | null
  readonly priceInterval: PurchasePriceInterval | null
  readonly productId: string
  readonly productProvider: Record<string, string>
  readonly provider: Record<string, string>
}

export interface NormalizedCatalog {
  readonly offerMap: ReadonlyMap<string, NormalizedOffer>
  readonly offers: ReadonlyArray<NormalizedOffer>
  readonly productMap: ReadonlyMap<string, NormalizedProduct>
  readonly products: ReadonlyArray<NormalizedProduct>
}

export interface ResolvedProviderOffer {
  readonly offer: NormalizedOffer
  readonly offerProviderId: string | null
  readonly product: NormalizedProduct
  readonly productProviderId: string | null
  readonly provider: string
}

export type ProductsModule = ReadonlyArray<Product>
export type CommerceProductsModule = ProductsModule

export type ProductIdFromProducts<TProducts> =
  TProducts extends ReadonlyArray<infer TProduct>
    ? TProduct extends Product<ProductConfig<infer TId>>
      ? TId
      : never
    : never

export const isProduct = (value: unknown): value is Product =>
  value !== null && typeof value === "object" && (value as Record<PropertyKey, unknown>)[ProductSymbol] === true

export function product<const TConfig extends ProductConfig>(
  id: TConfig["id"],
  config: Omit<TConfig, "id">
): Product<TConfig> {
  const parsed = Schema.decodeUnknownSync(ProductInput)({
    ...config,
    id
  })

  assertEntityId("product", parsed.id)

  if (parsed.plans.length === 0) {
    throw new Error(`Invalid product "${parsed.id}": products must include at least one plan`)
  }

  const invalidPlan = parsed.plans.find((_) => !isPurchasePlan(_))
  if (invalidPlan) {
    throw new Error(`Invalid product "${parsed.id}": plans must contain values returned by plan(...)`)
  }

  const builtProduct = {
    ...parsed,
    plans: parsed.plans as unknown as PurchasePlansModule
  } as unknown as Product<TConfig>

  defineHiddenBrand(builtProduct, ProductSymbol)

  return Object.freeze(builtProduct)
}

export const oneTimeProduct = <const TConfig extends Omit<ProductConfig, "id" | "mode">>(id: string, config: TConfig) =>
  product(id, {
    ...config,
    mode: "one_time"
  })

export const subscriptionProduct = <const TConfig extends Omit<ProductConfig, "id" | "mode">>(
  id: string,
  config: TConfig
) =>
  product(id, {
    ...config,
    mode: "subscription"
  })

export const creditPackProduct = <const TConfig extends Omit<ProductConfig, "id" | "mode">>(
  id: string,
  config: TConfig
) =>
  product(id, {
    ...config,
    mode: "credits"
  })

export const computeProductHash = (normalizedProduct: Omit<NormalizedProduct, "hash">) => {
  const payload = JSON.stringify({
    id: normalizedProduct.id,
    mode: normalizedProduct.mode,
    offerIds: normalizedProduct.offerIds,
    planIds: normalizedProduct.planIds,
    provider: normalizedProduct.provider
  })

  const hash = Hash.hash(payload)

  return hash.toString()
}

export const computeOfferHash = (normalizedOffer: Omit<NormalizedOffer, "hash">) => {
  const payload = JSON.stringify({
    id: normalizedOffer.id,
    productId: normalizedOffer.productId,
    planId: normalizedOffer.planId,
    priceAmount: normalizedOffer.priceAmount,
    priceInterval: normalizedOffer.priceInterval,
    provider: normalizedOffer.provider,
    productProvider: normalizedOffer.productProvider
  })

  const hash = Hash.hash(payload)

  return hash.toString()
}

export const createOfferId = (productId: string, planId: string) => `${productId}:${planId}`

export const resolveProviderOffer = (
  catalog: NormalizedCatalog,
  input: {
    planId: string
    provider: string
  }
): ResolvedProviderOffer | null => {
  const offer = catalog.offers.find((currentOffer) => currentOffer.planId === input.planId)

  if (!offer) {
    return null
  }

  const commerceProduct = catalog.productMap.get(offer.productId)

  if (!commerceProduct) {
    return null
  }

  return {
    offer,
    offerProviderId: offer.provider[input.provider] ?? null,
    product: commerceProduct,
    productProviderId: commerceProduct.provider[input.provider] ?? null,
    provider: input.provider
  }
}

export function normalizeCatalog(products: ProductsModule | undefined): NormalizedCatalog {
  if (!products) {
    return {
      offerMap: new Map(),
      offers: [],
      productMap: new Map(),
      products: []
    }
  }

  const offerMap = new Map<string, NormalizedOffer>()
  const productMap = new Map<string, NormalizedProduct>()

  for (const sourceProduct of products) {
    if (!isProduct(sourceProduct)) {
      throw new Error("Invalid product. Expected values returned by product(...).")
    }

    if (productMap.has(sourceProduct.id)) {
      throw new Error(`Duplicate product id "${sourceProduct.id}"`)
    }

    const normalizedWithoutHash = {
      description: sourceProduct.description ?? null,
      id: sourceProduct.id,
      metadata: sourceProduct.metadata ? { ...sourceProduct.metadata } : {},
      mode: sourceProduct.mode,
      name: sourceProduct.name ?? deriveNameFromId(sourceProduct.id),
      offerIds: sourceProduct.plans.map((_) => createOfferId(sourceProduct.id, _.id)),
      planIds: sourceProduct.plans.map((_) => _.id),
      provider: sourceProduct.provider ? { ...sourceProduct.provider } : {}
    } satisfies Omit<NormalizedProduct, "hash">

    productMap.set(sourceProduct.id, {
      ...normalizedWithoutHash,
      hash: computeProductHash(normalizedWithoutHash)
    })

    for (const sourcePlan of sourceProduct.plans) {
      const offerId = createOfferId(sourceProduct.id, sourcePlan.id)

      if (offerMap.has(offerId)) {
        throw new Error(`Duplicate offer id "${offerId}"`)
      }

      const normalizedOfferWithoutHash = {
        description: sourceProduct.description ?? null,
        id: offerId,
        isDefault: sourcePlan.default ?? false,
        metadata: sourcePlan.metadata ? { ...sourcePlan.metadata } : {},
        mode: sourceProduct.mode,
        name: sourcePlan.name ?? sourceProduct.name ?? deriveNameFromId(sourcePlan.id),
        planId: sourcePlan.id,
        priceAmount: sourcePlan.price?.amount ?? null,
        priceInterval: sourcePlan.price?.interval ?? null,
        productId: sourceProduct.id,
        productProvider: sourceProduct.provider ? { ...sourceProduct.provider } : {},
        provider: sourcePlan.provider ? { ...sourcePlan.provider } : {}
      } satisfies Omit<NormalizedOffer, "hash">

      offerMap.set(offerId, {
        ...normalizedOfferWithoutHash,
        hash: computeOfferHash(normalizedOfferWithoutHash)
      })
    }
  }

  return {
    offerMap,
    offers: Array.from(offerMap.values()),
    productMap,
    products: Array.from(productMap.values())
  }
}

export const normalizeCommerceCatalog = normalizeCatalog

export type InferPlan<TPlans> = TPlans extends ReadonlyArray<infer TPlan> ? TPlan : never

export type InferPlanId<TPlans> =
  InferPlan<TPlans> extends { readonly id: infer TPlanId extends string } ? TPlanId : string

export type InferPlanFeature<TPlans, TPlanId extends InferPlanId<TPlans> = InferPlanId<TPlans>> =
  Extract<InferPlan<TPlans>, { readonly id: TPlanId }> extends {
    readonly includes: ReadonlyArray<infer TFeature>
  }
    ? TFeature
    : never

export type InferFeatureId<TPlans> =
  InferPlanFeature<TPlans> extends { readonly featureId: infer TFeatureId extends string }
    ? TFeatureId
    : InferPlanFeature<TPlans> extends { readonly id: infer TFeatureId extends string }
      ? TFeatureId
      : string

export type InferProduct<TProducts> = TProducts extends ReadonlyArray<infer TProduct> ? TProduct : never

export type InferProductId<TProducts> =
  InferProduct<TProducts> extends { readonly id: infer TProductId extends string } ? TProductId : string

type OfferIdFromProduct<TProduct> = TProduct extends {
  readonly id: infer TProductId extends string
  readonly plans: infer TPlans
}
  ? TPlans extends ReadonlyArray<unknown>
    ? InferPlanId<TPlans> extends infer TPlanId extends string
      ? `${TProductId}:${TPlanId}`
      : never
    : never
  : never

export type InferOfferId<TProducts> =
  InferProduct<TProducts> extends infer TProduct ? OfferIdFromProduct<TProduct> : string

export type InferProductMode<TProducts> =
  InferProduct<TProducts> extends { readonly mode: infer TMode extends string } ? TMode : never

export type InferProductPlan<TProducts, TProductId extends InferProductId<TProducts> = InferProductId<TProducts>> =
  Extract<InferProduct<TProducts>, { readonly id: TProductId }> extends {
    readonly plans: infer TPlans
  }
    ? TPlans extends ReadonlyArray<unknown>
      ? InferPlan<TPlans>
      : never
    : never
