import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductCreateOneTime = Schema.Struct({
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Union(Schema.String, Schema.Number, Schema.Number, Schema.Boolean) })),
  name: Schema.String,
  description: Schema.optional(Schema.NullOr(Schema.String)),
  visibility: Schema.optional(Schema.suspend((): typeof Models.ProductVisibility => Models.ProductVisibility)),
  prices: Schema.Array(Schema.Union(Schema.suspend((): typeof Models.ProductPriceFixedCreate => Models.ProductPriceFixedCreate), Schema.suspend((): typeof Models.ProductPriceCustomCreate => Models.ProductPriceCustomCreate), Schema.suspend((): typeof Models.ProductPriceFreeCreate => Models.ProductPriceFreeCreate), Schema.suspend((): typeof Models.ProductPriceSeatBasedCreate => Models.ProductPriceSeatBasedCreate), Schema.suspend((): typeof Models.ProductPriceMeteredUnitCreate => Models.ProductPriceMeteredUnitCreate))),
  medias: Schema.optional(Schema.NullOr(Schema.Array(Schema.String))),
  attached_custom_fields: Schema.optional(Schema.Array(Schema.suspend((): typeof Models.AttachedCustomFieldCreate => Models.AttachedCustomFieldCreate))),
  organization_id: Schema.optional(Schema.NullOr(Schema.String)),
  recurring_interval: Schema.optional(Schema.Unknown),
  recurring_interval_count: Schema.optional(Schema.Unknown),
})
export type ProductCreateOneTime = typeof ProductCreateOneTime.Type
