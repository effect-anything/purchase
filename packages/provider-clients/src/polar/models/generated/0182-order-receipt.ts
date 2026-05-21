import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const OrderReceipt = Schema.Struct({
  url: Schema.String
})
export type OrderReceipt = typeof OrderReceipt.Type
