import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsKrCard = Schema.Struct({
  brand: Schema.NullOr(
    Schema.Literal(
      "bc",
      "citi",
      "hana",
      "hyundai",
      "jeju",
      "jeonbuk",
      "kakaobank",
      "kbank",
      "kdbbank",
      "kookmin",
      "kwangju",
      "lotte",
      "mg",
      "nh",
      "post",
      "samsung",
      "savingsbank",
      "shinhan",
      "shinhyup",
      "suhyup",
      "tossbank",
      "woori"
    )
  ),
  buyer_id: Schema.NullOr(Schema.String),
  last4: Schema.NullOr(Schema.String),
  transaction_id: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsKrCard = typeof PaymentMethodDetailsKrCard.Type
