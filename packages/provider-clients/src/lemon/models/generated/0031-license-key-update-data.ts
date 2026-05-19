import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const LicenseKeyUpdateData = Schema.Struct({
  type: Schema.Literal("license-keys"),
  id: Schema.String,
  attributes: Schema.suspend(() => Models.LicenseKeyUpdateAttributes),
})
export type LicenseKeyUpdateData = typeof LicenseKeyUpdateData.Type
