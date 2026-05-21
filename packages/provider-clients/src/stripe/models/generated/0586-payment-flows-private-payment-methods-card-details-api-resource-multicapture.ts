import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceMulticapture = Schema.Struct({
  status: Schema.Literal("available", "unavailable")
})
export type PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceMulticapture =
  typeof PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceMulticapture.Type
