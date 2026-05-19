import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentFlowsAmountDetailsClientResourceTip = Schema.Struct({
  amount: Schema.optional(Schema.Number),
})
export type PaymentFlowsAmountDetailsClientResourceTip = typeof PaymentFlowsAmountDetailsClientResourceTip.Type
