import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BenefitLicenseKeysCreateProperties = Schema.Struct({
  prefix: Schema.optional(Schema.NullOr(Schema.String)),
  expires: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.BenefitLicenseKeyExpirationProperties => Models.BenefitLicenseKeyExpirationProperties))),
  activations: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.BenefitLicenseKeyActivationCreateProperties => Models.BenefitLicenseKeyActivationCreateProperties))),
  limit_usage: Schema.optional(Schema.NullOr(Schema.Number)),
})
export type BenefitLicenseKeysCreateProperties = typeof BenefitLicenseKeysCreateProperties.Type
