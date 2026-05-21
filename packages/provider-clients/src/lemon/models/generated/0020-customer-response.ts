import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerResponse = Schema.Struct({
  data: Schema.suspend((): Schema.Schema<Models.CustomerResource> => Models.CustomerResource),
  links: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiLinks> => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiMeta> => Models.JsonApiMeta))
})
export type CustomerResponse = typeof CustomerResponse.Type
