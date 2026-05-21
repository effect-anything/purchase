import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const OrderInvoice = Schema.Struct({
  url: Schema.String
})
export type OrderInvoice = typeof OrderInvoice.Type
