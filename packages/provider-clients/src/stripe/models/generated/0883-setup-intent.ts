import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type SetupIntent = {
  readonly application: string | Models.Application | null
  readonly attach_to_self?: boolean
  readonly automatic_payment_methods: Models.PaymentFlowsAutomaticPaymentMethodsSetupIntent | null
  readonly cancellation_reason: "abandoned" | "duplicate" | "requested_by_customer" | null
  readonly client_secret: string | null
  readonly created: number
  readonly customer: string | Models.Customer | Models.DeletedCustomer | null
  readonly customer_account?: string | null
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
  readonly flow_directions?: ReadonlyArray<"inbound" | "outbound"> | null
  readonly id: string
  readonly last_setup_error: Models.ApiErrors | null
  readonly latest_attempt: string | Models.SetupAttempt | null
  readonly livemode: boolean
  readonly managed_payments?: Models.SmorResourceManagedPayments | null
  readonly mandate: string | Models.Mandate | null
  readonly metadata: Readonly<Record<string, string>> | null
  readonly next_action: Models.SetupIntentNextAction | null
  readonly object: "setup_intent"
  readonly on_behalf_of: string | Models.Account | null
  readonly payment_method: string | Models.PaymentMethod | null
  readonly payment_method_configuration_details: Models.PaymentMethodConfigBizPaymentMethodConfigurationDetails | null
  readonly payment_method_options: Models.SetupIntentPaymentMethodOptions | null
  readonly payment_method_types: ReadonlyArray<string>
  readonly single_use_mandate: string | Models.Mandate | null
  readonly status:
    | "canceled"
    | "processing"
    | "requires_action"
    | "requires_confirmation"
    | "requires_payment_method"
    | "succeeded"
  readonly usage: string
}

export const SetupIntent = Schema.Struct({
  application: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Application, any, any> =>
          Models.Application as Schema.Schema<Models.Application, any, any>
      )
    )
  ),
  attach_to_self: Schema.optional(Schema.Boolean),
  automatic_payment_methods: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentFlowsAutomaticPaymentMethodsSetupIntent, any, any> =>
        Models.PaymentFlowsAutomaticPaymentMethodsSetupIntent as Schema.Schema<
          Models.PaymentFlowsAutomaticPaymentMethodsSetupIntent,
          any,
          any
        >
    )
  ),
  cancellation_reason: Schema.NullOr(Schema.Literal("abandoned", "duplicate", "requested_by_customer")),
  client_secret: Schema.NullOr(Schema.String),
  created: Schema.Number,
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
  customer_account: Schema.optional(Schema.NullOr(Schema.String)),
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
  flow_directions: Schema.optional(Schema.NullOr(Schema.Array(Schema.Literal("inbound", "outbound")))),
  id: Schema.String,
  last_setup_error: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ApiErrors, any, any> => Models.ApiErrors as Schema.Schema<Models.ApiErrors, any, any>
    )
  ),
  latest_attempt: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.SetupAttempt, any, any> =>
          Models.SetupAttempt as Schema.Schema<Models.SetupAttempt, any, any>
      )
    )
  ),
  livemode: Schema.Boolean,
  managed_payments: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.SmorResourceManagedPayments, any, any> =>
          Models.SmorResourceManagedPayments as Schema.Schema<Models.SmorResourceManagedPayments, any, any>
      )
    )
  ),
  mandate: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Mandate, any, any> => Models.Mandate as Schema.Schema<Models.Mandate, any, any>
      )
    )
  ),
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  next_action: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SetupIntentNextAction, any, any> =>
        Models.SetupIntentNextAction as Schema.Schema<Models.SetupIntentNextAction, any, any>
    )
  ),
  object: Schema.Literal("setup_intent"),
  on_behalf_of: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Account, any, any> => Models.Account as Schema.Schema<Models.Account, any, any>
      )
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
      (): Schema.Schema<Models.SetupIntentPaymentMethodOptions, any, any> =>
        Models.SetupIntentPaymentMethodOptions as Schema.Schema<Models.SetupIntentPaymentMethodOptions, any, any>
    )
  ),
  payment_method_types: Schema.Array(Schema.String),
  single_use_mandate: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Mandate, any, any> => Models.Mandate as Schema.Schema<Models.Mandate, any, any>
      )
    )
  ),
  status: Schema.Literal(
    "canceled",
    "processing",
    "requires_action",
    "requires_confirmation",
    "requires_payment_method",
    "succeeded"
  ),
  usage: Schema.String
})
