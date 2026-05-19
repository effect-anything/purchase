import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const VariantResponse = Schema.Struct({
  data: Schema.suspend(() => Models.VariantResource),
  links: Schema.optional(Schema.suspend(() => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend(() => Models.JsonApiMeta)),
})
export type VariantResponse = typeof VariantResponse.Type
