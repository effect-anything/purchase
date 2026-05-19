import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BenefitDownloadablesCreateProperties = Schema.Struct({
  archived: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Boolean })),
  files: Schema.Array(Schema.String),
})
export type BenefitDownloadablesCreateProperties = typeof BenefitDownloadablesCreateProperties.Type
