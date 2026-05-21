import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentFlowsPaymentIntentAsyncWorkflowsResourceInputs = Schema.Struct({
  tax: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentFlowsPaymentIntentAsyncWorkflowsResourceInputsResourceTax, any, any> =>
        Models.PaymentFlowsPaymentIntentAsyncWorkflowsResourceInputsResourceTax as Schema.Schema<
          Models.PaymentFlowsPaymentIntentAsyncWorkflowsResourceInputsResourceTax,
          any,
          any
        >
    )
  )
})
export type PaymentFlowsPaymentIntentAsyncWorkflowsResourceInputs =
  typeof PaymentFlowsPaymentIntentAsyncWorkflowsResourceInputs.Type
