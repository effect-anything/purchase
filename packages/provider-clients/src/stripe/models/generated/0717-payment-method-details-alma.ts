import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsAlma = Schema.Struct({
  installments: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.AlmaInstallments, any, any> =>
        Models.AlmaInstallments as Schema.Schema<Models.AlmaInstallments, any, any>
    )
  ),
  transaction_id: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsAlma = typeof PaymentMethodDetailsAlma.Type
