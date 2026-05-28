export const notesProMonthlySubscription = {
  offerId: "notes:notes_pro_monthly",
  enabledBenefits: ["note_sync_enabled", "note_ai_assistant"],
  quotaBenefits: [{ key: "note_items", limit: 10_000 }]
} as const

export const desktopLifetimePurchase = {
  offerId: "desktop_pro:desktop_lifetime",
  enabledBenefits: ["desktop_offline_mode", "desktop_advanced_export"]
} as const

export const aiCredits500Pack = {
  offerId: "ai_credit_pack:ai_credits_500",
  creditKey: "ai_credits",
  amount: 500
} as const

export const aiCredits2000Pack = {
  offerId: "ai_credit_pack:ai_credits_2000",
  creditKey: "ai_credits",
  amount: 2_000
} as const
