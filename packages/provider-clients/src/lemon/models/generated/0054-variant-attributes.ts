import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const VariantAttributes = Schema.Record({ key: Schema.String, value: Schema.Unknown })
export type VariantAttributes = typeof VariantAttributes.Type
