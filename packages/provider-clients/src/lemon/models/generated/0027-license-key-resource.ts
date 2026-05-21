import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LicenseKeyResource = Schema.Struct({
  type: Schema.Literal("license-keys"),
  id: Schema.String,
  attributes: Schema.suspend(
    (): Schema.Schema<Models.LicenseKeyAttributes, any, any> =>
      Models.LicenseKeyAttributes as Schema.Schema<Models.LicenseKeyAttributes, any, any>
  ),
  relationships: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.JsonApiRelationships, any, any> =>
        Models.JsonApiRelationships as Schema.Schema<Models.JsonApiRelationships, any, any>
    )
  ),
  links: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.JsonApiLinks, any, any> =>
        Models.JsonApiLinks as Schema.Schema<Models.JsonApiLinks, any, any>
    )
  )
})
export type LicenseKeyResource = typeof LicenseKeyResource.Type
