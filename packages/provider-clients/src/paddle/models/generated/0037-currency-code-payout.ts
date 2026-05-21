import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CurrencyCodePayout = Schema.Literal(
  "AUD",
  "CAD",
  "CHF",
  "CNY",
  "CZK",
  "DKK",
  "EUR",
  "GBP",
  "HUF",
  "PLN",
  "SEK",
  "USD",
  "ZAR"
)
export type CurrencyCodePayout = typeof CurrencyCodePayout.Type
