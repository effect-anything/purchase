import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LicenseKeyListResponse = Schema.Struct({
  data: Schema.Array(Schema.suspend((): Schema.Schema<Models.LicenseKeyResource> => Models.LicenseKeyResource)),
  links: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiLinks> => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiMeta> => Models.JsonApiMeta))
})
export type LicenseKeyListResponse = typeof LicenseKeyListResponse.Type
