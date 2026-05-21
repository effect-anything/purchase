import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Money = Schema.Struct({
  amount: Schema.String,
  currency_code: Schema.suspend((): Schema.Schema<Models.CurrencyCode> => Models.CurrencyCode)
})
export type Money = typeof Money.Type
