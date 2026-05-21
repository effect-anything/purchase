import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutCreateData = Schema.Struct({
  type: Schema.Literal("checkouts"),
  attributes: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutCreateAttributes, any, any> =>
        Models.CheckoutCreateAttributes as Schema.Schema<Models.CheckoutCreateAttributes, any, any>
    )
  ),
  relationships: Schema.suspend(
    (): Schema.Schema<Models.CheckoutCreateRelationships, any, any> =>
      Models.CheckoutCreateRelationships as Schema.Schema<Models.CheckoutCreateRelationships, any, any>
  )
})
export type CheckoutCreateData = typeof CheckoutCreateData.Type
