import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const InvoicesPaymentSettings = Schema.Struct({
  default_mandate: Schema.NullOr(Schema.String),
  payment_method_options: Schema.NullOr(Schema.suspend((): typeof Models.InvoicesPaymentMethodOptions => Models.InvoicesPaymentMethodOptions)),
  payment_method_types: Schema.NullOr(Schema.Array(Schema.Literal("ach_credit_transfer", "ach_debit", "acss_debit", "affirm", "amazon_pay", "au_becs_debit", "bacs_debit", "bancontact", "boleto", "card", "cashapp", "crypto", "custom", "customer_balance", "eps", "fpx", "giropay", "grabpay", "ideal", "jp_credit_transfer", "kakao_pay", "klarna", "konbini", "kr_card", "link", "multibanco", "naver_pay", "nz_bank_account", "p24", "pay_by_bank", "payco", "paynow", "paypal", "payto", "pix", "promptpay", "revolut_pay", "sepa_credit_transfer", "sepa_debit", "sofort", "swish", "upi", "us_bank_account", "wechat_pay"))),
})
export type InvoicesPaymentSettings = typeof InvoicesPaymentSettings.Type
