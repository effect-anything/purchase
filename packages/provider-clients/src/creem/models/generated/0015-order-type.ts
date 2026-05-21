import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const OrderType = Schema.Literal("recurring", "onetime")
export type OrderType = typeof OrderType.Type
