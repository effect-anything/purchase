import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerListResponse = Schema.Struct({
  data: Schema.Array(Schema.suspend(() => Models.CustomerResource)),
  links: Schema.optional(Schema.suspend(() => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend(() => Models.JsonApiMeta)),
})
export type CustomerListResponse = typeof CustomerListResponse.Type
