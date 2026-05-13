import * as Schema from "effect/Schema"

import { PaymentProviderTag } from "../provider/types.ts"
import { CustomerId } from "./common-schema.ts"

/**
 * Provider mapping record keyed by provider tag or provider-scoped mapping key.
 * These values are references only and never replace the commercial ids.
 */
const ProviderMapping = Schema.Record({ key: Schema.String, value: Schema.String })

/**
 * Stable commercial product identifier.
 * This groups related offers and is used for catalog browsing and product-family logic.
 */
export const CommercialProductId = Schema.NonEmptyString.pipe(Schema.brand("CommercialProductId"))
export type CommercialProductId = typeof CommercialProductId.Type

/**
 * Stable commercial offer identifier.
 * This is the main public runtime id for checkout, webhook reconciliation, and projections.
 */
export const CommercialOfferId = Schema.NonEmptyString.pipe(Schema.brand("CommercialOfferId"))
export type CommercialOfferId = typeof CommercialOfferId.Type

/**
 * Stable benefit identifier inside the commercial catalog.
 */
export const CommercialBenefitId = Schema.NonEmptyString.pipe(Schema.brand("CommercialBenefitId"))
export type CommercialBenefitId = typeof CommercialBenefitId.Type

/**
 * Stable agreement identifier for customer-held state such as subscriptions and purchases.
 */
export const CommercialAgreementId = Schema.NonEmptyString.pipe(Schema.brand("CommercialAgreementId"))
export type CommercialAgreementId = typeof CommercialAgreementId.Type

/**
 * Stable workflow intent identifier.
 */
export const CommercialIntentId = Schema.NonEmptyString.pipe(Schema.brand("CommercialIntentId"))
export type CommercialIntentId = typeof CommercialIntentId.Type

/**
 * Stable normalized commercial event identifier.
 */
export const CommercialEventId = Schema.NonEmptyString.pipe(Schema.brand("CommercialEventId"))
export type CommercialEventId = typeof CommercialEventId.Type

/**
 * Provider-native event identifier stored for webhook idempotency and replay.
 */
export const ProviderEventId = Schema.NonEmptyString.pipe(Schema.brand("ProviderEventId"))
export type ProviderEventId = typeof ProviderEventId.Type

/**
 * Source DSL plan identifier kept only for provenance and migration tracing.
 */
export const CommercialSourcePlanId = Schema.NonEmptyString.pipe(Schema.brand("CommercialSourcePlanId"))
export type CommercialSourcePlanId = typeof CommercialSourcePlanId.Type

/**
 * Future ledger entry id for SDK-managed credit accounting.
 */
export const CreditsLedgerEntryId = Schema.NonEmptyString.pipe(Schema.brand("CreditsLedgerEntryId"))
export type CreditsLedgerEntryId = typeof CreditsLedgerEntryId.Type

/**
 * High-level product family after DSL normalization.
 */
export const CommercialProductType = Schema.Literal("subscription", "one_time", "credits")
export type CommercialProductType = typeof CommercialProductType.Type

/**
 * Stable benefit vocabulary exposed by the commercial model.
 */
export const CommercialBenefitType = Schema.Literal("feature_flag", "quota_limit", "credit_balance", "license_grant")
export type CommercialBenefitType = typeof CommercialBenefitType.Type

/**
 * Agreement family for customer-held commercial state.
 */
export const CommercialAgreementType = Schema.Literal("subscription", "purchase", "wallet")
export type CommercialAgreementType = typeof CommercialAgreementType.Type

/**
 * Shared lifecycle state used by subscription, purchase, and wallet projections.
 */
export const AgreementLifecycleStatus = Schema.Literal(
  "pending",
  "trialing",
  "active",
  "grace",
  "paused",
  "canceled",
  "refunded",
  "expired"
)
export type AgreementLifecycleStatus = typeof AgreementLifecycleStatus.Type

/**
 * Lifecycle state for command-side intents.
 */
export const CommercialIntentStatus = Schema.Literal("pending", "accepted", "rejected", "expired", "superseded")
export type CommercialIntentStatus = typeof CommercialIntentStatus.Type

/**
 * Normalized commercial event kinds emitted by provider reconciliation.
 */
export const CommercialEventKind = Schema.Literal(
  "checkout_completed",
  "subscription_updated",
  "transaction_updated",
  "refund_updated",
  "customer_updated",
  "webhook_unhandled"
)
export type CommercialEventKind = typeof CommercialEventKind.Type

/**
 * Reset cadence for recurring quota-style benefits.
 */
