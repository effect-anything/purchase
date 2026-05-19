import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomFieldCheckboxProperties = Schema.Struct({
  form_label: Schema.optional(Schema.String),
  form_help_text: Schema.optional(Schema.String),
  form_placeholder: Schema.optional(Schema.String),
})
export type CustomFieldCheckboxProperties = typeof CustomFieldCheckboxProperties.Type
