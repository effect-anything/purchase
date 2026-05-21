import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionBusinessName = Schema.Struct({
  enabled: Schema.Boolean,
  optional: Schema.Boolean
})
export type PaymentPagesCheckoutSessionBusinessName = typeof PaymentPagesCheckoutSessionBusinessName.Type
