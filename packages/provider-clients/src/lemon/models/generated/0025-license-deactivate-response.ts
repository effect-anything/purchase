import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const LicenseDeactivateResponse = Schema.Struct({
  deactivated: Schema.Boolean,
  error: Schema.optional(Schema.NullOr(Schema.String)),
  license_key: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  meta: Schema.suspend(() => Models.LicenseResponseMeta),
})
export type LicenseDeactivateResponse = typeof LicenseDeactivateResponse.Type
