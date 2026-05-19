import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const VariantListResponse = Schema.Struct({
  data: Schema.Array(Schema.suspend(() => Models.VariantResource)),
  links: Schema.optional(Schema.suspend(() => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend(() => Models.JsonApiMeta)),
})
export type VariantListResponse = typeof VariantListResponse.Type
