import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ProductPreview = Schema.Struct({
  id: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ProductId, any, any> => Models.ProductId as Schema.Schema<Models.ProductId, any, any>
    )
  ),
  name: Schema.suspend(
    (): Schema.Schema<Models.ProductName, any, any> => Models.ProductName as Schema.Schema<Models.ProductName, any, any>
  ),
  description: Schema.NullOr(Schema.String),
  type: Schema.suspend(
    (): Schema.Schema<Models.CatalogType, any, any> => Models.CatalogType as Schema.Schema<Models.CatalogType, any, any>
  ),
  tax_category: Schema.suspend(
    (): Schema.Schema<Models.TaxCategory, any, any> => Models.TaxCategory as Schema.Schema<Models.TaxCategory, any, any>
  ),
  image_url: Schema.NullOr(
    Schema.Union(
      Schema.suspend(
        (): Schema.Schema<Models.ImageUrl, any, any> => Models.ImageUrl as Schema.Schema<Models.ImageUrl, any, any>
      ),
      Schema.suspend(
        (): Schema.Schema<Models.EmptyString, any, any> =>
          Models.EmptyString as Schema.Schema<Models.EmptyString, any, any>
      )
    )
  ),
  custom_data: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.CustomData, any, any> => Models.CustomData as Schema.Schema<Models.CustomData, any, any>
    )
  ),
  status: Schema.suspend(
    (): Schema.Schema<Models.Status, any, any> => Models.Status as Schema.Schema<Models.Status, any, any>
  ),
  import_meta: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ImportMeta, any, any> => Models.ImportMeta as Schema.Schema<Models.ImportMeta, any, any>
    )
  ),
  created_at: Schema.suspend(
    (): Schema.Schema<Models.CreatedAt, any, any> => Models.CreatedAt as Schema.Schema<Models.CreatedAt, any, any>
  ),
  updated_at: Schema.suspend(
    (): Schema.Schema<Models.UpdatedAt, any, any> => Models.UpdatedAt as Schema.Schema<Models.UpdatedAt, any, any>
  )
})
export type ProductPreview = typeof ProductPreview.Type
