import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsBillie = Schema.Struct({
  transaction_id: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsBillie = typeof PaymentMethodDetailsBillie.Type
