import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsPaymentRecordPromptpay = Schema.Struct({
  reference: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsPaymentRecordPromptpay = typeof PaymentMethodDetailsPaymentRecordPromptpay.Type
