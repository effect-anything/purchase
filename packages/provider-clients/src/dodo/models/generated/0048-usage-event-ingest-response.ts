import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const UsageEventIngestResponse = Schema.Struct({
  ingested_count: Schema.Number
})
export type UsageEventIngestResponse = typeof UsageEventIngestResponse.Type
