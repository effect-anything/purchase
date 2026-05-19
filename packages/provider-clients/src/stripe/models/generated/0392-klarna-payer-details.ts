import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const KlarnaPayerDetails = Schema.Struct({
  address: Schema.NullOr(Schema.suspend((): typeof Models.KlarnaAddress => Models.KlarnaAddress)),
})
export type KlarnaPayerDetails = typeof KlarnaPayerDetails.Type
