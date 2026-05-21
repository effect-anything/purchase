import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomField = Schema.Struct({
  type: Schema.suspend((): Schema.Schema<Models.CustomFieldType> => Models.CustomFieldType),
  key: Schema.String,
  label: Schema.String,
  optional: Schema.optional(Schema.NullOr(Schema.Boolean)),
  text: Schema.optional(Schema.suspend((): Schema.Schema<Models.Text> => Models.Text)),
  checkbox: Schema.optional(Schema.suspend((): Schema.Schema<Models.Checkbox> => Models.Checkbox))
})
export type CustomField = typeof CustomField.Type
