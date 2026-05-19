import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingTransactionLodgingData = Schema.Struct({
  check_in_at: Schema.NullOr(Schema.Number),
  nights: Schema.NullOr(Schema.Number),
})
export type IssuingTransactionLodgingData = typeof IssuingTransactionLodgingData.Type
