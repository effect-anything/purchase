import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutListResponse = Schema.Struct({
  data: Schema.Array(Schema.suspend((): Schema.Schema<Models.CheckoutResource> => Models.CheckoutResource)),
  links: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiLinks> => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiMeta> => Models.JsonApiMeta))
})
export type CheckoutListResponse = typeof CheckoutListResponse.Type
