import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PayoutsTraceId = Schema.Struct({
  status: Schema.String,
  value: Schema.NullOr(Schema.String)
})
export type PayoutsTraceId = typeof PayoutsTraceId.Type
