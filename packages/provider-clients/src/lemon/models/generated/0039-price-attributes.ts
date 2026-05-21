import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PriceAttributes = Schema.Record({ key: Schema.String, value: Schema.Unknown })
export type PriceAttributes = typeof PriceAttributes.Type
