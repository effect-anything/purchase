import type { CommercialAgreementId, CommercialEventId, CommercialOfferId } from "../../src/core/commercial-schema.ts"
import type { CustomerId } from "../../src/core/common-schema.ts"

import {
  creditPackProduct,
  creditUnit,
  featureFlag,
  oneTimeProduct,
  plan,
  quotaFeature,
  subscriptionProduct
} from "../../src/dsl.ts"
import { BaseSDK } from "../../src/sdk.ts"

const premiumAccess = featureFlag({ id: "premium_access" })
const monthlyQuota = quotaFeature({ id: "monthly_quota" })
const aiCredits = creditUnit({ id: "ai_credits", unit: "AI messages" })

export const freePlan = plan({
  id: "free",
  name: "Free",
  default: true,
  group: "main"
})

export const proMonthlyPlan = plan({
  id: "pro_monthly",
  name: "Pro Monthly",
  group: "main",
  price: { amount: 20, interval: "month" },
  includes: [premiumAccess(), monthlyQuota({ limit: 100, reset: "month" }), aiCredits({ amount: 10, reset: "month" })]
})

export const lifetimePlan = plan({
  id: "lifetime",
  name: "Lifetime",
  price: { amount: 199, interval: "one_time" },
  includes: [premiumAccess()]
})

export const credits100Plan = plan({
  id: "credits_100",
  name: "Credits 100",
  price: { amount: 10, interval: "one_time" },
  includes: [aiCredits({ amount: 100 })]
})

export const testPlans = [freePlan, proMonthlyPlan, lifetimePlan, credits100Plan] as const

export const saasProduct = subscriptionProduct("saas", {
  name: "SaaS",
  plans: [freePlan, proMonthlyPlan]
})

export const lifetimeProduct = oneTimeProduct("lifetime_product", {
  name: "Lifetime Product",
  plans: [lifetimePlan]
})

export const aiCreditPackProduct = creditPackProduct("ai_credit_pack", {
  name: "Credit Pack",
  plans: [credits100Plan]
})

export const testProducts = [saasProduct, lifetimeProduct, aiCreditPackProduct] as const

export const testOfferIds = {
  free: "saas:free",
  proMonthly: "saas:pro_monthly",
  lifetime: "lifetime_product:lifetime",
  credits100: "ai_credit_pack:credits_100"
} as const

export const testCustomerId = "customer_123" as CustomerId
export const testSubscriptionAgreementId = "sub_test_123" as unknown as CommercialAgreementId
export const testManualEventId = "manual_event_1" as CommercialEventId
export const asCommercialOfferId = (offerId: string) => offerId as CommercialOfferId

export class TestPay extends BaseSDK<TestPay, Record<string, never>, typeof testPlans, typeof testProducts>({
  plans: testPlans,
  products: testProducts
}) {
  static readonly TestLayer = TestPay.layer(TestPay)
}

export const changedProMonthlyPlan = plan({
  id: "pro_monthly",
  name: "Pro Monthly",
  group: "main",
  price: { amount: 25, interval: "month" },
  includes: [premiumAccess(), monthlyQuota({ limit: 100, reset: "month" }), aiCredits({ amount: 10, reset: "month" })]
})

export const changedPricePlans = [freePlan, changedProMonthlyPlan, lifetimePlan, credits100Plan] as const

export const changedPriceProducts = [
  subscriptionProduct("saas", {
    name: "SaaS",
    plans: [freePlan, changedProMonthlyPlan]
  }),
  lifetimeProduct,
  aiCreditPackProduct
] as const

export class ChangedPricePay extends BaseSDK<
  ChangedPricePay,
  Record<string, never>,
  typeof changedPricePlans,
  typeof changedPriceProducts
>({ plans: changedPricePlans, products: changedPriceProducts }) {}
