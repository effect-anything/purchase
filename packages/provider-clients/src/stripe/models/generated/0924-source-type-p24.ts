import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SourceTypeP24 = Schema.Struct({
  reference: Schema.optional(Schema.NullOr(Schema.String)),
})
export type SourceTypeP24 = typeof SourceTypeP24.Type
