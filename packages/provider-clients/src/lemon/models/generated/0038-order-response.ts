import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const OrderResponse = Schema.Struct({
  data: Schema.suspend((): Schema.Schema<Models.OrderResource> => Models.OrderResource),
  links: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiLinks> => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiMeta> => Models.JsonApiMeta))
})
export type OrderResponse = typeof OrderResponse.Type
