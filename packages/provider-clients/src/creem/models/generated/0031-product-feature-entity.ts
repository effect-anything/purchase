import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ProductFeatureEntity = Schema.Struct({
  id: Schema.optional(Schema.NullOr(Schema.String)),
  description: Schema.optional(Schema.NullOr(Schema.String)),
  type: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.ProductFeatureType, any, any> =>
        Models.ProductFeatureType as Schema.Schema<Models.ProductFeatureType, any, any>
    )
  ),
  private_note: Schema.optional(Schema.NullOr(Schema.String)),
  file: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.FileFeatureEntity, any, any> =>
        Models.FileFeatureEntity as Schema.Schema<Models.FileFeatureEntity, any, any>
    )
  ),
  license_key: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.LicenseEntity, any, any> =>
        Models.LicenseEntity as Schema.Schema<Models.LicenseEntity, any, any>
    )
  ),
  customer_credits: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CustomerCreditsFeatureEntity, any, any> =>
        Models.CustomerCreditsFeatureEntity as Schema.Schema<Models.CustomerCreditsFeatureEntity, any, any>
    )
  ),
  license: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.LicenseEntity, any, any> =>
        Models.LicenseEntity as Schema.Schema<Models.LicenseEntity, any, any>
    )
  )
})
export type ProductFeatureEntity = typeof ProductFeatureEntity.Type
