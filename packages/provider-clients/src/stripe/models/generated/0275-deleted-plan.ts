import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const DeletedPlan = Schema.Struct({
  deleted: Schema.Literal(true),
  id: Schema.String,
  object: Schema.Literal("plan"),
})
export type DeletedPlan = typeof DeletedPlan.Type
