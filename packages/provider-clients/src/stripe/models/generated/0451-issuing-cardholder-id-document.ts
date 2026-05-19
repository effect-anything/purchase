import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingCardholderIdDocument = Schema.Struct({
  back: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.File => Models.File))),
  front: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.File => Models.File))),
})
export type IssuingCardholderIdDocument = typeof IssuingCardholderIdDocument.Type
