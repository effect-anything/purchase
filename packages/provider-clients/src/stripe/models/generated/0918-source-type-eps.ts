import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SourceTypeEps = Schema.Struct({
  reference: Schema.optional(Schema.NullOr(Schema.String)),
  statement_descriptor: Schema.optional(Schema.NullOr(Schema.String))
})
export type SourceTypeEps = typeof SourceTypeEps.Type
