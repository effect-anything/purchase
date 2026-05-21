import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SourceTypeSepaDebit = Schema.Struct({
  bank_code: Schema.optional(Schema.NullOr(Schema.String)),
  branch_code: Schema.optional(Schema.NullOr(Schema.String)),
  country: Schema.optional(Schema.NullOr(Schema.String)),
  fingerprint: Schema.optional(Schema.NullOr(Schema.String)),
  last4: Schema.optional(Schema.NullOr(Schema.String)),
  mandate_reference: Schema.optional(Schema.NullOr(Schema.String)),
  mandate_url: Schema.optional(Schema.NullOr(Schema.String))
})
export type SourceTypeSepaDebit = typeof SourceTypeSepaDebit.Type
