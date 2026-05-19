import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const PostCheckoutSessionsInput = Schema.Struct({
  adaptive_pricing: Schema.optional(Schema.Struct({
  enabled: Schema.optional(Schema.Boolean),
})),
  after_expiration: Schema.optional(Schema.Struct({
  recovery: Schema.optional(Schema.Struct({
  allow_promotion_codes: Schema.optional(Schema.Boolean),
  enabled: Schema.Boolean,
})),
})),
  automatic_tax: Schema.optional(Schema.Struct({
  enabled: Schema.Boolean,
  liability: Schema.optional(Schema.Struct({
  account: Schema.optional(Schema.String),
  type: Schema.Literal("account", "self"),
})),
})),
  billing_address_collection: Schema.optional(Schema.Literal("auto", "required")),
  branding_settings: Schema.optional(Schema.Struct({
  background_color: Schema.optional(Schema.Union(Schema.String, Schema.Literal(""))),
  border_style: Schema.optional(Schema.Literal("", "pill", "rectangular", "rounded")),
  button_color: Schema.optional(Schema.Union(Schema.String, Schema.Literal(""))),
  display_name: Schema.optional(Schema.String),
  font_family: Schema.optional(Schema.Literal("", "be_vietnam_pro", "bitter", "chakra_petch", "default", "hahmlet", "inconsolata", "inter", "lato", "lora", "m_plus_1_code", "montserrat", "noto_sans", "noto_sans_jp", "noto_serif", "nunito", "open_sans", "pridi", "pt_sans", "pt_serif", "raleway", "roboto", "roboto_slab", "source_sans_pro", "titillium_web", "ubuntu_mono", "zen_maru_gothic")),
  icon: Schema.optional(Schema.Struct({
  file: Schema.optional(Schema.String),
  type: Schema.Literal("file", "url"),
  url: Schema.optional(Schema.String),
})),
  logo: Schema.optional(Schema.Struct({
  file: Schema.optional(Schema.String),
  type: Schema.Literal("file", "url"),
  url: Schema.optional(Schema.String),
})),
})),
  cancel_url: Schema.optional(Schema.String),
  client_reference_id: Schema.optional(Schema.String),
  consent_collection: Schema.optional(Schema.Struct({
  payment_method_reuse_agreement: Schema.optional(Schema.Struct({
  position: Schema.Literal("auto", "hidden"),
})),
  promotions: Schema.optional(Schema.Literal("auto", "none")),
  terms_of_service: Schema.optional(Schema.Literal("none", "required")),
})),
  currency: Schema.optional(Schema.String),
  custom_fields: Schema.optional(Schema.Array(Schema.Struct({
  dropdown: Schema.optional(Schema.Struct({
  default_value: Schema.optional(Schema.String),
  options: Schema.Array(Schema.Struct({
  label: Schema.String,
  value: Schema.String,
})),
})),
  key: Schema.String,
  label: Schema.Struct({
  custom: Schema.String,
  type: Schema.Literal("custom"),
}),
  numeric: Schema.optional(Schema.Struct({
  default_value: Schema.optional(Schema.String),
  maximum_length: Schema.optional(Schema.Number),
  minimum_length: Schema.optional(Schema.Number),
})),
  optional: Schema.optional(Schema.Boolean),
  text: Schema.optional(Schema.Struct({
  default_value: Schema.optional(Schema.String),
  maximum_length: Schema.optional(Schema.Number),
  minimum_length: Schema.optional(Schema.Number),
})),
  type: Schema.Literal("dropdown", "numeric", "text"),
}))),
  custom_text: Schema.optional(Schema.Struct({
  after_submit: Schema.optional(Schema.Union(Schema.Struct({
  message: Schema.String,
}), Schema.Literal(""))),
  shipping_address: Schema.optional(Schema.Union(Schema.Struct({
  message: Schema.String,
}), Schema.Literal(""))),
  submit: Schema.optional(Schema.Union(Schema.Struct({
  message: Schema.String,
}), Schema.Literal(""))),
  terms_of_service_acceptance: Schema.optional(Schema.Union(Schema.Struct({
  message: Schema.String,
}), Schema.Literal(""))),
})),
  customer: Schema.optional(Schema.String),
  customer_account: Schema.optional(Schema.String),
  customer_creation: Schema.optional(Schema.Literal("always", "if_required")),
  customer_email: Schema.optional(Schema.String),
  customer_update: Schema.optional(Schema.Struct({
  address: Schema.optional(Schema.Literal("auto", "never")),
  name: Schema.optional(Schema.Literal("auto", "never")),
  shipping: Schema.optional(Schema.Literal("auto", "never")),
})),
  discounts: Schema.optional(Schema.Array(Schema.Struct({
  coupon: Schema.optional(Schema.String),
  promotion_code: Schema.optional(Schema.String),
}))),
  excluded_payment_method_types: Schema.optional(Schema.Array(Schema.Literal("acss_debit", "affirm", "afterpay_clearpay", "alipay", "alma", "amazon_pay", "au_becs_debit", "bacs_debit", "bancontact", "billie", "blik", "boleto", "card", "cashapp", "crypto", "customer_balance", "eps", "fpx", "giropay", "grabpay", "ideal", "kakao_pay", "klarna", "konbini", "kr_card", "mb_way", "mobilepay", "multibanco", "naver_pay", "nz_bank_account", "oxxo", "p24", "pay_by_bank", "payco", "paynow", "paypal", "payto", "pix", "promptpay", "revolut_pay", "samsung_pay", "satispay", "sepa_debit", "sofort", "sunbit", "swish", "twint", "upi", "us_bank_account", "wechat_pay", "zip"))),
  expand: Schema.optional(Schema.Array(Schema.String)),
  expires_at: Schema.optional(Schema.Number),
  integration_identifier: Schema.optional(Schema.String),
  invoice_creation: Schema.optional(Schema.Struct({
  enabled: Schema.Boolean,
  invoice_data: Schema.optional(Schema.Struct({
  account_tax_ids: Schema.optional(Schema.Union(Schema.Array(Schema.String), Schema.Literal(""))),
  custom_fields: Schema.optional(Schema.Union(Schema.Array(Schema.Struct({
  name: Schema.String,
  value: Schema.String,
})), Schema.Literal(""))),
  description: Schema.optional(Schema.String),
  footer: Schema.optional(Schema.String),
  issuer: Schema.optional(Schema.Struct({
  account: Schema.optional(Schema.String),
  type: Schema.Literal("account", "self"),
})),
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
  rendering_options: Schema.optional(Schema.Union(Schema.Struct({
  amount_tax_display: Schema.optional(Schema.Literal("", "exclude_tax", "include_inclusive_tax")),
  template: Schema.optional(Schema.String),
}), Schema.Literal(""))),
})),
})),
  line_items: Schema.optional(Schema.Array(Schema.Struct({
  adjustable_quantity: Schema.optional(Schema.Struct({
  enabled: Schema.Boolean,
  maximum: Schema.optional(Schema.Number),
  minimum: Schema.optional(Schema.Number),
})),
  dynamic_tax_rates: Schema.optional(Schema.Array(Schema.String)),
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
  price: Schema.optional(Schema.String),
  price_data: Schema.optional(Schema.Struct({
  currency: Schema.String,
  product: Schema.optional(Schema.String),
  product_data: Schema.optional(Schema.Struct({
  description: Schema.optional(Schema.String),
  images: Schema.optional(Schema.Array(Schema.String)),
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
  name: Schema.String,
  tax_code: Schema.optional(Schema.String),
  unit_label: Schema.optional(Schema.String),
})),
  recurring: Schema.optional(Schema.Struct({
  interval: Schema.Literal("day", "month", "week", "year"),
  interval_count: Schema.optional(Schema.Number),
})),
  tax_behavior: Schema.optional(Schema.Literal("exclusive", "inclusive", "unspecified")),
  unit_amount: Schema.optional(Schema.Number),
  unit_amount_decimal: Schema.optional(Schema.String),
})),
  quantity: Schema.optional(Schema.Number),
  tax_rates: Schema.optional(Schema.Array(Schema.String)),
}))),
  locale: Schema.optional(Schema.Literal("auto", "bg", "cs", "da", "de", "el", "en", "en-GB", "es", "es-419", "et", "fi", "fil", "fr", "fr-CA", "hr", "hu", "id", "it", "ja", "ko", "lt", "lv", "ms", "mt", "nb", "nl", "pl", "pt", "pt-BR", "ro", "ru", "sk", "sl", "sv", "th", "tr", "vi", "zh", "zh-HK", "zh-TW")),
  managed_payments: Schema.optional(Schema.Struct({
  enabled: Schema.optional(Schema.Boolean),
})),
  mode: Schema.optional(Schema.Literal("payment", "setup", "subscription")),
  name_collection: Schema.optional(Schema.Struct({
  business: Schema.optional(Schema.Struct({
  enabled: Schema.Boolean,
  optional: Schema.optional(Schema.Boolean),
})),
  individual: Schema.optional(Schema.Struct({
  enabled: Schema.Boolean,
  optional: Schema.optional(Schema.Boolean),
})),
})),
  optional_items: Schema.optional(Schema.Array(Schema.Struct({
  adjustable_quantity: Schema.optional(Schema.Struct({
  enabled: Schema.Boolean,
  maximum: Schema.optional(Schema.Number),
  minimum: Schema.optional(Schema.Number),
})),
  price: Schema.String,
  quantity: Schema.Number,
}))),
  origin_context: Schema.optional(Schema.Literal("mobile_app", "web")),
  payment_intent_data: Schema.optional(Schema.Struct({
  application_fee_amount: Schema.optional(Schema.Number),
  capture_method: Schema.optional(Schema.Literal("automatic", "automatic_async", "manual")),
  description: Schema.optional(Schema.String),
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
  on_behalf_of: Schema.optional(Schema.String),
  receipt_email: Schema.optional(Schema.String),
  setup_future_usage: Schema.optional(Schema.Literal("off_session", "on_session")),
  shipping: Schema.optional(Schema.Struct({
  address: Schema.Struct({
  city: Schema.optional(Schema.String),
  country: Schema.optional(Schema.String),
  line1: Schema.String,
  line2: Schema.optional(Schema.String),
  postal_code: Schema.optional(Schema.String),
  state: Schema.optional(Schema.String),
}),
  carrier: Schema.optional(Schema.String),
  name: Schema.String,
  phone: Schema.optional(Schema.String),
  tracking_number: Schema.optional(Schema.String),
})),
  statement_descriptor: Schema.optional(Schema.String),
  statement_descriptor_suffix: Schema.optional(Schema.String),
  transfer_data: Schema.optional(Schema.Struct({
  amount: Schema.optional(Schema.Number),
  destination: Schema.String,
})),
  transfer_group: Schema.optional(Schema.String),
})),
  payment_method_collection: Schema.optional(Schema.Literal("always", "if_required")),
  payment_method_configuration: Schema.optional(Schema.String),
  payment_method_data: Schema.optional(Schema.Struct({
  allow_redisplay: Schema.optional(Schema.Literal("always", "limited", "unspecified")),
})),
  payment_method_options: Schema.optional(Schema.Struct({
  acss_debit: Schema.optional(Schema.Struct({
  currency: Schema.optional(Schema.Literal("cad", "usd")),
  mandate_options: Schema.optional(Schema.Struct({
  custom_mandate_url: Schema.optional(Schema.Union(Schema.String, Schema.Literal(""))),
  default_for: Schema.optional(Schema.Array(Schema.Literal("invoice", "subscription"))),
  interval_description: Schema.optional(Schema.String),
  payment_schedule: Schema.optional(Schema.Literal("combined", "interval", "sporadic")),
  transaction_type: Schema.optional(Schema.Literal("business", "personal")),
})),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session", "on_session")),
  target_date: Schema.optional(Schema.String),
  verification_method: Schema.optional(Schema.Literal("automatic", "instant", "microdeposits")),
})),
  affirm: Schema.optional(Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})),
  afterpay_clearpay: Schema.optional(Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})),
  alipay: Schema.optional(Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})),
  alma: Schema.optional(Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
})),
  amazon_pay: Schema.optional(Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session")),
})),
  au_becs_debit: Schema.optional(Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("none")),
  target_date: Schema.optional(Schema.String),
})),
  bacs_debit: Schema.optional(Schema.Struct({
  mandate_options: Schema.optional(Schema.Struct({
  reference_prefix: Schema.optional(Schema.Union(Schema.String, Schema.Literal(""))),
})),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session", "on_session")),
  target_date: Schema.optional(Schema.String),
})),
  bancontact: Schema.optional(Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})),
  billie: Schema.optional(Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
})),
  boleto: Schema.optional(Schema.Struct({
  expires_after_days: Schema.optional(Schema.Number),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session", "on_session")),
})),
  card: Schema.optional(Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
  installments: Schema.optional(Schema.Struct({
  enabled: Schema.optional(Schema.Boolean),
})),
  request_extended_authorization: Schema.optional(Schema.Literal("if_available", "never")),
  request_incremental_authorization: Schema.optional(Schema.Literal("if_available", "never")),
  request_multicapture: Schema.optional(Schema.Literal("if_available", "never")),
  request_overcapture: Schema.optional(Schema.Literal("if_available", "never")),
  request_three_d_secure: Schema.optional(Schema.Literal("any", "automatic", "challenge")),
  restrictions: Schema.optional(Schema.Struct({
  brands_blocked: Schema.optional(Schema.Array(Schema.Literal("american_express", "discover_global_network", "mastercard", "visa"))),
})),
  setup_future_usage: Schema.optional(Schema.Literal("off_session", "on_session")),
  statement_descriptor_suffix_kana: Schema.optional(Schema.String),
  statement_descriptor_suffix_kanji: Schema.optional(Schema.String),
})),
  cashapp: Schema.optional(Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session", "on_session")),
})),
  crypto: Schema.optional(Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})),
  customer_balance: Schema.optional(Schema.Struct({
  bank_transfer: Schema.optional(Schema.Struct({
  eu_bank_transfer: Schema.optional(Schema.Struct({
  country: Schema.String,
})),
  requested_address_types: Schema.optional(Schema.Array(Schema.Literal("aba", "iban", "sepa", "sort_code", "spei", "swift", "zengin"))),
  type: Schema.Literal("eu_bank_transfer", "gb_bank_transfer", "jp_bank_transfer", "mx_bank_transfer", "us_bank_transfer"),
})),
  funding_type: Schema.optional(Schema.Literal("bank_transfer")),
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})),
  demo_pay: Schema.optional(Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session")),
})),
  eps: Schema.optional(Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})),
  fpx: Schema.optional(Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})),
  giropay: Schema.optional(Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})),
  grabpay: Schema.optional(Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})),
  ideal: Schema.optional(Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})),
  kakao_pay: Schema.optional(Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session")),
})),
  klarna: Schema.optional(Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
  setup_future_usage: Schema.optional(Schema.Literal("none")),
  subscriptions: Schema.optional(Schema.Union(Schema.Array(Schema.Struct({
  interval: Schema.Literal("day", "month", "week", "year"),
  interval_count: Schema.optional(Schema.Number),
  name: Schema.optional(Schema.String),
  next_billing: Schema.Struct({
  amount: Schema.Number,
  date: Schema.String,
}),
  reference: Schema.String,
})), Schema.Literal(""))),
})),
  konbini: Schema.optional(Schema.Struct({
  expires_after_days: Schema.optional(Schema.Number),
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})),
  kr_card: Schema.optional(Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session")),
})),
  link: Schema.optional(Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session")),
})),
  mobilepay: Schema.optional(Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})),
  multibanco: Schema.optional(Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})),
  naver_pay: Schema.optional(Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session")),
})),
  oxxo: Schema.optional(Schema.Struct({
  expires_after_days: Schema.optional(Schema.Number),
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})),
  p24: Schema.optional(Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("none")),
  tos_shown_and_accepted: Schema.optional(Schema.Boolean),
})),
  pay_by_bank: Schema.optional(Schema.Struct({

})),
  payco: Schema.optional(Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
})),
  paynow: Schema.optional(Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})),
  paypal: Schema.optional(Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("", "manual")),
  preferred_locale: Schema.optional(Schema.Literal("cs-CZ", "da-DK", "de-AT", "de-DE", "de-LU", "el-GR", "en-GB", "en-US", "es-ES", "fi-FI", "fr-BE", "fr-FR", "fr-LU", "hu-HU", "it-IT", "nl-BE", "nl-NL", "pl-PL", "pt-PT", "sk-SK", "sv-SE")),
  reference: Schema.optional(Schema.String),
  risk_correlation_id: Schema.optional(Schema.String),
  setup_future_usage: Schema.optional(Schema.Literal("", "none", "off_session")),
})),
  payto: Schema.optional(Schema.Struct({
  mandate_options: Schema.optional(Schema.Struct({
  amount: Schema.optional(Schema.Union(Schema.Number, Schema.Literal(""))),
  amount_type: Schema.optional(Schema.Literal("", "fixed", "maximum")),
  end_date: Schema.optional(Schema.Union(Schema.String, Schema.Literal(""))),
  payment_schedule: Schema.optional(Schema.Literal("", "adhoc", "annual", "daily", "fortnightly", "monthly", "quarterly", "semi_annual", "weekly")),
  payments_per_period: Schema.optional(Schema.Union(Schema.Number, Schema.Literal(""))),
  purpose: Schema.optional(Schema.Literal("", "dependant_support", "government", "loan", "mortgage", "other", "pension", "personal", "retail", "salary", "tax", "utility")),
  start_date: Schema.optional(Schema.Union(Schema.String, Schema.Literal(""))),
})),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session")),
})),
  pix: Schema.optional(Schema.Struct({
  amount_includes_iof: Schema.optional(Schema.Literal("always", "never")),
  expires_after_seconds: Schema.optional(Schema.Number),
  mandate_options: Schema.optional(Schema.Struct({
  amount: Schema.optional(Schema.Number),
  amount_includes_iof: Schema.optional(Schema.Literal("always", "never")),
  amount_type: Schema.optional(Schema.Literal("fixed", "maximum")),
  currency: Schema.optional(Schema.String),
  end_date: Schema.optional(Schema.String),
  payment_schedule: Schema.optional(Schema.Literal("halfyearly", "monthly", "quarterly", "weekly", "yearly")),
  reference: Schema.optional(Schema.String),
  start_date: Schema.optional(Schema.String),
})),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session")),
})),
  revolut_pay: Schema.optional(Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session")),
})),
  samsung_pay: Schema.optional(Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
})),
  satispay: Schema.optional(Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
})),
  sepa_debit: Schema.optional(Schema.Struct({
  mandate_options: Schema.optional(Schema.Struct({
  reference_prefix: Schema.optional(Schema.Union(Schema.String, Schema.Literal(""))),
})),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session", "on_session")),
  target_date: Schema.optional(Schema.String),
})),
  sofort: Schema.optional(Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})),
  swish: Schema.optional(Schema.Struct({
  reference: Schema.optional(Schema.String),
})),
  twint: Schema.optional(Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})),
  upi: Schema.optional(Schema.Struct({
  mandate_options: Schema.optional(Schema.Struct({
  amount: Schema.optional(Schema.Number),
  amount_type: Schema.optional(Schema.Literal("fixed", "maximum")),
  description: Schema.optional(Schema.String),
  end_date: Schema.optional(Schema.Number),
})),
  setup_future_usage: Schema.optional(Schema.Literal("", "none", "off_session", "on_session")),
})),
  us_bank_account: Schema.optional(Schema.Struct({
  financial_connections: Schema.optional(Schema.Struct({
  permissions: Schema.optional(Schema.Array(Schema.Literal("balances", "ownership", "payment_method", "transactions"))),
  prefetch: Schema.optional(Schema.Array(Schema.Literal("balances", "ownership", "transactions"))),
})),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session", "on_session")),
  target_date: Schema.optional(Schema.String),
  verification_method: Schema.optional(Schema.Literal("automatic", "instant")),
})),
  wechat_pay: Schema.optional(Schema.Struct({
  app_id: Schema.optional(Schema.String),
  client: Schema.Literal("android", "ios", "web"),
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})),
})),
  phone_number_collection: Schema.optional(Schema.Struct({
  enabled: Schema.Boolean,
})),
  redirect_on_completion: Schema.optional(Schema.Literal("always", "if_required", "never")),
  return_url: Schema.optional(Schema.String),
  saved_payment_method_options: Schema.optional(Schema.Struct({
  allow_redisplay_filters: Schema.optional(Schema.Array(Schema.Literal("always", "limited", "unspecified"))),
  payment_method_remove: Schema.optional(Schema.Literal("disabled", "enabled")),
  payment_method_save: Schema.optional(Schema.Literal("disabled", "enabled")),
})),
  setup_intent_data: Schema.optional(Schema.Struct({
  description: Schema.optional(Schema.String),
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
  on_behalf_of: Schema.optional(Schema.String),
})),
  shipping_address_collection: Schema.optional(Schema.Struct({
  allowed_countries: Schema.Array(Schema.Literal("AC", "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AT", "AU", "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CV", "CW", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MK", "ML", "MM", "MN", "MO", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SZ", "TA", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VN", "VU", "WF", "WS", "XK", "YE", "YT", "ZA", "ZM", "ZW", "ZZ")),
})),
  shipping_options: Schema.optional(Schema.Array(Schema.Struct({
  shipping_rate: Schema.optional(Schema.String),
  shipping_rate_data: Schema.optional(Schema.Struct({
  delivery_estimate: Schema.optional(Schema.Struct({
  maximum: Schema.optional(Schema.Struct({
  unit: Schema.Literal("business_day", "day", "hour", "month", "week"),
  value: Schema.Number,
})),
  minimum: Schema.optional(Schema.Struct({
  unit: Schema.Literal("business_day", "day", "hour", "month", "week"),
  value: Schema.Number,
})),
})),
  display_name: Schema.String,
  fixed_amount: Schema.optional(Schema.Struct({
  amount: Schema.Number,
  currency: Schema.String,
  currency_options: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Struct({
  amount: Schema.Number,
  tax_behavior: Schema.optional(Schema.Literal("exclusive", "inclusive", "unspecified")),
}) })),
})),
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
  tax_behavior: Schema.optional(Schema.Literal("exclusive", "inclusive", "unspecified")),
  tax_code: Schema.optional(Schema.String),
  type: Schema.optional(Schema.Literal("fixed_amount")),
})),
}))),
  submit_type: Schema.optional(Schema.Literal("auto", "book", "donate", "pay", "subscribe")),
  subscription_data: Schema.optional(Schema.Struct({
  application_fee_percent: Schema.optional(Schema.Number),
  billing_cycle_anchor: Schema.optional(Schema.Number),
  billing_mode: Schema.optional(Schema.Struct({
  flexible: Schema.optional(Schema.Struct({
  proration_discounts: Schema.optional(Schema.Literal("included", "itemized")),
})),
  type: Schema.Literal("classic", "flexible"),
})),
  default_tax_rates: Schema.optional(Schema.Array(Schema.String)),
  description: Schema.optional(Schema.String),
  invoice_settings: Schema.optional(Schema.Struct({
  issuer: Schema.optional(Schema.Struct({
  account: Schema.optional(Schema.String),
  type: Schema.Literal("account", "self"),
})),
})),
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
  on_behalf_of: Schema.optional(Schema.String),
  pending_invoice_item_interval: Schema.optional(Schema.Struct({
  interval: Schema.Literal("day", "month", "week", "year"),
  interval_count: Schema.optional(Schema.Number),
})),
  proration_behavior: Schema.optional(Schema.Literal("create_prorations", "none")),
  transfer_data: Schema.optional(Schema.Struct({
  amount_percent: Schema.optional(Schema.Number),
  destination: Schema.String,
})),
  trial_end: Schema.optional(Schema.Number),
  trial_period_days: Schema.optional(Schema.Number),
  trial_settings: Schema.optional(Schema.Struct({
  end_behavior: Schema.Struct({
  missing_payment_method: Schema.Literal("cancel", "create_invoice", "pause"),
}),
})),
})),
  success_url: Schema.optional(Schema.String),
  tax_id_collection: Schema.optional(Schema.Struct({
  enabled: Schema.Boolean,
  required: Schema.optional(Schema.Literal("if_supported", "never")),
})),
  ui_mode: Schema.optional(Schema.Literal("elements", "embedded_page", "form", "hosted_page")),
  wallet_options: Schema.optional(Schema.Struct({
  link: Schema.optional(Schema.Struct({
  display: Schema.optional(Schema.Literal("auto", "never")),
})),
})),
})
export type PostCheckoutSessionsInput = typeof PostCheckoutSessionsInput.Type

