import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AttachedCustomFieldCreate = Schema.Struct({
  custom_field_id: Schema.String,
  required: Schema.Boolean,
})
export type AttachedCustomFieldCreate = typeof AttachedCustomFieldCreate.Type
