import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ProductEntity = Schema.Struct({
  id: Schema.String,
  mode: Schema.suspend(
    (): Schema.Schema<Models.EnvironmentMode, any, any> =>
      Models.EnvironmentMode as Schema.Schema<Models.EnvironmentMode, any, any>
  ),
  object: Schema.String,
  name: Schema.String,
  description: Schema.String,
  image_url: Schema.optional(Schema.String),
  features: Schema.optional(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.FeatureEntity, any, any> =>
          Models.FeatureEntity as Schema.Schema<Models.FeatureEntity, any, any>
      )
    )
  ),
  price: Schema.Number,
  currency: Schema.String,
  billing_type: Schema.suspend(
    (): Schema.Schema<Models.ProductBillingType, any, any> =>
      Models.ProductBillingType as Schema.Schema<Models.ProductBillingType, any, any>
  ),
  billing_period: Schema.suspend(
    (): Schema.Schema<Models.ProductBillingPeriod, any, any> =>
      Models.ProductBillingPeriod as Schema.Schema<Models.ProductBillingPeriod, any, any>
  ),
  status: Schema.suspend(
    (): Schema.Schema<Models.ProductStatus, any, any> =>
      Models.ProductStatus as Schema.Schema<Models.ProductStatus, any, any>
  ),
  tax_mode: Schema.suspend(
    (): Schema.Schema<Models.TaxMode, any, any> => Models.TaxMode as Schema.Schema<Models.TaxMode, any, any>
  ),
  tax_category: Schema.suspend(
    (): Schema.Schema<Models.TaxCategory, any, any> => Models.TaxCategory as Schema.Schema<Models.TaxCategory, any, any>
  ),
  product_url: Schema.optional(Schema.String),
  default_success_url: Schema.optional(Schema.NullOr(Schema.String)),
  custom_fields: Schema.optional(
    Schema.NullOr(
      Schema.Array(
        Schema.suspend(
          (): Schema.Schema<Models.CustomField, any, any> =>
            Models.CustomField as Schema.Schema<Models.CustomField, any, any>
        )
      )
    )
  ),
  created_at: Schema.String,
  updated_at: Schema.String
})
export type ProductEntity = typeof ProductEntity.Type
