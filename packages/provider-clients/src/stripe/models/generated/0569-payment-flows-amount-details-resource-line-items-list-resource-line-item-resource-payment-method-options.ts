import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentFlowsAmountDetailsResourceLineItemsListResourceLineItemResourcePaymentMethodOptions = Schema.Struct(
  {
    card: Schema.optional(
      Schema.suspend(
        (): Schema.Schema<
          Models.PaymentFlowsPrivatePaymentMethodsCardPaymentIntentAmountDetailsLineItemPaymentMethodOptions,
          any,
          any
        > =>
          Models.PaymentFlowsPrivatePaymentMethodsCardPaymentIntentAmountDetailsLineItemPaymentMethodOptions as Schema.Schema<
            Models.PaymentFlowsPrivatePaymentMethodsCardPaymentIntentAmountDetailsLineItemPaymentMethodOptions,
            any,
            any
          >
      )
    ),
    card_present: Schema.optional(
      Schema.suspend(
        (): Schema.Schema<
          Models.PaymentFlowsPrivatePaymentMethodsCardPresentAmountDetailsLineItemPaymentMethodOptions,
          any,
          any
        > =>
          Models.PaymentFlowsPrivatePaymentMethodsCardPresentAmountDetailsLineItemPaymentMethodOptions as Schema.Schema<
            Models.PaymentFlowsPrivatePaymentMethodsCardPresentAmountDetailsLineItemPaymentMethodOptions,
            any,
            any
          >
      )
    ),
    klarna: Schema.optional(
      Schema.suspend(
        (): Schema.Schema<
          Models.PaymentFlowsPrivatePaymentMethodsKlarnaPaymentIntentAmountDetailsLineItemPaymentMethodOptions,
          any,
          any
        > =>
          Models.PaymentFlowsPrivatePaymentMethodsKlarnaPaymentIntentAmountDetailsLineItemPaymentMethodOptions as Schema.Schema<
            Models.PaymentFlowsPrivatePaymentMethodsKlarnaPaymentIntentAmountDetailsLineItemPaymentMethodOptions,
            any,
            any
          >
      )
    ),
    paypal: Schema.optional(
      Schema.suspend(
        (): Schema.Schema<
          Models.PaymentFlowsPrivatePaymentMethodsPaypalAmountDetailsLineItemPaymentMethodOptions,
          any,
          any
        > =>
          Models.PaymentFlowsPrivatePaymentMethodsPaypalAmountDetailsLineItemPaymentMethodOptions as Schema.Schema<
            Models.PaymentFlowsPrivatePaymentMethodsPaypalAmountDetailsLineItemPaymentMethodOptions,
            any,
            any
          >
      )
    )
  }
)
export type PaymentFlowsAmountDetailsResourceLineItemsListResourceLineItemResourcePaymentMethodOptions =
  typeof PaymentFlowsAmountDetailsResourceLineItemsListResourceLineItemResourcePaymentMethodOptions.Type
