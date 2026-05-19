import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const MeterListResponse = Schema.Struct({
  items: Schema.Array(Schema.suspend(() => Models.Meter)),
  total: Schema.optional(Schema.Number),
})
export type MeterListResponse = typeof MeterListResponse.Type
