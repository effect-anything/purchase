import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerListResponse = Schema.Struct({
  items: Schema.Array(Schema.suspend(() => Models.Customer)),
  total: Schema.optional(Schema.Number),
})
export type CustomerListResponse = typeof CustomerListResponse.Type
