import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BenefitGrantDownloadablesProperties = Schema.Struct({
  files: Schema.optional(Schema.Array(Schema.String))
})
export type BenefitGrantDownloadablesProperties = typeof BenefitGrantDownloadablesProperties.Type
