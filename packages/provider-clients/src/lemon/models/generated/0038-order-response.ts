import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const OrderResponse = Schema.Struct({
  data: Schema.suspend(() => Models.OrderResource),
  links: Schema.optional(Schema.suspend(() => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend(() => Models.JsonApiMeta)),
})
export type OrderResponse = typeof OrderResponse.Type
