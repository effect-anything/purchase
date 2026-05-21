import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerStateIndividual = Schema.Struct({
  id: Schema.String,
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  metadata: Schema.suspend(
    (): Schema.Schema<Models.MetadataOutputType, any, any> =>
      Models.MetadataOutputType as Schema.Schema<Models.MetadataOutputType, any, any>
  ),
  external_id: Schema.optional(Schema.NullOr(Schema.String)),
  email: Schema.String,
  email_verified: Schema.Boolean,
  type: Schema.String,
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
  active_subscriptions: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.CustomerStateSubscription, any, any> =>
        Models.CustomerStateSubscription as Schema.Schema<Models.CustomerStateSubscription, any, any>
    )
  ),
  granted_benefits: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.CustomerStateBenefitGrant, any, any> =>
        Models.CustomerStateBenefitGrant as Schema.Schema<Models.CustomerStateBenefitGrant, any, any>
    )
  ),
  active_meters: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.CustomerStateMeter, any, any> =>
        Models.CustomerStateMeter as Schema.Schema<Models.CustomerStateMeter, any, any>
    )
  ),
  avatar_url: Schema.String
})
export type CustomerStateIndividual = typeof CustomerStateIndividual.Type
