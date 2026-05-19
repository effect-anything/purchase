import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodOptionsCardInstallments = Schema.Struct({
  available_plans: Schema.NullOr(Schema.Array(Schema.suspend((): typeof Models.PaymentMethodDetailsCardInstallmentsPlan => Models.PaymentMethodDetailsCardInstallmentsPlan))),
  enabled: Schema.Boolean,
  plan: Schema.NullOr(Schema.suspend((): typeof Models.PaymentMethodDetailsCardInstallmentsPlan => Models.PaymentMethodDetailsCardInstallmentsPlan)),
})
export type PaymentMethodOptionsCardInstallments = typeof PaymentMethodOptionsCardInstallments.Type
