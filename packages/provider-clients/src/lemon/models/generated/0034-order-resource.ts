import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const OrderResource = Schema.Struct({
  type: Schema.Literal("orders"),
  id: Schema.String,
  attributes: Schema.suspend(() => Models.OrderAttributes),
  relationships: Schema.optional(Schema.suspend(() => Models.JsonApiRelationships)),
  links: Schema.optional(Schema.suspend(() => Models.JsonApiLinks)),
})
export type OrderResource = typeof OrderResource.Type
