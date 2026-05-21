import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionCustomer = Schema.Struct({
  id: Schema.String,
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  metadata: Schema.suspend(
    (): Schema.Schema<Models.MetadataOutputType, any, any> =>
      Models.MetadataOutputType as Schema.Schema<Models.MetadataOutputType, any, any>
  ),
  external_id: Schema.optional(Schema.NullOr(Schema.String)),
  email: Schema.optional(Schema.NullOr(Schema.String)),
  email_verified: Schema.Boolean,
  type: Schema.suspend(
    (): Schema.Schema<Models.CustomerType, any, any> =>
      Models.CustomerType as Schema.Schema<Models.CustomerType, any, any>
  ),
  name: Schema.NullOr(Schema.String),
  billing_address: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Address, any, any> => Models.Address as Schema.Schema<Models.Address, any, any>
    )
  ),
  tax_id: Schema.NullOr(Schema.Array(Schema.Unknown)),
  locale: Schema.optional(Schema.NullOr(Schema.String)),
  organization_id: Schema.String,
  deleted_at: Schema.NullOr(Schema.String),
  avatar_url: Schema.String
})
export type SubscriptionCustomer = typeof SubscriptionCustomer.Type
