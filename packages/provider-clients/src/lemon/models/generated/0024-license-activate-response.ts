import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LicenseActivateResponse = Schema.Struct({
  activated: Schema.Boolean,
  error: Schema.optional(Schema.NullOr(Schema.String)),
  license_key: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  instance: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  meta: Schema.suspend(
    (): Schema.Schema<Models.LicenseResponseMeta, any, any> =>
      Models.LicenseResponseMeta as Schema.Schema<Models.LicenseResponseMeta, any, any>
  )
})
export type LicenseActivateResponse = typeof LicenseActivateResponse.Type
