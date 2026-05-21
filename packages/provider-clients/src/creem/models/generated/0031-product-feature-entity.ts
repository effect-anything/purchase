import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ProductFeatureEntity = Schema.Struct({
  id: Schema.optional(Schema.NullOr(Schema.String)),
  description: Schema.optional(Schema.NullOr(Schema.String)),
  type: Schema.optional(Schema.suspend((): Schema.Schema<Models.ProductFeatureType> => Models.ProductFeatureType)),
  private_note: Schema.optional(Schema.NullOr(Schema.String)),
  file: Schema.optional(Schema.suspend((): Schema.Schema<Models.FileFeatureEntity> => Models.FileFeatureEntity)),
  license_key: Schema.optional(Schema.suspend((): Schema.Schema<Models.LicenseEntity> => Models.LicenseEntity)),
  customer_credits: Schema.optional(
    Schema.suspend((): Schema.Schema<Models.CustomerCreditsFeatureEntity> => Models.CustomerCreditsFeatureEntity)
  ),
  license: Schema.optional(Schema.suspend((): Schema.Schema<Models.LicenseEntity> => Models.LicenseEntity))
})
export type ProductFeatureEntity = typeof ProductFeatureEntity.Type
