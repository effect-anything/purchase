import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentFlowsPrivatePaymentMethodsCardPresentCommonWallet = Schema.Struct({
  type: Schema.Literal("apple_pay", "google_pay", "samsung_pay", "unknown"),
})
export type PaymentFlowsPrivatePaymentMethodsCardPresentCommonWallet = typeof PaymentFlowsPrivatePaymentMethodsCardPresentCommonWallet.Type
