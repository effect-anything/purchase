import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LicenseValidateResponse = Schema.Struct({
  valid: Schema.Boolean,
  error: Schema.optional(Schema.NullOr(Schema.String)),
  license_key: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  instance: Schema.optional(Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.Unknown }))),
  meta: Schema.suspend((): Schema.Schema<Models.LicenseResponseMeta> => Models.LicenseResponseMeta)
})
export type LicenseValidateResponse = typeof LicenseValidateResponse.Type
