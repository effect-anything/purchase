import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsSatispay = Schema.Struct({
  transaction_id: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsSatispay = typeof PaymentMethodDetailsSatispay.Type
