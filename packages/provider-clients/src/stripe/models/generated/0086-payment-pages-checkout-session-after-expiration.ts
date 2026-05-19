import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionAfterExpiration = Schema.Struct({
  recovery: Schema.NullOr(Schema.suspend((): typeof Models.PaymentPagesCheckoutSessionAfterExpirationRecovery => Models.PaymentPagesCheckoutSessionAfterExpirationRecovery)),
})
export type PaymentPagesCheckoutSessionAfterExpiration = typeof PaymentPagesCheckoutSessionAfterExpiration.Type
