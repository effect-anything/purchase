import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TextFieldConfig = Schema.Struct({
  max_length: Schema.optional(Schema.Number),
  min_length: Schema.optional(Schema.Number)
})
export type TextFieldConfig = typeof TextFieldConfig.Type
