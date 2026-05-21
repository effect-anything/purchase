import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomFieldNumberProperties = Schema.Struct({
  form_label: Schema.optional(Schema.String),
  form_help_text: Schema.optional(Schema.String),
  form_placeholder: Schema.optional(Schema.String),
  ge: Schema.optional(Schema.Number),
  le: Schema.optional(Schema.Number)
})
export type CustomFieldNumberProperties = typeof CustomFieldNumberProperties.Type
