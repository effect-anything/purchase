import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BenefitLicenseKeysProperties = Schema.Struct({
  prefix: Schema.NullOr(Schema.String),
  expires: Schema.NullOr(Schema.suspend((): typeof Models.BenefitLicenseKeyExpirationProperties => Models.BenefitLicenseKeyExpirationProperties)),
  activations: Schema.NullOr(Schema.suspend((): typeof Models.BenefitLicenseKeyActivationProperties => Models.BenefitLicenseKeyActivationProperties)),
  limit_usage: Schema.NullOr(Schema.Number),
})
export type BenefitLicenseKeysProperties = typeof BenefitLicenseKeysProperties.Type
