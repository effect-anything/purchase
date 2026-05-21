import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ProductEntity = Schema.Struct({
  id: Schema.String,
  mode: Schema.suspend((): Schema.Schema<Models.EnvironmentMode> => Models.EnvironmentMode),
  object: Schema.String,
  name: Schema.String,
  description: Schema.String,
  image_url: Schema.optional(Schema.String),
  features: Schema.optional(
    Schema.Array(Schema.suspend((): Schema.Schema<Models.FeatureEntity> => Models.FeatureEntity))
  ),
  price: Schema.Number,
  currency: Schema.String,
  billing_type: Schema.suspend((): Schema.Schema<Models.ProductBillingType> => Models.ProductBillingType),
  billing_period: Schema.suspend((): Schema.Schema<Models.ProductBillingPeriod> => Models.ProductBillingPeriod),
  status: Schema.suspend((): Schema.Schema<Models.ProductStatus> => Models.ProductStatus),
  tax_mode: Schema.suspend((): Schema.Schema<Models.TaxMode> => Models.TaxMode),
  tax_category: Schema.suspend((): Schema.Schema<Models.TaxCategory> => Models.TaxCategory),
  product_url: Schema.optional(Schema.String),
  default_success_url: Schema.optional(Schema.NullOr(Schema.String)),
  custom_fields: Schema.optional(
    Schema.NullOr(Schema.Array(Schema.suspend((): Schema.Schema<Models.CustomField> => Models.CustomField)))
  ),
  created_at: Schema.String,
  updated_at: Schema.String
})
export type ProductEntity = typeof ProductEntity.Type
