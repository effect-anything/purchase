import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SourceTypeIdeal = Schema.Struct({
  bank: Schema.optional(Schema.NullOr(Schema.String)),
  bic: Schema.optional(Schema.NullOr(Schema.String)),
  iban_last4: Schema.optional(Schema.NullOr(Schema.String)),
  statement_descriptor: Schema.optional(Schema.NullOr(Schema.String))
})
export type SourceTypeIdeal = typeof SourceTypeIdeal.Type
