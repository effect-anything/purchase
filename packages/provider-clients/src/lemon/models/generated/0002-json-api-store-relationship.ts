import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const JsonApiStoreRelationship = Schema.Struct({
  data: Schema.Struct({
    type: Schema.Literal("stores"),
    id: Schema.String
  })
})
export type JsonApiStoreRelationship = typeof JsonApiStoreRelationship.Type
