import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const FileLink = Schema.Struct({
  created: Schema.Number,
  expired: Schema.Boolean,
  expires_at: Schema.NullOr(Schema.Number),
  file: Schema.Union(Schema.String, Schema.suspend((): typeof Models.File => Models.File)),
  id: Schema.String,
  livemode: Schema.Boolean,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  object: Schema.Literal("file_link"),
  url: Schema.NullOr(Schema.String),
})
export type FileLink = typeof FileLink.Type
