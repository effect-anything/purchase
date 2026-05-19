import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const OrderRefundAttributes = Schema.Struct({
  amount: Schema.Number,
})
export type OrderRefundAttributes = typeof OrderRefundAttributes.Type
