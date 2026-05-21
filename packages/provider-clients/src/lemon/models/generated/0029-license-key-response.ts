import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LicenseKeyResponse = Schema.Struct({
  data: Schema.suspend((): Schema.Schema<Models.LicenseKeyResource> => Models.LicenseKeyResource),
  links: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiLinks> => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiMeta> => Models.JsonApiMeta))
})
export type LicenseKeyResponse = typeof LicenseKeyResponse.Type
