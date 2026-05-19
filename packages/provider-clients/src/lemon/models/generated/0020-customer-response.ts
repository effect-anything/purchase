import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerResponse = Schema.Struct({
  data: Schema.suspend(() => Models.CustomerResource),
  links: Schema.optional(Schema.suspend(() => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend(() => Models.JsonApiMeta)),
})
export type CustomerResponse = typeof CustomerResponse.Type
