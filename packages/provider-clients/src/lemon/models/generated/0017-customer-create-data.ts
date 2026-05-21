import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerCreateData = Schema.Struct({
  type: Schema.Literal("customers"),
  attributes: Schema.suspend(
    (): Schema.Schema<Models.CustomerCreateAttributes, any, any> =>
      Models.CustomerCreateAttributes as Schema.Schema<Models.CustomerCreateAttributes, any, any>
  ),
  relationships: Schema.suspend(
    (): Schema.Schema<Models.CustomerCreateRelationships, any, any> =>
      Models.CustomerCreateRelationships as Schema.Schema<Models.CustomerCreateRelationships, any, any>
  )
})
export type CustomerCreateData = typeof CustomerCreateData.Type
