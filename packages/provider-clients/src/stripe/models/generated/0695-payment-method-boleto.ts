import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodBoleto = Schema.Struct({
  tax_id: Schema.String
})
export type PaymentMethodBoleto = typeof PaymentMethodBoleto.Type
