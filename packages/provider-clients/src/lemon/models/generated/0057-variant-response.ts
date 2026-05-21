import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const VariantResponse = Schema.Struct({
  data: Schema.suspend((): Schema.Schema<Models.VariantResource> => Models.VariantResource),
  links: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiLinks> => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiMeta> => Models.JsonApiMeta))
})
export type VariantResponse = typeof VariantResponse.Type
