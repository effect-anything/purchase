import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutResponse = Schema.Struct({
  data: Schema.suspend((): Schema.Schema<Models.CheckoutResource> => Models.CheckoutResource),
  links: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiLinks> => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiMeta> => Models.JsonApiMeta))
})
export type CheckoutResponse = typeof CheckoutResponse.Type