export const BenefitResetInterval = Schema.Literal("day", "week", "month", "year", "never")
export type BenefitResetInterval = typeof BenefitResetInterval.Type

export const BillingInterval = Schema.Literal("month", "year", "one_time")

/**
 * Wallet authority mode. `sdk_managed` means the pay runtime owns the balance projection.
 */
export const WalletBalancePolicy = Schema.Literal("project_managed", "sdk_managed")
export type WalletBalancePolicy = typeof WalletBalancePolicy.Type

export class CommercialCustomerProfile extends Schema.Class<CommercialCustomerProfile>(
  "@pay/core/CommercialCustomerProfile"
)({
  /**
   * App-owned customer identity.
   */
  id: CustomerId,
  /**
   * Best-known customer email used for provider lookup.
   */
  email: Schema.optional(Schema.String),
  /**
   * Best-known customer display name.
   */
  name: Schema.optional(Schema.String),
  /**
   * Provider reference mapping keyed by provider tag.
   */
  provider: ProviderMapping,
  createdAt: Schema.Date,
  updatedAt: Schema.Date
}) {}

export class FeatureFlagBenefit extends Schema.Class<FeatureFlagBenefit>("@pay/core/FeatureFlagBenefit")({
  id: CommercialBenefitId,
  type: Schema.Literal("feature_flag"),
  /**
   * Stable feature key consumed by application capability checks.
   */
  key: Schema.NonEmptyString,
  enabled: Schema.Boolean
}) {}

export class QuotaLimitBenefit extends Schema.Class<QuotaLimitBenefit>("@pay/core/QuotaLimitBenefit")({
  id: CommercialBenefitId,
  type: Schema.Literal("quota_limit"),
  /**
   * Stable quota key consumed by application capability checks.
   */
  key: Schema.NonEmptyString,
  limit: Schema.Int,
  resetInterval: BenefitResetInterval
}) {}

export class CreditBalanceBenefit extends Schema.Class<CreditBalanceBenefit>("@pay/core/CreditBalanceBenefit")({
  id: CommercialBenefitId,
  type: Schema.Literal("credit_balance"),
  /**
   * Stable balance key consumed by application capability checks.
   */
  key: Schema.NonEmptyString,
  /**
   * Human-facing balance unit, for example credits or seats.
   */
  unit: Schema.NonEmptyString,
  amount: Schema.Int,
  expiresInDays: Schema.optional(Schema.Int)
}) {}

export class LicenseGrantBenefit extends Schema.Class<LicenseGrantBenefit>("@pay/core/LicenseGrantBenefit")({
  id: CommercialBenefitId,
  type: Schema.Literal("license_grant"),
  /**
   * Stable license key consumed by application capability checks.
   */
  key: Schema.NonEmptyString,
  /**
   * License scope label, for example workspace or seat.
   */
  scope: Schema.NonEmptyString,
  perpetual: Schema.Boolean
}) {}

export const CommercialBenefit = Schema.Union(
  FeatureFlagBenefit,
  QuotaLimitBenefit,
  CreditBalanceBenefit,
  LicenseGrantBenefit
)
export type CommercialBenefit = typeof CommercialBenefit.Type

export class CommercialOffer extends Schema.Class<CommercialOffer>("@pay/core/CommercialOffer")({
  /**
   * Stable offer id used by SDK entrypoints, workflow receipts, and read models.
   */
  id: CommercialOfferId,
  /**
   * Parent product group for browsing and valid change-target calculations.
   */
  productId: CommercialProductId,
  /**
   * Source DSL plan id kept only as authoring provenance.
   * Runtime code and public APIs should use `id`, not this field.
   */
  sourcePlanId: CommercialSourcePlanId,
  /**
   * Business grouping within a product family, for example monthly vs yearly lanes.
   */
  group: Schema.NonEmptyString,
  /**
   * Display name for the sellable offer.
   */
  name: Schema.NonEmptyString,
  /**
   * Commercial product family after DSL normalization.
   */
  type: CommercialProductType,
  /**
   * Billing cadence used by checkout and subscription change flows.
   */
  billingInterval: Schema.optional(BillingInterval),
  /**
   * Display price in major business terms, independent from provider-native price ids.
   */
  priceAmount: Schema.optional(Schema.Number),
  /**
   * Currency code for the commercial display price.
   */
  currency: Schema.optional(Schema.NonEmptyString),
  /**
   * Product-family default used for free tiers and fallback offer selection.
   */
  isDefault: Schema.Boolean,
  /**
   * Provider mapping bridge. These ids are references, not the commercial primary key.
   */
  provider: ProviderMapping,
  /**
   * Benefits granted when the offer is active for a customer.
   */
  benefits: Schema.Array(CommercialBenefit),
  /**
   * Commercial metadata that stays attached to the offer across workflows.
   */
  metadata: Schema.Record({ key: Schema.String, value: Schema.Unknown })
}) {}