export const PostCheckoutSessionsOutput = Models.CheckoutSession
export type PostCheckoutSessionsOutput = typeof PostCheckoutSessionsOutput.Type

export const postCheckoutSessionsOperation = defineOperation({
  id: "stripe.PostCheckoutSessions",
  method: "POST",
  path: "/v1/checkout/sessions",
  inputSchema: PostCheckoutSessionsInput,
  outputSchema: PostCheckoutSessionsOutput,
  status: [200],
  contentType: "form",
  bodyParams: ["adaptive_pricing", "after_expiration", "allow_promotion_codes", "automatic_tax", "billing_address_collection", "branding_settings", "cancel_url", "client_reference_id", "consent_collection", "currency", "custom_fields", "custom_text", "customer", "customer_account", "customer_creation", "customer_email", "customer_update", "discounts", "excluded_payment_method_types", "expand", "expires_at", "integration_identifier", "invoice_creation", "line_items", "locale", "managed_payments", "metadata", "mode", "name_collection", "optional_items", "origin_context", "payment_intent_data", "payment_method_collection", "payment_method_configuration", "payment_method_data", "payment_method_options", "payment_method_types", "permissions", "phone_number_collection", "redirect_on_completion", "return_url", "saved_payment_method_options", "setup_intent_data", "shipping_address_collection", "shipping_options", "submit_type", "subscription_data", "success_url", "tax_id_collection", "ui_mode", "wallet_options"]
})

/**
 * Create a Checkout Session
 */
export const postCheckoutSessions = (input: PostCheckoutSessionsInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(postCheckoutSessionsOperation, input)))
