import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SourceTypeAuBecsDebit = Schema.Struct({
  bsb_number: Schema.optional(Schema.NullOr(Schema.String)),
  fingerprint: Schema.optional(Schema.NullOr(Schema.String)),
  last4: Schema.optional(Schema.NullOr(Schema.String)),
})
export type SourceTypeAuBecsDebit = typeof SourceTypeAuBecsDebit.Type
