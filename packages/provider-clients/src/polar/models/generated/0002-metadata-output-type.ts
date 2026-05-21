import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const MetadataOutputType = Schema.Record({
  key: Schema.String,
  value: Schema.Union(Schema.String, Schema.Number, Schema.Number, Schema.Boolean)
})
export type MetadataOutputType = typeof MetadataOutputType.Type
