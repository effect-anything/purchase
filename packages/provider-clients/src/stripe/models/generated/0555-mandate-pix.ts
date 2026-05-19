import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const MandatePix = Schema.Struct({
  amount_includes_iof: Schema.optional(Schema.Literal("always", "never")),
  amount_type: Schema.optional(Schema.Literal("fixed", "maximum")),
  end_date: Schema.optional(Schema.String),
  payment_schedule: Schema.optional(Schema.Literal("halfyearly", "monthly", "quarterly", "weekly", "yearly")),
  reference: Schema.optional(Schema.String),
  start_date: Schema.optional(Schema.String),
})
export type MandatePix = typeof MandatePix.Type
