import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LicenseKeyWithActivations = Schema.Struct({
  id: Schema.String,
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  organization_id: Schema.String,
  customer_id: Schema.String,
  customer: Schema.suspend(
    (): Schema.Schema<Models.LicenseKeyCustomer, any, any> =>
      Models.LicenseKeyCustomer as Schema.Schema<Models.LicenseKeyCustomer, any, any>
  ),
  benefit_id: Schema.String,
  key: Schema.String,
  display_key: Schema.String,
  status: Schema.suspend(
    (): Schema.Schema<Models.LicenseKeyStatus, any, any> =>
      Models.LicenseKeyStatus as Schema.Schema<Models.LicenseKeyStatus, any, any>
  ),
  limit_activations: Schema.NullOr(Schema.Number),
  usage: Schema.Number,
  limit_usage: Schema.NullOr(Schema.Number),
  validations: Schema.Number,
  last_validated_at: Schema.NullOr(Schema.String),
  expires_at: Schema.NullOr(Schema.String),
  activations: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.LicenseKeyActivationBase, any, any> =>
        Models.LicenseKeyActivationBase as Schema.Schema<Models.LicenseKeyActivationBase, any, any>
    )
  )
})
export type LicenseKeyWithActivations = typeof LicenseKeyWithActivations.Type
