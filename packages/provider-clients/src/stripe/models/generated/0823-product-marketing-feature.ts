import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ProductMarketingFeature = Schema.Struct({
  name: Schema.optional(Schema.String)
})
export type ProductMarketingFeature = typeof ProductMarketingFeature.Type
