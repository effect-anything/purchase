import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BenefitLicenseKeysProperties = Schema.Struct({
  prefix: Schema.NullOr(Schema.String),
  expires: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.BenefitLicenseKeyExpirationProperties, any, any> =>
        Models.BenefitLicenseKeyExpirationProperties as Schema.Schema<
          Models.BenefitLicenseKeyExpirationProperties,
          any,
          any
        >
    )
  ),
  activations: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.BenefitLicenseKeyActivationProperties, any, any> =>
        Models.BenefitLicenseKeyActivationProperties as Schema.Schema<
          Models.BenefitLicenseKeyActivationProperties,
          any,
          any
        >
    )
  ),
  limit_usage: Schema.NullOr(Schema.Number)
})
export type BenefitLicenseKeysProperties = typeof BenefitLicenseKeysProperties.Type
