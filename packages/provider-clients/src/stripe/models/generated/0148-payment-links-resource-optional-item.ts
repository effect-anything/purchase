import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentLinksResourceOptionalItem = Schema.Struct({
  adjustable_quantity: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentLinksResourceOptionalItemAdjustableQuantity, any, any> =>
        Models.PaymentLinksResourceOptionalItemAdjustableQuantity as Schema.Schema<
          Models.PaymentLinksResourceOptionalItemAdjustableQuantity,
          any,
          any
        >
    )
  ),
  price: Schema.String,
  quantity: Schema.Number
})
export type PaymentLinksResourceOptionalItem = typeof PaymentLinksResourceOptionalItem.Type
