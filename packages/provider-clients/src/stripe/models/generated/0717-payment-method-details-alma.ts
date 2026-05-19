import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsAlma = Schema.Struct({
  installments: Schema.optional(Schema.suspend((): typeof Models.AlmaInstallments => Models.AlmaInstallments)),
  transaction_id: Schema.NullOr(Schema.String),
})
export type PaymentMethodDetailsAlma = typeof PaymentMethodDetailsAlma.Type
