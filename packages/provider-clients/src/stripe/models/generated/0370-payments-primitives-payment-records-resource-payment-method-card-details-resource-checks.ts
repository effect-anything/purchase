import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceChecks = Schema.Struct({
  address_line1_check: Schema.NullOr(Schema.Literal("fail", "pass", "unavailable", "unchecked")),
  address_postal_code_check: Schema.NullOr(Schema.Literal("fail", "pass", "unavailable", "unchecked")),
  cvc_check: Schema.NullOr(Schema.Literal("fail", "pass", "unavailable", "unchecked"))
})
export type PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceChecks =
  typeof PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceChecks.Type
