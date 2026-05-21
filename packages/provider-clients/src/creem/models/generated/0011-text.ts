import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Text = Schema.Struct({
  max_length: Schema.optional(Schema.NullOr(Schema.Number)),
  minimum_length: Schema.optional(Schema.NullOr(Schema.Number)),
  value: Schema.optional(Schema.NullOr(Schema.String))
})
export type Text = typeof Text.Type
