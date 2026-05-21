import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LicenseKeyResource = Schema.Struct({
  type: Schema.Literal("license-keys"),
  id: Schema.String,
  attributes: Schema.suspend((): Schema.Schema<Models.LicenseKeyAttributes> => Models.LicenseKeyAttributes),
  relationships: Schema.optional(
    Schema.suspend((): Schema.Schema<Models.JsonApiRelationships> => Models.JsonApiRelationships)
  ),
  links: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiLinks> => Models.JsonApiLinks))
})
export type LicenseKeyResource = typeof LicenseKeyResource.Type
