import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const JsonApiRelationship = Schema.Struct({
  data: Schema.suspend(() => Models.JsonApiIdentifier),
})
export type JsonApiRelationship = typeof JsonApiRelationship.Type
