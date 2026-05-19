import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TaxCode = Schema.Struct({
  description: Schema.String,
  id: Schema.String,
  name: Schema.String,
  object: Schema.Literal("tax_code"),
})
export type TaxCode = typeof TaxCode.Type
