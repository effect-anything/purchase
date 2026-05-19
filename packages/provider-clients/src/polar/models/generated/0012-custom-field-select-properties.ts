import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomFieldSelectProperties = Schema.Struct({
  form_label: Schema.optional(Schema.String),
  form_help_text: Schema.optional(Schema.String),
  form_placeholder: Schema.optional(Schema.String),
  options: Schema.Array(Schema.suspend((): typeof Models.CustomFieldSelectOption => Models.CustomFieldSelectOption)),
})
export type CustomFieldSelectProperties = typeof CustomFieldSelectProperties.Type
