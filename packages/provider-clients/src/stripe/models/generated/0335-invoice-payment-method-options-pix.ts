import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const InvoicePaymentMethodOptionsPix = Schema.Struct({
  amount_includes_iof: Schema.NullOr(Schema.Literal("always", "never")),
  expires_after_seconds: Schema.optional(Schema.Number),
})
export type InvoicePaymentMethodOptionsPix = typeof InvoicePaymentMethodOptionsPix.Type
