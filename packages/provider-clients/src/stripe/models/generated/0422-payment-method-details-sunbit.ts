import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsSunbit = Schema.Struct({
  transaction_id: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsSunbit = typeof PaymentMethodDetailsSunbit.Type
