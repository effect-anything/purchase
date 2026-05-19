import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsKlarna = Schema.Struct({
  location: Schema.optional(Schema.String),
  payer_details: Schema.NullOr(Schema.suspend((): typeof Models.KlarnaPayerDetails => Models.KlarnaPayerDetails)),
  payment_method_category: Schema.NullOr(Schema.String),
  preferred_locale: Schema.NullOr(Schema.String),
  reader: Schema.optional(Schema.String),
})
export type PaymentMethodDetailsKlarna = typeof PaymentMethodDetailsKlarna.Type
