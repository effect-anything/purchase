import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomFieldRequestEntity = Schema.Struct({
  type: Schema.suspend((): Schema.Schema<Models.CustomFieldRequestType> => Models.CustomFieldRequestType),
  key: Schema.String,
  label: Schema.String,
  optional: Schema.optional(Schema.Boolean),
  text: Schema.optional(Schema.suspend((): Schema.Schema<Models.TextFieldConfig> => Models.TextFieldConfig)),
  checkbox: Schema.optional(Schema.suspend((): Schema.Schema<Models.CheckboxFieldConfig> => Models.CheckboxFieldConfig))
})
export type CustomFieldRequestEntity = typeof CustomFieldRequestEntity.Type
