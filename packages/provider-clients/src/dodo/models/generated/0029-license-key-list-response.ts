import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const LicenseKeyListResponse = Schema.Struct({
  items: Schema.Array(Schema.suspend(() => Models.LicenseKey)),
  total: Schema.optional(Schema.Number),
})
export type LicenseKeyListResponse = typeof LicenseKeyListResponse.Type
