import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutEntity = Schema.Struct({
  id: Schema.String,
  mode: Schema.suspend(
    (): Schema.Schema<Models.EnvironmentMode, any, any> =>
      Models.EnvironmentMode as Schema.Schema<Models.EnvironmentMode, any, any>
  ),
  object: Schema.String,
  status: Schema.Literal("pending", "processing", "completed", "expired"),
  request_id: Schema.optional(Schema.String),
  product: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.ProductEntity, any, any> =>
        Models.ProductEntity as Schema.Schema<Models.ProductEntity, any, any>
    )
  ),
  units: Schema.optional(Schema.Number),
  order: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.OrderEntity, any, any> =>
        Models.OrderEntity as Schema.Schema<Models.OrderEntity, any, any>
    )
  ),
  subscription: Schema.optional(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.SubscriptionEntity, any, any> =>
          Models.SubscriptionEntity as Schema.Schema<Models.SubscriptionEntity, any, any>
      )
    )
  ),
  customer: Schema.optional(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.CustomerEntity, any, any> =>
          Models.CustomerEntity as Schema.Schema<Models.CustomerEntity, any, any>
      )
    )
  ),
  custom_fields: Schema.optional(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.CustomField, any, any> =>
          Models.CustomField as Schema.Schema<Models.CustomField, any, any>
      )
    )
  ),
  checkout_url: Schema.optional(Schema.String),
  success_url: Schema.optional(Schema.NullOr(Schema.String)),
  license_keys: Schema.optional(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.LicenseEntity, any, any> =>
          Models.LicenseEntity as Schema.Schema<Models.LicenseEntity, any, any>
      )
    )
  ),
  feature: Schema.optional(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.ProductFeatureEntity, any, any> =>
          Models.ProductFeatureEntity as Schema.Schema<Models.ProductFeatureEntity, any, any>
      )
    )
  ),
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown }))
})
export type CheckoutEntity = typeof CheckoutEntity.Type
