import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Application = Schema.Struct({
  id: Schema.String,
  name: Schema.NullOr(Schema.String),
  object: Schema.Literal("application"),
})
export type Application = typeof Application.Type
