import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsUpi = Schema.Struct({
  vpa: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsUpi = typeof PaymentMethodDetailsUpi.Type
