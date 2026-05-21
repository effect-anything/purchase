import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const JsonApiRelationships = Schema.Record({
  key: Schema.String,
  value: Schema.suspend(
    (): Schema.Schema<Models.JsonApiRelationship, any, any> =>
      Models.JsonApiRelationship as Schema.Schema<Models.JsonApiRelationship, any, any>
  )
})
export type JsonApiRelationships = typeof JsonApiRelationships.Type
