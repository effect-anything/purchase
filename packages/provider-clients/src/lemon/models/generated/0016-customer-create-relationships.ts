import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerCreateRelationships = Schema.Struct({
  store: Schema.suspend(
    (): Schema.Schema<Models.JsonApiStoreRelationship, any, any> =>
      Models.JsonApiStoreRelationship as Schema.Schema<Models.JsonApiStoreRelationship, any, any>
  )
})
export type CustomerCreateRelationships = typeof CustomerCreateRelationships.Type
