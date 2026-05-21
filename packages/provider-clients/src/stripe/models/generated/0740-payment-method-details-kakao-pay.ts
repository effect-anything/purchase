import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsKakaoPay = Schema.Struct({
  buyer_id: Schema.NullOr(Schema.String),
  transaction_id: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsKakaoPay = typeof PaymentMethodDetailsKakaoPay.Type
