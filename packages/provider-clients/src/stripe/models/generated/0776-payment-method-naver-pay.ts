import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodNaverPay = Schema.Struct({
  buyer_id: Schema.NullOr(Schema.String),
  funding: Schema.Literal("card", "points"),
})
export type PaymentMethodNaverPay = typeof PaymentMethodNaverPay.Type
