import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerCreateRelationships = Schema.Struct({
  store: Schema.suspend(() => Models.JsonApiStoreRelationship),
})
export type CustomerCreateRelationships = typeof CustomerCreateRelationships.Type
