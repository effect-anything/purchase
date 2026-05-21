import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LegalEntityPersonVerificationDocument = Schema.Struct({
  back: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend((): Schema.Schema<Models.File, any, any> => Models.File as Schema.Schema<Models.File, any, any>)
    )
  ),
  details: Schema.NullOr(Schema.String),
  details_code: Schema.NullOr(Schema.String),
  front: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend((): Schema.Schema<Models.File, any, any> => Models.File as Schema.Schema<Models.File, any, any>)
    )
  )
})
export type LegalEntityPersonVerificationDocument = typeof LegalEntityPersonVerificationDocument.Type
