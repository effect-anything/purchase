import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionManagedPayments = Schema.Struct({
  enabled: Schema.Boolean,
})
export type PaymentPagesCheckoutSessionManagedPayments = typeof PaymentPagesCheckoutSessionManagedPayments.Type
