import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const JsonApiIdentifier = Schema.Struct({
  type: Schema.String,
  id: Schema.String,
})
export type JsonApiIdentifier = typeof JsonApiIdentifier.Type
