import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerCreateData = Schema.Struct({
  type: Schema.Literal("customers"),
  attributes: Schema.suspend(() => Models.CustomerCreateAttributes),
  relationships: Schema.suspend(() => Models.CustomerCreateRelationships),
})
export type CustomerCreateData = typeof CustomerCreateData.Type
