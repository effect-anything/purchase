import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const OrderStatus = Schema.Literal("pending", "paid", "refunded", "partially_refunded", "void")
export type OrderStatus = typeof OrderStatus.Type
