import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsBoleto = Schema.Struct({
  tax_id: Schema.String,
})
export type PaymentMethodDetailsBoleto = typeof PaymentMethodDetailsBoleto.Type
