import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodCard = Schema.Struct({
  brand: Schema.String,
  checks: Schema.NullOr(Schema.suspend((): typeof Models.PaymentMethodCardChecks => Models.PaymentMethodCardChecks)),
  country: Schema.NullOr(Schema.String),
  description: Schema.optional(Schema.NullOr(Schema.String)),
  display_brand: Schema.NullOr(Schema.String),
  exp_month: Schema.Number,
  exp_year: Schema.Number,
  fingerprint: Schema.optional(Schema.NullOr(Schema.String)),
  funding: Schema.String,
  generated_from: Schema.NullOr(Schema.suspend((): typeof Models.PaymentMethodCardGeneratedCard => Models.PaymentMethodCardGeneratedCard)),
  iin: Schema.optional(Schema.NullOr(Schema.String)),
  issuer: Schema.optional(Schema.NullOr(Schema.String)),
  last4: Schema.String,
  networks: Schema.NullOr(Schema.suspend((): typeof Models.Networks => Models.Networks)),
  regulated_status: Schema.NullOr(Schema.Literal("regulated", "unregulated")),
  three_d_secure_usage: Schema.NullOr(Schema.suspend((): typeof Models.ThreeDSecureUsage => Models.ThreeDSecureUsage)),
  wallet: Schema.NullOr(Schema.suspend((): typeof Models.PaymentMethodCardWallet => Models.PaymentMethodCardWallet)),
})
export type PaymentMethodCard = typeof PaymentMethodCard.Type
