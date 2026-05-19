import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Networks = Schema.Struct({
  available: Schema.Array(Schema.String),
  preferred: Schema.NullOr(Schema.String),
})
export type Networks = typeof Networks.Type
