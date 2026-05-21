import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomFieldTextProperties = Schema.Struct({
  form_label: Schema.optional(Schema.String),
  form_help_text: Schema.optional(Schema.String),
  form_placeholder: Schema.optional(Schema.String),
  textarea: Schema.optional(Schema.Boolean),
  min_length: Schema.optional(Schema.Number),
  max_length: Schema.optional(Schema.Number)
})
export type CustomFieldTextProperties = typeof CustomFieldTextProperties.Type
