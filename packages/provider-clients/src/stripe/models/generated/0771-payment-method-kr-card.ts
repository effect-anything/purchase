import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodKrCard = Schema.Struct({
  brand: Schema.NullOr(Schema.Literal("bc", "citi", "hana", "hyundai", "jeju", "jeonbuk", "kakaobank", "kbank", "kdbbank", "kookmin", "kwangju", "lotte", "mg", "nh", "post", "samsung", "savingsbank", "shinhan", "shinhyup", "suhyup", "tossbank", "woori")),
  last4: Schema.NullOr(Schema.String),
})
export type PaymentMethodKrCard = typeof PaymentMethodKrCard.Type
