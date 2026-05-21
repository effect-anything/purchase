import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LicenseKeyUpdateData = Schema.Struct({
  type: Schema.Literal("license-keys"),
  id: Schema.String,
  attributes: Schema.suspend(
    (): Schema.Schema<Models.LicenseKeyUpdateAttributes, any, any> =>
      Models.LicenseKeyUpdateAttributes as Schema.Schema<Models.LicenseKeyUpdateAttributes, any, any>
  )
})
export type LicenseKeyUpdateData = typeof LicenseKeyUpdateData.Type
