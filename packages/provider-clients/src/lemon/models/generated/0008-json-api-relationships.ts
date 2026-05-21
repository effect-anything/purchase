import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const JsonApiRelationships = Schema.Record({
  key: Schema.String,
  value: Schema.suspend((): Schema.Schema<Models.JsonApiRelationship> => Models.JsonApiRelationship)
})
export type JsonApiRelationships = typeof JsonApiRelationships.Type
