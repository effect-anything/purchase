import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PriceResponse = Schema.Struct({
  data: Schema.suspend(() => Models.PriceResource),
  links: Schema.optional(Schema.suspend(() => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend(() => Models.JsonApiMeta)),
})
export type PriceResponse = typeof PriceResponse.Type
