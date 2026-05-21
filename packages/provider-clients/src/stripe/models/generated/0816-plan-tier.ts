import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PlanTier = Schema.Struct({
  flat_amount: Schema.NullOr(Schema.Number),
  flat_amount_decimal: Schema.NullOr(Schema.String),
  unit_amount: Schema.NullOr(Schema.Number),
  unit_amount_decimal: Schema.NullOr(Schema.String),
  up_to: Schema.NullOr(Schema.Number)
})
export type PlanTier = typeof PlanTier.Type
