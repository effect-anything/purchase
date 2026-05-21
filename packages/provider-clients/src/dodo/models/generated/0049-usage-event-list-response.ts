import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const UsageEventListResponse = Schema.Struct({
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.UsageEvent, any, any> => Models.UsageEvent as Schema.Schema<Models.UsageEvent, any, any>
    )
  ),
  total: Schema.optional(Schema.Number)
})
export type UsageEventListResponse = typeof UsageEventListResponse.Type
