import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BenefitLicenseKeyExpirationProperties = Schema.Struct({
  ttl: Schema.Number,
  timeframe: Schema.Literal("year", "month", "day")
})
export type BenefitLicenseKeyExpirationProperties = typeof BenefitLicenseKeyExpirationProperties.Type
