import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionOptionalItem = Schema.Struct({
  adjustable_quantity: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionOptionalItemAdjustableQuantity, any, any> =>
        Models.PaymentPagesCheckoutSessionOptionalItemAdjustableQuantity as Schema.Schema<
          Models.PaymentPagesCheckoutSessionOptionalItemAdjustableQuantity,
          any,
          any
        >
    )
  ),
  price: Schema.String,
  quantity: Schema.Number
})
export type PaymentPagesCheckoutSessionOptionalItem = typeof PaymentPagesCheckoutSessionOptionalItem.Type
