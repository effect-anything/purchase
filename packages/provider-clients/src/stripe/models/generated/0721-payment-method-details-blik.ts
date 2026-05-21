import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsBlik = Schema.Struct({
  buyer_id: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsBlik = typeof PaymentMethodDetailsBlik.Type
