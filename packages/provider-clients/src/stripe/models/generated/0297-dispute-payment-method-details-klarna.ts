import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const DisputePaymentMethodDetailsKlarna = Schema.Struct({
  chargeback_loss_reason_code: Schema.optional(Schema.String),
  reason_code: Schema.NullOr(Schema.String),
})
export type DisputePaymentMethodDetailsKlarna = typeof DisputePaymentMethodDetailsKlarna.Type
