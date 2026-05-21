import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BenefitLicenseKeysCreateProperties = Schema.Struct({
  prefix: Schema.optional(Schema.NullOr(Schema.String)),
  expires: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.BenefitLicenseKeyExpirationProperties, any, any> =>
          Models.BenefitLicenseKeyExpirationProperties as Schema.Schema<
            Models.BenefitLicenseKeyExpirationProperties,
            any,
            any
          >
      )
    )
  ),
  activations: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.BenefitLicenseKeyActivationCreateProperties, any, any> =>
          Models.BenefitLicenseKeyActivationCreateProperties as Schema.Schema<
            Models.BenefitLicenseKeyActivationCreateProperties,
            any,
            any
          >
      )
    )
  ),
  limit_usage: Schema.optional(Schema.NullOr(Schema.Number))
})
export type BenefitLicenseKeysCreateProperties = typeof BenefitLicenseKeysCreateProperties.Type
