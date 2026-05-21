import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutSessionProductItem = Schema.Struct({
  product_id: Schema.String,
  quantity: Schema.Number
})
export type CheckoutSessionProductItem = typeof CheckoutSessionProductItem.Type
