import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutSwishPaymentMethodOptions = Schema.Struct({
  reference: Schema.NullOr(Schema.String)
})
export type CheckoutSwishPaymentMethodOptions = typeof CheckoutSwishPaymentMethodOptions.Type
