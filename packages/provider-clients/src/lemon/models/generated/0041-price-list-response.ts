import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PriceListResponse = Schema.Struct({
  data: Schema.Array(Schema.suspend(() => Models.PriceResource)),
  links: Schema.optional(Schema.suspend(() => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend(() => Models.JsonApiMeta)),
})
export type PriceListResponse = typeof PriceListResponse.Type
