import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceEnterpriseFeaturesOvercaptureOvercapture =
  Schema.Struct({
    maximum_amount_capturable: Schema.Number,
    status: Schema.Literal("available", "unavailable")
  })
export type PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceEnterpriseFeaturesOvercaptureOvercapture =
  typeof PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceEnterpriseFeaturesOvercaptureOvercapture.Type
