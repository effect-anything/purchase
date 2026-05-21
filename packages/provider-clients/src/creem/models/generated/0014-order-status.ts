import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const OrderStatus = Schema.Literal("pending", "paid")
export type OrderStatus = typeof OrderStatus.Type
