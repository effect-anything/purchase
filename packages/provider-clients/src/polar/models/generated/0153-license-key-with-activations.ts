import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const LicenseKeyWithActivations = Schema.Struct({
  id: Schema.String,
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  organization_id: Schema.String,
  customer_id: Schema.String,
  customer: Schema.suspend((): typeof Models.LicenseKeyCustomer => Models.LicenseKeyCustomer),
  benefit_id: Schema.String,
  key: Schema.String,
  display_key: Schema.String,
  status: Schema.suspend((): typeof Models.LicenseKeyStatus => Models.LicenseKeyStatus),
  limit_activations: Schema.NullOr(Schema.Number),
  usage: Schema.Number,
  limit_usage: Schema.NullOr(Schema.Number),
  validations: Schema.Number,
  last_validated_at: Schema.NullOr(Schema.String),
  expires_at: Schema.NullOr(Schema.String),
  activations: Schema.Array(Schema.suspend((): typeof Models.LicenseKeyActivationBase => Models.LicenseKeyActivationBase)),
})
export type LicenseKeyWithActivations = typeof LicenseKeyWithActivations.Type
