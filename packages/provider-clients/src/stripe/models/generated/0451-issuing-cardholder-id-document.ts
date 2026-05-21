import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingCardholderIdDocument = Schema.Struct({
  back: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend((): Schema.Schema<Models.File, any, any> => Models.File as Schema.Schema<Models.File, any, any>)
    )
  ),
  front: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend((): Schema.Schema<Models.File, any, any> => Models.File as Schema.Schema<Models.File, any, any>)
    )
  )
})
export type IssuingCardholderIdDocument = typeof IssuingCardholderIdDocument.Type
