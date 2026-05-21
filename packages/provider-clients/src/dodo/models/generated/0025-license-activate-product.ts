import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LicenseActivateProduct = Schema.Struct({
  product_id: Schema.String,
  name: Schema.optional(Schema.NullOr(Schema.String))
})
export type LicenseActivateProduct = typeof LicenseActivateProduct.Type