export class CommercialProduct extends Schema.Class<CommercialProduct>("@pay/core/CommercialProduct")({
  /**
   * Stable product-family id used to group offers.
   */
  id: CommercialProductId,
  /**
   * Product family after DSL normalization.
   */
  type: CommercialProductType,
  /**
   * Human-facing product family name.
   */
  name: Schema.NonEmptyString,
  /**
   * Optional human-facing description for catalog presentation.
   */
  description: Schema.optional(Schema.NonEmptyString),
  /**
   * Provider mapping bridge held at the product-family layer.
   */
  provider: ProviderMapping,
  /**
   * Sellable offers under this product family.
   */
  offers: Schema.Array(CommercialOffer),
  /**
   * Product-family metadata kept in the commercial catalog.
   */
  metadata: Schema.Record({ key: Schema.String, value: Schema.Unknown })
}) {}

export class CommercialCatalog extends Schema.Class<CommercialCatalog>("@pay/core/CommercialCatalog")({
  /**
   * Entire commercial catalog grouped by product family.
   */
  products: Schema.Array(CommercialProduct)
}) {}

export class CommercialCheckoutTarget extends Schema.Class<CommercialCheckoutTarget>(
  "@pay/core/CommercialCheckoutTarget"
)({
  /**
   * Active provider for this runtime.
   */
  provider: PaymentProviderTag,
  /**
   * Commercial product family that owns the offer.
   */
  productId: CommercialProductId,
  /**
   * Commercial offer that checkout should sell.
   */
  offerId: CommercialOfferId,
  productType: CommercialProductType,
  billingInterval: Schema.optional(BillingInterval),
  /**
   * Provider-native product reference, when required by the provider API.
   */
  providerProductId: Schema.optional(Schema.String),
  /**
   * Provider-native price/offer reference, when required by the provider API.
   */
  providerOfferId: Schema.optional(Schema.String)
}) {}

export class CommercialIntent extends Schema.Class<CommercialIntent>("@pay/core/CommercialIntent")({
  /**
   * Stable intent id for the command-side workflow record.
   */
  id: CommercialIntentId,
  customerId: CustomerId,
  /**
   * Commercial offer requested by the user or app.
   */
  offerId: CommercialOfferId,
  /**
   * Target agreement family for the workflow.
   */
  agreementType: CommercialAgreementType,
  /**
   * Current command-side lifecycle state.
   */
  status: CommercialIntentStatus,
  /**
   * Provider chosen by the current runtime.
   */
  provider: PaymentProviderTag,
  /**
   * Intent creation timestamp.
   */
  requestedAt: Schema.Date,
  /**
   * Caller and workflow correlation metadata.
   */
  metadata: Schema.Record({ key: Schema.String, value: Schema.Unknown })
}) {}

export class CommercialEvent extends Schema.Class<CommercialEvent>("@pay/core/CommercialEvent")({
  /**
   * Stable normalized event id inside the commercial runtime.
   */
  id: CommercialEventId,
  /**
   * Provider-native event id used for dedupe and replay.
   */
  providerEventId: ProviderEventId,
  provider: PaymentProviderTag,
  /**
   * Normalized commercial interpretation of the provider event.
   */
  kind: CommercialEventKind,
  /**
   * Provider-reported occurrence timestamp.
   */
  occurredAt: Schema.Date,
  /**
   * Resolved local customer when reconciliation can identify one.
   */
  customerId: Schema.optional(CustomerId),
  /**
   * Resolved local agreement when reconciliation can identify one.
   */
  agreementId: Schema.optional(CommercialAgreementId),
  /**
   * Resolved local offer when reconciliation can identify one.
   */
  offerId: Schema.optional(CommercialOfferId),
  /**
   * Stored normalized payload used for replay and debugging.
   */
  payload: Schema.Record({ key: Schema.String, value: Schema.Unknown })
}) {}

