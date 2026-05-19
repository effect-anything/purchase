import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SourceTypeBancontact = Schema.Struct({
  bank_code: Schema.optional(Schema.NullOr(Schema.String)),
  bank_name: Schema.optional(Schema.NullOr(Schema.String)),
  bic: Schema.optional(Schema.NullOr(Schema.String)),
  iban_last4: Schema.optional(Schema.NullOr(Schema.String)),
  preferred_language: Schema.optional(Schema.NullOr(Schema.String)),
  statement_descriptor: Schema.optional(Schema.NullOr(Schema.String)),
})
export type SourceTypeBancontact = typeof SourceTypeBancontact.Type
