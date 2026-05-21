import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type PaymentIntent = {
  readonly amount: number
  readonly amount_capturable: number
  readonly amount_details?: Models.PaymentFlowsAmountDetails
  readonly amount_received: number
  readonly application: string | Models.Application | null
  readonly application_fee_amount: number | null
  readonly automatic_payment_methods: Models.PaymentFlowsAutomaticPaymentMethodsPaymentIntent | null
  readonly canceled_at: number | null
  readonly cancellation_reason:
    | "abandoned"
    | "automatic"
    | "duplicate"
    | "expired"
    | "failed_invoice"
    | "fraudulent"
    | "requested_by_customer"
    | "void_invoice"
    | null
  readonly capture_method: "automatic" | "automatic_async" | "manual"
  readonly client_secret: string | null
  readonly confirmation_method: "automatic" | "manual"
  readonly created: number
  readonly currency: string
  readonly customer: string | Models.Customer | Models.DeletedCustomer | null
  readonly customer_account: string | null
  readonly description: string | null
  readonly excluded_payment_method_types: ReadonlyArray<
    | "acss_debit"
    | "affirm"
    | "afterpay_clearpay"
    | "alipay"
    | "alma"
    | "amazon_pay"
    | "au_becs_debit"
    | "bacs_debit"
    | "bancontact"
    | "billie"
    | "blik"
    | "boleto"
    | "card"
    | "cashapp"
    | "crypto"
    | "customer_balance"
    | "eps"
    | "fpx"
    | "giropay"
    | "grabpay"
    | "ideal"
    | "kakao_pay"
    | "klarna"
    | "konbini"
    | "kr_card"
    | "mb_way"
    | "mobilepay"
    | "multibanco"
    | "naver_pay"
    | "nz_bank_account"
    | "oxxo"
    | "p24"
    | "pay_by_bank"
    | "payco"
    | "paynow"
    | "paypal"
    | "payto"
    | "pix"
    | "promptpay"
    | "revolut_pay"
    | "samsung_pay"
    | "satispay"
    | "sepa_debit"
    | "sofort"
    | "sunbit"
    | "swish"
    | "twint"
    | "upi"
    | "us_bank_account"
    | "wechat_pay"
    | "zip"
  > | null
  readonly hooks?: Models.PaymentFlowsPaymentIntentAsyncWorkflows
  readonly id: string
  readonly last_payment_error: Models.ApiErrors | null
  readonly latest_charge: string | Models.Charge | null
  readonly livemode: boolean
  readonly managed_payments: Models.SmorResourceManagedPayments | null
  readonly metadata: Readonly<Record<string, string>>
  readonly next_action: Models.PaymentIntentNextAction | null
  readonly object: "payment_intent"
  readonly on_behalf_of: string | Models.Account | null
  readonly payment_details?: Models.PaymentFlowsPaymentDetails
  readonly payment_method: string | Models.PaymentMethod | null
  readonly payment_method_configuration_details: Models.PaymentMethodConfigBizPaymentMethodConfigurationDetails | null
  readonly payment_method_options: Models.PaymentIntentPaymentMethodOptions | null
  readonly payment_method_types: ReadonlyArray<string>
  readonly presentment_details?: Models.PaymentFlowsPaymentIntentPresentmentDetails
  readonly processing: Models.PaymentIntentProcessing2 | null
  readonly receipt_email: string | null
  readonly review: string | Models.Review | null
  readonly setup_future_usage: "off_session" | "on_session" | null
  readonly shipping: Models.Shipping | null
  readonly source: string | Models.PaymentSource | Models.DeletedPaymentSource | null
  readonly statement_descriptor: string | null
  readonly statement_descriptor_suffix: string | null
  readonly status:
    | "canceled"
    | "processing"
    | "requires_action"
    | "requires_capture"
    | "requires_confirmation"
    | "requires_payment_method"
    | "succeeded"
  readonly transfer_data?: Models.TransferData | null
  readonly transfer_group: string | null
}

