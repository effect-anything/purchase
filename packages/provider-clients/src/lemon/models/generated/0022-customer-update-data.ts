import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerUpdateData = Schema.Struct({
  type: Schema.Literal("customers"),
  id: Schema.String,
  attributes: Schema.suspend(
    (): Schema.Schema<Models.CustomerUpdateAttributes, any, any> =>
      Models.CustomerUpdateAttributes as Schema.Schema<Models.CustomerUpdateAttributes, any, any>
  )
})
export type CustomerUpdateData = typeof CustomerUpdateData.Type
