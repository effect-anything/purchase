import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const LicenseKeyListResponse = Schema.Struct({
  data: Schema.Array(Schema.suspend(() => Models.LicenseKeyResource)),
  links: Schema.optional(Schema.suspend(() => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend(() => Models.JsonApiMeta)),
})
export type LicenseKeyListResponse = typeof LicenseKeyListResponse.Type
