import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ProductPreview = Schema.Struct({
  id: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.ProductId> => Models.ProductId)),
  name: Schema.suspend((): Schema.Schema<Models.ProductName> => Models.ProductName),
  description: Schema.NullOr(Schema.String),
  type: Schema.suspend((): Schema.Schema<Models.CatalogType> => Models.CatalogType),
  tax_category: Schema.suspend((): Schema.Schema<Models.TaxCategory> => Models.TaxCategory),
  image_url: Schema.NullOr(
    Schema.Union(
      Schema.suspend((): Schema.Schema<Models.ImageUrl> => Models.ImageUrl),
      Schema.suspend((): Schema.Schema<Models.EmptyString> => Models.EmptyString)
    )
  ),
  custom_data: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.CustomData> => Models.CustomData)),
  status: Schema.suspend((): Schema.Schema<Models.Status> => Models.Status),
  import_meta: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.ImportMeta> => Models.ImportMeta)),
  created_at: Schema.suspend((): Schema.Schema<Models.CreatedAt> => Models.CreatedAt),
  updated_at: Schema.suspend((): Schema.Schema<Models.UpdatedAt> => Models.UpdatedAt)
})
export type ProductPreview = typeof ProductPreview.Type
