import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentLinksResourceOptionalItem = Schema.Struct({
  adjustable_quantity: Schema.NullOr(Schema.suspend((): typeof Models.PaymentLinksResourceOptionalItemAdjustableQuantity => Models.PaymentLinksResourceOptionalItemAdjustableQuantity)),
  price: Schema.String,
  quantity: Schema.Number,
})
export type PaymentLinksResourceOptionalItem = typeof PaymentLinksResourceOptionalItem.Type
