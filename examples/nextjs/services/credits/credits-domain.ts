import { Schema } from "effect"

export const ConsumeCreditsPayloadSchema = Schema.Struct({
  amount: Schema.optional(Schema.Number),
  reason: Schema.optional(Schema.String)
})

export const CreditWalletSchema = Schema.Struct({
  available: Schema.Number,
  acquired: Schema.Number,
  consumed: Schema.Number
})

export type CreditWallet = typeof CreditWalletSchema.Type

export const ConsumeCreditsApiResponseSchema = Schema.Struct({
  wallet: CreditWalletSchema
})
