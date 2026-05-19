import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductFeature = Schema.Struct({
  entitlement_feature: Schema.suspend((): typeof Models.EntitlementsFeature => Models.EntitlementsFeature),
  id: Schema.String,
  livemode: Schema.Boolean,
  object: Schema.Literal("product_feature"),
})
export type ProductFeature = typeof ProductFeature.Type
