import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

import {
  creditPackProduct,
  creditUnit,
  featureFlag,
  oneTimeProduct,
  plan,
  quotaFeature,
  subscriptionProduct
} from "../src/dsl.ts"
import { Paddle } from "../src/paddle.ts"
import { BaseSDK } from "../src/sdk.ts"
import { Stripe } from "../src/stripe.ts"

export const noteSyncEnabled = featureFlag({ id: "note_sync_enabled" })
export const noteAiAssistant = featureFlag({ id: "note_ai_assistant" })
export const noteItems = quotaFeature({ id: "note_items" })
export const noteHistoryDays = quotaFeature({ id: "note_history_days" })
export const noteStorageMb = quotaFeature({ id: "note_storage_mb" })

export const desktopOfflineMode = featureFlag({ id: "desktop_offline_mode" })
export const desktopAdvancedExport = featureFlag({ id: "desktop_advanced_export" })

export const aiCredits = creditUnit({ id: "ai_credits", unit: "AI credits" })

export const NoteSubscriptionPlans = [
  plan({
    id: "notes_free",
    group: "base",
    default: true,
    includes: [
      noteItems({ limit: 50, reset: "month" }),
      noteHistoryDays({ limit: 30, reset: "month" }),
      noteStorageMb({ limit: 512, reset: "month" })
    ]
  }),
  plan({
    id: "notes_pro_monthly",
    group: "base",
    name: "Notes Pro Monthly",
    price: { amount: 9, interval: "month" },
    includes: [
      noteSyncEnabled(),
      noteAiAssistant(),
      noteItems({ limit: 10_000, reset: "month" }),
      noteHistoryDays({ limit: 365, reset: "month" }),
      noteStorageMb({ limit: 50_000, reset: "month" })
    ],
    provider: {
      paddle: "notes_pro_monthly",
      stripe: "notes_pro_monthly"
    }
  }),
  plan({
    id: "notes_pro_yearly",
    group: "base",
    name: "Notes Pro Yearly",
    price: { amount: 90, interval: "year" },
    includes: [
      noteSyncEnabled(),
      noteAiAssistant(),
      noteItems({ limit: 10_000, reset: "month" }),
      noteHistoryDays({ limit: 365, reset: "month" }),
      noteStorageMb({ limit: 50_000, reset: "month" })
    ],
    provider: {
      paddle: "notes_pro_yearly",
      stripe: "notes_pro_yearly"
    }
  })
] as const

export const DesktopPurchasePlans = [
  plan({
    id: "desktop_lifetime",
    group: "desktop",
    name: "Desktop Pro Lifetime",
    price: { amount: 49, interval: "one_time" },
    includes: [desktopOfflineMode(), desktopAdvancedExport()],
    provider: {
      paddle: "desktop_lifetime",
      stripe: "desktop_lifetime"
    }
  })
] as const

export const CreditsPlans = [
  plan({
    id: "ai_credits_500",
    group: "credits",
    name: "AI Credits 500",
    price: { amount: 10, interval: "one_time" },
    includes: [aiCredits({ amount: 500, reset: "year" })],
    provider: {
      paddle: "ai_credits_500",
      stripe: "ai_credits_500"
    }
  }),
  plan({
    id: "ai_credits_2000",
    group: "credits",
    name: "AI Credits 2000",
    price: { amount: 30, interval: "one_time" },
    includes: [aiCredits({ amount: 2_000, reset: "year" })],
    provider: {
      paddle: "ai_credits_2000",
      stripe: "ai_credits_2000"
    }
  })
] as const

export const CommercialPlans = [...NoteSubscriptionPlans, ...DesktopPurchasePlans, ...CreditsPlans] as const

export const CommercialProducts = [
  subscriptionProduct("notes", {
    name: "Notes",
    description: "Subscription for sync, storage, and premium note features.",
    plans: NoteSubscriptionPlans
  }),
  oneTimeProduct("desktop_pro", {
    name: "Desktop Pro",
    description: "One-time purchase for local desktop power-user features.",
    plans: DesktopPurchasePlans
  }),
  creditPackProduct("ai_credit_pack", {
    name: "AI Credit Pack",
    description: "Credits for AI generation and smart editing features.",
    plans: CreditsPlans
  })
] as const

export class CommercialPay extends BaseSDK<
  CommercialPay,
  {
    readonly hello: () => Effect.Effect<string>
  },
  typeof CommercialPlans,
  typeof CommercialProducts
>({ plans: CommercialPlans, products: CommercialProducts }) {
  static Layer = CommercialPay.make(
    CommercialPay,
    Effect.gen(function* () {
      return {
        hello: () => Effect.succeed("OK")
      }
    })
  )

  static Stripe = CommercialPay.Layer.pipe(Layer.provide(Stripe.layer))
  static Paddle = CommercialPay.Layer.pipe(Layer.provide(Paddle.layer))
}
