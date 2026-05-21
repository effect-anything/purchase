import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type FileLink = {
  readonly created: number
  readonly expired: boolean
  readonly expires_at: number | null
  readonly file: string | Models.File
  readonly id: string
  readonly livemode: boolean
  readonly metadata: Readonly<Record<string, string>>
  readonly object: "file_link"
  readonly url: string | null
}

export const FileLink = Schema.Struct({
  created: Schema.Number,
  expired: Schema.Boolean,
  expires_at: Schema.NullOr(Schema.Number),
  file: Schema.Union(
    Schema.String,
    Schema.suspend((): Schema.Schema<Models.File, any, any> => Models.File as Schema.Schema<Models.File, any, any>)
  ),
  id: Schema.String,
  livemode: Schema.Boolean,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  object: Schema.Literal("file_link"),
  url: Schema.NullOr(Schema.String)
})
