import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const OrderListResponse = Schema.Struct({
  data: Schema.Array(Schema.suspend((): Schema.Schema<Models.OrderResource> => Models.OrderResource)),
  links: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiLinks> => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiMeta> => Models.JsonApiMeta))
})
export type OrderListResponse = typeof OrderListResponse.Type
