import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerCreateData = Schema.Struct({
  type: Schema.Literal("customers"),
  attributes: Schema.suspend((): Schema.Schema<Models.CustomerCreateAttributes> => Models.CustomerCreateAttributes),
  relationships: Schema.suspend(
    (): Schema.Schema<Models.CustomerCreateRelationships> => Models.CustomerCreateRelationships
  )
})
export type CustomerCreateData = typeof CustomerCreateData.Type
