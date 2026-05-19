import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomUnitAmount = Schema.Struct({
  maximum: Schema.NullOr(Schema.Number),
  minimum: Schema.NullOr(Schema.Number),
  preset: Schema.NullOr(Schema.Number),
})
export type CustomUnitAmount = typeof CustomUnitAmount.Type
