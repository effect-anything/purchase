import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const EmptyObject = Schema.Record({ key: Schema.String, value: Schema.Unknown })
export type EmptyObject = typeof EmptyObject.Type
