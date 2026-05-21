import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentListResponse = Schema.Struct({
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.Payment, any, any> => Models.Payment as Schema.Schema<Models.Payment, any, any>
    )
  ),
  total: Schema.optional(Schema.Number)
})
export type PaymentListResponse = typeof PaymentListResponse.Type
