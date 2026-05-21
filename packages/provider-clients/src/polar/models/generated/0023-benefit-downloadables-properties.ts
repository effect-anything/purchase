import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BenefitDownloadablesProperties = Schema.Struct({
  archived: Schema.Record({ key: Schema.String, value: Schema.Boolean }),
  files: Schema.Array(Schema.String)
})
export type BenefitDownloadablesProperties = typeof BenefitDownloadablesProperties.Type
