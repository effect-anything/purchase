import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const MandateMultiUse = Schema.Struct({
  amount: Schema.optional(Schema.Number),
  currency: Schema.optional(Schema.String),
})
export type MandateMultiUse = typeof MandateMultiUse.Type
