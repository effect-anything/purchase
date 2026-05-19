import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodCardPresentNetworks = Schema.Struct({
  available: Schema.Array(Schema.String),
  preferred: Schema.NullOr(Schema.String),
})
export type PaymentMethodCardPresentNetworks = typeof PaymentMethodCardPresentNetworks.Type
