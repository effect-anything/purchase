import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutEntity = Schema.Struct({
  id: Schema.String,
  mode: Schema.suspend(() => Models.EnvironmentMode),
  object: Schema.String,
  status: Schema.Literal("pending", "processing", "completed", "expired"),
  request_id: Schema.optional(Schema.String),
  product: Schema.Union(Schema.String, Schema.suspend(() => Models.ProductEntity)),
  units: Schema.optional(Schema.Number),
  order: Schema.optional(Schema.suspend(() => Models.OrderEntity)),
  subscription: Schema.optional(Schema.Union(Schema.String, Schema.suspend(() => Models.SubscriptionEntity))),
  customer: Schema.optional(Schema.Union(Schema.String, Schema.suspend(() => Models.CustomerEntity))),
  custom_fields: Schema.optional(Schema.Array(Schema.suspend(() => Models.CustomField))),
  checkout_url: Schema.optional(Schema.String),
  success_url: Schema.optional(Schema.NullOr(Schema.String)),
  license_keys: Schema.optional(Schema.Array(Schema.suspend(() => Models.LicenseEntity))),
  feature: Schema.optional(Schema.Array(Schema.suspend(() => Models.ProductFeatureEntity))),
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
})
export type CheckoutEntity = typeof CheckoutEntity.Type
