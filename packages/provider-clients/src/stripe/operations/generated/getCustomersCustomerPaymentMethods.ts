import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const GetCustomersCustomerPaymentMethodsInput = Schema.Struct({
  allow_redisplay: Schema.optional(Schema.Literal("always", "limited", "unspecified")),
  customer: Schema.String,
  ending_before: Schema.optional(Schema.String),
  expand: Schema.optional(Schema.Array(Schema.String)),
  limit: Schema.optional(Schema.Number),
  starting_after: Schema.optional(Schema.String),
  type: Schema.optional(Schema.Literal("acss_debit", "affirm", "afterpay_clearpay", "alipay", "alma", "amazon_pay", "au_becs_debit", "bacs_debit", "bancontact", "billie", "blik", "boleto", "card", "cashapp", "crypto", "custom", "customer_balance", "eps", "fpx", "giropay", "grabpay", "ideal", "kakao_pay", "klarna", "konbini", "kr_card", "link", "mb_way", "mobilepay", "multibanco", "naver_pay", "nz_bank_account", "oxxo", "p24", "pay_by_bank", "payco", "paynow", "paypal", "payto", "pix", "promptpay", "revolut_pay", "samsung_pay", "satispay", "sepa_debit", "sofort", "sunbit", "swish", "twint", "upi", "us_bank_account", "wechat_pay", "zip")),
})
export type GetCustomersCustomerPaymentMethodsInput = typeof GetCustomersCustomerPaymentMethodsInput.Type

export const GetCustomersCustomerPaymentMethodsOutput = Schema.Struct({
  data: Schema.Array(Models.PaymentMethod),
  has_more: Schema.Boolean,
  object: Schema.Literal("list"),
  url: Schema.String,
})
export type GetCustomersCustomerPaymentMethodsOutput = typeof GetCustomersCustomerPaymentMethodsOutput.Type

export const getCustomersCustomerPaymentMethodsOperation = defineOperation({
  id: "stripe.GetCustomersCustomerPaymentMethods",
  method: "GET",
  path: "/v1/customers/{customer}/payment_methods",
  inputSchema: GetCustomersCustomerPaymentMethodsInput,
  outputSchema: GetCustomersCustomerPaymentMethodsOutput,
  status: [200],
  contentType: "form",
  pathParams: ["customer"],
  queryParams: ["allow_redisplay", "ending_before", "expand", "limit", "starting_after", "type"]
})

/**
 * List a Customer's PaymentMethods
 */
export const getCustomersCustomerPaymentMethods = (input: GetCustomersCustomerPaymentMethodsInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getCustomersCustomerPaymentMethodsOperation, input)))