export const PaymentIntent = Schema.Struct({
  amount: Schema.Number,
  amount_capturable: Schema.Number,
  amount_details: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentFlowsAmountDetails, any, any> =>
        Models.PaymentFlowsAmountDetails as Schema.Schema<Models.PaymentFlowsAmountDetails, any, any>
    )
  ),
  amount_received: Schema.Number,
  application: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Application, any, any> =>
          Models.Application as Schema.Schema<Models.Application, any, any>
      )
    )
  ),
  application_fee_amount: Schema.NullOr(Schema.Number),
  automatic_payment_methods: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentFlowsAutomaticPaymentMethodsPaymentIntent, any, any> =>
        Models.PaymentFlowsAutomaticPaymentMethodsPaymentIntent as Schema.Schema<
          Models.PaymentFlowsAutomaticPaymentMethodsPaymentIntent,
          any,
          any
        >
    )
  ),
  canceled_at: Schema.NullOr(Schema.Number),
  cancellation_reason: Schema.NullOr(
    Schema.Literal(
      "abandoned",
      "automatic",
      "duplicate",
      "expired",
      "failed_invoice",
      "fraudulent",
      "requested_by_customer",
      "void_invoice"
    )
  ),
  capture_method: Schema.Literal("automatic", "automatic_async", "manual"),
  client_secret: Schema.NullOr(Schema.String),
  confirmation_method: Schema.Literal("automatic", "manual"),
  created: Schema.Number,
  currency: Schema.String,
  customer: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Customer, any, any> => Models.Customer as Schema.Schema<Models.Customer, any, any>
      ),
      Schema.suspend(
        (): Schema.Schema<Models.DeletedCustomer, any, any> =>
          Models.DeletedCustomer as Schema.Schema<Models.DeletedCustomer, any, any>
      )
    )
  ),
  customer_account: Schema.NullOr(Schema.String),
  description: Schema.NullOr(Schema.String),
  excluded_payment_method_types: Schema.NullOr(
    Schema.Array(
      Schema.Literal(
        "acss_debit",
        "affirm",
        "afterpay_clearpay",
        "alipay",
        "alma",
        "amazon_pay",
        "au_becs_debit",
        "bacs_debit",
        "bancontact",
        "billie",
        "blik",
        "boleto",
        "card",
        "cashapp",
        "crypto",
        "customer_balance",
        "eps",
        "fpx",
        "giropay",
        "grabpay",
        "ideal",
        "kakao_pay",
        "klarna",
        "konbini",
        "kr_card",
        "mb_way",
        "mobilepay",
        "multibanco",
        "naver_pay",
        "nz_bank_account",
        "oxxo",
        "p24",
        "pay_by_bank",
        "payco",
        "paynow",
        "paypal",
        "payto",
        "pix",
        "promptpay",
        "revolut_pay",
        "samsung_pay",
        "satispay",
        "sepa_debit",
        "sofort",
        "sunbit",
        "swish",
        "twint",
        "upi",
        "us_bank_account",
        "wechat_pay",
        "zip"
      )
    )
  ),
  hooks: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentFlowsPaymentIntentAsyncWorkflows, any, any> =>
        Models.PaymentFlowsPaymentIntentAsyncWorkflows as Schema.Schema<
          Models.PaymentFlowsPaymentIntentAsyncWorkflows,
          any,
          any
        >
    )
  ),
  id: Schema.String,
  last_payment_error: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ApiErrors, any, any> => Models.ApiErrors as Schema.Schema<Models.ApiErrors, any, any>
    )
  ),
  latest_charge: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Charge, any, any> => Models.Charge as Schema.Schema<Models.Charge, any, any>
      )
    )
  ),
  livemode: Schema.Boolean,
  managed_payments: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SmorResourceManagedPayments, any, any> =>
        Models.SmorResourceManagedPayments as Schema.Schema<Models.SmorResourceManagedPayments, any, any>
    )
  ),
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  next_action: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentNextAction, any, any> =>
        Models.PaymentIntentNextAction as Schema.Schema<Models.PaymentIntentNextAction, any, any>
    )
  ),
  object: Schema.Literal("payment_intent"),
  on_behalf_of: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Account, any, any> => Models.Account as Schema.Schema<Models.Account, any, any>
      )
    )
  ),
  payment_details: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentFlowsPaymentDetails, any, any> =>
        Models.PaymentFlowsPaymentDetails as Schema.Schema<Models.PaymentFlowsPaymentDetails, any, any>
    )
  ),
  payment_method: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.PaymentMethod, any, any> =>
          Models.PaymentMethod as Schema.Schema<Models.PaymentMethod, any, any>
      )
    )
  ),
  payment_method_configuration_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodConfigBizPaymentMethodConfigurationDetails, any, any> =>
        Models.PaymentMethodConfigBizPaymentMethodConfigurationDetails as Schema.Schema<
          Models.PaymentMethodConfigBizPaymentMethodConfigurationDetails,
          any,
          any
        >
    )
  ),
  payment_method_options: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentPaymentMethodOptions, any, any> =>
        Models.PaymentIntentPaymentMethodOptions as Schema.Schema<Models.PaymentIntentPaymentMethodOptions, any, any>
    )
  ),
  payment_method_types: Schema.Array(Schema.String),
  presentment_details: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentFlowsPaymentIntentPresentmentDetails, any, any> =>
        Models.PaymentFlowsPaymentIntentPresentmentDetails as Schema.Schema<
          Models.PaymentFlowsPaymentIntentPresentmentDetails,
          any,
          any
        >
    )
  ),
  processing: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentProcessing2, any, any> =>
        Models.PaymentIntentProcessing2 as Schema.Schema<Models.PaymentIntentProcessing2, any, any>
    )
  ),
  receipt_email: Schema.NullOr(Schema.String),
  review: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Review, any, any> => Models.Review as Schema.Schema<Models.Review, any, any>
      )
    )
  ),
  setup_future_usage: Schema.NullOr(Schema.Literal("off_session", "on_session")),
  shipping: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Shipping, any, any> => Models.Shipping as Schema.Schema<Models.Shipping, any, any>
    )
  ),
  source: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.PaymentSource, any, any> =>
          Models.PaymentSource as Schema.Schema<Models.PaymentSource, any, any>
      ),
      Schema.suspend(
        (): Schema.Schema<Models.DeletedPaymentSource, any, any> =>
          Models.DeletedPaymentSource as Schema.Schema<Models.DeletedPaymentSource, any, any>
      )
    )
  ),
  statement_descriptor: Schema.NullOr(Schema.String),
  statement_descriptor_suffix: Schema.NullOr(Schema.String),
  status: Schema.Literal(
    "canceled",
    "processing",
    "requires_action",
    "requires_capture",
    "requires_confirmation",
    "requires_payment_method",
    "succeeded"
  ),
  transfer_data: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.TransferData, any, any> =>
          Models.TransferData as Schema.Schema<Models.TransferData, any, any>
      )
    )
  ),
  transfer_group: Schema.NullOr(Schema.String)
})
