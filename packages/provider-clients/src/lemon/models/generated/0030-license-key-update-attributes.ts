import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LicenseKeyUpdateAttributes = Schema.Struct({
  activation_limit: Schema.optional(Schema.NullOr(Schema.Number)),
  expires_at: Schema.optional(Schema.NullOr(Schema.String)),
  disabled: Schema.optional(Schema.Boolean)
})
export type LicenseKeyUpdateAttributes = typeof LicenseKeyUpdateAttributes.Type
