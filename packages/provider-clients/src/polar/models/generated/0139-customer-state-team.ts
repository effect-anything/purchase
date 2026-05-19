import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerStateTeam = Schema.Struct({
  id: Schema.String,
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  metadata: Schema.suspend((): typeof Models.MetadataOutputType => Models.MetadataOutputType),
  external_id: Schema.optional(Schema.NullOr(Schema.String)),
  email: Schema.optional(Schema.NullOr(Schema.String)),
  email_verified: Schema.Boolean,
  type: Schema.String,
  name: Schema.NullOr(Schema.String),
  billing_address: Schema.NullOr(Schema.suspend((): typeof Models.Address => Models.Address)),
  tax_id: Schema.NullOr(Schema.Array(Schema.Unknown)),
  locale: Schema.optional(Schema.NullOr(Schema.String)),
  organization_id: Schema.String,
  deleted_at: Schema.NullOr(Schema.String),
  active_subscriptions: Schema.Array(Schema.suspend((): typeof Models.CustomerStateSubscription => Models.CustomerStateSubscription)),
  granted_benefits: Schema.Array(Schema.suspend((): typeof Models.CustomerStateBenefitGrant => Models.CustomerStateBenefitGrant)),
  active_meters: Schema.Array(Schema.suspend((): typeof Models.CustomerStateMeter => Models.CustomerStateMeter)),
  avatar_url: Schema.String,
})
export type CustomerStateTeam = typeof CustomerStateTeam.Type
