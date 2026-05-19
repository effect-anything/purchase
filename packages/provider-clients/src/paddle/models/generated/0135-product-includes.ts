import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductIncludes = Schema.Struct({
  id: Schema.suspend(() => Models.ProductId),
  name: Schema.suspend(() => Models.ProductName),
  description: Schema.NullOr(Schema.String),
  type: Schema.suspend(() => Models.CatalogType),
  tax_category: Schema.suspend(() => Models.TaxCategory),
  image_url: Schema.NullOr(Schema.Union(Schema.suspend(() => Models.ImageUrl), Schema.suspend(() => Models.EmptyString))),
  custom_data: Schema.NullOr(Schema.suspend(() => Models.CustomData)),
  status: Schema.suspend(() => Models.Status),
  import_meta: Schema.NullOr(Schema.suspend(() => Models.ImportMeta)),
  created_at: Schema.suspend(() => Models.CreatedAt),
  updated_at: Schema.suspend(() => Models.UpdatedAt),
  prices: Schema.optional(Schema.Array(Schema.suspend(() => Models.Price))),
})
export type ProductIncludes = typeof ProductIncludes.Type
