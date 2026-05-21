import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomField = Schema.Union(
  Schema.suspend(
    (): Schema.Schema<Models.CustomFieldText, any, any> =>
      Models.CustomFieldText as Schema.Schema<Models.CustomFieldText, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.CustomFieldNumber, any, any> =>
      Models.CustomFieldNumber as Schema.Schema<Models.CustomFieldNumber, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.CustomFieldDate, any, any> =>
      Models.CustomFieldDate as Schema.Schema<Models.CustomFieldDate, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.CustomFieldCheckbox, any, any> =>
      Models.CustomFieldCheckbox as Schema.Schema<Models.CustomFieldCheckbox, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.CustomFieldSelect, any, any> =>
      Models.CustomFieldSelect as Schema.Schema<Models.CustomFieldSelect, any, any>
  )
)
export type CustomField = typeof CustomField.Type
