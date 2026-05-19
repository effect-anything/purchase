import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SetupIntent = Schema.Struct({
  application: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Application => Models.Application))),
  attach_to_self: Schema.optional(Schema.Boolean),
  automatic_payment_methods: Schema.NullOr(Schema.suspend((): typeof Models.PaymentFlowsAutomaticPaymentMethodsSetupIntent => Models.PaymentFlowsAutomaticPaymentMethodsSetupIntent)),
  cancellation_reason: Schema.NullOr(Schema.Literal("abandoned", "duplicate", "requested_by_customer")),
  client_secret: Schema.NullOr(Schema.String),
  created: Schema.Number,
  customer: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Customer => Models.Customer), Schema.suspend((): typeof Models.DeletedCustomer => Models.DeletedCustomer))),
  customer_account: Schema.optional(Schema.NullOr(Schema.String)),
  description: Schema.NullOr(Schema.String),
  excluded_payment_method_types: Schema.NullOr(Schema.Array(Schema.Literal("acss_debit", "affirm", "afterpay_clearpay", "alipay", "alma", "amazon_pay", "au_becs_debit", "bacs_debit", "bancontact", "billie", "blik", "boleto", "card", "cashapp", "crypto", "customer_balance", "eps", "fpx", "giropay", "grabpay", "ideal", "kakao_pay", "klarna", "konbini", "kr_card", "mb_way", "mobilepay", "multibanco", "naver_pay", "nz_bank_account", "oxxo", "p24", "pay_by_bank", "payco", "paynow", "paypal", "payto", "pix", "promptpay", "revolut_pay", "samsung_pay", "satispay", "sepa_debit", "sofort", "sunbit", "swish", "twint", "upi", "us_bank_account", "wechat_pay", "zip"))),
  flow_directions: Schema.optional(Schema.NullOr(Schema.Array(Schema.Literal("inbound", "outbound")))),
  id: Schema.String,
  last_setup_error: Schema.NullOr(Schema.suspend((): typeof Models.ApiErrors => Models.ApiErrors)),
  latest_attempt: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.SetupAttempt => Models.SetupAttempt))),
  livemode: Schema.Boolean,
  managed_payments: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.SmorResourceManagedPayments => Models.SmorResourceManagedPayments))),
  mandate: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Mandate => Models.Mandate))),
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  next_action: Schema.NullOr(Schema.suspend((): typeof Models.SetupIntentNextAction => Models.SetupIntentNextAction)),
  object: Schema.Literal("setup_intent"),
  on_behalf_of: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Account => Models.Account))),
  payment_method: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.PaymentMethod => Models.PaymentMethod))),
  payment_method_configuration_details: Schema.NullOr(Schema.suspend((): typeof Models.PaymentMethodConfigBizPaymentMethodConfigurationDetails => Models.PaymentMethodConfigBizPaymentMethodConfigurationDetails)),
  payment_method_options: Schema.NullOr(Schema.suspend((): typeof Models.SetupIntentPaymentMethodOptions => Models.SetupIntentPaymentMethodOptions)),
  payment_method_types: Schema.Array(Schema.String),
  single_use_mandate: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Mandate => Models.Mandate))),
  status: Schema.Literal("canceled", "processing", "requires_action", "requires_confirmation", "requires_payment_method", "succeeded"),
  usage: Schema.String,
})
export type SetupIntent = typeof SetupIntent.Type
