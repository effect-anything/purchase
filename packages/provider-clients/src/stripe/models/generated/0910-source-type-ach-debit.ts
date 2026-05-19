import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SourceTypeAchDebit = Schema.Struct({
  bank_name: Schema.optional(Schema.NullOr(Schema.String)),
  country: Schema.optional(Schema.NullOr(Schema.String)),
  fingerprint: Schema.optional(Schema.NullOr(Schema.String)),
  last4: Schema.optional(Schema.NullOr(Schema.String)),
  routing_number: Schema.optional(Schema.NullOr(Schema.String)),
  type: Schema.optional(Schema.NullOr(Schema.String)),
})
export type SourceTypeAchDebit = typeof SourceTypeAchDebit.Type
