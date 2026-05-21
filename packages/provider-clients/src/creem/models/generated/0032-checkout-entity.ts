import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutEntity = Schema.Struct({
  id: Schema.String,
  mode: Schema.suspend((): Schema.Schema<Models.EnvironmentMode> => Models.EnvironmentMode),
  object: Schema.String,
  status: Schema.Literal("pending", "processing", "completed", "expired"),
  request_id: Schema.optional(Schema.String),
  product: Schema.Union(
    Schema.String,
    Schema.suspend((): Schema.Schema<Models.ProductEntity> => Models.ProductEntity)
  ),
  units: Schema.optional(Schema.Number),
  order: Schema.optional(Schema.suspend((): Schema.Schema<Models.OrderEntity> => Models.OrderEntity)),
  subscription: Schema.optional(
    Schema.Union(
      Schema.String,
      Schema.suspend((): Schema.Schema<Models.SubscriptionEntity> => Models.SubscriptionEntity)
    )
  ),
  customer: Schema.optional(
    Schema.Union(
      Schema.String,
      Schema.suspend((): Schema.Schema<Models.CustomerEntity> => Models.CustomerEntity)
    )
  ),
  custom_fields: Schema.optional(
    Schema.Array(Schema.suspend((): Schema.Schema<Models.CustomField> => Models.CustomField))
  ),
  checkout_url: Schema.optional(Schema.String),
  success_url: Schema.optional(Schema.NullOr(Schema.String)),
  license_keys: Schema.optional(
    Schema.Array(Schema.suspend((): Schema.Schema<Models.LicenseEntity> => Models.LicenseEntity))
  ),
  feature: Schema.optional(
    Schema.Array(Schema.suspend((): Schema.Schema<Models.ProductFeatureEntity> => Models.ProductFeatureEntity))
  ),
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown }))
})
export type CheckoutEntity = typeof CheckoutEntity.Type
