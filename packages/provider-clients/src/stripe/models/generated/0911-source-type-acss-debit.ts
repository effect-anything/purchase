import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SourceTypeAcssDebit = Schema.Struct({
  bank_address_city: Schema.optional(Schema.NullOr(Schema.String)),
  bank_address_line_1: Schema.optional(Schema.NullOr(Schema.String)),
  bank_address_line_2: Schema.optional(Schema.NullOr(Schema.String)),
  bank_address_postal_code: Schema.optional(Schema.NullOr(Schema.String)),
  bank_name: Schema.optional(Schema.NullOr(Schema.String)),
  category: Schema.optional(Schema.NullOr(Schema.String)),
  country: Schema.optional(Schema.NullOr(Schema.String)),
  fingerprint: Schema.optional(Schema.NullOr(Schema.String)),
  last4: Schema.optional(Schema.NullOr(Schema.String)),
  routing_number: Schema.optional(Schema.NullOr(Schema.String)),
})
export type SourceTypeAcssDebit = typeof SourceTypeAcssDebit.Type
