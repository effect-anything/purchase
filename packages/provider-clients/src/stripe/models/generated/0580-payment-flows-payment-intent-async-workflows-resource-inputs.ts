import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentFlowsPaymentIntentAsyncWorkflowsResourceInputs = Schema.Struct({
  tax: Schema.optional(Schema.suspend((): typeof Models.PaymentFlowsPaymentIntentAsyncWorkflowsResourceInputsResourceTax => Models.PaymentFlowsPaymentIntentAsyncWorkflowsResourceInputsResourceTax)),
})
export type PaymentFlowsPaymentIntentAsyncWorkflowsResourceInputs = typeof PaymentFlowsPaymentIntentAsyncWorkflowsResourceInputs.Type
