import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const MetadataQuery = Schema.NullOr(
  Schema.Record({
    key: Schema.String,
    value: Schema.Union(
      Schema.String,
      Schema.Number,
      Schema.Boolean,
      Schema.Array(Schema.String),
      Schema.Array(Schema.Number),
      Schema.Array(Schema.Boolean)
    )
  })
)
export type MetadataQuery = typeof MetadataQuery.Type
