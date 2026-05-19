import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsLink = Schema.Struct({
  country: Schema.NullOr(Schema.String),
})
export type PaymentMethodDetailsLink = typeof PaymentMethodDetailsLink.Type
