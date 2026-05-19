import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingCardholderAddress = Schema.Struct({
  address: Schema.suspend((): typeof Models.Address => Models.Address),
})
export type IssuingCardholderAddress = typeof IssuingCardholderAddress.Type
