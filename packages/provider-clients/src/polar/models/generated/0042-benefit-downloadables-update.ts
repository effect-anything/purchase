import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BenefitDownloadablesUpdate = Schema.Struct({
  metadata: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.Union(Schema.String, Schema.Number, Schema.Number, Schema.Boolean)
    })
  ),
  description: Schema.optional(Schema.NullOr(Schema.String)),
  type: Schema.String,
  properties: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.BenefitDownloadablesCreateProperties, any, any> =>
          Models.BenefitDownloadablesCreateProperties as Schema.Schema<
            Models.BenefitDownloadablesCreateProperties,
            any,
            any
          >
      )
    )
  )
})
export type BenefitDownloadablesUpdate = typeof BenefitDownloadablesUpdate.Type
