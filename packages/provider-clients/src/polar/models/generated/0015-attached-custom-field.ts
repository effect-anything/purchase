import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AttachedCustomField = Schema.Struct({
  custom_field_id: Schema.String,
  custom_field: Schema.suspend((): typeof Models.CustomField => Models.CustomField),
  order: Schema.Number,
  required: Schema.Boolean,
})
export type AttachedCustomField = typeof AttachedCustomField.Type