export class SubscriptionAgreementState extends Schema.Class<SubscriptionAgreementState>(
  "@pay/core/SubscriptionAgreementState"
)({
  /**
   * Stable agreement id for the customer's subscription relationship.
   */
  id: CommercialAgreementId,
  customerId: CustomerId,
  /**
   * Product family currently owned through this agreement.
   */
  productId: CommercialProductId,
  /**
   * Active commercial offer on the agreement.
   */
  offerId: CommercialOfferId,
  /**
   * Provider-native subscription reference for mutation and reconciliation calls.
   */
  providerSubscriptionId: Schema.optional(Schema.String),
  /**
   * Current lifecycle state for the agreement.
   */
  status: AgreementLifecycleStatus,
  /**
   * First known activation time.
   */
  activeFrom: Schema.optional(Schema.Date),
  /**
   * Current billing period start, when available from provider state.
   */
  currentPeriodStartedAt: Schema.optional(Schema.Date),
  /**
   * Current billing period end, when available from provider state.
   */
  currentPeriodEndsAt: Schema.optional(Schema.Date),
  /**
   * Whether the current agreement is scheduled to stop at period end.
   */
  cancelAtPeriodEnd: Schema.Boolean,
  /**
   * Scheduled next commercial offer after a confirmed provider-side change.
   */
  scheduledOfferId: Schema.optional(CommercialOfferId),
  /**
   * Trial boundary when the provider exposes one.
   */
  trialEndsAt: Schema.optional(Schema.Date)
}) {}

export class PurchaseGrantState extends Schema.Class<PurchaseGrantState>("@pay/core/PurchaseGrantState")({
  /**
   * Stable agreement id for a one-time purchase grant.
   */
  id: CommercialAgreementId,
  customerId: CustomerId,
  productId: CommercialProductId,
  offerId: CommercialOfferId,
  status: AgreementLifecycleStatus,
  /**
   * Grant activation time.
   */
  grantedAt: Schema.Date,
  /**
   * Revocation time when the grant is no longer active.
   */
  revokedAt: Schema.optional(Schema.Date)
}) {}

export class CreditsWalletState extends Schema.Class<CreditsWalletState>("@pay/core/CreditsWalletState")({
  /**
   * Stable agreement id for a wallet balance projection.
   */
  id: CommercialAgreementId,
  customerId: CustomerId,
  productId: CommercialProductId,
  /**
   * Available balance after all known mutations.
   */
  available: Schema.Int,
  /**
   * Total amount acquired into the wallet.
   */
  acquired: Schema.Int,
  /**
   * Total amount consumed from the wallet.
   */
  consumed: Schema.Int,
  /**
   * Total amount removed due to refunds or reversals.
   */
  refunded: Schema.Int,
  /**
   * Balance authority mode for this wallet.
   */
  policy: WalletBalancePolicy,
  updatedAt: Schema.Date
}) {}

export class CustomerCommercialSnapshot extends Schema.Class<CustomerCommercialSnapshot>(
  "@pay/core/CustomerCommercialSnapshot"
)({
  /**
   * Snapshot owner.
   */
  customerId: CustomerId,
  /**
   * Current subscription agreements for the customer.
   */
  subscriptions: Schema.Array(SubscriptionAgreementState),
  /**
   * Current one-time purchase grants for the customer.
   */
  purchases: Schema.Array(PurchaseGrantState),
  /**
   * Current wallet balances for the customer.
   */
  wallets: Schema.Array(CreditsWalletState),
  /**
   * Active offer ids derived from the current customer state.
   */
  activeOfferIds: Schema.Array(CommercialOfferId),
  updatedAt: Schema.Date
}) {}

export class CustomerEntitlementSnapshot extends Schema.Class<CustomerEntitlementSnapshot>(
  "@pay/core/CustomerEntitlementSnapshot"
)({
  /**
   * Snapshot owner.
   */
  customerId: CustomerId,
  /**
   * Effective merged benefits for current application use.
   */
  benefits: Schema.Array(CommercialBenefit),
  updatedAt: Schema.Date
}) {}

export class CommercialCatalogIssue extends Schema.TaggedError<CommercialCatalogIssue>()("CommercialCatalogIssue", {
  /**
   * Human-readable catalog validation or normalization problem.
   */
  message: Schema.String
}) {}

export class CommercialAgreementNotFound extends Schema.TaggedError<CommercialAgreementNotFound>()(
  "CommercialAgreementNotFound",
  {
    agreementId: CommercialAgreementId
  }
) {}

export class CommercialOfferNotFound extends Schema.TaggedError<CommercialOfferNotFound>()("CommercialOfferNotFound", {
  offerId: CommercialOfferId
}) {}

export class CommercialCustomerNotFound extends Schema.TaggedError<CommercialCustomerNotFound>()(
  "CommercialCustomerNotFound",
  {
    customerId: CustomerId
  }
) {}
