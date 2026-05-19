import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsCardInstallments = Schema.Struct({
  plan: Schema.NullOr(Schema.suspend((): typeof Models.PaymentMethodDetailsCardInstallmentsPlan => Models.PaymentMethodDetailsCardInstallmentsPlan)),
})
export type PaymentMethodDetailsCardInstallments = typeof PaymentMethodDetailsCardInstallments.Type
