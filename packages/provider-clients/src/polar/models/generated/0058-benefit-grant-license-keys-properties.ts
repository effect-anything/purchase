import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BenefitGrantLicenseKeysProperties = Schema.Struct({
  user_provided_key: Schema.optional(Schema.String),
  license_key_id: Schema.optional(Schema.String),
  display_key: Schema.optional(Schema.String)
})
export type BenefitGrantLicenseKeysProperties = typeof BenefitGrantLicenseKeysProperties.Type
