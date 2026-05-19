import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const DeletedApplication = Schema.Struct({
  deleted: Schema.Literal(true),
  id: Schema.String,
  name: Schema.NullOr(Schema.String),
  object: Schema.Literal("application"),
})
export type DeletedApplication = typeof DeletedApplication.Type
