import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsCashapp = Schema.Struct({
  buyer_id: Schema.NullOr(Schema.String),
  cashtag: Schema.NullOr(Schema.String),
  transaction_id: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsCashapp = typeof PaymentMethodDetailsCashapp.Type
