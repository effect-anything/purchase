import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionOptionalItemAdjustableQuantity = Schema.Struct({
  enabled: Schema.Boolean,
  maximum: Schema.NullOr(Schema.Number),
  minimum: Schema.NullOr(Schema.Number)
})
export type PaymentPagesCheckoutSessionOptionalItemAdjustableQuantity =
  typeof PaymentPagesCheckoutSessionOptionalItemAdjustableQuantity.Type
