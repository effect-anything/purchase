import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentFlowsPaymentIntentAsyncWorkflows = Schema.Struct({
  inputs: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentFlowsPaymentIntentAsyncWorkflowsResourceInputs, any, any> =>
        Models.PaymentFlowsPaymentIntentAsyncWorkflowsResourceInputs as Schema.Schema<
          Models.PaymentFlowsPaymentIntentAsyncWorkflowsResourceInputs,
          any,
          any
        >
    )
  )
})
export type PaymentFlowsPaymentIntentAsyncWorkflows = typeof PaymentFlowsPaymentIntentAsyncWorkflows.Type
