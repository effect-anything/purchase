import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentFlowsAmountDetails = Schema.Struct({
  discount_amount: Schema.optional(Schema.Number),
  error: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentFlowsAmountDetailsResourceError, any, any> =>
        Models.PaymentFlowsAmountDetailsResourceError as Schema.Schema<
          Models.PaymentFlowsAmountDetailsResourceError,
          any,
          any
        >
    )
  ),
  line_items: Schema.optional(
    Schema.Struct({
      data: Schema.Array(
        Schema.suspend(
          (): Schema.Schema<Models.PaymentIntentAmountDetailsLineItem, any, any> =>
            Models.PaymentIntentAmountDetailsLineItem as Schema.Schema<
              Models.PaymentIntentAmountDetailsLineItem,
              any,
              any
            >
        )
      ),
      has_more: Schema.Boolean,
      object: Schema.Literal("list"),
      url: Schema.String
    })
  ),
  shipping: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentFlowsAmountDetailsResourceShipping, any, any> =>
        Models.PaymentFlowsAmountDetailsResourceShipping as Schema.Schema<
          Models.PaymentFlowsAmountDetailsResourceShipping,
          any,
          any
        >
    )
  ),
  tax: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentFlowsAmountDetailsResourceTax, any, any> =>
        Models.PaymentFlowsAmountDetailsResourceTax as Schema.Schema<
          Models.PaymentFlowsAmountDetailsResourceTax,
          any,
          any
        >
    )
  ),
  tip: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentFlowsAmountDetailsClientResourceTip, any, any> =>
        Models.PaymentFlowsAmountDetailsClientResourceTip as Schema.Schema<
          Models.PaymentFlowsAmountDetailsClientResourceTip,
          any,
          any
        >
    )
  )
})
export type PaymentFlowsAmountDetails = typeof PaymentFlowsAmountDetails.Type
