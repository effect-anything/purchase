import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const OrderAttributes = Schema.Record({ key: Schema.String, value: Schema.Unknown })
export type OrderAttributes = typeof OrderAttributes.Type
