import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomField = Schema.Struct({
  type: Schema.suspend(
    (): Schema.Schema<Models.CustomFieldType, any, any> =>
      Models.CustomFieldType as Schema.Schema<Models.CustomFieldType, any, any>
  ),
  key: Schema.String,
  label: Schema.String,
  optional: Schema.optional(Schema.NullOr(Schema.Boolean)),
  text: Schema.optional(
    Schema.suspend((): Schema.Schema<Models.Text, any, any> => Models.Text as Schema.Schema<Models.Text, any, any>)
  ),
  checkbox: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.Checkbox, any, any> => Models.Checkbox as Schema.Schema<Models.Checkbox, any, any>
    )
  )
})
export type CustomField = typeof CustomField.Type
