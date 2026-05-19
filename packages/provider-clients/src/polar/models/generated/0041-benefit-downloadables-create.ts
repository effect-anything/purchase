import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BenefitDownloadablesCreate = Schema.Struct({
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Union(Schema.String, Schema.Number, Schema.Number, Schema.Boolean) })),
  type: Schema.String,
  description: Schema.String,
  organization_id: Schema.optional(Schema.NullOr(Schema.String)),
  properties: Schema.suspend((): typeof Models.BenefitDownloadablesCreateProperties => Models.BenefitDownloadablesCreateProperties),
})
export type BenefitDownloadablesCreate = typeof BenefitDownloadablesCreate.Type
