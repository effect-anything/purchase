import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BenefitLicenseKeyActivationCreateProperties = Schema.Struct({
  limit: Schema.Number,
  enable_customer_admin: Schema.Boolean
})
export type BenefitLicenseKeyActivationCreateProperties = typeof BenefitLicenseKeyActivationCreateProperties.Type
