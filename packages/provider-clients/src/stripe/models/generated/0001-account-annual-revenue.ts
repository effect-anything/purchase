import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AccountAnnualRevenue = Schema.Struct({
  amount: Schema.NullOr(Schema.Number),
  currency: Schema.NullOr(Schema.String),
  fiscal_year_end: Schema.NullOr(Schema.String)
})
export type AccountAnnualRevenue = typeof AccountAnnualRevenue.Type
