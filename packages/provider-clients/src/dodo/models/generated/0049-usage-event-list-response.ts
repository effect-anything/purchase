import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const UsageEventListResponse = Schema.Struct({
  items: Schema.Array(Schema.suspend(() => Models.UsageEvent)),
  total: Schema.optional(Schema.Number),
})
export type UsageEventListResponse = typeof UsageEventListResponse.Type
