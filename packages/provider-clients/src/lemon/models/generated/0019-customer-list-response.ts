import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerListResponse = Schema.Struct({
  data: Schema.Array(Schema.suspend((): Schema.Schema<Models.CustomerResource> => Models.CustomerResource)),
  links: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiLinks> => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiMeta> => Models.JsonApiMeta))
})
export type CustomerListResponse = typeof CustomerListResponse.Type
