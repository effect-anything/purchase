import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingCardholderVerification = Schema.Struct({
  document: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingCardholderIdDocument, any, any> =>
        Models.IssuingCardholderIdDocument as Schema.Schema<Models.IssuingCardholderIdDocument, any, any>
    )
  )
})
export type IssuingCardholderVerification = typeof IssuingCardholderVerification.Type
