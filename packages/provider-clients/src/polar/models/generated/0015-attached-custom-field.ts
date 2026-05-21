import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AttachedCustomField = Schema.Struct({
  custom_field_id: Schema.String,
  custom_field: Schema.suspend(
    (): Schema.Schema<Models.CustomField, any, any> => Models.CustomField as Schema.Schema<Models.CustomField, any, any>
  ),
  order: Schema.Number,
  required: Schema.Boolean
})
export type AttachedCustomField = typeof AttachedCustomField.Type
