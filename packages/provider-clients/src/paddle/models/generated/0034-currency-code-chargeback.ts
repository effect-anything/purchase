import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CurrencyCodeChargeback = Schema.Literal("AUD", "CAD", "EUR", "GBP", "USD")
export type CurrencyCodeChargeback = typeof CurrencyCodeChargeback.Type
