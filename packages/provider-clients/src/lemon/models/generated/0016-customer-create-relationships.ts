import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerCreateRelationships = Schema.Struct({
  store: Schema.suspend((): Schema.Schema<Models.JsonApiStoreRelationship> => Models.JsonApiStoreRelationship)
})
export type CustomerCreateRelationships = typeof CustomerCreateRelationships.Type
