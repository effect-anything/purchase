import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionsResourcePauseCollection = Schema.Struct({
  behavior: Schema.Literal("keep_as_draft", "mark_uncollectible", "void"),
  resumes_at: Schema.NullOr(Schema.Number)
})
export type SubscriptionsResourcePauseCollection = typeof SubscriptionsResourcePauseCollection.Type
