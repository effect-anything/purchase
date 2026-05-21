import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const OrderRefundData = Schema.Struct({
  type: Schema.Literal("orders"),
  attributes: Schema.suspend(
    (): Schema.Schema<Models.OrderRefundAttributes, any, any> =>
      Models.OrderRefundAttributes as Schema.Schema<Models.OrderRefundAttributes, any, any>
  )
})
export type OrderRefundData = typeof OrderRefundData.Type
