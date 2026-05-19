import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionCustomer = Schema.Struct({
  id: Schema.String,
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  metadata: Schema.suspend((): typeof Models.MetadataOutputType => Models.MetadataOutputType),
  external_id: Schema.optional(Schema.NullOr(Schema.String)),
  email: Schema.optional(Schema.NullOr(Schema.String)),
  email_verified: Schema.Boolean,
  type: Schema.suspend((): typeof Models.CustomerType => Models.CustomerType),
  name: Schema.NullOr(Schema.String),
  billing_address: Schema.NullOr(Schema.suspend((): typeof Models.Address => Models.Address)),
  tax_id: Schema.NullOr(Schema.Array(Schema.Unknown)),
  locale: Schema.optional(Schema.NullOr(Schema.String)),
  organization_id: Schema.String,
  deleted_at: Schema.NullOr(Schema.String),
  avatar_url: Schema.String,
})
export type SubscriptionCustomer = typeof SubscriptionCustomer.Type
