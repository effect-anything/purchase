import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const OrderRefundData = Schema.Struct({
  type: Schema.Literal("orders"),
  attributes: Schema.suspend(() => Models.OrderRefundAttributes),
})
export type OrderRefundData = typeof OrderRefundData.Type
