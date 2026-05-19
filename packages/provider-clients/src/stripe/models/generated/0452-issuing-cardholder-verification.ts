import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingCardholderVerification = Schema.Struct({
  document: Schema.NullOr(Schema.suspend((): typeof Models.IssuingCardholderIdDocument => Models.IssuingCardholderIdDocument)),
})
export type IssuingCardholderVerification = typeof IssuingCardholderVerification.Type
