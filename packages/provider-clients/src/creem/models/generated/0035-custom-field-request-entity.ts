import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomFieldRequestEntity = Schema.Struct({
  type: Schema.suspend(
    (): Schema.Schema<Models.CustomFieldRequestType, any, any> =>
      Models.CustomFieldRequestType as Schema.Schema<Models.CustomFieldRequestType, any, any>
  ),
  key: Schema.String,
  label: Schema.String,
  optional: Schema.optional(Schema.Boolean),
  text: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.TextFieldConfig, any, any> =>
        Models.TextFieldConfig as Schema.Schema<Models.TextFieldConfig, any, any>
    )
  ),
  checkbox: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckboxFieldConfig, any, any> =>
        Models.CheckboxFieldConfig as Schema.Schema<Models.CheckboxFieldConfig, any, any>
    )
  )
})
export type CustomFieldRequestEntity = typeof CustomFieldRequestEntity.Type
