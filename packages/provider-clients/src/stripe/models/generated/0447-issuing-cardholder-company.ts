import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingCardholderCompany = Schema.Struct({
  tax_id_provided: Schema.Boolean,
})
export type IssuingCardholderCompany = typeof IssuingCardholderCompany.Type
