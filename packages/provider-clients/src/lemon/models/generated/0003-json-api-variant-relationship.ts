import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const JsonApiVariantRelationship = Schema.Struct({
  data: Schema.Struct({
    type: Schema.Literal("variants"),
    id: Schema.String
  })
})
export type JsonApiVariantRelationship = typeof JsonApiVariantRelationship.Type
