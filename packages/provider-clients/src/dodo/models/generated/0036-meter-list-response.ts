import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const MeterListResponse = Schema.Struct({
  items: Schema.Array(
    Schema.suspend((): Schema.Schema<Models.Meter, any, any> => Models.Meter as Schema.Schema<Models.Meter, any, any>)
  ),
  total: Schema.optional(Schema.Number)
})
export type MeterListResponse = typeof MeterListResponse.Type
