import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Metadata = Schema.Record({ key: Schema.String, value: Schema.String })
export type Metadata = typeof Metadata.Type
