import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Rule = Schema.Struct({
  action: Schema.String,
  id: Schema.String,
  predicate: Schema.String,
})
export type Rule = typeof Rule.Type
