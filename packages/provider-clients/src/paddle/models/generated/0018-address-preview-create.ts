import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AddressPreviewCreate = Schema.Struct({
  postal_code: Schema.optional(Schema.NullOr(Schema.String)),
  country_code: Schema.suspend((): Schema.Schema<Models.CountryCode> => Models.CountryCode)
})
export type AddressPreviewCreate = typeof AddressPreviewCreate.Type
