import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionAfterExpirationRecovery = Schema.Struct({
  allow_promotion_codes: Schema.Boolean,
  enabled: Schema.Boolean,
  expires_at: Schema.NullOr(Schema.Number),
  url: Schema.NullOr(Schema.String),
})
export type PaymentPagesCheckoutSessionAfterExpirationRecovery = typeof PaymentPagesCheckoutSessionAfterExpirationRecovery.Type
