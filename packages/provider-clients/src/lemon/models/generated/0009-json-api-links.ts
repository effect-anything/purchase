import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const JsonApiLinks = Schema.Record({ key: Schema.String, value: Schema.String })
export type JsonApiLinks = typeof JsonApiLinks.Type
