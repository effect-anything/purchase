import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const InvoicesResourceStatusTransitions = Schema.Struct({
  finalized_at: Schema.NullOr(Schema.Number),
  marked_uncollectible_at: Schema.NullOr(Schema.Number),
  paid_at: Schema.NullOr(Schema.Number),
  voided_at: Schema.NullOr(Schema.Number)
})
export type InvoicesResourceStatusTransitions = typeof InvoicesResourceStatusTransitions.Type
