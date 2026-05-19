import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsPaynow = Schema.Struct({
  location: Schema.optional(Schema.String),
  reader: Schema.optional(Schema.String),
  reference: Schema.NullOr(Schema.String),
})
export type PaymentMethodDetailsPaynow = typeof PaymentMethodDetailsPaynow.Type
