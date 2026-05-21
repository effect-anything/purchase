import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CurrencyCode = Schema.Literal(
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "AUD",
  "CAD",
  "CHF",
  "HKD",
  "SGD",
  "SEK",
  "ARS",
  "BRL",
  "CNY",
  "COP",
  "CZK",
  "DKK",
  "HUF",
  "ILS",
  "INR",
  "KRW",
  "MXN",
  "NOK",
  "NZD",
  "PLN",
  "RUB",
  "THB",
  "TRY",
  "TWD",
  "UAH",
  "VND",
  "ZAR"
)
export type CurrencyCode = typeof CurrencyCode.Type
