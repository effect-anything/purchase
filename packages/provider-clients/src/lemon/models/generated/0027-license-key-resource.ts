import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const LicenseKeyResource = Schema.Struct({
  type: Schema.Literal("license-keys"),
  id: Schema.String,
  attributes: Schema.suspend(() => Models.LicenseKeyAttributes),
  relationships: Schema.optional(Schema.suspend(() => Models.JsonApiRelationships)),
  links: Schema.optional(Schema.suspend(() => Models.JsonApiLinks)),
})
export type LicenseKeyResource = typeof LicenseKeyResource.Type
