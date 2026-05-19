import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const InvoiceMandateOptionsPayto = Schema.Struct({
  amount: Schema.NullOr(Schema.Number),
  amount_type: Schema.NullOr(Schema.Literal("fixed", "maximum")),
  purpose: Schema.NullOr(Schema.Literal("dependant_support", "government", "loan", "mortgage", "other", "pension", "personal", "retail", "salary", "tax", "utility")),
})
export type InvoiceMandateOptionsPayto = typeof InvoiceMandateOptionsPayto.Type
