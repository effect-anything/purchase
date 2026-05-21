import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BenefitLicenseKeyActivationProperties = Schema.Struct({
  limit: Schema.Number,
  enable_customer_admin: Schema.Boolean
})
export type BenefitLicenseKeyActivationProperties = typeof BenefitLicenseKeyActivationProperties.Type
