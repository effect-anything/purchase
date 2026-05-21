import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const JsonApiMeta = Schema.Record({ key: Schema.String, value: Schema.Unknown })
export type JsonApiMeta = typeof JsonApiMeta.Type
