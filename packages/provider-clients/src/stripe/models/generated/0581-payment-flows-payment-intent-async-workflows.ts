import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentFlowsPaymentIntentAsyncWorkflows = Schema.Struct({
  inputs: Schema.optional(Schema.suspend((): typeof Models.PaymentFlowsPaymentIntentAsyncWorkflowsResourceInputs => Models.PaymentFlowsPaymentIntentAsyncWorkflowsResourceInputs)),
})
export type PaymentFlowsPaymentIntentAsyncWorkflows = typeof PaymentFlowsPaymentIntentAsyncWorkflows.Type
