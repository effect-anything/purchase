import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionCurrencyConversion = Schema.Struct({
  amount_subtotal: Schema.Number,
  amount_total: Schema.Number,
  fx_rate: Schema.String,
  source_currency: Schema.String,
})
export type PaymentPagesCheckoutSessionCurrencyConversion = typeof PaymentPagesCheckoutSessionCurrencyConversion.Type
