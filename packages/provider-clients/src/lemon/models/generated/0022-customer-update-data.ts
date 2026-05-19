import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerUpdateData = Schema.Struct({
  type: Schema.Literal("customers"),
  id: Schema.String,
  attributes: Schema.suspend(() => Models.CustomerUpdateAttributes),
})
export type CustomerUpdateData = typeof CustomerUpdateData.Type
