import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PriceListResponse = Schema.Struct({
  data: Schema.Array(Schema.suspend((): Schema.Schema<Models.PriceResource> => Models.PriceResource)),
  links: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiLinks> => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiMeta> => Models.JsonApiMeta))
})
export type PriceListResponse = typeof PriceListResponse.Type
